/**
 * NEXUS - Red Flags Detection System
 * 
 * Purpose: Identify critical risks, contradictions, and implementation blockers
 * with research-backed evidence citations
 * 
 * Red Flag Categories:
 * 1. Value/Preference Contradictions
 * 2. High-Risk Configurations (safety, health, legal)
 * 3. Demographic Mismatches
 * 4. Regulatory Conflicts
 * 5. Sustainability Conflicts
 * 6. Adoption Risk Factors
 */

import { getRedFlagCitation, type RedFlagCitation } from './redFlagsCitations';
import type { AssessmentAnswers, RecommendationResult } from '@/types/assessment';

export interface RedFlag {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  category: 'contradiction' | 'safety' | 'demographic' | 'regulatory' | 'sustainability' | 'adoption';
  title: string;
  description: string;
  impact: string;                    // What happens if ignored
  evidence?: string;                 // Research-backed summary
  citation?: RedFlagCitation;        // Full citation with link
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
      evidence: 'Loss of perceived control is the #1 predictor of automation rejection (Parasuraman & Riley, 1997)',
      citation: getRedFlagCitation('AUTOMATION_REJECTION'),
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
      evidence: 'Transparent feedback mechanisms are required to maintain appropriate trust in automated systems (Lee & See, 2004)',
      citation: getRedFlagCitation('TRUST_IN_AUTOMATION'),
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
      evidence: 'EU Digital Product Passport (2027) will require disclosure of digital product carbon footprint',
      citation: getRedFlagCitation('EU_GREEN_DEAL_DIGITAL'),
      mitigation: [
        'Reduce VR/Spatial component to <10%',
        'Increase Voice/Invisible components (lowest carbon)',
        'Use green cloud providers (AWS Oregon, Google Belgium)',
        'Implement aggressive power-saving modes',
        'Purchase carbon offsets (€5-10/tonne CO₂)'
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
      title: '🚨 CRITICAL: Invisible Automation in High-Stakes Context',
      description: `You have ${Math.round(recommendation.allScores.invisible || 0)}%+ invisible automation with serious error consequences in a ${answers.userDemographics} context.`,
      impact: 'Silent failures could cause patient harm, financial loss, or legal liability. Unacceptable risk level.',
      evidence: 'Unexpected automation behavior accounts for 65% of mode confusion incidents in complex systems (Sarter et al., 1997)',
      citation: getRedFlagCitation('AUTOMATION_SURPRISE'),
      mitigation: [
        'REQUIRED: Implement heartbeat monitoring (system alive check every 30 sec)',
        'REQUIRED: Fail-safe mode - revert to manual if uncertainty >10%',
        'REQUIRED: Comprehensive audit logging for post-incident analysis',
        'REQUIRED: Human-in-the-loop checkpoints for critical actions',
        'Implement dual-confirmation for irreversible operations',
        'Conduct Failure Mode and Effects Analysis (FMEA) before deployment'
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
      title: '🚨 AI Hallucination Risk in Critical Context',
      description: `${Math.round(recommendation.allScores.ai_vectorial || 0)}%+ AI system with serious error consequences in ${answers.userDemographics} context.`,
      impact: 'AI models produce confident but incorrect outputs in 5-15% of responses. Could lead to medical errors or financial miscalculations.',
      evidence: 'Large language models hallucinate in 5-15% of responses depending on domain (Bender et al., 2021)',
      citation: getRedFlagCitation('AI_RELIABILITY'),
      mitigation: [
        'REQUIRED: Human review of all AI-generated clinical/financial decisions',
        'REQUIRED: Implement confidence thresholds (reject if <95% confidence)',
        'REQUIRED: Add "AI-Generated" watermark to all outputs',
        'Conduct regular hallucination audits (monthly sampling)',
        'Build fact-checking layer with citations to source documents',
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
                    answers.userDemographics.toLowerCase().includes('older') ||
                    answers.userDemographics.toLowerCase().includes('retirement');
  
  if ((recommendation.allScores.spatial || 0) > 5 && isElderly) {
    flags.push({
      id: 'demographic-elderly-vr',
      severity: 'critical',
      category: 'demographic',
      title: '🚨 VR/AR Recommended for Elderly Users',
      description: `Your configuration includes ${Math.round(recommendation.allScores.spatial || 0)}% VR/AR, but user demographics indicate elderly population.`,
      impact: '78% rejection rate. Motion sickness, complexity, and health risks make VR unsuitable for 60+ users.',
      evidence: '78% of adults aged 60+ discontinue VR within 30 days (Syed-Abdul et al., 2019)',
      citation: getRedFlagCitation('VR_AGE_BARRIER'),
      mitigation: [
        'Remove VR/Spatial component entirely',
        'Replace with Voice (hands-free, no learning curve)',
        'Replace with Traditional Screen (familiar, safe)',
        'If VR required: limit to <30 min sessions, extensive training, health screening',
        'Provide traditional screen fallback for all VR features',
        'Budget for higher support costs (3x normal)'
      ],
      affectedParadigms: ['spatial']
    });
  }
  
  // Complex AI for non-technical users
  const isNonTechnical = answers.userDemographics.toLowerCase().includes('non-tech') ||
                          answers.userDemographics.toLowerCase().includes('low literacy') ||
                          answers.userDemographics.toLowerCase().includes('beginner') ||
                          answers.userDemographics.toLowerCase().includes('not familiar') ||
                          answers.userDemographics.toLowerCase().includes('basic digital');
  
  if ((recommendation.allScores.ai_vectorial || 0) > 15 && isNonTechnical) {
    flags.push({
      id: 'demographic-nontechn-ai',
      severity: 'high',
      category: 'adoption',
      title: 'AI for Non-Technical Users',
      description: `AI component is ${Math.round(recommendation.allScores.ai_vectorial || 0)}% but users have low tech literacy.`,
      impact: '70% abandonment rate. AI "black box" effect causes confusion and mistrust among non-technical users.',
      evidence: 'Only 30% of adults aged 65+ have basic digital skills (Eurostat, 2023)',
      citation: getRedFlagCitation('DIGITAL_DIVIDE'),
      mitigation: [
        'Implement extremely simplified AI interface (no advanced features)',
        'Provide "AI Coach" onboarding (5+ video tutorials)',
        'Add "Plain English" explanations for all AI outputs',
        'Build confidence gradually (start with simple use cases)',
        'Offer human support fallback (chat or phone)',
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
      title: 'Invisible Automation for Non-Technical Users',
      description: `${Math.round(recommendation.allScores.invisible || 0)}%+ invisible automation for users with low tech literacy.`,
      impact: 'High anxiety and distrust. Users may disable features they don\'t understand, defeating automation benefits.',
      evidence: 'Opacity in automated decision-making reduces user trust by 45% (Ananny & Crawford, 2018)',
      citation: getRedFlagCitation('BLACK_BOX_SYSTEMS'),
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
      title: '🚨 EU AI Act: High-Risk System Classification',
      description: `AI system in ${answers.userDemographics} context with EU deployment = High-Risk AI system under EU AI Act.`,
      impact: 'Cannot deploy without CE marking, conformity assessment, and registration. Non-compliance penalties up to €35M or 7% global turnover.',
      evidence: 'High-risk AI penalties up to €35M or 7% global turnover (EU AI Act, 2024)',
      citation: getRedFlagCitation('AI_ACT_PENALTIES'),
      mitigation: [
        'REQUIRED: Budget €50,000-200,000 for AI Act compliance',
        'REQUIRED: Add 6-12 months to project timeline',
        'REQUIRED: Engage EU legal counsel specializing in AI Act',
        'REQUIRED: Conduct AI risk assessment per Article 9',
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
      title: 'GDPR Article 22: Automated Decision-Making',
      description: `EU deployment with ${Math.round(recommendation.allScores.invisible || 0)}% automation triggers GDPR Article 22 requirements.`,
      impact: 'Must provide right to human intervention and explanation. Average GDPR fine for Article 22 violations: €850K.',
      evidence: 'Average GDPR fine for automated decision-making violations: €850,000 (CMS Law Tracker, 2024)',
      citation: getRedFlagCitation('GDPR_FINES'),
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
      evidence: 'EU Digital Product Passport (2027) will require disclosure of digital product carbon footprint and lifecycle data',
      citation: getRedFlagCitation('EU_GREEN_DEAL_DIGITAL'),
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
      title: 'Multi-Paradigm Complexity Risk',
      description: `Your configuration uses ${paradigmCount} different paradigms at significant levels (>10% each). Users must learn multiple interaction models.`,
      impact: 'Learning multiple paradigms increases cognitive load by 40-60%. Higher error rates and 25% abandonment risk.',
      evidence: 'Multiple paradigms increase cognitive load 40-60% (Sweller et al., 2019)',
      citation: getRedFlagCitation('COGNITIVE_LOAD_COMPLEXITY'),
      mitigation: [
        'Consolidate to 2-3 primary paradigms',
        'Create unified onboarding covering all paradigms',
        'Build progressive disclosure (introduce paradigms gradually)',
        'Create "cheat sheet" reference guide',
        'Budget 2 weeks training time (vs 1 week for single paradigm)'
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
