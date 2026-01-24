/**
 * NEXUS - Assessment Context
 * 
 * Purpose: Global state management for the assessment wizard
 * 
 * Features:
 * - Tracks current step in wizard (0-10)
 * - Stores all assessment answers
 * - Calculates progress percentage
 * - Validates step completion
 * - Generates final recommendation
 * 
 * State Structure:
 * - currentStep: number (0-10, maps to WIZARD_STEPS)
 * - answers: AssessmentAnswers (all user responses)
 * - isComplete: boolean (true after completion)
 * - recommendation: RecommendationResult | null (final scores)
 * 
 * Actions:
 * - goToNextStep(): Advance to next step
 * - goToPreviousStep(): Go back one step
 * - goToStep(n): Jump to specific step
 * - updateAnswer(key, value): Update single answer
 * - completeAssessment(): Calculate scores and mark complete
 * - resetAssessment(): Clear all state
 * 
 * Validation:
 * - canProceed: Computed based on current step requirements
 * - Each step has specific validation rules
 * 
 * Usage:
 *   const { answers, updateAnswer, goToNextStep } = useAssessment()
 * 
 * Dependencies: scoring.ts, assessment types
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AssessmentAnswers, WizardStep, RecommendationResult } from '@/types/assessment';
import { WIZARD_STEPS, DESIGN_VALUES } from '@/types/assessment';
import { calculateScores, generateRecommendation } from '@/lib/scoring';

/**
 * Context type definition
 * Defines all state and actions available to consumers
 */
interface AssessmentContextType {
  // Current state
  currentStep: number;
  currentStepName: WizardStep;
  answers: AssessmentAnswers;
  isComplete: boolean;
  recommendation: RecommendationResult | null;
  
  // Navigation actions
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  
  // Data actions
  updateAnswer: <K extends keyof AssessmentAnswers>(key: K, value: AssessmentAnswers[K]) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  
  // Computed values
  progress: number;
  canProceed: boolean;
}

/**
 * Initial answer state
 * Pre-populates values ranking with all 5 values (user reorders)
 */
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

/**
 * Assessment Provider Component
 * Wraps application to provide assessment state
 * 
 * @param children - Child components to wrap
 */
export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  // Core state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>(initialAnswers);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  // Derived state
  const currentStepName = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  /**
   * Check if current step can proceed
   * Each step has specific validation requirements
   */
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

  /**
   * Navigate to next step (if not at end)
   */
  const goToNextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  /**
   * Navigate to previous step (if not at start)
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  /**
   * Jump to specific step
   * @param step - Step index (0-based)
   */
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < WIZARD_STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  /**
   * Update a single answer
   * @param key - Answer field name
   * @param value - New value
   */
  const updateAnswer = useCallback(<K extends keyof AssessmentAnswers>(
    key: K, 
    value: AssessmentAnswers[K]
  ) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Complete the assessment
   * Calculates scores and generates recommendation
   */
  const completeAssessment = useCallback(() => {
    const scores = calculateScores(answers);
    const result = generateRecommendation(scores);
    setRecommendation(result);
    setIsComplete(true);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Assessment completed:', result);
    }
  }, [answers]);

  /**
   * Reset all assessment state
   * Used when starting a new assessment
   */
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

/**
 * Hook to access assessment context
 * Must be used within AssessmentProvider
 * 
 * @throws Error if used outside provider
 */
export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
