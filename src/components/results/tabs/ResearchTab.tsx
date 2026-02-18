/**
 * Research Tab — Tech-Minimalist
 */

import { BookOpen, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { ResearchPanel } from '../ResearchPanel';
import { CaseStudiesPanel } from '../CaseStudiesPanel';
import type { ParadigmScores } from '@/types/assessment';

interface ResearchTabProps {
  paradigm: keyof ParadigmScores;
  userDemographics?: string;
}

export function ResearchTab({ paradigm, userDemographics }: ResearchTabProps) {
  return (
    <div className="space-y-6 mt-6">
      <Accordion type="multiple" defaultValue={['research', 'cases']} className="space-y-0">
        <AccordionItem value="research" className="border-border">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1 text-left">
              <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Supporting Research</p>
                <p className="text-xs text-muted-foreground font-mono">AI-generated academic paper suggestions</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono font-semibold uppercase tracking-wider mr-2 border-border text-muted-foreground">
                AI Generated
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4">
              <ResearchPanel paradigm={paradigm} userDemographics={userDemographics} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cases" className="border-border">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1 text-left">
              <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center">
                <Lightbulb className="h-3.5 w-3.5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Real-World Case Studies</p>
                <p className="text-xs text-muted-foreground font-mono">Success stories and lessons from failures</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono font-semibold uppercase tracking-wider mr-2 border-border text-muted-foreground">
                AI Generated
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4">
              <CaseStudiesPanel paradigm={paradigm} userDemographics={userDemographics} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}