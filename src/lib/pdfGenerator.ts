/**
 * NEXUS PDF Report Generator — v3
 * Professional multi-section A4 report using jsPDF
 * Sections: Cover | Analysis | Regulatory | Sustainability | Red Flags
 */

import jsPDF from 'jspdf';
import {
  type AssessmentAnswers,
  type RecommendationResult,
  PARADIGM_LABELS,
} from '@/types/assessment';
import { getReasoningBullets } from '@/lib/scoring';
import { generateStrategicRationale } from '@/components/results/tabs/OverviewTab';
import { generateAllArguments } from '@/lib/argumentsGenerator';
import { generateSustainabilityReport } from '@/lib/sustainabilityAnalysis';
import { generateRegulatoryAnalysis } from '@/lib/regulatoryAnalysis';
import { detectRedFlags } from '@/lib/redFlagsDetector';

// ─── Types & tokens ───────────────────────────────────────────────────────────
type RGB = [number, number, number];

const C: Record<string, RGB> = {
  accent:  [22, 163, 74],
  white:   [255, 255, 255],
  fg:      [20, 20, 20],
  muted:   [110, 110, 110],
  border:  [218, 218, 218],
  card:    [246, 249, 246],
  forBg:   [237, 252, 240],
  againstBg:[255, 248, 236],
  redBg:   [254, 241, 241],
  crit:    [185, 28, 28],
  high:    [194, 65, 12],
  med:     [161, 98, 7],
  darkG:   [16, 110, 48],
};

// A4 in mm
const PW = 210;
const PH = 297;
const M  = 13;
const CW = PW - M * 2;
const HALF = (CW - 5) / 2;
const RX = M + HALF + 5;   // right column X

// Interface type labels — no "paradigm" word
const IL: Record<string, string> = {
  traditional_screen: 'Traditional Screen',
  invisible:          'Invisible / Ambient',
  ai_vectorial:       'AI Conversational',
  spatial:            'Spatial Computing',
  voice:              'Voice-First',
};
function iLabel(key: string): string {
  return IL[key] ?? (PARADIGM_LABELS as Record<string, string>)[key] ?? key.replace(/_/g, ' ');
}
function clean(s: string): string {
  return s.replace(/\*\*/g, '').replace(/CO2/g, 'CO2').trim();
}
// Safe replacement for special chars jsPDF can't handle
function safeText(s: string): string {
  return s
    .replace(/CO2/g, 'CO2')
    .replace(/CO₂/g, 'CO2')
    .replace(/₂/g, '2')
    .replace(/[▲▼✓✗→]/g, '')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/…/g, '...')
    .replace(/–/g, '-')
    .replace(/°/g, ' deg')
    .trim();
}

// ─── Builder class ────────────────────────────────────────────────────────────
class Doc {
  d: jsPDF;
  y = M;
  pageNum = 1;

  constructor() {
    this.d = new jsPDF({ unit: 'mm', format: 'a4' });
  }

  /** Add new page + strip header */
  newPage(): void {
    this.footer();
    this.d.addPage();
    this.pageNum++;
    this.y = M;
    this.pageStrip();
  }

  /** Check remaining space, add page if needed */
  need(h: number): void {
    if (this.y + h > PH - M - 12) this.newPage();
  }

  // ── Layout ──────────────────────────────────────────────────────────────

  pageStrip(): void {
    this.d.setFillColor(...C.accent);
    this.d.rect(0, 0, PW, 7, 'F');
    this.d.setTextColor(...C.white);
    this.d.setFontSize(6.5);
    this.d.setFont('helvetica', 'bold');
    this.d.text('NEXUS  -  Interface Paradigm Assessment Report', M, 5);
    this.y = 13;
  }

  footer(): void {
    const fy = PH - 8;
    this.d.setDrawColor(...C.border);
    this.d.setLineWidth(0.25);
    this.d.line(M, fy - 2, PW - M, fy - 2);
    this.d.setTextColor(...C.muted);
    this.d.setFontSize(6.5);
    this.d.setFont('helvetica', 'normal');
    this.d.text('NEXUS - Interface Paradigm Assessment', M, fy);
    this.d.text(String(this.pageNum), PW - M, fy, { align: 'right' });
  }

  sectionBand(label: string): void {
    this.need(12);
    this.d.setFillColor(...C.accent);
    this.d.rect(M, this.y, CW, 9, 'F');
    this.d.setTextColor(...C.white);
    this.d.setFontSize(9);
    this.d.setFont('helvetica', 'bold');
    this.d.text(safeText(label).toUpperCase(), M + 4, this.y + 6.5);
    this.y += 13;
  }

  rule(): void {
    this.d.setDrawColor(...C.border);
    this.d.setLineWidth(0.2);
    this.d.line(M, this.y, PW - M, this.y);
    this.y += 4;
  }

  gap(h = 4): void { this.y += h; }

  // ── Text helpers ────────────────────────────────────────────────────────

  h2(text: string, color: RGB = C.accent): void {
    this.need(8);
    this.d.setTextColor(...color);
    this.d.setFontSize(10);
    this.d.setFont('helvetica', 'bold');
    this.d.text(safeText(text), M, this.y);
    this.y += 6;
  }

  h3(text: string, x = M, color: RGB = C.fg): void {
    this.need(7);
    this.d.setTextColor(...color);
    this.d.setFontSize(8.5);
    this.d.setFont('helvetica', 'bold');
    this.d.text(safeText(text), x, this.y);
    this.y += 5;
  }

  /** Renders body text, returns height used */
  body(text: string, x = M, maxW = CW, lh = 4.4): number {
    this.d.setTextColor(...C.fg);
    this.d.setFontSize(8);
    this.d.setFont('helvetica', 'normal');
    const lines = this.d.splitTextToSize(safeText(clean(text)), maxW);
    this.d.text(lines, x, this.y);
    const h = lines.length * lh;
    this.y += h;
    return h;
  }

  caption(text: string, x = M, maxW = CW, color: RGB = C.muted): void {
    this.d.setTextColor(...color);
    this.d.setFontSize(7);
    this.d.setFont('helvetica', 'normal');
    const lines = this.d.splitTextToSize(safeText(clean(text)), maxW);
    this.d.text(lines, x, this.y);
    this.y += lines.length * 3.8;
  }

  /** Pill/badge */
  pill(text: string, x: number, y: number, bg: RGB, fg: RGB = C.white, w = 22): void {
    this.d.setFillColor(...bg);
    this.d.roundedRect(x, y - 3.5, w, 5.5, 1.5, 1.5, 'F');
    this.d.setTextColor(...fg);
    this.d.setFontSize(5.5);
    this.d.setFont('helvetica', 'bold');
    this.d.text(safeText(text).toUpperCase(), x + w / 2, y + 0.2, { align: 'center' });
  }

  /** Card background rect */
  card(x: number, y: number, w: number, h: number, bg: RGB = C.card): void {
    this.d.setFillColor(...bg);
    this.d.roundedRect(x, y, w, h, 2, 2, 'F');
  }
}


// ─── Research cache interfaces (mirrors ResearchPanel / CaseStudiesPanel) ────
interface ResearchPaper {
  title: string;
  authors: string;
  year: number;
  venue: string;
  abstract: string;
  relevance: string;
}

interface CaseStudy {
  name: string;
  company: string;
  year: number;
  outcome: 'success' | 'failure';
  description: string;
  keyFactors: string[];
  lessonsLearned: string;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generatePDFReport({
  answers,
  recommendation,
  createdAt,
}: {
  answers: AssessmentAnswers;
  recommendation: RecommendationResult;
  createdAt?: string;
}): void {
  const doc = new Doc();
  const d = doc.d;

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════════

  // Header band
  d.setFillColor(...C.accent);
  d.rect(0, 0, PW, 42, 'F');
  d.setTextColor(...C.white);
  d.setFontSize(26);
  d.setFont('helvetica', 'bold');
  d.text('NEXUS', M, 22);
  d.setFontSize(9);
  d.setFont('helvetica', 'normal');
  d.text('Interface Paradigm Assessment Report', M, 31);
  d.text(date, PW - M, 31, { align: 'right' });

  doc.y = 50;

  // Project context
  const ctx: string[] = [];
  if (answers.projectName) ctx.push('Project: ' + answers.projectName);
  if (answers.userDemographics) ctx.push('Users: ' + answers.userDemographics);
  if (ctx.length) { doc.caption(ctx.join('   |   ')); doc.gap(3); }

  // ── Strategy card ─────────────────────────────────────────────────────
  doc.card(M, doc.y, CW, 36, C.card);
  doc.y += 5;

  // Badge
  doc.pill('Recommended Interface Strategy', M + 4, doc.y + 1, C.accent, C.white, 76);
  doc.y += 9;

  // Primary name
  d.setTextColor(...C.fg);
  d.setFontSize(20);
  d.setFont('helvetica', 'bold');
  d.text(safeText(PARADIGM_LABELS[recommendation.primary.paradigm]), M + 4, doc.y);
  d.setTextColor(...C.accent);
  d.setFontSize(18);
  d.text(recommendation.primary.pct + '%', PW - M - 4, doc.y, { align: 'right' });
  doc.y += 10;

  // Secondary
  if (recommendation.secondary.pct > 8) {
    d.setTextColor(...C.muted);
    d.setFontSize(8);
    d.setFont('helvetica', 'normal');
    d.text(
      '+ ' + safeText(PARADIGM_LABELS[recommendation.secondary.paradigm]) + '  ' + recommendation.secondary.pct + '%',
      M + 4, doc.y
    );
  }
  doc.y += 14;

  // Confidence
  const diff = recommendation.primary.pct - recommendation.secondary.pct;
  const confLabel = diff >= 30 ? 'Strong' : diff >= 15 ? 'Moderate' : 'Low';
  const confColor: RGB = diff >= 30 ? C.accent : diff >= 15 ? [202, 138, 4] : C.crit;
  d.setFontSize(7.5);
  d.setFont('helvetica', 'normal');
  d.setTextColor(...C.muted);
  d.text('Confidence:', M + 4, doc.y);
  d.setTextColor(...confColor);
  d.setFont('helvetica', 'bold');
  d.text(confLabel, M + 28, doc.y);
  d.setTextColor(...C.muted);
  d.setFont('helvetica', 'normal');
  d.text('  Score separation: ' + diff + 'pts', M + 41, doc.y);
  doc.y += 10;

  // ── Score bars ────────────────────────────────────────────────────────
  doc.h2('All Interface Scores');
  const sorted = Object.entries(recommendation.allScores)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  for (const [key, rawScore] of sorted) {
    const score = rawScore as number;
    const isPrimary = key === recommendation.primary.paradigm;
    doc.need(11);

    d.setTextColor(...(isPrimary ? C.accent : C.fg));
    d.setFontSize(8);
    d.setFont('helvetica', isPrimary ? 'bold' : 'normal');
    d.text(iLabel(key), M, doc.y);
    d.setTextColor(...(isPrimary ? C.accent : C.muted));
    d.text(score + '%', PW - M, doc.y, { align: 'right' });
    doc.y += 3.5;

    d.setFillColor(...C.border);
    d.roundedRect(M, doc.y, CW, 4, 1.2, 1.2, 'F');
    const fw = Math.max((CW * score) / 100, 1.5);
    d.setFillColor(...(isPrimary ? C.accent : [175, 175, 175] as RGB));
    d.roundedRect(M, doc.y, fw, 4, 1.2, 1.2, 'F');
    doc.y += 7.5;
  }

  doc.gap(3);
  doc.rule();

  // ── Strategic Rationale ────────────────────────────────────────────────
  doc.h2('Strategic Rationale');
  doc.body(generateStrategicRationale(recommendation, answers));
  doc.gap(5);

  // ── Reasoning bullets 2-col ────────────────────────────────────────────
  const bullets = getReasoningBullets(answers, recommendation).slice(0, 4);
  if (bullets.length > 0) {
    doc.h3('Key Reasoning');
    const bW = (CW - 5) / 2;

    for (let i = 0; i < bullets.length; i++) {
      const bx = i % 2 === 0 ? M : M + bW + 5;
      const txt = (i + 1) + '.  ' + clean(bullets[i]);
      const lines = d.splitTextToSize(safeText(txt), bW - 7);
      const cardH = lines.length * 4.2 + 8;
      if (i % 2 === 0) doc.need(cardH + 3);
      doc.card(bx, doc.y, bW, cardH, C.card);
      d.setTextColor(...C.fg);
      d.setFontSize(7.5);
      d.setFont('helvetica', 'normal');
      d.text(lines, bx + 3.5, doc.y + 5.5);
      if (i % 2 === 1 || i === bullets.length - 1) doc.y += cardH + 3;
    }
  }

  doc.footer();

  // ════════════════════════════════════════════════════════
  // ANALYSIS — Arguments For & Against
  // ════════════════════════════════════════════════════════
  d.addPage(); doc.pageNum++; doc.y = M; doc.pageStrip();
  doc.sectionBand('Analysis - Arguments For & Against');
  doc.caption('Research-backed reasoning for each interface type in your recommendation');
  doc.gap(4);

  const allArgs = generateAllArguments(answers, recommendation);

  for (const pArg of allArgs) {
    doc.need(28);

    // Interface type bar
    d.setFillColor(...C.darkG);
    d.roundedRect(M, doc.y, CW, 8.5, 1.5, 1.5, 'F');
    d.setTextColor(...C.white);
    d.setFontSize(9);
    d.setFont('helvetica', 'bold');
    d.text(iLabel(pArg.paradigmKey ?? pArg.paradigm), M + 4, doc.y + 6);
    d.setFontSize(8);
    d.setFont('helvetica', 'normal');
    d.text(Math.round(pArg.percentage) + '%', PW - M - 4, doc.y + 6, { align: 'right' });
    doc.y += 12;

    // Column header bars
    d.setFillColor(...C.forBg);
    d.roundedRect(M, doc.y, HALF, 7.5, 1, 1, 'F');
    d.setFillColor(...C.againstBg);
    d.roundedRect(RX, doc.y, HALF, 7.5, 1, 1, 'F');
    d.setTextColor(...C.accent);
    d.setFontSize(7.5);
    d.setFont('helvetica', 'bold');
    d.text('FOR', M + 3, doc.y + 5);
    d.setTextColor(...C.high);
    d.text('AGAINST', RX + 3, doc.y + 5);
    doc.y += 11;

    // Argument pairs
    const maxA = Math.max(pArg.argumentsFor.length, pArg.argumentsAgainst.length);
    for (let i = 0; i < maxA; i++) {
      const fa = pArg.argumentsFor[i];
      const aa = pArg.argumentsAgainst[i];

      const fTitleL = fa ? d.splitTextToSize(safeText(clean(fa.title)), HALF - 22) : [];
      const fDescL  = fa ? d.splitTextToSize(safeText(clean(fa.description)), HALF - 7) : [];
      const aTitleL = aa ? d.splitTextToSize(safeText(clean(aa.title)), HALF - 22) : [];
      const aDescL  = aa ? d.splitTextToSize(safeText(clean(aa.description)), HALF - 7) : [];

      const fH = fa ? fTitleL.length * 4 + fDescL.length * 3.8 + 10 : 0;
      const aH = aa ? aTitleL.length * 4 + aDescL.length * 3.8 + 10 : 0;
      const cardH = Math.max(fH, aH, 18);

      doc.need(cardH + 3);

      if (fa) {
        doc.card(M, doc.y, HALF, cardH, C.forBg);
        // Impact pill
        const iC: RGB = fa.impact === 'high' ? C.accent : fa.impact === 'medium' ? [202, 138, 4] : C.muted;
        doc.pill(fa.impact, M + HALF - 20, doc.y + 4, iC, C.white, 18);
        // Title
        d.setTextColor(...C.accent);
        d.setFontSize(7.5);
        d.setFont('helvetica', 'bold');
        d.text(fTitleL, M + 3, doc.y + 5.5);
        // Description
        d.setTextColor(...C.fg);
        d.setFontSize(7);
        d.setFont('helvetica', 'normal');
        d.text(fDescL, M + 3, doc.y + 5.5 + fTitleL.length * 4 + 1);
      }

      if (aa) {
        doc.card(RX, doc.y, HALF, cardH, C.againstBg);
        const iC: RGB = aa.impact === 'high' ? C.crit : aa.impact === 'medium' ? C.high : C.med;
        doc.pill(aa.impact, RX + HALF - 20, doc.y + 4, iC, C.white, 18);
        d.setTextColor(...C.high);
        d.setFontSize(7.5);
        d.setFont('helvetica', 'bold');
        d.text(aTitleL, RX + 3, doc.y + 5.5);
        d.setTextColor(...C.fg);
        d.setFontSize(7);
        d.setFont('helvetica', 'normal');
        d.text(aDescL, RX + 3, doc.y + 5.5 + aTitleL.length * 4 + 1);
      }

      doc.y += cardH + 3;
    }
    doc.gap(6);
  }

  doc.footer();

  // ════════════════════════════════════════════════════════
  // REGULATORY (conditional: EU or Global)
  // ════════════════════════════════════════════════════════
  const reg = generateRegulatoryAnalysis(answers, recommendation);
  if (reg && reg.applicable && reg.requirements.length > 0) {
    d.addPage(); doc.pageNum++; doc.y = M; doc.pageStrip();
    doc.sectionBand('Regulatory Impact - ' + reg.region);

    // Overall risk badge
    const rC: RGB = reg.overallRiskLevel === 'critical' ? C.crit :
                    reg.overallRiskLevel === 'high'     ? C.high :
                    reg.overallRiskLevel === 'medium'   ? C.med  : C.accent;
    doc.pill(reg.overallRiskLevel + ' overall risk', PW - M - 38, doc.y - 11, rC, C.white, 36);
    doc.gap(2);

    for (const req of reg.requirements) {
      // Estimate card height
      const descL = d.splitTextToSize(safeText(clean(req.description)), HALF - 7);
      const appL  = d.splitTextToSize(
        req.applicableParadigms.map(p => iLabel(p)).join(', '),
        HALF - 7
      );
      const mitH = req.mitigationSteps.slice(0, 4).reduce(
        (sum, s) => sum + d.splitTextToSize(safeText(clean(s)), HALF - 7).length * 4 + 2, 0
      );
      const leftH  = descL.length * 4.2 + 18;
      const rightH = appL.length * 4.2 + mitH + 18;
      const cardH  = Math.max(leftH, rightH) + 6;

      doc.need(cardH + 16);

      // Requirement title row
      d.setFillColor(242, 248, 242);
      d.roundedRect(M, doc.y, CW, 8.5, 1.5, 1.5, 'F');
      d.setDrawColor(...C.border); d.setLineWidth(0.25);
      d.roundedRect(M, doc.y, CW, 8.5, 1.5, 1.5, 'S');

      // Impact level pill
      const reqC: RGB = req.impactLevel === 'critical' ? C.crit :
                        req.impactLevel === 'high'     ? C.high :
                        req.impactLevel === 'medium'   ? C.med  : C.accent;
      doc.pill(req.impactLevel, M + 3, doc.y + 5, reqC, C.white, 18);

      d.setTextColor(...C.fg);
      d.setFontSize(8.5);
      d.setFont('helvetica', 'bold');
      d.text(safeText(req.title), M + 25, doc.y + 6);
      d.setTextColor(...C.muted);
      d.setFontSize(7);
      d.setFont('helvetica', 'normal');
      d.text(safeText(req.regulation), PW - M - 3, doc.y + 6, { align: 'right' });
      doc.y += 12;

      // Two-column body
      doc.card(M, doc.y, HALF, cardH, C.card);
      doc.card(RX, doc.y, HALF, cardH, C.card);

      const startY = doc.y;

      // LEFT: description + citation
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('DESCRIPTION', M + 3, startY + 5);
      d.setTextColor(...C.fg); d.setFontSize(7.5); d.setFont('helvetica', 'normal');
      d.text(descL, M + 3, startY + 9.5);
      const citStartY = startY + 9.5 + descL.length * 4.2 + 4;
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('LEGAL SOURCE', M + 3, citStartY);
      d.setTextColor(...C.accent); d.setFontSize(7); d.setFont('helvetica', 'normal');
      const citL = d.splitTextToSize(
        safeText(req.citation.title + ' (' + req.citation.year + ')'), HALF - 7
      );
      d.text(citL, M + 3, citStartY + 4);

      // RIGHT: applies to + actions
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('APPLIES TO', RX + 3, startY + 5);
      d.setTextColor(...C.fg); d.setFontSize(7.5); d.setFont('helvetica', 'normal');
      d.text(appL, RX + 3, startY + 9.5);
      let ry = startY + 9.5 + appL.length * 4.2 + 4;
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('REQUIRED ACTIONS', RX + 3, ry);
      ry += 4;
      for (const step of req.mitigationSteps.slice(0, 4)) {
        const isReq = step.startsWith('REQUIRED');
        const sl = d.splitTextToSize('- ' + safeText(clean(step.replace(/^REQUIRED: /, ''))), HALF - 7);
        d.setTextColor(...(isReq ? C.crit : C.fg));
        d.setFontSize(7);
        d.setFont('helvetica', isReq ? 'bold' : 'normal');
        d.text(sl, RX + 3, ry);
        ry += sl.length * 4 + 1.5;
      }

      doc.y += cardH + 5;
    }

    doc.rule();
    doc.caption(safeText(reg.disclaimer));
    doc.footer();
  }

  // ════════════════════════════════════════════════════════
  // SUSTAINABILITY
  // ════════════════════════════════════════════════════════
  const sust = generateSustainabilityReport(recommendation, answers.valuesRanking ?? [], answers.geography);
  if (sust.applicable) {
    d.addPage(); doc.pageNum++; doc.y = M; doc.pageStrip();
    doc.sectionBand('Sustainability Report');
    doc.caption('Environmental impact based on your interface mix. Benchmarks from LBNL, IEA & Global E-waste Monitor.');
    doc.gap(5);

    // Three metric tiles
    const tW = (CW - 8) / 3;
    const metrics = [
      { label: 'Annual Energy',   val: sust.weightedAnnualEnergy.toFixed(0) + ' kWh', sub: 'per user / year' },
      { label: 'CO2 Emissions',   val: sust.weightedAnnualCO2.toFixed(1) + ' kg',     sub: 'per year' },
      { label: 'Device Lifecycle',val: sust.weightedLifecycle.toFixed(1) + ' yrs',    sub: 'weighted average' },
    ];
    for (let i = 0; i < 3; i++) {
      const tx = M + i * (tW + 4);
      doc.card(tx, doc.y, tW, 26, C.card);
      d.setTextColor(...C.muted); d.setFontSize(7); d.setFont('helvetica', 'normal');
      d.text(metrics[i].label, tx + 3, doc.y + 6);
      d.setTextColor(...C.accent); d.setFontSize(15); d.setFont('helvetica', 'bold');
      d.text(metrics[i].val, tx + 3, doc.y + 17);
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'normal');
      d.text(metrics[i].sub, tx + 3, doc.y + 23);
    }
    doc.y += 31;

    // Comparison cards
    doc.h3('Compared to Pure Interface Baselines');
    doc.card(M, doc.y, HALF, 20, C.card);
    doc.card(RX, doc.y, HALF, 20, C.card);
    d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
    d.text('VS PURE SCREEN (100% Traditional)', M + 3, doc.y + 5);
    d.text('VS PURE SPATIAL (100% VR)', RX + 3, doc.y + 5);
    d.setTextColor(...C.fg); d.setFontSize(7.5); d.setFont('helvetica', 'normal');
    d.text('Energy: ' + safeText(sust.comparisonVsPureScreen.energySavings), M + 3, doc.y + 11);
    d.text('CO2:    ' + safeText(sust.comparisonVsPureScreen.co2Savings),    M + 3, doc.y + 16);
    d.text('Energy: ' + safeText(sust.comparisonVsPureVR.energySavings), RX + 3, doc.y + 11);
    d.text('CO2:    ' + safeText(sust.comparisonVsPureVR.co2Savings),    RX + 3, doc.y + 16);
    doc.y += 26;

    // Green flags
    if (sust.greenFlags.length > 0) {
      doc.rule();
      doc.h3('What You Are Doing Right', M, C.accent);
      for (const f of sust.greenFlags) {
        doc.need(7);
        d.setTextColor(...C.accent); d.setFontSize(8); d.setFont('helvetica', 'normal');
        d.text('+', M + 1, doc.y);
        doc.body(safeText(clean(f)), M + 7, CW - 8, 4.2);
        doc.y -= 1;
      }
      doc.gap(4);
    }

    // Breakdown table
    doc.rule();
    doc.h3('Environmental Impact by Interface Type');
    doc.need(10);

    // Header row
    d.setFillColor(...C.accent);
    d.rect(M, doc.y, CW, 8, 'F');
    d.setTextColor(...C.white); d.setFontSize(7); d.setFont('helvetica', 'bold');
    const cols = [M + 2, M + 66, M + 88, M + 112, M + 144];
    ['Interface Type', 'Share', 'Energy (kWh)', 'CO2 (kg)', 'Lifecycle'].forEach((h, i) => {
      d.text(h, cols[i], doc.y + 5.5);
    });
    doc.y += 10;

    for (let ri = 0; ri < sust.paradigmBreakdown.length; ri++) {
      const p = sust.paradigmBreakdown[ri];
      doc.need(8);
      if (ri % 2 === 0) { d.setFillColor(...C.card); d.rect(M, doc.y - 1, CW, 7.5, 'F'); }
      d.setTextColor(...C.fg); d.setFontSize(7.5); d.setFont('helvetica', 'normal');
      d.text(iLabel(p.paradigm), cols[0], doc.y + 4.5);
      d.text(Math.round(p.percentage) + '%', cols[1], doc.y + 4.5);
      d.text(String(p.annualEnergyKwh), cols[2], doc.y + 4.5);
      d.text(String(p.annualCO2Kg), cols[3], doc.y + 4.5);
      d.text(p.hardwareLifecycle + ' yrs', cols[4], doc.y + 4.5);
      doc.y += 7.5;
    }

    doc.gap(5);
    doc.caption(safeText(sust.disclaimer));
    doc.footer();
  }

  // ════════════════════════════════════════════════════════
  // RED FLAGS (conditional)
  // ════════════════════════════════════════════════════════
  const flags = detectRedFlags(answers, recommendation);
  if (flags.hasFlags) {
    d.addPage(); doc.pageNum++; doc.y = M; doc.pageStrip();
    doc.sectionBand('Red Flags & Critical Considerations');

    const sumMsg = flags.criticalCount > 0
      ? flags.criticalCount + ' critical issue(s) require immediate attention before implementation'
      : flags.totalFlags + ' issue(s) detected that should be addressed';
    doc.caption(sumMsg, M, CW, C.crit);
    doc.gap(5);

    for (const flag of flags.flags) {
      const sevColor: RGB = flag.severity === 'critical' ? C.crit :
                            flag.severity === 'high'     ? C.high : C.med;
      const sevBg: RGB    = flag.severity === 'critical' ? C.redBg :
                            flag.severity === 'high'     ? C.againstBg : [255, 253, 235] as RGB;

      // Estimate heights
      const issL = d.splitTextToSize(safeText(clean(flag.description)), HALF - 8);
      const impL = d.splitTextToSize(safeText(clean(flag.impact)), HALF - 8);
      const affText = flag.affectedParadigms.map(p => iLabel(p)).join(', ');
      const affL = d.splitTextToSize(safeText(affText), HALF - 8);
      const mitH = flag.mitigation.reduce(
        (sum, m) => sum + d.splitTextToSize(safeText(clean(m.replace(/^REQUIRED: /, ''))), HALF - 8).length * 4 + 2, 0
      );
      const leftH  = (issL.length + impL.length) * 4.2 + 26;
      const rightH = affL.length * 4.2 + mitH + 26;
      const cardH  = Math.max(leftH, rightH) + 4;

      doc.need(cardH + 10);

      // Card bg + left accent line
      d.setFillColor(...sevBg);
      d.roundedRect(M, doc.y, CW, cardH, 2, 2, 'F');
      d.setFillColor(...sevColor);
      d.roundedRect(M, doc.y, 3, cardH, 1, 1, 'F');

      // Severity + category badges
      doc.pill(flag.severity, M + 6, doc.y + 6, sevColor, C.white, 20);
      d.setFillColor(230, 230, 230);
      d.roundedRect(M + 28, doc.y + 2.5, 36, 5.5, 1.5, 1.5, 'F');
      d.setTextColor(...C.muted); d.setFontSize(5.5); d.setFont('helvetica', 'bold');
      d.text(safeText(flag.category).toUpperCase(), M + 29, doc.y + 6.5);

      // Title
      d.setTextColor(...sevColor); d.setFontSize(9); d.setFont('helvetica', 'bold');
      const titleL = d.splitTextToSize(safeText(clean(flag.title)), CW - 80);
      d.text(titleL, M + 68, doc.y + 6.5);

      const cy = doc.y + 14;

      // LEFT: Issue + Impact
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('ISSUE', M + 6, cy);
      d.setTextColor(...C.fg); d.setFontSize(7.5); d.setFont('helvetica', 'normal');
      d.text(issL, M + 6, cy + 4);

      const impY = cy + issL.length * 4.2 + 7;
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('IMPACT IF IGNORED', M + 6, impY);
      d.setTextColor(...C.fg); d.setFontSize(7.5); d.setFont('helvetica', 'normal');
      d.text(impL, M + 6, impY + 4);

      // Citation if exists
      if (flag.citation) {
        const evY = impY + impL.length * 4.2 + 7;
        d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
        d.text('RESEARCH EVIDENCE', M + 6, evY);
        d.setTextColor(...C.accent); d.setFontSize(7); d.setFont('helvetica', 'normal');
        const evL = d.splitTextToSize(
          safeText(flag.citation.title + ' (' + flag.citation.year + ')'), HALF - 10
        );
        d.text(evL, M + 6, evY + 4);
      }

      // RIGHT: Affects + Mitigations
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('AFFECTS', RX + 3, cy);
      d.setTextColor(...C.fg); d.setFontSize(7.5); d.setFont('helvetica', 'normal');
      d.text(affL, RX + 3, cy + 4);

      let my = cy + affL.length * 4.2 + 7;
      d.setTextColor(...C.muted); d.setFontSize(6.5); d.setFont('helvetica', 'bold');
      d.text('REQUIRED MITIGATIONS', RX + 3, my);
      my += 4;
      for (const step of flag.mitigation) {
        const isReq = step.startsWith('REQUIRED');
        const sl = d.splitTextToSize(
          '- ' + safeText(clean(step.replace(/^REQUIRED: /, ''))), HALF - 8
        );
        d.setTextColor(...(isReq ? sevColor : C.fg));
        d.setFontSize(7);
        d.setFont('helvetica', isReq ? 'bold' : 'normal');
        d.text(sl, RX + 3, my);
        my += sl.length * 4 + 1.5;
      }

      doc.y += cardH + 6;
    }

    doc.footer();
  }


  // ════════════════════════════════════════════════════════
  // RESEARCH (from localStorage cache — only if user visited the tab)
  // ════════════════════════════════════════════════════════

  // Read research data from localStorage cache (populated when user visits Research tab)
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
  const primaryParadigm = recommendation.primary.paradigm;
  const demo = (answers.userDemographics?.trim() || 'general').toLowerCase().replace(/\s+/g, '_');
  const rKey = ('nexus_research_' + primaryParadigm + '_' + demo).toLowerCase().replace(/\s+/g, '_');
  const cKey = ('nexus_case_studies_' + primaryParadigm + '_' + demo).toLowerCase().replace(/\s+/g, '_');

  function readResearchCache(key: string): unknown | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { timestamp: number };
      if (Date.now() - parsed.timestamp > CACHE_TTL) { localStorage.removeItem(key); return null; }
      return parsed;
    } catch { return null; }
  }

  const rawPapers = readResearchCache(rKey) as { papers: ResearchPaper[] } | null;
  const rawCases  = readResearchCache(cKey) as { cases: CaseStudy[] } | null;
  const papers    = rawPapers?.papers ?? [];
  const cases     = rawCases?.cases   ?? [];

  if (papers.length > 0 || cases.length > 0) {
    d.addPage(); doc.pageNum++; doc.y = M; doc.pageStrip();
    doc.sectionBand('Research & Case Studies');

    // ── Academic Papers ───────────────────────────────────────────────────
    if (papers.length > 0) {
      doc.h2('Supporting Academic Research');
      doc.caption(
        'Papers curated for ' + iLabel(recommendation.primary.paradigm) +
        (answers.userDemographics ? ' · ' + answers.userDemographics : '')
      );
      doc.gap(4);

      for (const paper of papers.slice(0, 6)) {
        // Estimate card height
        const titleL   = d.splitTextToSize(safeText(paper.title), CW - 8);
        const abstractL= d.splitTextToSize(safeText(paper.abstract), CW - 8);
        const relL     = d.splitTextToSize(safeText(paper.relevance), CW - 8);
        const cardH    = titleL.length * 4.5 + abstractL.length * 4 + relL.length * 3.8 + 18;

        doc.need(cardH + 4);
        doc.card(M, doc.y, CW, cardH, C.card);

        // Title
        d.setTextColor(...C.fg);
        d.setFontSize(8.5);
        d.setFont('helvetica', 'bold');
        d.text(titleL, M + 4, doc.y + 6);

        // Authors · Year · Venue
        const meta = safeText(paper.authors) + '  ·  ' + paper.year + '  ·  ' + safeText(paper.venue);
        d.setTextColor(...C.muted);
        d.setFontSize(6.5);
        d.setFont('helvetica', 'normal');
        d.text(safeText(meta), M + 4, doc.y + 6 + titleL.length * 4.5 + 1);

        // Abstract
        d.setTextColor(...C.fg);
        d.setFontSize(7.5);
        d.text(abstractL, M + 4, doc.y + 6 + titleL.length * 4.5 + 5.5);

        // Relevance tag
        const relY = doc.y + 6 + titleL.length * 4.5 + 5.5 + abstractL.length * 4 + 3;
        d.setFillColor(...C.forBg);
        d.roundedRect(M + 4, relY - 3, CW - 8, relL.length * 3.8 + 5, 1.5, 1.5, 'F');
        d.setTextColor(...C.accent);
        d.setFontSize(6.5);
        d.setFont('helvetica', 'bold');
        d.text('WHY RELEVANT', M + 6, relY);
        d.setTextColor(...C.fg);
        d.setFontSize(7);
        d.setFont('helvetica', 'normal');
        d.text(relL, M + 6, relY + 4);

        doc.y += cardH + 4;
      }

      doc.gap(4);
    }

    // ── Case Studies ──────────────────────────────────────────────────────
    if (cases.length > 0) {
      doc.need(16);
      doc.rule();
      doc.h2('Real-World Case Studies');
      doc.gap(3);

      // Separate successes and failures
      const successes = cases.filter(c => c.outcome === 'success');
      const failures  = cases.filter(c => c.outcome === 'failure');

      for (const [group, groupLabel, bg, headerColor] of [
        [successes, 'Successes', C.forBg,    C.accent],
        [failures,  'Failures',  C.againstBg, C.high],
      ] as Array<[CaseStudy[], string, RGB, RGB]>) {
        if (group.length === 0) continue;

        doc.need(10);
        doc.h3(groupLabel, M, headerColor);

        for (const cs of group) {
          const descL    = d.splitTextToSize(safeText(cs.description), HALF - 8);
          const lessonL  = d.splitTextToSize(safeText(cs.lessonsLearned), HALF - 8);
          const factorsH = cs.keyFactors.slice(0, 4).reduce(
            (sum, f) => sum + d.splitTextToSize(safeText(f), HALF - 8).length * 3.8 + 1.5, 0
          );
          const leftH  = descL.length * 4.2 + lessonL.length * 4 + 22;
          const rightH = factorsH + 18;
          const cardH  = Math.max(leftH, rightH) + 4;

          doc.need(cardH + 6);
          doc.card(M, doc.y, CW, cardH, bg);

          // Outcome pill + company + year
          const outC: RGB = cs.outcome === 'success' ? C.accent : C.crit;
          doc.pill(cs.outcome, M + 4, doc.y + 6, outC, C.white, 20);
          d.setTextColor(...C.fg);
          d.setFontSize(8.5);
          d.setFont('helvetica', 'bold');
          d.text(safeText(cs.name), M + 28, doc.y + 6.5);
          d.setTextColor(...C.muted);
          d.setFontSize(7);
          d.setFont('helvetica', 'normal');
          d.text(safeText(cs.company) + '  ' + cs.year, PW - M - 4, doc.y + 6.5, { align: 'right' });

          const cy2 = doc.y + 13;

          // LEFT: description + lesson learned
          d.setTextColor(...C.muted);
          d.setFontSize(6.5);
          d.setFont('helvetica', 'bold');
          d.text('DESCRIPTION', M + 4, cy2);
          d.setTextColor(...C.fg);
          d.setFontSize(7.5);
          d.setFont('helvetica', 'normal');
          d.text(descL, M + 4, cy2 + 4);

          const lessY = cy2 + descL.length * 4.2 + 7;
          d.setTextColor(...C.muted);
          d.setFontSize(6.5);
          d.setFont('helvetica', 'bold');
          d.text('LESSON LEARNED', M + 4, lessY);
          d.setTextColor(...C.fg);
          d.setFontSize(7.5);
          d.setFont('helvetica', 'normal');
          d.text(lessonL, M + 4, lessY + 4);

          // RIGHT: key factors
          d.setTextColor(...C.muted);
          d.setFontSize(6.5);
          d.setFont('helvetica', 'bold');
          d.text('KEY FACTORS', RX + 3, cy2);
          let fy2 = cy2 + 4;
          for (const factor of cs.keyFactors.slice(0, 4)) {
            const fl = d.splitTextToSize('- ' + safeText(factor), HALF - 8);
            d.setTextColor(...C.fg);
            d.setFontSize(7);
            d.setFont('helvetica', 'normal');
            d.text(fl, RX + 3, fy2);
            fy2 += fl.length * 3.8 + 1.5;
          }

          doc.y += cardH + 5;
        }
        doc.gap(3);
      }
    }

    // Note if cache was empty
    doc.footer();
  } else {
    // Research tab not visited — add a note on the last page
    // (no new page needed, just a footer note handled naturally)
  }

  // ── Save ──────────────────────────────────────────────────────────────
  const fname = answers.projectName
    ? 'NEXUS-Report-' + answers.projectName.replace(/[^a-zA-Z0-9]/g, '-') + '.pdf'
    : 'NEXUS-Report-' + new Date().toISOString().split('T')[0] + '.pdf';

  d.save(fname);
}
