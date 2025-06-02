"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { decode } from 'he';

interface SalesforceProduct {
  id: string;
  name: string;
  description?: string;
  productCode?: string;
  displayUrl?: string;
  prices: Array<{
    price: number;
    isDefault: boolean;
    pricingModel: {
      name: string;
      pricingModelType: string;
    };
  }>;
  categories: Array<{
    name: string;
    catalogId: string;
  }>;
}

const transformSalesforceProduct = (sfProduct: SalesforceProduct, index: number) => {
  // Default images for fallback
  const defaultImages = [
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1549399735-cae2452eba7a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
  ];

  const defaultPrice = sfProduct.prices?.find(p => p.isDefault)?.price || 0;
  
  // Calculate monthly price (assuming 60 month financing at 5% APR as example)
  const monthlyPrice = defaultPrice > 0 ? Math.round((defaultPrice * 0.018871) * 100) / 100 : 0;
  return {
    id: sfProduct.id,
    name: sfProduct.name,
    description: sfProduct.description || "Premium quality vehicle",
    price: defaultPrice,
    monthlyPrice: monthlyPrice,
    image: sfProduct?.displayUrl ? decode(sfProduct.displayUrl) : defaultImages[index % defaultImages.length],
    type: sfProduct.productCode?.toLowerCase() || "vehicle"
  };
};

export const ProductShowcase = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('data ---------->', data);
 
        const dreamLeaseProducts = data.result?.filter((product: SalesforceProduct) => 
          product.categories?.some(category => category.name === "Dream Lease")
        ) || [];
        console.log('dreamLeaseProducts ---------->', dreamLeaseProducts);
        const transformedProducts = dreamLeaseProducts.map((product: SalesforceProduct, index: number) => 
          transformSalesforceProduct(product, index)
        );

        setProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-24 px-4" id="configure">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
        
        <div className="relative container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Loading Collection</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
              Choose Your Dream Model
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              Select the perfect base for your extraordinary journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="group">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 animate-pulse"></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg w-48 animate-pulse"></div>
                      <div className="h-6 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full w-20 animate-pulse"></div>
                    </div>
                    <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-full mb-3 animate-pulse"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-3/4 mb-6 animate-pulse"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg w-32 animate-pulse"></div>
                      <div className="h-12 bg-gradient-to-r from-blue-300 to-blue-400 rounded-xl w-36 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-slate-100 py-24 px-4" id="configure">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>
        
        <div className="relative container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-red-50 border border-red-200 mb-8">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">System Alert</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-8 leading-tight">
              Choose Your Dream Model
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-xl text-red-600 font-semibold mb-2">Unable to Load Collection</p>
              <p className="text-slate-600">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-24 px-4" id="configure">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text uppercase tracking-wide">Premium Collection</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
            Choose Your Dream Model
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
            Select the perfect base for your extraordinary journey
          </p>
        </div>
                
        <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <div key={product.id} className="group transform hover:-translate-y-2 transition-all duration-700">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Models Available</h3>
              <p className="text-slate-600">Our collection is currently being updated. Please check back soon.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};