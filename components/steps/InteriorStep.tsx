import { useConfiguration } from "@/contexts/ConfigurationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ImageIcon } from "lucide-react";

export const InteriorStep = () => {
  const { configuration, updateComponent } = useConfiguration();
  const { productData, selectedComponents } = configuration;

  // Find interior component group
  const interiorGroup = productData?.productComponentGroups?.find(
    group => group.name === 'Interior'
  );

  if (!interiorGroup?.components) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Interior Options</h2>
        <p className="text-lg text-slate-600">No interior options available for this product.</p>
      </div>
    );
  }

  const selectedInteriorId = selectedComponents[interiorGroup.id];

  const handleInteriorSelect = (componentId: string) => {
    updateComponent(interiorGroup.id, componentId);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback image for interior
    e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop";
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Choose Your Interior</h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          {interiorGroup.description || 'Experience comfort meets luxury in every detail'}
        </p>
      </div>

      {/* Interior Options Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {interiorGroup.components.map((interior) => {
          const isSelected = selectedInteriorId === interior.id;
          const price = interior.prices.find(p => p.isDefault)?.price || 0;
          const isIncluded = interior.productRelatedComponent?.doesBundlePriceIncludeChild || price === 0;
          
          return (
            <Card
              key={interior.id}
              className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              }`}
              onClick={() => handleInteriorSelect(interior.id)}
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
                
                {/* Interior Image */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={interior.displayUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop"}
                    alt={interior.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Image overlay for premium feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Selection overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500/10"></div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Interior Name */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                    {interior.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {interior.description || 'Premium interior craftsmanship'}
                  </p>
                  
                  {/* Pricing */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-lg font-bold">
                      {isIncluded ? (
                        <span className="text-slate-700">Included</span>
                      ) : (
                        <span className="text-slate-900">+${price.toLocaleString()}</span>
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