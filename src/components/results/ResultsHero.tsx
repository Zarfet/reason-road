/**
 * Hero section for results page with paradigm breakdown
 * Updated for Bento Grid layout
 */

import { motion } from 'framer-motion';
import { Target, Monitor, Eye, Sparkles, Glasses, Mic } from 'lucide-react';
import { PARADIGM_LABELS, type ParadigmScores } from '@/types/assessment';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ResultsHeroProps {
  primaryParadigm: keyof ParadigmScores;
  secondaryParadigm?: keyof ParadigmScores;
  tertiaryParadigm?: keyof ParadigmScores;
  primaryPct?: number;
  secondaryPct?: number;
  tertiaryPct?: number;
  projectName?: string;
  userDemographics?: string;
  confidenceLevel?: number;
  strategicRationale?: string;
  reasoningBullets?: string[];
}

const paradigmIcons: Record<keyof ParadigmScores, React.ReactNode> = {
  traditional_screen: <Monitor className="h-5 w-5" />,
  invisible: <Eye className="h-5 w-5" />,
  ai_vectorial: <Sparkles className="h-5 w-5" />,
  spatial: <Glasses className="h-5 w-5" />,
  voice: <Mic className="h-5 w-5" />,
};

function renderBold(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function ResultsHero({
  primaryParadigm,
  secondaryParadigm,
  tertiaryParadigm,
  primaryPct = 0,
  secondaryPct = 0,
  tertiaryPct = 0,
  projectName,
  userDemographics,
  confidenceLevel,
  strategicRationale,
  reasoningBullets = [],
}: ResultsHeroProps) {
  const subtitle = [projectName, userDemographics]
    .filter(Boolean)
    .join(' for ');

  const breakdownItems = [
    { paradigm: primaryParadigm, pct: primaryPct },
    ...(secondaryParadigm && secondaryPct > 5 ? [{ paradigm: secondaryParadigm, pct: secondaryPct }] : []),
    ...(tertiaryParadigm && tertiaryPct > 5 ? [{ paradigm: tertiaryParadigm, pct: tertiaryPct }] : []),
  ];

  return (
    <div className="bg-foreground text-background py-10 md:py-14 -mx-4 md:-mx-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Badge className="bg-accent text-accent-foreground px-4 py-1.5 text-sm font-medium">
            RECOMMENDED STRATEGY
          </Badge>
        </motion.div>

        {/* Main Recommendation */}
        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {PARADIGM_LABELS[primaryParadigm]}
          {secondaryParadigm && secondaryPct > 15 && (
            <span className="text-muted"> + {PARADIGM_LABELS[secondaryParadigm]}</span>
          )}
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-muted text-lg text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Best fit for {subtitle}
          </motion.p>
        )}

        {/* Multi-modal Breakdown */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {breakdownItems.map((item, index) => (
            <div key={item.paradigm} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-background/10 flex items-center justify-center">
                {paradigmIcons[item.paradigm]}
              </div>
              <div>
                <p className="text-2xl font-bold">{item.pct}%</p>
                <p className="text-sm text-muted">{PARADIGM_LABELS[item.paradigm]}</p>
              </div>
              {index < breakdownItems.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-muted/30 ml-4" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Confidence Level */}
        {confidenceLevel !== undefined && (
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-muted text-sm">Confidence:</span>
              <span className={`font-bold text-lg ${
                confidenceLevel >= 70 ? 'text-accent' : 
                confidenceLevel >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {confidenceLevel}%
              </span>
            </div>
            <p className="text-muted/70 text-xs max-w-md text-center">
              Based on response consistency and score differentiation
            </p>
          </motion.div>
        )}

        {/* Strategic Rationale */}
        {(strategicRationale || reasoningBullets.length > 0) && (
          <motion.div
            className="mt-8 pt-8 border-t border-muted/20 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {strategicRationale && (
              <p className="text-muted text-sm md:text-base leading-relaxed text-center mb-6">
                {renderBold(strategicRationale)}
              </p>
            )}
            {reasoningBullets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reasoningBullets.slice(0, 4).map((bullet, i) => (
                  <div key={i} className="flex items-start gap-3 text-left">
                    <span className="h-6 w-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted">{renderBold(bullet)}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
