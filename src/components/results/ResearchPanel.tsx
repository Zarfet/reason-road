/**
 * Panel showing supporting academic research
 * 
 * Features:
 * - LocalStorage cache to avoid refetching
 * - AI-generated paper suggestions
 * - External links via window.open() for preview compatibility
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
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

// Cache key generator
function getCacheKey(paradigm: string, userDemographics?: string): string {
  const demographics = userDemographics?.trim() || 'general';
  return `nexus_research_${paradigm}_${demographics}`.toLowerCase().replace(/\s+/g, '_');
}

// Cache duration: 7 days
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedData {
  papers: ResearchPaper[];
  timestamp: number;
}

function getCachedPapers(paradigm: string, userDemographics?: string): ResearchPaper[] | null {
  try {
    const key = getCacheKey(paradigm, userDemographics);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const data: CachedData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data.papers;
  } catch {
    return null;
  }
}

function setCachedPapers(paradigm: string, userDemographics: string | undefined, papers: ResearchPaper[]): void {
  try {
    const key = getCacheKey(paradigm, userDemographics);
    const data: CachedData = {
      papers,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function ResearchPanel({ paradigm, userDemographics }: ResearchPanelProps) {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchResearch = useCallback(async (forceRefresh = false) => {
    // Check localStorage cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedPapers(paradigm, userDemographics);
      if (cached && cached.length > 0) {
        setPapers(cached);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setFromCache(false);

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

      const fetchedPapers = data?.papers || [];
      setPapers(fetchedPapers);
      
      // Cache the results
      if (fetchedPapers.length > 0) {
        setCachedPapers(paradigm, userDemographics, fetchedPapers);
      }
    } catch (err) {
      console.error('Failed to fetch research:', err);
      setError(err instanceof Error ? err.message : 'Failed to load research');
    } finally {
      setLoading(false);
    }
  }, [paradigm, userDemographics]);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  const handleRefresh = () => {
    fetchResearch(true);
  };

  const handleOpenScholar = (title: string) => {
    const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="nexus-card">
        <div className="flex items-center justify-between mb-4">
          {!loading && papers.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {papers.length} retrieved{fromCache ? ', cached' : ''}
            </span>
          )}
          {!loading && papers.length === 0 && <span />}
          {!loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-muted-foreground hover:text-foreground"
              title="Refresh research papers"
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
            <Button variant="outline" size="sm" onClick={() => fetchResearch(true)}>
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
            {papers.map((paper, index) => (
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
                  <button
                    type="button"
                    onClick={() => handleOpenScholar(paper.title)}
                    className="shrink-0 mt-0.5 p-1.5 rounded hover:bg-accent/10 transition-colors cursor-pointer"
                    title="Search on Google Scholar"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-accent" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            <p className="text-xs text-muted-foreground text-center pt-2 italic">
              AI-generated suggestions based on your paradigm context. These are not sourced from a curated database—verify citations via Google Scholar links.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
