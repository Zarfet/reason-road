import type { AssessmentAnswers } from '@/types/assessment';

export interface DemoScenario {
  id: string;
  name: string;
  year: string;
  investment: string;
  outcome: string;
  answers: AssessmentAnswers;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'google-glass',
    name: 'Google Glass',
    year: '2013',
    investment: '€500M+',
    outcome: 'Discontinued 2015',
    answers: {
      projectName: 'Google Glass',
      userDemographics: 'Early adopters and tech enthusiasts, 25-40 years old, high tech literacy, comfortable with smartphones and emerging technology, disposable income for $1,500 device',
      geography: 'Primarily US',
      valuesRanking: ['Efficiency', 'Joy', 'User Control', 'Accessibility', 'Sustainability'],
      taskComplexity: 'Medium',
      frequency: 'Multiple times daily',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Social situations',
      informationType: 'Visual content',
      explorationMode: 'Mix of both',
      errorConsequence: 'Annoying but recoverable',
      controlPreference: 'Supervised',
      deviceType: 'Dedicated hardware',
      existingEcosystem: 'Partial: some alternatives exist but with significant gaps',
      interactionInitiation: 'Both: system can interrupt AND user can ask',
      productConstraints: ['always-on', 'hardware-limitations', 'narrow-demographic', 'biometric-data'],
    }
  },
  {
    id: 'clippy',
    name: 'Microsoft Clippy',
    year: '1997',
    investment: 'Undisclosed',
    outcome: 'Disabled by default 2001, removed 2007',
    answers: {
      projectName: 'Microsoft Clippy',
      userDemographics: 'Microsoft Office users across all segments: business professionals, students, home users, 18-65+ years old, mixed tech literacy from novice to expert, performing document creation and editing tasks',
      geography: 'Global (multiple regions)',
      valuesRanking: ['Efficiency', 'User Control', 'Accessibility', 'Joy', 'Sustainability'],
      taskComplexity: 'Medium',
      frequency: 'Multiple times daily',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Desktop',
      informationType: 'Structured data',
      explorationMode: 'Mix of both',
      errorConsequence: 'Annoying but recoverable',
      controlPreference: 'Full control',
      deviceType: 'Software/App',
      existingEcosystem: 'Yes: users already own devices or tools that handle this',
      interactionInitiation: 'System-initiated: proactively interrupts or assists without being asked',
      productConstraints: [],
    }
  },
  {
    id: 'fire-phone',
    name: 'Amazon Fire Phone',
    year: '2014',
    investment: '€170M writedown',
    outcome: 'Discontinued 2015',
    answers: {
      projectName: 'Amazon Fire Phone',
      userDemographics: 'General smartphone consumers and Amazon Prime members, 25-55 years old, mixed tech literacy, familiar with smartphones, interested in Amazon ecosystem integration, price-sensitive',
      geography: 'Primarily US',
      valuesRanking: ['Efficiency', 'Joy', 'User Control', 'Accessibility', 'Sustainability'],
      taskComplexity: 'Medium',
      frequency: 'Multiple times daily',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Mobile',
      informationType: 'Visual content',
      explorationMode: 'Mix of both',
      errorConsequence: 'Annoying but recoverable',
      controlPreference: 'Supervised',
      deviceType: 'Dedicated hardware',
      existingEcosystem: 'Yes: users already own devices or tools that handle this',
      interactionInitiation: 'User-initiated: system only responds when asked',
      productConstraints: ['ecosystem-abandonment'],
    }
  },
  {
    id: 'humane-ai-pin',
    name: 'Humane AI Pin',
    year: '2024',
    investment: '€200M',
    outcome: 'Mass returns within weeks of launch',
    answers: {
      projectName: 'Humane AI Pin',
      userDemographics: 'Tech-forward professionals and early adopters, 28-45 years old, high tech literacy, comfortable with AI assistants and emerging technology, seeking hands-free productivity tools',
      geography: 'Primarily US',
      valuesRanking: ['Efficiency', 'User Control', 'Joy', 'Accessibility', 'Sustainability'],
      taskComplexity: 'Medium',
      frequency: 'Multiple times daily',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Mobile',
      informationType: 'Unstructured text',
      explorationMode: 'Know exactly',
      errorConsequence: 'Annoying but recoverable',
      controlPreference: 'Supervised',
      deviceType: 'Dedicated hardware',
      existingEcosystem: 'Yes: users already own devices or tools that handle this',
      interactionInitiation: 'User-initiated: system only responds when asked',
      productConstraints: ['always-on', 'voice-only', 'hardware-limitations', 'narrow-demographic'],
    }
  },
  {
    id: 'rabbit-r1',
    name: 'Rabbit R1',
    year: '2024',
    investment: '€118M',
    outcome: 'Significant returns after launch',
    answers: {
      projectName: 'Rabbit R1',
      userDemographics: 'Early adopters and AI enthusiasts, 22-40 years old, high tech literacy, interested in AI-first interactions, smartphone power users seeking faster workflows, price-conscious ($199 device)',
      geography: 'Primarily US',
      valuesRanking: ['Efficiency', 'Joy', 'User Control', 'Accessibility', 'Sustainability'],
      taskComplexity: 'Medium',
      frequency: 'Multiple times daily',
      predictability: 'Varies within known patterns',
      contextOfUse: 'Mobile',
      informationType: 'Unstructured text',
      explorationMode: 'Know exactly',
      errorConsequence: 'Annoying but recoverable',
      controlPreference: 'Supervised',
      deviceType: 'Dedicated hardware',
      existingEcosystem: 'Yes: users already own devices or tools that handle this',
      interactionInitiation: 'User-initiated: system only responds when asked',
      productConstraints: [],
    }
  }
];
