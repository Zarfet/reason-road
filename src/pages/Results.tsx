/**
 * NEXUS - Results Page
 * 
 * Purpose: Display results of a freshly completed assessment
 * 
 * Features:
 * - Auto-save assessment to database
 * - Display paradigm recommendation with scores
 * - Two-column layout with alternatives
 * - Step indicator
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Download, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAssessment } from '@/context/AssessmentContext';
import { getReasoningBullets, getRedFlags } from '@/lib/scoring';
import { generatePDFReport } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

// Results components
import { StepIndicator } from '@/components/results/StepIndicator';
import { ResultsHero } from '@/components/results/ResultsHero';
import { ReasoningPanel } from '@/components/results/ReasoningPanel';
import { AlternativesPanel } from '@/components/results/AlternativesPanel';
import { ResearchPanel } from '@/components/results/ResearchPanel';
import { ShareButton } from '@/components/results/ShareButton';

export default function Results() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recommendation, answers, isComplete, resetAssessment, saveAssessmentToDb } = useAssessment();
  const hasSavedRef = useRef(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!isComplete || !recommendation) {
      navigate('/assessment');
    }
  }, [isComplete, recommendation, navigate]);

  // Save assessment to database when results are shown
  useEffect(() => {
    const saveAssessment = async () => {
      if (isComplete && recommendation && !hasSavedRef.current) {
        hasSavedRef.current = true;
        const result = await saveAssessmentToDb();
        
        if (result.success && result.assessmentId) {
          setSavedAssessmentId(result.assessmentId);
          toast({
            title: "Assessment guardado",
            description: "Tu evaluación ha sido guardada exitosamente.",
          });
        } else if (result.error) {
          console.error('Failed to save assessment:', result.error);
        }
      }
    };
    
    saveAssessment();
  }, [isComplete, recommendation, saveAssessmentToDb, toast]);

  if (!recommendation) {
    return null;
  }

  const reasoningBullets = getReasoningBullets(answers, recommendation);
  const redFlags = getRedFlags(answers, recommendation);

  const handleStartOver = () => {
    resetAssessment();
    navigate('/');
  };

  const handleDownloadPDF = () => {
    generatePDFReport({ answers, recommendation });
    toast({
      title: "PDF generado",
      description: "Tu reporte ha sido descargado.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="nexus-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <Target className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">NEXUS</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                My Assessments
              </Button>
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="nexus-container">
        <StepIndicator currentStep={5} />
      </div>

      {/* Hero Section */}
      <div className="nexus-container">
        <ResultsHero
          primaryParadigm={recommendation.primary.paradigm}
          secondaryParadigm={recommendation.secondary.paradigm}
          secondaryPct={recommendation.secondary.pct}
          projectName={answers.projectName}
          userDemographics={answers.userDemographics}
        />
      </div>

      {/* Main Content - Two Column Layout */}
      <main className="nexus-container py-8 pb-20">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left Column - Why This Recommendation + Research */}
          <div className="lg:col-span-3 space-y-6">
            <ReasoningPanel bullets={reasoningBullets} redFlags={redFlags} />
            <ResearchPanel 
              paradigm={recommendation.primary.paradigm}
              userDemographics={answers.userDemographics}
            />
          </div>

          {/* Right Column - Alternatives */}
          <div className="lg:col-span-2">
            <AlternativesPanel 
              allScores={recommendation.allScores}
              primaryParadigm={recommendation.primary.paradigm}
            />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
          {savedAssessmentId && (
            <ShareButton assessmentId={savedAssessmentId} />
          )}
          <Button
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleStartOver}
          >
            Run Another Assessment
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
