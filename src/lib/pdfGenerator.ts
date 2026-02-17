/**
 * PDF Report Generator for NEXUS Assessment Results
 * Full multi-page report covering all tabs.
 *
 * Pages:
 *   1  — Cover: strategy card, score bars, rationale, bullets 2×2
 *   2+ — Analysis: per interface type FOR / AGAINST side-by-side
 *   ?  — Regulatory (EU / Global only)
 *   ?  — Sustainability (conditional)
 *   ?  — Red Flags (conditional)
 *
 * Every page has a footer with page number.
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
import { generateRegulatoryAnalysis } from '@/lib/regulatoryAnalysis';

interface PDFGeneratorParams {
  answers: AssessmentAnswers;
  recommendation: RecommendationResult;
  createdAt?: string;
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const ACCENT: [number, number, number]     = [22, 163, 74];   // emerald-600
const FG: [number, number, number]         = [26, 26, 26];
const MUTED: [number, number, number]      = [100, 100, 100];
const CARD: [number, number, number]       = [248, 250, 248];
const BORDER: [number, number, number]     = [229, 231, 235];
const FOR_BG: [number, number, number]     = [240, 253, 244]; // green-50
const AGAINST_BG: [number, number, number] = [255, 247, 237]; // amber-50
const FLAG_BG: [number, number, number]    = [254, 242, 242]; // red-50
const REG_BG: [number, number, number]     = [239, 246, 255]; // blue-50

const MARGIN = 14;
const PAGE_W = 210; // A4
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INTERFACE_LABELS: Record<string, string> = {
  traditional_screen: 'Traditional Screen',
  invisible: 'Invisible / Ambient',
  ai_vectorial: 'AI Conversational',
  spatial: 'Spatial Computing',
  voice: 'Voice-First',
};

// ─── Safe text helper ─────────────────────────────────────────────────────────
/** Strip markdown bold, replace non-ASCII that jsPDF can't render */
function safeText(s: string): string {
  return s
    .replace(/\*\*/g, '')
    .replace(/CO₂/g, 'CO2')
    .replace(/\u2019/g, "'")   // curly right quote
    .replace(/\u2018/g, "'")   // curly left quote
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u2013/g, '-')   // en-dash
    .replace(/\u2014/g, '--')  // em-dash
    .replace(/\u2026/g, '...')
    .replace(/\u00B2/g, '2')   // superscript 2
    .replace(/\u00BC/g, '1/4')
    .replace(/\u00BD/g, '1/2')
    .replace(/\u00BE/g, '3/4')
    .replace(/\u2153/g, '1/3')
    .replace(/✅/g, '+')
    .replace(/⚠️/g, '!')
    .replace(/🚨/g, '!!')
    .replace(/[^\x00-\x7F]/g, ''); // remove any remaining non-ASCII
}

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

  // ── Overflow guard ──────────────────────────────────────────────────────────
  needSpace(h: number): void {
    if (this.y + h > PAGE_H - MARGIN - 8) {
      this.addFooter();
      this.doc.addPage();
      this.page++;
      this.y = MARGIN;
      this.addPageHeader();
    }
  }

  // ── Typography helpers ──────────────────────────────────────────────────────
  h2(text: string, color: [number, number, number] = ACCENT): void {
    this.doc.setTextColor(...color);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(safeText(text), MARGIN, this.y);
    this.y += 6;
  }

  h3(text: string, x: number = MARGIN): void {
    this.doc.setTextColor(...FG);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(safeText(text), x, this.y);
    this.y += 5;
  }

  body(text: string, x: number = MARGIN, maxW: number = CONTENT_W, lineH: number = 4.5): number {
    this.doc.setTextColor(...FG);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(safeText(text), maxW);
    this.doc.text(lines, x, this.y);
    const used = lines.length * lineH;
    this.y += used;
    return used;
  }

  muted(text: string, x: number = MARGIN, maxW: number = CONTENT_W, size: number = 7): void {
    this.doc.setTextColor(...MUTED);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(safeText(text), maxW);
    this.doc.text(lines, x, this.y);
    this.y += lines.length * 4;
  }

  gap(h: number = 4): void { this.y += h; }

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
    this.doc.text(safeText(text).toUpperCase(), x, y);
  }

  // ── Page header (continuation pages) ────────────────────────────────────────
  addPageHeader(): void {
    this.doc.setFillColor(...ACCENT);
    this.doc.rect(0, 0, PAGE_W, 8, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('NEXUS Assessment Report', MARGIN, 5.5);
    this.y = 14;
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  addFooter(): void {
    const fy = PAGE_H - 7;
    this.doc.setTextColor(...MUTED);
    this.doc.setFontSize(6.5);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('NEXUS -- Interface Paradigm Assessment', MARGIN, fy);
    this.doc.text(`Page ${this.page}`, PAGE_W - MARGIN, fy, { align: 'right' });
  }

  // ── New page shortcut ───────────────────────────────────────────────────────
  newPage(): void {
    this.addFooter();
    this.doc.addPage();
    this.page++;
    this.y = MARGIN;
    this.addPageHeader();
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
  // PAGE 1 — COVER / HERO
  // ═══════════════════════════════════════════════════════════════════════════

  // Green header bar
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
    b.muted(ctx.join('   |   '), MARGIN, CONTENT_W, 8);
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
  doc.text(safeText(PARADIGM_LABELS[recommendation.primary.paradigm]), MARGIN + 5, b.y);
  doc.setTextColor(...ACCENT);
  doc.setFontSize(16);
  doc.text(`${recommendation.primary.pct}%`, PAGE_W - MARGIN - 5, b.y, { align: 'right' });
  b.y += 8;

  if (recommendation.secondary.pct > 10) {
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      safeText(`Secondary: ${PARADIGM_LABELS[recommendation.secondary.paradigm]} (${recommendation.secondary.pct}%)`),
      MARGIN + 5, b.y
    );
  }
  b.y += 16;

  // Confidence
  const confidence = recommendation.primary.pct > 0
    ? Math.round(((recommendation.primary.pct - recommendation.secondary.pct) / recommendation.primary.pct) * 100)
    : 0;
  doc.setTextColor(...MUTED);
  doc.setFontSize(7.5);
  doc.text(
    `Confidence: ${confidence >= 70 ? 'Strong' : confidence >= 40 ? 'Moderate' : 'Low'}  |  Score gap: ${recommendation.primary.pct - recommendation.secondary.pct}pts`,
    MARGIN, b.y
  );
  b.y += 8;

  // Score breakdown bars
  b.h2('All Interface Scores');
  const paradigms = Object.entries(recommendation.allScores)
    .sort(([, a], [, _b]) => (_b as number) - (a as number)) as Array<[string, number]>;

  for (const [key, score] of paradigms) {
    b.needSpace(12);
    const label = INTERFACE_LABELS[key] ?? PARADIGM_LABELS[key as keyof typeof PARADIGM_LABELS] ?? key;
    const isPrimary = key === recommendation.primary.paradigm;
    doc.setTextColor(...FG);
    doc.setFontSize(8);
    doc.setFont('helvetica', isPrimary ? 'bold' : 'normal');
    doc.text(safeText(label), MARGIN, b.y);
    doc.setTextColor(...(isPrimary ? ACCENT : MUTED));
    doc.text(`${score}%`, PAGE_W - MARGIN, b.y, { align: 'right' });
    b.y += 3;

    const barW = CONTENT_W;
    const barH = 3.5;
    doc.setFillColor(...BORDER);
    doc.roundedRect(MARGIN, b.y, barW, barH, 1, 1, 'F');
    const fill = Math.max((barW * (score as number)) / 100, 1);
    doc.setFillColor(...(isPrimary ? ACCENT : [180, 180, 180] as [number, number, number]));
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
      const txt = `${i + 1}. ${safeText(bullets[i])}`;
      const lines = doc.splitTextToSize(txt, mW);
      const cardH = lines.length * 4.2 + 6;

      if (i % 2 === 0) b.needSpace(cardH + 2);

      doc.setFillColor(...CARD);
      doc.roundedRect(x, b.y - 2, colW, cardH, 1.5, 1.5, 'F');
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, x + 3, b.y + 2);

      if (i % 2 === 1 || i === bullets.length - 1) b.y += cardH + 3;
    }
  }

  b.addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2+ — ANALYSIS (Arguments For / Against)
  // ═══════════════════════════════════════════════════════════════════════════
  b.newPage();

  b.h2('Detailed Argumentation');
  b.muted('Research-backed reasoning for each interface type in your recommendation');
  b.gap(4);

  const allArgs = generateAllArguments(answers, recommendation);
  const colW2 = (CONTENT_W - 6) / 2;
  const rightX = MARGIN + colW2 + 6;

  for (const pArg of allArgs) {
    b.needSpace(20);

    // Dark bar with interface name + %
    const typeName = INTERFACE_LABELS[pArg.paradigmKey] ?? pArg.paradigm;
    doc.setFillColor(40, 40, 40);
    doc.roundedRect(MARGIN, b.y - 1, CONTENT_W, 8, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(safeText(`${typeName}  --  ${Math.round(pArg.percentage)}%`), MARGIN + 3, b.y + 4.5);
    b.y += 12;

    // FOR / AGAINST column headers (ASCII text only)
    doc.setFillColor(...FOR_BG);
    doc.roundedRect(MARGIN, b.y - 1, colW2, 6, 1, 1, 'F');
    doc.setTextColor(...ACCENT);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('FOR', MARGIN + 2, b.y + 3.5);

    doc.setFillColor(...AGAINST_BG);
    doc.roundedRect(rightX, b.y - 1, colW2, 6, 1, 1, 'F');
    doc.setTextColor(180, 83, 9);
    doc.text('AGAINST', rightX + 2, b.y + 3.5);
    b.y += 10;

    // Render args side by side
    const maxArgs = Math.max(pArg.argumentsFor.length, pArg.argumentsAgainst.length);
    for (let i = 0; i < maxArgs; i++) {
      const forArg = pArg.argumentsFor[i];
      const againstArg = pArg.argumentsAgainst[i];

      const forLines = forArg
        ? doc.splitTextToSize(safeText(`${forArg.title}: ${forArg.description}`), colW2 - 6).length
        : 0;
      const againstLines = againstArg
        ? doc.splitTextToSize(safeText(`${againstArg.title}: ${againstArg.description}`), colW2 - 6).length
        : 0;
      const cardH = Math.max(forLines, againstLines) * 4 + 12;

      b.needSpace(cardH + 3);

      if (forArg) {
        doc.setFillColor(...FOR_BG);
        doc.roundedRect(MARGIN, b.y, colW2, cardH, 1.5, 1.5, 'F');
        doc.setTextColor(...ACCENT);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(safeText(forArg.title), MARGIN + 3, b.y + 5);
        doc.setTextColor(...FG);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const desc = doc.splitTextToSize(safeText(forArg.description), colW2 - 6);
        doc.text(desc, MARGIN + 3, b.y + 9.5);
        // Impact pill
        doc.setFillColor(...ACCENT);
        const pillW = doc.getTextWidth(forArg.impact.toUpperCase()) + 4;
        doc.roundedRect(MARGIN + colW2 - pillW - 2, b.y + 2, pillW, 4, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(forArg.impact.toUpperCase(), MARGIN + colW2 - pillW, b.y + 4.8);
      }

      if (againstArg) {
        doc.setFillColor(...AGAINST_BG);
        doc.roundedRect(rightX, b.y, colW2, cardH, 1.5, 1.5, 'F');
        doc.setTextColor(180, 83, 9);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(safeText(againstArg.title), rightX + 3, b.y + 5);
        doc.setTextColor(...FG);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const desc = doc.splitTextToSize(safeText(againstArg.description), colW2 - 6);
        doc.text(desc, rightX + 3, b.y + 9.5);
        // Impact pill
        const amberDark: [number, number, number] = [180, 83, 9];
        doc.setFillColor(...amberDark);
        const pillW2 = doc.getTextWidth(againstArg.impact.toUpperCase()) + 4;
        doc.roundedRect(rightX + colW2 - pillW2 - 2, b.y + 2, pillW2, 4, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(againstArg.impact.toUpperCase(), rightX + colW2 - pillW2, b.y + 4.8);
      }

      b.y += cardH + 3;
    }

    b.gap(6);
  }

  b.addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // CONDITIONAL — REGULATORY (EU / Global only)
  // ═══════════════════════════════════════════════════════════════════════════
  const regAnalysis = generateRegulatoryAnalysis(answers, recommendation);

  if (regAnalysis && regAnalysis.applicable && regAnalysis.requirements.length > 0) {
    b.newPage();

    // Risk badge
    const riskColor: [number, number, number] =
      regAnalysis.overallRiskLevel === 'critical' ? [185, 28, 28] :
      regAnalysis.overallRiskLevel === 'high'     ? [194, 65, 12] :
      regAnalysis.overallRiskLevel === 'medium'   ? [161, 98, 7] :
                                                     [22, 163, 74];
    b.h2(`Regulatory Compliance -- ${regAnalysis.region}`);
    doc.setFillColor(...riskColor);
    const riskLabel = `OVERALL RISK: ${regAnalysis.overallRiskLevel.toUpperCase()}`;
    const riskW = doc.getTextWidth(riskLabel) + 6;
    doc.roundedRect(PAGE_W - MARGIN - riskW, b.y - 10, riskW, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(riskLabel, PAGE_W - MARGIN - riskW + 3, b.y - 6.5);

    b.muted('Applicable EU regulations based on your paradigm mix and deployment region');
    b.gap(4);

    const halfW = (CONTENT_W - 6) / 2;
    const rRightX = MARGIN + halfW + 6;

    for (const req of regAnalysis.requirements) {
      b.needSpace(30);

      // Requirement header bar
      const impColor: [number, number, number] =
        req.impactLevel === 'critical' ? [185, 28, 28] :
        req.impactLevel === 'high'     ? [194, 65, 12] :
        req.impactLevel === 'medium'   ? [161, 98, 7] :
                                          ACCENT;

      doc.setFillColor(...REG_BG);
      // Estimate card height
      const descLines = doc.splitTextToSize(safeText(req.description), halfW - 4);
      const citLines = doc.splitTextToSize(safeText(`${req.citation.regulation} - ${req.citation.title}`), halfW - 4);
      const appliesText = safeText(req.applicableParadigms.map(p => INTERFACE_LABELS[p] ?? p).join(', '));
      const applLines = doc.splitTextToSize(appliesText, halfW - 4);
      const stepsH = req.mitigationSteps.reduce((a, s) => a + doc.splitTextToSize(safeText(s), halfW - 6).length * 3.5 + 1.5, 0);
      const leftH = (descLines.length + citLines.length) * 4 + 14;
      const rightH = applLines.length * 4 + stepsH + 14;
      const cardH = Math.max(leftH, rightH) + 4;

      doc.roundedRect(MARGIN, b.y, CONTENT_W, cardH, 2, 2, 'F');

      // Impact pill
      doc.setFillColor(...impColor);
      const impLabel = req.impactLevel.toUpperCase();
      const impW = doc.getTextWidth(impLabel) + 5;
      doc.roundedRect(MARGIN + 3, b.y + 3, impW, 4.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(impLabel, MARGIN + 5, b.y + 6);

      // Regulation + Title
      doc.setTextColor(...FG);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(safeText(req.regulation), MARGIN + impW + 8, b.y + 6.5);
      doc.setTextColor(...MUTED);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(safeText(req.title), MARGIN + impW + 8 + doc.getTextWidth(safeText(req.regulation)) + 3, b.y + 6.5);

      const contentY = b.y + 12;

      // LEFT: Description + Citation
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', MARGIN + 3, contentY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(descLines, MARGIN + 3, contentY + 4);

      const citY = contentY + descLines.length * 4 + 6;
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('CITATION', MARGIN + 3, citY);
      doc.setTextColor(30, 100, 180);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(citLines, MARGIN + 3, citY + 4);

      // RIGHT: Applies to + Actions
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('APPLIES TO', rRightX, contentY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(appliesText, halfW - 4), rRightX, contentY + 4);

      const actY = contentY + applLines.length * 4 + 6;
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('REQUIRED ACTIONS', rRightX, actY);
      let ay = actY + 4;
      for (const step of req.mitigationSteps) {
        const isReq = step.startsWith('REQUIRED');
        doc.setTextColor(...(isReq ? impColor : FG));
        doc.setFontSize(7);
        doc.setFont('helvetica', isReq ? 'bold' : 'normal');
        const sl = doc.splitTextToSize(safeText(`- ${step.replace(/^REQUIRED: /, '')}`), halfW - 6);
        doc.text(sl, rRightX, ay);
        ay += sl.length * 3.5 + 1.5;
      }

      b.y += cardH + 5;
    }

    b.addFooter();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONDITIONAL — SUSTAINABILITY REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const sustReport = generateSustainabilityReport(
    recommendation,
    answers.valuesRanking,
    answers.geography ?? undefined
  );

  if (sustReport.applicable) {
    b.newPage();

    b.h2('Sustainability Report');
    b.muted('Environmental impact based on your interface mix. Energy benchmarks from LBNL & IEA.');
    b.gap(4);

    // Three key metric tiles
    const metrics = [
      { label: 'Annual Energy', value: `${sustReport.weightedAnnualEnergy.toFixed(0)} kWh`, sub: 'per user/year' },
      { label: 'CO2 Emissions', value: `${sustReport.weightedAnnualCO2.toFixed(1)} kg`, sub: '/year' },
      { label: 'Device Lifecycle', value: `${sustReport.weightedLifecycle.toFixed(1)} yrs`, sub: 'avg' },
    ];
    const metricW = CONTENT_W / 3 - 3;

    for (let i = 0; i < metrics.length; i++) {
      const mx = MARGIN + i * (metricW + 3);
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

    // Comparisons side by side
    const compW = CONTENT_W / 2 - 3;
    doc.setFillColor(...CARD);
    doc.roundedRect(MARGIN, b.y, compW, 16, 1.5, 1.5, 'F');
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('vs Pure Screen Interface', MARGIN + 3, b.y + 5);
    doc.setTextColor(...FG);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(`Energy: ${sustReport.comparisonVsPureScreen.energySavings}`), MARGIN + 3, b.y + 10);
    doc.text(safeText(`CO2: ${sustReport.comparisonVsPureScreen.co2Savings}`), MARGIN + 3, b.y + 14);

    const compRX = MARGIN + compW + 6;
    doc.setFillColor(...CARD);
    doc.roundedRect(compRX, b.y, compW, 16, 1.5, 1.5, 'F');
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('vs Pure Spatial (VR)', compRX + 3, b.y + 5);
    doc.setTextColor(...FG);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(safeText(`Energy: ${sustReport.comparisonVsPureVR.energySavings}`), compRX + 3, b.y + 10);
    doc.text(safeText(`CO2: ${sustReport.comparisonVsPureVR.co2Savings}`), compRX + 3, b.y + 14);

    b.y += 22;

    // Green flags
    if (sustReport.greenFlags.length > 0) {
      b.divider();
      b.h3('What You Are Doing Right');
      for (const flag of sustReport.greenFlags) {
        b.needSpace(8);
        doc.setTextColor(...ACCENT);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`+  ${safeText(flag)}`, MARGIN + 2, b.y);
        b.y += 5;
      }
      b.gap(4);
    }

    // Interface breakdown table
    b.divider();
    b.h3('Environmental Impact by Interface Type');

    // Table header
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
      const tn = INTERFACE_LABELS[p.paradigm] ?? p.paradigm.replace(/_/g, ' ');
      doc.text(safeText(tn), MARGIN + 2, b.y + 3);
      doc.text(`${Math.round(p.percentage)}%`, MARGIN + 70, b.y + 3);
      doc.text(`${p.annualEnergyKwh}`, MARGIN + 90, b.y + 3);
      doc.text(`${p.annualCO2Kg}`, MARGIN + 120, b.y + 3);
      doc.text(`${p.hardwareLifecycle} yrs`, MARGIN + 150, b.y + 3);
      b.y += 7;
    }

    b.addFooter();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONDITIONAL — RED FLAGS
  // ═══════════════════════════════════════════════════════════════════════════
  const flagsReport = detectRedFlags(answers, recommendation);

  if (flagsReport.hasFlags) {
    b.newPage();

    b.h2('Red Flags & Critical Considerations', [185, 28, 28]);
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

      // Estimate card height
      const halfW = (CONTENT_W - 6) / 2;
      const descLines = doc.splitTextToSize(safeText(flag.description), halfW - 4).length;
      const impactLines = doc.splitTextToSize(safeText(flag.impact), halfW - 4).length;
      const affectedText = safeText(flag.affectedParadigms.map(p => INTERFACE_LABELS[p] ?? p.replace(/_/g, ' ')).join(', '));
      const affLines = doc.splitTextToSize(affectedText, halfW - 4).length;
      const mitigH = flag.mitigation.reduce((a, s) => a + doc.splitTextToSize(safeText(s), halfW - 6).length * 3.5 + 1.5, 0);
      const leftH = (descLines + impactLines) * 4 + 14;
      const rightH2 = affLines * 4 + mitigH + 14;
      const cardH = Math.max(leftH, rightH2) + 8;

      b.needSpace(cardH + 5);

      // Card background
      doc.setFillColor(...sevBg);
      doc.roundedRect(MARGIN, b.y, CONTENT_W, cardH, 2, 2, 'F');

      // Color lateral line
      doc.setFillColor(...sevColor);
      doc.rect(MARGIN, b.y, 3, cardH, 'F');

      // Severity badge
      doc.setFillColor(...sevColor);
      doc.roundedRect(MARGIN + 6, b.y + 3, 22, 5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(flag.severity.toUpperCase(), MARGIN + 7, b.y + 6.5);

      // Category badge
      doc.setFillColor(...CARD);
      doc.roundedRect(MARGIN + 30, b.y + 3, 28, 5, 1, 1, 'F');
      doc.setTextColor(...MUTED);
      doc.setFontSize(6);
      doc.text(safeText(flag.category).toUpperCase(), MARGIN + 31, b.y + 6.5);

      // Title
      doc.setTextColor(...sevColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(safeText(flag.title), MARGIN + 6, b.y + 14);

      const contentY = b.y + 19;
      const fRightX = MARGIN + CONTENT_W / 2 + 3;

      // LEFT: Issue + Impact
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('ISSUE', MARGIN + 6, contentY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const issueLines = doc.splitTextToSize(safeText(flag.description), halfW - 4);
      doc.text(issueLines, MARGIN + 6, contentY + 4);

      const impactY = contentY + issueLines.length * 4 + 6;
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('IMPACT IF IGNORED', MARGIN + 6, impactY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const impLines = doc.splitTextToSize(safeText(flag.impact), halfW - 4);
      doc.text(impLines, MARGIN + 6, impactY + 4);

      // RIGHT: Affects + Mitigations
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('AFFECTS', fRightX, contentY);
      doc.setTextColor(...FG);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const affLines2 = doc.splitTextToSize(affectedText, halfW - 4);
      doc.text(affLines2, fRightX, contentY + 4);

      const mitigY = contentY + affLines2.length * 4 + 6;
      doc.setTextColor(...MUTED);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('REQUIRED MITIGATIONS', fRightX, mitigY);
      let my = mitigY + 4;
      for (const step of flag.mitigation) {
        const isReq = step.startsWith('REQUIRED');
        doc.setTextColor(...(isReq ? sevColor : FG));
        doc.setFontSize(7);
        doc.setFont('helvetica', isReq ? 'bold' : 'normal');
        const sl = doc.splitTextToSize(safeText(`- ${step.replace(/^REQUIRED: /, '')}`), halfW - 6);
        doc.text(sl, fRightX, my);
        my += sl.length * 3.5 + 1.5;
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
