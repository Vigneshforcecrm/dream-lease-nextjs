import { useConfiguration } from "@/contexts/ConfigurationContext";
import { decode } from 'he';

export const ModelStep = () => {
  const { configuration } = useConfiguration();
  const { productData } = configuration;

  if (!productData) return null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback image for vehicle
    e.currentTarget.src = "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop";
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        {/* Model Name Before Image */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-slate-900">{productData.name}</h3>
        </div>
        {productData.displayUrl && (
          <div className="aspect-video mb-6 rounded-xl overflow-hidden shadow-lg">
          <img
            src={decode(productData.displayUrl)}
            alt={productData.name}
            onError={handleImageError}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        )}
        
        <div className="text-center space-y-4">
          <p className="text-slate-600">{productData.description}</p>
          <div className="text-3xl font-bold text-slate-900">
          £{configuration.basePrice.toLocaleString()}
          </div>
          
          {/* Display available component groups as features */}
          {productData.productComponentGroups && productData.productComponentGroups.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {productData.productComponentGroups.slice(0, 3).map((group) => (
                <div key={group.id} className="bg-slate-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">
                    Configurable {group.name}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {group.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};