/**
 * NEXUS - Shared Results Page (Public)
 * 
 * Purpose: Display results of a shared assessment without authentication
 * 
 * Features:
 * - Load assessment by share_token from URL params
 * - Display paradigm recommendation with scores
 * - Show reasoning bullets and red flags
 * - Two-column layout with alternatives
 * - No edit capabilities (view only)
 * 
 * Security:
 * - Public route (no authentication required)
 * - RLS ensures only assessments with share_token can be viewed
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  type AssessmentAnswers,
  type RecommendationResult,
} from '@/types/assessment';
import { getReasoningBullets, getRedFlags, calculateConfidenceLevel } from '@/lib/scoring';

// Results components
import { StepIndicator } from '@/components/results/StepIndicator';
import { ResultsHero } from '@/components/results/ResultsHero';
import { ReasoningPanel } from '@/components/results/ReasoningPanel';
import { AlternativesPanel } from '@/components/results/AlternativesPanel';
import { ResearchPanel } from '@/components/results/ResearchPanel';
import { CaseStudiesPanel } from '@/components/results/CaseStudiesPanel';

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
          .from('assessments')
          .select('id, responses, paradigm_results, created_at')
          .eq('share_token', token)
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

        setAssessment({
          id: data.id,
          responses: data.responses as unknown as AssessmentAnswers,
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
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Shared Assessment
              </span>
              <Button size="sm" asChild>
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
          secondaryPct={recommendation.secondary.pct}
          projectName={answers.projectName}
          userDemographics={answers.userDemographics}
          confidenceLevel={confidenceLevel}
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
          {/* Left Column - Why This Recommendation + Research + Case Studies */}
          <div className="lg:col-span-3 space-y-6">
            <ReasoningPanel bullets={reasoningBullets} redFlags={redFlags} />
            <ResearchPanel 
              paradigm={recommendation.primary.paradigm}
              userDemographics={answers.userDemographics}
            />
            <CaseStudiesPanel
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
