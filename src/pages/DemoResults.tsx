/**
 * NEXUS - Demo Results Page
 * Same as Results.tsx but without DB persistence and with "Try another scenario" button.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { NexusLogo } from '@/components/layout/NexusLogo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssessment } from '@/context/AssessmentContext';
import { getReasoningBullets, getRedFlags, calculateConfidenceLevel } from '@/lib/scoring';
import { detectRedFlags } from '@/lib/redFlagsDetector';
import { generatePDFReport, generateExecutiveBrief } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

import { StepIndicator } from '@/components/results/StepIndicator';
import { ResultsHero } from '@/components/results/ResultsHero';
import { AnalysisTab } from '@/components/results/tabs/AnalysisTab';
import { ImpactTab } from '@/components/results/tabs/ImpactTab';
import { ResearchTab } from '@/components/results/tabs/ResearchTab';
import { ActionsTab } from '@/components/results/tabs/ActionsTab';

export default function DemoResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recommendation, answers, isComplete, resetAssessment } = useAssessment();
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => {
    if (!isComplete || !recommendation) {
      navigate('/demo/assessment');
    }
  }, [isComplete, recommendation, navigate]);

  if (!recommendation) {
    return null;
  }

  const reasoningBullets = getReasoningBullets(answers, recommendation);
  const redFlags = getRedFlags(answers, recommendation);
  const confidenceLevel = calculateConfidenceLevel(answers, recommendation);
  const redFlagsReport = detectRedFlags(answers, recommendation);
  const flagIds = redFlagsReport?.flags?.map((f) => f.id) || [];

  const handleStartOver = () => {
    resetAssessment();
    navigate('/');
  };

  const handleTryAnotherScenario = () => {
    resetAssessment();
    navigate('/demo');
  };

  const handleDownloadPDF = async () => {
    await generatePDFReport({ answers, recommendation });
    toast({ title: "PDF Generated", description: "Your report has been downloaded." });
  };

  const handleDownloadBrief = async () => {
    await generateExecutiveBrief({ answers, recommendation });
    toast({ title: "Executive Brief Generated", description: "Your brief has been downloaded." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-accent text-accent-foreground text-center text-xs font-mono py-1.5 px-4">
        DEMO MODE — {answers.projectName || 'Demo'}
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="nexus-container py-4">
          <div className="flex items-center justify-between">
            <NexusLogo iconSize={28} />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTryAnotherScenario}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try another scenario
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartOver}
                className="rounded-lg border-border hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="nexus-container">
        <StepIndicator currentStep={5} />
      </div>

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
          reasoningBullets={reasoningBullets}
          geography={answers.geography}
        />
      </div>

      <main className="nexus-container py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-1.5 bg-secondary/60 rounded-lg sticky top-[65px] z-30 backdrop-blur-sm border border-border">
              <TabsTrigger value="analysis" className="flex-1 sm:flex-none font-mono text-xs">
                <span className="sm:hidden">📈</span>
                <span className="hidden sm:inline">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex-1 sm:flex-none font-mono text-xs">
                <span className="sm:hidden">📊</span>
                <span className="hidden sm:inline">Impact</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="flex-1 sm:flex-none font-mono text-xs">
                <span className="sm:hidden">📚</span>
                <span className="hidden sm:inline">Research</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex-1 sm:flex-none font-mono text-xs">
                <span className="sm:hidden">🎯</span>
                <span className="hidden sm:inline">Actions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <AnalysisTab recommendation={recommendation} answers={answers} />
            </TabsContent>
            <TabsContent value="implementation">
              <ImpactTab recommendation={recommendation} answers={answers} />
            </TabsContent>
            <TabsContent value="research">
              <ResearchTab paradigm={recommendation.primary.paradigm} userDemographics={answers.userDemographics} flagIds={flagIds} topValue={answers.valuesRanking?.[0] || 'User Control'} />
            </TabsContent>
            <TabsContent value="actions">
              <ActionsTab onDownloadPDF={handleDownloadPDF} onDownloadBrief={handleDownloadBrief} onStartOver={handleStartOver} savedAssessmentId={null} isDemo />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
