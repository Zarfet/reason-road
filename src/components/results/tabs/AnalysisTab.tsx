/**
 * Analysis Tab - Arguments with research citations
 */

import { BentoGrid, BentoBox } from '../bento/BentoGrid';
import { ArgumentsSection } from '../ArgumentsSection';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface AnalysisTabProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

export function AnalysisTab({ recommendation, answers }: AnalysisTabProps) {
  return (
    <BentoGrid className="mt-6">
      <BentoBox size="wide">
        <ArgumentsSection recommendation={recommendation} answers={answers} />
      </BentoBox>
    </BentoGrid>
  );
}
