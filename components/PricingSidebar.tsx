"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useConfiguration } from "@/contexts/ConfigurationContext";

export const PricingSidebar = () => {
  const { configuration, getColorPrice } = useConfiguration();
  const { productData, selectedAttributes, selectedComponents } = configuration;

  const monthlyPayment = Math.round(configuration.totalPrice / 36);

  // Get selected component details
  const getSelectedComponentDetails = () => {
    if (!productData?.productComponentGroups) return [];
    
    const details: Array<{
      name: string;
      price: number;
      isIncluded: boolean;
    }> = [];

    productData.productComponentGroups.forEach(group => {
      const selectedComponentId = selectedComponents[group.id];
      if (selectedComponentId) {
        const component = group.components.find(c => c.id === selectedComponentId);
        if (component) {
          const price = component.prices.find(p => p.isDefault)?.price || 0;
          const isIncluded = component.productRelatedComponent?.doesBundlePriceIncludeChild || price === 0;
          
          details.push({
            name: `${group.name}: ${component.name}`,
            price,
            isIncluded
          });
        }
      }
    });

    return details;
  };

  // Get selected attribute details
  const getSelectedAttributeDetails = () => {
    if (!productData?.attributeCategories) return [];
    
    const details: Array<{
      name: string;
      value: string;
      price: number;
      isDefault: boolean;
    }> = [];

    productData.attributeCategories.forEach(category => {
      category.records.forEach(record => {
        const selectedValue = selectedAttributes[record.name];
        if (selectedValue) {
          const isDefault = selectedValue === record.defaultValue;
          let price = 0;
          let displayValue = selectedValue;
          // Special handling for color pricing
          if (record.name === 'Colour' && record.attributePickList?.values) {
            const selectedColorOption = record.attributePickList.values.find(
              color => color.code === selectedValue
            );
            if (selectedColorOption) {
              price = getColorPrice(selectedColorOption.displayValue);
              displayValue = selectedColorOption.displayValue;
            }
          }
          details.push({
            name: record.label || record.name,
            value: displayValue,
            price,
            isDefault
          });
        }
      });
    });
    console.log('details:' , JSON.stringify(details));
    return details;
  };

  const componentDetails = getSelectedComponentDetails();
  const attributeDetails = getSelectedAttributeDetails();

  return (
    <div className="w-full lg:w-80 space-y-6">
      {/* Main Configuration Card */}
      <Card className="sticky top-24 shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-slate-50/50 to-white rounded-2xl overflow-hidden group">
        {/* Subtle hover background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 via-slate-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Floating accent elements */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-slate-100/40 to-slate-200/30 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
        
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
            Configuration Summary
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-5 relative z-10">
          {/* Base Model */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/50">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
              <span className="font-medium text-slate-700">Base Model</span>
            </div>
            <span className="text-lg font-bold text-slate-900">£{configuration.basePrice.toLocaleString()}</span>
          </div>
          
          {/* Selected Attributes */}
          {attributeDetails.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 pb-2">
                Attributes
              </h4>
              {attributeDetails.map((attr, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                  <span className="text-sm text-slate-600 font-medium">{attr.name}</span>
                  {/* <div className="flex items-center">
                    {attr.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mr-2">
                        Default
                      </span>
                    )}
                    <span className="text-sm text-slate-700 font-medium">
                      {attr.isDefault ? 'Included' : attr.value}
                    </span>
                  </div> */}
                  <div className="flex items-center">
                  {attr.price === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                      ✓ Included
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-900 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-full border border-blue-200">
                      + £{attr.price.toLocaleString()}
                    </span>
                  )}
                </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Selected Components */}
          {componentDetails.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 pb-2">
                Components & Options
              </h4>
              {componentDetails.map((comp, index) => (
                <div key={index} className="flex justify-between items-center py-3 px-4 rounded-lg bg-gradient-to-r from-slate-50/50 to-transparent border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200">
                  <span className="text-sm text-slate-600 font-medium flex-1 mr-4">{comp.name}</span>
                  <div className="flex items-center">
                    {comp.isIncluded ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                        ✓ Included
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-slate-900 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 rounded-full border border-blue-200">
                        + £{comp.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Enhanced Separator */}
          <div className="relative py-4">
            <Separator className="bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/30 to-transparent h-px top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          {/* Total Price - Enhanced */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white relative overflow-hidden group-hover:from-slate-700 group-hover:via-slate-600 group-hover:to-slate-800 transition-all duration-500">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:from-white/10 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-200">Total Price</span>
                <span className="text-3xl font-bold text-white">£{configuration.totalPrice.toLocaleString()}</span>
              </div>
              
              {/* Monthly Payment Section */}
              <div className="border-t border-white/20 pt-4">
                <div className="text-center">
                  <div className="text-sm text-slate-300 mb-1">Estimated Monthly Payment</div>
                  <div className="text-2xl font-bold text-white mb-1">
                  £{monthlyPayment}
                    <span className="text-base font-normal text-slate-300">/mo</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                    <span className="text-xs text-slate-300">36 months @ 3.5% APR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Card border glow effect - subtle slate */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-300/20 via-slate-400/20 to-slate-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
      </Card>
    </div>
  );
};