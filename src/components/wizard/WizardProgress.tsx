import { Progress } from '@/components/ui/progress';
import { WIZARD_STEPS } from '@/types/assessment';
import { useAssessment } from '@/context/AssessmentContext';

const STEP_LABELS: Record<string, string> = {
  'context': 'Project Context',
  'values': 'Values Ranking',
  'complexity': 'Task Complexity',
  'frequency': 'Frequency',
  'predictability': 'Predictability',
  'context-of-use': 'Context of Use',
  'information-type': 'Information Type',
  'exploration': 'Exploration Mode',
  'errors': 'Error Consequences',
  'control': 'Control Preference',
  'geography': 'Geographic Deployment',
};

export function WizardProgress() {
  const { currentStep, progress, currentStepName } = useAssessment();

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Step {currentStep + 1} of {WIZARD_STEPS.length}
        </span>
        <span className="text-muted-foreground">
          {STEP_LABELS[currentStepName]}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
