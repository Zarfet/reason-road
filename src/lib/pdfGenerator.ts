/**
 * PDF Report Generator for NEXUS Assessment Results
 * 
 * Generates a professional PDF report containing:
 * - Assessment summary with paradigm recommendation
 * - Reasoning bullets
 * - Red flags/warnings
 * - All paradigm scores
 * - Project context
 * 
 * Layout: Two-column design for efficient space usage
 */

import jsPDF from 'jspdf';
import { 
  type AssessmentAnswers, 
  type RecommendationResult,
  PARADIGM_LABELS,
  PARADIGM_DESCRIPTIONS
} from '@/types/assessment';
import { getReasoningBullets, getRedFlags } from '@/lib/scoring';

interface PDFGeneratorParams {
  answers: AssessmentAnswers;
  recommendation: RecommendationResult;
  createdAt?: string;
}

/**
 * Generate and download PDF report with two-column layout
 */
export function generatePDFReport({ answers, recommendation, createdAt }: PDFGeneratorParams): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const columnGap = 8;
  const columnWidth = (contentWidth - columnGap) / 2;
  let yPosition = margin;

  // Colors matching the app design (Emerald accent)
  const accentColor: [number, number, number] = [22, 163, 74]; // Emerald-600 (matches --accent)
  const textColor: [number, number, number] = [26, 26, 26]; // Near black (matches --foreground)
  const mutedColor: [number, number, number] = [100, 100, 100]; // Gray (matches --muted-foreground)
  const cardBgColor: [number, number, number] = [250, 250, 250]; // Light gray (matches --card)
  const warningBg: [number, number, number] = [254, 243, 199]; // Amber-100
  const warningText: [number, number, number] = [180, 83, 9]; // Amber-700

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // Helper function to check page overflow
  const checkPageOverflow = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // ========================================
  // HEADER
  // ========================================
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXUS', margin, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Paradigm Assessment Report', margin, 27);

  // Date on the right
  const dateStr = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.text(dateStr, pageWidth - margin, 27, { align: 'right' });

  yPosition = 45;

  // ========================================
  // PROJECT CONTEXT (compact)
  // ========================================
  if (answers.projectName || answers.userDemographics) {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const contextParts: string[] = [];
    if (answers.projectName) contextParts.push(`Project: ${answers.projectName}`);
    if (answers.userDemographics) contextParts.push(`Users: ${answers.userDemographics}`);
    doc.text(contextParts.join('  |  '), margin, yPosition);
    yPosition += 8;
  }

  // ========================================
  // PRIMARY RECOMMENDATION (full width)
  // ========================================
  doc.setFillColor(...cardBgColor);
  doc.roundedRect(margin, yPosition, contentWidth, 28, 3, 3, 'F');

  doc.setTextColor(...accentColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDED PARADIGM', margin + 6, yPosition + 8);

  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const primaryLabel = PARADIGM_LABELS[recommendation.primary.paradigm];
  doc.text(primaryLabel, margin + 6, yPosition + 20);

  doc.setTextColor(...accentColor);
  doc.setFontSize(14);
  doc.text(`${recommendation.primary.pct}%`, pageWidth - margin - 6, yPosition + 20, { align: 'right' });

  yPosition += 35;

  // Secondary paradigm
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const secondaryLabel = PARADIGM_LABELS[recommendation.secondary.paradigm];
  doc.text(`Secondary: ${secondaryLabel} (${recommendation.secondary.pct}%)`, margin, yPosition);
  yPosition += 12;

  // ========================================
  // TWO-COLUMN LAYOUT STARTS HERE
  // ========================================
  const leftColumnX = margin;
  const rightColumnX = margin + columnWidth + columnGap;
  let leftY = yPosition;
  let rightY = yPosition;

  // ========================================
  // LEFT COLUMN: REASONING + RED FLAGS
  // ========================================
  const reasoningBullets = getReasoningBullets(answers, recommendation);
  
  if (reasoningBullets.length > 0) {
    doc.setTextColor(...accentColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('WHY THIS RECOMMENDATION', leftColumnX, leftY);
    leftY += 8;

    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    for (const bullet of reasoningBullets) {
      // Remove markdown bold markers for PDF
      const cleanBullet = bullet.replace(/\*\*/g, '');
      doc.text('→', leftColumnX, leftY);
      leftY = addWrappedText(cleanBullet, leftColumnX + 6, leftY, columnWidth - 8, 4);
      leftY += 2;
    }
    leftY += 6;
  }

  // RED FLAGS
  const redFlags = getRedFlags(answers, recommendation);
  
  if (redFlags.length > 0) {
    const flagBoxHeight = redFlags.length * 14 + 16;
    
    doc.setFillColor(...warningBg);
    doc.roundedRect(leftColumnX, leftY, columnWidth, flagBoxHeight, 2, 2, 'F');

    doc.setTextColor(...warningText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('RED FLAGS TO WATCH', leftColumnX + 4, leftY + 8);
    leftY += 14;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    for (const flag of redFlags) {
      // Remove emoji prefix for cleaner PDF
      const cleanFlag = flag.text.replace(/^⚠️\s*/, '• ');
      leftY = addWrappedText(cleanFlag, leftColumnX + 4, leftY, columnWidth - 10, 4);
      doc.setTextColor(...mutedColor);
      doc.setFontSize(6);
      doc.text(`Source: ${flag.source}`, leftColumnX + 8, leftY);
      doc.setTextColor(...warningText);
      doc.setFontSize(7);
      leftY += 5;
    }
    leftY += 4;
  }

  // ========================================
  // RIGHT COLUMN: ALL PARADIGM SCORES
  // ========================================
  doc.setTextColor(...accentColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ALL PARADIGM SCORES', rightColumnX, rightY);
  rightY += 10;

  const paradigms = Object.entries(recommendation.allScores)
    .sort(([, a], [, b]) => b - a) as Array<[keyof typeof PARADIGM_LABELS, number]>;

  for (const [paradigm, score] of paradigms) {
    const label = PARADIGM_LABELS[paradigm];
    const description = PARADIGM_DESCRIPTIONS[paradigm];
    
    // Paradigm name and score
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, rightColumnX, rightY);
    
    doc.setTextColor(...accentColor);
    doc.text(`${score}%`, rightColumnX + columnWidth - 4, rightY, { align: 'right' });
    rightY += 5;

    // Bar background
    doc.setFillColor(229, 231, 235); // Gray-200
    doc.roundedRect(rightColumnX, rightY, columnWidth - 4, 5, 1.5, 1.5, 'F');
    
    // Bar fill
    const barWidth = ((columnWidth - 4) * score) / 100;
    if (barWidth > 0) {
      const barColor = paradigm === recommendation.primary.paradigm 
        ? accentColor 
        : [156, 163, 175] as [number, number, number]; // Gray-400
      doc.setFillColor(...barColor);
      doc.roundedRect(rightColumnX, rightY, Math.max(barWidth, 2), 5, 1.5, 1.5, 'F');
    }
    rightY += 7;

    // Description (smaller)
    doc.setTextColor(...mutedColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    rightY = addWrappedText(description, rightColumnX, rightY, columnWidth - 4, 3.5);
    rightY += 6;
  }

  // ========================================
  // FOOTER
  // ========================================
  const footerY = pageHeight - 10;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by NEXUS Paradigm Assessment Tool', margin, footerY);
  doc.text('https://reason-road.lovable.app', pageWidth - margin, footerY, { align: 'right' });

  // ========================================
  // DOWNLOAD
  // ========================================
  const fileName = answers.projectName 
    ? `NEXUS-Report-${answers.projectName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
    : `NEXUS-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(fileName);
}
