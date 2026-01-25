/**
 * Panel showing supporting academic research
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ResearchPaper {
  title: string;
  authors: string;
  year: number;
  venue: string;
  abstract: string;
  relevance: string;
}

interface ResearchPanelProps {
  paradigm: string;
  userDemographics?: string;
}

export function ResearchPanel({ paradigm, userDemographics }: ResearchPanelProps) {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('research-papers', {
        body: { paradigm, userDemographics },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setPapers(data?.papers || []);
    } catch (err) {
      console.error('Failed to fetch research:', err);
      setError(err instanceof Error ? err.message : 'Failed to load research');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, [paradigm, userDemographics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="nexus-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            Supporting Research
          </h2>
          {!loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchResearch}
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
                Finding relevant academic papers...
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchResearch}>
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && papers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No research papers found.
          </p>
        )}

        {!loading && !error && papers.length > 0 && (
          <div className="space-y-4">
            {papers.map((paper, index) => {
              const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`;
              
              return (
                <motion.div
                  key={index}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-accent/30 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm leading-tight mb-1">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {paper.authors} • {paper.year} • {paper.venue}
                      </p>
                      <p className="text-xs text-foreground/80 mb-2">
                        {paper.abstract}
                      </p>
                      <p className="text-xs text-accent">
                        → {paper.relevance}
                      </p>
                    </div>
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 mt-0.5 p-1 rounded hover:bg-accent/10 transition-colors"
                      title="Search on Google Scholar"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-accent" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
            
            <p className="text-xs text-muted-foreground text-center pt-2 italic">
              Papers suggested by AI based on your assessment context
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
