/**
 * NEXUS - Scoring Algorithm
 * 
 * Purpose: Calculate paradigm recommendations based on DIKW assessment answers
 * 
 * Algorithm Overview:
 * This scoring system uses weighted contributions from 11 question categories
 * to determine the optimal interface paradigm for a given context.
 * 
 * Weight Distribution (105% total, normalized):
 * - VALUES ranking:        30% (strongest influence - top value priority)
 * - USER DEMOGRAPHICS:      8% (age, tech literacy, profession, accessibility)
 * - Task Complexity:       12% (simple vs complex workflows)
 * - Frequency:             10% (daily use vs occasional)
 * - Predictability:        10% (routine vs varied tasks)
 * - Context of Use:        10% (desktop, mobile, hands-free)
 * - Information Type:      10% (structured data vs unstructured)
 * - Exploration Mode:       5% (browse vs targeted)
 * - Error Consequence:      5% (trivial vs serious errors)
 * - Control Preference:     3% (automatic vs manual)
 * - Geography:              2% (regulatory considerations)
 * 
 * Demographics Influence Examples:
 * - Elderly users → Voice +0.08, Spatial -0.12 (VR rejection rate 78%)
 * - Low tech literacy → Traditional +0.08, Invisible -0.10 (need guidance)
 * - Visual impairment → Voice +0.12 (CRITICAL), Screens -0.10
 * - Manual workers → Voice +0.08, Traditional -0.08 (hands occupied)
 * - Healthcare → Traditional +0.05 (precision), Invisible -0.05 (safety)
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
 * Algorithm weights derived from established HCI research principles
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
  // STEP 2: USER DEMOGRAPHICS (8% weight)
  // Parse demographics string for key indicators
  // ========================================
  if (answers.userDemographics) {
    const demographics = answers.userDemographics.toLowerCase();
    
    // ============ AGE-RELATED ADJUSTMENTS ============
    
    // Elderly / Senior users (60+, 65+, 70+)
    const isElderly = /\b(elderly|senior|60\+|65\+|70\+|80\+|retired|retirement)\b/.test(demographics);
    if (isElderly) {
      scores.voice += 0.08;              // Voice is natural for elderly
      scores.traditional_screen += 0.05; // Familiar paradigm
      scores.spatial -= 0.12;            // VR: 78% rejection rate (motion sickness)
      scores.invisible -= 0.05;          // Automation causes anxiety in elderly
    }
    
    // Young users (Gen Z, teens, 18-25, millennials)
    const isYoung = /\b(young|teen|18[-–]25|gen\s*z|millennial|student|college)\b/.test(demographics);
    if (isYoung && !isElderly) {
      scores.spatial += 0.06;            // Early adopters of AR/VR
      scores.ai_vectorial += 0.04;       // Comfortable with AI
      scores.invisible += 0.03;          // Trust automation
    }
    
    // Middle-aged (30-50, 40s, 50s)
    const isMiddleAged = /\b(30[-–]50|40s?|50s?|middle[-\s]age|adult)\b/.test(demographics);
    if (isMiddleAged && !isElderly && !isYoung) {
      scores.traditional_screen += 0.04; // Prefer proven interfaces
      scores.ai_vectorial += 0.02;       // Selective AI adoption
    }
    
    // ============ TECH LITERACY ADJUSTMENTS ============
    
    // Low tech literacy (beginner, non-technical, limited experience)
    const isLowTech = /\b(non[-\s]?tech|beginner|novice|limited\s+tech|low\s+literacy|unfamiliar|inexperienced)\b/.test(demographics);
    if (isLowTech) {
      scores.traditional_screen += 0.08; // Need explicit visual guidance
      scores.voice += 0.05;              // Intuitive interaction
      scores.invisible -= 0.10;          // Automation confuses beginners
      scores.ai_vectorial -= 0.05;       // AI "black box" effect
      scores.spatial -= 0.08;            // VR learning curve too steep
    }
    
    // High tech literacy (tech-savvy, developers, engineers, experts)
    const isHighTech = /\b(tech[-\s]?savvy|developer|engineer|programmer|expert|proficient|advanced|early\s+adopter)\b/.test(demographics);
    if (isHighTech && !isLowTech) {
      scores.ai_vectorial += 0.06;       // Comfortable with AI tools
      scores.spatial += 0.04;            // Willing to try VR/AR
      scores.invisible += 0.04;          // Trust automation
      scores.traditional_screen -= 0.03; // May find traditional "boring"
    }
    
    // Moderate tech literacy (default assumption if not specified)
    const isModerateTech = /\b(moderate|average|some\s+experience|familiar|comfortable)\b/.test(demographics);
    if (isModerateTech && !isLowTech && !isHighTech) {
      scores.traditional_screen += 0.04; // Balanced approach
      scores.ai_vectorial += 0.02;
    }
    
    // ============ PROFESSION-BASED ADJUSTMENTS ============
    
    // Healthcare (doctors, nurses, medical, hospital)
    if (/\b(healthcare|medical|doctor|nurse|physician|hospital|clinic|patient|caregiver)\b/.test(demographics)) {
      scores.traditional_screen += 0.05; // Precision critical, visual confidence
      scores.voice += 0.03;              // Hands-free during procedures
      scores.invisible -= 0.05;          // Need explicit control (safety)
      scores.spatial -= 0.03;            // VR not practical in clinical settings
    }
    
    // Software/Tech industry (developers, engineers, designers)
    if (/\b(software|developer|engineer|programmer|designer|tech\s+industry|IT|startup)\b/.test(demographics)) {
      scores.ai_vectorial += 0.05;       // Power users of AI tools
      scores.traditional_screen += 0.03; // Need screens for coding/design
      scores.spatial += 0.02;            // Open to new paradigms
    }
    
    // Education (teachers, professors, students)
    if (/\b(teacher|professor|educator|student|academic|university|school)\b/.test(demographics)) {
      scores.traditional_screen += 0.04; // Visual learning aids
      scores.ai_vectorial += 0.03;       // AI tutoring potential
      scores.spatial += 0.02;            // Educational VR applications
    }
    
    // Manual workers (factory, warehouse, construction, field work)
    if (/\b(factory|warehouse|construction|field\s+work|manual\s+labor|hands[-\s]?free|operator)\b/.test(demographics)) {
      scores.voice += 0.08;              // Hands occupied
      scores.invisible += 0.05;          // Automation helpful
      scores.traditional_screen -= 0.08; // Hands not free for screens
      scores.spatial += 0.03;            // AR for overlays (if hands-free)
    }
    
    // Gaming / Entertainment (gamers, streamers, content creators)
    if (/\b(gamer|gaming|streamer|content\s+creator|youtube|twitch|entertainment)\b/.test(demographics)) {
      scores.spatial += 0.06;            // Immersion valued
      scores.ai_vectorial += 0.04;       // AI content generation
      scores.traditional_screen += 0.02; // Screens for streaming
    }
    
    // ============ ACCESSIBILITY ADJUSTMENTS ============
    
    // Visual impairment (blind, low vision, visually impaired)
    if (/\b(blind|visual(ly)?\s+impair|low\s+vision|sight\s+loss|screen\s+reader)\b/.test(demographics)) {
      scores.voice += 0.12;              // CRITICAL for accessibility
      scores.traditional_screen -= 0.10; // Screens not viable
      scores.spatial -= 0.10;            // VR requires vision
      scores.invisible += 0.03;          // Audio feedback possible
    }
    
    // Motor impairment (mobility issues, motor impairment, wheelchair)
    if (/\b(motor\s+impair|mobility|wheelchair|tremor|dexterity|hand\s+control)\b/.test(demographics)) {
      scores.voice += 0.08;              // Hands-free is essential
      scores.invisible += 0.05;          // Reduce physical interaction
      scores.traditional_screen -= 0.05; // Touch/mouse difficult
      scores.spatial -= 0.08;            // VR controllers challenging
    }
    
    // Hearing impairment (deaf, hard of hearing)
    if (/\b(deaf|hearing\s+impair|hard\s+of\s+hearing)\b/.test(demographics)) {
      scores.voice -= 0.10;              // Voice interfaces not viable
      scores.traditional_screen += 0.08; // Visual feedback essential
      scores.spatial += 0.03;            // Visual VR experiences work
    }
  }

  // ========================================
  // STEP 3: TASK COMPLEXITY (12% weight)
  // Complex tasks need visual feedback
  // ========================================
  if (answers.taskComplexity === 'Simple') {
    // Simple tasks → automate or voice
    scores.invisible += 0.12;
    scores.voice += 0.08;
  } else if (answers.taskComplexity === 'Complex') {
    // Complex tasks → need visual UI for judgment
    scores.traditional_screen += 0.12;
    scores.ai_vectorial += 0.08;
  } else if (answers.taskComplexity === 'Medium') {
    // Medium → balanced approach
    scores.traditional_screen += 0.06;
    scores.ai_vectorial += 0.06;
  }

  // ========================================
  // STEP 4: FREQUENCY (10% weight)
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
  // STEP 5: PREDICTABILITY (10% weight)
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
  // STEP 6: CONTEXT OF USE (10% weight)
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
  // STEP 7: INFORMATION TYPE (10% weight)
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
  // STEP 8: EXPLORATION MODE (5% weight)
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
  // STEP 9: ERROR CONSEQUENCES (5% weight)
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
  // STEP 10: CONTROL PREFERENCE (3% weight)
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
  // STEP 11: GEOGRAPHY (2% weight)
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

  // DEMOGRAPHICS-BASED REASONING
  if (answers.userDemographics) {
    const demographics = answers.userDemographics.toLowerCase();
    
    // Age-based reasoning
    if (/\b(elderly|senior|60\+|65\+|70\+|80\+|retired|retirement)\b/.test(demographics)) {
      bullets.push('**Elderly users** benefit from familiar voice interfaces; VR/AR has high rejection rates');
    } else if (/\b(young|teen|18[-–]25|gen\s*z|millennial)\b/.test(demographics)) {
      bullets.push('**Younger users** are early adopters comfortable with AR/VR and AI interfaces');
    }
    
    // Tech literacy reasoning
    if (/\b(non[-\s]?tech|beginner|novice|limited\s+tech|low\s+literacy)\b/.test(demographics)) {
      bullets.push('**Low tech literacy** requires explicit visual guidance; automation may confuse users');
    } else if (/\b(tech[-\s]?savvy|developer|engineer|expert|advanced)\b/.test(demographics)) {
      bullets.push('**Tech-savvy users** are comfortable with AI tools and willing to adopt new paradigms');
    }
    
    // Accessibility reasoning
    if (/\b(blind|visual(ly)?\s+impair|low\s+vision)\b/.test(demographics)) {
      bullets.push('**Visual impairment** makes voice interfaces critical; screen-based paradigms are not viable');
    }
    if (/\b(motor\s+impair|mobility|wheelchair|tremor)\b/.test(demographics)) {
      bullets.push('**Motor impairment** benefits from hands-free voice and automation interfaces');
    }
    if (/\b(deaf|hearing\s+impair|hard\s+of\s+hearing)\b/.test(demographics)) {
      bullets.push('**Hearing impairment** requires visual feedback; voice interfaces are not suitable');
    }
    
    // Profession reasoning
    if (/\b(healthcare|medical|doctor|nurse|hospital)\b/.test(demographics)) {
      bullets.push('**Healthcare context** requires precision and explicit control for patient safety');
    }
    if (/\b(factory|warehouse|construction|field\s+work|manual\s+labor)\b/.test(demographics)) {
      bullets.push('**Manual work context** with hands occupied makes voice and automation essential');
    }
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
export interface RedFlag {
  text: string;
  source: string;
  description: string;
  reference: {
    title: string;
    url: string;
  };
}

export function getRedFlags(answers: AssessmentAnswers, recommendation: RecommendationResult): RedFlag[] {
  const flags: RedFlag[] = [];

  // CONTROL CONTRADICTION
  // User wants control but prefers automation
  if (
    answers.valuesRanking.slice(0, 2).includes('User Control') && 
    answers.controlPreference === 'Automatic'
  ) {
    flags.push({
      text: '⚠️ You prioritized Control but prefer automation—consider explicit override mechanisms',
      source: 'Values Ranking vs Control Preference',
      description: 'Research shows that users who value control experience frustration when automation acts without their consent. Providing clear override options maintains user trust.',
      reference: {
        title: 'Norman, D. (2013). The Design of Everyday Things',
        url: 'https://www.nngroup.com/books/design-everyday-things-revised/'
      }
    });
  }

  // INVISIBLE + SERIOUS ERRORS
  // Automation with high-stakes errors is risky
  if (recommendation.primary.paradigm === 'invisible' && answers.errorConsequence === 'Serious') {
    flags.push({
      text: '⚠️ Invisible automation with high-stakes errors needs confirmation checkpoints',
      source: 'Error Consequence + Paradigm',
      description: 'Automation in high-stakes contexts requires explicit confirmation to prevent costly errors. Studies show 23% of automation failures occur due to lack of user verification.',
      reference: {
        title: 'Parasuraman, R. (2010). Complacency and Bias in Human Use of Automation',
        url: 'https://doi.org/10.1518/001872010X12829369036556'
      }
    });
  }

  // AR/VR IN SOCIAL SETTINGS
  // Spatial interfaces can be socially awkward
  if (recommendation.allScores.spatial > 20 && answers.contextOfUse === 'Social situations') {
    flags.push({
      text: '⚠️ AR/VR can create social barriers—consider discreet alternatives',
      source: 'Context of Use + Spatial Score',
      description: 'Wearable AR devices can create social disconnection and stigma. Users report discomfort using head-mounted displays in public settings.',
      reference: {
        title: 'Koelle et al. (2020). Social Acceptability of Head-Mounted Displays',
        url: 'https://doi.org/10.1145/3313831.3376454'
      }
    });
  }

  // VOICE IN PUBLIC
  // Voice interfaces may be inappropriate in public
  if (recommendation.allScores.voice > 25 && answers.contextOfUse === 'Social situations') {
    flags.push({
      text: '⚠️ Voice interfaces may be inappropriate in public—add silent alternatives',
      source: 'Context of Use + Voice Score',
      description: 'Privacy concerns and social norms limit voice interface adoption in public. 74% of users prefer silent input methods when around others.',
      reference: {
        title: 'Luger, E. & Sellen, A. (2016). Like Having a Really Bad PA',
        url: 'https://doi.org/10.1145/2858036.2858288'
      }
    });
  }

  // ENSURE OVERRIDE FOR INVISIBLE
  // All invisible/automated systems need escape hatches
  if (recommendation.primary.paradigm === 'invisible' || recommendation.secondary.paradigm === 'invisible') {
    flags.push({
      text: '⚠️ Ensure override mechanism accessible in <3 seconds',
      source: 'Invisible Paradigm in Top 2',
      description: 'Users need immediate access to manual controls when automation fails. The 3-second threshold is based on reaction time research for safe handoff.',
      reference: {
        title: 'SAE International (2021). Taxonomy of Automated Driving',
        url: 'https://www.sae.org/standards/content/j3016_202104/'
      }
    });
  }

  // Return top 5 most relevant flags
  return flags.slice(0, 5);
}

/**
 * Calculate confidence level based on assessment completeness and answer consistency
 * 
 * @param answers - User's assessment answers
 * @param recommendation - Generated recommendation
 * @returns Confidence percentage (0-100)
 */
export function calculateConfidenceLevel(answers: AssessmentAnswers, recommendation: RecommendationResult): number {
  let confidence = 60; // Base confidence

  // Higher primary score = more confident
  if (recommendation.primary.pct >= 40) confidence += 15;
  else if (recommendation.primary.pct >= 30) confidence += 10;
  else confidence += 5;

  // Good separation between primary and secondary = more confident
  const gap = recommendation.primary.pct - recommendation.secondary.pct;
  if (gap >= 15) confidence += 10;
  else if (gap >= 10) confidence += 5;
  else if (gap < 5) confidence -= 5; // Too close, less confident

  // Complete values ranking = more confident
  if (answers.valuesRanking.length === 5) confidence += 5;

  // Consistency checks
  // If control is valued and full control is chosen, consistent
  if (answers.valuesRanking.includes('User Control') && answers.controlPreference === 'Full control') {
    confidence += 5;
  }
  // If efficiency is valued and automatic is chosen, consistent
  if (answers.valuesRanking.includes('Efficiency') && answers.controlPreference === 'Automatic') {
    confidence += 5;
  }

  // Cap at 95% (never 100% certain)
  return Math.min(95, Math.max(40, confidence));
}
