/**
 * Panel showing alternative paradigms considered
 */

import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  PARADIGM_LABELS, 
  PARADIGM_DESCRIPTIONS,
  type ParadigmScores,
  type ParadigmPercentages 
} from '@/types/assessment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlternativesPanelProps {
  allScores: ParadigmPercentages;
  primaryParadigm: keyof ParadigmScores;
}

/**
 * Get explanation for why a paradigm received its score
 */
function getScoreExplanation(paradigm: keyof ParadigmScores, score: number, primaryScore: number): string {
  const diff = primaryScore - score;
  
  const paradigmStrengths: Record<keyof ParadigmScores, string> = {
    traditional_screen: 'complex tasks, visual feedback, and explicit user control',
    invisible: 'repetitive tasks, high frequency usage, and predictable workflows',
    ai_vectorial: 'unstructured content, exploration, and intelligent assistance',
    spatial: '3D/spatial data, immersive experiences, and visual-heavy workflows',
    voice: 'hands-free contexts, accessibility needs, and simple commands',
  };

  if (score >= 50) {
    return `Strong fit (${score}%). Excels at ${paradigmStrengths[paradigm]}. Only ${diff}% behind primary—consider hybrid approach.`;
  } else if (score >= 30) {
    return `Moderate fit (${score}%). Good for ${paradigmStrengths[paradigm]}, but your requirements favor other paradigms. ${diff}% gap from primary.`;
  } else {
    return `Low fit (${score}%). Designed for ${paradigmStrengths[paradigm]}, which doesn't align well with your context. ${diff}% gap suggests this isn't ideal.`;
  }
}

export function AlternativesPanel({ allScores, primaryParadigm }: AlternativesPanelProps) {
  // Get alternatives (all except primary), sorted by score descending
  const alternatives = Object.entries(allScores)
    .filter(([paradigm]) => paradigm !== primaryParadigm)
    .sort((a, b) => b[1] - a[1]);

  const primaryScore = allScores[primaryParadigm];

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
        <TooltipProvider>
          {alternatives.map(([paradigm, score], index) => {
            const isLowMatch = score < 30;
            const explanation = getScoreExplanation(paradigm as keyof ParadigmScores, score, primaryScore);
            
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
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getMatchBadgeColor(score)}`}>
                    {score}% Match
                    {isLowMatch && <AlertTriangle className="h-3 w-3" />}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-0.5 rounded hover:bg-muted transition-colors">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="left" 
                      className="max-w-xs p-3 bg-card border-l-4 border-l-accent shadow-lg"
                    >
                      <p className="text-sm">{explanation}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <p className="text-sm text-muted-foreground">
                  {isLowMatch && <span className="font-medium text-foreground">High risk. </span>}
                  {PARADIGM_DESCRIPTIONS[paradigm as keyof ParadigmScores]}
                </p>
              </motion.div>
            );
          })}
        </TooltipProvider>
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
