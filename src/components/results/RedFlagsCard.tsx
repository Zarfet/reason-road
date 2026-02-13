/**
 * Red Flags Card
 * 
 * Shows critical warnings, contradictions, and research citations.
 * Only renders when flags are detected.
 */

import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, Info, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { detectRedFlags, type RedFlag } from '@/lib/redFlagsDetector';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface RedFlagsCardProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

export function RedFlagsCard({ recommendation, answers }: RedFlagsCardProps) {
  const report = detectRedFlags(answers, recommendation);
  
  if (!report.hasFlags) return null; // No flags = no card
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold">Red Flags & Critical Considerations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {report.criticalCount > 0 
            ? `${report.criticalCount} CRITICAL issue(s) require immediate attention`
            : `${report.totalFlags} issue(s) detected that should be addressed`
          }
        </p>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        {report.criticalCount > 0 && (
          <Badge variant="destructive" className="bg-red-600">
            {report.criticalCount} Critical
          </Badge>
        )}
        {report.highCount > 0 && (
          <Badge variant="destructive" className="bg-orange-600">
            {report.highCount} High
          </Badge>
        )}
        {report.mediumCount > 0 && (
          <Badge variant="destructive" className="bg-amber-600">
            {report.mediumCount} Medium
          </Badge>
        )}
      </div>

      {/* Red Flags List */}
      <div className="space-y-3">
        {report.flags.map((flag, idx) => (
          <RedFlagItem key={flag.id} flag={flag} index={idx} />
        ))}
      </div>

      {/* Action Required Notice */}
      {report.criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border border-destructive/30 bg-destructive/5"
        >
          <div className="flex gap-3">
            <AlertOctagon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">Action Required Before Implementation</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {report.criticalCount} critical issue{report.criticalCount !== 1 ? 's' : ''} must be resolved before deployment. 
                Address all REQUIRED mitigation steps before proceeding to development.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Individual Red Flag Item with citation support
 */
function RedFlagItem({ flag, index }: { flag: RedFlag; index: number }) {
  const severityConfig = {
    critical: {
      icon: AlertOctagon,
      bgColor: 'bg-destructive/5',
      borderColor: 'border-destructive/20',
      badgeColor: 'bg-red-600'
    },
    high: {
      icon: AlertTriangle,
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/20',
      badgeColor: 'bg-orange-600'
    },
    medium: {
      icon: Info,
      bgColor: 'bg-amber-500/5',
      borderColor: 'border-amber-500/20',
      badgeColor: 'bg-amber-600'
    }
  };
  
  const config = severityConfig[flag.severity];
  const IconComponent = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      {/* Title Section */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          <IconComponent className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-foreground">{flag.title}</h4>
              <div className="flex gap-1.5">
                <Badge variant="secondary" className={`${config.badgeColor} text-white text-xs`}>
                  {flag.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {flag.category}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="ml-8 space-y-3 text-sm">
        <div>
          <p className="font-medium text-foreground mb-1">⚠️ Issue:</p>
          <p className="text-muted-foreground">{flag.description}</p>
        </div>

        {/* Impact */}
        <div>
          <p className="font-medium text-foreground mb-1">💥 Impact if Ignored:</p>
          <p className="text-muted-foreground">{flag.impact}</p>
        </div>

        {/* Research Citation */}
        {flag.citation && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-medium text-foreground mb-2 text-xs uppercase tracking-wider">📊 Research Evidence</p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{flag.citation.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {flag.citation.authors} ({flag.citation.year})
                </p>
                <p className="text-xs text-muted-foreground italic mt-1">
                  "{flag.citation.keyFinding}"
                </p>
              </div>
              {flag.citation.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  asChild
                >
                  <a href={flag.citation.url} target="_blank" rel="noopener noreferrer" title="View source">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Evidence without citation */}
        {flag.evidence && !flag.citation && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground italic">📊 {flag.evidence}</p>
          </div>
        )}

        {/* Affected Paradigms */}
        <div>
          <p className="font-medium text-foreground mb-1">Affects:</p>
          <div className="flex flex-wrap gap-1">
            {flag.affectedParadigms.map(paradigm => (
              <Badge key={paradigm} variant="outline" className="text-xs capitalize">
                {paradigm.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mitigation Steps */}
        <div>
          <p className="font-medium text-foreground mb-2">✅ Required Mitigations:</p>
          <ul className="space-y-1.5">
            {flag.mitigation.map((step, stepIdx) => (
              <li key={stepIdx} className="flex gap-2 text-muted-foreground">
                <span className="text-accent font-bold shrink-0">•</span>
                <span className={step.includes('REQUIRED') ? 'font-semibold text-foreground' : ''}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
