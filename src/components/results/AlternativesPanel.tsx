/**
 * Panel showing alternative paradigms considered
 */

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  PARADIGM_LABELS, 
  PARADIGM_DESCRIPTIONS,
  type ParadigmScores,
  type ParadigmPercentages 
} from '@/types/assessment';

interface AlternativesPanelProps {
  allScores: ParadigmPercentages;
  primaryParadigm: keyof ParadigmScores;
}

export function AlternativesPanel({ allScores, primaryParadigm }: AlternativesPanelProps) {
  // Get alternatives (all except primary), sorted by score descending
  const alternatives = Object.entries(allScores)
    .filter(([paradigm]) => paradigm !== primaryParadigm)
    .sort((a, b) => b[1] - a[1]);

  const getMatchBadgeColor = (score: number) => {
    if (score >= 50) return 'bg-accent/20 text-accent';
    if (score >= 30) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <Card className="nexus-card h-fit">
      <h2 className="text-lg font-semibold text-foreground mb-6">
        Alternatives Considered
      </h2>

      <div className="space-y-6">
        {alternatives.map(([paradigm, score], index) => {
          const isLowMatch = score < 30;
          
          return (
            <motion.div
              key={paradigm}
              className="space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <h3 className="font-medium text-foreground">
                {PARADIGM_LABELS[paradigm as keyof ParadigmScores]}
              </h3>
              
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getMatchBadgeColor(score)}`}>
                {score}% Match
                {isLowMatch && <AlertTriangle className="h-3 w-3" />}
              </span>

              <p className="text-sm text-muted-foreground">
                {isLowMatch && <span className="font-medium text-foreground">High risk. </span>}
                {PARADIGM_DESCRIPTIONS[paradigm as keyof ParadigmScores]}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Confidence callout */}
      <motion.div
        className="mt-8 p-4 border-l-4 border-l-accent bg-accent/5 rounded-r-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h4 className="font-medium text-foreground mb-1">Confidence Level</h4>
        <p className="text-sm text-muted-foreground">
          Based on your assessment responses, contextualized to your project requirements and user demographics.
        </p>
      </motion.div>
    </Card>
  );
}
