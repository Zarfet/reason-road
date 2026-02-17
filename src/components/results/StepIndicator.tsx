/**
 * Step indicator — thin elegant line with dots
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
  currentStep?: number;
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
                h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                ${isCompleted || isCurrent
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground border border-border'
                }
              `}
            >
              {isCompleted ? (
                <Check className="h-3.5 w-3.5" />
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
