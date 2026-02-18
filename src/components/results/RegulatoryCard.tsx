/**
 * Regulatory Analysis Card — Tech-Minimalist
 */

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Info, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { BentoBox, BentoHeader } from './bento/BentoGrid';
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
      <div className="flex items-start justify-between gap-4 mb-6">
        <BentoHeader 
          title="Regulatory Impact Analysis" 
          subtitle={`${analysis.region} deployment - GDPR + EU AI Act compliance`}
          icon={<Shield className="h-5 w-5" />}
        />
        <Badge variant="outline" className={cn("uppercase font-mono font-bold text-xs shrink-0", getRiskBadgeClassName(analysis.overallRiskLevel))}>
          {analysis.overallRiskLevel} Risk
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-4 rounded-lg border border-border bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-wider">Requirements</span>
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