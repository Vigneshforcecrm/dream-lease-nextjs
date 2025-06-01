"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export const Hero = () => {
  const scrollToProducts = () => {
    const productSection = document.getElementById('configure');
    if (productSection) {
      productSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      
      {/* Full Cover Hero Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80"
          alt="Luxury vehicle"
          className="w-full h-full object-cover"
        />
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 max-w-7xl h-screen flex items-center">
        <div className="max-w-2xl">
          
          {/* Main Content */}
          <div className="space-y-8">
            
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-light text-white leading-[1.05] tracking-tight">
                Configure your
                <span className="block font-semibold">
                  dream vehicle
                </span>
              </h1>
              
              <div className="w-20 h-px bg-white/60"></div>
              
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light max-w-lg">
                Premium vehicle configuration platform with intelligent recommendations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-12 mt-20">
              <Button
                onClick={scrollToProducts}
                className="group bg-white text-slate-900 hover:bg-white/90 px-8 py-4 rounded-lg text-base font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl border-0 h-auto"
              >
                <span className="flex items-center gap-3">
                  Start Configuring
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Button>
              
              <Button
                variant="ghost"
                className="group text-white hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 px-12 py-4 rounded-lg text-base font-medium transition-all duration-300 h-auto"
              >
                <span className="flex items-center gap-3">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button 
          onClick={scrollToProducts}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 group"
        >
          <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
          <div className="w-px h-6 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors duration-300 animate-bounce"></div>
        </button>
      </div>
    </section>
  );
};