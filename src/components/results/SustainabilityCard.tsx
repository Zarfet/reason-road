/**
 * Sustainability Report Card — Tech-Minimalist
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
        <a href="https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal_en" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">European Commission</a>
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
      <BentoHeader title="Sustainability Report" icon={<Leaf className="h-5 w-5" />} />
      <p className="text-sm text-muted-foreground -mt-2 mb-4">{renderReason(report.reason)}</p>
      
      {/* Energy and CO₂ Metrics */}
      <div className="mb-6 flex flex-col items-center gap-4 p-6 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center justify-center gap-6 w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-foreground" />
              <div className="text-sm">
                <span className="font-mono font-semibold">{Math.round(report.weightedAnnualEnergy)} kWh</span>
                <span className="text-muted-foreground"> per user/year</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-foreground" />
              <div className="text-sm">
                <span className="font-mono font-semibold">{Math.round(report.weightedAnnualCO2)} kg</span>
                <span className="text-muted-foreground"> CO₂/year</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Recycle className="h-4 w-4 text-foreground" />
              <div className="text-sm">
                <span className="font-mono font-semibold">{report.weightedLifecycle.toFixed(1)} years</span>
                <span className="text-muted-foreground"> avg device lifecycle</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center font-mono">
          Weighted average across your interface mix. CO₂ calculated using EU grid intensity (
          <a href="https://www.eea.europa.eu/en/analysis/maps-and-charts/co2-intensity-of-electricity-generation-in-europe" target="_blank" rel="noopener noreferrer" className="text-foreground underline">EEA 2023</a>
          : ~0.3 kg CO₂/kWh).
        </p>
      </div>

      {/* Paradigm Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-sm mb-3 tracking-tight">Environmental Impact by Interface Type</h4>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">Interface Type</th>
                <th className="px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">Usage</th>
                <th className="px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">Energy</th>
                <th className="px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">CO₂</th>
                <th className="px-4 py-2 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">Lifecycle</th>
              </tr>
            </thead>
            <tbody>
              {report.paradigmBreakdown.map((p, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-left">
                    <div className="font-medium capitalize">{p.paradigm.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.hardwareExample}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">{p.percentage}%</td>
                  <td className="px-4 py-3 text-center font-mono font-medium">{p.annualEnergyKwh} kWh</td>
                  <td className="px-4 py-3 text-center font-mono font-medium">{p.annualCO2Kg} kg</td>
                  <td className="px-4 py-3 text-center font-mono">{p.hardwareLifecycle} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison vs Baselines */}
      <div className="mb-6 space-y-3">
        <h4 className="font-medium text-sm tracking-tight">Comparison to Baselines</h4>
        
        {/* vs Pure Screen */}
        <div className={`p-4 rounded-lg border ${
          report.comparisonVsPureScreen.energySavings.includes('higher')
            ? 'bg-warning-muted border-warning-border'
            : 'bg-success-muted border-success-border'
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  vs Pure Traditional Screen
                </span>
                <span className={`text-sm font-medium ${
                  report.comparisonVsPureScreen.energySavings.includes('higher')
                    ? 'text-warning'
                    : 'text-success'
                }`}>
                  {report.comparisonVsPureScreen.energySavings}
                </span>
              </div>
              
              {report.comparisonVsPureScreen.explanation && (
                <div className="text-sm text-foreground leading-relaxed space-y-1">
                  {report.comparisonVsPureScreen.explanation.split('. ').map((sentence, i) => {
                    const [label, ...rest] = sentence.split(': ');
                    if (!rest.length) return <p key={i}>{sentence}</p>;
                    return (
                      <p key={i}>
                        <strong className="font-semibold">{label}:</strong> {rest.join(': ')}
                      </p>
                    );
                  })}
                </div>
              )}
              
              {!report.comparisonVsPureScreen.explanation && (
                <p className="text-sm text-muted-foreground">
                  Your interface mix is energy-efficient compared to traditional screen-only approaches.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* vs Pure VR */}
        <div className="p-4 rounded-lg border bg-success-muted border-success-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              vs Pure Spatial (VR/AR)
            </span>
            <span className="text-sm font-medium text-success">
              {report.comparisonVsPureVR.energySavings}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            VR headsets are the most energy-intensive interface type. Any mix that reduces VR usage is environmentally beneficial.
          </p>
        </div>
      </div>

      {/* Green Flags */}
      {report.greenFlags.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-secondary/30">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2 tracking-tight">
            <CheckCircle className="h-4 w-4 text-foreground" />
            What You're Doing Right
          </h4>
          <ul className="space-y-2">
            {report.greenFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-foreground flex gap-2"><span className="font-mono">→</span> {flag}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Assessed against benchmarks from{' '}
            <a href="https://eta.lbl.gov/publications/energy-consumption-consumer" target="_blank" rel="noopener noreferrer" className="text-foreground underline">LBNL</a>
            {' '}and{' '}
            <a href="https://ewastemonitor.info/" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Global E-waste Monitor</a>.
          </p>
        </div>
      )}

      {/* Red Flags */}
      {report.redFlags.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-foreground/20 bg-secondary/30">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2 tracking-tight">
            <AlertCircle className="h-4 w-4 text-foreground" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {report.redFlags.map((flag, idx) => (
              <li key={idx} className="text-sm text-foreground flex gap-2"><span className="font-mono">→</span> {flag}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2 italic font-mono">
            Based on weighted energy, CO₂, and lifecycle thresholds from IEA and EEA benchmarks.
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="font-medium text-sm mb-3 tracking-tight">Sustainability Recommendations</h4>
        <ul className="space-y-2">
          {report.recommendations.map((rec, idx) => (
            <li key={idx} className="flex gap-3 text-sm">
              <span className="text-foreground font-mono">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Research Citations */}
      <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground space-y-1 font-mono">
        <div className="flex items-center gap-2">
          <span>📚</span>
          <span>
            Environmental metrics derived from{' '}
            <a href="https://eta.lbl.gov/publications/energy-consumption-consumer" target="_blank" rel="noopener noreferrer" className="text-foreground underline">LBNL</a>
            ,{' '}
            <a href="https://www.iea.org/reports/more-data-less-energy" target="_blank" rel="noopener noreferrer" className="text-foreground underline">IEA</a>
            , and{' '}
            <a href="https://ewastemonitor.info/" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Global E-waste Monitor</a>.
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-4 rounded-lg border border-border bg-secondary/30">
        <p className="text-xs text-muted-foreground italic leading-relaxed">{report.disclaimer}</p>
      </div>
    </BentoBox>
  );
}