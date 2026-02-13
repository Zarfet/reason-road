/**
 * NEXUS - Saved Results Page (Bento Grid Layout)
 * 
 * Purpose: Display results of a previously saved assessment
 * 
 * Features:
 * - Load assessment by ID from URL params
 * - Fixed hero section with paradigm breakdown
 * - Tabbed content area with 5 tabs
 * - Bento grid layout within each tab
 * 
 * Security:
 * - Protected route (requires authentication)
 * - RLS ensures only user's own assessments are fetched
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  type AssessmentAnswers,
  type RecommendationResult,
} from '@/types/assessment';
import { getReasoningBullets, getRedFlags, calculateConfidenceLevel } from '@/lib/scoring';
import { generatePDFReport } from '@/lib/pdfGenerator';

// Results components
import { StepIndicator } from '@/components/results/StepIndicator';
import { ResultsHero } from '@/components/results/ResultsHero';
import { OverviewTab } from '@/components/results/tabs/OverviewTab';
import { AnalysisTab } from '@/components/results/tabs/AnalysisTab';
import { ImpactTab } from '@/components/results/tabs/ImpactTab';
import { ResearchTab } from '@/components/results/tabs/ResearchTab';
import { ActionsTab } from '@/components/results/tabs/ActionsTab';

interface StoredAssessment {
  id: string;
  responses: AssessmentAnswers;
  paradigm_results: RecommendationResult;
  created_at: string;
  share_token: string | null;
}

export default function SavedResults() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [assessment, setAssessment] = useState<StoredAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessment() {
      if (!id) {
        navigate('/profile');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching assessment:', error);
          toast({
            title: 'Error',
            description: 'Could not load the assessment.',
            variant: 'destructive',
          });
          navigate('/profile');
          return;
        }

        if (!data) {
          toast({
            title: 'Not found',
            description: 'Assessment not found.',
            variant: 'destructive',
          });
          navigate('/profile');
          return;
        }

        setAssessment({
          id: data.id,
          responses: data.responses as unknown as AssessmentAnswers,
          paradigm_results: data.paradigm_results as unknown as RecommendationResult,
          created_at: data.created_at,
          share_token: data.share_token ?? null,
        });
      } catch (err) {
        console.error('Unexpected error:', err);
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment || !assessment.paradigm_results) {
    return null;
  }

  const recommendation = assessment.paradigm_results;
  const answers = assessment.responses;
  const reasoningBullets = getReasoningBullets(answers, recommendation);
  const redFlags = getRedFlags(answers, recommendation);
  const confidenceLevel = calculateConfidenceLevel(answers, recommendation);

  const handleDownloadPDF = () => {
    generatePDFReport({ 
      answers, 
      recommendation, 
      createdAt: assessment.created_at 
    });
    toast({
      title: "PDF generado",
      description: "Tu reporte ha sido descargado.",
    });
  };

  const handleStartOver = () => {
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="nexus-container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <Target className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">NEXUS</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                My Assessments
              </Button>
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Assessment
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
                answers={answers}
                reasoningBullets={reasoningBullets}
                redFlags={redFlags}
                confidenceLevel={confidenceLevel}
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
              <ImpactTab
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
                savedAssessmentId={assessment.id}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
