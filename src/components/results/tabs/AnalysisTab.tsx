/**
 * Analysis Tab - Arguments and Research
 * 
 * Contents:
 * - Arguments For/Against with citations (accordion)
 * - Supporting Research & Case Studies (bento grid)
 */

import { ArgumentsSection } from '../ArgumentsSection';
import { SupportingResearchSection } from '../SupportingResearchSection';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface AnalysisTabProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

export function AnalysisTab({ recommendation, answers }: AnalysisTabProps) {
  return (
    <div className="space-y-8">
      {/* Arguments For/Against with Citations */}
      <ArgumentsSection recommendation={recommendation} answers={answers} />

      {/* Supporting Research & Case Studies */}
      <SupportingResearchSection />
    </div>
  );
}
