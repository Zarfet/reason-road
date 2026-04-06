/**
 * NEXUS - Shared Results Page (Public, Bento Grid Layout)
 * 
 * Purpose: Display results of a shared assessment without authentication
 * 
 * Features:
 * - Load assessment by share_token from URL params
 * - Fixed hero section with paradigm breakdown
 * - Tabbed content area with 4 tabs (no Actions for shared)
 * - Bento grid layout within each tab
 * - No edit capabilities (view only)
 * 
 * Security:
 * - Public route (no authentication required)
 * - RLS ensures only assessments with share_token can be viewed
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Target } from 'lucide-react';
import { NexusLogo } from '@/components/layout/NexusLogo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  type AssessmentAnswers,
  type RecommendationResult,
} from '@/types/assessment';
import { getReasoningBullets, getRedFlags, calculateConfidenceLevel } from '@/lib/scoring';

// Results components
import { StepIndicator } from '@/components/results/StepIndicator';
import { ResultsHero } from '@/components/results/ResultsHero';
import { generateStrategicRationale } from '@/components/results/tabs/OverviewTab';
import { AnalysisTab } from '@/components/results/tabs/AnalysisTab';
import { ImpactTab } from '@/components/results/tabs/ImpactTab';


interface StoredAssessment {
  id: string;
  responses: AssessmentAnswers;
  paradigm_results: RecommendationResult;
  created_at: string;
}

export default function SharedResults() {
  const { token } = useParams<{ token: string }>();
  
  const [assessment, setAssessment] = useState<StoredAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSharedAssessment() {
      if (!token) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .rpc('get_shared_assessment', { p_token: token })
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching shared assessment:', fetchError);
          setError('Could not load the shared assessment.');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('This assessment is no longer shared or does not exist.');
          setLoading(false);
          return;
        }

        const responses = data.responses as unknown as AssessmentAnswers;
        setAssessment({
          id: data.id,
          responses: { ...responses, productConstraints: responses.productConstraints ?? [] },
          paradigm_results: data.paradigm_results as unknown as RecommendationResult,
          created_at: data.created_at,
        });
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    loadSharedAssessment();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !assessment || !assessment.paradigm_results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {error || 'Assessment not found'}
          </h1>
          <p className="text-muted-foreground max-w-md">
            This shared link may have expired or the assessment owner has disabled sharing.
          </p>
          <Button asChild>
            <Link to="/">Go to NEXUS Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const recommendation = assessment.paradigm_results;
  const answers = assessment.responses;
  const reasoningBullets = getReasoningBullets(answers, recommendation);
  const redFlags = getRedFlags(answers, recommendation);
  const confidenceLevel = calculateConfidenceLevel(answers, recommendation);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="nexus-container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <NexusLogo iconSize={28} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-medium">
                Shared Assessment
              </span>
              <Button size="sm" asChild className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/assessment">Take Your Own Assessment</Link>
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
          strategicRationale={generateStrategicRationale(recommendation, answers)}
          reasoningBullets={reasoningBullets}
        />
      </div>

      {/* Tabbed Content Area */}
      <main className="nexus-container py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-1.5 bg-secondary/60 rounded-xl border border-border">
              <TabsTrigger value="analysis" className="flex-1 sm:flex-none">
                Analysis
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex-1 sm:flex-none">
                Impact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <AnalysisTab
                recommendation={recommendation}
                answers={answers}
              />
            </TabsContent>

            <TabsContent value="implementation">
              <ImpactTab
                recommendation={recommendation}
                answers={answers}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            size="lg"
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link to="/assessment">
              Take Your Own Assessment
            </Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
