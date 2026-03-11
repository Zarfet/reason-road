/**
 * Step 10/11: Review & Contradiction Summary
 * 
 * Final check before generating results
 */

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { detectContradictions } from '@/lib/contradictionDetector';
import { useAssessment } from '@/context/AssessmentContext';
import { WIZARD_STEPS, type WizardStep } from '@/types/assessment';

const STEP_NAMES: Record<WizardStep, string> = {
  'context': 'Project Context',
  'values': 'Values Ranking',
  'complexity': 'Task Complexity',
  'frequency': 'Task Frequency',
  'predictability': 'Predictability',
  'context-of-use': 'Context of Use',
  'information-type': 'Information Type',
  'exploration': 'Exploration Mode',
  'errors': 'Error Consequences',
  'control': 'Control Preference',
  'geography': 'Geography',
  'review': 'Review'
};

export function StepReview() {
  const { answers, goToStep, completeAssessment } = useAssessment();
  const report = detectContradictions(answers);
  
  const handleProceed = () => {
    if (report.errorCount > 0) {
      // Cannot proceed with blocking errors
      return;
    }
    
    // Complete assessment and generate results
    completeAssessment();
  };
  
  const consistentAnswers = 11 - report.contradictions.length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Review Your Answers</h2>
        <p className="text-muted-foreground">
          Final check for consistency before generating your recommendation
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-accent-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Consistent</span>
          </div>
          <div className="text-3xl font-bold">{consistentAnswers}</div>
          <div className="text-xs text-muted-foreground">of 11 responses</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Warnings</span>
          </div>
          <div className="text-3xl font-bold">{report.warningCount}</div>
          <div className="text-xs text-muted-foreground">non-blocking</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-muted-foreground">Errors</span>
          </div>
          <div className="text-3xl font-bold">{report.errorCount}</div>
          <div className="text-xs text-muted-foreground">blocking</div>
        </motion.div>
      </div>

      {/* No Contradictions */}
      {!report.hasContradictions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-accent/30 bg-accent/5"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-accent-foreground shrink-0" />
            <div>
              <h3 className="font-semibold text-accent-foreground">All Clear!</h3>
              <p className="text-sm text-muted-foreground">
                No contradictions detected. Your answers are logically consistent.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contradictions List */}
      {report.hasContradictions && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Detected Issues</h3>
          
          {report.contradictions.map((contradiction, idx) => (
            <motion.div
              key={contradiction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-lg border ${
                contradiction.severity === 'error'
                  ? 'border-destructive/30 bg-destructive/5'
                  : 'border-warning-border bg-warning-muted/30'
              }`}
            >
              {/* Title and Severity */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{contradiction.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{contradiction.description}</p>
                </div>
                <Badge
                  variant={contradiction.severity === 'error' ? 'destructive' : 'secondary'}
                  className="shrink-0"
                >
                  {contradiction.severity.toUpperCase()}
                </Badge>
              </div>

              {/* Suggestion */}
              <div className="flex items-start gap-2 mb-3 text-sm">
                <span className="text-accent font-semibold shrink-0">💡</span>
                <p className="text-muted-foreground">{contradiction.suggestion}</p>
              </div>

              {/* Navigate to Step Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep(contradiction.affectedSteps[0])}
                className="w-full justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go to Step {contradiction.affectedSteps[0] + 1}: {STEP_NAMES[WIZARD_STEPS[contradiction.affectedSteps[0]]] || 'Step'}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Blocking Errors Notice */}
      {report.errorCount > 0 && (
        <Alert className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm">
            <strong>Fix {report.errorCount} error{report.errorCount !== 1 ? 's' : ''} to proceed.</strong> Use the links above to navigate to the conflicting steps.
          </AlertDescription>
        </Alert>
      )}

      {/* Proceed with Warnings Disclaimer */}
      {report.warningCount > 0 && report.errorCount === 0 && (
        <Alert className="bg-warning-muted border-warning-border">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-muted-foreground text-sm">
            <strong>Proceeding with Warnings:</strong> You can proceed despite warnings, but the recommendation may be suboptimal. 
            Consider reviewing the flagged steps to optimize your result.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
