/**
 * Panel showing alternative paradigms — Tech-Minimalist
 */

import { motion } from 'framer-motion';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  PARADIGM_LABELS, PARADIGM_DESCRIPTIONS, type ParadigmScores, type ParadigmPercentages 
} from '@/types/assessment';

interface AlternativesPanelProps {
  allScores: ParadigmPercentages;
  primaryParadigm: keyof ParadigmScores;
}

const PARADIGM_REFERENCES: Record<keyof ParadigmScores, { title: string; url: string; description: string }> = {
  traditional_screen: { title: 'Nielsen Norman Group (2023). Screen-Based UI Best Practices', url: 'https://www.nngroup.com/articles/screen-ui-best-practices/', description: 'Proven patterns for visual interfaces with high information density.' },
  invisible: { title: 'Weiser, M. (1991). The Computer for the 21st Century', url: 'https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf', description: 'Foundational work on ubiquitous computing and ambient intelligence.' },
  ai_vectorial: { title: 'Amershi et al. (2019). Guidelines for Human-AI Interaction', url: 'https://doi.org/10.1145/3290605.3300233', description: 'Microsoft Research guidelines for designing AI-powered interfaces.' },
  spatial: { title: 'Milgram & Kishino (1994). Reality-Virtuality Continuum', url: 'https://doi.org/10.1587/bplus.E77-D.1321', description: 'Seminal taxonomy for AR/VR interface design and spatial computing.' },
  voice: { title: 'Pearl, C. (2016). Designing Voice User Interfaces', url: 'https://www.oreilly.com/library/view/designing-voice-user/9781491955406/', description: 'Comprehensive guide to conversational interface design principles.' },
};

function getScoreExplanation(paradigm: keyof ParadigmScores, score: number, primaryScore: number): string {
  const diff = primaryScore - score;
  const paradigmStrengths: Record<keyof ParadigmScores, string> = {
    traditional_screen: 'complex tasks, visual feedback, and explicit user control',
    invisible: 'repetitive tasks, high frequency usage, and predictable workflows',
    ai_vectorial: 'unstructured content, exploration, and intelligent assistance',
    spatial: '3D/spatial data, immersive experiences, and visual-heavy workflows',
    voice: 'hands-free contexts, accessibility needs, and simple commands',
  };
  if (score >= 50) return `Strong fit. Excels at ${paradigmStrengths[paradigm]}. Only ${diff}% behind primary—consider hybrid approach.`;
  if (score >= 30) return `Moderate fit. Good for ${paradigmStrengths[paradigm]}, but your requirements favor other paradigms.`;
  return `Low fit. Designed for ${paradigmStrengths[paradigm]}, which doesn't align well with your context.`;
}

export function AlternativesPanel({ allScores, primaryParadigm }: AlternativesPanelProps) {
  const alternatives = Object.entries(allScores).filter(([paradigm]) => paradigm !== primaryParadigm).sort((a, b) => b[1] - a[1]);
  const primaryScore = allScores[primaryParadigm];

  return (
    <Card className="nexus-card h-fit">
      <h2 className="text-lg font-medium text-foreground mb-6 tracking-tight">Alternatives Considered</h2>
      <div className="space-y-6">
        {alternatives.map(([paradigm, score], index) => {
          const isLowMatch = score < 30;
          const explanation = getScoreExplanation(paradigm as keyof ParadigmScores, score, primaryScore);
          const reference = PARADIGM_REFERENCES[paradigm as keyof ParadigmScores];
          
          return (
            <motion.div key={paradigm} className="space-y-2 border-b border-border last:border-0 pb-4 last:pb-0"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">{PARADIGM_LABELS[paradigm as keyof ParadigmScores]}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium ${
                  score >= 50 ? 'bg-foreground text-background' : score >= 30 ? 'border border-foreground text-foreground' : 'border border-border text-muted-foreground'
                }`}>
                  {score}% Match
                  {isLowMatch && <AlertTriangle className="h-3 w-3" />}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isLowMatch && <span className="font-medium text-foreground">High risk. </span>}
                {explanation}
              </p>
              <p className="text-sm text-muted-foreground">{PARADIGM_DESCRIPTIONS[paradigm as keyof ParadigmScores]}</p>
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">{reference.description}</p>
                <a href={reference.url} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground underline hover:no-underline flex items-center gap-1 font-mono">
                  {reference.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}