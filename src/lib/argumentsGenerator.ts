/**
 * NEXUS - Arguments For/Against Generator
 * 
 * Purpose: Generate detailed pros/cons for each paradigm
 * Based on: User's specific context (demographics, frequency, etc.)
 * Enhanced with: Real research citations from citations.ts
 */

import type { AssessmentAnswers, RecommendationResult } from '@/types/assessment';
import { getCitation, type Citation } from './citations';

export interface Argument {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  dataPoint?: string;
  citation?: Citation;
}

export interface ParadigmArguments {
  paradigm: string;
  paradigmKey: string;
  percentage: number;
  argumentsFor: Argument[];
  argumentsAgainst: Argument[];
}

/**
 * Generate arguments for Traditional Screen paradigm
 */
function generateTraditionalScreenArguments(
  answers: AssessmentAnswers,
  percentage: number
): ParadigmArguments {
  const argsFor: Argument[] = [];
  const argsAgainst: Argument[] = [];
  
  // ========== ARGUMENTS FOR ==========
  
  argsFor.push({
    title: 'Visual Confidence & Trust',
    description: 'Screens provide immediate visual feedback, allowing users to verify actions and data at a glance. Critical for complex workflows and data-heavy tasks.',
    impact: 'high',
    dataPoint: '87% of users report higher trust when they can see data visually',
    citation: getCitation('VISUAL_TRUST')
  });
  
  if (answers.errorConsequence === 'Serious') {
    argsFor.push({
      title: 'Quick Error Recovery',
      description: 'Visual interfaces enable immediate undo/redo, visual confirmation dialogs, and step-by-step correction. Essential when mistakes have consequences.',
      impact: 'high',
      dataPoint: 'Users recover from errors 3x faster with visual confirmation',
      citation: getCitation('ERROR_RECOVERY')
    });
  }
  
  argsFor.push({
    title: 'Zero Learning Curve',
    description: 'Users are already familiar with touch, mouse, and keyboard interactions. No training required for basic navigation.',
    impact: 'medium',
    dataPoint: 'Average adoption time: <1 hour vs 3-6 weeks for VR',
    citation: getCitation('ZERO_LEARNING_CURVE')
  });
  
  argsFor.push({
    title: 'Mature Accessibility Support',
    description: 'Screen readers (JAWS, NVDA, VoiceOver) have 20+ years of development. WCAG 2.1 Level AA compliance is well-documented.',
    impact: 'high',
    dataPoint: 'WCAG 2.1 Level AA achievable out-of-the-box',
    citation: getCitation('ACCESSIBILITY_MATURITY')
  });
  
  if (answers.taskComplexity === 'Complex') {
    argsFor.push({
      title: 'Multi-Window Workflows',
      description: 'Screens enable side-by-side comparison, reference materials open alongside work, and context switching.',
      impact: 'high',
      dataPoint: 'Multi-window workflows are standard in knowledge work contexts',
      citation: getCitation('CONTEXT_SWITCHING')
    });
  }
  
  // ========== ARGUMENTS AGAINST ==========
  
  argsAgainst.push({
    title: 'High Implementation Cost',
    description: 'Responsive design across mobile, tablet, desktop requires significant development. Each screen size needs optimization.',
    impact: 'high',
    dataPoint: '400-600 developer hours for professional UI',
    citation: getCitation('RESPONSIVE_COST')
  });
  
  argsAgainst.push({
    title: 'Screen Fatigue & Cognitive Load',
    description: 'Prolonged screen use leads to eye strain, headaches, and reduced focus. Users report fatigue after 2.5 hours of continuous use.',
    impact: 'medium',
    dataPoint: 'Average comfortable screen time: 2.5 hours before breaks needed',
    citation: getCitation('SCREEN_FATIGUE')
  });
  
  argsAgainst.push({
    title: 'Context Switching Overhead',
    description: 'Switching between screens and apps disrupts flow state. Knowledge workers lose focus and require time to regain concentration.',
    impact: 'medium',
    dataPoint: 'Average 23 minutes to regain focus after interruption',
    citation: getCitation('CONTEXT_SWITCHING')
  });
  
  argsAgainst.push({
    title: 'E-Waste & Energy Consumption',
    description: 'Screens require regular replacement (3-4 year cycle). Manufacturing and disposal generate significant environmental impact.',
    impact: 'low',
    dataPoint: 'Consumer electronics have 3-5 year lifecycles; end-of-life generates significant e-waste',
    citation: getCitation('IOT_ENERGY')
  });
  
  if (answers.contextOfUse === 'Mobile') {
    argsAgainst.push({
      title: 'Small Screen Limitations',
      description: 'Mobile screens limit information density. Complex data visualization requires zooming/panning, reducing efficiency.',
      impact: 'medium',
      dataPoint: 'Reduced screen real estate increases task difficulty for data-intensive workflows',
      citation: getCitation('SCREEN_FATIGUE')
    });
  }
  
  return {
    paradigm: 'Traditional Screen',
    paradigmKey: 'traditional_screen',
    percentage,
    argumentsFor: argsFor,
    argumentsAgainst: argsAgainst
  };
}

/**
 * Generate arguments for Invisible/Automation paradigm
 */
function generateInvisibleArguments(
  answers: AssessmentAnswers,
  percentage: number
): ParadigmArguments {
  const argsFor: Argument[] = [];
  const argsAgainst: Argument[] = [];
  
  // ========== ARGUMENTS FOR ==========
  
  argsFor.push({
    title: 'Massive Efficiency Gains',
    description: 'Automating routine tasks eliminates 40-60% of repetitive work. Users save 8+ minutes per day on predictable workflows.',
    impact: 'high',
    dataPoint: 'Automation saves 8-15 minutes per user per day on routine tasks',
    citation: getCitation('AUTOMATION_EFFICIENCY')
  });
  
  argsFor.push({
    title: 'Zero Friction Interaction',
    description: 'No UI means no clicks, no forms, no navigation. System anticipates needs and acts proactively.',
    impact: 'high',
    dataPoint: 'Background automation reduces cognitive load by 35%',
    citation: getCitation('AUTOMATION_EFFICIENCY')
  });
  
  if (answers.frequency === 'Multiple times daily') {
    argsFor.push({
      title: 'Perfect for High-Frequency Tasks',
      description: 'Tasks repeated multiple times daily benefit most from automation. One-time setup, infinite time savings.',
      impact: 'high',
      dataPoint: 'ROI breakeven after 2 weeks for daily tasks',
      citation: getCitation('AUTOMATION_ROI')
    });
  }
  
  argsFor.push({
    title: 'Low Energy Consumption',
    description: 'IoT sensors and edge devices consume 80-90% less energy than screens. Extended battery life, reduced cooling needs.',
    impact: 'medium',
    dataPoint: '10 kWh/year vs 50 kWh for screens (80% energy savings)',
    citation: getCitation('IOT_ENERGY')
  });
  
  // ========== ARGUMENTS AGAINST ==========
  
  argsAgainst.push({
    title: 'Black Box Effect - User Trust Gap',
    description: 'Users feel anxious when they cannot see what the system is doing. "Silent" automation reduces confidence, especially for critical tasks.',
    impact: 'high',
    dataPoint: '65% of users report anxiety with invisible processes',
    citation: getCitation('AUTOMATION_ANXIETY')
  });
  
  argsAgainst.push({
    title: 'Over-Automation Risk',
    description: 'If task predictability is <80%, automation becomes annoying rather than helpful. System makes wrong assumptions.',
    impact: 'high',
    dataPoint: 'Unexpected automation behavior is the leading cause of mode confusion and user frustration',
    citation: getCitation('AUTOMATION_ANXIETY')
  });
  
  if (answers.userDemographics.toLowerCase().includes('elderly') || 
      answers.userDemographics.toLowerCase().includes('non-tech') ||
      answers.userDemographics.toLowerCase().includes('beginner')) {
    argsAgainst.push({
      title: 'Low Tech Literacy Barrier',
      description: 'Non-technical users struggle to understand invisible systems. Lack of visual cues increases confusion and reduces adoption.',
      impact: 'high',
      dataPoint: 'Users with limited digital skills report higher confusion and abandonment with automated interfaces',
      citation: getCitation('AUTOMATION_ANXIETY')
    });
  }
  
  argsAgainst.push({
    title: 'GDPR Compliance Complexity',
    description: 'EU regulations require "Right to Explanation" for automated decisions. Must build audit logging and explanation UI.',
    impact: 'medium',
    dataPoint: 'Automated decision-making systems require audit logging and explanation UI under GDPR Article 22',
    citation: getCitation('EU_AI_ACT')
  });
  
  return {
    paradigm: 'Invisible',
    paradigmKey: 'invisible',
    percentage,
    argumentsFor: argsFor,
    argumentsAgainst: argsAgainst
  };
}

/**
 * Generate arguments for AI Vectorial paradigm
 */
function generateAIVectorialArguments(
  answers: AssessmentAnswers,
  percentage: number
): ParadigmArguments {
  const argsFor: Argument[] = [];
  const argsAgainst: Argument[] = [];
  
  argsFor.push({
    title: 'Natural Language Interaction',
    description: 'Users can search, create, and manipulate content using plain language. No need to learn complex query syntax or navigation.',
    impact: 'high',
    dataPoint: 'Task completion 2.5x faster with natural language vs traditional search',
    citation: getCitation('NLP_TASK_SPEED')
  });
  
  argsFor.push({
    title: 'Adaptive Learning',
    description: 'AI models improve with use, learning user preferences and patterns. Recommendations become more relevant over time.',
    impact: 'medium',
    dataPoint: 'Accuracy improves 15-20% after 30 days of user interaction',
    citation: getCitation('AI_ADAPTIVE_LEARNING')
  });
  
  argsFor.push({
    title: 'Content Generation at Scale',
    description: 'Generate summaries, reports, code, designs in seconds. Amplifies user productivity for creative and analytical work.',
    impact: 'high',
    dataPoint: 'Developers using AI assistants write 55% more code',
    citation: getCitation('LLM_PRODUCTIVITY')
  });
  
  argsAgainst.push({
    title: 'Hallucination & Accuracy Risk',
    description: 'AI models confidently generate incorrect information. Users cannot always distinguish accurate from hallucinated content.',
    impact: 'high',
    dataPoint: 'GPT-4 hallucination rate: 3-8% depending on domain',
    citation: getCitation('AI_HALLUCINATION')
  });
  
  argsAgainst.push({
    title: 'High Compute Cost',
    description: 'Cloud GPU inference costs scale with usage. At scale, costs escalate quickly for high-usage applications.',
    impact: 'high',
    dataPoint: 'Cloud inference costs scale directly with usage volume and model complexity',
    citation: getCitation('AI_HALLUCINATION')
  });
  
  argsAgainst.push({
    title: 'Data Privacy Concerns',
    description: 'Sending user data to third-party AI providers raises privacy issues. EU data sovereignty requires careful architecture.',
    impact: 'high',
    dataPoint: 'EU data sovereignty requirements restrict cross-border AI data transfers under GDPR Chapter V',
    citation: getCitation('EU_AI_ACT')
  });
  
  if (answers.geography === 'Primarily Europe' || answers.geography === 'Global') {
    argsAgainst.push({
      title: 'EU AI Act High-Risk Classification',
      description: 'AI systems in healthcare, critical infrastructure, or employment may be classified as "High-Risk," requiring CE marking and audits.',
      impact: 'high',
      citation: getCitation('EU_AI_ACT')
    });
  }
  
  return {
    paradigm: 'AI Vectorial',
    paradigmKey: 'ai_vectorial',
    percentage,
    argumentsFor: argsFor,
    argumentsAgainst: argsAgainst
  };
}

/**
 * Generate arguments for Spatial (AR/VR) paradigm
 */
function generateSpatialArguments(
  answers: AssessmentAnswers,
  percentage: number
): ParadigmArguments {
  const argsFor: Argument[] = [];
  const argsAgainst: Argument[] = [];
  
  argsFor.push({
    title: 'Immersive Spatial Context',
    description: '3D visualization enables natural spatial reasoning. Perfect for architecture, design, medical imaging, and training simulations.',
    impact: 'high',
    dataPoint: 'Spatial training retention: 90% vs 60% for video-based training',
    citation: getCitation('SPATIAL_TRAINING')
  });
  
  argsFor.push({
    title: 'Hands-Free Interaction (AR)',
    description: 'AR overlays free up hands for manual work. Mechanics, surgeons, and field technicians can see instructions while working.',
    impact: 'high',
    dataPoint: 'Repair time reduced by 30-40% with AR guidance',
    citation: getCitation('AR_BOEING_STUDY')
  });
  
  if (answers.explorationMode === 'Explore options') {
    argsFor.push({
      title: 'Natural Exploration',
      description: 'VR enables intuitive 360° exploration. Users can walk through spaces, examine objects from all angles.',
      impact: 'medium',
      dataPoint: 'Spatial environments enable embodied exploration not possible in flat interfaces',
      citation: getCitation('SPATIAL_TRAINING')
    });
  }
  
  argsAgainst.push({
    title: 'User Demographics Mismatch',
    description: 'Elderly users have 78% rejection rate for VR headsets. Motion sickness, complexity, and health concerns limit adoption.',
    impact: 'high',
    dataPoint: '78% rejection rate among users 60+',
    citation: getCitation('VR_ELDERLY_REJECTION')
  });
  
  argsAgainst.push({
    title: 'Extreme Hardware Cost',
    description: 'Enterprise VR: $2,500-8,000 per seat (headset + GPU workstation). Consumer: $500-3,500. Ongoing maintenance and replacement.',
    impact: 'high',
    citation: getCitation('VR_HARDWARE_COST')
  });
  
  argsAgainst.push({
    title: 'Health & Safety Concerns',
    description: 'Prolonged VR use (>30 minutes) causes eye strain, nausea, and dizziness in 40% of users over 50.',
    impact: 'high',
    dataPoint: '40% of users 50+ experience VR sickness within 30 minutes',
    citation: getCitation('VR_SICKNESS')
  });
  
  argsAgainst.push({
    title: 'Social Acceptance Barrier',
    description: 'VR headsets isolate users, making them unsuitable for office environments or public spaces. AR glasses face "Google Glass effect."',
    impact: 'medium',
    dataPoint: 'Head-mounted displays face significant social stigma in shared and public environments',
    citation: getCitation('VR_ELDERLY_REJECTION')
  });
  
  argsAgainst.push({
    title: 'Massive Environmental Impact',
    description: 'VR headsets consume significantly more energy than screens and have shorter replacement cycles. Manufacturing requires rare earth materials.',
    impact: 'medium',
    dataPoint: 'VR headsets consume significantly more energy than screens and have shorter replacement cycles',
    citation: getCitation('IOT_ENERGY')
  });
  
  return {
    paradigm: 'Spatial',
    paradigmKey: 'spatial',
    percentage,
    argumentsFor: argsFor,
    argumentsAgainst: argsAgainst
  };
}

/**
 * Generate arguments for Voice paradigm
 */
function generateVoiceArguments(
  answers: AssessmentAnswers,
  percentage: number
): ParadigmArguments {
  const argsFor: Argument[] = [];
  const argsAgainst: Argument[] = [];
  
  argsFor.push({
    title: 'Hands-Free Convenience',
    description: 'Voice enables interaction while cooking, driving, exercising, or when hands are occupied. Zero physical interaction required.',
    impact: 'high',
    dataPoint: '55% of users prefer voice for quick tasks when hands are busy',
    citation: getCitation('VOICE_SPEED')
  });
  
  argsFor.push({
    title: 'Critical for Accessibility',
    description: 'Voice interfaces are essential for blind and visually impaired users. Also benefits users with motor impairments.',
    impact: 'high',
    dataPoint: 'Voice is primary interface for 2.2 billion visually impaired globally',
    citation: getCitation('VOICE_ACCESSIBILITY')
  });
  
  argsFor.push({
    title: 'Fast for Simple Commands',
    description: '"Turn on lights," "Set timer 5 minutes," "Call Mom" — faster than navigating UI. Average command: 2 seconds vs 15 seconds touch.',
    impact: 'medium',
    dataPoint: 'Voice commands 7x faster than touch for simple actions',
    citation: getCitation('VOICE_SPEED')
  });
  
  argsAgainst.push({
    title: 'Privacy Concerns',
    description: 'Always-listening microphones raise privacy issues. Users fear conversations being recorded or shared without consent.',
    impact: 'high',
    dataPoint: '67% of users worried about voice assistants recording private conversations',
    citation: getCitation('VOICE_PRIVACY')
  });
  
  argsAgainst.push({
    title: 'Accuracy Degradation',
    description: 'Voice recognition accuracy drops with accents, background noise, and specialized terminology. Error rate increases to 20-30% in noisy environments.',
    impact: 'high',
    dataPoint: 'Accuracy: 95% in quiet vs 70% in noisy environments',
    citation: getCitation('VOICE_ACCURACY')
  });
  
  argsAgainst.push({
    title: 'Socially Awkward in Public',
    description: 'Users avoid voice commands in offices, public transport, or quiet spaces. "Talking to your phone" stigma persists.',
    impact: 'medium',
    dataPoint: 'Social norms and privacy expectations significantly limit voice interface adoption in public contexts',
    citation: getCitation('VOICE_PRIVACY')
  });
  
  if (answers.taskComplexity === 'Complex') {
    argsAgainst.push({
      title: 'Unsuitable for Complex Tasks',
      description: 'Voice is slow for multi-step workflows, data entry, or precise editing. Users resort to screen for anything complex.',
      impact: 'high',
      dataPoint: 'Voice is optimized for short, discrete commands; multi-step workflows cause high abandonment',
      citation: getCitation('VOICE_ACCURACY')
    });
  }
  
  return {
    paradigm: 'Voice',
    paradigmKey: 'voice',
    percentage,
    argumentsFor: argsFor,
    argumentsAgainst: argsAgainst
  };
}

/**
 * Main function: Generate all arguments
 */
export function generateAllArguments(
  answers: AssessmentAnswers,
  recommendation: RecommendationResult
): ParadigmArguments[] {
  const paradigmArgs: ParadigmArguments[] = [];
  
  if (recommendation.allScores.traditional_screen > 0) {
    paradigmArgs.push(generateTraditionalScreenArguments(
      answers,
      recommendation.allScores.traditional_screen
    ));
  }
  
  if (recommendation.allScores.invisible > 0) {
    paradigmArgs.push(generateInvisibleArguments(
      answers,
      recommendation.allScores.invisible
    ));
  }
  
  if (recommendation.allScores.ai_vectorial > 0) {
    paradigmArgs.push(generateAIVectorialArguments(
      answers,
      recommendation.allScores.ai_vectorial
    ));
  }
  
  if (recommendation.allScores.spatial > 0) {
    paradigmArgs.push(generateSpatialArguments(
      answers,
      recommendation.allScores.spatial
    ));
  }
  
  if (recommendation.allScores.voice > 0) {
    paradigmArgs.push(generateVoiceArguments(
      answers,
      recommendation.allScores.voice
    ));
  }
  
  // Sort by percentage (highest first)
  return paradigmArgs.sort((a, b) => b.percentage - a.percentage);
}
