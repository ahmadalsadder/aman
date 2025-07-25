
'use client';

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
    id: string;
    label: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="flex items-center w-full">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const isLastStep = index === steps.length - 1;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                                isActive ? "border-primary bg-primary/10 text-primary" : "border-border",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-card"
                            )}>
                                {isCompleted ? <Check className="h-6 w-6" /> : <span className="font-semibold">{index + 1}</span>}
                            </div>
                            <p className={cn(
                                "text-xs text-center transition-colors duration-300",
                                isActive ? "font-semibold text-primary" : "text-muted-foreground",
                                isCompleted ? "font-medium" : ""
                            )}>
                                {step.label}
                            </p>
                        </div>
                        {!isLastStep && (
                             <div className="flex-1 h-1 mx-2 bg-border relative">
                                <div className={cn(
                                    "absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out",
                                    isCompleted ? "w-full" : "w-0"
                                )} />
                             </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
