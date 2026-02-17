/**
 * Red Flags Card — Clean report style
 * No colored backgrounds, pill badges for severity, generous spacing
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
  
  if (!report.hasFlags) return null;
  
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Red Flags & Critical Considerations</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.criticalCount > 0 
                ? `${report.criticalCount} CRITICAL issue(s) require immediate attention`
                : `${report.totalFlags} issue(s) detected that should be addressed`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        {report.criticalCount > 0 && (
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
            {report.criticalCount} Critical
          </span>
        )}
        {report.highCount > 0 && (
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {report.highCount} High
          </span>
        )}
        {report.mediumCount > 0 && (
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-secondary text-muted-foreground border border-border">
            {report.mediumCount} Medium
          </span>
        )}
      </div>

      {/* Red Flags List */}
      <div className="space-y-4">
        {report.flags.map((flag, idx) => (
          <RedFlagItem key={flag.id} flag={flag} index={idx} />
        ))}
      </div>

      {/* Action Required Notice */}
      {report.criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-destructive/20 bg-card"
        >
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertOctagon className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm tracking-tight">Action Required Before Implementation</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
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

function RedFlagItem({ flag, index }: { flag: RedFlag; index: number }) {
  const severityConfig = {
    critical: {
      icon: AlertOctagon,
      badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    high: {
      icon: AlertTriangle,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    medium: {
      icon: Info,
      badgeClass: 'bg-secondary text-muted-foreground border-border',
    }
  };
  
  const config = severityConfig[flag.severity];
  const IconComponent = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 rounded-2xl border border-border bg-card"
    >
      {/* Title Section */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground tracking-tight">{flag.title}</h4>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-secondary text-muted-foreground border border-border mt-1">
              {flag.category}
            </span>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${config.badgeClass}`}>
          {flag.severity}
        </span>
      </div>

      {/* Two-column body */}
      <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        {/* LEFT: Issue + Research Evidence */}
        <div className="space-y-4">
          <div>
            <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider text-muted-foreground">Issue</p>
            <p className="text-muted-foreground leading-relaxed">{flag.description}</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider text-muted-foreground">Impact if Ignored</p>
            <p className="text-muted-foreground leading-relaxed">{flag.impact}</p>
          </div>

          {flag.citation && (
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Research Evidence</p>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{flag.citation.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {flag.citation.authors} ({flag.citation.year})
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1 leading-relaxed">
                    "{flag.citation.keyFinding}"
                  </p>
                </div>
                {flag.citation.url && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                    <a href={flag.citation.url} target="_blank" rel="noopener noreferrer" title="View source">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {flag.evidence && !flag.citation && (
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Research Evidence</p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">{flag.evidence}</p>
            </div>
          )}
        </div>

        {/* RIGHT: Affects + Mitigations */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Affects</p>
            <div className="flex flex-wrap gap-1.5">
              {flag.affectedParadigms.map(p => (
                <span key={p} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-muted-foreground border border-border capitalize">
                  {p.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Required Mitigations</p>
            <ul className="space-y-2">
              {flag.mitigation.map((step, stepIdx) => (
                <li key={stepIdx} className="flex gap-2 text-muted-foreground leading-relaxed">
                  <span className="text-accent font-bold shrink-0">•</span>
                  <span className={step.includes('REQUIRED') ? 'font-semibold text-foreground' : ''}>
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
