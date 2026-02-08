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
  Scale, 
  AlertTriangle, 
  Leaf,
  Construction,
  ExternalLink
} from 'lucide-react';
import { BentoGrid, BentoBox, BentoHeader } from '../bento/BentoGrid';
import { Badge } from '@/components/ui/badge';
import { RegulatoryCard } from '../RegulatoryCard';
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
    <BentoGrid className="mt-6">
      {/* Arguments For/Against - LARGE */}
      <BentoBox size="large">
        <BentoHeader 
          title="Arguments For & Against" 
          subtitle="Balanced analysis of the recommended approach"
          icon={<Scale className="h-5 w-5 text-accent" />}
        />
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Detailed pros/cons analysis coming soon
            </p>
            <Badge variant="secondary" className="mt-2">Coming in Prompt 6-7</Badge>
          </div>
        </div>
      </BentoBox>

      {/* Red Flags - SMALL */}
      <BentoBox size="small">
        <BentoHeader 
          title="Red Flags" 
          subtitle="Potential concerns to address"
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        />
        
        {redFlags.length > 0 ? (
          <ul className="space-y-3">
            {redFlags.map((flag, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-1 text-sm p-2 rounded-lg bg-destructive/5 border border-destructive/20"
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
      </BentoBox>

      {/* Regulatory Impact Analysis - Conditional */}
      {regulatoryAnalysis && (
        <RegulatoryCard analysis={regulatoryAnalysis} />
      )}

      {/* Sustainability Report - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Sustainability Report" 
          subtitle="Environmental impact considerations"
          icon={<Leaf className="h-5 w-5 text-accent" />}
        />
        
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Construction className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Sustainability metrics coming soon
            </p>
            <Badge variant="secondary" className="mt-2">Coming in Prompt 5</Badge>
          </div>
        </div>
      </BentoBox>
    </BentoGrid>
  );
}
