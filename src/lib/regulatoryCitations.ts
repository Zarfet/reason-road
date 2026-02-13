/**
 * Legal Citations for Regulatory Requirements
 * 
 * All official EUR-Lex and government source URLs
 */

export interface LegalCitation {
  regulation: string;
  title: string;
  url: string;
  section?: string;
  keyRequirement: string;
  authors?: string;
  source?: string;
  year: number;
  type: 'regulation' | 'article' | 'directive' | 'case_law';
}

export const REGULATORY_CITATIONS = {
  // GDPR
  GDPR_FULL_TEXT: {
    regulation: 'GDPR (EU) 2016/679',
    title: 'General Data Protection Regulation',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
    source: 'Official Journal of the European Union',
    year: 2016,
    type: 'regulation' as const,
    keyRequirement: 'Comprehensive data protection regulation applicable to all processing of personal data in EU'
  },
  
  GDPR_ARTICLE_22: {
    regulation: 'GDPR Article 22',
    title: 'Automated individual decision-making, including profiling',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj#d1e2143-1-1',
    section: 'Article 22(1): Right not to be subject to automated decision-making',
    year: 2016,
    keyRequirement: 'Individuals have the right to obtain human intervention, express their point of view, and contest automated decisions',
    type: 'article' as const
  },
  
  GDPR_ARTICLE_6: {
    regulation: 'GDPR Article 6',
    title: 'Lawfulness of processing',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj#d1e1816-1-1',
    section: 'Article 6(1): Legal basis for data processing',
    year: 2016,
    keyRequirement: 'Processing lawful only if at least one legal basis applies (consent, contract, legal obligation, vital interests, public task, legitimate interests)',
    type: 'article' as const
  },
  
  GDPR_ARTICLE_17: {
    regulation: 'GDPR Article 17',
    title: 'Right to erasure ("right to be forgotten")',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj#d1e1981-1-1',
    section: 'Article 17(1): Right to have personal data erased',
    year: 2016,
    keyRequirement: 'Users can request deletion of personal data when no longer necessary for original purpose or consent withdrawn',
    type: 'article' as const
  },
  
  GDPR_ARTICLE_32: {
    regulation: 'GDPR Article 32',
    title: 'Security of processing',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj#d1e2163-1-1',
    section: 'Article 32: Technical and organizational measures',
    year: 2016,
    keyRequirement: 'Implement encryption, pseudonymization, access controls, and regular security assessments',
    type: 'article' as const
  },
  
  // EU AI Act
  AI_ACT_FULL_TEXT: {
    regulation: 'EU AI Act (EU) 2024/1689',
    title: 'Regulation on Artificial Intelligence',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
    source: 'Official Journal of the European Union',
    year: 2024,
    type: 'regulation' as const,
    keyRequirement: 'Comprehensive regulation of AI systems in the EU, effective from August 1, 2026'
  },
  
  AI_ACT_ARTICLE_6: {
    regulation: 'EU AI Act Article 6',
    title: 'Classification of AI systems as high-risk',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689#d1e1046-1-1',
    section: 'Article 6: High-risk AI system classification rules',
    year: 2024,
    keyRequirement: 'AI systems in critical sectors (healthcare, employment, law enforcement, biometric identification) classified as high-risk',
    type: 'article' as const
  },
  
  AI_ACT_ARTICLE_9: {
    regulation: 'EU AI Act Article 9',
    title: 'Risk management system for high-risk AI',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689#d1e1192-1-1',
    section: 'Article 9: Mandatory risk management for high-risk AI systems',
    year: 2024,
    keyRequirement: 'Continuous risk assessment, bias testing, human oversight mechanisms required throughout AI lifecycle',
    type: 'article' as const
  },
  
  AI_ACT_ARTICLE_13: {
    regulation: 'EU AI Act Article 13',
    title: 'Transparency and user information for AI systems',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689#d1e1360-1-1',
    section: 'Article 13: Information to users about AI systems',
    year: 2024,
    keyRequirement: 'Users must be informed when interacting with AI systems and understand their functioning, capabilities and limitations',
    type: 'article' as const
  },
  
  AI_ACT_ARTICLE_35: {
    regulation: 'EU AI Act Article 35',
    title: 'EU AI Database registration for high-risk systems',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689#d1e2082-1-1',
    section: 'Article 35: High-risk AI systems must be registered in EU AI Database',
    year: 2024,
    keyRequirement: 'Providers must register high-risk AI systems before placing on EU market',
    type: 'article' as const
  },
  
  // Schrems II
  SCHREMS_II: {
    regulation: 'CJEU Case C-311/18 (Schrems II)',
    title: 'Data Protection Commissioner v Facebook Ireland Limited',
    url: 'https://curia.europa.eu/juris/document/document.jsf?docid=228677&doclang=EN',
    source: 'Court of Justice of the European Union',
    year: 2020,
    keyRequirement: 'Invalidated Privacy Shield framework; requires supplementary measures (encryption, data minimization) for transfers to US',
    type: 'case_law' as const
  },
  
  // ePrivacy Directive
  EPRIVACY_DIRECTIVE: {
    regulation: 'ePrivacy Directive 2002/58/EC',
    title: 'Directive on privacy and electronic communications',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0058-20091219',
    source: 'Official Journal of the European Union',
    year: 2002,
    keyRequirement: 'Requires explicit prior consent for cookies and tracking technologies (except strictly necessary)',
    type: 'directive' as const
  },
  
  // DPIA
  DPIA_GUIDANCE: {
    regulation: 'GDPR Article 35 & EDPB Guidelines 04/2020',
    title: 'Data Protection Impact Assessment (DPIA)',
    url: 'https://edpb.ec.europa.eu/our-work-tools/our-documents/guidelines/guidelines-042020-data-protection-impact_en',
    source: 'European Data Protection Board',
    year: 2020,
    keyRequirement: 'Mandatory DPIA required for high-risk processing, AI systems, and large-scale automated processing',
    type: 'directive' as const
  }
};

export function getCitation(key: keyof typeof REGULATORY_CITATIONS): LegalCitation {
  return REGULATORY_CITATIONS[key];
}
