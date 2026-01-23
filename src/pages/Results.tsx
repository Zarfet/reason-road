import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Download, ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAssessment } from '@/context/AssessmentContext';
import { PARADIGM_LABELS, PARADIGM_DESCRIPTIONS } from '@/types/assessment';
import { getReasoningBullets, getRedFlags } from '@/lib/scoring';

export default function Results() {
  const navigate = useNavigate();
  const { recommendation, answers, isComplete, resetAssessment } = useAssessment();

  useEffect(() => {
    if (!isComplete || !recommendation) {
      navigate('/assessment');
    }
  }, [isComplete, recommendation, navigate]);

  if (!recommendation) {
    return null;
  }

  const reasoningBullets = getReasoningBullets(answers, recommendation);
  const redFlags = getRedFlags(answers, recommendation);

  const handleStartOver = () => {
    resetAssessment();
    navigate('/');
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
            <Button variant="outline" size="sm" onClick={handleStartOver}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start Over
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
              Recommended Strategy
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
            
            {answers.projectName && (
              <p className="text-muted-foreground">Best fit for {answers.projectName}</p>
            )}
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
                    <span 
                      className="text-foreground"
                      dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
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
                        {PARADIGM_LABELS[paradigm as keyof typeof PARADIGM_LABELS]}
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
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
            <Button 
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleStartOver}
            >
              Run Another Assessment
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
