/**
 * Impact Tab - Regulatory, Sustainability, and Red Flags analysis
 */

import { useAssessment } from '@/context/AssessmentContext';
import { BentoGrid } from '../bento/BentoGrid';
import { RegulatoryCard } from '../RegulatoryCard';
import { SustainabilityCard } from '../SustainabilityCard';
import { RedFlagsCard } from '../RedFlagsCard';

export function ImpactTab() {
  const { recommendation, answers } = useAssessment();
  
  return (
    <BentoGrid className="mt-6">
      {/* Regulatory Impact - MEDIUM (conditional) */}
      <RegulatoryCard />
      
      {/* Sustainability Report - MEDIUM (conditional) */}
      <SustainabilityCard />
      
      {/* Red Flags - MEDIUM (conditional) */}
      <RedFlagsCard />
    </BentoGrid>
  );
}
