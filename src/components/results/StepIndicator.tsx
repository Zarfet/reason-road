/**
 * Step indicator component for results page
 * Shows progress through assessment steps with numbered circles
 */

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Context' },
  { number: 2, label: 'Values' },
  { number: 3, label: 'Assessment' },
  { number: 4, label: 'Analysis' },
  { number: 5, label: 'Results' },
];

interface StepIndicatorProps {
  currentStep?: number; // defaults to 5 (Results)
}

export function StepIndicator({ currentStep = 5 }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 py-6">
      {STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        
        return (
          <motion.div
            key={step.number}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`
                h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${isCompleted || isCurrent
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
            </div>
            <span 
              className={`text-xs ${
                isCurrent 
                  ? 'font-semibold text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
