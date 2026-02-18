/**
 * Regulatory Analysis Card — Tech-Minimalist
 */

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, FileText, ExternalLink } from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { BentoBox } from './bento/BentoGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RegulatoryAnalysis, RegulatoryRequirement } from '@/lib/regulatoryAnalysis';
import { getParadigmDisplayName } from '@/lib/regulatoryAnalysis';
import { cn } from '@/lib/utils';

interface RegulatoryCardProps {
  analysis: RegulatoryAnalysis;
}

function getImpactIcon(level: RegulatoryRequirement['impactLevel']) {
  switch (level) {
    case 'critical': return <AlertTriangle className="h-5 w-5 text-foreground" />;
    case 'high': return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    case 'medium': return <Info className="h-5 w-5 text-muted-foreground" />;
    case 'low': return <CheckCircle className="h-5 w-5 text-muted-foreground" />;
  }
}

function getRiskBadgeClassName(level: RegulatoryAnalysis['overallRiskLevel']) {
  switch (level) {
    case 'critical': return 'bg-risk text-risk-foreground';
    case 'high': return 'bg-risk text-risk-foreground';
    case 'medium': return 'bg-warning text-warning-foreground';
    case 'low': return 'border border-border text-muted-foreground';
    default: return '';
  }
}

export function RegulatoryCard({ analysis }: RegulatoryCardProps) {
  return (
    <BentoBox size="wide">
      <p className="text-sm text-muted-foreground mb-6">
        {analysis.region} deployment — GDPR + EU AI Act compliance
      </p>
      
      {/* Regulatory Context */}
      <div className={`mb-6 p-5 rounded-lg border ${
        analysis.overallRiskLevel === 'critical' ? 'bg-risk-muted border-risk-border' :
        analysis.overallRiskLevel === 'high' ? 'bg-warning-muted border-warning-border' :
        'bg-muted border-border'
      }`}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Regulatory Classification
            </p>
      <p className="text-sm text-foreground leading-relaxed">
        {analysis.riskRationale || 'Risk classification based on selected paradigms and deployment context.'}
      </p>
          </div>

    {analysis.complianceCategories && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.complianceCategories.procedural?.length > 0 && (
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Procedural
                </p>
                <ul className="space-y-1">
                  {analysis.complianceCategories.procedural.map((item, idx) => (
                    <li key={idx} className="text-xs text-foreground leading-relaxed">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.complianceCategories.technical?.length > 0 && (
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Technical
                </p>
                <ul className="space-y-1">
                  {analysis.complianceCategories.technical.map((item, idx) => (
                    <li key={idx} className="text-xs text-foreground leading-relaxed">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.complianceCategories.organizational?.length > 0 && (
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Organizational
                </p>
                <ul className="space-y-1">
                  {analysis.complianceCategories.organizational.map((item, idx) => (
                    <li key={idx} className="text-xs text-foreground leading-relaxed">• {item}</li>
                  ))}
                </ul>
              </div>
           )}
          </div>
          )}

          {analysis.preLaunchBlockers && analysis.preLaunchBlockers.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Pre-Launch Requirements
              </p>
              <ul className="space-y-1.5">
                {analysis.preLaunchBlockers.map((blocker, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                      analysis.overallRiskLevel === 'critical' ? 'text-risk' : 'text-warning'
                    }`} />
                    <span className="text-foreground">{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.officialGuidance && analysis.officialGuidance.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Official Guidance
              </p>
              <div className="space-y-1.5">
                {analysis.officialGuidance.map((guide, idx) => (
                  <a
                    key={idx}
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{guide.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-4 rounded-lg border border-border bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-wider">Detailed Requirements</span>
          </div>
          <p className="text-lg font-mono font-bold text-foreground">{analysis.requirements.length}</p>
        </motion.div>
      </div>
      
      <Accordion type="multiple" className="mb-6">
        {analysis.requirements.map((req, idx) => (
          <AccordionItem key={idx} value={`req-${idx}`} className="border-border">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 flex-1 text-left">
                {getImpactIcon(req.impactLevel)}
                <div className="flex-1 min-w-0">
                   <p className="font-medium text-foreground truncate">{req.title}</p>
                   <p className="text-xs text-muted-foreground font-mono">{req.regulation}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-secondary/30">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Legal Source</p>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{req.citation.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {req.citation.authors || req.citation.source} · {req.citation.year}
                        </p>
                        {req.citation.section && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">{req.citation.section}</p>
                        )}
                        <p className="text-sm text-muted-foreground italic mt-2">"{req.citation.keyRequirement}"</p>
                      </div>
                      {req.citation.url && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(req.citation.url, '_blank')} className="text-foreground hover:bg-secondary shrink-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Applies to</p>
                    <div className="flex flex-wrap gap-2">
                      {req.applicableParadigms.map((paradigm, pIdx) => (
                        <Badge key={pIdx} variant="outline" className="text-xs font-mono border-border text-muted-foreground">
                          {getParadigmDisplayName(paradigm)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-secondary/30">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Required Actions</p>
                    <ul className="space-y-1.5">
                      {req.mitigationSteps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          {step.startsWith('REQUIRED:') ? (
                            <AlertTriangle className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
       
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground italic leading-relaxed font-mono">{analysis.disclaimer}</p>
      </div>
    </BentoBox>
  );
}