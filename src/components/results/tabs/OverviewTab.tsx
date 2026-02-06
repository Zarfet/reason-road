/**
 * Overview Tab - First tab in Results page
 * 
 * Contains:
 * - Multi-modal Strategy breakdown
 * - Key Strengths
 * - What to Avoid
 * - Why This Recommendation
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Eye, 
  Sparkles, 
  Glasses, 
  Mic,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { BentoGrid, BentoBox, BentoHeader } from '../bento/BentoGrid';
import { Progress } from '@/components/ui/progress';
import type { RecommendationResult, ParadigmScores } from '@/types/assessment';
import type { RedFlag } from '@/lib/scoring';
import { PARADIGM_LABELS } from '@/types/assessment';

interface OverviewTabProps {
  recommendation: RecommendationResult;
  reasoningBullets: string[];
  redFlags: RedFlag[];
}

/**
 * Safely renders markdown bold syntax (**text**) as React elements
 */
function renderBoldMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const paradigmIcons: Record<keyof ParadigmScores, React.ReactNode> = {
  traditional_screen: <Monitor className="h-5 w-5 text-accent" />,
  invisible: <Eye className="h-5 w-5 text-accent" />,
  ai_vectorial: <Sparkles className="h-5 w-5 text-accent" />,
  spatial: <Glasses className="h-5 w-5 text-accent" />,
  voice: <Mic className="h-5 w-5 text-accent" />,
};

export function OverviewTab({ recommendation, reasoningBullets, redFlags }: OverviewTabProps) {
  const allScores = Object.entries(recommendation.allScores)
    .sort(([, a], [, b]) => b - a) as [keyof ParadigmScores, number][];

  return (
    <BentoGrid className="mt-6">
      {/* Key Strengths - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Key Strengths" 
          icon={<CheckCircle className="h-5 w-5 text-accent" />}
        />
        
        <ul className="space-y-3">
          {reasoningBullets.slice(0, 4).map((bullet, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>{renderBoldMarkdown(bullet)}</span>
            </motion.li>
          ))}
        </ul>
      </BentoBox>

      {/* What to Avoid - MEDIUM (same as Key Strengths) */}
      <BentoBox size="medium">
        <BentoHeader 
          title="What to Avoid" 
          icon={<XCircle className="h-5 w-5 text-destructive" />}
        />
        
        <ul className="space-y-3">
          {recommendation.avoid.slice(0, 3).map(([paradigm, pct], index) => (
            <motion.li
              key={paradigm}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>
                <strong>{PARADIGM_LABELS[paradigm]}</strong> ({pct}% match) - Low fit for your context
              </span>
            </motion.li>
          ))}
        </ul>
        
        {redFlags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-destructive mb-2">Red Flags:</p>
            {redFlags.slice(0, 2).map((flag, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground mb-1">
                <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                <span>{flag.text}</span>
              </div>
            ))}
          </div>
        )}
      </BentoBox>

      {/* Why This Recommendation - WIDE */}
      <BentoBox size="wide">
        <BentoHeader 
          title="Why This Recommendation" 
          subtitle="Key factors that shaped your results"
          icon={<Lightbulb className="h-5 w-5 text-accent" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {reasoningBullets.map((bullet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="shrink-0 h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                {index + 1}
              </div>
              <p className="text-sm text-foreground">{renderBoldMarkdown(bullet)}</p>
            </motion.div>
          ))}
        </div>
      </BentoBox>
    </BentoGrid>
  );
}
