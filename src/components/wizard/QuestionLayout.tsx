import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
      <div className="space-y-4">
        <h2 className="text-question text-foreground leading-tight">
          {question}
        </h2>
        
        {hint && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="hint" className="border-none">
              <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-foreground hover:no-underline">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Why this matters
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-0">
                {hint}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}
