/**
 * Arguments Section — Clean report style
 * No colored backgrounds on cards, pill badges for impact, generous whitespace
 */

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap, ExternalLink, BookOpen, FileText, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-8">
      {/* Section header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Detailed Argumentation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Research-backed reasoning for each interface type in your recommendation
            </p>
          </div>
        </div>
      </div>

      {/* One block per interface type */}
      {allArguments.map((paradigmArg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-4"
        >
          {/* Full-width label row */}
          <div className="px-5 py-3.5 rounded-xl bg-secondary border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {INTERFACE_LABELS[paradigmArg.paradigmKey] ?? paradigmArg.paradigm}
                </span>
                <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs font-semibold">
                  {Math.round(paradigmArg.percentage)}%
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {paradigmArg.argumentsFor.length} strengths · {paradigmArg.argumentsAgainst.length} challenges
              </span>
            </div>
          </div>

          {/* Two-column: FOR (left) / AGAINST (right) */}
          <BentoGrid>
            <BentoBox size="medium" className="border-border">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-accent" />
                </div>
                <span className="font-semibold text-sm text-foreground tracking-tight">Arguments For</span>
              </div>
              <div className="space-y-3">
                {paradigmArg.argumentsFor.map((arg, argIdx) => (
                  <ArgumentCard key={argIdx} argument={arg} type="for" />
                ))}
              </div>
            </BentoBox>

            <BentoBox size="medium" className="border-border">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                </div>
                <span className="font-semibold text-sm text-foreground tracking-tight">Arguments Against</span>
              </div>
              <div className="space-y-3">
                {paradigmArg.argumentsAgainst.map((arg, argIdx) => (
                  <ArgumentCard key={argIdx} argument={arg} type="against" />
                ))}
              </div>
            </BentoBox>
          </BentoGrid>
        </motion.div>
      ))}
    </div>
  );
}

function CitationTypeIcon({ type }: { type: Citation['type'] }) {
  switch (type) {
    case 'paper':
      return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    case 'report':
      return <Newspaper className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    default:
      return <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
}

function ArgumentCard({ argument, type }: { argument: Argument; type: 'for' | 'against' }) {
  const impactStyles = {
    high: 'bg-foreground text-card font-semibold',
    medium: 'bg-secondary text-muted-foreground font-medium',
    low: 'bg-secondary text-muted-foreground/70 font-medium',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-xl border border-border bg-card"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-foreground tracking-tight">{argument.title}</h4>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${impactStyles[argument.impact]}`}>
          {argument.impact}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{argument.description}</p>

      {argument.dataPoint && (
        <div className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-secondary border border-border">
          <span className="text-muted-foreground shrink-0 text-sm">📊</span>
          <span className="text-sm text-foreground/80 leading-relaxed">{argument.dataPoint}</span>
        </div>
      )}

      {argument.citation && (
        <div className="rounded-xl border border-border bg-secondary/50 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <CitationTypeIcon type={argument.citation.type} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {argument.citation.type}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground leading-tight">
                {argument.citation.title}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {argument.citation.authors} ({argument.citation.year})
              </p>
              {argument.citation.keyFinding && (
                <p className="text-[11px] text-muted-foreground/80 italic border-l-2 border-accent/30 pl-2 mt-1.5">
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
