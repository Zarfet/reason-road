/**
 * Red Flags Card — Tech-Minimalist
 * Monochrome with outlined severity badges
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium tracking-tight">Red Flags & Critical Considerations</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.criticalCount > 0 
                ? `${report.criticalCount} CRITICAL issue(s) require immediate attention`
                : `${report.totalFlags} issue(s) detected that should be addressed`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {report.criticalCount > 0 && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-mono font-semibold bg-risk text-risk-foreground">
              {report.criticalCount} Critical
            </span>
          )}
          {report.highCount > 0 && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-mono font-semibold border border-risk-border text-risk-muted-foreground bg-risk-muted">
              {report.highCount} High
            </span>
          )}
          {report.mediumCount > 0 && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-mono font-semibold bg-warning text-warning-foreground">
              {report.mediumCount} Medium
            </span>
          )}
        </div>
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
          className="p-5 rounded-xl border border-risk-border bg-risk-muted"
        >
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-risk flex items-center justify-center shrink-0">
              <AlertOctagon className="h-4 w-4 text-risk-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm tracking-tight">Action Required Before Implementation</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-mono">
                {report.criticalCount} critical issue{report.criticalCount !== 1 ? 's' : ''} must be resolved before deployment.
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
      badgeClass: 'bg-risk text-risk-foreground',
    },
    high: {
      icon: AlertTriangle,
      badgeClass: 'border border-risk-border text-risk-muted-foreground bg-risk-muted',
    },
    medium: {
      icon: Info,
      badgeClass: 'bg-warning text-warning-foreground',
    }
  };
  
  const config = severityConfig[flag.severity];
  const IconComponent = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 rounded-xl border border-border bg-card"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-lg border border-border flex items-center justify-center shrink-0 mt-0.5">
            <IconComponent className="h-4 w-4 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground tracking-tight">{flag.title}</h4>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider bg-secondary text-muted-foreground border border-border mt-1">
              {flag.category}
            </span>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider shrink-0 ${config.badgeClass}`}>
          {flag.severity}
        </span>
      </div>

      <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">Issue</p>
            <p className="text-muted-foreground leading-relaxed">{flag.description}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">Impact if Ignored</p>
            <p className="text-muted-foreground leading-relaxed">{flag.impact}</p>
          </div>
          {flag.citation && (
            <div className="p-4 rounded-lg border border-border bg-secondary">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Research Evidence</p>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{flag.citation.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
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
            <div className="p-4 rounded-lg border border-border bg-secondary">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Research Evidence</p>
              <p className="text-xs text-muted-foreground italic leading-relaxed">{flag.evidence}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Affects</p>
            <div className="flex flex-wrap gap-1.5">
              {flag.affectedParadigms.map(p => (
                <span key={p} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium bg-secondary text-muted-foreground border border-border capitalize">
                  {p.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Required Mitigations</p>
            <ul className="space-y-2">
              {flag.mitigation.map((step, stepIdx) => (
                <li key={stepIdx} className="flex gap-2 text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-mono shrink-0">→</span>
                  <span className={step.includes('REQUIRED') ? 'font-medium text-foreground' : ''}>
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