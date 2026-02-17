/**
 * Arguments For/Against Section
 * 
 * Displays detailed pros/cons for each paradigm in an accordion format
 * with enhanced citation cards showing clickable research links.
 */

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap, ExternalLink, BookOpen, FileText, Newspaper } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateAllArguments, type Argument, type ParadigmArguments } from '@/lib/argumentsGenerator';
import type { Citation } from '@/lib/citations';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface ArgumentsSectionProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

export function ArgumentsSection({ recommendation, answers }: ArgumentsSectionProps) {
  const allArguments = generateAllArguments(answers, recommendation);
  
  if (allArguments.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          <h3 className="text-xl font-semibold">Detailed Argumentation</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Research-backed reasoning for each paradigm in your recommendation
        </p>
      </div>

      {/* Paradigm Arguments */}
      <div className="space-y-4">
        {allArguments.map((paradigmArg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="border rounded-lg overflow-hidden bg-card">
              {/* Header with paradigm name and percentage */}
              <div className="px-4 py-3 bg-muted/40 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">{paradigmArg.paradigm}</div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {Math.round(paradigmArg.percentage)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {paradigmArg.argumentsFor.length} pros, {paradigmArg.argumentsAgainst.length} cons
                  </div>
                </div>
              </div>

              {/* Arguments Accordion */}
              <Accordion type="single" collapsible className="w-full">
                {/* FOR Section */}
                <AccordionItem value={`for-${idx}`} className="border-0 border-b">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                    <div className="flex items-center gap-3 text-left">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                      <span className="font-medium">Arguments FOR</span>
                      <Badge variant="outline" className="text-accent border-accent/30 ml-auto mr-2">
                        {paradigmArg.argumentsFor.length} strengths
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 bg-muted/20">
                    <div className="space-y-3">
                      {paradigmArg.argumentsFor.map((arg, argIdx) => (
                        <ArgumentCard
                          key={argIdx}
                          argument={arg}
                          type="for"
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* AGAINST Section */}
                <AccordionItem value={`against-${idx}`} className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                    <div className="flex items-center gap-3 text-left">
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      <span className="font-medium">Arguments AGAINST</span>
                      <Badge variant="outline" className="text-destructive border-destructive/30 ml-auto mr-2">
                        {paradigmArg.argumentsAgainst.length} challenges
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 bg-destructive/5">
                    <div className="space-y-3">
                      {paradigmArg.argumentsAgainst.map((arg, argIdx) => (
                        <ArgumentCard
                          key={argIdx}
                          argument={arg}
                          type="against"
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Citation type icon helper
 */
function CitationTypeIcon({ type }: { type: Citation['type'] }) {
  switch (type) {
    case 'paper':
      return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    case 'report':
      return <Newspaper className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    case 'article':
    case 'book':
    default:
      return <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
}

/**
 * Individual Argument Card Component with Enhanced Citations
 */
function ArgumentCard({
  argument,
  type,
}: {
  argument: Argument;
  type: 'for' | 'against';
}) {
  const impactColors = {
    high: type === 'for' ? 'text-accent border-accent/30' : 'text-destructive border-destructive/30',
    medium: type === 'for' ? 'text-accent/80 border-accent/20' : 'text-amber-600 border-amber-300',
    low: type === 'for' ? 'text-accent/60 border-accent/15' : 'text-amber-500 border-amber-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg border border-border/50 bg-background/50"
    >
      {/* Title with impact badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-foreground">
          {argument.title}
        </h4>
        <Badge
          variant="outline"
          className={`text-xs shrink-0 ${impactColors[argument.impact]}`}
        >
          {argument.impact === 'high' ? '⚡' : argument.impact === 'medium' ? '⚙️' : '•'} {argument.impact}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">
        {argument.description}
      </p>

      {/* Data Point */}
      {argument.dataPoint && (
        <div className="flex items-start gap-2 mb-3 p-2.5 rounded-md bg-primary/5 border border-primary/10">
          <span className="text-primary shrink-0 text-sm">📊</span>
          <span className="text-sm text-foreground/80">{argument.dataPoint}</span>
        </div>
      )}

      {/* Enhanced Citation Card */}
      {argument.citation && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <CitationTypeIcon type={argument.citation.type} />
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                  {argument.citation.type}
                </Badge>
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
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                asChild
              >
                <a
                  href={argument.citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open source"
                >
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
