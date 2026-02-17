/**
 * Impact Tab - Regulatory, Environmental, and Risk Analysis
 * Uses accordion navigation for each section
 */

import { Shield, Leaf, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RegulatoryCard } from '../RegulatoryCard';
import { SustainabilityCard } from '../SustainabilityCard';
import { RedFlagsCard } from '../RedFlagsCard';
import { generateRegulatoryAnalysis } from '@/lib/regulatoryAnalysis';
import { generateSustainabilityReport } from '@/lib/sustainabilityAnalysis';
import { detectRedFlags } from '@/lib/redFlagsDetector';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface ImpactTabProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

export function ImpactTab({ recommendation, answers }: ImpactTabProps) {
  const regulatoryAnalysis = generateRegulatoryAnalysis(answers, recommendation);
  const sustainabilityReport = generateSustainabilityReport(recommendation, answers.valuesRanking, answers.geography || undefined);
  const redFlagsReport = detectRedFlags(answers, recommendation);

  const sections = [
    {
      id: 'regulatory',
      icon: <Shield className="h-4 w-4 text-accent" />,
      title: 'Regulatory Impact Analysis',
      subtitle: regulatoryAnalysis ? `${regulatoryAnalysis.requirements.length} requirements identified` : 'Not applicable',
      badge: regulatoryAnalysis ? regulatoryAnalysis.overallRiskLevel.toUpperCase() : null,
      badgeClass: regulatoryAnalysis?.overallRiskLevel === 'critical' || regulatoryAnalysis?.overallRiskLevel === 'high'
        ? 'bg-destructive/10 text-destructive border-destructive/20'
        : 'bg-accent/10 text-accent border-accent/20',
      available: !!regulatoryAnalysis,
      content: regulatoryAnalysis ? <RegulatoryCard analysis={regulatoryAnalysis} /> : null,
    },
    {
      id: 'sustainability',
      icon: <Leaf className="h-4 w-4 text-accent" />,
      title: 'Sustainability Report',
      subtitle: sustainabilityReport.applicable
        ? `${Math.round(sustainabilityReport.weightedAnnualCO2)} kg CO₂/year`
        : 'Not applicable',
      badge: sustainabilityReport.applicable ? 'ACTIVE' : null,
      badgeClass: 'bg-accent/10 text-accent border-accent/20',
      available: sustainabilityReport.applicable,
      content: <SustainabilityCard recommendation={recommendation} answers={answers} />,
    },
    {
      id: 'redflags',
      icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
      title: 'Red Flags & Critical Considerations',
      subtitle: redFlagsReport.hasFlags
        ? `${redFlagsReport.totalFlags} issue(s) detected`
        : 'No issues detected',
      badge: redFlagsReport.criticalCount > 0 ? `${redFlagsReport.criticalCount} CRITICAL` : redFlagsReport.hasFlags ? `${redFlagsReport.totalFlags} FLAGS` : null,
      badgeClass: redFlagsReport.criticalCount > 0
        ? 'bg-destructive/10 text-destructive border-destructive/20'
        : 'bg-secondary text-muted-foreground border-border',
      available: redFlagsReport.hasFlags,
      content: <RedFlagsCard recommendation={recommendation} answers={answers} />,
    },
  ];

  const availableSections = sections.filter(s => s.available);

  return (
    <div className="space-y-6 mt-6">
      <Accordion type="multiple" className="space-y-0">
        {availableSections.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{section.title}</p>
                  <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                </div>
                {section.badge && (
                  <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider mr-2 ${section.badgeClass}`}>
                    {section.badge}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                {section.content}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {availableSections.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No impact analysis available for this assessment.
        </p>
      )}
    </div>
  );
}
