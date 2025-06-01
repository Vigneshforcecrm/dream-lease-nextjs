import { useConfiguration } from "@/contexts/ConfigurationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, Package } from "lucide-react";

export const PackagesStep = () => {
  const { configuration, updateComponent } = useConfiguration();
  const { productData, selectedComponents } = configuration;

  // Find package component group
  const packageGroup = productData?.productComponentGroups?.find(
    group => group.name === 'Package'
  );

  if (!packageGroup?.components) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Package Options</h2>
        <p className="text-lg text-slate-600">No package options available for this product.</p>
      </div>
    );
  }

  const selectedPackageId = selectedComponents[packageGroup.id];

  const handlePackageSelect = (componentId: string) => {
    // For packages, we might want to allow only one selection based on maxBundleComponents
    if (packageGroup.maxBundleComponents === 1) {
      // Single selection
      updateComponent(packageGroup.id, componentId);
    } else {
      // Multiple selections would require different logic
      updateComponent(packageGroup.id, componentId);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback image for packages
    e.currentTarget.src = "https://images.unsplash.com/photo-1549399735-cae2452eba7a?w=800&h=600&fit=crop";
  };

  // Parse features from description
  const parseFeatures = (description: string): string[] => {
    // Split by common delimiters and clean up
    return description
      .split(/[,;.]/)
      .map(feature => feature.trim())
      .filter(feature => feature.length > 0)
      .slice(0, 4); // Limit to 4 features for display
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Select Your Package</h2>
        <p className="text-lg text-slate-600 leading-relaxed">{packageGroup.description}</p>
        {packageGroup.maxBundleComponents === 1 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mt-4">
            <Check className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Choose one package option</span>
          </div>
        )}
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packageGroup.components.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          const price = pkg.prices.find(p => p.isDefault)?.price || 0;
          const isIncluded = pkg.productRelatedComponent?.doesBundlePriceIncludeChild || price === 0;
          const features = parseFeatures(pkg.description || '');
          
          return (
            <Card
              key={pkg.id}
              className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              }`}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              <CardContent className="p-0 relative">
                {/* Included Badge */}
                {isIncluded && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 border-2 border-white">
                    Included
                  </Badge>
                )}
                
                {/* Selection Indicator */}
                <div className="absolute top-4 left-4 z-10">
                  {packageGroup.maxBundleComponents === 1 ? (
                    // Radio button behavior for single selection
                    <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500 scale-110' 
                        : 'bg-white/90 border-slate-300 backdrop-blur-sm'
                    }`}>
                      {isSelected && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  ) : (
                    // Checkbox for multiple selection
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handlePackageSelect(pkg.id)}
                        className="w-6 h-6"
                      />
                    </div>
                  )}
                </div>
                
                {/* Package Image */}
                {pkg.displayUrl && (
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={pkg.displayUrl}
                      alt={pkg.name}
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
                )}
                
                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Package Name and Price */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                      {pkg.name}
                    </h3>
                    
                    <div className="text-2xl font-bold">
                      {isIncluded ? (
                        <span className="text-slate-700">Included</span>
                      ) : (
                        <span className="text-slate-900">+ £{price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  {features.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                        Package Features
                      </h4>
                      <ul className="space-y-2">
                        {features.map((feature, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-start leading-relaxed">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="group-hover:text-slate-700 transition-colors duration-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Selection Status */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className={`px-4 py-2 rounded-xl font-semibold text-sm text-center transition-all duration-300 ${
                      isSelected 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}>
                      {isSelected ? 'Selected' : 'Select Package'}
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