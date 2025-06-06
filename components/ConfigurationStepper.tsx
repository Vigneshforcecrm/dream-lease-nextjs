"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModelStep } from "@/components/steps/ModelStep";
import { ColorStep } from "@/components/steps/ColorStep";
import { WheelsStep } from "@/components/steps/WheelsStep";
import { InteriorStep } from "@/components/steps/InteriorStep";
import { PackagesStep } from "@/components/steps/PackagesStep";
import { SummaryStep } from "@/components/steps/SummaryStep";
import { EnterpriseStepperHeader } from "@/components/EnterpriseStepperHeader";
import { PricingSidebar } from "@/components/PricingSidebar";
import { useConfiguration } from "@/contexts/ConfigurationContext";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

// Dynamic steps based on product data
const getStepsForProduct = (productData: any) => {
  console.log('productData ----->', productData)
  if (!productData) return [];
  
  const steps = [
    { id: 'model', label: 'Model', component: ModelStep, sequence: 1}
  ];
  
  // Add attribute steps (like color)
  productData.attributeCategories?.forEach((category: any) => {
    steps.push({ id: 'color', label: 'Color',sequence: category?.sequence || 2 , component: ColorStep });
  });
  
  // Add component group steps
  productData.productComponentGroups?.forEach((group: any) => {
    if (group.name === 'Wheels') {
      steps.push({ id: 'wheels', label: 'Wheels', sequence: group?.sequence || 3, component: WheelsStep });
    } else if (group.name === 'Interior') {
      steps.push({ id: 'interior', label: 'Interior', sequence: group?.sequence || 4, component: InteriorStep });
    } else if (group.name === 'Package') {
      steps.push({ id: 'packages', label: 'Packages', sequence: group?.sequence || 5, component: PackagesStep });
    }
  });
  
  steps.push({ id: 'summary', label: 'Summary', sequence: 999, component: SummaryStep });
  
  return steps.sort((a, b) => a.sequence - b.sequence);
};

export const ConfigurationStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { configuration, loading, error } = useConfiguration();
  
  const steps = getStepsForProduct(configuration.productData);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < steps.length) {
      setCurrentStep(index);
    }
  };

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl opacity-20 blur-xl"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Loading Configuration</h2>
          <p className="text-slate-600 leading-relaxed">Preparing your premium vehicle customization experience...</p>
          <div className="mt-6 w-48 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-2xl opacity-20 blur-xl"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-red-100 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-red-800 mb-3">Configuration Error</h2>
            <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg border-0"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced No Steps State
  if (steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-10 w-10 text-slate-500" />
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Product Not Found</h2>
            <p className="text-slate-600 leading-relaxed">This product is not available for configuration at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep]?.component;
  const isSummaryStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <EnterpriseStepperHeader 
        currentStep={currentStep} 
        onStepClick={handleStepClick}
        steps={steps}
      />
      
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className={`flex flex-col gap-8 ${!isSummaryStep ? 'lg:flex-row' : ''}`}>
          {/* Main Content */}
          <div className={`flex-1 ${!isSummaryStep ? 'lg:flex-none lg:w-0 lg:flex-grow' : ''}`}>
            <Card className="min-h-[600px] shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                {CurrentStepComponent && <CurrentStepComponent />}
                
                {!isSummaryStep && (
                  <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="group bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={nextStep}
                      disabled={currentStep === steps.length - 1}
                      className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                    >
                      {currentStep === steps.length - 1 ? 'Complete Configuration' : 'Continue'}
                      <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing Sidebar - Only show if not on summary step */}
          {!isSummaryStep && (
            <div className="lg:flex-shrink-0">
              <PricingSidebar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};