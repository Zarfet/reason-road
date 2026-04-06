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
      title: 'CRITICAL: Invisible Automation in High-Stakes Context',
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
      title: 'AI Hallucination Risk in Critical Context',
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
      title: 'VR/AR Recommended for Elderly Users',
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
      title: 'EU AI Act: High-Risk System Classification',
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
  // 7. WEARABLE + SOCIAL CONTEXT (Google Glass)
  // =============================================
  
  console.log('interactionInitiation value:', answers.interactionInitiation);

  const isWearableContext = 
    answers.userDemographics.toLowerCase().includes('wearable') ||
    answers.userDemographics.toLowerCase().includes('ar glasses') ||
    answers.userDemographics.toLowerCase().includes('headset') ||
    answers.userDemographics.toLowerCase().includes('head-mounted') ||
    (recommendation.allScores.spatial > 5 &&
     answers.contextOfUse === 'Social situations' &&
     answers.interactionInitiation !== 'User-initiated: system only responds when asked') ||
    (answers.deviceType === 'Dedicated hardware' &&
     answers.contextOfUse === 'Social situations' &&
     answers.informationType === 'Visual content' &&
     answers.interactionInitiation !== 'User-initiated: system only responds when asked');

  if (answers.contextOfUse === 'Social situations' && isWearableContext) {
    flags.push({
      id: 'social-wearable-privacy',
      severity: 'critical',
      category: 'safety',
      title: 'Privacy Violation: Recording Capability in Social Contexts',
      description: 'Wearable device with visual/audio capture capability deployed in social situations without clear consent mechanism for bystanders.',
      impact: 'Users and bystanders will reject the product. Public spaces may ban the device. Legal exposure under wiretapping and privacy statutes.',
      evidence: 'Google Glass discontinued in 2015 after "Glasshole" social rejection. Always-on recording without visible indicators violates social norms and emerging privacy law (Hoy, 2014).',
      citation: getRedFlagCitation('GDPR_FINES'),
      mitigation: [
        'Add visible recording indicator (light/sound) whenever camera is active',
        'Default to user-initiated capture only (no always-on)',
        'Consider enterprise-only deployment in controlled environments',
        'Conduct social acceptability testing before consumer launch',
        'Add explicit bystander consent mechanism'
      ],
      affectedParadigms: ['spatial']
    });

    flags.push({
      id: 'social-acceptability-wearable',
      severity: 'critical',
      category: 'adoption',
      title: 'Social Acceptability Failure: Visible Wearable in Public',
      description: 'Visible wearable technology worn in social situations violates unspoken public norms. Bystanders feel surveilled; wearers face social stigma.',
      impact: 'Product rejection regardless of technical capability. "Glasshole" effect — social exclusion of users in public contexts.',
      evidence: 'Wearable AR in public contexts faces consistent social rejection. Google Glass banned in restaurants, bars, and public spaces (Stein, 2013; Hoy, 2014).',
      citation: getRedFlagCitation('BLACK_BOX_SYSTEMS'),
      mitigation: [
        'Redesign for social invisibility (look like normal eyewear)',
        'Restrict launch to private/professional contexts only',
        'Run social norm testing with non-users (bystanders), not just wearers',
        'Explore audio-only or haptic alternatives that are socially invisible'
      ],
      affectedParadigms: ['spatial']
    });
  }
  
  // =============================================
  // 8. UNSOLICITED AUTOMATION + FULL CONTROL (Clippy)
  // =============================================
  
  if (answers.interactionInitiation === 'System-initiated: proactively interrupts or assists without being asked' &&
      answers.controlPreference === 'Full control' &&
      answers.frequency === 'Multiple times daily') {
    flags.push({
      id: 'interruption-control-violation',
      severity: 'critical',
      category: 'contradiction',
      title: 'Interruption Risk: Proactive System vs User Control Requirement',
      description: 'System is designed to initiate interactions proactively, but users require full manual control. Unsolicited interruptions during focused work violate user agency.',
      impact: 'Users will disable the feature entirely or abandon the product. Interruptions during deep work cost more productivity than the automation saves.',
      evidence: 'Clippy (1997-2007): proactive assistance without user initiation caused sustained rejection. Users spent more time dismissing incorrect help than benefiting from correct suggestions (Baym et al., 2019; Swartz, 2003).',
      citation: getRedFlagCitation('AUTOMATION_REJECTION'),
      mitigation: [
        'REQUIRED: Switch to user-initiated model — help only when asked',
        'If proactive: add a visible, dismissable indicator (never a blocking popup)',
        'Implement "do not disturb" mode during focused work sessions',
        'Allow users to set frequency and timing of proactive suggestions',
        'Default to off — let users opt in to proactive assistance'
      ],
      affectedParadigms: ['invisible', 'ai_vectorial']
    });
  }
  
  // =============================================
  // 9. AI LATENCY vs EFFICIENCY (Humane AI Pin, Rabbit R1)
  // =============================================
  
  if (answers.valuesRanking[0] === 'Efficiency' &&
      answers.frequency === 'Multiple times daily' &&
      answers.informationType === 'Unstructured text' &&
      ((recommendation.allScores.ai_vectorial || 0) > 15 || (recommendation.allScores.invisible || 0) > 25)) {
    flags.push({
      id: 'efficiency-ai-latency',
      severity: 'critical',
      category: 'contradiction',
      title: 'Efficiency Contradiction: AI Latency vs High-Frequency Use',
      description: 'Efficiency is the #1 value, but cloud-based AI processing introduces 3-10 second response delays. At "multiple times daily" frequency, this latency compounds into significant productivity loss.',
      impact: 'Marketing promises instant results; reality delivers frustrating delays. Users abandon product within weeks of purchase.',
      evidence: 'Humane AI Pin (2024): documented 5-10 second delays for simple queries destroyed efficiency value proposition. Marketing vs reality gap caused mass returns within 30 days (Pierce, 2024).',
      citation: getRedFlagCitation('TRUST_IN_AUTOMATION'),
      mitigation: [
        'Measure actual P95 latency before launch — not demo conditions',
        'Set user expectations honestly: "responses in 3-8 seconds"',
        'Implement on-device processing for common queries to reduce latency',
        'Design UI for latency: show progress indicators, never a blank wait',
        'Consider smartphone app alternative where processing is already optimized'
      ],
      affectedParadigms: ['ai_vectorial', 'invisible']
    });
  }
  
  // =============================================
  // 10. DEDICATED HARDWARE REDUNDANCY (Humane AI Pin, Rabbit R1, Fire Phone)
  // =============================================
  
  if (answers.deviceType === 'Dedicated hardware' &&
      answers.existingEcosystem === 'Yes: users already own devices or tools that handle this' &&
      answers.contextOfUse === 'Mobile') {
    flags.push({
      id: 'hardware-redundancy',
      severity: 'critical',
      category: 'adoption',
      title: 'Redundancy Risk: Dedicated Hardware vs Existing User Solutions',
      description: 'Users already carry devices (smartphones) that cover this use case. No demonstrated functional advantage justifies a second device.',
      impact: 'Users will not carry an additional device without clear, measurable superiority. Product fails to establish reason to exist.',
      evidence: 'Rabbit R1 (2024, €118M) and Humane AI Pin (2024, €200M): both failed because smartphones already provided equivalent or superior functionality. "Why not just use your phone?" had no compelling answer (Pierce, 2024; Coldewey, 2024).',
      citation: getRedFlagCitation('DIGITAL_DIVIDE'),
      mitigation: [
        'REQUIRED: Define one specific task where dedicated hardware is measurably 2x better than smartphone',
        'Run direct comparison tests: dedicated device vs smartphone app for core tasks',
        'Consider software-first approach: prove the concept as an app before building hardware',
        'If hardware is essential, identify the physical constraint that makes software impossible',
        'Critical question: "Would users buy this if they could not use their smartphone for one week?"'
      ],
      affectedParadigms: ['ai_vectorial', 'voice', 'invisible']
    });
  }
  
  // =============================================
  // 11. NOVELTY OVER UTILITY (Fire Phone, Rabbit R1)
  // =============================================
  
  if (answers.valuesRanking[1] === 'Joy' &&
      answers.valuesRanking[0] === 'Efficiency' &&
      answers.contextOfUse === 'Mobile' &&
      answers.existingEcosystem === 'Yes: users already own devices or tools that handle this') {
    flags.push({
      id: 'novelty-over-utility',
      severity: 'high',
      category: 'adoption',
      title: 'Novelty Risk: Design Prioritizes "Cool Factor" Over Functional Advantage',
      description: 'Joy is ranked #2 behind Efficiency, but users already have solutions. Novel features (3D interfaces, unique hardware) are insufficient to overcome switching costs when alternatives work adequately.',
      impact: 'Initial hype converts to returns and abandonment when novelty wears off. "Cool gadget" without daily utility fails in competitive markets.',
      evidence: 'Amazon Fire Phone (2014, €170M): 3D Dynamic Perspective dismissed as "gimmicky rather than useful." Users found gestures added complexity without benefit for standard 2D tasks (Luckerson, 2014).',
      citation: getRedFlagCitation('COGNITIVE_LOAD_COMPLEXITY'),
      mitigation: [
        'For each novel feature, document the specific user problem it solves',
        'Run task-comparison tests: novel feature vs standard approach — is it actually faster?',
        'Remove features that cannot demonstrate measurable user benefit',
        'Focus novelty budget on one signature differentiator, not multiple gimmicks',
        'Test with skeptical mainstream users, not just enthusiasts who love novelty'
      ],
      affectedParadigms: ['spatial', 'ai_vectorial', 'traditional_screen']
    });
  }

  // =============================================
  // 12. INTENT PREDICTION FAILURE (Clippy)
  // =============================================
  
  if (answers.interactionInitiation === 'System-initiated: proactively interrupts or assists without being asked' &&
      answers.predictability === 'Varies within known patterns' &&
      answers.taskComplexity === 'Medium') {
    flags.push({
      id: 'intent-prediction-failure',
      severity: 'high',
      category: 'contradiction',
      title: 'Intent Prediction Risk: System Cannot Reliably Anticipate Variable Tasks',
      description: 'The system initiates interactions proactively, but tasks vary in unpredictable ways. Automated intent prediction fails frequently when task patterns are inconsistent, producing irrelevant or incorrect suggestions.',
      impact: 'Users spend more time dismissing incorrect suggestions than benefiting from correct ones. Productivity loss exceeds productivity gain. Users disable the feature entirely.',
      evidence: 'Clippy (1997-2007): proactive intent prediction failed consistently for variable office tasks. Users found suggestions irrelevant or obvious, spending more time dismissing than benefiting (Baym et al., 2019).',
      citation: getRedFlagCitation('AUTOMATION_REJECTION'),
      mitigation: [
        'Switch to user-initiated model: system only suggests when explicitly asked',
        'If proactive: limit to highly predictable, identical tasks only',
        'Implement confidence threshold: only suggest when prediction confidence >85%',
        'Allow users to train the system by rating suggestion relevance',
        'Default proactive suggestions to off — opt-in model'
      ],
      affectedParadigms: ['invisible', 'ai_vectorial']
    });
  }

  // =============================================
  // 13. BATTERY AND THERMAL CONSTRAINTS (Humane AI Pin, Glass)
  // =============================================
  
  if (answers.productConstraints?.includes('always-on') &&
      answers.deviceType === 'Dedicated hardware' &&
      answers.frequency === 'Multiple times daily') {
    flags.push({
      id: 'battery-thermal-constraint',
      severity: 'high',
      category: 'adoption',
      title: 'Hardware Constraint: Always-On Device Conflicts with All-Day Usage Pattern',
      description: 'Always-on hardware with multiple daily interactions requires sustained power and thermal management. Current wearable and IoT hardware cannot maintain performance across a full day of active use.',
      impact: 'Users experience device shutdowns, overheating, and forced charging breaks during active use. Device reliability undermines trust and abandonment follows.',
      evidence: 'Humane AI Pin (2024): required charging every 2-4 hours and overheated during normal use, making all-day wearability impossible (Pierce, 2024). Google Glass: 2-3 hour battery life during active use (Bilton, 2015).',
      citation: getRedFlagCitation('TRUST_IN_AUTOMATION'),
      mitigation: [
        'Benchmark battery life under realistic all-day usage conditions, not demo conditions',
        'Design low-power standby modes that activate between interactions',
        'Communicate battery limitations clearly in product marketing',
        'Provide charging solutions that integrate with daily routines',
        'Consider tethered or modular battery alternatives'
      ],
      affectedParadigms: ['spatial', 'invisible', 'ai_vectorial']
    });
  }

  // =============================================
  // 14. ECOSYSTEM SWITCHING COST (Fire Phone)
  // =============================================
  
  if (answers.productConstraints?.includes('ecosystem-abandonment') &&
      answers.existingEcosystem === 'Yes: users already own devices or tools that handle this') {
    flags.push({
      id: 'ecosystem-switching-cost',
      severity: 'critical',
      category: 'adoption',
      title: 'Ecosystem Lock-In: Switching Costs Prohibitive for Existing Platform Users',
      description: 'Users must abandon their existing platform ecosystem (apps, data, workflows, contacts) to adopt this product. Switching costs — financial, cognitive, and social — create a near-insurmountable adoption barrier when no compelling advantage exists.',
      impact: 'Users will not switch without a revolutionary, measurable advantage over their existing solution. Incremental improvements are insufficient to justify ecosystem abandonment.',
      evidence: 'Amazon Fire Phone (2014, €170M): users already invested in iOS/Android apps, data, and workflows refused to switch for 3D gesture features. "No compelling reason to abandon existing ecosystem" (Luckerson, 2014; Venkatesh & Davis, 2000).',
      citation: getRedFlagCitation('DIGITAL_DIVIDE'),
      mitigation: [
        'REQUIRED: Identify one specific capability that is measurably 10x better than existing platform',
        'Provide migration tools that preserve user data, contacts, and key workflows',
        'Consider cross-platform strategy: deliver value without requiring ecosystem switch',
        'Run switching cost analysis: what do users lose vs what do they gain?',
        'Historical precedent: Windows Phone, BlackBerry 10, and WebOS all failed against iOS/Android duopoly'
      ],
      affectedParadigms: ['traditional_screen', 'ai_vectorial', 'voice']
    });
  }

  // =============================================
  // 15. VOICE-ONLY MODALITY MISMATCH (Humane AI Pin)
  // =============================================
  
  if (answers.productConstraints?.includes('voice-only') &&
      answers.taskComplexity === 'Medium') {
    flags.push({
      id: 'voice-only-modality-mismatch',
      severity: 'critical',
      category: 'contradiction',
      title: 'Modality Mismatch: Voice-Only Interface Insufficient for Medium-Complexity Tasks',
      description: 'Voice-only interaction forces users to complete medium-complexity tasks without visual feedback, verification, or correction. Tasks involving multiple steps, data review, or output confirmation cannot be reliably completed through audio alone.',
      impact: 'Users experience frustration when tasks require visual confirmation. Errors go undetected. Users revert to smartphone for tasks the product was designed to replace.',
      evidence: 'Humane AI Pin (2024): screenless design forced voice-only interactions for tasks that genuinely needed visual feedback, creating frustration rather than convenience (Pierce, 2024).',
      citation: getRedFlagCitation('AUTOMATION_SURPRISE'),
      mitigation: [
        'Audit all use cases: identify which require visual output or confirmation',
        'Add minimal display for output verification (even small screen or projection)',
        'Design audio confirmation patterns for each task type',
        'Consider hybrid approach: voice input, visual output',
        'Critical test: can a user complete every core task eyes-free, hands-free, without error?'
      ],
      affectedParadigms: ['voice', 'invisible', 'ai_vectorial']
    });
  }

  // =============================================
  // 16. PRICE AND ACCESSIBILITY BARRIER (Google Glass)
  // =============================================
  
  if (answers.productConstraints?.includes('narrow-demographic')) {
    flags.push({
      id: 'accessibility-price-barrier',
      severity: 'high',
      category: 'adoption',
      title: 'Accessibility Barrier: Price or Complexity Excludes Majority of Target Market',
      description: 'Product price point or technical requirements limit adoption to a narrow demographic, reducing total addressable market and creating perception of exclusivity that may generate negative publicity.',
      impact: 'Small addressable market limits revenue potential. High-profile launches with narrow reach generate disproportionate criticism. Enterprise pivot may be required.',
      evidence: 'Google Glass (2013, $1,500): price point limited adoption to wealthy early adopters, generating "tech elite" criticism. Enterprise pivot to controlled environments was the only viable path (Bilton, 2015).',
      citation: getRedFlagCitation('VR_AGE_BARRIER'),
      mitigation: [
        'Define minimum viable price point for target demographic',
        'Consider tiered pricing or subscription model to lower entry barrier',
        'Identify enterprise/professional market where price is justified by ROI',
        'Run willingness-to-pay research before hardware investment',
        'Plan consumer version roadmap with lower price point if enterprise-first'
      ],
      affectedParadigms: ['spatial', 'ai_vectorial', 'traditional_screen']
    });
  }

  // =============================================
  // 17. BIOMETRIC DATA AND REGULATORY RISK (Google Glass)
  // =============================================
  
  if (answers.productConstraints?.includes('biometric-data') &&
      answers.contextOfUse === 'Social situations') {
    flags.push({
      id: 'biometric-regulatory-risk',
      severity: 'critical',
      category: 'regulatory',
      title: 'Regulatory Risk: Passive Biometric Capture in Public Contexts',
      description: 'Product captures biometric or facial data passively in social situations. This creates significant legal exposure under GDPR, CCPA, BIPA (Illinois), and emerging facial recognition laws. Bystanders have no opportunity to consent.',
      impact: 'Regulatory action, class action lawsuits, and forced product withdrawal. Multiple jurisdictions have enacted or are enacting facial recognition bans in public spaces.',
      evidence: 'Google Glass (2013): facial recognition capabilities raised immediate legal and ethical questions. Multiple US states and EU regulators flagged Glass as potential privacy law violation before consumer launch (Hoy, 2014).',
      citation: getRedFlagCitation('AI_ACT_PENALTIES'),
      mitigation: [
        'REQUIRED: Conduct legal review in every target market before launch',
        'Implement explicit opt-in for any biometric capture — no passive collection',
        'Add visible, unmistakable recording indicator (light, sound, physical switch)',
        'Consider removing biometric capabilities entirely for consumer version',
        'Monitor GDPR Article 9, CCPA, and BIPA compliance requirements'
      ],
      affectedParadigms: ['spatial', 'invisible']
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
