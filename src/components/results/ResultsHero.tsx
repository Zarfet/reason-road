/**
 * Hero section for results page — Tech-Minimalist / Precision Instrument
 */

import { motion } from 'framer-motion';
import { Monitor, Eye, Sparkles, Glasses, Mic, TrendingUp } from 'lucide-react';
import { PARADIGM_LABELS, type ParadigmScores } from '@/types/assessment';

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
    parts.push(<strong key={match.index} className="text-foreground">{match[1]}</strong>);
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
    <div className="py-8 md:py-12">
      <div className="nexus-card max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-foreground text-xs font-mono font-semibold tracking-wider uppercase text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Recommended Strategy
          </span>
        </motion.div>

        {/* Main Recommendation */}
        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl font-medium text-center mb-3 tracking-tight text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {PARADIGM_LABELS[primaryParadigm]}
          {secondaryParadigm && secondaryPct > 15 && (
            <span className="text-muted-foreground font-normal"> + {PARADIGM_LABELS[secondaryParadigm]}</span>
          )}
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-muted-foreground text-lg text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Best fit for {subtitle}
          </motion.p>
        )}

        {/* Multi-modal Breakdown */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {breakdownItems.map((item, index) => (
            <div key={item.paradigm} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-foreground">
                {paradigmIcons[item.paradigm]}
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground tracking-tight">
                  {index === 0 && <span className="text-accent">{item.pct}%</span>}
                  {index !== 0 && <>{item.pct}%</>}
                </p>
                <p className="text-sm text-muted-foreground font-mono">{PARADIGM_LABELS[item.paradigm]}</p>
              </div>
              {index < breakdownItems.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-border ml-4" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Confidence Level */}
        {confidenceLevel !== undefined && (
          <motion.div
            className="flex flex-col items-center gap-2 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm font-mono">Confidence:</span>
              <span className="font-mono font-bold text-lg tracking-tight text-foreground">
                {confidenceLevel}%
              </span>
            </div>
            <p className="text-muted-foreground text-xs max-w-md text-center font-mono">
              Based on response consistency and score differentiation
            </p>
          </motion.div>
        )}

        {/* Strategic Rationale */}
        {(strategicRationale || reasoningBullets.length > 0) && (
          <motion.div
            className="mt-8 pt-8 border-t border-border max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {strategicRationale && (
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed text-center mb-6">
                {renderBold(strategicRationale)}
              </p>
            )}
            {reasoningBullets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reasoningBullets.slice(0, 4).map((bullet, i) => (
                  <div key={i} className="flex items-start gap-3 text-left p-3 rounded-xl border border-border bg-secondary/50">
                    <span className="h-6 w-6 rounded-full bg-foreground text-background text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{renderBold(bullet)}</p>
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