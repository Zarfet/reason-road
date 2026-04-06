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
 * Product/device type being built
 * Dedicated hardware vs software affects redundancy risk
 */
export type DeviceType = 'Dedicated hardware' | 'Software/App' | 'Web platform' | 'Not applicable';

/**
 * Whether users already have competing solutions
 * Affects adoption and redundancy risk
 */
export type ExistingEcosystem = 'Yes: users already own devices or tools that handle this' | 'No: nothing comparable exists today' | 'Partial: some alternatives exist but with significant gaps';

/**
 * Who initiates the interaction
 * Proactive systems risk interruption rejection
 */
export type InteractionInitiation = 'User-initiated: system only responds when asked' | 'System-initiated: proactively interrupts or assists without being asked' | 'Both: system can interrupt AND user can ask';

/**
 * Product constraints that map to documented failure patterns
 * Multi-select field — users can choose multiple
 */
export type ProductConstraints = 
  | 'always-on'
  | 'ecosystem-abandonment'
  | 'voice-only'
  | 'hardware-limitations'
  | 'narrow-demographic'
  | 'biometric-data'
  | 'none';

/**
 * Geographic deployment region
 * Affects regulatory requirements
 */
export type GeographicDeployment = 'Primarily Europe' | 'Primarily US' | 'Primarily United States' | 'Global' | 'Global (multiple regions)' | 'Internal tool' | 'Internal Only';

// ============================================
// 2. ASSESSMENT STATE
// Structure of stored answers
// ============================================

/**
 * Complete assessment answer state
 * Stored in context and persisted to database
 */
export interface AssessmentAnswers {
  // Step 0: Project Context
  projectName: string;                    // Optional (metadata only)
  userDemographics: string;               // MANDATORY - min 15 chars
  geography: GeographicDeployment | null; // MANDATORY - must be selected
  
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
  deviceType: DeviceType | null;
  existingEcosystem: ExistingEcosystem | null;
  interactionInitiation: InteractionInitiation | null;
  productConstraints: ProductConstraints[];
}

/**
 * Validation helper for demographics field
 * Returns error message or empty string if valid
 */
export function validateDemographics(value: string): string {
  if (!value || value.trim().length === 0) {
    return "User demographics are required";
  }
  
  if (value.trim().length < 15) {
    return "Please provide more detail (minimum 15 characters)";
  }
  
  // Check for key demographic indicators
  const hasAgeInfo = /\d{2}[-+]|\d{2}s|young|elderly|teen|adult|senior|millennial|gen\s*z|child|kid/i.test(value);
  const hasTechInfo = /tech|literacy|savvy|beginner|expert|familiar|experience|proficient|comfortable/i.test(value);
  const hasProfessionInfo = /healthcare|developer|engineer|designer|manager|student|teacher|professional|worker|nurse|doctor|sales|retail/i.test(value);
  
  if (!hasAgeInfo && !hasTechInfo && !hasProfessionInfo) {
    return "Please include age range, tech literacy, or profession";
  }
  
  return ""; // Valid
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
  | 'product-type'
  | 'ecosystem'
  | 'initiation'
  | 'constraints'
  | 'geography'
  | 'review';

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
  'product-type',
  'ecosystem',
  'initiation',
  'constraints',
  'geography',
  'review',
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
