import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfiguration } from "@/contexts/ConfigurationContext";
import { useToast } from "@/hooks/use-toast";
import { Check, FileText, CreditCard, Shield, Star, Loader2, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { decode } from 'he';

export const SummaryStep = () => {
  const { configuration, getColorPrice } = useConfiguration();
  const { productData, selectedAttributes, selectedComponents } = configuration;
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [ordernewId, setOrdernewId] = useState('');
  const [showSuccessOrderModal, setShowSuccessOrderModal] = useState(false);
  const [isPlacingOrdernew, setIsPlacingOrdernew] = useState(false);
  // Financing state
  const [selectedTerm, setSelectedTerm] = useState(36);
  const [downPayment, setDownPayment] = useState(Math.round(configuration.totalPrice * 0.2)); // 20% default
  const [showTermDropdown, setShowTermDropdown] = useState(false);

  const leaseTerms = [
    { months: 24, apr: 3.9 },
    { months: 36, apr: 3.5 },
    { months: 48, apr: 3.7 },
    { months: 60, apr: 4.0 }
  ];

  const selectedTermData = leaseTerms.find(term => term.months === selectedTerm);
  const vehiclePrice = configuration.totalPrice;
  const maxDownPayment = Math.round(vehiclePrice * 0.8); // Max 80% down payment
  const minDownPayment = Math.round(vehiclePrice * 0.1); // Min 10% down payment
  const financedAmount = vehiclePrice - downPayment;
  const monthlyRate = selectedTermData?.apr / 100 / 12;
  const monthlyPayment = Math.round((financedAmount * monthlyRate * Math.pow(1 + monthlyRate, selectedTerm)) / (Math.pow(1 + monthlyRate, selectedTerm) - 1));

  const handleGetQuote = async() => {
    toast({
      title: "Quote Generated!",
      description: "Your personalized quote has been prepared. A specialist will contact you soon.",
    });
    setIsPlacingOrdernew(true);
        
    try {
      console.log("Complete Configuration Object:", configuration);

      const response = await fetch('/api/products/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...configuration,
          financing: {
            leaseTerm: selectedTerm,
            apr: selectedTermData.apr,
            downPayment,
            monthlyPayment
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create Quote');
      }
      const orderIdFromResponse = result.data.quoteId;
      setOrdernewId(orderIdFromResponse);
      setShowSuccessOrderModal(true);

      toast({
        title: "Quote Placed Successfully!",
        description: "Thank you. We'll begin processing your dream car configuration.",
      });

      console.log('Quote placed successfully:', result);

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Quote Failed",
        description: error instanceof Error ? error.message : "Failed to place Quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrdernew(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    
    try {
      console.log("Complete Configuration Object:", configuration);

      const response = await fetch('/api/products/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...configuration,
          financing: {
            leaseTerm: selectedTerm,
            apr: selectedTermData.apr,
            downPayment,
            monthlyPayment
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errors || 'Failed to place order');
      }
      console.log('result', result)
      const orderIdFromResponse = result.data.orderId;
      setOrderId(orderIdFromResponse);
      setShowSuccessModal(true);

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your order. We'll begin processing your dream car configuration.",
      });

      console.log('Order placed successfully:', result);

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Get configuration summary
  const getConfigurationSummary = () => {
    const summary = [];

    // Add attributes
    productData?.attributeCategories?.forEach(category => {
      category.records.forEach(record => {
        const selectedValue = selectedAttributes[record.name];
        if (selectedValue) {
          const selectedOption = record.attributePickList?.values?.find(
            value => value.code === selectedValue
          );
          if (selectedOption) {
            summary.push({
              category: record.label || record.name,
              item: selectedOption.displayValue,
              price: getColorPrice(selectedOption.displayValue) || 0,
              isIncluded: selectedValue === record.defaultValue
            });
          }
        }
      });
    });

    // Add components
    productData?.productComponentGroups?.forEach(group => {
      const selectedComponentId = selectedComponents[group.id];
      if (selectedComponentId) {
        const component = group.components.find(c => c.id === selectedComponentId);
        if (component) {
          const price = component.prices.find(p => p.isDefault)?.price || 0;
          const isIncluded = component.productRelatedComponent?.doesBundlePriceIncludeChild || price === 0;
          
          summary.push({
            category: group.name,
            item: component.name,
            price,
            isIncluded
          });
        }
      }
    });

    return summary;
  };

  const configSummary = getConfigurationSummary();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">Configuration Summary</h2>
        <p className="text-lg md:text-xl text-slate-600">Review your perfect configuration and complete your order</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Configuration Details - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Configuration Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100 pb-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                Your Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8 space-y-5">
              {/* Base Model */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="font-semibold text-slate-800 text-sm md:text-base">Base Model - {productData?.name}</span>
                </div>
                <span className="text-lg font-bold text-slate-900">£{configuration.basePrice.toLocaleString()}</span>
              </div>
              
              {/* Configuration Items */}
              {configSummary.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-700 font-medium text-sm md:text-base">{decode(item.category)}: {decode(item.item)}</span>
                  </div>
                  <span className="font-semibold text-sm md:text-base">
                    {item.isIncluded 
                      ? <span className="text-slate-600">Included</span>
                      : item.price > 0 
                        ? <span className="text-slate-900">+ £{item.price.toLocaleString()}</span>
                        : <span className="text-slate-600">Selected</span>
                    }
                  </span>
                </div>
              ))}
              
              {/* Total */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <div className="flex justify-between items-center p-4 md:p-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <span className="text-lg md:text-xl font-semibold">Total Price</span>
                  <span className="text-2xl md:text-3xl font-bold">£{configuration.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Features Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100 pb-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                Selected Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <div className="space-y-4">
                {productData?.productComponentGroups?.map(group => {
                  const selectedComponentId = selectedComponents[group.id];
                  const component = group.components.find(c => c.id === selectedComponentId);
                  
                  if (!component) return null;
                  
                  return (
                    <div key={group.id} className="border-l-4 border-blue-500 pl-4 md:pl-6 py-3 rounded-r-lg bg-gradient-to-r from-blue-50/50 to-transparent">
                      <div className="font-bold text-slate-900 text-base md:text-lg">{decode(group.name)}</div>
                      <div className="text-slate-700 font-medium text-sm md:text-base">{decode(component.name)}</div>
                      {component.description && (
                        <div className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">{decode(component.description)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financing & Actions - 1 column */}
        <div className="space-y-6">
          
          {/* Enhanced Financing Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 pb-6">
              <CardTitle className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                Financing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              
              {/* Lease Term Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Lease Term</label>
                <div className="relative">
                  <button
                    onClick={() => setShowTermDropdown(!showTermDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors duration-200"
                  >
                    <span className="font-medium text-slate-900">
                      {selectedTerm} Months ({selectedTermData.apr}% APR)
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showTermDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showTermDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
                      {leaseTerms.map((term) => (
                        <button
                          key={term.months}
                          onClick={() => {
                            setSelectedTerm(term.months);
                            setShowTermDropdown(false);
                          }}
                          className={`w-full text-left p-3 hover:bg-slate-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                            selectedTerm === term.months ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{term.months} Months ({term.apr}% APR)</span>
                            {selectedTerm === term.months && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Down Payment Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Down Payment</label>
                  <span className="text-sm font-bold text-slate-900">£{downPayment.toLocaleString()}</span>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="range"
                    min={minDownPayment}
                    max={maxDownPayment}
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #059669 0%, #059669 ${((downPayment - minDownPayment) / (maxDownPayment - minDownPayment)) * 100}%, #e2e8f0 ${((downPayment - minDownPayment) / (maxDownPayment - minDownPayment)) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>£{minDownPayment.toLocaleString()}</span>
                    <span>£{maxDownPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Price Display */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-100">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vehicle Price:</span>
                    <span className="font-semibold text-slate-900">£{vehiclePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Down Payment:</span>
                    <span className="font-semibold text-slate-900">£{downPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-600">Term:</span>
                    <span className="font-semibold text-slate-900">{selectedTerm} months</span>
                  </div>
                </div>
              </div>

              {/* Monthly Payment Display */}
              <div className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-1">{selectedTerm} Month Lease</div>
                  <div className="text-xs text-slate-500">{selectedTermData.apr}% APR</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  £{monthlyPayment.toLocaleString()}/mo
                </div>
                <div className="text-sm text-slate-500">Monthly payment</div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 md:py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 text-sm md:text-base"
              onClick={handleGetQuote}
              disabled={isPlacingOrdernew}
            >
              {isPlacingOrdernew ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                  Generating Quote...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Get Personalized Quote
                </>
              )}
            </Button>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 md:py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm md:text-base"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Place Order Now
                </>
              )}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              <div>
                <div className="font-semibold text-slate-900 text-xs md:text-sm">Secure Checkout</div>
                <div className="text-xs text-slate-600">SSL encrypted & protected</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              <div>
                <div className="font-semibold text-slate-900 text-xs md:text-sm">Premium Service</div>
                <div className="text-xs text-slate-600">White-glove delivery included</div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500 leading-relaxed">
              * Final pricing may vary based on location and available incentives. 
              Contact your dealer for the most accurate pricing information.
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {(showSuccessModal || showSuccessOrderModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => showSuccessModal? setShowSuccessModal(false) : setShowSuccessOrderModal(false) }
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="px-6 md:px-8 pb-6 md:pb-8 text-center">
              {/* Success Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 blur-xl"></div>
              </div>
              
              {/* Success Message */}
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                {showSuccessModal ? 'Order' : 'Quote'} Created Successfully!
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base">
                Thank you. We'll begin processing your dream car configuration.
              </p>
              
              {/* Order ID */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 mb-6 border border-slate-100">
                <div className="text-sm text-slate-500 mb-1">{showSuccessModal ? 'Order ID' : 'Quote ID'}</div>
                <div className="text-base md:text-lg font-bold text-slate-900 font-mono">
                  {showSuccessModal ? orderId : ordernewId }
                </div>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={() => showSuccessModal ? setShowSuccessModal(false) : setShowSuccessOrderModal(false) }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};