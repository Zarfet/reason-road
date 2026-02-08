/**
 * NEXUS - Regulatory Analysis Generator
 * 
 * Purpose: Generate compliance requirements based on geography and paradigm selection
 * 
 * Key Regulations:
 * - GDPR (EU General Data Protection Regulation)
 * - EU AI Act (High-Risk AI Systems)
 * - ePrivacy Directive
 * - Schrems II (Data Sovereignty)
 * - Digital Services Act (DSA)
 */

import type { AssessmentAnswers, RecommendationResult, ParadigmScores } from '@/types/assessment';

export interface RegulatoryRequirement {
  regulation: string;              // e.g., "GDPR Article 22"
  title: string;                   // e.g., "Right to Explanation"
  description: string;             // What it requires
  applicableParadigms: string[];   // Which paradigms this affects
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  developmentOverhead: string;     // e.g., "+15% development time"
  estimatedCost: string;           // e.g., "€30,000-50,000"
  timelineImpact: string;          // e.g., "+3 months"
  mitigationSteps: string[];       // How to comply
}

export interface RegulatoryAnalysis {
  region: string;
  applicable: boolean;
  requirements: RegulatoryRequirement[];
  totalEstimatedCost: string;
  totalTimelineImpact: string;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

/**
 * Generate regulatory analysis based on geography and paradigm selection
 */
export function generateRegulatoryAnalysis(
  answers: AssessmentAnswers,
  recommendation: RecommendationResult
): RegulatoryAnalysis | null {
  const geography = answers.geography;
  
  // Only applicable for EU and Global deployments
  if (geography !== 'Primarily Europe' && geography !== 'Global') {
    return null;
  }
  
  const requirements: RegulatoryRequirement[] = [];
  const paradigms: (keyof ParadigmScores)[] = [
    recommendation.primary.paradigm,
    recommendation.secondary?.paradigm,
    recommendation.tertiary?.paradigm
  ].filter((p): p is keyof ParadigmScores => Boolean(p));
  
  // ============================================
  // GDPR REQUIREMENTS
  // ============================================
  
  // GDPR Article 22 - Right to Explanation (for automated decisions)
  if (paradigms.includes('invisible') || paradigms.includes('ai_vectorial')) {
    requirements.push({
      regulation: 'GDPR Article 22',
      title: 'Right to Explanation for Automated Decisions',
      description: 'Users have the right to obtain an explanation of automated decisions that significantly affect them. System must provide "Why did this happen?" mechanism.',
      applicableParadigms: ['invisible', 'ai_vectorial'],
      impactLevel: 'high',
      developmentOverhead: '+15-20%',
      estimatedCost: '€25,000-40,000',
      timelineImpact: '+2-3 months',
      mitigationSteps: [
        'Implement audit logging for all automated decisions',
        'Build "Explain this action" UI component',
        'Store decision rationale in database',
        'Provide human-readable explanations',
        'Add option to override automated decisions'
      ]
    });
  }
  
  // GDPR Article 6 - Legal Basis for Processing
  requirements.push({
    regulation: 'GDPR Article 6',
    title: 'Lawful Basis for Data Processing',
    description: 'Explicit consent required before collecting or processing personal data.',
    applicableParadigms: ['all'],
    impactLevel: 'medium',
    developmentOverhead: '+5-8%',
    estimatedCost: '€10,000-15,000',
    timelineImpact: '+1 month',
    mitigationSteps: [
      'Design consent flow UI (cannot use pre-checked boxes)',
      'Implement granular consent options',
      'Store consent records with timestamps',
      'Provide easy withdrawal mechanism',
      'Cookie banner with reject/accept options'
    ]
  });
  
  // GDPR Article 17 - Right to be Forgotten
  requirements.push({
    regulation: 'GDPR Article 17',
    title: 'Right to Erasure ("Right to be Forgotten")',
    description: 'Users can request deletion of all their personal data. System must delete within 30 days.',
    applicableParadigms: ['all'],
    impactLevel: 'medium',
    developmentOverhead: '+8-12%',
    estimatedCost: '€15,000-25,000',
    timelineImpact: '+1-2 months',
    mitigationSteps: [
      'Implement data deletion workflows',
      'Cascade deletes across all systems',
      'Handle backups and archives',
      'Generate deletion confirmation certificates',
      'Update privacy policy with 30-day SLA'
    ]
  });
  
  // ============================================
  // EU AI ACT REQUIREMENTS
  // ============================================
  
  // High-Risk AI Systems (if AI/Invisible paradigms with critical context)
  const demographics = answers.userDemographics?.toLowerCase() || '';
  const isCriticalContext = 
    answers.errorConsequence === 'Serious' ||
    demographics.includes('healthcare') ||
    demographics.includes('medical') ||
    demographics.includes('financial') ||
    demographics.includes('doctor') ||
    demographics.includes('nurse') ||
    demographics.includes('hospital');
  
  if ((paradigms.includes('ai_vectorial') || paradigms.includes('invisible')) && isCriticalContext) {
    requirements.push({
      regulation: 'EU AI Act',
      title: 'High-Risk AI System Classification',
      description: 'AI systems used in healthcare, critical infrastructure, or with serious error consequences are "High-Risk" and require conformity assessment, CE marking, and human oversight.',
      applicableParadigms: ['ai_vectorial', 'invisible'],
      impactLevel: 'critical',
      developmentOverhead: '+30-40%',
      estimatedCost: '€50,000-200,000',
      timelineImpact: '+6-12 months',
      mitigationSteps: [
        'Conduct AI risk assessment',
        'Implement human-in-the-loop checkpoints',
        'Document training data and model decisions',
        'Perform bias testing across demographics',
        'Obtain CE marking certification',
        'Create technical documentation package',
        'Register in EU AI Database',
        'Quarterly audits and reporting'
      ]
    });
  }
  
  // ============================================
  // DATA SOVEREIGNTY (Schrems II)
  // ============================================
  
  if (paradigms.includes('ai_vectorial') || paradigms.includes('voice')) {
    requirements.push({
      regulation: 'Schrems II Compliance',
      title: 'Data Sovereignty - EU Data Residency',
      description: 'Personal data of EU citizens cannot be transferred to US cloud providers without Standard Contractual Clauses (SCCs). Voice/AI processing must occur in EU data centers or on-device.',
      applicableParadigms: ['ai_vectorial', 'voice'],
      impactLevel: 'high',
      developmentOverhead: '+20-25%',
      estimatedCost: '€40,000-70,000',
      timelineImpact: '+3-4 months',
      mitigationSteps: [
        'Use EU-hosted cloud providers (AWS eu-central-1, Azure West Europe)',
        'Implement edge processing for voice (on-device when possible)',
        'Sign Standard Contractual Clauses (SCCs) with vendors',
        'Data Processing Agreements (DPAs) with all sub-processors',
        'Prohibit automatic transfer to non-EU regions',
        'Implement data localization architecture'
      ]
    });
  }
  
  // ============================================
  // ePrivacy Directive (Cookie Law)
  // ============================================
  
  if (paradigms.includes('traditional_screen')) {
    requirements.push({
      regulation: 'ePrivacy Directive',
      title: 'Cookie Consent & Tracking',
      description: 'Cannot use non-essential cookies without explicit opt-in consent. No pre-checked boxes or "implied consent".',
      applicableParadigms: ['traditional_screen'],
      impactLevel: 'low',
      developmentOverhead: '+3-5%',
      estimatedCost: '€5,000-10,000',
      timelineImpact: '+2 weeks',
      mitigationSteps: [
        'Implement compliant cookie banner',
        'Separate essential vs non-essential cookies',
        'Provide granular cookie categories',
        'Store consent preferences',
        'Function without non-essential cookies if rejected'
      ]
    });
  }
  
  // ============================================
  // CALCULATE TOTALS
  // ============================================
  
  const totalCostMin = requirements.reduce((sum, req) => {
    const match = req.estimatedCost.match(/[\d,]+/);
    const cost = parseInt(match?.[0]?.replace(',', '') || '0');
    return sum + cost;
  }, 0);
  
  const totalTimelineMonths = requirements.reduce((max, req) => {
    const match = req.timelineImpact.match(/\d+/);
    const months = parseInt(match?.[0] || '0');
    return Math.max(max, months);
  }, 0);
  
  const overallRiskLevel: RegulatoryAnalysis['overallRiskLevel'] = 
    requirements.some(r => r.impactLevel === 'critical') ? 'critical' :
    requirements.some(r => r.impactLevel === 'high') ? 'high' :
    requirements.some(r => r.impactLevel === 'medium') ? 'medium' : 'low';
  
  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================
  
  const recommendations: string[] = [];
  
  if (overallRiskLevel === 'critical' || overallRiskLevel === 'high') {
    recommendations.push('⚠️ Budget €50,000-100,000 minimum for legal compliance consulting');
    recommendations.push('📅 Add 6-12 months to project timeline for certification');
    recommendations.push('👨‍⚖️ Engage EU-based legal counsel specializing in GDPR + AI Act');
  }
  
  if (paradigms.includes('ai_vectorial') || paradigms.includes('invisible')) {
    recommendations.push('🤖 Implement "Explain AI Decision" feature from Day 1 (not retrofit)');
    recommendations.push('📊 Log all AI decisions with timestamps and rationale');
  }
  
  if (paradigms.includes('voice')) {
    recommendations.push('🎤 Process voice data on-device when possible (avoid cloud transfer)');
    recommendations.push('🇪🇺 If cloud needed, use AWS eu-central-1 or Azure West Europe only');
  }
  
  recommendations.push('📄 Appoint a Data Protection Officer (DPO) if >250 employees');
  recommendations.push('🔒 Conduct annual GDPR compliance audits');
  recommendations.push('📋 Maintain GDPR Records of Processing Activities (ROPA)');
  
  // ============================================
  // RETURN ANALYSIS
  // ============================================
  
  return {
    region: geography,
    applicable: true,
    requirements,
    totalEstimatedCost: `€${Math.floor(totalCostMin / 1000)}K-€${Math.floor(totalCostMin / 1000 * 1.5)}K`,
    totalTimelineImpact: `+${totalTimelineMonths} months`,
    overallRiskLevel,
    recommendations
  };
}

/**
 * Get paradigm display name for UI
 */
export function getParadigmDisplayName(paradigm: string): string {
  const names: Record<string, string> = {
    traditional_screen: 'Traditional Screen',
    invisible: 'Invisible/Ambient',
    ai_vectorial: 'AI Vectorial',
    spatial: 'Spatial (AR/VR)',
    voice: 'Voice Interface',
    all: 'All Paradigms'
  };
  return names[paradigm] || paradigm;
}
