/**
 * Hero section for results page with dark background
 */

import { motion } from 'framer-motion';
import { PARADIGM_LABELS, type ParadigmScores } from '@/types/assessment';

interface ResultsHeroProps {
  primaryParadigm: keyof ParadigmScores;
  secondaryParadigm?: keyof ParadigmScores;
  secondaryPct?: number;
  projectName?: string;
  userDemographics?: string;
  confidenceLevel?: number;
}

export function ResultsHero({
  primaryParadigm,
  secondaryParadigm,
  secondaryPct = 0,
  projectName,
  userDemographics,
  confidenceLevel,
}: ResultsHeroProps) {
  const subtitle = [projectName, userDemographics]
    .filter(Boolean)
    .join(' for ');

  return (
    <div className="bg-foreground text-background py-12 md:py-16 -mx-4 md:-mx-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <motion.div
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          RECOMMENDED
        </motion.div>

        <motion.h1
          className="text-3xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {PARADIGM_LABELS[primaryParadigm]}
          {secondaryParadigm && secondaryPct > 15 && (
            <span className="text-muted"> + {PARADIGM_LABELS[secondaryParadigm]}</span>
          )}
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-muted text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Best fit for {subtitle}
          </motion.p>
        )}

        {confidenceLevel !== undefined && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-muted text-sm">Confidence Level:</span>
            <span className={`font-bold text-lg ${
              confidenceLevel >= 70 ? 'text-accent' : 
              confidenceLevel >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {confidenceLevel}%
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
