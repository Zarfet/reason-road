/**
 * NEXUS - Saved Results Page
 * 
 * Purpose: Display results of a previously saved assessment
 * 
 * Features:
 * - Load assessment by ID from URL params
 * - Display paradigm recommendation with scores
 * - Show reasoning bullets and red flags
 * - Two-column layout with alternatives
 * - Step indicator
 * 
 * Security:
 * - Protected route (requires authentication)
 * - RLS ensures only user's own assessments are fetched
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, Download, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  type AssessmentAnswers,
  type RecommendationResult,
} from '@/types/assessment';
import { getReasoningBullets, getRedFlags } from '@/lib/scoring';

// Results components
import { StepIndicator } from '@/components/results/StepIndicator';
import { ResultsHero } from '@/components/results/ResultsHero';
import { ReasoningPanel } from '@/components/results/ReasoningPanel';
import { AlternativesPanel } from '@/components/results/AlternativesPanel';

interface StoredAssessment {
  id: string;
  responses: AssessmentAnswers;
  paradigm_results: RecommendationResult;
  created_at: string;
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
              <Button variant="outline" size="sm" onClick={() => navigate('/assessment')}>
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
          {/* Left Column - Why This Recommendation */}
          <div className="lg:col-span-3">
            <ReasoningPanel bullets={reasoningBullets} redFlags={redFlags} />
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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
          <Button 
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate('/assessment')}
          >
            Run New Assessment
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
