import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface QuestionLayoutProps {
  question: string;
  hint?: string;
  children: React.ReactNode;
}

export function QuestionLayout({ question, hint, children }: QuestionLayoutProps) {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <h2 className="text-question text-foreground leading-tight">
          {question}
        </h2>
        
        {hint && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <span>{hint}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}