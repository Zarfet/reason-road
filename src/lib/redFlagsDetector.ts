/**
 * NEXUS - Red Flags Detection System
 * 
 * Purpose: Identify critical risks, contradictions, and implementation blockers
 * 
 * Red Flag Categories:
 * 1. Value/Preference Contradictions
 * 2. High-Risk Configurations (safety, health, legal)
 * 3. Demographic Mismatches
 * 4. Regulatory Conflicts
 * 5. Sustainability Conflicts
 */

import type { AssessmentAnswers, RecommendationResult } from '@/types/assessment';

export interface RedFlag {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  category: 'contradiction' | 'safety' | 'demographic' | 'regulatory' | 'sustainability' | 'adoption';
  title: string;
  description: string;
  impact: string;                    // What happens if ignored
  mitigation: string[];              // How to fix
  affectedParadigms: string[];       // Which paradigms this affects
}

export interface RedFlagsReport {
  hasFlags: boolean;
  totalFlags: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  flags: RedFlag[];
}

/**
 * Detect all red flags in the assessment
 */
export function detectRedFlags(
  answers: AssessmentAnswers,
  recommendation: RecommendationResult
): RedFlagsReport {
  const flags: RedFlag[] = [];
  
  // =============================================
  // 1. VALUE/PREFERENCE CONTRADICTIONS
  // =============================================
  
  // User Control #1 but Automatic preference
  if (answers.valuesRanking[0] === 'User Control' && answers.controlPreference === 'Automatic') {
    flags.push({
      id: 'contradiction-control-automatic',
      severity: 'high',
      category: 'contradiction',
      title: 'Contradiction: User Control vs Automatic Preference',
      description: 'You ranked "User Control" as your #1 value, but selected "Automatic" for control preference. This creates a fundamental conflict.',
      impact: 'Users will feel loss of agency even if automation works perfectly. High likelihood of rejection and abandonment.',
      mitigation: [
        'Change to "Supervised" (system suggests, user approves)',
        'Implement "Automation with Visibility" - show what system is doing',
        'Provide easy override mechanism on every automated action',
        'Add "Why did you do this?" explanation feature'
      ],
      affectedParadigms: ['invisible', 'ai_vectorial']
    });
  }
  
  // Efficiency #1 but Very Low Control preference
  if (answers.valuesRanking[0] === 'Efficiency' && answers.controlPreference === 'Full control') {
    flags.push({
      id: 'contradiction-efficiency-control',
      severity: 'medium',
      category: 'contradiction',
      title: 'Contradiction: Efficiency vs Full Control',
      description: 'Efficiency is #1 priority but you require full manual control over every action. These goals are inherently misaligned.',
      impact: 'System will be slow and require constant user intervention, defeating efficiency goals.',
      mitigation: [
        'Increase acceptance of supervised automation',
        'Define automation boundaries (e.g., auto-save but manual publish)',
        'Implement smart defaults that users can override',
        'Use invisible automation for truly safe operations only'
      ],
      affectedParadigms: ['invisible', 'ai_vectorial']
    });
  }
  
  // Sustainability #1 but high-carbon configuration
  const sustainabilityRank = answers.valuesRanking.indexOf('Sustainability');
  const estimatedCO2 = 
    (recommendation.allScores.traditional_screen || 0) * 0.20 + 
    (recommendation.allScores.invisible || 0) * 0.04 + 
    (recommendation.allScores.ai_vectorial || 0) * 0.48 + 
    (recommendation.allScores.spatial || 0) * 0.80 + 
    (recommendation.allScores.voice || 0) * 0.10;
  
  if (sustainabilityRank === 0 && estimatedCO2 > 40) {
    flags.push({
      id: 'contradiction-sustainability-carbon',
      severity: 'medium',
      category: 'sustainability',
      title: 'Sustainability Conflict: High Carbon Configuration',
      description: `Sustainability is your #1 value, but configuration generates ~${Math.round(estimatedCO2)} kg CO₂/year (>40 kg threshold).`,
      impact: 'Conflicts with stated environmental priorities. May face internal resistance or regulatory scrutiny.',
      mitigation: [
        'Reduce VR/Spatial component to <10%',
        'Increase Voice/Invisible components (lowest carbon)',
        'Use green cloud providers (AWS Oregon, Google Belgium)',
        'Implement aggressive power-saving modes'
      ],
      affectedParadigms: ['spatial', 'ai_vectorial']
    });
  }
  
  // =============================================
  // 2. HIGH-RISK SAFETY CONFIGURATIONS
  // =============================================
  
  // Invisible automation + Serious errors + Critical context
  const isCriticalContext = 
    answers.userDemographics.toLowerCase().includes('healthcare') ||
    answers.userDemographics.toLowerCase().includes('medical') ||
    answers.userDemographics.toLowerCase().includes('financial') ||
    answers.userDemographics.toLowerCase().includes('doctor') ||
    answers.userDemographics.toLowerCase().includes('nurse') ||
    answers.userDemographics.toLowerCase().includes('surgeon');
  
  if ((recommendation.allScores.invisible || 0) > 20 && 
      answers.errorConsequence === 'Serious' && 
      isCriticalContext) {
    flags.push({
      id: 'safety-invisible-critical',
      severity: 'critical',
      category: 'safety',
      title: 'CRITICAL: Invisible Automation in High-Stakes Context',
      description: `You have ${Math.round(recommendation.allScores.invisible || 0)}%+ invisible automation with serious error consequences in a ${answers.userDemographics} context.`,
      impact: 'Silent failures could cause patient harm, financial loss, or legal liability. Unacceptable risk level.',
      mitigation: [
        'REQUIRED: Implement heartbeat monitoring (system alive check every 30 sec)',
        'REQUIRED: Fail-safe mode - revert to manual if uncertainty >10%',
        'REQUIRED: Comprehensive audit logging for post-incident analysis',
        'Add human-in-the-loop checkpoints for critical actions',
        'Implement dual-confirmation for irreversible operations',
        'Create incident response protocol'
      ],
      affectedParadigms: ['invisible']
    });
  }
  
  // AI in critical context without error handling
  if ((recommendation.allScores.ai_vectorial || 0) > 15 && 
      answers.errorConsequence === 'Serious' && 
      isCriticalContext) {
    flags.push({
      id: 'safety-ai-critical',
      severity: 'critical',
      category: 'safety',
      title: 'CRITICAL: AI System in High-Stakes Medical/Financial Context',
      description: `${Math.round(recommendation.allScores.ai_vectorial || 0)}%+ AI system with serious error consequences in ${answers.userDemographics} context.`,
      impact: 'AI hallucinations or biases could cause patient harm or financial loss. Potential liability and lawsuits.',
      mitigation: [
        'REQUIRED: Implement confidence scoring on all AI outputs',
        'REQUIRED: Show "AI generated this - verify before use" warnings',
        'REQUIRED: Bias testing across all demographic groups',
        'Add human validation step for all AI-generated decisions',
        'Create human escalation path for low-confidence outputs',
        'Document AI model limitations and error rates'
      ],
      affectedParadigms: ['ai_vectorial']
    });
  }
  
  // =============================================
  // 3. DEMOGRAPHIC MISMATCHES
  // =============================================
  
  // VR for elderly users
  const isElderly = answers.userDemographics.toLowerCase().includes('elderly') ||
                    answers.userDemographics.toLowerCase().includes('senior') ||
                    answers.userDemographics.toLowerCase().includes('60') ||
                    answers.userDemographics.toLowerCase().includes('70') ||
                    answers.userDemographics.toLowerCase().includes('older');
  
  if ((recommendation.allScores.spatial || 0) > 5 && isElderly) {
    flags.push({
      id: 'demographic-elderly-vr',
      severity: 'critical',
      category: 'demographic',
      title: 'CRITICAL: VR Recommended for Elderly Users',
      description: `Your configuration includes ${Math.round(recommendation.allScores.spatial || 0)}% VR/AR, but user demographics indicate elderly population.`,
      impact: '78% rejection rate. Motion sickness, complexity, and health risks make VR unsuitable for 60+ users.',
      mitigation: [
        'Remove VR/Spatial component entirely',
        'Replace with Voice (hands-free, no learning curve)',
        'Replace with Traditional Screen (familiar, safe)',
        'If VR required: limit to <30 min sessions, extensive training, health screening'
      ],
      affectedParadigms: ['spatial']
    });
  }
  
  // Complex AI for non-technical users
  const isNonTechnical = answers.userDemographics.toLowerCase().includes('non-tech') ||
                         answers.userDemographics.toLowerCase().includes('low literacy') ||
                         answers.userDemographics.toLowerCase().includes('beginner') ||
                         answers.userDemographics.toLowerCase().includes('not familiar');
  
  if ((recommendation.allScores.ai_vectorial || 0) > 15 && isNonTechnical) {
    flags.push({
      id: 'demographic-nontechn-ai',
      severity: 'high',
      category: 'adoption',
      title: 'Adoption Risk: AI for Non-Technical Users',
      description: `AI component is ${Math.round(recommendation.allScores.ai_vectorial || 0)}% but users have low tech literacy.`,
      impact: '70% abandonment rate. AI "black box" effect causes confusion and mistrust among non-technical users.',
      mitigation: [
        'Implement mandatory interactive tutorial (5-7 min)',
        'Start with simple AI suggestions, not full automation',
        'Provide clear "How AI works" explainer',
        'Add human support channel (phone/chat) for first 30 days',
        'Show confidence scores on AI outputs',
        'Allow easy fallback to manual mode'
      ],
      affectedParadigms: ['ai_vectorial']
    });
  }
  
  // Invisible automation for non-technical users
  if ((recommendation.allScores.invisible || 0) > 20 && isNonTechnical) {
    flags.push({
      id: 'demographic-nontechn-invisible',
      severity: 'medium',
      category: 'adoption',
      title: 'Adoption Risk: Invisible Automation for Non-Technical Users',
      description: `${Math.round(recommendation.allScores.invisible || 0)}%+ invisible automation for users with low tech literacy.`,
      impact: 'High anxiety and distrust. Users may disable features they don\'t understand, defeating automation benefits.',
      mitigation: [
        'Implement visible feedback (progress bars, confirmations)',
        'Show "what the system is doing" in plain language',
        'Provide manual override always available',
        'Create detailed explainers (video + text)',
        'Start with low-risk automation first'
      ],
      affectedParadigms: ['invisible']
    });
  }
  
  // =============================================
  // 4. REGULATORY CONFLICTS
  // =============================================
  
  // EU + High-risk AI without compliance awareness
  if (answers.geography === 'Primarily Europe' &&
      (recommendation.allScores.ai_vectorial || 0) > 15 &&
      isCriticalContext) {
    flags.push({
      id: 'regulatory-eu-ai-act',
      severity: 'critical',
      category: 'regulatory',
      title: 'CRITICAL: EU AI Act High-Risk Classification',
      description: `AI system in ${answers.userDemographics} context with EU deployment = High-Risk AI system under EU AI Act.`,
      impact: 'Cannot deploy without CE marking, conformity assessment, and registration. Fines up to €30M or 6% global revenue.',
      mitigation: [
        'REQUIRED: Budget €50,000-200,000 for AI Act compliance',
        'REQUIRED: Add 6-12 months to project timeline',
        'REQUIRED: Engage EU legal counsel specializing in AI Act',
        'Conduct AI risk assessment',
        'Implement bias testing across demographics',
        'Create technical documentation package',
        'Plan quarterly audits and reporting'
      ],
      affectedParadigms: ['ai_vectorial', 'invisible']
    });
  }
  
  // EU + Invisible automation without GDPR consideration
  if ((answers.geography === 'Primarily Europe' || answers.geography === 'Global') &&
      (recommendation.allScores.invisible || 0) > 15) {
    flags.push({
      id: 'regulatory-gdpr-article-22',
      severity: 'high',
      category: 'regulatory',
      title: 'GDPR Article 22: Right to Explanation Required',
      description: `EU deployment with ${Math.round(recommendation.allScores.invisible || 0)}% automation requires explanation mechanism.`,
      impact: 'GDPR violations: €20M fine or 4% global revenue. Users can challenge automated decisions.',
      mitigation: [
        'Implement "Why did this happen?" button on all automated actions',
        'Log all automated decisions with rationale',
        'Provide human review option for disputed decisions',
        'Budget €25,000-40,000 for Article 22 compliance',
        'Add +2-3 months to development timeline'
      ],
      affectedParadigms: ['invisible', 'ai_vectorial']
    });
  }
  
  // =============================================
  // 5. SOCIAL/ENVIRONMENTAL SUSTAINABILITY
  // =============================================
  
  // EU + High environmental impact
  if (answers.geography === 'Primarily Europe' && estimatedCO2 > 60) {
    flags.push({
      id: 'sustainability-eu-green-deal',
      severity: 'medium',
      category: 'sustainability',
      title: 'EU Green Deal: High Carbon Footprint',
      description: `Configuration generates ~${Math.round(estimatedCO2)} kg CO₂/year. EU Digital Product Passport may require disclosure post-2027.`,
      impact: 'May face regulatory barriers or public backlash. Corporate sustainability reports will show high digital emissions.',
      mitigation: [
        'Reduce VR component (highest carbon)',
        'Use renewable energy for cloud infrastructure',
        'Implement carbon offset program',
        'Document sustainability measures for compliance',
        'Plan for EU Digital Product Passport requirements'
      ],
      affectedParadigms: ['spatial', 'ai_vectorial']
    });
  }
  
  // =============================================
  // 6. ADOPTION RISK FLAGS
  // =============================================
  
  // Multi-paradigm complexity
  const paradigmCount = Object.values(recommendation.allScores).filter(p => p > 10).length;
  const multiParadigms = Object.entries(recommendation.allScores)
    .filter(([, p]) => p > 10)
    .map(([k]) => k);
  
  if (paradigmCount > 3) {
    flags.push({
      id: 'adoption-multi-paradigm',
      severity: 'medium',
      category: 'adoption',
      title: 'Complexity Warning: Multi-Paradigm Interface',
      description: `Your configuration uses ${paradigmCount} different paradigms at significant levels (>10% each).`,
      impact: 'Users must learn multiple interaction models. Increased cognitive load, longer onboarding, higher support costs.',
      mitigation: [
        'Create unified onboarding covering all paradigms',
        'Design consistent mental model across paradigms',
        'Provide mode-switching UI (clear indication of current paradigm)',
        'Budget +30% training time vs single-paradigm',
        'Consider staged rollout (introduce paradigms gradually)'
      ],
      affectedParadigms: multiParadigms
    });
  }
  
  // =============================================
  // CALCULATE SUMMARY STATS
  // =============================================
  
  const criticalCount = flags.filter(f => f.severity === 'critical').length;
  const highCount = flags.filter(f => f.severity === 'high').length;
  const mediumCount = flags.filter(f => f.severity === 'medium').length;
  
  return {
    hasFlags: flags.length > 0,
    totalFlags: flags.length,
    criticalCount,
    highCount,
    mediumCount,
    flags: flags.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
  };
}
