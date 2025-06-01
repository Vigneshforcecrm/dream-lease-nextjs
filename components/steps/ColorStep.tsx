import { useConfiguration } from "@/contexts/ConfigurationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

// Comprehensive color mapping for automotive colors
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    // White Variants
    'Pearl White': '#F8F9FA',
    'Pure White': '#FFFFFF',
    'Solid White': '#F5F5F5',
    'Arctic White': '#F0F8FF',
    'Glacier White': '#E8F4F8',
    'Alpine White': '#FAFAFA',
    'Crystal White': '#F7F7F7',
    
    // Black Variants
    'Solid Black': '#1A1A1A',
    'Jet Black': '#000000',
    'Obsidian Black': '#0B0B0B',
    'Carbon Black': '#1C1C1C',
    'Midnight Black': '#191970',
    'Deep Black': '#0A0A0A',
    'Piano Black': '#1F1F1F',
    
    // Silver/Gray Variants
    'Silver Metallic': '#C0C0C0',
    'Platinum Silver': '#E5E4E2',
    'Space Gray': '#8E8E93',
    'Titanium Silver': '#DCDCDC',
    'Storm Gray': '#778899',
    'Graphite Gray': '#41424C',
    'Lunar Silver': '#B8B8B8',
    'Stealth Gray': '#6C7B7F',
    
    // Blue Variants
    'Deep Blue': '#1E3A8A',
    'Ocean Blue': '#006994',
    'Navy Blue': '#000080',
    'Steel Blue': '#4682B4',
    'Royal Blue': '#4169E1',
    'Midnight Blue': '#191970',
    'Azure Blue': '#007FFF',
    'Electric Blue': '#7DF9FF',
    'Sapphire Blue': '#0F52BA',
    'Cosmic Blue': '#2E37FE',
    
    // Red Variants
    'Red Multi-Coat': '#DC2626',
    'Cherry Red': '#DE3163',
    'Cardinal Red': '#C41E3A',
    'Crimson Red': '#DC143C',
    'Ruby Red': '#E0115F',
    'Fire Red': '#FF2D00',
    'Burgundy': '#800020',
    'Candy Red': '#FF0800',
    
    // Green Variants
    'Forest Green': '#228B22',
    'Emerald Green': '#50C878',
    'Racing Green': '#004225',
    'Lime Green': '#32CD32',
    'Sage Green': '#9CAF88',
    'Hunter Green': '#355E3B',
    
    // Brown/Bronze Variants
    'Bronze': '#CD7F32',
    'Copper': '#B87333',
    'Champagne': '#F7E7CE',
    'Mocha': '#967117',
    'Espresso': '#6F4E37',
    'Cognac': '#9A463D',
    
    // Yellow/Gold Variants
    'Golden Yellow': '#FFD700',
    'Solar Yellow': '#FFFF66',
    'Canary Yellow': '#FFEF00',
    'Amber': '#FFBF00',
    'Sunset Orange': '#FF8C69',
    
    // Purple Variants
    'Deep Purple': '#483D8B',
    'Royal Purple': '#7851A9',
    'Plum': '#DDA0DD',
    'Violet': '#8A2BE2',
    
    // Default fallback
    'Default': '#94A3B8',
  };
  
  // Try exact match first
  if (colorMap[colorName]) {
    return colorMap[colorName];
  }
  
  // Try partial matching for variations
  const normalizedName = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return value;
    }
  }
  
  return colorMap['Default'];
};
// Helper function to get color price
const getColorPrice = (colorName: string): number => {
  const whiteVariants = [
    'pearl white', 'pure white', 'solid white', 'arctic white', 
    'glacier white', 'alpine white', 'crystal white', 'white'
  ];
  
  const normalizedName = colorName.toLowerCase();
  const isWhiteVariant = whiteVariants.some(variant => 
    normalizedName.includes(variant) || variant.includes(normalizedName)
  );
  
  return isWhiteVariant ? 0 : 1000;
};

// Helper function to determine if color is light or dark for contrast
const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

export const ColorStep = () => {
  const { configuration, updateAttribute } = useConfiguration();
  const { productData, selectedAttributes } = configuration;

  // Find color attributes
  const colorAttributes = productData?.attributeCategories
    ?.flatMap(cat => cat.records || [])
    ?.find(record => record.name === 'Colour');

  if (!colorAttributes?.attributePickList?.values) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 bg-slate-400 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Color Options</h2>
        <p className="text-slate-600">No color options available for this product.</p>
      </div>
    );
  }

  const colors = colorAttributes.attributePickList.values;
  const selectedColor = selectedAttributes['Colour'];

  const handleColorSelect = (colorCode: string) => {
    updateAttribute('Colour', colorCode);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Choose Your Color</h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Select the perfect color that expresses your unique style and personality
        </p>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {colors.map((color) => {
          const isDefault = color.code === colorAttributes.defaultValue;
          const isSelected = selectedColor === color.code;
          const colorHex = getColorHex(color.displayValue);
          const isLight = isLightColor(colorHex);
          const colorPrice = getColorPrice(color.displayValue);
          const isIncluded = colorPrice === 0;
          
          return (
            <Card
              key={color.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm overflow-hidden ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-2xl scale-105' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleColorSelect(color.code)}
            >
              <CardContent className="p-6 relative">
                {/* Default Badge */}
                {isDefault && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl z-10 border-2 border-white">
                    Default
                  </Badge>
                )}
                
                {/* Color Swatch */}
                <div className="relative mb-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white group-hover:scale-105 transition-transform duration-300">
                    <div
                      className="w-full h-full relative"
                      style={{ backgroundColor: colorHex }}
                    >
                      {/* Metallic/Pearl Effect Overlay */}
                      {(color.displayValue.toLowerCase().includes('metallic') || 
                        color.displayValue.toLowerCase().includes('pearl')) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      )}
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                            isLight ? 'bg-slate-900' : 'bg-white'
                          }`}>
                            <Check className={`w-6 h-6 ${isLight ? 'text-white' : 'text-slate-900'}`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection Ring */}
                  {isSelected && (
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur-sm -z-10"></div>
                  )}
                </div>
                
                {/* Color Info */}
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-slate-800 transition-colors duration-300">
                    {color.displayValue}
                  </h3>
                  {/* Price and Status */}
                  <div className="space-y-1">
                    <div className="text-sm font-bold">
                      {isIncluded ? (
                        <span className="text-slate-700">Included</span>
                      ) : (
                        <span className="text-slate-900">+ £{colorPrice.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      {/* <div 
                        className="w-3 h-3 rounded-full border border-slate-200 shadow-sm"
                        style={{ backgroundColor: colorHex }}
                      ></div> */}
                      <span className="text-xs text-slate-500 font-medium">
                        {isIncluded ? 'Included' : 'Available'}
                      </span>
                    </div>
                  </div>
                  {/* <div className="flex items-center justify-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-slate-200 shadow-sm"
                      style={{ backgroundColor: colorHex }}
                    ></div>
                    <span className="text-xs text-slate-500 font-medium">
                      {isDefault ? 'Included' : 'Available'}
                    </span>
                  </div> */}
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};