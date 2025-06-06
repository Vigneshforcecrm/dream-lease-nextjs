import { useConfiguration } from "@/contexts/ConfigurationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Declare Threekit types
declare global {
  interface Window {
    threekitPlayer: any;
    player: any;
  }
}

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
  const playerRef = useRef<HTMLDivElement>(null);
  const [threekitPlayer, setThreekitPlayer] = useState<any>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);

  // Initialize Threekit Player
  useEffect(() => {
    const initializeThreekit = async () => {
      if (!playerRef.current || threekitPlayer) return;

      try {
        // Load Threekit script if not already loaded
        if (!window.threekitPlayer) {
          const script = document.createElement('script');
          script.src = 'https://preview.threekit.com/app/js/threekit-player.js';
          script.async = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            // Add timeout to prevent hanging
            setTimeout(reject, 10000);
          });
        }

        // Add a small delay to ensure script is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize player with additional CORS-friendly options
        const player = await window.threekitPlayer({
          authToken: "3af4efa4-661d-41e9-a735-af5ec75d2646",
          el: playerRef.current,
          assetId: "8da8ac75-ba4e-4d06-aa3a-7d2aa1b85191",
          initialConfiguration: {
            // Set initial color if selected
            ...(selectedAttributes['Colour'] && {
              "Colour": selectedAttributes['Colour']
            })
          },
          publishStage: "published",
          showConfigurator: false, // Hide default configurator since we have our own UI
          showAR: true,
          // Additional options that might help with CORS
          cache: false,
          // Use domain instead of preview subdomain if available
          domain: "https://threekit.com", // Try main domain
          // Alternative: use your own domain if you have CORS configured
          // domain: "https://your-domain.com"
        });

        setThreekitPlayer(player);
        window.player = player;
        setIsPlayerLoading(false);
      } catch (error) {
        console.error('Failed to initialize Threekit player:', error);
        setIsPlayerLoading(false);
        
        // Show user-friendly error message
        if (playerRef.current) {
          playerRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full bg-slate-100 text-center p-8">
              <div class="text-slate-400 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-700 mb-2">3D Viewer Unavailable</h3>
              <p class="text-slate-500 text-sm max-w-md">
                The 3D preview is temporarily unavailable. Please continue with your color selection below.
              </p>
            </div>
          `;
        }
      }
    };

    // Add a small delay before initializing to ensure DOM is ready
    const timer = setTimeout(initializeThreekit, 100);
    return () => clearTimeout(timer);
  }, []); // Remove selectedAttributes dependency to prevent re-initialization

  // Update Threekit when color changes
  useEffect(() => {
    const updateThreekitColor = async () => {
      if (!threekitPlayer || !selectedAttributes['Colour']) return;

      try {
        // Get the configurator from the player
        const configurator = await threekitPlayer.getConfigurator();
        
        // Update the color configuration
        await configurator.setConfiguration({
          Colour: selectedAttributes['Colour']
        });
      } catch (error) {
        console.error('Failed to update Threekit color:', error);
        // Optionally show a toast notification to user about the update failure
      }
    };

    updateThreekitColor();
  }, [selectedAttributes['Colour'], threekitPlayer]);

  // Alternative: Iframe-based approach for CORS issues
  const renderThreekitIframe = () => {
    const baseUrl = "https://preview.threekit.com/app";
    const params = new URLSearchParams({
      assetId: "8da8ac75-ba4e-4d06-aa3a-7d2aa1b85191",
      authToken: "3af4efa4-661d-41e9-a735-af5ec75d2646",
      publishStage: "published",
      showConfigurator: "false",
      showAR: "true",
      ...(selectedAttributes['Colour'] && {
        'config[Colour]': selectedAttributes['Colour']
      })
    });

    return (
      <iframe
        src={`${baseUrl}?${params.toString()}`}
        className="w-full h-full border-0"
        allow="camera; xr-spatial-tracking"
        title="3D Product Viewer"
        onError={() => {
          console.log("Iframe failed to load, showing fallback");
        }}
      />
    );
  };

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

      {/* 3D Viewer Section - Top */}
      <div className="mb-8">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 to-gray-100">
          <CardContent className="p-0 relative">
            {/* Loading State */}
            {isPlayerLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-600 font-medium">Loading 3D Preview...</p>
                </div>
              </div>
            )}
            
            {/* Primary Threekit Player Container */}
            <div 
              ref={playerRef}
              className="w-full aspect-video min-h-[500px] bg-slate-100 rounded-lg"
              style={{ minHeight: '500px' }}
            />
            
            {/* Fallback: Show iframe if main player fails */}
            {!isPlayerLoading && !threekitPlayer && (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                {renderThreekitIframe()}
              </div>
            )}
            
            {/* 3D Viewer Label */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-white/90 text-slate-700 shadow-lg border-0 backdrop-blur-sm">
                360° Preview
              </Badge>
            </div>

            {/* Retry Button for failed loads */}
            {!isPlayerLoading && !threekitPlayer && (
              <div className="absolute bottom-4 right-4 z-20">
                <button
                  onClick={() => {
                    setIsPlayerLoading(true);
                    setThreekitPlayer(null);
                    // Trigger re-initialization
                    setTimeout(() => {
                      const timer = setTimeout(() => {
                        const initEvent = new Event('threekitRetry');
                        window.dispatchEvent(initEvent);
                      }, 100);
                      return () => clearTimeout(timer);
                    }, 100);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 text-sm font-medium"
                >
                  Retry 3D Load
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Color Selection Section - Bottom */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Available Colors</h3>
          <p className="text-slate-600">Click on any color to see it applied to your model above</p>
        </div>
        
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
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-xl z-10 border-2 border-white">
                        Default
                      </Badge>
                    )}
                    
                    {/* Color Swatch */}
                    <div className="relative mb-3">
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
                          <span className="text-xs text-slate-500 font-medium">
                            {isIncluded ? 'Included' : 'Available'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
    </div>
  );
};