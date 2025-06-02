import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfiguration } from "@/contexts/ConfigurationContext";
import { useToast } from "@/hooks/use-toast";
import { Check, FileText, CreditCard, Shield, Star,Loader2,X } from "lucide-react";
import { useState } from "react";
import {decode} from 'he'

export const SummaryStep = () => {
  const { configuration,getColorPrice } = useConfiguration();
  const { productData, selectedAttributes, selectedComponents } = configuration;
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const handleGetQuote = () => {
    toast({
      title: "Quote Generated!",
      description: "Your personalized quote has been prepared. A specialist will contact you soon.",
    });
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
        body: JSON.stringify(configuration),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }
      const orderIdFromResponse = result.data.quoteId;
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

  const monthlyPayment = Math.round(configuration.totalPrice / 36);

  // Get configuration summary
  const getConfigurationSummary = () => {
    const summary: Array<{
      category: string;
      item: string;
      price: number;
      isIncluded: boolean;
    }> = [];

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
              price: getColorPrice(selectedOption.displayValue) || 0, // Attributes typically don't have separate pricing in this structure
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
        <h2 className="text-4xl font-bold text-slate-900 mb-3">Configuration Summary</h2>
        <p className="text-xl text-slate-600">Review your perfect configuration and complete your order</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Details - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Configuration Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100 pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Your Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              {/* Base Model */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="font-semibold text-slate-800">Base Model - {productData?.name}</span>
                </div>
                <span className="text-lg font-bold text-slate-900">£{configuration.basePrice.toLocaleString()}</span>
              </div>
              
              {/* Configuration Items */}
              {configSummary.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{decode(item.category)}: {decode(item.item)}</span>
                  </div>
                  <span className="font-semibold">
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
                <div className="flex justify-between items-center p-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <span className="text-xl font-semibold">Total Price</span>
                  <span className="text-3xl font-bold">£{configuration.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Features Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100 pb-6">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                Selected Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {productData?.productComponentGroups?.map(group => {
                  const selectedComponentId = selectedComponents[group.id];
                  const component = group.components.find(c => c.id === selectedComponentId);
                  
                  if (!component) return null;
                  
                  return (
                    <div key={group.id} className="border-l-4 border-blue-500 pl-6 py-3 rounded-r-lg bg-gradient-to-r from-blue-50/50 to-transparent">
                      <div className="font-bold text-slate-900 text-lg">{decode(group.name)}</div>
                      <div className="text-slate-700 font-medium">{decode(component.name)}</div>
                      {component.description && (
                        <div className="text-sm text-slate-600 mt-2 leading-relaxed">{decode(component.description)}</div>
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
          
          {/* Financing Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 pb-6">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                Financing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-1">36 Month Lease</div>
                  <div className="text-xs text-slate-500">3.5% APR</div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                £{monthlyPayment}/mo
                </div>
                <div className="text-sm text-slate-500">Estimated payment</div>
              </div>
            </CardContent>
          </Card>

                    {/* Action Buttons */}
                    <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
              onClick={handleGetQuote}
            >
              <FileText className="w-5 h-5 mr-2" />
              Get Personalized Quote
            </Button>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Place Order Now
                </>
              )}
            </Button>
          </div>


          {/* Trust Indicators */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-slate-900 text-sm">Secure Checkout</div>
                <div className="text-xs text-slate-600">SSL encrypted & protected</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-semibold text-slate-900 text-sm">Premium Service</div>
                <div className="text-xs text-slate-600">White-glove delivery included</div>
              </div>
            </div>
          </div>
  {/* Disclaimer */}
  <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500 leading-relaxed">
              * Final pricing may vary based on location and available incentives. 
              Contact your dealer for the most accurate pricing information.
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="px-8 pb-8 text-center">
              {/* Success Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 blur-xl"></div>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Order Placed Successfully!
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Thank you for your order. We'll begin processing your dream car configuration.
              </p>
              
              {/* Order ID */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 mb-6 border border-slate-100">
                <div className="text-sm text-slate-500 mb-1">Order ID</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {orderId}
                </div>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};