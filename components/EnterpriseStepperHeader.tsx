"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface Step {
  id: string;
  label: string;
  component: any;
}

interface EnterpriseStepperHeaderProps {
  currentStep: number;
  onStepClick: (index: number) => void;
  steps: Step[];
}

export const EnterpriseStepperHeader = ({ currentStep, onStepClick, steps }: EnterpriseStepperHeaderProps) => {
  if (steps.length === 0) return null;
  
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-6 mb-8 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-4xl">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className="flex items-center cursor-pointer group flex-1"
                  onClick={() => onStepClick(index)}
                >
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        index === currentStep
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : index < currentStep
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-medium text-sm ${
                          index === currentStep
                            ? 'text-slate-900'
                            : index < currentStep
                            ? 'text-green-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {step.label}
                      </div>
                      {index < currentStep && (
                        <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-green-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};