/**
 * Contradiction Warning Component
 * 
 * Shows inline warnings for contradictions detected in current step
 */

import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { detectContradictionsForStep } from '@/lib/contradictionDetector';
import type { AssessmentAnswers } from '@/types/assessment';

interface ContradictionWarningProps {
  stepNumber: number;
  answers: AssessmentAnswers;
}

export function ContradictionWarning({ stepNumber, answers }: ContradictionWarningProps) {
  const contradictions = detectContradictionsForStep(stepNumber, answers);
  
  if (contradictions.length === 0) {
    return null;
  }
  
  const hasErrors = contradictions.some(c => c.severity === 'error');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {contradictions.map((contradiction, idx) => (
        <Alert
          key={contradiction.id}
          className={
            contradiction.severity === 'error'
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-warning-border bg-warning-muted/50'
          }
        >
          <div className="flex items-start gap-3">
            {contradiction.severity === 'error' ? (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            ) : (
              <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {contradiction.severity === 'error' ? 'Blocking Error' : 'Warning'}
              </div>
              <AlertDescription className="text-xs mt-1">
                <p className="mb-1">{contradiction.description}</p>
                <p className="text-muted-foreground italic">💡 {contradiction.suggestion}</p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </motion.div>
  );
}
