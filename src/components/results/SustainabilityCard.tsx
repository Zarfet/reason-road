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

export function SustainabilityCard({ recommendation, answers }: SustainabilityCardProps) {
  const report = generateSustainabilityReport(recommendation, answers.valuesRanking, answers.geography || undefined);
  
  if (!report.applicable) return null;
  
  return (
    <BentoBox size="wide">
      <BentoHeader 
        title="Sustainability Report" 
        subtitle={report.reason}
        icon={<Leaf className="h-5 w-5 text-green-600" />}
      />
      
      {/* Sustainability Score */}
      <div className="mb-6 flex items-center justify-center gap-4 p-6 rounded-lg bg-muted/50">
        <div className="text-center">
          <div className={`text-5xl font-bold stat-highlight`}>
            {report.sustainabilityScore}
          </div>
          <div className="text-sm text-muted-foreground">/100 Sustainability Score</div>
        </div>
        <div className="border-l border-border pl-6">
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
                <span className="text-muted-foreground"> device lifecycle</span>
              </div>
            </div>
          </div>
        </div>
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
          <h4 className="font-semibold text-sm mb-2">vs Pure Screen Interface</h4>
          <div className="space-y-1 text-sm">
            <div>Energy: <span className="font-semibold">{report.comparisonVsPureScreen.energySavings}</span></div>
            <div>CO₂: <span className="font-semibold">{report.comparisonVsPureScreen.co2Savings}</span></div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-semibold text-sm mb-2">vs Pure VR Interface</h4>
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
      {report.citationCount && (
        <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span>📚 This analysis is backed by {report.citationCount} peer-reviewed research sources</span>
          </span>
        </div>
      )}
    </BentoBox>
  );
}
