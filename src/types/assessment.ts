export type DesignValue = 
  | 'User Control'
  | 'Efficiency'
  | 'Accessibility'
  | 'Sustainability'
  | 'Joy';

export type TaskComplexity = 'Simple' | 'Medium' | 'Complex';
export type Frequency = 'Multiple times daily' | 'Several times per week' | 'Occasionally' | 'Rarely';
export type Predictability = 'Always identical' | 'Varies within known patterns' | 'Always different';
export type ContextOfUse = 'Desktop' | 'Mobile' | 'Hands occupied' | 'Social situations';
export type InformationType = 'Structured data' | 'Unstructured text' | 'Visual content' | 'Spatial/3D';
export type ExplorationMode = 'Explore options' | 'Know exactly' | 'Mix of both';
export type ErrorConsequence = 'Trivial' | 'Annoying but recoverable' | 'Serious';
export type ControlPreference = 'Automatic' | 'Supervised' | 'Full control';
export type GeographicDeployment = 'Primarily Europe' | 'Primarily US' | 'Global' | 'Internal tool';

export interface AssessmentAnswers {
  // Step 0: Project Context
  projectName?: string;
  userDemographics?: string;
  geography: GeographicDeployment | null;
  
  // Step 1: Values Ranking
  valuesRanking: DesignValue[];
  
  // Step 2-10: DIKW Questions
  taskComplexity: TaskComplexity | null;
  frequency: Frequency | null;
  predictability: Predictability | null;
  contextOfUse: ContextOfUse | null;
  informationType: InformationType | null;
  explorationMode: ExplorationMode | null;
  errorConsequence: ErrorConsequence | null;
  controlPreference: ControlPreference | null;
}

export interface ParadigmScores {
  traditional_screen: number;
  invisible: number;
  ai_vectorial: number;
  spatial: number;
  voice: number;
}

export interface ParadigmPercentages {
  traditional_screen: number;
  invisible: number;
  ai_vectorial: number;
  spatial: number;
  voice: number;
}

export interface RecommendationResult {
  primary: { paradigm: keyof ParadigmScores; pct: number };
  secondary: { paradigm: keyof ParadigmScores; pct: number };
  tertiary: { paradigm: keyof ParadigmScores; pct: number };
  avoid: Array<[keyof ParadigmScores, number]>;
  allScores: ParadigmPercentages;
}

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

export const DESIGN_VALUES: { value: DesignValue; description: string }[] = [
  { value: 'User Control', description: 'Users feel in control, can override automation' },
  { value: 'Efficiency', description: 'Minimize time/effort, streamline workflows' },
  { value: 'Accessibility', description: 'Works for all abilities, contexts, literacies' },
  { value: 'Sustainability', description: 'Low energy, ethical data, minimal waste' },
  { value: 'Joy', description: 'Delightful, emotionally positive, enjoyable' },
];

export const PARADIGM_LABELS: Record<keyof ParadigmScores, string> = {
  traditional_screen: 'Traditional Screen',
  invisible: 'Invisible/Ambient',
  ai_vectorial: 'AI Vectorial',
  spatial: 'Spatial (AR/VR)',
  voice: 'Voice Interface',
};

export const PARADIGM_DESCRIPTIONS: Record<keyof ParadigmScores, string> = {
  traditional_screen: 'Mobile or desktop screens with visual UI elements',
  invisible: 'Background automation with minimal user interaction',
  ai_vectorial: 'AI-powered search, generation, and intelligent assistance',
  spatial: 'Augmented or Virtual Reality experiences',
  voice: 'Voice-first interfaces and conversational AI',
};
