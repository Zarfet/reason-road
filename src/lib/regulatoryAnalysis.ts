/**
 * NEXUS - Regulatory Analysis Generator with Legal Citations
 * 
 * Purpose: Generate compliance requirements with proper citations
 * 
 * Key Regulations:
 * - GDPR (EU) 2016/679 with EUR-Lex links
 * - EU AI Act (EU) 2024/1689
 * - ePrivacy Directive 2002/58/EC
 * - Schrems II (CJEU C-311/18)
 * - DPIA Guidance (EDPB)
 * - ADA Title III (US)
 * - CCPA (US)
 * - FTC Act Section 5 (US)
 */

import { getCitation } from './regulatoryCitations';
import type { AssessmentAnswers, RecommendationResult, ParadigmScores } from '@/types/assessment';
import type { LegalCitation } from './regulatoryCitations';

export interface RegulatoryRequirement {
  id: string;
  regulation: string;
  title: string;
  description: string;
  applicableParadigms: string[];
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationSteps: string[];
  citation: LegalCitation;
}

export interface RegulatoryAnalysis {
  region: string;
  applicable: boolean;
  requirements: RegulatoryRequirement[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskRationale: string;
  complianceCategories: {
    procedural: string[];
    technical: string[];
    organizational: string[];
  };
  preLaunchBlockers: string[];
  officialGuidance: {
    title: string;
    url: string;
  }[];
  recommendations: string[];
  disclaimer: string;
}

// ─── US Citations (no EUR-Lex, so we create them inline) ─────────────────────

const US_CITATIONS: Record<string, LegalCitation> = {
  ADA_TITLE_III: {
    regulation: 'Americans with Disabilities Act Title III',
    title: 'ADA Compliance for Digital Interfaces',
    url: 'https://www.ada.gov/law-and-regs/design-standards/',
    year: 1990,
    keyRequirement: 'Digital interfaces must be accessible to people with disabilities under WCAG 2.1 Level AA',
    type: 'regulation',
  },
  CCPA: {
    regulation: 'CCPA (California Civil Code §1798.100–199.100)',
    title: 'California Consumer Privacy Act',
    url: 'https://oag.ca.gov/privacy/ccpa',
    year: 2018,
    keyRequirement: 'California residents can know, delete, and opt-out of sale of personal data',
    type: 'regulation',
  },
  FTC_SECTION_5: {
    regulation: 'FTC Act Section 5 (15 U.S.C. §45)',
    title: 'Prohibition of Unfair or Deceptive Practices',
    url: 'https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act',
    year: 1914,
    keyRequirement: 'Prohibits unfair or deceptive acts including dark patterns, misleading AI representations, and hidden fees',
    type: 'regulation',
  },
  INTERNAL_GOVERNANCE: {
    regulation: 'Corporate Data Governance Policy',
    title: 'Internal Data Governance Standards',
    url: 'https://www.iso.org/standard/75652.html',
    section: 'ISO/IEC 27001:2022',
    year: 2022,
    keyRequirement: 'Company-specific data handling, security standards, and compliance requirements for internal systems',
    type: 'regulation',
  },
};

/**
 * Generate regulatory analysis based on geography and paradigm selection.
 * Now generates analysis for ALL geographies (EU, US, Global, Internal).
 */
export function generateRegulatoryAnalysis(
  answers: AssessmentAnswers,
  recommendation: RecommendationResult
): RegulatoryAnalysis | null {
  const geography = answers.geography;
  if (!geography) return null;

  const isEurope = geography === 'Primarily Europe';
  const isUS = geography === 'Primarily United States' || geography === 'Primarily US';
  const isGlobal = geography === 'Global' || geography === 'Global (multiple regions)';
  const isInternal = geography === 'Internal Only' || geography === 'Internal tool';

  const regionLabel = isEurope
    ? 'European Union'
    : isUS
    ? 'United States'
    : isGlobal
    ? 'Global (EU + US standards apply)'
    : 'Internal/Corporate';

  const requirements: RegulatoryRequirement[] = [];
  const percentages = recommendation.allScores;

  // ─── EU Regulations (Europe & Global) ────────────────────────────────────────

  if (isEurope || isGlobal) {
    // GDPR Article 22
    if (percentages.invisible > 0 || percentages.ai_vectorial > 0) {
      const citation = getCitation('GDPR_ARTICLE_22');
      requirements.push({
        id: 'gdpr-article-22',
        regulation: citation.regulation,
        title: citation.title,
        description: 'Systems that make automated decisions affecting users must provide explanation mechanisms and allow human intervention.',
        applicableParadigms: ['invisible', 'ai_vectorial'],
        impactLevel: percentages.invisible > 30 || percentages.ai_vectorial > 30 ? 'high' : 'medium',
        mitigationSteps: [
          'REQUIRED: Implement audit logging for all automated decisions',
          'REQUIRED: Add "Why did this happen?" explanation UI for users',
          'REQUIRED: Provide manual override mechanism for critical actions',
          'Document decision-making logic in technical documentation',
          'Conduct regular algorithmic impact assessments',
        ],
        citation,
      });
    }

    // GDPR Article 6
    const citation6 = getCitation('GDPR_ARTICLE_6');
    requirements.push({
      id: 'gdpr-article-6',
      regulation: citation6.regulation,
      title: citation6.title,
      description: 'All data processing requires a valid legal basis. Most common: user consent or contract fulfillment.',
      applicableParadigms: ['traditional_screen', 'invisible', 'ai_vectorial', 'voice', 'spatial'],
      impactLevel: 'medium',
      mitigationSteps: [
        'Implement granular consent flow with clear opt-in checkboxes',
        'Provide easy consent withdrawal mechanism',
        'Document legal basis for each data processing activity',
        'Maintain Records of Processing Activities (ROPA)',
        'Conduct Data Protection Impact Assessment (DPIA) if high-risk',
      ],
      citation: citation6,
    });

    // GDPR Article 17
    const citation17 = getCitation('GDPR_ARTICLE_17');
    requirements.push({
      id: 'gdpr-article-17',
      regulation: citation17.regulation,
      title: citation17.title,
      description: 'Users can request deletion of their personal data within 30 days.',
      applicableParadigms: ['traditional_screen', 'invisible', 'ai_vectorial', 'voice', 'spatial'],
      impactLevel: 'medium',
      mitigationSteps: [
        'Build data deletion workflows with cascade deletes',
        'Implement 30-day SLA for deletion requests',
        'Create deletion confirmation UI for users',
        'Maintain deletion audit logs for compliance',
        'Document legal exceptions (e.g., tax retention requirements)',
      ],
      citation: citation17,
    });

    // GDPR Article 32
    if (percentages.ai_vectorial > 0 || percentages.invisible > 0) {
      const citation32 = getCitation('GDPR_ARTICLE_32');
      requirements.push({
        id: 'gdpr-article-32',
        regulation: citation32.regulation,
        title: citation32.title,
        description: 'Technical and organizational security measures required for all personal data processing.',
        applicableParadigms: ['ai_vectorial', 'invisible', 'voice'],
        impactLevel: 'medium',
        mitigationSteps: [
          'Implement end-to-end encryption for data in transit and at rest',
          'Pseudonymize personal data where possible',
          'Establish access controls and authentication',
          'Conduct regular security audits and penetration testing',
          'Maintain incident response and data breach notification procedures',
        ],
        citation: citation32,
      });
    }

    // EU AI Act - High-Risk
    const isHealthcare = answers.userDemographics?.toLowerCase().includes('healthcare') ||
      answers.userDemographics?.toLowerCase().includes('medical') ||
      answers.userDemographics?.toLowerCase().includes('health');
    const isEmployment = answers.userDemographics?.toLowerCase().includes('employment') ||
      answers.userDemographics?.toLowerCase().includes('recruitment') ||
      answers.userDemographics?.toLowerCase().includes('hiring');
    const isHighRiskContext = isHealthcare || isEmployment || answers.errorConsequence === 'Serious';

    if ((percentages.ai_vectorial > 15 || percentages.invisible > 20) && isHighRiskContext) {
      const citationAI6 = getCitation('AI_ACT_ARTICLE_6');
      requirements.push({
        id: 'ai-act-high-risk',
        regulation: citationAI6.regulation,
        title: 'High-Risk AI System Classification',
        description: 'AI systems in healthcare, employment, or critical contexts are classified as high-risk under EU AI Act.',
        applicableParadigms: ['ai_vectorial', 'invisible'],
        impactLevel: 'critical',
        mitigationSteps: [
          'REQUIRED: Conduct AI risk assessment per Article 9',
          'REQUIRED: Implement human-in-the-loop oversight',
          'REQUIRED: Conduct bias testing across protected characteristics',
          'REQUIRED: Prepare comprehensive technical documentation',
          'REQUIRED: Obtain CE mark after conformity assessment',
          'REQUIRED: Register system in EU AI Database before launch',
          'Budget for quarterly compliance audits',
          'Engage legal counsel specializing in EU AI Act compliance',
          'Implement continuous monitoring for fairness drift',
        ],
        citation: citationAI6,
      });
    }

    // EU AI Act Article 13 - Transparency
    if (percentages.ai_vectorial > 10) {
      const citationAI13 = getCitation('AI_ACT_ARTICLE_13');
      requirements.push({
        id: 'ai-act-transparency',
        regulation: citationAI13.regulation,
        title: citationAI13.title,
        description: 'Users must be clearly informed when interacting with AI systems.',
        applicableParadigms: ['ai_vectorial'],
        impactLevel: 'medium',
        mitigationSteps: [
          'Add visible "Powered by AI" badge on AI-generated content',
          'Provide "How does this AI work?" explainer page',
          'Show confidence scores on AI-generated outputs',
          'Clearly distinguish AI-generated vs human-generated content',
          'Offer opt-out mechanism for AI features where technically feasible',
        ],
        citation: citationAI13,
      });
    }

    // Schrems II
    if (percentages.ai_vectorial > 0 || percentages.voice > 0) {
      const citationSchrems = getCitation('SCHREMS_II');
      requirements.push({
        id: 'schrems-ii-data-transfer',
        regulation: citationSchrems.regulation,
        title: 'Data Transfer Restrictions (Schrems II)',
        description: 'Transferring personal data to US-based cloud providers requires supplementary measures beyond SCCs.',
        applicableParadigms: ['ai_vectorial', 'voice'],
        impactLevel: 'high',
        mitigationSteps: [
          'REQUIRED: Use only EU-based data centers',
          'Alternative: Process data on-device/edge (no cloud data transfer)',
          'REQUIRED: Sign Standard Contractual Clauses (SCCs) with all processors',
          'Conduct Transfer Impact Assessment (TIA)',
          'Implement supplementary measures: encryption, pseudonymization, data minimization',
          'Avoid US-headquartered cloud providers where feasible',
          'Document data flow and residency in DPA/contract terms',
        ],
        citation: citationSchrems,
      });
    }

    // ePrivacy Directive
    if (percentages.traditional_screen > 50) {
      const citationEPrivacy = getCitation('EPRIVACY_DIRECTIVE');
      requirements.push({
        id: 'eprivacy-cookies',
        regulation: citationEPrivacy.regulation,
        title: citationEPrivacy.title,
        description: 'Websites must obtain explicit consent before storing cookies (except strictly necessary ones).',
        applicableParadigms: ['traditional_screen'],
        impactLevel: 'low',
        mitigationSteps: [
          'Implement GDPR-compliant cookie banner with granular choices',
          'Default all non-essential cookies to OFF',
          'Provide detailed cookie settings page',
          'Audit all third-party scripts for tracking',
          'Update privacy policy with complete cookie inventory',
        ],
        citation: citationEPrivacy,
      });
    }

    // DPIA
    if (percentages.ai_vectorial > 20 || percentages.invisible > 25 || isHighRiskContext) {
      const citationDPIA = getCitation('DPIA_GUIDANCE');
      requirements.push({
        id: 'gdpr-dpia',
        regulation: citationDPIA.regulation,
        title: 'Data Protection Impact Assessment (DPIA)',
        description: 'Mandatory DPIA required for high-risk processing including AI systems and automated decision-making.',
        applicableParadigms: ['ai_vectorial', 'invisible'],
        impactLevel: 'medium',
        mitigationSteps: [
          'Conduct systematic assessment of data processing risks',
          'Document processing purposes, necessity, and legitimacy',
          'Identify potential impacts on user rights and freedoms',
          'Describe mitigation measures and safeguards',
          'Consult with Data Protection Authority if high risk identified',
          'Review and update DPIA before system deployment and at least annually',
        ],
        citation: citationDPIA,
      });
    }
  }

  // ─── US Regulations (US & Global) ────────────────────────────────────────────

  if (isUS || isGlobal) {
    // ADA Title III
    requirements.push({
      id: 'ada-title-iii',
      regulation: US_CITATIONS.ADA_TITLE_III.regulation,
      title: US_CITATIONS.ADA_TITLE_III.title,
      description: 'Digital interfaces must be accessible to people with disabilities. Violations can result in lawsuits and fines.',
      applicableParadigms: ['traditional_screen', 'voice', 'spatial'],
      impactLevel: 'high',
      mitigationSteps: [
        'REQUIRED: Achieve WCAG 2.1 Level AA compliance',
        'Implement keyboard-only navigation',
        'Test with screen readers (NVDA, JAWS)',
        'Provide alternative text for all images and media',
        'Ensure color contrast meets 4.5:1 minimum ratio',
      ],
      citation: US_CITATIONS.ADA_TITLE_III,
    });

    // CCPA
    requirements.push({
      id: 'ccpa-privacy',
      regulation: US_CITATIONS.CCPA.regulation,
      title: US_CITATIONS.CCPA.title,
      description: 'California residents have rights to know what personal data is collected, delete data, and opt-out of data sales.',
      applicableParadigms: ['traditional_screen', 'invisible', 'ai_vectorial', 'voice'],
      impactLevel: 'medium',
      mitigationSteps: [
        'Add "Do Not Sell My Personal Information" link',
        'Implement data access request portal',
        'Provide 45-day response to consumer requests',
        'Maintain records of data processing activities',
      ],
      citation: US_CITATIONS.CCPA,
    });

    // FTC Act Section 5
    if (percentages.ai_vectorial > 0 || percentages.invisible > 0) {
      requirements.push({
        id: 'ftc-section-5',
        regulation: US_CITATIONS.FTC_SECTION_5.regulation,
        title: US_CITATIONS.FTC_SECTION_5.title,
        description: 'Prohibits unfair or deceptive practices including dark patterns, misleading AI representations, and hidden fees.',
        applicableParadigms: ['traditional_screen', 'invisible', 'ai_vectorial'],
        impactLevel: 'medium',
        mitigationSteps: [
          'Avoid deceptive UI patterns (fake urgency, hidden costs)',
          'Clearly disclose when AI systems are in use',
          'Honest representation of AI capabilities',
          'No manipulative design to coerce user actions',
        ],
        citation: US_CITATIONS.FTC_SECTION_5,
      });
    }
  }

  // ─── Internal/Corporate Regulations ──────────────────────────────────────────

  if (isInternal) {
    requirements.push({
      id: 'internal-governance',
      regulation: US_CITATIONS.INTERNAL_GOVERNANCE.regulation,
      title: US_CITATIONS.INTERNAL_GOVERNANCE.title,
      description: 'Company-specific data handling, security standards, and compliance requirements for internal systems.',
      applicableParadigms: ['traditional_screen', 'invisible', 'ai_vectorial', 'voice', 'spatial'],
      impactLevel: 'low',
      mitigationSteps: [
        'Follow corporate data classification standards',
        'Implement role-based access controls (RBAC)',
        'Regular security training for development team',
        'Annual compliance audit with IT security team',
      ],
      citation: US_CITATIONS.INTERNAL_GOVERNANCE,
    });
  }

  // ─── Calculate Risk Level ────────────────────────────────────────────────────

  const criticalCount = requirements.filter((r) => r.impactLevel === 'critical').length;
  const highCount = requirements.filter((r) => r.impactLevel === 'high').length;

  const overallRiskLevel: 'low' | 'medium' | 'high' | 'critical' =
    criticalCount > 0 ? 'critical' :
    highCount > 2 ? 'high' :
    highCount > 0 ? 'medium' : 'low';

  // ─── Risk Rationale & Categories ─────────────────────────────────────────────

  let riskRationale = '';
  const complianceCategories = { procedural: [] as string[], technical: [] as string[], organizational: [] as string[] };
  const preLaunchBlockers: string[] = [];
  const officialGuidance: { title: string; url: string }[] = [];

  if (overallRiskLevel === 'critical') {
    riskRationale = `Your design qualifies as a high-risk AI system under EU AI Act Annex III due to ${Math.round(percentages.ai_vectorial)}% AI usage in covered sectors. Article 43 requires third-party conformity assessment by notified bodies before market placement.`;
    complianceCategories.procedural = ['Conformity assessment (EU AI Act Art. 43)', 'Technical documentation (Annex IV)', 'EU Database registration (Art. 60)'];
    complianceCategories.technical = ['Risk management system (Art. 9)', 'Data governance measures (Art. 10)', 'Human oversight mechanisms (Art. 14)'];
    complianceCategories.organizational = ['Quality management system (Art. 17)', 'Post-market monitoring (Art. 72)'];
    preLaunchBlockers.push('Conformity assessment by notified body (EU AI Act Art. 43)', 'CE marking affixation (Art. 49)', 'EU Database registration (Art. 60)');
    officialGuidance.push(
      { title: 'EU AI Act - Official Text', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689' },
      { title: 'Commission Implementing Regulation - Conformity Assessment', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' }
    );
  } else if (overallRiskLevel === 'high') {
    if (isUS || isGlobal) {
      riskRationale = `Your design requires ADA accessibility compliance and potentially CCPA privacy obligations. ${isGlobal ? `Additionally, ${Math.round(percentages.ai_vectorial)}% AI usage triggers EU AI Act transparency obligations.` : ''}`;
    } else {
      const hasAI = percentages.ai_vectorial > 20;
      const hasInvisible = percentages.invisible > 25;
      if (hasAI && hasInvisible) {
        riskRationale = `Your design combines automated decision-making (${Math.round(percentages.ai_vectorial)}% AI, GDPR Art. 22) with invisible automation (${Math.round(percentages.invisible)}% ambient). This triggers GDPR Art. 35 DPIA requirements.`;
      } else if (hasAI) {
        riskRationale = `AI systems (${Math.round(percentages.ai_vectorial)}%) processing personal data require GDPR Chapter V safeguards and EU AI Act transparency obligations (Art. 13).`;
      } else {
        riskRationale = `Invisible automation (${Math.round(percentages.invisible)}%) making decisions about users requires GDPR Art. 22 safeguards.`;
      }
    }
    complianceCategories.procedural = isUS
      ? ['ADA accessibility audit', 'CCPA privacy notice', 'FTC compliance review']
      : ['Data Protection Impact Assessment (GDPR Art. 35)', 'Standard Contractual Clauses with processors (Art. 28)', 'Records of Processing Activities (Art. 30)'];
    complianceCategories.technical = isUS
      ? ['WCAG 2.1 Level AA implementation', 'Consumer data request portal', 'AI disclosure mechanisms']
      : ['Audit logging for automated decisions', 'Explanation mechanisms (GDPR Art. 22)', 'Data encryption and pseudonymization (Art. 32)'];
    complianceCategories.organizational = isUS
      ? ['Accessibility training for development team', 'Annual compliance audit']
      : ['Data Protection Officer appointment (if required, Art. 37)', 'Regular compliance audits'];
    preLaunchBlockers.push(
      ...(isUS
        ? ['WCAG 2.1 Level AA audit passed', 'CCPA-compliant privacy policy published']
        : ['Completed DPIA with DPO review (GDPR Art. 35)', 'Signed SCCs with all processors (Art. 46)'])
    );
    officialGuidance.push(
      ...(isUS
        ? [{ title: 'ADA Design Standards', url: 'https://www.ada.gov/law-and-regs/design-standards/' }, { title: 'CCPA Official Text', url: 'https://oag.ca.gov/privacy/ccpa' }]
        : [{ title: 'ICO - Guide to GDPR', url: 'https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/' }, { title: 'EDPB - DPIA Guidelines', url: 'https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32017-data-protection-impact-assessment-dpia_en' }])
    );
  } else if (overallRiskLevel === 'medium') {
    if (isUS) {
      riskRationale = `Standard US compliance applies. CCPA privacy obligations and ADA accessibility requirements are applicable. ${percentages.ai_vectorial > 0 ? `FTC Section 5 applies to AI disclosure (${Math.round(percentages.ai_vectorial)}% AI usage).` : ''}`;
    } else if (isInternal) {
      riskRationale = 'Internal tools have reduced regulatory burden but still require corporate governance compliance and basic security measures.';
    } else {
      riskRationale = `Standard GDPR compliance applies. ${percentages.ai_vectorial > 0 ? `Limited AI usage (${Math.round(percentages.ai_vectorial)}%) requires transparency disclosures per EU AI Act Art. 52.` : 'Traditional screen interfaces require cookie consent (ePrivacy Directive Art. 5.3) and privacy policies (GDPR Art. 13).'}`;
    }
    complianceCategories.procedural = isUS
      ? ['Privacy policy (CCPA)', 'Accessibility statement', 'Data processing register']
      : isInternal
      ? ['Internal data governance policy', 'Access control documentation']
      : ['Privacy policy (GDPR Art. 13)', 'Cookie consent mechanism (ePrivacy Dir. Art. 5.3)', 'Data processing register (Art. 30)'];
    complianceCategories.technical = isUS
      ? ['WCAG 2.1 compliance', 'Consumer data portal', 'Privacy-by-design principles']
      : isInternal
      ? ['Role-based access controls', 'Data encryption at rest']
      : ['Cookie consent banner implementation', 'Privacy-by-design principles (Art. 25)'];
    complianceCategories.organizational = isUS
      ? ['Staff training on accessibility', 'Incident response procedures']
      : isInternal
      ? ['Security awareness training', 'Annual IT audit']
      : ['Staff training on data protection', 'Incident response procedures (Art. 33-34)'];
    preLaunchBlockers.push(
      ...(isUS
        ? ['Published privacy policy (CCPA)', 'Basic accessibility audit']
        : isInternal
        ? ['Internal governance sign-off', 'Security review completed']
        : ['Published privacy policy (GDPR Art. 13)', 'Cookie consent mechanism (if web-based)'])
    );
    officialGuidance.push(
      ...(isUS
        ? [{ title: 'CCPA - Official Text', url: 'https://oag.ca.gov/privacy/ccpa' }, { title: 'FTC Act', url: 'https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act' }]
        : isInternal
        ? [{ title: 'ISO 27001 Information Security', url: 'https://www.iso.org/standard/75652.html' }]
        : [{ title: 'GDPR - Official Text', url: 'https://eur-lex.europa.eu/eli/reg/2016/679' }, { title: 'ePrivacy Directive', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058' }])
    );
  } else {
    riskRationale = isInternal
      ? 'Minimal regulatory burden for internal tools. Standard corporate security practices and basic data governance satisfy requirements.'
      : 'Minimal regulatory burden. Standard terms of service and basic privacy practices satisfy legal requirements for non-AI, non-automated interfaces.';
    complianceCategories.procedural = ['Terms of Service', 'Privacy Policy'];
    complianceCategories.technical = ['Standard security practices'];
    complianceCategories.organizational = [];
    officialGuidance.push(
      ...(isUS
        ? [{ title: 'FTC Business Guidance', url: 'https://www.ftc.gov/business-guidance' }]
        : [{ title: 'GDPR - Official Text', url: 'https://eur-lex.europa.eu/eli/reg/2016/679' }])
    );
  }

  const recommendations = [
    'Review official guidance documents for your specific use case',
    'Consult qualified legal counsel for production deployment',
    'Implement privacy-by-design principles from project inception',
    'Document all design decisions and compliance measures for audit trail',
  ];

  return {
    region: regionLabel,
    applicable: true,
    requirements,
    overallRiskLevel,
    riskRationale,
    complianceCategories,
    preLaunchBlockers,
    officialGuidance,
    recommendations,
    disclaimer: 'ACADEMIC FRAMEWORK DISCLAIMER: This analysis identifies potentially applicable regulations based on interface design patterns and regulatory text. It does NOT constitute legal advice, cost estimates, or implementation timelines. Actual compliance requirements vary by jurisdiction, organizational context, data processing activities, and legal interpretation. Consult qualified legal counsel and data protection officers for production systems.',
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
    all: 'All Paradigms',
  };
  return names[paradigm] || paradigm;
}
