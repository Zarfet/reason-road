/**
 * Arguments Section — Tech-Minimalist
 * Monochrome cards, clean borders, outlined badges
 */

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap, ExternalLink, BookOpen, FileText, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { BentoGrid, BentoBox, BentoHeader } from './bento/BentoGrid';
import { generateAllArguments, type Argument } from '@/lib/argumentsGenerator';
import type { Citation } from '@/lib/citations';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface ArgumentsSectionProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

const INTERFACE_LABELS: Record<string, string> = {
  traditional_screen: 'Traditional Screen',
  invisible: 'Invisible / Ambient',
  ai_vectorial: 'AI Conversational',
  spatial: 'Spatial Computing',
  voice: 'Voice-First',
};

export function ArgumentsSection({ recommendation, answers }: ArgumentsSectionProps) {
  const allArguments = generateAllArguments(answers, recommendation);
  if (allArguments.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center">
          <Zap className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-medium tracking-tight">Detailed Argumentation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Research-backed reasoning for each interface type
          </p>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-0">
        {allArguments.map((pArg) => {
          const key = pArg.paradigmKey ?? pArg.paradigm;
          return (
            <AccordionItem key={key} value={key} className="border-border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{INTERFACE_LABELS[key] ?? pArg.paradigm}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {(pArg.argumentsFor ?? []).length} strengths · {(pArg.argumentsAgainst ?? []).length} challenges
                    </p>
                  </div>
                  <Badge variant="outline" className="border-foreground text-foreground text-xs font-mono font-semibold mr-2">
                    {Math.round(pArg.percentage)}%
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <BentoGrid>
                  <BentoBox size="medium" className="border-border">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                      </div>
                      <span className="font-medium text-sm text-foreground tracking-tight">Arguments For</span>
                    </div>
                    <div className="space-y-3">
                      {(pArg.argumentsFor ?? []).map((arg, argIdx) => (
                        <ArgumentCard key={argIdx} argument={arg} type="for" />
                      ))}
                    </div>
                  </BentoBox>

                  <BentoBox size="medium" className="border-border">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center">
                        <XCircle className="h-3.5 w-3.5 text-risk" />
                      </div>
                      <span className="font-medium text-sm text-foreground tracking-tight">Arguments Against</span>
                    </div>
                    <div className="space-y-3">
                      {(pArg.argumentsAgainst ?? []).map((arg, argIdx) => (
                        <ArgumentCard key={argIdx} argument={arg} type="against" />
                      ))}
                    </div>
                  </BentoBox>
                </BentoGrid>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function CitationTypeIcon({ type }: { type: Citation['type'] }) {
  switch (type) {
    case 'paper': return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    case 'report': return <Newspaper className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    default: return <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
}

function ArgumentCard({ argument, type }: { argument: Argument; type: 'for' | 'against' }) {
  const impactStyles = {
    high: 'bg-risk text-risk-foreground font-semibold',
    medium: 'bg-warning text-warning-foreground font-medium',
    low: 'bg-muted text-muted-foreground border border-border font-medium',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-xl border border-border bg-card"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-foreground tracking-tight">{argument.title}</h4>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${impactStyles[argument.impact]}`}>
          {argument.impact}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{argument.description}</p>

      {argument.dataPoint && (
        <div className="flex items-start gap-2 mb-3 p-3 rounded-lg border border-border bg-secondary">
          <span className="text-muted-foreground shrink-0 text-sm font-mono">→</span>
          <span className="text-sm text-foreground/80 leading-relaxed">{argument.dataPoint}</span>
        </div>
      )}

      {argument.citation && (
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <CitationTypeIcon type={argument.citation.type} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  {argument.citation.type}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground leading-tight">{argument.citation.title}</p>
              <p className="text-[11px] text-muted-foreground font-mono">
                {argument.citation.authors} ({argument.citation.year})
              </p>
              {argument.citation.keyFinding && (
                <p className="text-[11px] text-muted-foreground/80 italic border-l-2 border-foreground/20 pl-2 mt-1.5">
                  "{argument.citation.keyFinding}"
                </p>
              )}
            </div>
            {argument.citation.url && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                <a href={argument.citation.url} target="_blank" rel="noopener noreferrer" title="Open source">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}