/**
 * Overview Tab - Executive summary with context-specific insights
 * 
 * Contains:
 * - Strategic Rationale (WHY this config for THIS user)
 * - Signal Strength (confidence + score differentiation)
 * - Top 3 Strengths (personalized, with tab links)
 * - Top 3 Risks (personalized with mitigations + tab links)
 */

import { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb,
  Shield,
  CheckCircle,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { BentoGrid, BentoBox, BentoHeader } from '../bento/BentoGrid';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { RecommendationResult, AssessmentAnswers } from '@/types/assessment';
import { PARADIGM_LABELS } from '@/types/assessment';
import type { RedFlag } from '@/lib/scoring';

interface OverviewTabProps {
  recommendation: RecommendationResult;
  answers: AssessmentAnswers;
  reasoningBullets: string[];
  redFlags: RedFlag[];
  confidenceLevel: number;
  onTabChange?: (tab: string) => void;
}

// --- Helper: render **bold** markdown ---
function renderBold(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ================================================
// CONTEXT-SPECIFIC GENERATORS
// ================================================

export function generateStrategicRationale(rec: RecommendationResult, answers: AssessmentAnswers): string {
  const primary = PARADIGM_LABELS[rec.primary.paradigm];
  const secondary = PARADIGM_LABELS[rec.secondary.paradigm];
  const demographics = answers.userDemographics || 'your users';
  const topValue = answers.valuesRanking[0] || 'your priorities';
  const geo = answers.geography || 'your region';

  return `For ${demographics.toLowerCase()}, deploying in ${geo === 'Internal tool' ? 'an internal context' : geo.toLowerCase()}, this strategy recommends **${primary}** (${rec.primary.pct}%) as the foundation with **${secondary}** (${rec.secondary.pct}%) as complement. This aligns with your top priority of "${topValue}" while accounting for task ${answers.taskComplexity?.toLowerCase() || 'varied'} complexity and ${answers.contextOfUse?.toLowerCase() || 'general'} usage context.`;
}

interface Strength {
  title: string;
  description: string;
  tabLink?: { label: string; tab: string };
}

function generateStrengths(rec: RecommendationResult, answers: AssessmentAnswers): Strength[] {
  const strengths: Strength[] = [];
  const demo = (answers.userDemographics || '').toLowerCase();

  // Demographics-driven
  if (/elderly|senior|60\+|65\+|retired/.test(demo)) {
    strengths.push({ title: 'Age-Appropriate Design', description: 'Configuration prioritizes familiar interaction patterns suited for senior users with high adoption rates.' });
  }
  if (/tech.?savvy|developer|engineer|expert/.test(demo)) {
    strengths.push({ title: 'Power User Fit', description: 'Leverages advanced paradigms that tech-savvy users adopt quickly and prefer.' });
  }
  if (/blind|visual.?impair|low.vision/.test(demo)) {
    strengths.push({ title: 'Accessibility First', description: 'Voice-forward strategy ensures full access for visually impaired users.' });
  }

  // Geography-driven
  if (answers.geography === 'Primarily Europe') {
    strengths.push({ 
      title: 'GDPR Ready', 
      description: 'Configuration minimizes automated decision-making, reducing GDPR Article 22 compliance burden.',
      tabLink: { label: 'See Regulatory Analysis', tab: 'implementation' }
    });
  }

  // Values-driven
  if (answers.valuesRanking[0] === 'Sustainability') {
    strengths.push({ 
      title: 'Low Carbon Impact', 
      description: 'Configuration avoids high-energy spatial computing. See Sustainability tab for full environmental analysis.',
      tabLink: { label: 'See Sustainability Report', tab: 'implementation' }
    });
  }
  if (answers.valuesRanking[0] === 'Accessibility') {
    strengths.push({ title: 'Universal Access', description: 'Multi-modal approach ensures alternatives exist for every ability level and context.' });
  }

  // Context-driven
  if (answers.contextOfUse === 'Hands occupied') {
    strengths.push({ title: 'Hands-Free Capable', description: 'Voice and automation paradigms enable interaction without physical input devices.' });
  }
  if (answers.taskComplexity === 'Simple' && rec.allScores.invisible > 20) {
    strengths.push({ title: 'Automation Aligned', description: 'Simple, repetitive tasks map perfectly to invisible/ambient automation.' });
  }

  // Score-driven
  if (rec.primary.pct >= 40) {
    strengths.push({ title: 'Clear Winner', description: `Strong signal (${rec.primary.pct}%) for ${PARADIGM_LABELS[rec.primary.paradigm]} — high confidence in primary recommendation.` });
  }

  // Fill with generic if needed
  while (strengths.length < 3) {
    strengths.push({ title: 'Balanced Multi-Modal', description: 'Strategy distributes interaction across paradigms, reducing single-point-of-failure risk.' });
  }

  return strengths.slice(0, 3);
}

interface Risk {
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  mitigation: string;
  tabLink?: { label: string; tab: string };
}

function generateRisks(rec: RecommendationResult, answers: AssessmentAnswers, redFlags: RedFlag[]): Risk[] {
  const risks: Risk[] = [];

  // From red flags
  redFlags.slice(0, 2).forEach(flag => {
    risks.push({
      severity: 'Medium',
      title: flag.source,
      description: flag.text.replace(/⚠️\s*/, ''),
      mitigation: flag.description.split('.')[1]?.trim() || 'Review configuration carefully.',
      tabLink: { label: 'See full analysis', tab: 'analysis' }
    });
  });

  // Screen fatigue
  if (rec.allScores.traditional_screen > 60) {
    risks.push({
      severity: 'Medium',
      title: 'Screen Fatigue Risk',
      description: 'Heavy reliance on screens (>60%) may cause eye strain in extended sessions.',
      mitigation: 'Implement 20-20-20 rule and dark mode support.',
      tabLink: { label: 'See Sustainability Report', tab: 'implementation' }
    });
  }

  // Multi-paradigm complexity
  const activeParadigms = Object.values(rec.allScores).filter(p => p > 10).length;
  if (activeParadigms > 3) {
    risks.push({
      severity: 'Low',
      title: 'Multi-Modal Complexity',
      description: `Users must learn ${activeParadigms} interaction models, increasing onboarding time.`,
      mitigation: 'Provide unified onboarding covering all interaction modes progressively.',
      tabLink: { label: 'See Red Flags analysis', tab: 'implementation' }
    });
  }

  while (risks.length < 3) {
    risks.push({
      severity: 'Low',
      title: 'Training Investment',
      description: 'Team needs onboarding time for new interaction model adoption.',
      mitigation: 'Budget 1-2 weeks training and create internal documentation.',
      tabLink: { label: 'See Red Flags analysis', tab: 'implementation' }
    });
  }

  return risks.slice(0, 3);
}

const severityColor: Record<string, string> = {
  High: 'bg-risk-muted text-risk-muted-foreground border-risk-border',
  Medium: 'bg-warning-muted text-warning-muted-foreground border-warning-border',
  Low: 'bg-muted text-muted-foreground border border-border',
};

// ================================================
// COMPONENT
// ================================================

export function OverviewTab({ recommendation, answers, reasoningBullets, redFlags, confidenceLevel, onTabChange }: OverviewTabProps) {
  const rationale = useMemo(() => generateStrategicRationale(recommendation, answers), [recommendation, answers]);
  const strengths = useMemo(() => generateStrengths(recommendation, answers), [recommendation, answers]);
  const risks = useMemo(() => generateRisks(recommendation, answers, redFlags), [recommendation, answers, redFlags]);

  return (
    <BentoGrid className="mt-6">
      {/* Strategic Rationale - LARGE */}
      <BentoBox size="large">
        <BentoHeader
          title="Strategic Rationale"
          subtitle="Why this configuration for your context"
          icon={<Lightbulb className="h-5 w-5 text-accent" />}
        />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {renderBold(rationale)}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {reasoningBullets.slice(0, 4).map((bullet, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-muted/50"
            >
              <div className="shrink-0 h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                {i + 1}
              </div>
              <p className="text-sm text-foreground">{renderBold(bullet)}</p>
            </motion.div>
          ))}
        </div>
      </BentoBox>

      {/* Signal Strength - SMALL */}
      <BentoBox size="small">
        <BentoHeader
          title="Signal Strength"
          icon={<Gauge className="h-5 w-5 text-accent" />}
        />
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Recommendation Confidence</span>
              <span className={`font-bold ${confidenceLevel >= 70 ? 'text-success' : confidenceLevel >= 50 ? 'text-warning' : 'text-risk'}`}>
                {confidenceLevel >= 70 ? 'Strong' : confidenceLevel >= 50 ? 'Moderate' : 'Weak'}
              </span>
            </div>
            <Progress value={confidenceLevel} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Score Differentiation</span>
              <span className="font-semibold text-foreground">
                {recommendation.primary.pct - recommendation.secondary.pct >= 15 ? 'High' :
                 recommendation.primary.pct - recommendation.secondary.pct >= 8 ? 'Medium' : 'Low'}
              </span>
            </div>
            <Progress
              value={Math.min(100, (recommendation.primary.pct - recommendation.secondary.pct) * 3)}
              className="h-1.5"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on response consistency and score separation between paradigms
          </p>
        </div>
      </BentoBox>

      {/* Top 3 Strengths - LARGE */}
      <BentoBox size="wide">
        <BentoHeader
          title="Key Strengths"
          subtitle="Personalized to your context"
          icon={<CheckCircle className="h-5 w-5 text-accent" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {strengths.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-lg border border-accent/20 bg-accent/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  {i + 1}
                </div>
                <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
              {s.tabLink && onTabChange && (
                <button
                  onClick={() => onTabChange(s.tabLink!.tab)}
                  className="text-xs text-accent hover:underline mt-2 flex items-center gap-1"
                >
                  → {s.tabLink.label}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </BentoBox>

      {/* Top 3 Risks - LARGE */}
      <BentoBox size="wide">
        <BentoHeader
          title="Risks to Watch"
          subtitle="With recommended mitigations"
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        />
        <div className="space-y-3">
          {risks.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-4 rounded-lg border ${severityColor[r.severity]}`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold">{r.title}</h4>
                <Badge variant="outline" className="text-[10px] px-2 py-0">
                  {r.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{r.description}</p>
              <p className="text-xs font-medium">
                → {r.mitigation}
              </p>
              {r.tabLink && onTabChange && (
                <button
                  onClick={() => onTabChange(r.tabLink!.tab)}
                  className="text-xs text-accent hover:underline mt-1 flex items-center gap-1"
                >
                  → {r.tabLink.label}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </BentoBox>
    </BentoGrid>
  );
}
