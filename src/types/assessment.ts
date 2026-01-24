/**
 * NEXUS - Assessment Type Definitions
 * 
 * Purpose: TypeScript types for the assessment wizard and scoring system
 * 
 * Categories:
 * 1. Answer Types - Possible values for each question
 * 2. Assessment State - Structure of stored answers
 * 3. Scoring Types - Paradigm scores and recommendations
 * 4. Navigation Types - Wizard step definitions
 * 5. Constants - Static data for UI rendering
 * 
 * Usage:
 *   import type { AssessmentAnswers, ParadigmScores } from '@/types/assessment'
 *   import { WIZARD_STEPS, DESIGN_VALUES } from '@/types/assessment'
 * 
 * Note: Keep in sync with database schema for persistence
 */

// ============================================
// 1. ANSWER TYPES
// Possible values for each assessment question
// ============================================

/**
 * Core design values that users rank by priority
 * Order matters - first = highest priority
 */
export type DesignValue = 
  | 'User Control'
  | 'Efficiency'
  | 'Accessibility'
  | 'Sustainability'
  | 'Joy';

/**
 * Task complexity levels
 * Simple → Complex affects paradigm choice
 */
export type TaskComplexity = 'Simple' | 'Medium' | 'Complex';

/**
 * How often user performs the task
 * Higher frequency → more automation benefit
 */
export type Frequency = 'Multiple times daily' | 'Several times per week' | 'Occasionally' | 'Rarely';

/**
 * How predictable the task workflow is
 * More predictable → safer to automate
 */
export type Predictability = 'Always identical' | 'Varies within known patterns' | 'Always different';

/**
 * Physical context of use
 * Determines available modalities
 */
export type ContextOfUse = 'Desktop' | 'Mobile' | 'Hands occupied' | 'Social situations';

/**
 * Type of information being worked with
 * Affects optimal presentation method
 */
export type InformationType = 'Structured data' | 'Unstructured text' | 'Visual content' | 'Spatial/3D';

/**
 * User's information-seeking behavior
 * Browse vs targeted retrieval
 */
export type ExplorationMode = 'Explore options' | 'Know exactly' | 'Mix of both';

/**
 * Severity of potential errors
 * High stakes → more confirmation needed
 */
export type ErrorConsequence = 'Trivial' | 'Annoying but recoverable' | 'Serious';

/**
 * User's preference for automation level
 * From fully automatic to full manual control
 */
export type ControlPreference = 'Automatic' | 'Supervised' | 'Full control';

/**
 * Geographic deployment region
 * Affects regulatory requirements
 */
export type GeographicDeployment = 'Primarily Europe' | 'Primarily US' | 'Global' | 'Internal tool';

// ============================================
// 2. ASSESSMENT STATE
// Structure of stored answers
// ============================================

/**
 * Complete assessment answer state
 * Stored in context and persisted to database
 */
export interface AssessmentAnswers {
  // Step 0: Project Context (optional metadata)
  projectName?: string;
  userDemographics?: string;
  geography: GeographicDeployment | null;
  
  // Step 1: Values Ranking (ordered array, top = highest priority)
  valuesRanking: DesignValue[];
  
  // Steps 2-10: DIKW Questions
  taskComplexity: TaskComplexity | null;
  frequency: Frequency | null;
  predictability: Predictability | null;
  contextOfUse: ContextOfUse | null;
  informationType: InformationType | null;
  explorationMode: ExplorationMode | null;
  errorConsequence: ErrorConsequence | null;
  controlPreference: ControlPreference | null;
}

// ============================================
// 3. SCORING TYPES
// Paradigm scores and recommendations
// ============================================

/**
 * Raw scores for each paradigm (before normalization)
 * Can be negative (penalties apply)
 */
export interface ParadigmScores {
  traditional_screen: number;
  invisible: number;
  ai_vectorial: number;
  spatial: number;
  voice: number;
}

/**
 * Normalized percentages for each paradigm
 * Sum to 100 (rounded integers)
 */
export interface ParadigmPercentages {
  traditional_screen: number;
  invisible: number;
  ai_vectorial: number;
  spatial: number;
  voice: number;
}

/**
 * Final recommendation result
 * Includes ranked paradigms and scores
 */
export interface RecommendationResult {
  primary: { paradigm: keyof ParadigmScores; pct: number };
  secondary: { paradigm: keyof ParadigmScores; pct: number };
  tertiary: { paradigm: keyof ParadigmScores; pct: number };
  avoid: Array<[keyof ParadigmScores, number]>;
  allScores: ParadigmPercentages;
}

// ============================================
// 4. NAVIGATION TYPES
// Wizard step definitions
// ============================================

/**
 * Wizard step identifiers
 * Maps to step index via WIZARD_STEPS array
 */
export type WizardStep = 
  | 'context'
  | 'values'
  | 'complexity'
  | 'frequency'
  | 'predictability'
  | 'context-of-use'
  | 'information-type'
  | 'exploration'
  | 'errors'
  | 'control'
  | 'geography';

/**
 * Ordered array of wizard steps
 * Index = step number (0-based)
 */
export const WIZARD_STEPS: WizardStep[] = [
  'context',
  'values',
  'complexity',
  'frequency',
  'predictability',
  'context-of-use',
  'information-type',
  'exploration',
  'errors',
  'control',
  'geography'
];

// ============================================
// 5. CONSTANTS
// Static data for UI rendering
// ============================================

/**
 * Design values with descriptions
 * Used in values ranking step
 */
export const DESIGN_VALUES: { value: DesignValue; description: string }[] = [
  { value: 'User Control', description: 'Users feel in control, can override automation' },
  { value: 'Efficiency', description: 'Minimize time/effort, streamline workflows' },
  { value: 'Accessibility', description: 'Works for all abilities, contexts, literacies' },
  { value: 'Sustainability', description: 'Low energy, ethical data, minimal waste' },
  { value: 'Joy', description: 'Delightful, emotionally positive, enjoyable' },
];

/**
 * Human-readable labels for paradigms
 * Used in results display
 */
export const PARADIGM_LABELS: Record<keyof ParadigmScores, string> = {
  traditional_screen: 'Traditional Screen',
  invisible: 'Invisible/Ambient',
  ai_vectorial: 'AI Vectorial',
  spatial: 'Spatial (AR/VR)',
  voice: 'Voice Interface',
};

/**
 * Detailed descriptions for paradigms
 * Used in results explanation
 */
export const PARADIGM_DESCRIPTIONS: Record<keyof ParadigmScores, string> = {
  traditional_screen: 'Mobile or desktop screens with visual UI elements',
  invisible: 'Background automation with minimal user interaction',
  ai_vectorial: 'AI-powered search, generation, and intelligent assistance',
  spatial: 'Augmented or Virtual Reality experiences',
  voice: 'Voice-first interfaces and conversational AI',
};
