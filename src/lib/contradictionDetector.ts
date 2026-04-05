/**
 * NEXUS - Contradiction Detection System
 * 
 * Purpose: Identify logical contradictions between user answers
 * 
 * Detection Points:
 * 1. Real-time (during answer entry)
 * 2. Review step (before submission)
 * 
 * Contradiction Types:
 * - Value vs Preference (User Control #1 + Automatic)
 * - Complexity vs Frequency (Simple + Occasional = contradiction)
 * - Demographics vs Capability (Elderly + VR recommendation)
 * - Context vs Capability (Hands-free + Screen-heavy)
 */

import type { AssessmentAnswers } from '@/types/assessment';

export interface Contradiction {
  id: string;
  severity: 'warning' | 'error';
  category: 'value-preference' | 'context-mismatch' | 'capability-limitation' | 'logic';
  title: string;
  description: string;
  affectedSteps: number[];      // Which wizard steps to highlight
  suggestion: string;           // How to resolve
}

export interface ContradictionReport {
  hasContradictions: boolean;
  errorCount: number;           // Blocking contradictions
  warningCount: number;         // Non-blocking contradictions
  contradictions: Contradiction[];
}

/**
 * Detect all contradictions in current answers
 */
export function detectContradictions(answers: AssessmentAnswers): ContradictionReport {
  const contradictions: Contradiction[] = [];
  
  // =============================================
  // VALUE vs PREFERENCE CONTRADICTIONS
  // =============================================
  
  // User Control #1 but Automatic preference
  if (answers.valuesRanking[0] === 'User Control' && 
      answers.controlPreference === 'Automatic') {
    contradictions.push({
      id: 'value-control-vs-automatic',
      severity: 'warning',
      category: 'value-preference',
      title: 'User Control vs Automatic Preference',
      description: 'You ranked "User Control" as your #1 value, but selected "Automatic" for control preference. These choices conflict.',
      affectedSteps: [1, 9],
      suggestion: 'Either change User Control to lower priority, or select "Supervised" or "Full control" preference.'
    });
  }
  
  // Efficiency #1 but Full control preference
  if (answers.valuesRanking[0] === 'Efficiency' && 
      answers.controlPreference === 'Full control') {
    contradictions.push({
      id: 'value-efficiency-vs-manual',
      severity: 'warning',
      category: 'value-preference',
      title: 'Efficiency vs Full Control Preference',
      description: 'Efficiency is your top priority, but "Full control" preference reduces automation opportunities.',
      affectedSteps: [1, 9],
      suggestion: 'Consider "Supervised" automation to balance efficiency with control.'
    });
  }
  
  // =============================================
  // COMPLEXITY vs FREQUENCY CONTRADICTIONS
  // =============================================
  
  // Simple task but low frequency = not worth building
  if (answers.taskComplexity === 'Simple' && 
      answers.frequency === 'Occasionally') {
    contradictions.push({
      id: 'simple-infrequent',
      severity: 'warning',
      category: 'logic',
      title: 'Simple + Infrequent Task',
      description: 'Building a dedicated interface for a simple, infrequent task may not be cost-effective.',
      affectedSteps: [2, 3],
      suggestion: 'Consider if a generic tool (spreadsheet, email) is sufficient, or if this task will increase in frequency.'
    });
  }
  
  // Complex task but fully automatic = dangerous
  if (answers.taskComplexity === 'Complex' && 
      answers.controlPreference === 'Automatic') {
    contradictions.push({
      id: 'complex-automatic',
      severity: 'error',
      category: 'logic',
      title: 'Complex Task with Full Automation',
      description: 'Complex tasks require human judgment. Full automation is risky for multi-step, nuanced workflows.',
      affectedSteps: [2, 9],
      suggestion: 'Change to "Supervised" automation where system assists but human makes final decisions.'
    });
  }
  
  // =============================================
  // CONTEXT CONTRADICTIONS
  // =============================================
  
  // Hands-free context but complex task
  if (answers.contextOfUse === 'Hands occupied' && 
      answers.taskComplexity === 'Complex') {
    contradictions.push({
      id: 'handsfree-complex',
      severity: 'warning',
      category: 'context-mismatch',
      title: 'Hands-Free Context with Complex Task',
      description: 'Complex tasks are difficult to complete hands-free. Voice interfaces struggle with multi-step workflows.',
      affectedSteps: [2, 5],
      suggestion: 'Simplify the task, or allow users to switch to screen when detailed work is needed.'
    });
  }
  
  // Mobile context but serious errors
  if (answers.contextOfUse === 'Mobile' && 
      answers.errorConsequence === 'Serious') {
    contradictions.push({
      id: 'mobile-serious-errors',
      severity: 'error',
      category: 'context-mismatch',
      title: 'Mobile Context with Serious Error Consequences',
      description: 'Mobile interfaces have higher error rates (small screens, interruptions). Serious consequences require desktop precision.',
      affectedSteps: [5, 8],
      suggestion: 'Restrict critical operations to desktop/tablet, or add confirmation steps on mobile.'
    });
  }
  
  // =============================================
  // PREDICTABILITY CONTRADICTIONS
  // =============================================
  
  // Unpredictable but automatic = bad automation
  if (answers.predictability === 'Always different' && 
      answers.controlPreference === 'Automatic') {
    contradictions.push({
      id: 'unpredictable-automatic',
      severity: 'error',
      category: 'capability-limitation',
      title: 'Unpredictable Tasks Cannot Be Automated',
      description: 'Tasks that are "always different" cannot be reliably automated. Automation will make frequent mistakes.',
      affectedSteps: [4, 9],
      suggestion: 'Change control to "Full control" or "Supervised". Only automate if predictability improves.'
    });
  }
  
  // =============================================
  // INFORMATION TYPE CONTRADICTIONS
  // =============================================
  
  // Structured data but exploration mode
  if (answers.informationType === 'Structured data' && 
      answers.explorationMode === 'Explore options') {
    contradictions.push({
      id: 'structured-exploration',
      severity: 'warning',
      category: 'logic',
      title: 'Structured Data with Exploration Mode',
      description: 'Structured data (databases, tables) is optimized for targeted retrieval, not open-ended exploration.',
      affectedSteps: [6, 7],
      suggestion: 'Structured data benefits from precise queries. Consider if users truly need exploration, or if search/filter is sufficient.'
    });
  }
  
  // =============================================
  // ERROR CONSEQUENCE CONTRADICTIONS
  // =============================================
  
  // Serious errors but no control
  if (answers.errorConsequence === 'Serious' && 
      answers.controlPreference === 'Automatic') {
    contradictions.push({
      id: 'serious-errors-automatic',
      severity: 'error',
      category: 'logic',
      title: 'CRITICAL: Serious Errors + Full Automation',
      description: 'Serious or irreversible consequences REQUIRE human oversight. Full automatic mode is unacceptable.',
      affectedSteps: [8, 9],
      suggestion: 'REQUIRED: Change to "Supervised" automation with human approval before irreversible actions.'
    });
  }
  
  // =============================================
  // DEMOGRAPHICS-BASED CONTRADICTIONS
  // =============================================
  
  // Elderly + Automation
  const isElderly = answers.userDemographics.toLowerCase().includes('elderly') ||
                    answers.userDemographics.toLowerCase().includes('senior') ||
                    answers.userDemographics.toLowerCase().includes('60') ||
                    answers.userDemographics.toLowerCase().includes('70');
  
  if (isElderly && answers.controlPreference === 'Automatic') {
    contradictions.push({
      id: 'elderly-automatic',
      severity: 'warning',
      category: 'context-mismatch',
      title: 'Elderly Users + Automatic Control',
      description: 'Elderly users often distrust automation ("I want to see what\'s happening"). Invisible processes create anxiety.',
      affectedSteps: [0, 9],
      suggestion: 'Use "Supervised" automation with clear visual feedback and easy manual override.'
    });
  }
  
  // Non-technical users + Unstructured data
  const isNonTechnical = answers.userDemographics.toLowerCase().includes('non-tech') ||
                         answers.userDemographics.toLowerCase().includes('low literacy') ||
                         answers.userDemographics.toLowerCase().includes('beginner') ||
                         answers.userDemographics.toLowerCase().includes('not familiar');
  
  if (isNonTechnical && answers.informationType === 'Unstructured text') {
    contradictions.push({
      id: 'nontechnical-unstructured',
      severity: 'warning',
      category: 'capability-limitation',
      title: 'Non-Technical Users + Unstructured Data',
      description: 'Unstructured data (documents, text) requires search/analysis skills. Non-technical users may struggle without guidance.',
      affectedSteps: [0, 6],
      suggestion: 'Provide strong search filters, suggested queries, and examples to help users navigate unstructured data.'
    });
  }
  
  // =============================================
  // INTERACTION INITIATION CONTRADICTIONS
  // =============================================
  
  // Proactive system + Serious errors = dangerous automation
  if (answers.interactionInitiation === 'System-initiated: proactively interrupts or assists without being asked' &&
      answers.errorConsequence === 'Serious') {
    contradictions.push({
      id: 'proactive-serious-errors',
      severity: 'error',
      category: 'logic',
      title: 'Proactive Automation + Serious Error Consequences',
      description: 'System initiates actions without user request AND errors have serious consequences. Unsolicited automation in high-stakes contexts is unacceptable.',
      affectedSteps: [12, 8],
      suggestion: 'Change to user-initiated only, OR reduce error consequence scope for automated actions.'
    });
  }

  // Proactive system + Full control = contradiction
  if (answers.interactionInitiation === 'System-initiated: proactively interrupts or assists without being asked' &&
      answers.controlPreference === 'Full control') {
    contradictions.push({
      id: 'proactive-full-control',
      severity: 'warning',
      category: 'value-preference',
      title: 'Proactive System vs Full Control Preference',
      description: 'System is designed to interrupt proactively, but users need full manual control. These are incompatible interaction models.',
      affectedSteps: [12, 9],
      suggestion: 'Choose one: either system stays silent until asked (user-initiated), or users accept guided automation (Supervised).'
    });
  }

  // =============================================
  // CALCULATE SUMMARY
  // =============================================
  
  const errorCount = contradictions.filter(c => c.severity === 'error').length;
  const warningCount = contradictions.filter(c => c.severity === 'warning').length;
  
  return {
    hasContradictions: contradictions.length > 0,
    errorCount,
    warningCount,
    contradictions
  };
}

/**
 * Detect contradictions for a specific step
 * (Used for real-time validation during wizard)
 */
export function detectContradictionsForStep(
  stepNumber: number,
  answers: AssessmentAnswers
): Contradiction[] {
  const allContradictions = detectContradictions(answers);
  
  return allContradictions.contradictions.filter(c => 
    c.affectedSteps.includes(stepNumber)
  );
}
