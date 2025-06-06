import { useConfiguration } from "@/contexts/ConfigurationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Settings } from "lucide-react";
import { decode } from 'he';

export const WheelsStep = () => {
  const { configuration, updateComponent } = useConfiguration();
  const { productData, selectedComponents } = configuration;

  // Utility function to decode HTML entities
  const decodeHtmlEntities = (text: string): string => {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    }
    // Fallback for server-side rendering
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  };

  // Find wheels component group
  const wheelsGroup = productData?.productComponentGroups?.find(
    group => group.name === 'Wheels'
  );

  if (!wheelsGroup?.components) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Settings className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Wheel Options</h2>
        <p className="text-lg text-slate-600">No wheel options available for this product.</p>
      </div>
    );
  }

  const selectedWheelId = selectedComponents[wheelsGroup.id];

  const handleWheelSelect = (componentId: string) => {
    updateComponent(wheelsGroup.id, componentId);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback image for wheels
    e.currentTarget.src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop";
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Select Your Wheels</h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          {decodeHtmlEntities(wheelsGroup.description || 'Choose the perfect wheels to complete your vehicle\'s look and performance')}
        </p>
      </div>

      {/* Wheels Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wheelsGroup.components.map((wheel) => {
          const isSelected = selectedWheelId === wheel.id;
          const price = wheel.prices.find(p => p.isDefault)?.price || 0;
          const isIncluded = wheel.productRelatedComponent?.doesBundlePriceIncludeChild;
          
          return (
            <Card
              key={wheel.id}
              className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              }`}
              onClick={() => handleWheelSelect(wheel.id)}
            >
              <CardContent className="p-0 relative">
                {/* Included Badge */}
                {isIncluded && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 border-2 border-white">
                    Included
                  </Badge>
                )}
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                
                {/* Wheel Image */}
                {wheel.displayUrl && (
                <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-slate-50 to-gray-100">
                  <img
                    src={decode(wheel.displayUrl)}
                    alt={wheel.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Image overlay for premium feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Selection overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500/10"></div>
                  )}
                </div>
                )}
                
                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Wheel Name */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                    {decodeHtmlEntities(wheel.name)}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {decodeHtmlEntities(wheel.description || 'Premium wheel design with superior performance')}
                  </p>
                  
                  {/* Pricing and Selection */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-lg font-bold">
                      {isIncluded ? (
                        <span className="text-slate-700">Included</span>
                      ) : (
                        <span className="text-slate-900">+ £{price.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {/* Select Button */}
                    <div className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      isSelected 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}>
                      {isSelected ? 'Selected' : 'Select'}
                    </div>
                  </div>
                </div>
                
                {/* Selection glow effect */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-50 blur-xl -z-10"></div>
                )}
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};