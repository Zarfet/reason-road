/**
 * Implementation Tab - Cost estimates, timeline, and tech stack
 */

import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Clock, 
  Layers,
  Users,
  Zap,
  Construction
} from 'lucide-react';
import { BentoGrid, BentoBox, BentoHeader } from '../bento/BentoGrid';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { RecommendationResult, ParadigmScores } from '@/types/assessment';
import { PARADIGM_LABELS } from '@/types/assessment';

interface ImplementationTabProps {
  recommendation: RecommendationResult;
}

// Rough cost estimates per paradigm
const paradigmCosts: Record<keyof ParadigmScores, { hardware: string; development: string }> = {
  traditional_screen: { hardware: '$0 - $500', development: '$50,000 - $150,000' },
  invisible: { hardware: '$200 - $1,000', development: '$80,000 - $200,000' },
  ai_vectorial: { hardware: '$0', development: '$100,000 - $300,000' },
  spatial: { hardware: '$300 - $3,500', development: '$200,000 - $500,000' },
  voice: { hardware: '$0 - $100', development: '$60,000 - $180,000' },
};

// Timeline estimates per paradigm
const paradigmTimelines: Record<keyof ParadigmScores, string> = {
  traditional_screen: '3-6 months',
  invisible: '4-8 months',
  ai_vectorial: '4-10 months',
  spatial: '6-12 months',
  voice: '3-6 months',
};

export function ImplementationTab({ recommendation }: ImplementationTabProps) {
  const primaryParadigm = recommendation.primary.paradigm;
  const costs = paradigmCosts[primaryParadigm];
  const timeline = paradigmTimelines[primaryParadigm];

  return (
    <BentoGrid className="mt-6">
      {/* Cost Estimates - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Estimated Costs" 
          subtitle={`For ${PARADIGM_LABELS[primaryParadigm]} implementation`}
          icon={<DollarSign className="h-5 w-5 text-accent" />}
        />
        
        <div className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Hardware per user</span>
            </div>
            <span className="font-semibold text-foreground">{costs.hardware}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Development</span>
            </div>
            <span className="font-semibold text-foreground">{costs.development}</span>
          </motion.div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            * Estimates based on industry averages. Actual costs vary by scope and team.
          </div>
        </div>
      </BentoBox>

      {/* Timeline - MEDIUM */}
      <BentoBox size="medium">
        <BentoHeader 
          title="Development Timeline" 
          subtitle="Typical project phases"
          icon={<Clock className="h-5 w-5 text-accent" />}
        />
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <Zap className="h-5 w-5 text-accent" />
            <div>
              <p className="font-semibold text-foreground">Estimated: {timeline}</p>
              <p className="text-xs text-muted-foreground">From kickoff to launch</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { phase: 'Discovery & Planning', weeks: '2-4 weeks' },
              { phase: 'Core Development', weeks: '8-16 weeks' },
              { phase: 'Testing & Iteration', weeks: '4-8 weeks' },
              { phase: 'Launch & Monitoring', weeks: '2-4 weeks' },
            ].map((item, index) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.phase}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.weeks}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </BentoBox>

      {/* Technical Stack - WIDE (full width) */}
      <BentoBox size="wide">
        <BentoHeader 
          title="Recommended Tech Stack" 
          subtitle="Technologies commonly used for this paradigm"
          icon={<Layers className="h-5 w-5 text-accent" />}
        />
        
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Detailed tech stack recommendations coming soon
            </p>
            <Badge variant="secondary" className="mt-2">Future Enhancement</Badge>
          </div>
        </div>
      </BentoBox>
    </BentoGrid>
  );
}
