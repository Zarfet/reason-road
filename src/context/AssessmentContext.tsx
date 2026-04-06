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

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import type { AssessmentAnswers, WizardStep, RecommendationResult } from '@/types/assessment';
import { WIZARD_STEPS, DESIGN_VALUES, validateDemographics } from '@/types/assessment';
import { calculateScores, generateRecommendation } from '@/lib/scoring';
import { detectContradictionsForStep, detectContradictions } from '@/lib/contradictionDetector';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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
  saveAssessmentToDb: () => Promise<{ success: boolean; assessmentId?: string; error?: string }>;
  resetAssessment: () => void;
  
  // Computed values
  progress: number;
  isSaving: boolean;
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
  deviceType: null,
  existingEcosystem: null,
  interactionInitiation: null,
  productConstraints: [],
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
  const [isSaving, setIsSaving] = useState(false);
  
  // Track assessment start time for time_to_complete calculation
  const startTimeRef = useRef<number>(Date.now());

  // Derived state
  const currentStepName = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  /**
   * Check if current step can proceed
   * Each step has specific validation requirements
   */
  const canProceed = useMemo(() => {
    // Check step-specific validation
    const stepValid = (() => {
      switch (currentStepName) {
        case 'context':
          // Validate demographics (mandatory)
          const demographicsError = validateDemographics(answers.userDemographics);
          if (demographicsError) {
            return false;
          }
          return true;
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
        case 'product-type':
          return answers.deviceType !== null;
        case 'ecosystem':
          return answers.existingEcosystem !== null;
        case 'initiation':
          return answers.interactionInitiation !== null;
        case 'constraints':
          return true; // Optional step — always allow proceeding
        case 'geography':
          return answers.geography !== null;
        case 'review':
          return true; // Allow proceeding even with contradictions
        default:
          return false;
      }
    })();

    if (!stepValid) {
      return false;
    }

    // Check for blocking contradictions only on the step where the contradiction originates
    // (not on subsequent unrelated steps). We no longer block navigation for contradictions —
    // they are surfaced in the review step instead.
    // This ensures users can always progress through the wizard.

    return true;
  }, [currentStep, currentStepName, answers]);

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
   * Save the assessment to the database
   * Should be called after completeAssessment
   */
  const saveAssessmentToDb = useCallback(async (): Promise<{ success: boolean; assessmentId?: string; error?: string }> => {
    if (!recommendation) {
      return { success: false, error: 'No recommendation available' };
    }

    setIsSaving(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Calculate time to complete in seconds
      const timeToComplete = Math.round((Date.now() - startTimeRef.current) / 1000);

      // Insert the assessment and return the ID
      const { data, error } = await supabase
        .from('assessments')
        .insert([{
          user_id: user.id,
          responses: JSON.parse(JSON.stringify(answers)) as Json,
          paradigm_results: JSON.parse(JSON.stringify(recommendation)) as Json,
          is_completed: true,
          time_to_complete_seconds: timeToComplete,
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error saving assessment:', error);
        return { success: false, error: error.message };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✓ Assessment saved to database:', data.id);
      }

      return { success: true, assessmentId: data.id };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error saving assessment:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [answers, recommendation]);

  /**
   * Reset all assessment state
   * Used when starting a new assessment
   */
  const resetAssessment = useCallback(() => {
    setCurrentStep(0);
    setAnswers(initialAnswers);
    setIsComplete(false);
    setRecommendation(null);
    startTimeRef.current = Date.now(); // Reset timer
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
    saveAssessmentToDb,
    resetAssessment,
    progress,
    canProceed,
    isSaving,
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
