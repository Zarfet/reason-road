import type { AssessmentAnswers, ParadigmScores, ParadigmPercentages, RecommendationResult } from '@/types/assessment';

export function calculateScores(answers: AssessmentAnswers): ParadigmPercentages {
  const scores: ParadigmScores = {
    traditional_screen: 0,
    invisible: 0,
    ai_vectorial: 0,
    spatial: 0,
    voice: 0
  };

  // VALUES influence (30% weight)
  if (answers.valuesRanking.length > 0) {
    const topValue = answers.valuesRanking[0];
    
    switch (topValue) {
      case 'User Control':
        scores.traditional_screen += 0.30;
        scores.invisible -= 0.15;
        break;
      case 'Efficiency':
        scores.invisible += 0.25;
        scores.voice += 0.15;
        break;
      case 'Accessibility':
        scores.voice += 0.20;
        scores.traditional_screen += 0.10;
        break;
      case 'Sustainability':
        scores.invisible += 0.15;
        scores.spatial -= 0.15;
        break;
      case 'Joy':
        scores.spatial += 0.20;
        scores.ai_vectorial += 0.10;
        break;
    }
  }

  // Task Complexity (15%)
  if (answers.taskComplexity === 'Simple') {
    scores.invisible += 0.15;
    scores.voice += 0.10;
  } else if (answers.taskComplexity === 'Complex') {
    scores.traditional_screen += 0.15;
    scores.ai_vectorial += 0.10;
  } else if (answers.taskComplexity === 'Medium') {
    scores.traditional_screen += 0.08;
    scores.ai_vectorial += 0.07;
  }

  // Frequency (10%)
  if (answers.frequency === 'Multiple times daily') {
    scores.invisible += 0.10;
  } else if (answers.frequency === 'Rarely') {
    scores.traditional_screen += 0.10;
  } else if (answers.frequency === 'Several times per week') {
    scores.traditional_screen += 0.05;
    scores.invisible += 0.05;
  }

  // Predictability (10%)
  if (answers.predictability === 'Always identical') {
    scores.invisible += 0.10;
  } else if (answers.predictability === 'Always different') {
    scores.traditional_screen += 0.05;
    scores.ai_vectorial += 0.05;
  } else if (answers.predictability === 'Varies within known patterns') {
    scores.ai_vectorial += 0.05;
    scores.traditional_screen += 0.05;
  }

  // Context (10%)
  if (answers.contextOfUse === 'Desktop') {
    scores.traditional_screen += 0.10;
  } else if (answers.contextOfUse === 'Hands occupied') {
    scores.voice += 0.10;
    scores.invisible += 0.05;
  } else if (answers.contextOfUse === 'Social situations') {
    scores.spatial -= 0.15;
    scores.traditional_screen += 0.10;
  } else if (answers.contextOfUse === 'Mobile') {
    scores.traditional_screen += 0.08;
    scores.voice += 0.05;
  }

  // Info Type (10%)
  if (answers.informationType === 'Structured data') {
    scores.traditional_screen += 0.10;
  } else if (answers.informationType === 'Unstructured text') {
    scores.ai_vectorial += 0.10;
  } else if (answers.informationType === 'Spatial/3D') {
    scores.spatial += 0.10;
  } else if (answers.informationType === 'Visual content') {
    scores.traditional_screen += 0.07;
    scores.spatial += 0.03;
  }

  // Exploration (5%)
  if (answers.explorationMode === 'Explore options') {
    scores.traditional_screen += 0.05;
  } else if (answers.explorationMode === 'Know exactly') {
    scores.invisible += 0.05;
  } else if (answers.explorationMode === 'Mix of both') {
    scores.ai_vectorial += 0.05;
  }

  // Errors (5%)
  if (answers.errorConsequence === 'Serious') {
    scores.traditional_screen += 0.05;
    scores.invisible -= 0.10;
  } else if (answers.errorConsequence === 'Trivial') {
    scores.invisible += 0.05;
    scores.voice += 0.03;
  }

  // Control (3%)
  if (answers.controlPreference === 'Full control') {
    scores.traditional_screen += 0.03;
  } else if (answers.controlPreference === 'Automatic') {
    scores.invisible += 0.03;
  } else if (answers.controlPreference === 'Supervised') {
    scores.ai_vectorial += 0.03;
  }

  // Geography (2%)
  if (answers.geography === 'Primarily Europe') {
    scores.invisible -= 0.02;
    scores.ai_vectorial -= 0.02;
  }

  // Normalize to percentages
  const total = Object.values(scores).reduce((sum, score) => sum + Math.max(0, score), 0);
  
  const percentages: ParadigmPercentages = {
    traditional_screen: 0,
    invisible: 0,
    ai_vectorial: 0,
    spatial: 0,
    voice: 0
  };

  if (total > 0) {
    for (const paradigm of Object.keys(scores) as Array<keyof ParadigmScores>) {
      percentages[paradigm] = Math.round((Math.max(0, scores[paradigm]) / total) * 100);
    }
  }

  return percentages;
}

export function generateRecommendation(percentages: ParadigmPercentages): RecommendationResult {
  const sorted = (Object.entries(percentages) as Array<[keyof ParadigmScores, number]>)
    .sort((a, b) => b[1] - a[1]);

  return {
    primary: { paradigm: sorted[0][0], pct: sorted[0][1] },
    secondary: { paradigm: sorted[1][0], pct: sorted[1][1] },
    tertiary: { paradigm: sorted[2][0], pct: sorted[2][1] },
    avoid: sorted.slice(-2),
    allScores: percentages
  };
}

export function getReasoningBullets(answers: AssessmentAnswers, recommendation: RecommendationResult): string[] {
  const bullets: string[] = [];
  
  // Values-based reasoning
  if (answers.valuesRanking.length > 0) {
    const topValue = answers.valuesRanking[0];
    bullets.push(`**${topValue}** is your top priority, which strongly influences the recommendation`);
  }

  // Task complexity
  if (answers.taskComplexity) {
    if (answers.taskComplexity === 'Complex') {
      bullets.push('**Complex tasks** require visual interfaces for judgment and creativity');
    } else if (answers.taskComplexity === 'Simple') {
      bullets.push('**Simple, repetitive tasks** benefit from automation and voice interfaces');
    }
  }

  // Context
  if (answers.contextOfUse) {
    if (answers.contextOfUse === 'Hands occupied') {
      bullets.push('**Hands-free context** makes voice interfaces essential');
    } else if (answers.contextOfUse === 'Desktop') {
      bullets.push('**Desktop environment** enables complex screen-based interactions');
    }
  }

  // Error consequences
  if (answers.errorConsequence === 'Serious') {
    bullets.push('**High-stakes errors** require explicit user confirmation and control');
  }

  // Information type
  if (answers.informationType === 'Unstructured text') {
    bullets.push('**Unstructured content** benefits from AI-powered search and generation');
  } else if (answers.informationType === 'Spatial/3D') {
    bullets.push('**3D/spatial data** is best visualized in AR/VR environments');
  }

  // Geography
  if (answers.geography === 'Primarily Europe') {
    bullets.push('**European deployment** requires GDPR compliance and AI Act considerations');
  }

  return bullets.slice(0, 6);
}

export function getRedFlags(answers: AssessmentAnswers, recommendation: RecommendationResult): string[] {
  const flags: string[] = [];

  // Control contradiction
  if (
    answers.valuesRanking.slice(0, 2).includes('User Control') && 
    answers.controlPreference === 'Automatic'
  ) {
    flags.push('⚠️ You prioritized Control but prefer automation—consider explicit override mechanisms');
  }

  // Invisible + serious errors
  if (recommendation.primary.paradigm === 'invisible' && answers.errorConsequence === 'Serious') {
    flags.push('⚠️ Invisible automation with high-stakes errors needs confirmation checkpoints');
  }

  // AR in social settings
  if (recommendation.allScores.spatial > 20 && answers.contextOfUse === 'Social situations') {
    flags.push('⚠️ AR/VR can create social barriers—consider discreet alternatives');
  }

  // Voice in noisy/public
  if (recommendation.allScores.voice > 25 && answers.contextOfUse === 'Social situations') {
    flags.push('⚠️ Voice interfaces may be inappropriate in public—add silent alternatives');
  }

  // Ensure override mechanism
  if (recommendation.primary.paradigm === 'invisible' || recommendation.secondary.paradigm === 'invisible') {
    flags.push('⚠️ Ensure override mechanism accessible in <3 seconds');
  }

  return flags.slice(0, 5);
}
