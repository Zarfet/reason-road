/**
 * PDF Report Generator for NEXUS Assessment Results
 * 
 * Generates a professional PDF report containing:
 * - Assessment summary with paradigm recommendation
 * - Reasoning bullets
 * - Red flags/warnings
 * - All paradigm scores
 * - Project context
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
 * Generate and download PDF report
 */
export function generatePDFReport({ answers, recommendation, createdAt }: PDFGeneratorParams): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
  const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
  const mutedColor: [number, number, number] = [107, 114, 128]; // Gray-500
  const accentColor: [number, number, number] = [16, 185, 129]; // Emerald

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // Helper function to check page overflow
  const checkPageOverflow = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // ========================================
  // HEADER
  // ========================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXUS', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Paradigm Assessment Report', margin, 35);

  // Date on the right
  const dateStr = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(10);
  doc.text(dateStr, pageWidth - margin, 35, { align: 'right' });

  yPosition = 60;

  // ========================================
  // PROJECT CONTEXT
  // ========================================
  if (answers.projectName || answers.userDemographics) {
    doc.setTextColor(...mutedColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (answers.projectName) {
      doc.text(`Project: ${answers.projectName}`, margin, yPosition);
      yPosition += 5;
    }
    if (answers.userDemographics) {
      doc.text(`Target Users: ${answers.userDemographics}`, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 10;
  }

  // ========================================
  // PRIMARY RECOMMENDATION
  // ========================================
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDED PARADIGM', margin, yPosition);
  yPosition += 10;

  // Primary paradigm box
  doc.setFillColor(243, 244, 246); // Gray-100
  doc.roundedRect(margin, yPosition - 5, contentWidth, 35, 3, 3, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const primaryLabel = PARADIGM_LABELS[recommendation.primary.paradigm];
  doc.text(primaryLabel, margin + 8, yPosition + 8);

  doc.setTextColor(...accentColor);
  doc.setFontSize(16);
  doc.text(`${recommendation.primary.pct}%`, pageWidth - margin - 8, yPosition + 8, { align: 'right' });

  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const primaryDesc = PARADIGM_DESCRIPTIONS[recommendation.primary.paradigm];
  doc.text(primaryDesc, margin + 8, yPosition + 20);

  yPosition += 45;

  // Secondary paradigm
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const secondaryLabel = PARADIGM_LABELS[recommendation.secondary.paradigm];
  doc.text(`Secondary: ${secondaryLabel} (${recommendation.secondary.pct}%)`, margin, yPosition);
  yPosition += 20;

  // ========================================
  // REASONING
  // ========================================
  const reasoningBullets = getReasoningBullets(answers, recommendation);
  
  if (reasoningBullets.length > 0) {
    checkPageOverflow(60);
    
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('WHY THIS RECOMMENDATION', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const bullet of reasoningBullets) {
      checkPageOverflow(15);
      
      // Remove markdown bold markers for PDF
      const cleanBullet = bullet.replace(/\*\*/g, '');
      doc.text('→', margin, yPosition);
      yPosition = addWrappedText(cleanBullet, margin + 8, yPosition, contentWidth - 10);
      yPosition += 2;
    }
    yPosition += 10;
  }

  // ========================================
  // RED FLAGS
  // ========================================
  const redFlags = getRedFlags(answers, recommendation);
  
  if (redFlags.length > 0) {
    checkPageOverflow(50);
    
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.roundedRect(margin, yPosition - 5, contentWidth, redFlags.length * 12 + 20, 3, 3, 'F');

    doc.setTextColor(180, 83, 9); // Amber-700
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RED FLAGS TO WATCH', margin + 8, yPosition + 5);
    yPosition += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    for (const flag of redFlags) {
      checkPageOverflow(12);
      // Remove emoji prefix for cleaner PDF
      const cleanFlag = flag.replace(/^⚠️\s*/, '• ');
      yPosition = addWrappedText(cleanFlag, margin + 8, yPosition, contentWidth - 16);
    }
    yPosition += 15;
  }

  // ========================================
  // ALL PARADIGM SCORES
  // ========================================
  checkPageOverflow(80);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ALL PARADIGM SCORES', margin, yPosition);
  yPosition += 12;

  const paradigms = Object.entries(recommendation.allScores)
    .sort(([, a], [, b]) => b - a) as Array<[keyof typeof PARADIGM_LABELS, number]>;

  for (const [paradigm, score] of paradigms) {
    checkPageOverflow(18);
    
    const label = PARADIGM_LABELS[paradigm];
    
    // Bar background
    doc.setFillColor(229, 231, 235); // Gray-200
    doc.roundedRect(margin, yPosition, contentWidth - 30, 8, 2, 2, 'F');
    
    // Bar fill
    const barWidth = ((contentWidth - 30) * score) / 100;
    if (barWidth > 0) {
      const barColor = paradigm === recommendation.primary.paradigm 
        ? primaryColor 
        : [156, 163, 175] as [number, number, number]; // Gray-400
      doc.setFillColor(...barColor);
      doc.roundedRect(margin, yPosition, barWidth, 8, 2, 2, 'F');
    }

    // Score percentage
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}%`, pageWidth - margin, yPosition + 6, { align: 'right' });

    // Label below bar
    doc.setTextColor(...mutedColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, yPosition + 14);

    yPosition += 22;
  }

  // ========================================
  // FOOTER
  // ========================================
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
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
