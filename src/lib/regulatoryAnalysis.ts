/**
 * NEXUS - Regulatory Analysis Generator with Legal Citations
 * 
 * Purpose: Generate compliance requirements with proper EUR-Lex citations
 * 
 * Key Regulations:
 * - GDPR (EU) 2016/679 with EUR-Lex links
 * - EU AI Act (EU) 2024/1689
 * - ePrivacy Directive 2002/58/EC
 * - Schrems II (CJEU C-311/18)
 * - DPIA Guidance (EDPB)
 */

import { getCitation } from './regulatoryCitations';
import type { AssessmentAnswers, RecommendationResult, ParadigmScores } from '@/types/assessment';
import type { LegalCitation } from './regulatoryCitations';

export interface RegulatoryRequirement {
  id: string;
  regulation: string;              // e.g., "GDPR Article 22"
  title: string;                   // e.g., "Right to Explanation"
  description: string;             // What it requires
  applicableParadigms: string[];   // Which paradigms this affects
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationSteps: string[];       // How to comply
  citation: LegalCitation;         // Legal source with EUR-Lex link
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
  const percentages = recommendation.allScores;
  
  // ============================================
  // GDPR ARTICLE 22 - Automated Decisions
  // ============================================
  
   if ((percentages as any).invisible > 0 || (percentages as any).ai_vectorial > 0) {
     const citation = getCitation('GDPR_ARTICLE_22');
     
     requirements.push({
       id: 'gdpr-article-22',
       regulation: citation.regulation,
       title: citation.title,
       description: 'Systems that make automated decisions affecting users must provide explanation mechanisms and allow human intervention. Critical for invisible automation and AI systems.',
       applicableParadigms: ['invisible', 'ai_vectorial'],
       impactLevel: (percentages as any).invisible > 30 || (percentages as any).ai_vectorial > 30 ? 'high' : 'medium',
       mitigationSteps: [
         'REQUIRED: Implement audit logging for all automated decisions',
         'REQUIRED: Add "Why did this happen?" explanation UI for users',
         'REQUIRED: Provide manual override mechanism for critical actions',
         'Document decision-making logic in technical documentation',
         'Conduct regular algorithmic impact assessments'
       ],
       citation
     });
   }
  
  // ============================================
  // GDPR ARTICLE 6 - Legal Basis for Processing
  // ============================================
  
   const citation6 = getCitation('GDPR_ARTICLE_6');
   requirements.push({
     id: 'gdpr-article-6',
     regulation: citation6.regulation,
     title: citation6.title,
     description: 'All data processing requires a valid legal basis. Most common: user consent or contract fulfillment. Affects all paradigms that collect user data.',
     applicableParadigms: ['traditional_screen', 'invisible', 'ai_vectorial', 'voice', 'spatial'],
     impactLevel: 'medium',
     mitigationSteps: [
       'Implement granular consent flow with clear opt-in checkboxes',
       'Provide easy consent withdrawal mechanism',
       'Document legal basis for each data processing activity',
       'Maintain Records of Processing Activities (ROPA)',
       'Conduct Data Protection Impact Assessment (DPIA) if high-risk'
     ],
     citation: citation6
   });
  
  // ============================================
  // GDPR ARTICLE 17 - Right to be Forgotten
  // ============================================
  
   const citation17 = getCitation('GDPR_ARTICLE_17');
   requirements.push({
     id: 'gdpr-article-17',
     regulation: citation17.regulation,
     title: citation17.title,
     description: 'Users can request deletion of their personal data. System must support full data erasure workflows within 30 days.',
     applicableParadigms: ['traditional_screen', 'invisible', 'ai_vectorial', 'voice', 'spatial'],
     impactLevel: 'medium',
     mitigationSteps: [
       'Build data deletion workflows with cascade deletes',
       'Implement 30-day SLA for deletion requests',
       'Create deletion confirmation UI for users',
       'Maintain deletion audit logs for compliance',
       'Document legal exceptions (e.g., tax retention requirements)'
     ],
     citation: citation17
   });
  
  // ============================================
  // GDPR ARTICLE 32 - Security
  // ============================================
  
   if ((percentages as any).ai_vectorial > 0 || (percentages as any).invisible > 0) {
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
         'Maintain incident response and data breach notification procedures'
       ],
       citation: citation32
     });
   }
  
  // ============================================
  // EU AI ACT - High-Risk Systems
  // ============================================
  
  const isHealthcare = answers.userDemographics?.toLowerCase().includes('healthcare') ||
                      answers.userDemographics?.toLowerCase().includes('medical') ||
                      answers.userDemographics?.toLowerCase().includes('health');
  
  const isEmployment = answers.userDemographics?.toLowerCase().includes('employment') ||
                      answers.userDemographics?.toLowerCase().includes('recruitment') ||
                      answers.userDemographics?.toLowerCase().includes('hiring');
  
  const isHighRiskContext = isHealthcare || isEmployment || answers.errorConsequence === 'Serious';
  
   if (((percentages as any).ai_vectorial > 15 || (percentages as any).invisible > 20) && isHighRiskContext) {
     const citationAI6 = getCitation('AI_ACT_ARTICLE_6');
     
     requirements.push({
       id: 'ai-act-high-risk',
       regulation: citationAI6.regulation,
       title: 'High-Risk AI System Classification',
       description: 'AI systems in healthcare, employment, or critical contexts are classified as high-risk under EU AI Act. Requires conformity assessment, documentation, and EU AI Database registration.',
       applicableParadigms: ['ai_vectorial', 'invisible'],
       impactLevel: 'critical',
       mitigationSteps: [
         'REQUIRED: Conduct AI risk assessment per Article 9 (bias, discrimination, safety)',
         'REQUIRED: Implement human-in-the-loop oversight for critical decisions',
         'REQUIRED: Conduct bias testing across protected characteristics (gender, race, age, etc.)',
         'REQUIRED: Prepare comprehensive technical documentation',
         'REQUIRED: Obtain CE mark after conformity assessment',
         'REQUIRED: Register system in EU AI Database before launch',
         'Budget for quarterly compliance audits',
         'Engage legal counsel specializing in EU AI Act compliance',
         'Implement continuous monitoring for fairness drift'
       ],
       citation: citationAI6
     });
   }
  
  // ============================================
  // EU AI ACT ARTICLE 13 - Transparency
  // ============================================
  
   if ((percentages as any).ai_vectorial > 10) {
     const citationAI13 = getCitation('AI_ACT_ARTICLE_13');
     
     requirements.push({
       id: 'ai-act-transparency',
       regulation: citationAI13.regulation,
       title: citationAI13.title,
       description: 'Users must be clearly informed when interacting with AI systems. Requires visible AI disclosure and explanation of system functioning.',
       applicableParadigms: ['ai_vectorial'],
       impactLevel: 'medium',
       mitigationSteps: [
         'Add visible "Powered by AI" badge on AI-generated content',
         'Provide "How does this AI work?" explainer page',
         'Show confidence scores on AI-generated outputs',
         'Clearly distinguish AI-generated vs human-generated content',
         'Offer opt-out mechanism for AI features where technically feasible'
       ],
       citation: citationAI13
     });
   }
  
  // ============================================
  // SCHREMS II - Data Sovereignty
  // ============================================
  
   if ((percentages as any).ai_vectorial > 0 || (percentages as any).voice > 0) {
     const citationSchrems = getCitation('SCHREMS_II');
     
     requirements.push({
       id: 'schrems-ii-data-transfer',
       regulation: citationSchrems.regulation,
       title: 'Data Transfer Restrictions (Schrems II)',
       description: 'Transferring personal data to US-based cloud providers requires supplementary measures beyond Standard Contractual Clauses (SCCs).',
       applicableParadigms: ['ai_vectorial', 'voice'],
       impactLevel: 'high',
       mitigationSteps: [
         'REQUIRED: Use only EU-based data centers (AWS eu-west-1, Azure West Europe, etc.)',
         'Alternative: Process data on-device/edge (no cloud data transfer)',
         'REQUIRED: Sign Standard Contractual Clauses (SCCs) with all processors',
         'Conduct Transfer Impact Assessment (TIA) to identify US surveillance laws',
         'Implement supplementary measures: encryption, pseudonymization, data minimization',
         'Avoid US-headquartered cloud providers where feasible',
         'Document data flow and residency in DPA/contract terms'
       ],
       citation: citationSchrems
     });
   }
  
  // ============================================
  // ePRIVACY DIRECTIVE - Cookies
  // ============================================
  
   if ((percentages as any).traditional_screen > 50) {
     const citationEPrivacy = getCitation('EPRIVACY_DIRECTIVE');
     
     requirements.push({
       id: 'eprivacy-cookies',
       regulation: citationEPrivacy.regulation,
       title: citationEPrivacy.title,
       description: 'Websites must obtain explicit consent before storing cookies (except strictly necessary ones). Requires GDPR-compliant cookie banner.',
       applicableParadigms: ['traditional_screen'],
       impactLevel: 'low',
       mitigationSteps: [
         'Implement GDPR-compliant cookie banner with granular choices',
         'Default all non-essential cookies to OFF',
         'Provide detailed cookie settings page',
         'Audit all third-party scripts for tracking',
         'Update privacy policy with complete cookie inventory'
       ],
       citation: citationEPrivacy
     });
   }
  
  // ============================================
  // DPIA - High-Risk Processing
  // ============================================
  
   if ((percentages as any).ai_vectorial > 20 || (percentages as any).invisible > 25 || isHighRiskContext) {
     const citationDPIA = getCitation('DPIA_GUIDANCE');
     
     requirements.push({
       id: 'gdpr-dpia',
       regulation: citationDPIA.regulation,
       title: 'Data Protection Impact Assessment (DPIA)',
       description: 'Mandatory DPIA required for high-risk processing including AI systems, automated decision-making, and large-scale processing.',
       applicableParadigms: ['ai_vectorial', 'invisible'],
       impactLevel: 'medium',
       mitigationSteps: [
         'Conduct systematic assessment of data processing risks',
         'Document processing purposes, necessity, and legitimacy',
         'Identify potential impacts on user rights and freedoms',
         'Describe mitigation measures and safeguards',
         'Consult with Data Protection Authority if high risk identified',
         'Review and update DPIA before system deployment and at least annually'
       ],
       citation: citationDPIA
     });
   }
  
   // ============================================
   // CALCULATE RISK LEVEL
   // ============================================
   
   const criticalCount = requirements.filter(r => r.impactLevel === 'critical').length;
   const highCount = requirements.filter(r => r.impactLevel === 'high').length;
   
   const overallRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 
     criticalCount > 0 ? 'critical' :
     highCount > 2 ? 'high' :
     highCount > 0 ? 'medium' : 'low';
   
   // Generate academic risk rationale
   let riskRationale = '';
   const complianceCategories = {
     procedural: [] as string[],
     technical: [] as string[],
     organizational: [] as string[]
   };
   const preLaunchBlockers: string[] = [];
   const officialGuidance: { title: string; url: string }[] = [];

   if (overallRiskLevel === 'critical') {
     riskRationale = `Your design qualifies as a high-risk AI system under EU AI Act Annex III due to ${Math.round((percentages as any).ai_vectorial)}% AI usage in covered sectors. Article 43 requires third-party conformity assessment by notified bodies before market placement.`;
     complianceCategories.procedural = [
       'Conformity assessment (EU AI Act Art. 43)',
       'Technical documentation (Annex IV)',
       'EU Database registration (Art. 60)'
     ];
     complianceCategories.technical = [
       'Risk management system (Art. 9)',
       'Data governance measures (Art. 10)',
       'Human oversight mechanisms (Art. 14)'
     ];
     complianceCategories.organizational = [
       'Quality management system (Art. 17)',
       'Post-market monitoring (Art. 72)'
     ];
     preLaunchBlockers.push(
       'Conformity assessment by notified body (EU AI Act Art. 43)',
       'CE marking affixation (Art. 49)',
       'EU Database registration (Art. 60)'
     );
     officialGuidance.push(
       { title: 'EU AI Act - Official Text', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689' },
       { title: 'Commission Implementing Regulation - Conformity Assessment', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' }
     );
   } else if (overallRiskLevel === 'high') {
     const hasAI = (percentages as any).ai_vectorial > 20;
     const hasInvisible = (percentages as any).invisible > 25;
     if (hasAI && hasInvisible) {
       riskRationale = `Your design combines automated decision-making (${Math.round((percentages as any).ai_vectorial)}% AI, GDPR Art. 22) with invisible automation (${Math.round((percentages as any).invisible)}% ambient). This triggers GDPR Art. 35 DPIA requirements for large-scale automated profiling.`;
     } else if (hasAI) {
       riskRationale = `AI systems (${Math.round((percentages as any).ai_vectorial)}%) processing personal data require GDPR Chapter V safeguards for international transfers and EU AI Act transparency obligations (Art. 13).`;
     } else {
       riskRationale = `Invisible automation (${Math.round((percentages as any).invisible)}%) making decisions about users requires GDPR Art. 22 safeguards: right to human intervention and explanation.`;
     }
     complianceCategories.procedural = [
       'Data Protection Impact Assessment (GDPR Art. 35)',
       'Standard Contractual Clauses with processors (Art. 28)',
       'Records of Processing Activities (Art. 30)'
     ];
     complianceCategories.technical = [
       'Audit logging for automated decisions',
       'Explanation mechanisms (GDPR Art. 22)',
       'Data encryption and pseudonymization (Art. 32)'
     ];
     complianceCategories.organizational = [
       'Data Protection Officer appointment (if required, Art. 37)',
       'Regular compliance audits'
     ];
     preLaunchBlockers.push(
       'Completed DPIA with DPO review (GDPR Art. 35)',
       'Signed SCCs with all processors (Art. 46)'
     );
     officialGuidance.push(
       { title: 'ICO - Guide to GDPR', url: 'https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/' },
       { title: 'EDPB - DPIA Guidelines', url: 'https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32017-data-protection-impact-assessment-dpia_en' }
     );
   } else if (overallRiskLevel === 'medium') {
     riskRationale = `Standard GDPR compliance applies. ${(percentages as any).ai_vectorial > 0 ? `Limited AI usage (${Math.round((percentages as any).ai_vectorial)}%) requires transparency disclosures per EU AI Act Art. 52.` : 'Traditional screen interfaces require cookie consent (ePrivacy Directive Art. 5.3) and privacy policies (GDPR Art. 13).'}`;
     complianceCategories.procedural = [
       'Privacy policy (GDPR Art. 13)',
       'Cookie consent mechanism (ePrivacy Dir. Art. 5.3)',
       'Data processing register (Art. 30)'
     ];
     complianceCategories.technical = [
       'Cookie consent banner implementation',
       'Privacy-by-design principles (Art. 25)'
     ];
     complianceCategories.organizational = [
       'Staff training on data protection',
       'Incident response procedures (Art. 33-34)'
     ];
     preLaunchBlockers.push(
       'Published privacy policy (GDPR Art. 13)',
       'Cookie consent mechanism (if web-based)'
     );
     officialGuidance.push(
       { title: 'GDPR - Official Text', url: 'https://eur-lex.europa.eu/eli/reg/2016/679' },
       { title: 'ePrivacy Directive', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058' }
     );
   } else {
     riskRationale = 'Minimal regulatory burden. Standard terms of service and basic privacy practices satisfy legal requirements for non-AI, non-automated interfaces.';
     complianceCategories.procedural = ['Terms of Service', 'Privacy Policy'];
     complianceCategories.technical = ['Standard security practices'];
     complianceCategories.organizational = [];
     officialGuidance.push(
       { title: 'GDPR - Official Text', url: 'https://eur-lex.europa.eu/eli/reg/2016/679' }
     );
   }

   const recommendations = [
     'Review official guidance documents for your specific use case',
     'Consult qualified data protection counsel for production deployment',
     'Implement privacy-by-design principles from project inception (GDPR Art. 25)',
     'Document all design decisions and compliance measures for audit trail'
   ];

   return {
     region: geography === 'Primarily Europe' ? 'European Union' : 'Global (EU standards apply)',
     applicable: true,
     requirements,
     overallRiskLevel,
     riskRationale,
     complianceCategories,
     preLaunchBlockers,
     officialGuidance,
     recommendations,
     disclaimer: '⚠️ ACADEMIC FRAMEWORK DISCLAIMER: This analysis identifies potentially applicable regulations based on interface design patterns and regulatory text. It does NOT constitute legal advice, cost estimates, or implementation timelines. Actual compliance requirements vary by jurisdiction, organizational context, data processing activities, and legal interpretation. Consult qualified legal counsel and data protection officers for production systems.'
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
