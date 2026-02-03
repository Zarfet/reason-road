/**
 * Panel showing real-world case studies (successes and failures)
 * related to the recommended paradigm
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ThumbsUp, ThumbsDown, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface CaseStudy {
  name: string;
  company: string;
  year: number;
  outcome: 'success' | 'failure';
  description: string;
  keyFactors: string[];
  lessonsLearned: string;
}

interface CaseStudiesPanelProps {
  paradigm: string;
  userDemographics?: string;
}

export function CaseStudiesPanel({ paradigm, userDemographics }: CaseStudiesPanelProps) {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaseStudies = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('case-studies', {
        body: { paradigm, userDemographics },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setCases(data?.cases || []);
    } catch (err) {
      console.error('Failed to fetch case studies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load case studies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, [paradigm, userDemographics]);

  const successes = cases.filter(c => c.outcome === 'success');
  const failures = cases.filter(c => c.outcome === 'failure');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="nexus-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            Real-World Case Studies
            {!loading && cases.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cases.length} retrieved)
              </span>
            )}
          </h2>
          {!loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchCaseStudies}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Finding relevant case studies...
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchCaseStudies}>
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No case studies found.
          </p>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="space-y-6">
            {/* Failures Section */}
            {failures.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-destructive flex items-center gap-2 mb-3">
                  <ThumbsDown className="h-4 w-4" />
                  Projects to Learn From (Failures)
                </h3>
                <div className="space-y-3">
                  {failures.map((study, index) => (
                    <CaseStudyCard key={`failure-${index}`} study={study} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Successes Section */}
            {successes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2 mb-3">
                  <ThumbsUp className="h-4 w-4" />
                  Success Stories
                </h3>
                <div className="space-y-3">
                  {successes.map((study, index) => (
                    <CaseStudyCard key={`success-${index}`} study={study} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground text-center pt-2 italic">
              AI-generated case studies based on your paradigm context. Verify details independently before making decisions.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${study.name} ${study.company} ${study.outcome}`)}`;
  
  return (
    <motion.div
      className={`p-4 rounded-lg border transition-colors ${
        study.outcome === 'success' 
          ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' 
          : 'bg-destructive/5 border-destructive/20 hover:border-destructive/40'
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground text-sm">
              {study.name}
            </h4>
            <Badge 
              variant={study.outcome === 'success' ? 'default' : 'destructive'} 
              className="text-xs"
            >
              {study.outcome === 'success' ? 'Success' : 'Failure'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {study.company} • {study.year}
          </p>
          <p className="text-xs text-foreground/80 mb-2">
            {study.description}
          </p>
          
          <div className="mb-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Key Factors:</p>
            <ul className="text-xs text-foreground/70 list-disc list-inside">
              {study.keyFactors.map((factor, i) => (
                <li key={i}>{factor}</li>
              ))}
            </ul>
          </div>
          
          <p className="text-xs text-accent">
            → Lesson: {study.lessonsLearned}
          </p>
        </div>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 mt-0.5 p-1 rounded hover:bg-accent/10 transition-colors"
          title="Search for more info"
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-accent" />
        </a>
      </div>
    </motion.div>
  );
}
