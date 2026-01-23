import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AssessmentAnswers, WizardStep, RecommendationResult } from '@/types/assessment';
import { WIZARD_STEPS, DESIGN_VALUES } from '@/types/assessment';
import { calculateScores, generateRecommendation } from '@/lib/scoring';

interface AssessmentContextType {
  // Current state
  currentStep: number;
  currentStepName: WizardStep;
  answers: AssessmentAnswers;
  isComplete: boolean;
  recommendation: RecommendationResult | null;
  
  // Actions
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  updateAnswer: <K extends keyof AssessmentAnswers>(key: K, value: AssessmentAnswers[K]) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  
  // Progress
  progress: number;
  canProceed: boolean;
}

const initialAnswers: AssessmentAnswers = {
  projectName: '',
  userDemographics: '',
  geography: null,
  valuesRanking: DESIGN_VALUES.map(v => v.value),
  taskComplexity: null,
  frequency: null,
  predictability: null,
  contextOfUse: null,
  informationType: null,
  explorationMode: null,
  errorConsequence: null,
  controlPreference: null,
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>(initialAnswers);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const currentStepName = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  // Check if current step can proceed
  const canProceed = (() => {
    switch (currentStepName) {
      case 'context':
        return true; // Optional fields
      case 'values':
        return answers.valuesRanking.length === 5;
      case 'complexity':
        return answers.taskComplexity !== null;
      case 'frequency':
        return answers.frequency !== null;
      case 'predictability':
        return answers.predictability !== null;
      case 'context-of-use':
        return answers.contextOfUse !== null;
      case 'information-type':
        return answers.informationType !== null;
      case 'exploration':
        return answers.explorationMode !== null;
      case 'errors':
        return answers.errorConsequence !== null;
      case 'control':
        return answers.controlPreference !== null;
      case 'geography':
        return answers.geography !== null;
      default:
        return false;
    }
  })();

  const goToNextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < WIZARD_STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  const updateAnswer = useCallback(<K extends keyof AssessmentAnswers>(
    key: K, 
    value: AssessmentAnswers[K]
  ) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const completeAssessment = useCallback(() => {
    const scores = calculateScores(answers);
    const result = generateRecommendation(scores);
    setRecommendation(result);
    setIsComplete(true);
  }, [answers]);

  const resetAssessment = useCallback(() => {
    setCurrentStep(0);
    setAnswers(initialAnswers);
    setIsComplete(false);
    setRecommendation(null);
  }, []);

  const value: AssessmentContextType = {
    currentStep,
    currentStepName,
    answers,
    isComplete,
    recommendation,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateAnswer,
    completeAssessment,
    resetAssessment,
    progress,
    canProceed,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
