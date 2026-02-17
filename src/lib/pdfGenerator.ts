/**
 * PDF Report Generator for NEXUS Assessment Results
 * Full multi-page report covering all tabs.
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
import { detectRedFlags } from '@/lib/redFlagsDetector';

interface PDFGeneratorParams {
  answers: AssessmentAnswers;
  recommendation: RecommendationResult;
  createdAt?: string;
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const ACCENT: [number, number, number]   = [22, 163, 74];
const FG: [number, number, number]       = [26, 26, 26];
const MUTED: [number, number, number]    = [100, 100, 100];
const CARD: [number, number, number]     = [248, 250, 248];
const BORDER: [number, number, number]   = [229, 231, 235];
const FOR_BG: [number, number, number]   = [240, 253, 244];
const AGAINST_BG: [number, number, number] = [255, 247, 237];
const FLAG_BG: [number, number, number]  = [254, 242, 242];

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INTERFACE_LABELS: Record<string, string> = {
  traditional_screen: 'Traditional Screen',
  invisible: 'Invisible / Ambient',
  ai_vectorial: 'AI Conversational',
  spatial: 'Spatial Computing',
  voice: 'Voice-First',
};

// ─── Helper class ─────────────────────────────────────────────────────────────
class PDFBuilder {
  doc: jsPDF;
  y: number;
  page: number;

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.y = MARGIN;
    this.page = 1;
  }

  needSpace(h: number): void {
    if (this.y + h > PAGE_H - MARGIN - 8) {
      this.addFooter();
      this.doc.addPage();
      this.page++;
      this.y = MARGIN;
      this.addPageHeader();
    }
  }

  h1(text: string, color: [number, number, number] = FG): void {
    this.doc.setTextColor(...color);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, MARGIN, this.y);
    this.y += 8;
  }

  h2(text: string, color: [number, number, number] = ACCENT): void {
    this.doc.setTextColor(...color);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, MARGIN, this.y);
    this.y += 6;
  }

  h3(text: string, x: number = MARGIN): void {
    this.doc.setTextColor(...FG);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, x, this.y);
    this.y += 5;
  }

  body(text: string, x: number = MARGIN, maxW: number = CONTENT_W, lineH: number = 4.5): number {
    this.doc.setTextColor(...FG);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(text.replace(/\*\*/g, ''), maxW);
    this.doc.text(lines, x, this.y);
    const used = lines.length * lineH;
    this.y += used;
    return used;
  }

  muted(text: string, x: number = MARGIN, maxW: number = CONTENT_W, size: number = 7): void {
    this.doc.setTextColor(...MUTED);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(text, maxW);
    this.doc.text(lines, x, this.y);
    this.y += lines.length * 4;
  }

  gap(h: number = 4): void {
    this.y += h;
  }

  divider(): void {
    this.doc.setDrawColor(...BORDER);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 4;
  }

  cardStart(h: number, bg: [number, number, number] = CARD, x: number = MARGIN, w: number = CONTENT_W): void {
    this.doc.setFillColor(...bg);
    this.doc.roundedRect(x, this.y - 3, w, h, 2, 2, 'F');
  }

  badge(text: string, x: number, y: number, color: [number, number, number] = ACCENT): void {
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...color);
    this.doc.text(text.toUpperCase(), x, y);
  }

  addPageHeader(): void {
    this.doc.setFillColor(...ACCENT);
    this.doc.rect(0, 0, PAGE_W, 8, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('NEXUS Assessment Report', MARGIN, 5.5);
    this.y = 14;
  }

  addFooter(): void {
    const fy = PAGE_H - 7;
    this.doc.setTextColor(...MUTED);
    this.doc.setFontSize(6.5);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('NEXUS — Interface Paradigm Assessment', MARGIN, fy);
    this.doc.text(`Page ${this.page}`, PAGE_W - MARGIN, fy, { align: 'right' });
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function generatePDFReport({ answers, recommendation, createdAt }: PDFGeneratorParams): void {
  const b = new PDFBuilder();
  const doc = b.doc;

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — HERO
  // ═══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXUS', MARGIN, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Interface Paradigm Assessment Report', MARGIN, 27);
  doc.text(dateStr, PAGE_W - MARGIN, 27, { align: 'right' });

  b.y = 50;

  // Project context
  if (answers.projectName || answers.userDemographics) {
    const ctx: string[] = [];
    if (answers.projectName) ctx.push(`Project: ${answers.projectName}`);
    if (answers.userDemographics) ctx.push(`Users: ${answers.userDemographics}`);
    b.muted(ctx.join('   ·   '), MARGIN, CONTENT_W, 8);
    b.gap(2);
  }

  // Recommended strategy card
  const heroCardH = 34;
  b.cardStart(heroCardH, CARD);
  b.y += 5;

  b.badge('Recommended Interface Strategy', MARGIN + 5, b.y);
  b.y += 6;

  doc.setTextColor(...FG);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(PARADIGM_LABELS[recommendation.primary.paradigm], MARGIN + 5, b.y);
  doc.setTextColor(...ACCENT);
  doc.setFontSize(16);
  doc.text(`${recommendation.primary.pct}%`, PAGE_W - MARGIN - 5, b.y, { align: 'right' });
  b.y += 8;

  if (recommendation.secondary.pct > 10) {
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Secondary: ${PARADIGM_LABELS[recommendation.secondary.paradigm]} (${recommendation.secondary.pct}%)`,
      MARGIN + 5, b.y
    );
  }
  b.y += 16;

  // Confidence
  const confidence = Math.round(
    ((recommendation.primary.pct - recommendation.secondary.pct) / recommendation.primary.pct) * 100
  );
  doc.setTextColor(...MUTED);
  doc.setFontSize(7.5);
  doc.text(
    `Confidence: ${confidence >= 70 ? 'Strong' : confidence >= 40 ? 'Moderate' : 'Low'}  ·  Score differentiation: ${recommendation.primary.pct - recommendation.secondary.pct}pts`,
    MARGIN, b.y
  );
  b.y += 8;

  // Score breakdown bars
  b.h2('All Interface Scores');
  const paradigms = Object.entries(recommendation.allScores)
    .sort(([, a], [, b]) => (b as number) - (a as number)) as Array<[string, number]>;

  for (const [key, score] of paradigms) {
    b.needSpace(12);
    const label = INTERFACE_LABELS[key] ?? PARADIGM_LABELS[key as keyof typeof PARADIGM_LABELS] ?? key;
    doc.setTextColor(...FG);
    doc.setFontSize(8);
    doc.setFont('helvetica', key === recommendation.primary.paradigm ? 'bold' : 'normal');
    doc.text(label, MARGIN, b.y);
    doc.setTextColor(key === recommendation.primary.paradigm ? ACCENT[0] : MUTED[0],
                     key === recommendation.primary.paradigm ? ACCENT[1] : MUTED[1],
                     key === recommendation.primary.paradigm ? ACCENT[2] : MUTED[2]);
    doc.text(`${score}%`, PAGE_W - MARGIN, b.y, { align: 'right' });
    b.y += 3;

    const barW = CONTENT_W;
    const barH = 3.5;
    doc.setFillColor(...BORDER);
    doc.roundedRect(MARGIN, b.y, barW, barH, 1, 1, 'F');
    const fill = Math.max((barW * (score as number)) / 100, 1);
    doc.setFillColor(...(key === recommendation.primary.paradigm ? ACCENT : [180, 180, 180] as [number, number, number]));
    doc.roundedRect(MARGIN, b.y, fill, barH, 1, 1, 'F');
    b.y += 7;
  }

  b.gap(4);
  b.divider();

  // Strategic Rationale
  b.h2('Strategic Rationale');
  const rationale = generateStrategicRationale(recommendation, answers);
  b.body(rationale);
  b.gap(4);

  // Reasoning bullets in two columns
  const bullets = getReasoningBullets(answers, recommendation).slice(0, 4);
  if (bullets.length > 0) {
    b.h3('Key Reasoning');
    const colW = (CONTENT_W - 6) / 2;
    const col2X = MARGIN + colW + 6;

    for (let i = 0; i < bullets.length; i++) {
      const x = i % 2 === 0 ? MARGIN : col2X;
      const mW = colW - 4;
      const txt = `${i + 1}. ${bullets[i].replace(/\*\*/g, '')}`;
      const lines = doc.splitTextToSize(txt, mW);
      const cardH = lines.length * 4.2 + 6;

      if (i % 2 === 0) {
        b.needSpace(cardH + 2);
      }

      doc.setFillColor(...CARD);
      doc.roundedRect(x, b.y - 2, colW, cardH, 1.5, 1.5, 'F');
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, x + 3, b.y + 2);

      if (i % 2 === 1 || i === bullets.length - 1) {
        b.y += cardH + 3;
      }
    }
  }

  b.addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — ANALYSIS (Arguments For / Against)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  b.page++;
  b.y = MARGIN;
  b.addPageHeader();

  b.h2('Detailed Argumentation');
  b.muted('Research-backed reasoning for each interface type in your recommendation');
  b.gap(4);

  const allArgs = generateAllArguments(answers, recommendation);
  const colW2 = (CONTENT_W - 6) / 2;
  const rightX = MARGIN + colW2 + 6;

  for (const pArg of allArgs) {
    b.needSpace(20);

    const typeName = INTERFACE_LABELS[pArg.paradigmKey] ?? pArg.paradigm;
    doc.setFillColor(...ACCENT);
    doc.roundedRect(MARGIN, b.y - 1, CONTENT_W, 8, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${typeName}  —  ${Math.round(pArg.percentage)}%`, MARGIN + 3, b.y + 4.5);
    b.y += 12;

    // FOR / AGAINST headers
    doc.setFillColor(...FOR_BG);
    doc.roundedRect(MARGIN, b.y - 1, colW2, 6, 1, 1, 'F');
    doc.setTextColor(...ACCENT);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('▲ Arguments For', MARGIN + 2, b.y + 3.5);

    doc.setFillColor(...AGAINST_BG);
    doc.roundedRect(rightX, b.y - 1, colW2, 6, 1, 1, 'F');
    doc.setTextColor(180, 83, 9);
    doc.text('▼ Arguments Against', rightX + 2, b.y + 3.5);
    b.y += 10;

    const maxArgs = Math.max(pArg.argumentsFor.length, pArg.argumentsAgainst.length);
    for (let i = 0; i < maxArgs; i++) {
      const forArg = pArg.argumentsFor[i];
      const againstArg = pArg.argumentsAgainst[i];

      const forLines = forArg
        ? doc.splitTextToSize(`${forArg.title}: ${forArg.description.replace(/\*\*/g, '')}`, colW2 - 6).length
        : 0;
      const againstLines = againstArg
        ? doc.splitTextToSize(`${againstArg.title}: ${againstArg.description.replace(/\*\*/g, '')}`, colW2 - 6).length
        : 0;
      const cardH = Math.max(forLines, againstLines) * 4 + 10;

      b.needSpace(cardH + 3);

      if (forArg) {
        doc.setFillColor(...FOR_BG);
        doc.roundedRect(MARGIN, b.y, colW2, cardH, 1.5, 1.5, 'F');
        doc.setTextColor(...ACCENT);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(forArg.title, MARGIN + 3, b.y + 5);
        doc.setTextColor(...FG);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const desc = doc.splitTextToSize(forArg.description.replace(/\*\*/g, ''), colW2 - 6);
        doc.text(desc, MARGIN + 3, b.y + 9.5);

        doc.setTextColor(...MUTED);
        doc.setFontSize(6);
        doc.text(`[${forArg.impact}]`, MARGIN + colW2 - 14, b.y + 5);
      }

      if (againstArg) {
        doc.setFillColor(...AGAINST_BG);
        doc.roundedRect(rightX, b.y, colW2, cardH, 1.5, 1.5, 'F');
        doc.setTextColor(180, 83, 9);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(againstArg.title, rightX + 3, b.y + 5);
        doc.setTextColor(...FG);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const desc = doc.splitTextToSize(againstArg.description.replace(/\*\*/g, ''), colW2 - 6);
        doc.text(desc, rightX + 3, b.y + 9.5);

        doc.setTextColor(...MUTED);
        doc.setFontSize(6);
        doc.text(`[${againstArg.impact}]`, rightX + colW2 - 14, b.y + 5);
      }

      b.y += cardH + 3;
    }

    b.gap(6);
  }

  b.addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — IMPACT: SUSTAINABILITY REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  b.page++;
  b.y = MARGIN;
  b.addPageHeader();

  b.h2('Sustainability Report');
  b.muted('Environmental impact based on your interface mix. Energy benchmarks from LBNL & IEA.');
  b.gap(4);

  const sustReport = generateSustainabilityReport(
    recommendation,
    answers.valuesRanking,
    answers.geography ?? undefined
  );

  // Three key metrics
  const metrics = [
    { label: 'Annual Energy', value: `${sustReport.weightedAnnualEnergy.toFixed(0)} kWh`, sub: 'per user/year' },
    { label: 'CO₂ Emissions', value: `${sustReport.weightedAnnualCO2.toFixed(1)} kg`, sub: '/year' },
    { label: 'Device Lifecycle', value: `${sustReport.weightedLifecycle.toFixed(1)} yrs`, sub: 'avg' },
  ];
  const metricW = CONTENT_W / 3 - 3;
  const startX = MARGIN;

  for (let i = 0; i < metrics.length; i++) {
    const mx = startX + i * (metricW + 3);
    doc.setFillColor(...CARD);
    doc.roundedRect(mx, b.y, metricW, 20, 2, 2, 'F');

    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(metrics[i].label, mx + 3, b.y + 6);

    doc.setTextColor(...ACCENT);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(metrics[i].value, mx + 3, b.y + 14);

    doc.setTextColor(...MUTED);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(metrics[i].sub, mx + 3, b.y + 19);
  }
  b.y += 26;

  // Comparisons
  b.h3('vs Pure Screen Interface');
  doc.setFillColor(...CARD);
  doc.roundedRect(MARGIN, b.y, CONTENT_W / 2 - 3, 14, 1.5, 1.5, 'F');
  doc.setTextColor(...FG);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Energy: ${sustReport.comparisonVsPureScreen.energySavings}  ·  CO₂: ${sustReport.comparisonVsPureScreen.co2Savings}`,
    MARGIN + 3, b.y + 9
  );

  b.h3('vs Pure Spatial (VR)');
  const rx = MARGIN + CONTENT_W / 2 + 3;
  doc.setFillColor(...CARD);
  doc.roundedRect(rx, b.y - 6, CONTENT_W / 2 - 3, 14, 1.5, 1.5, 'F');
  doc.setTextColor(...FG);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Energy: ${sustReport.comparisonVsPureVR.energySavings}  ·  CO₂: ${sustReport.comparisonVsPureVR.co2Savings}`,
    rx + 3, b.y + 3
  );
  b.y += 20;

  // Green flags
  if (sustReport.greenFlags.length > 0) {
    b.divider();
    b.h3('What You\'re Doing Right');
    for (const flag of sustReport.greenFlags) {
      b.needSpace(8);
      doc.setTextColor(...ACCENT);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`✓  ${flag}`, MARGIN + 2, b.y);
      b.y += 5;
    }
    b.gap(4);
  }

  // Interface type breakdown table
  b.divider();
  b.h3('Environmental Impact by Interface Type');

  doc.setFillColor(...ACCENT);
  doc.rect(MARGIN, b.y, CONTENT_W, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Interface Type', MARGIN + 2, b.y + 5);
  doc.text('Share', MARGIN + 70, b.y + 5);
  doc.text('Energy (kWh)', MARGIN + 90, b.y + 5);
  doc.text('CO2 (kg)', MARGIN + 120, b.y + 5);
  doc.text('Lifecycle', MARGIN + 150, b.y + 5);
  b.y += 9;

  for (const [idx, p] of sustReport.paradigmBreakdown.entries()) {
    b.needSpace(8);
    if (idx % 2 === 0) {
      doc.setFillColor(...CARD);
      doc.rect(MARGIN, b.y - 2, CONTENT_W, 7, 'F');
    }
    doc.setTextColor(...FG);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const typeName = INTERFACE_LABELS[p.paradigm] ?? p.paradigm.replace(/_/g, ' ');
    doc.text(typeName, MARGIN + 2, b.y + 3);
    doc.text(`${Math.round(p.percentage)}%`, MARGIN + 70, b.y + 3);
    doc.text(`${p.annualEnergyKwh}`, MARGIN + 90, b.y + 3);
    doc.text(`${p.annualCO2Kg}`, MARGIN + 120, b.y + 3);
    doc.text(`${p.hardwareLifecycle} yrs`, MARGIN + 150, b.y + 3);
    b.y += 7;
  }

  b.addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — IMPACT: RED FLAGS
  // ═══════════════════════════════════════════════════════════════════════════
  const flagsReport = detectRedFlags(answers, recommendation);

  if (flagsReport.hasFlags) {
    doc.addPage();
    b.page++;
    b.y = MARGIN;
    b.addPageHeader();

    b.h2('Red Flags & Critical Considerations');
    b.muted(
      flagsReport.criticalCount > 0
        ? `${flagsReport.criticalCount} critical issue(s) require immediate attention before implementation`
        : `${flagsReport.totalFlags} issue(s) detected that should be addressed`
    );
    b.gap(4);

    for (const flag of flagsReport.flags) {
      const sevColor: [number, number, number] =
        flag.severity === 'critical' ? [185, 28, 28] :
        flag.severity === 'high'     ? [194, 65, 12] :
                                       [161, 98, 7];
      const sevBg: [number, number, number] =
        flag.severity === 'critical' ? FLAG_BG :
        flag.severity === 'high'     ? [255, 247, 237] :
                                       [255, 251, 235];

      b.needSpace(40);

      const descLines = doc.splitTextToSize(flag.description.replace(/\*\*/g, ''), CONTENT_W / 2 - 6).length;
      const impactLines = doc.splitTextToSize(flag.impact.replace(/\*\*/g, ''), CONTENT_W / 2 - 6).length;
      const leftLines = descLines + impactLines + 4;

      const affectedText = flag.affectedParadigms.map(p => INTERFACE_LABELS[p] ?? p.replace(/_/g, ' ')).join(', ');
      const affLines = doc.splitTextToSize(affectedText, CONTENT_W / 2 - 6).length;
      const mitigLines = flag.mitigation.reduce((acc, s) => acc + doc.splitTextToSize(s, CONTENT_W / 2 - 6).length + 1, 0);
      const rightLines = affLines + mitigLines + 4;

      const cardH = Math.max(leftLines, rightLines) * 4.5 + 16;

      doc.setFillColor(...sevBg);
      doc.roundedRect(MARGIN, b.y, CONTENT_W, cardH, 2, 2, 'F');

      // Severity badge
      doc.setFillColor(...sevColor);
      doc.roundedRect(MARGIN + 3, b.y + 3, 22, 5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(flag.severity.toUpperCase(), MARGIN + 4, b.y + 6.5);

      // Category badge
      doc.setFillColor(...CARD);
      doc.roundedRect(MARGIN + 27, b.y + 3, 30, 5, 1, 1, 'F');
      doc.setTextColor(...MUTED);
      doc.text(flag.category.toUpperCase(), MARGIN + 28, b.y + 6.5);

      // Title
      doc.setTextColor(...sevColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(flag.title, MARGIN + 3, b.y + 14);

      const contentY = b.y + 19;
      const halfW = CONTENT_W / 2 - 6;

      // LEFT: Issue + Impact
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('ISSUE', MARGIN + 3, contentY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const issueLines = doc.splitTextToSize(flag.description.replace(/\*\*/g, ''), halfW);
      doc.text(issueLines, MARGIN + 3, contentY + 4);

      const impactY = contentY + issueLines.length * 4 + 6;
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPACT IF IGNORED', MARGIN + 3, impactY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const impLines2 = doc.splitTextToSize(flag.impact.replace(/\*\*/g, ''), halfW);
      doc.text(impLines2, MARGIN + 3, impactY + 4);

      // RIGHT: Affects + Mitigations
      const rightColX = MARGIN + CONTENT_W / 2 + 3;
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('AFFECTS', rightColX, contentY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const affLines2 = doc.splitTextToSize(affectedText, halfW);
      doc.text(affLines2, rightColX, contentY + 4);

      const mitigY = contentY + affLines2.length * 4 + 6;
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('REQUIRED MITIGATIONS', rightColX, mitigY);
      doc.setTextColor(...FG);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      let my = mitigY + 4;
      for (const step of flag.mitigation) {
        const stepLines = doc.splitTextToSize(`• ${step.replace(/^REQUIRED: /, '').replace(/\*\*/g, '')}`, halfW);
        if (step.startsWith('REQUIRED')) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...sevColor);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...FG);
        }
        doc.text(stepLines, rightColX, my);
        my += stepLines.length * 4 + 1.5;
      }

      b.y += cardH + 5;
    }

    b.addFooter();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════════════════════════════════════
  const fileName = answers.projectName
    ? `NEXUS-Report-${answers.projectName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
    : `NEXUS-Report-${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(fileName);
}
