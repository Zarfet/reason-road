/**
 * Impact Tab - Regulatory, Environmental, and Risk Analysis
 */

import { RegulatoryCard } from '../RegulatoryCard';
import { SustainabilityCard } from '../SustainabilityCard';
import { RedFlagsCard } from '../RedFlagsCard';
import { generateRegulatoryAnalysis } from '@/lib/regulatoryAnalysis';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface ImpactTabProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

export function ImpactTab({ recommendation, answers }: ImpactTabProps) {
  const regulatoryAnalysis = generateRegulatoryAnalysis(answers, recommendation);

  return (
    <div className="space-y-8 mt-6">
      {regulatoryAnalysis && (
        <RegulatoryCard analysis={regulatoryAnalysis} />
      )}
      <SustainabilityCard recommendation={recommendation} answers={answers} />
      <RedFlagsCard recommendation={recommendation} answers={answers} />
    </div>
  );
}
