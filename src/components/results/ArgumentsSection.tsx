/**
 * Arguments For/Against Section
 * 
 * Displays detailed pros/cons for each paradigm in an accordion format
 */

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { generateAllArguments, type Argument, type ParadigmArguments } from '@/lib/argumentsGenerator';
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
          <h3 className="text-xl font-semibold">Arguments For & Against</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Detailed analysis of each paradigm in your recommendation
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
                      <span className="font-medium">Strengths</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {paradigmArg.argumentsFor.length} points
                      </span>
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
                      <span className="font-medium">Challenges</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {paradigmArg.argumentsAgainst.length} points
                      </span>
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
 * Individual Argument Card Component
 */
function ArgumentCard({
  argument,
  type,
}: {
  argument: Argument;
  type: 'for' | 'against';
}) {
  const impactIcons = {
    high: '⚡',
    medium: '⚙️',
    low: '•',
  };

  const impactColors = {
    high: type === 'for' ? 'text-accent' : 'text-destructive',
    medium: type === 'for' ? 'text-accent/80' : 'text-amber-600',
    low: type === 'for' ? 'text-accent/60' : 'text-amber-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-lg border border-border/50 bg-background/50"
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
          {impactIcons[argument.impact]} {argument.impact}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-2">
        {argument.description}
      </p>

      {/* Data points, sources, costs */}
      <div className="space-y-1 text-xs text-muted-foreground">
        {argument.dataPoint && (
          <div className="flex items-start gap-2">
            <span className="text-primary shrink-0">📊</span>
            <span>{argument.dataPoint}</span>
          </div>
        )}
        {argument.source && (
          <div className="flex items-start gap-2">
            <span className="text-accent shrink-0">📖</span>
            <span className="italic">Source: {argument.source}</span>
          </div>
        )}
        {argument.costEstimate && (
          <div className="flex items-start gap-2">
            <span className="shrink-0">💰</span>
            <span className="font-medium text-foreground/80">{argument.costEstimate}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
