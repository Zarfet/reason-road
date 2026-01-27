/**
 * Panel showing reasoning for the recommendation
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { RedFlag } from '@/lib/scoring';

interface ReasoningPanelProps {
  bullets: string[];
  redFlags?: RedFlag[];
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

export function ReasoningPanel({ bullets, redFlags = [] }: ReasoningPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="nexus-card">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Why This Recommendation
        </h2>

        <ul className="space-y-4">
          {bullets.map((bullet, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <ArrowRight className="h-4 w-4 text-accent shrink-0 mt-1" />
              <span className="text-foreground leading-relaxed">
                {renderBoldMarkdown(bullet)}
              </span>
            </motion.li>
          ))}
        </ul>
      </Card>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="nexus-card border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Red Flags to Watch
            </h2>
            <ul className="space-y-4">
              {redFlags.map((flag, index) => (
                <li key={index} className="border-b border-amber-200/50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-2">
                    <span className="text-foreground text-sm font-medium">{flag.text}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {flag.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground italic">
                      Source: {flag.source}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <a 
                      href={flag.reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      {flag.reference.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
