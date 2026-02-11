/**
 * Analysis Tab - Detailed analysis content
 * 
 * Contents:
 * - Arguments For/Against (placeholder)
 * - Red Flags
 * - Regulatory Analysis (conditional on geography)
 * - Sustainability Report (placeholder)
 */

import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  ExternalLink
} from 'lucide-react';
import { BentoGrid } from '../bento/BentoGrid';
import { RegulatoryCard } from '../RegulatoryCard';
import { SustainabilityCard } from '../SustainabilityCard';
import { ArgumentsSection } from '../ArgumentsSection';
import { generateRegulatoryAnalysis } from '@/lib/regulatoryAnalysis';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';
import type { RedFlag } from '@/lib/scoring';

interface AnalysisTabProps {
  recommendation: RecommendationResult;
  redFlags: RedFlag[];
  answers: AssessmentAnswers;
}

export function AnalysisTab({ recommendation, redFlags, answers }: AnalysisTabProps) {
  // Generate regulatory analysis based on geography
  const regulatoryAnalysis = generateRegulatoryAnalysis(answers, recommendation);
  
  return (
    <div className="space-y-8">
      {/* Arguments For/Against */}
      <ArgumentsSection recommendation={recommendation} answers={answers} />

      {/* Red Flags Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold">Red Flags</h3>
        </div>
        
        {redFlags.length > 0 ? (
          <ul className="space-y-3">
            {redFlags.map((flag, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-1 text-sm p-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="flex items-start gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>{flag.text}</span>
                </div>
                {flag.source && (
                  <div className="ml-6 flex items-center gap-1 text-xs text-muted-foreground/70">
                    <ExternalLink className="h-3 w-3" />
                    <span>Source: {flag.source}</span>
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No significant red flags identified.</p>
        )}
      </div>

      {/* Regulatory Impact Analysis - Conditional */}
      {regulatoryAnalysis && (
        <RegulatoryCard analysis={regulatoryAnalysis} />
      )}

      {/* Sustainability Report - Conditional */}
      <SustainabilityCard recommendation={recommendation} answers={answers} />
    </div>
  );
}
