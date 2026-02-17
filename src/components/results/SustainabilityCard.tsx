/**
 * Sustainability Report Card
 * 
 * Shows environmental impact analysis with research citations,
 * energy/CO2 metrics, and actionable recommendations
 */

import { Leaf, Zap, Recycle, TrendingDown, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { BentoBox, BentoHeader } from './bento/BentoGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateSustainabilityReport } from '@/lib/sustainabilityAnalysis';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';

interface SustainabilityCardProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
}

function renderReason(reason: string) {
  if (reason.includes('EU Green Deal')) {
    return (
      <span>
        EU Green Deal compliance recommended (
        <a
          href="https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal_en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline hover:no-underline"
        >
          European Commission
        </a>
        )
      </span>
    );
  }
  return reason;
}

export function SustainabilityCard({ recommendation, answers }: SustainabilityCardProps) {
  const report = generateSustainabilityReport(recommendation, answers.valuesRanking, answers.geography || undefined);
  
  if (!report.applicable) return null;
  
  return (
    <BentoBox size="wide">
      <BentoHeader 
        title="Sustainability Report" 
        icon={<Leaf className="h-5 w-5 text-green-600" />}
      />
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        {renderReason(report.reason)}
      </p>
      
      {/* Energy and CO₂ Metrics */}
      <div className="mb-6 flex flex-col items-center gap-4 p-6 rounded-lg bg-muted/50">
        <div className="flex items-center justify-center gap-6 w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <div className="text-sm">
                <span className="font-semibold">{Math.round(report.weightedAnnualEnergy)} kWh</span>
                <span className="text-muted-foreground"> per user/year</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-accent" />
              <div className="text-sm">
                <span className="font-semibold">{Math.round(report.weightedAnnualCO2)} kg</span>
                <span className="text-muted-foreground"> CO₂ per user/year</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Recycle className="h-4 w-4 text-accent" />
              <div className="text-sm">
                <span className="font-semibold">{report.weightedLifecycle.toFixed(1)} years</span>
                <span className="text-muted-foreground"> avg device lifecycle</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Weighted average across your paradigm mix. CO₂ calculated using EU grid intensity (
          <a href="https://www.eea.europa.eu/data-and-maps/daviz/co2-emission-intensity-6" target="_blank" rel="noopener noreferrer" className="text-accent underline">EEA 2023</a>
          : ~0.3 kg CO₂/kWh).
        </p>
      </div>

      {/* Paradigm Breakdown */}
      <div className="mb-6">
        <h4 className="font-semibold text-sm mb-3">Environmental Impact by Paradigm</h4>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Paradigm</th>
                <th className="px-4 py-2 text-center font-medium">Usage</th>
                <th className="px-4 py-2 text-center font-medium">Energy</th>
                <th className="px-4 py-2 text-center font-medium">CO₂</th>
                <th className="px-4 py-2 text-center font-medium">Lifecycle</th>
              </tr>
            </thead>
            <tbody>
              {report.paradigmBreakdown.map((p, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-left">
                    <div className="font-medium capitalize">{p.paradigm.replace('_', '/')}</div>
                    <div className="text-xs text-muted-foreground">{p.hardwareExample}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{p.percentage}%</td>
                  <td className="px-4 py-3 text-center text-accent font-medium">{p.annualEnergyKwh} kWh</td>
                  <td className="px-4 py-3 text-center text-accent font-medium">{p.annualCO2Kg} kg</td>
                  <td className="px-4 py-3 text-center">{p.hardwareLifecycle} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-semibold text-sm mb-1">vs Pure Screen Interface</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Baseline: 100% traditional screen (50 kWh/yr per user,{' '}
            <a href="https://www.iea.org/reports/more-data-less-energy" target="_blank" rel="noopener noreferrer" className="text-accent underline">IEA 2023</a>)
          </p>
          <div className="space-y-1 text-sm">
            <div>Energy: <span className="font-semibold">{report.comparisonVsPureScreen.energySavings}</span></div>
            <div>CO₂: <span className="font-semibold">{report.comparisonVsPureScreen.co2Savings}</span></div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-semibold text-sm mb-1">vs Pure VR Interface</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Baseline: 100% spatial computing (200 kWh/yr per user,{' '}
            <a href="https://sustainability.fb.com/reports/" target="_blank" rel="noopener noreferrer" className="text-accent underline">Meta Sustainability Report 2023</a>)
          </p>
          <div className="space-y-1 text-sm">
            <div>Energy: <span className="font-semibold text-accent">{report.comparisonVsPureVR.energySavings}</span></div>
            <div>CO₂: <span className="font-semibold text-accent">{report.comparisonVsPureVR.co2Savings}</span></div>
          </div>
        </div>
      </div>

      {/* Green Flags */}
      {report.greenFlags.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-secondary/30">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            What You're Doing Right
          </h4>
          <ul className="space-y-2">
            {report.greenFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-foreground">{flag}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Based on weighted energy, CO₂, and lifecycle thresholds derived from IEA and EEA benchmarks.
          </p>
        </div>
      )}

      {/* Red Flags */}
      {report.redFlags.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {report.redFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-foreground">{flag}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Based on weighted energy, CO₂, and lifecycle thresholds derived from IEA and EEA benchmarks.
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Sustainability Recommendations</h4>
        <ul className="space-y-2">
          {report.recommendations.map((rec, idx) => (
            <li key={idx} className="flex gap-3 text-sm">
              <span className="text-accent">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Research Citations Footer */}
      <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <span>📚</span>
          <span>
            Environmental metrics derived from industry research including{' '}
            <a
              href="https://eta.lbl.gov/publications/energy-consumption-consumer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline hover:no-underline"
            >
              Lawrence Berkeley National Laboratory
            </a>
            ,{' '}
            <a
              href="https://www.iea.org/reports/more-data-less-energy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline hover:no-underline"
            >
              IEA Energy Benchmarks
            </a>
            , and{' '}
            <a
              href="https://ewastemonitor.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline hover:no-underline"
            >
              Global E-waste Monitor
            </a>
            .
          </span>
        </div>
      </div>

       {/* Disclaimer */}
       <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/30">
         <p className="text-xs text-muted-foreground italic leading-relaxed">
           {report.disclaimer}
         </p>
       </div>
    </BentoBox>
  );
}
