import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAssessment } from '@/context/AssessmentContext';
import { WIZARD_STEPS } from '@/types/assessment';
import { motion } from 'framer-motion';

interface WizardNavigationProps {
  onComplete?: () => void;
}

export function WizardNavigation({ onComplete }: WizardNavigationProps) {
  const { 
    currentStep, 
    canProceed, 
    goToNextStep, 
    goToPreviousStep,
    completeAssessment 
  } = useAssessment();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeAssessment();
      onComplete?.();
    } else {
      goToNextStep();
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-between pt-8 border-t border-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Button
        variant="outline"
        onClick={goToPreviousStep}
        disabled={isFirstStep}
        className="gap-2 border-border hover:bg-secondary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <Button
        onClick={handleNext}
        disabled={!canProceed}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isLastStep ? (
          <>
            Complete
            <Check className="h-4 w-4" />
          </>
        ) : (
          <>
            Next
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </motion.div>
  );
}