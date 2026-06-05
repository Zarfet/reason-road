import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { NexusLogo } from '@/components/layout/NexusLogo';
import { Button } from '@/components/ui/button';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { useAssessment } from '@/context/AssessmentContext';
import {
  StepValues,
  StepComplexity,
  StepFrequency,
  StepPredictability,
  StepContextOfUse,
  StepInformationType,
  StepExploration,
  StepErrors,
  StepControl,
  StepProductType,
  StepEcosystem,
  StepInitiation,
  StepConstraints,
  StepGeography,
} from '@/components/wizard/WizardSteps';
import { StepReview } from '@/components/wizard/WizardSteps/StepReview';
import { QuestionLayout } from '@/components/wizard/QuestionLayout';
import { DemographicsExamples } from '@/components/wizard/DemographicsExamples';

function StepContextDemo() {
  const { answers } = useAssessment();

  return (
    <QuestionLayout
      question="Tell us about your project"
      hint="Demographics are pre-loaded for this demo scenario and cannot be edited."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Project name</p>
          <p className="text-base font-sans font-medium text-foreground">{answers.projectName}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Primary User Demographics
          </p>
          <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
            {answers.userDemographics}
          </div>
          <DemographicsExamples />
        </div>
      </div>
    </QuestionLayout>
  );
}

export default function DemoAssessment() {
  const navigate = useNavigate();
  const { currentStepName, answers, resetAssessment } = useAssessment();

  const handleComplete = () => {
    navigate('/demo/results');
  };

  const handleCancel = () => {
    resetAssessment();
    navigate('/demo');
  };

  const renderStep = () => {
    switch (currentStepName) {
      case 'context': return <StepContextDemo />;
      case 'values': return <StepValues />;
      case 'complexity': return <StepComplexity />;
      case 'frequency': return <StepFrequency />;
      case 'predictability': return <StepPredictability />;
      case 'context-of-use': return <StepContextOfUse />;
      case 'information-type': return <StepInformationType />;
      case 'exploration': return <StepExploration />;
      case 'errors': return <StepErrors />;
      case 'control': return <StepControl />;
      case 'product-type': return <StepProductType />;
      case 'ecosystem': return <StepEcosystem />;
      case 'initiation': return <StepInitiation />;
      case 'constraints': return <StepConstraints />;
      case 'geography': return <StepGeography />;
      case 'review': return <StepReview />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-accent text-accent-foreground text-center text-xs font-mono py-1.5 px-4">
        DEMO MODE — {answers.projectName || 'No scenario selected'}
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="nexus-container py-4">
          <div className="flex items-center justify-between">
            <NexusLogo iconSize={28} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="gap-2 rounded-lg border-border hover:bg-secondary"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="nexus-container py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <WizardProgress />

          <div className="nexus-card min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepName}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
            <WizardNavigation onComplete={handleComplete} />
          </div>
        </div>
      </main>
    </div>
  );
}
