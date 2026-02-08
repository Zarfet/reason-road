/**
 * NEXUS - Results Page (Bento Grid Layout)
 * 
 * Purpose: Display results of a freshly completed assessment
 * 
 * Features:
 * - Fixed hero section with paradigm breakdown
 * - Tabbed content area with 5 tabs
 * - Bento grid layout within each tab
 * - Auto-save assessment to database
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssessment } from '@/context/AssessmentContext';
import { getReasoningBullets, getRedFlags, calculateConfidenceLevel } from '@/lib/scoring';
import { generatePDFReport } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

// Results components
import { StepIndicator } from '@/components/results/StepIndicator';
import { ResultsHero } from '@/components/results/ResultsHero';
import { OverviewTab } from '@/components/results/tabs/OverviewTab';
import { AnalysisTab } from '@/components/results/tabs/AnalysisTab';
import { ImplementationTab } from '@/components/results/tabs/ImplementationTab';
import { ResearchTab } from '@/components/results/tabs/ResearchTab';
import { ActionsTab } from '@/components/results/tabs/ActionsTab';

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
  const confidenceLevel = calculateConfidenceLevel(answers, recommendation);

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
          tertiaryParadigm={recommendation.tertiary.paradigm}
          primaryPct={recommendation.primary.pct}
          secondaryPct={recommendation.secondary.pct}
          tertiaryPct={recommendation.tertiary.pct}
          projectName={answers.projectName}
          userDemographics={answers.userDemographics}
          confidenceLevel={confidenceLevel}
        />
      </div>

      {/* Tabbed Content Area */}
      <main className="nexus-container py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-1 bg-muted/50">
              <TabsTrigger value="overview" className="flex-1 sm:flex-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex-1 sm:flex-none">
                Analysis
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex-1 sm:flex-none">
                Implementation
              </TabsTrigger>
              <TabsTrigger value="research" className="flex-1 sm:flex-none">
                Research
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex-1 sm:flex-none">
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                recommendation={recommendation}
                reasoningBullets={reasoningBullets}
                redFlags={redFlags}
              />
            </TabsContent>

            <TabsContent value="analysis">
              <AnalysisTab
                recommendation={recommendation}
                redFlags={redFlags}
                answers={answers}
              />
            </TabsContent>

            <TabsContent value="implementation">
              <ImplementationTab
                recommendation={recommendation}
              />
            </TabsContent>

            <TabsContent value="research">
              <ResearchTab
                paradigm={recommendation.primary.paradigm}
                userDemographics={answers.userDemographics}
              />
            </TabsContent>

            <TabsContent value="actions">
              <ActionsTab
                onDownloadPDF={handleDownloadPDF}
                onStartOver={handleStartOver}
                savedAssessmentId={savedAssessmentId}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
