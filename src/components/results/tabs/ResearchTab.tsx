/**
 * Research Tab - Supporting research and case studies
 * 
 * Uses existing ResearchPanel and CaseStudiesPanel components
 */

import { BentoGrid, BentoBox, BentoHeader } from '../bento/BentoGrid';
import { ResearchPanel } from '../ResearchPanel';
import { CaseStudiesPanel } from '../CaseStudiesPanel';
import { BookOpen, Briefcase } from 'lucide-react';
import type { ParadigmScores } from '@/types/assessment';

interface ResearchTabProps {
  paradigm: keyof ParadigmScores;
  userDemographics?: string;
}

export function ResearchTab({ paradigm, userDemographics }: ResearchTabProps) {
  return (
    <BentoGrid className="mt-6">
      {/* Supporting Research - WIDE */}
      <BentoBox size="wide" className="p-0 overflow-hidden">
        <ResearchPanel 
          paradigm={paradigm}
          userDemographics={userDemographics}
        />
      </BentoBox>

      {/* Case Studies - WIDE */}
      <BentoBox size="wide" className="p-0 overflow-hidden">
        <CaseStudiesPanel
          paradigm={paradigm}
          userDemographics={userDemographics}
        />
      </BentoBox>
    </BentoGrid>
  );
}
