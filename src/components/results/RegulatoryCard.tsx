/**
 * Regulatory Analysis Card
 * 
 * Displays GDPR, EU AI Act, and data sovereignty requirements
 * Conditionally renders based on geography selection
 * Includes legal citations with EUR-Lex links
 */

import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Euro,
  Clock,
  FileText,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
    case 'critical':
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5 text-destructive/70" />;
    case 'medium':
      return <Info className="h-5 w-5 text-accent" />;
    case 'low':
      return <CheckCircle className="h-5 w-5 text-accent" />;
  }
}

function getRiskBadgeVariant(level: RegulatoryAnalysis['overallRiskLevel']) {
  switch (level) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getRiskBadgeClassName(level: RegulatoryAnalysis['overallRiskLevel']) {
  switch (level) {
    case 'critical':
      return 'bg-destructive text-destructive-foreground';
    case 'high':
      return 'bg-orange-500 text-white border-orange-500';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500';
    case 'low':
      return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500';
    default:
      return '';
  }
}

export function RegulatoryCard({ analysis }: RegulatoryCardProps) {
  return (
    <BentoBox size="wide">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <BentoHeader 
          title="Regulatory Impact Analysis" 
          subtitle={`${analysis.region} deployment - GDPR + EU AI Act compliance`}
          icon={<Shield className="h-5 w-5 text-accent" />}
        />
        
        {/* Risk Badge */}
        <Badge 
          variant="outline"
          className={cn(
            "uppercase font-bold text-xs shrink-0",
            getRiskBadgeClassName(analysis.overallRiskLevel)
          )}
        >
          {analysis.overallRiskLevel} Risk
        </Badge>
      </div>
      
      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-muted/50 border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Euro className="h-4 w-4" />
            <span className="text-xs font-medium">Estimated Cost</span>
          </div>
          <p className="text-lg font-bold text-foreground">{analysis.totalEstimatedCost}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-lg bg-muted/50 border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Timeline Impact</span>
          </div>
          <p className="text-lg font-bold text-foreground">{analysis.totalTimelineImpact}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-muted/50 border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">Requirements</span>
          </div>
          <p className="text-lg font-bold text-foreground">{analysis.requirements.length}</p>
        </motion.div>
      </div>
      
      {/* Requirements Accordion */}
      <Accordion type="multiple" className="mb-6">
        {analysis.requirements.map((req, idx) => (
          <AccordionItem key={idx} value={`req-${idx}`} className="border-border">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 flex-1 text-left">
                {/* Impact Icon */}
                {getImpactIcon(req.impactLevel)}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{req.title}</p>
                  <p className="text-xs text-muted-foreground">{req.regulation}</p>
                </div>
                
                {/* Cost Badge */}
                <Badge variant="outline" className="shrink-0 text-xs">
                  {req.estimatedCost}
                </Badge>
              </div>
            </AccordionTrigger>
            
            <AccordionContent>
              <div className="space-y-4 pt-2 pb-4">
                {/* Description */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-muted-foreground">{req.description}</p>
                </div>
                
                {/* Legal Citation */}
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">
                          {req.citation.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {req.citation.authors || req.citation.source} • {req.citation.year}
                        </p>
                        {req.citation.section && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {req.citation.section}
                          </p>
                        )}
                      </div>
                      {req.citation.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(req.citation.url, '_blank')}
                          className="text-accent hover:bg-accent/10"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground italic mt-2">
                      "{req.citation.keyRequirement}"
                    </p>
                  </div>
                </div>
                
                {/* Applies to */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Applies to:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {req.applicableParadigms.map((paradigm, pIdx) => (
                      <Badge key={pIdx} variant="secondary" className="text-xs">
                        {getParadigmDisplayName(paradigm)}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Impact Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded bg-muted/20 border border-border/50">
                    <p className="text-xs text-muted-foreground">Development Overhead</p>
                    <p className="text-sm font-medium text-foreground">{req.developmentOverhead}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/20 border border-border/50">
                    <p className="text-xs text-muted-foreground">Timeline Impact</p>
                    <p className="text-sm font-medium text-foreground">{req.timelineImpact}</p>
                  </div>
                </div>
                
                {/* Mitigation Steps */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Required Actions:
                  </p>
                  <ul className="space-y-1.5">
                    {req.mitigationSteps.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        {step.startsWith('REQUIRED:') ? (
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        )}
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Recommendations Section */}
      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Key Recommendations</span>
        </div>
        <ul className="space-y-2">
          {analysis.recommendations.map((rec, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="text-accent">•</span>
              <span>{rec}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </BentoBox>
  );
}
