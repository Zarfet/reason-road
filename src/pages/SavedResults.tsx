/**
 * NEXUS - Saved Results Page
 * 
 * Purpose: Display results of a previously saved assessment
 * 
 * Features:
 * - Load assessment by ID from URL params
 * - Display paradigm recommendation with scores
 * - Show reasoning bullets and red flags
 * - Navigate back to profile
 * 
 * Security:
 * - Protected route (requires authentication)
 * - RLS ensures only user's own assessments are fetched
 */

import { useEffect, useState, ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  PARADIGM_LABELS, 
  PARADIGM_DESCRIPTIONS,
  type AssessmentAnswers,
  type RecommendationResult,
  type ParadigmScores 
} from '@/types/assessment';
import { getReasoningBullets, getRedFlags } from '@/lib/scoring';

/**
 * Safely renders markdown bold syntax (**text**) as React elements
 */
function renderBoldMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="nexus-container py-8 pb-20">
        <motion.div 
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Badge */}
          <div className="text-center space-y-4">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nexus-emerald-light text-accent text-sm font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="h-4 w-4" />
              Saved Assessment
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {PARADIGM_LABELS[recommendation.primary.paradigm]}
              {recommendation.secondary.pct > 15 && (
                <span className="text-muted-foreground font-normal"> + {PARADIGM_LABELS[recommendation.secondary.paradigm]}</span>
              )}
            </motion.h1>
            
            <div className="space-y-1">
              {answers.projectName && (
                <p className="text-muted-foreground">Project: {answers.projectName}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Completed on {formatDate(assessment.created_at)}
              </p>
            </div>
          </div>

          {/* Primary Recommendation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="results-primary p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Multi-Modal Strategy</h2>
              
              <div className="space-y-4 mb-8">
                <StrategyBar 
                  label={PARADIGM_LABELS[recommendation.primary.paradigm]}
                  percentage={recommendation.primary.pct}
                  isPrimary
                />
                <StrategyBar 
                  label={PARADIGM_LABELS[recommendation.secondary.paradigm]}
                  percentage={recommendation.secondary.pct}
                />
                <StrategyBar 
                  label={PARADIGM_LABELS[recommendation.tertiary.paradigm]}
                  percentage={recommendation.tertiary.pct}
                />
              </div>

              <div className="pt-6 border-t border-accent/20">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <X className="h-4 w-4 text-destructive" />
                  What to avoid
                </h3>
                <div className="space-y-2">
                  {recommendation.avoid.map(([paradigm, pct]) => (
                    <div key={paradigm} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-destructive">✗</span>
                      <span>{PARADIGM_LABELS[paradigm]} ({pct}% match)</span>
                      <span>—</span>
                      <span>{PARADIGM_DESCRIPTIONS[paradigm]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Why This Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="nexus-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">Why This Recommendation</h2>
              <ul className="space-y-3">
                {reasoningBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      {renderBoldMarkdown(bullet)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="nexus-card border-amber-200 bg-amber-50/50">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Red Flags to Watch
                </h2>
                <ul className="space-y-3">
                  {redFlags.map((flag, index) => (
                    <li key={index} className="text-foreground">{flag}</li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}

          {/* Paradigm Scores Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="nexus-card">
              <h2 className="text-xl font-semibold text-foreground mb-4">All Paradigm Scores</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(recommendation.allScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([paradigm, score]) => (
                    <div key={paradigm} className="text-center p-4 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold text-foreground">{score}%</div>
                      <div className="text-sm text-muted-foreground">
                        {PARADIGM_LABELS[paradigm as keyof ParadigmScores]}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <Button 
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate('/assessment')}
            >
              Run New Assessment
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

function StrategyBar({ 
  label, 
  percentage, 
  isPrimary = false 
}: { 
  label: string; 
  percentage: number; 
  isPrimary?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={isPrimary ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
          {label}
        </span>
        <span className={isPrimary ? 'font-semibold text-accent' : 'text-muted-foreground'}>
          {percentage}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/50 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isPrimary ? 'bg-accent' : 'bg-accent/40'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </div>
  );
}
