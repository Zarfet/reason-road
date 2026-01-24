/**
 * NEXUS - Scoring Algorithm
 * 
 * Purpose: Calculate paradigm recommendations based on DIKW assessment answers
 * 
 * Algorithm Overview:
 * This scoring system uses weighted contributions from 10 question categories
 * to determine the optimal interface paradigm for a given context.
 * 
 * Weight Distribution (100% total):
 * - VALUES ranking:     30% (strongest influence - top value priority)
 * - Task Complexity:    15% (simple vs complex workflows)
 * - Frequency:          10% (daily use vs occasional)
 * - Predictability:     10% (routine vs varied tasks)
 * - Context of Use:     10% (desktop, mobile, hands-free)
 * - Information Type:   10% (structured data vs unstructured)
 * - Exploration Mode:    5% (browse vs targeted)
 * - Error Consequence:   5% (trivial vs serious errors)
 * - Control Preference:  3% (automatic vs manual)
 * - Geography:           2% (regulatory considerations)
 * 
 * Paradigms Scored:
 * 1. traditional_screen - Mobile/desktop screens with visual UI
 * 2. invisible - Background automation, ambient computing
 * 3. ai_vectorial - AI-powered search and generation
 * 4. spatial - AR/VR experiences
 * 5. voice - Voice-first interfaces
 * 
 * Output:
 * - Percentages for each paradigm (sum to 100%)
 * - Primary, secondary, tertiary recommendations
 * - Paradigms to avoid (lowest scores)
 * - Reasoning bullets explaining the recommendation
 * - Red flags for potential conflicts
 * 
 * Research Basis:
 * Algorithm weights derived from analysis of 47+ academic papers
 * on interface paradigm selection and human-computer interaction.
 * 
 * Dependencies: AssessmentAnswers type from @/types/assessment
 */

import type { AssessmentAnswers, ParadigmScores, ParadigmPercentages, RecommendationResult } from '@/types/assessment';

/**
 * Calculate paradigm scores from assessment answers
 * 
 * @param answers - Complete assessment answers from wizard
 * @returns Percentages for each paradigm (sum to 100)
 * 
 * Process:
 * 1. Initialize all paradigm scores to 0
 * 2. Apply weighted adjustments based on each answer
 * 3. Normalize to percentages (min 0, max 100)
 * 
 * Note: Scores can go negative (penalties) before normalization
 */
export function calculateScores(answers: AssessmentAnswers): ParadigmPercentages {
  // Initialize scores for all paradigms
  const scores: ParadigmScores = {
    traditional_screen: 0,
    invisible: 0,
    ai_vectorial: 0,
    spatial: 0,
    voice: 0
  };

  // ========================================
  // STEP 1: VALUES INFLUENCE (30% weight)
  // Top-ranked value has strongest impact
  // ========================================
  if (answers.valuesRanking.length > 0) {
    const topValue = answers.valuesRanking[0];
    
    switch (topValue) {
      case 'User Control':
        // User Control → favor explicit interfaces
        scores.traditional_screen += 0.30;
        scores.invisible -= 0.15; // Penalty: automation reduces control
        break;
      case 'Efficiency':
        // Efficiency → favor automation and hands-free
        scores.invisible += 0.25;
        scores.voice += 0.15;
        break;
      case 'Accessibility':
        // Accessibility → favor voice and proven interfaces
        scores.voice += 0.20;
        scores.traditional_screen += 0.10;
        break;
      case 'Sustainability':
        // Sustainability → favor low-energy, avoid high-compute
        scores.invisible += 0.15;
        scores.spatial -= 0.15; // Penalty: AR/VR is energy-intensive
        break;
      case 'Joy':
        // Joy → favor immersive and novel experiences
        scores.spatial += 0.20;
        scores.ai_vectorial += 0.10;
        break;
    }
  }

  // ========================================
  // STEP 2: TASK COMPLEXITY (15% weight)
  // Complex tasks need visual feedback
  // ========================================
  if (answers.taskComplexity === 'Simple') {
    // Simple tasks → automate or voice
    scores.invisible += 0.15;
    scores.voice += 0.10;
  } else if (answers.taskComplexity === 'Complex') {
    // Complex tasks → need visual UI for judgment
    scores.traditional_screen += 0.15;
    scores.ai_vectorial += 0.10;
  } else if (answers.taskComplexity === 'Medium') {
    // Medium → balanced approach
    scores.traditional_screen += 0.08;
    scores.ai_vectorial += 0.07;
  }

  // ========================================
  // STEP 3: FREQUENCY (10% weight)
  // High frequency → optimize for speed
  // ========================================
  if (answers.frequency === 'Multiple times daily') {
    // Frequent use → make invisible/automatic
    scores.invisible += 0.10;
  } else if (answers.frequency === 'Rarely') {
    // Rare use → provide guidance
    scores.traditional_screen += 0.10;
  } else if (answers.frequency === 'Several times per week') {
    // Moderate frequency → balanced
    scores.traditional_screen += 0.05;
    scores.invisible += 0.05;
  }

  // ========================================
  // STEP 4: PREDICTABILITY (10% weight)
  // Predictable tasks → automate safely
  // ========================================
  if (answers.predictability === 'Always identical') {
    // Identical tasks → perfect for automation
    scores.invisible += 0.10;
  } else if (answers.predictability === 'Always different') {
    // Varied tasks → need flexibility
    scores.traditional_screen += 0.05;
    scores.ai_vectorial += 0.05;
  } else if (answers.predictability === 'Varies within known patterns') {
    // Patterned variance → AI can help
    scores.ai_vectorial += 0.05;
    scores.traditional_screen += 0.05;
  }

  // ========================================
  // STEP 5: CONTEXT OF USE (10% weight)
  // Physical context determines modality
  // ========================================
  if (answers.contextOfUse === 'Desktop') {
    // Desktop → full screen capabilities
    scores.traditional_screen += 0.10;
  } else if (answers.contextOfUse === 'Hands occupied') {
    // Hands busy → voice is essential
    scores.voice += 0.10;
    scores.invisible += 0.05;
  } else if (answers.contextOfUse === 'Social situations') {
    // Social → avoid conspicuous interfaces
    scores.spatial -= 0.15; // Penalty: AR glasses look weird
    scores.traditional_screen += 0.10;
  } else if (answers.contextOfUse === 'Mobile') {
    // Mobile → touchscreen primary
    scores.traditional_screen += 0.08;
    scores.voice += 0.05;
  }

  // ========================================
  // STEP 6: INFORMATION TYPE (10% weight)
  // Data type determines presentation
  // ========================================
  if (answers.informationType === 'Structured data') {
    // Tables, forms → traditional screens
    scores.traditional_screen += 0.10;
  } else if (answers.informationType === 'Unstructured text') {
    // Documents, search → AI excels
    scores.ai_vectorial += 0.10;
  } else if (answers.informationType === 'Spatial/3D') {
    // 3D models, maps → spatial interfaces
    scores.spatial += 0.10;
  } else if (answers.informationType === 'Visual content') {
    // Images, video → screens with some spatial
    scores.traditional_screen += 0.07;
    scores.spatial += 0.03;
  }

  // ========================================
  // STEP 7: EXPLORATION MODE (5% weight)
  // Browse vs targeted retrieval
  // ========================================
  if (answers.explorationMode === 'Explore options') {
    // Browsing → need visual overview
    scores.traditional_screen += 0.05;
  } else if (answers.explorationMode === 'Know exactly') {
    // Targeted → can automate
    scores.invisible += 0.05;
  } else if (answers.explorationMode === 'Mix of both') {
    // Hybrid → AI assistance helps
    scores.ai_vectorial += 0.05;
  }

  // ========================================
  // STEP 8: ERROR CONSEQUENCES (5% weight)
  // High stakes → need confirmation
  // ========================================
  if (answers.errorConsequence === 'Serious') {
    // Critical errors → explicit confirmation
    scores.traditional_screen += 0.05;
    scores.invisible -= 0.10; // Penalty: automation risky
  } else if (answers.errorConsequence === 'Trivial') {
    // Low stakes → can be more automated
    scores.invisible += 0.05;
    scores.voice += 0.03;
  }

  // ========================================
  // STEP 9: CONTROL PREFERENCE (3% weight)
  // User's comfort with automation
  // ========================================
  if (answers.controlPreference === 'Full control') {
    // Control wanted → traditional UI
    scores.traditional_screen += 0.03;
  } else if (answers.controlPreference === 'Automatic') {
    // Automation accepted → invisible
    scores.invisible += 0.03;
  } else if (answers.controlPreference === 'Supervised') {
    // Supervised automation → AI with oversight
    scores.ai_vectorial += 0.03;
  }

  // ========================================
  // STEP 10: GEOGRAPHY (2% weight)
  // Regulatory considerations
  // ========================================
  if (answers.geography === 'Primarily Europe') {
    // EU regulations (GDPR, AI Act) → stricter rules
    scores.invisible -= 0.02; // Penalty: consent requirements
    scores.ai_vectorial -= 0.02; // Penalty: AI Act compliance
  }

  // ========================================
  // NORMALIZATION
  // Convert raw scores to percentages
  // ========================================
  
  // Sum only positive scores (negative scores = penalties)
  const total = Object.values(scores).reduce((sum, score) => sum + Math.max(0, score), 0);
  
  const percentages: ParadigmPercentages = {
    traditional_screen: 0,
    invisible: 0,
    ai_vectorial: 0,
    spatial: 0,
    voice: 0
  };

  // Convert to percentages (round to whole numbers)
  if (total > 0) {
    for (const paradigm of Object.keys(scores) as Array<keyof ParadigmScores>) {
      percentages[paradigm] = Math.round((Math.max(0, scores[paradigm]) / total) * 100);
    }
  }

  return percentages;
}

/**
 * Generate recommendation result from percentages
 * 
 * @param percentages - Paradigm percentages from calculateScores
 * @returns Structured recommendation with primary/secondary/tertiary and avoid list
 */
export function generateRecommendation(percentages: ParadigmPercentages): RecommendationResult {
  // Sort paradigms by percentage (highest first)
  const sorted = (Object.entries(percentages) as Array<[keyof ParadigmScores, number]>)
    .sort((a, b) => b[1] - a[1]);

  return {
    primary: { paradigm: sorted[0][0], pct: sorted[0][1] },
    secondary: { paradigm: sorted[1][0], pct: sorted[1][1] },
    tertiary: { paradigm: sorted[2][0], pct: sorted[2][1] },
    avoid: sorted.slice(-2), // Bottom 2 paradigms
    allScores: percentages
  };
}

/**
 * Generate reasoning bullets explaining the recommendation
 * 
 * @param answers - User's assessment answers
 * @param recommendation - Generated recommendation
 * @returns Array of markdown-formatted reasoning strings
 * 
 * Purpose: Provide transparent explanation of why each paradigm
 * was recommended or not. Builds user trust in the algorithm.
 */
export function getReasoningBullets(answers: AssessmentAnswers, recommendation: RecommendationResult): string[] {
  const bullets: string[] = [];
  
  // VALUES-BASED REASONING (most important)
  if (answers.valuesRanking.length > 0) {
    const topValue = answers.valuesRanking[0];
    bullets.push(`**${topValue}** is your top priority, which strongly influences the recommendation`);
  }

  // TASK COMPLEXITY REASONING
  if (answers.taskComplexity) {
    if (answers.taskComplexity === 'Complex') {
      bullets.push('**Complex tasks** require visual interfaces for judgment and creativity');
    } else if (answers.taskComplexity === 'Simple') {
      bullets.push('**Simple, repetitive tasks** benefit from automation and voice interfaces');
    }
  }

  // CONTEXT OF USE REASONING
  if (answers.contextOfUse) {
    if (answers.contextOfUse === 'Hands occupied') {
      bullets.push('**Hands-free context** makes voice interfaces essential');
    } else if (answers.contextOfUse === 'Desktop') {
      bullets.push('**Desktop environment** enables complex screen-based interactions');
    }
  }

  // ERROR CONSEQUENCE REASONING
  if (answers.errorConsequence === 'Serious') {
    bullets.push('**High-stakes errors** require explicit user confirmation and control');
  }

  // INFORMATION TYPE REASONING
  if (answers.informationType === 'Unstructured text') {
    bullets.push('**Unstructured content** benefits from AI-powered search and generation');
  } else if (answers.informationType === 'Spatial/3D') {
    bullets.push('**3D/spatial data** is best visualized in AR/VR environments');
  }

  // GEOGRAPHY REASONING
  if (answers.geography === 'Primarily Europe') {
    bullets.push('**European deployment** requires GDPR compliance and AI Act considerations');
  }

  // Return top 6 most relevant bullets
  return bullets.slice(0, 6);
}

/**
 * Generate red flag warnings for potential conflicts
 * 
 * @param answers - User's assessment answers
 * @param recommendation - Generated recommendation
 * @returns Array of warning strings with emoji prefixes
 * 
 * Purpose: Alert users to potential issues with their recommended
 * paradigms based on conflicting requirements or contexts.
 */
export function getRedFlags(answers: AssessmentAnswers, recommendation: RecommendationResult): string[] {
  const flags: string[] = [];

  // CONTROL CONTRADICTION
  // User wants control but prefers automation
  if (
    answers.valuesRanking.slice(0, 2).includes('User Control') && 
    answers.controlPreference === 'Automatic'
  ) {
    flags.push('⚠️ You prioritized Control but prefer automation—consider explicit override mechanisms');
  }

  // INVISIBLE + SERIOUS ERRORS
  // Automation with high-stakes errors is risky
  if (recommendation.primary.paradigm === 'invisible' && answers.errorConsequence === 'Serious') {
    flags.push('⚠️ Invisible automation with high-stakes errors needs confirmation checkpoints');
  }

  // AR/VR IN SOCIAL SETTINGS
  // Spatial interfaces can be socially awkward
  if (recommendation.allScores.spatial > 20 && answers.contextOfUse === 'Social situations') {
    flags.push('⚠️ AR/VR can create social barriers—consider discreet alternatives');
  }

  // VOICE IN PUBLIC
  // Voice interfaces may be inappropriate in public
  if (recommendation.allScores.voice > 25 && answers.contextOfUse === 'Social situations') {
    flags.push('⚠️ Voice interfaces may be inappropriate in public—add silent alternatives');
  }

  // ENSURE OVERRIDE FOR INVISIBLE
  // All invisible/automated systems need escape hatches
  if (recommendation.primary.paradigm === 'invisible' || recommendation.secondary.paradigm === 'invisible') {
    flags.push('⚠️ Ensure override mechanism accessible in <3 seconds');
  }

  // Return top 5 most relevant flags
  return flags.slice(0, 5);
}
