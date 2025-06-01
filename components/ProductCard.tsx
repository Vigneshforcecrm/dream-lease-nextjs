"use client";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  monthlyPrice: number;
  image: string;
  type: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  
  const handleConfigure = () => {
    router.push(`/product/${product.id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback image if the product image fails to load
    e.currentTarget.src = "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop";
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 rounded-2xl">
      {/* Premium overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-all duration-700 z-10"></div>
      
      {/* Floating elements for premium feel */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
      
      <CardContent className="p-0 relative z-20">
        {/* Enhanced Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <img
            src={product.image}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            loading="lazy"
          />
          
          {/* Image overlay for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Premium badge */}
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200">
            <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text uppercase tracking-wide">
              Premium
            </span>
          </div>
          
          {/* Price badge - floating */}
          <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-300">
            ${product.price.toLocaleString()}
          </div>
        </div>
        
        {/* Enhanced Content Section */}
        <div className="p-8 bg-gradient-to-br from-white to-slate-50/50">
          {/* Header with better spacing */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight group-hover:text-slate-900 transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-slate-600 font-light leading-relaxed text-base group-hover:text-slate-700 transition-colors duration-300">
                  {product.description}
                </p>
              </div>
            </div>
            
            {/* Premium divider */}
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-200"></div>
          </div>
          
          {/* Enhanced Footer */}
          <div className="flex items-center justify-between">
            {/* Monthly pricing with better styling */}
            <div className="flex flex-col">
              {product.monthlyPrice > 0 ? (
                <>
                  <span className="text-sm font-medium text-slate-500 mb-1">Starting from</span>
                  <span className="text-xl font-bold text-slate-800">
                    ${product.monthlyPrice.toLocaleString()}
                    <span className="text-sm font-normal text-slate-500 ml-1">/month</span>
                  </span>
                </>
              ) : (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-slate-600 font-medium">Pricing on request</span>
                </div>
              )}
            </div>
            
            {/* Enhanced Configure Button */}
            <div className="relative">
              <Button 
                onClick={handleConfigure}
                className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0 overflow-hidden group/btn"
                aria-label={`Configure ${product.name}`}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300 rounded-xl"></div>
                
                {/* Button content */}
                <span className="relative z-10 flex items-center">
                  Configure
                  <svg className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
              </Button>
            </div>
          </div>
          
          {/* Subtle bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-300"></div>
        </div>
      </CardContent>
      
      {/* Enhanced border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
    </Card>
  );
};