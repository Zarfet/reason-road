/**
 * Analysis Tab - Detailed analysis content
 * 
 * Contents:
 * - Arguments For/Against with citations (accordion)
 * - Red Flags
 * - Regulatory Analysis (conditional on geography)
 * - Sustainability Report
 * - Supporting Research & Case Studies (bento grid)
 */

import { RegulatoryCard } from '../RegulatoryCard';
import { SustainabilityCard } from '../SustainabilityCard';
import { ArgumentsSection } from '../ArgumentsSection';
import { RedFlagsCard } from '../RedFlagsCard';
import { SupportingResearchSection } from '../SupportingResearchSection';
import { generateRegulatoryAnalysis } from '@/lib/regulatoryAnalysis';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';
import type { RedFlag } from '@/lib/scoring';

interface AnalysisTabProps {
  recommendation: RecommendationResult;
  redFlags: RedFlag[];
  answers: AssessmentAnswers;
}

export function AnalysisTab({ recommendation, redFlags, answers }: AnalysisTabProps) {
  const regulatoryAnalysis = generateRegulatoryAnalysis(answers, recommendation);
  
  return (
    <div className="space-y-8">
      {/* Red Flags - Shows only if flags detected */}
      <RedFlagsCard recommendation={recommendation} answers={answers} />
      
      {/* Arguments For/Against with Citations */}
      <ArgumentsSection recommendation={recommendation} answers={answers} />

      {/* Regulatory Impact Analysis - Conditional */}
      {regulatoryAnalysis && (
        <RegulatoryCard analysis={regulatoryAnalysis} />
      )}

      {/* Sustainability Report */}
      <SustainabilityCard recommendation={recommendation} answers={answers} />

      {/* Supporting Research & Case Studies */}
      <SupportingResearchSection />
    </div>
  );
}
