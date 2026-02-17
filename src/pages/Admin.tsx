/**
 * NEXUS - Admin Dashboard
 * Thesis data collection & pattern analysis.
 * Protected by user_roles table (admin role required).
 */

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssessmentTable } from '@/components/admin/AssessmentTable';
import { Navbar } from '@/components/layout/Navbar';
import {
  Download, RefreshCw, Users, CheckCircle, BarChart3, FileText,
  Star, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, FileDown,
} from 'lucide-react';
import { PARADIGM_LABELS, type ParadigmScores } from '@/types/assessment';

// ─── Types ─────────────────────────────────────────────────────────────────

interface AssessmentRow {
  id: string;
  created_at: string;
  responses: Record<string, unknown> | null;
  paradigm_results: Record<string, unknown> | null;
  is_completed: boolean;
  time_to_complete_seconds: number | null;
  pdf_downloaded: boolean | null;
  agreement_rating: number | null;
  share_token: string | null;
}

interface RatingRow {
  id: string;
  assessment_id: string;
  created_at: string;
  rating: number;
  feedback_text: string | null;
  accuracy_rating: number | null;
  clarity_rating: number | null;
  usefulness_rating: number | null;
  would_recommend: boolean | null;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState<{
    avg: number; count: number;
    accuracy: number; clarity: number; usefulness: number; wouldRecommend: number;
  }>({ avg: 0, count: 0, accuracy: 0, clarity: 0, usefulness: 0, wouldRecommend: 0 });

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate('/');
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);
    const [assessRes, ratingsRes] = await Promise.all([
      supabase.from('assessments').select('*').order('created_at', { ascending: false }),
      supabase.from('assessment_ratings').select('*').order('created_at', { ascending: false }),
    ]);

    if (!assessRes.error && assessRes.data) {
      setAssessments(assessRes.data as unknown as AssessmentRow[]);
    }
    if (!ratingsRes.error && ratingsRes.data && ratingsRes.data.length > 0) {
      const data = ratingsRes.data as RatingRow[];
      setRatings(data);
      const avg = (arr: (number | null)[]) => {
        const valid = arr.filter((x): x is number => x !== null && x > 0);
        return valid.length > 0
          ? Math.round((valid.reduce((s, v) => s + v, 0) / valid.length) * 10) / 10
          : 0;
      };
      setRatingStats({
        avg:            avg(data.map(r => r.rating)),
        count:          data.length,
        accuracy:       avg(data.map(r => r.accuracy_rating)),
        clarity:        avg(data.map(r => r.clarity_rating)),
        usefulness:     avg(data.map(r => r.usefulness_rating)),
        wouldRecommend: data.filter(r => r.would_recommend === true).length,
      });
    }
    setLoading(false);
  }

  // ─── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total     = assessments.length;
    const completed = assessments.filter(a => a.is_completed).length;
    const withTime  = assessments.filter(a => a.time_to_complete_seconds);
    const avgTime   = withTime.length > 0
      ? withTime.reduce((s, a) => s + (a.time_to_complete_seconds || 0), 0) / withTime.length
      : 0;
    const pdfCount = assessments.filter(a => a.pdf_downloaded).length;

    // Primary paradigm distribution
    const paradigmCounts: Record<string, number> = {};
    assessments.forEach(a => {
      const pr = a.paradigm_results as { primary?: { paradigm?: string } } | null;
      const p = pr?.primary?.paradigm;
      if (p) paradigmCounts[p] = (paradigmCounts[p] || 0) + 1;
    });

    // Top value (#1 ranking) distribution
    const valueCounts: Record<string, number> = {};
    assessments.forEach(a => {
      const r = (a.responses || {}) as Record<string, unknown>;
      const top = (r.valuesRanking as string[] | undefined)?.[0];
      if (top) valueCounts[top] = (valueCounts[top] || 0) + 1;
    });

    // Agreement by confidence cross-analysis (thesis validation)
    const agreementByConfidence = {
      high: { agree: 0, total: 0 },
      med:  { agree: 0, total: 0 },
      low:  { agree: 0, total: 0 },
    };
    assessments
      .filter(a => a.agreement_rating !== null && a.paradigm_results)
      .forEach(a => {
        const pr = a.paradigm_results as { primary?: { pct?: number }; secondary?: { pct?: number } } | null;
        const diff = (pr?.primary?.pct ?? 0) - (pr?.secondary?.pct ?? 0);
        const bucket = diff >= 30 ? 'high' : diff >= 15 ? 'med' : 'low';
        agreementByConfidence[bucket].total++;
        if ((a.agreement_rating ?? 0) >= 4) agreementByConfidence[bucket].agree++;
      });

    return { total, completed, avgTime, pdfCount, paradigmCounts, valueCounts, agreementByConfidence };
  }, [assessments]);

  // ─── CSV Export ─────────────────────────────────────────────────────────

  function exportCSV() {
    const headers = [
      'id', 'date', 'completed', 'time_seconds', 'pdf_downloaded', 'agreement_rating',
      'project_name', 'user_demographics', 'geography',
      'task_complexity', 'frequency', 'predictability', 'context_of_use',
      'information_type', 'exploration_mode', 'error_consequence', 'control_preference',
      'value_1', 'value_2', 'value_3', 'value_4', 'value_5',
      'primary_paradigm', 'primary_pct',
      'secondary_paradigm', 'secondary_pct',
      'tertiary_paradigm', 'tertiary_pct',
      'score_traditional_screen', 'score_invisible', 'score_ai_vectorial', 'score_spatial', 'score_voice',
    ];

    const q = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`;

    const rows = assessments.map(a => {
      const r  = (a.responses || {}) as Record<string, unknown>;
      const pr = (a.paradigm_results || {}) as {
        primary?:   { paradigm?: string; pct?: number };
        secondary?: { paradigm?: string; pct?: number };
        tertiary?:  { paradigm?: string; pct?: number };
        allScores?: { traditional_screen?: number; invisible?: number; ai_vectorial?: number; spatial?: number; voice?: number };
      };
      const vals = (r.valuesRanking as string[] | undefined) ?? [];

      return [
        a.id,
        a.created_at?.split('T')[0] || '',
        a.is_completed,
        a.time_to_complete_seconds || '',
        a.pdf_downloaded || false,
        a.agreement_rating || '',
        q(r.projectName),
        q(r.userDemographics),
        r.geography || '',
        r.taskComplexity || '',
        r.frequency || '',
        r.predictability || '',
        r.contextOfUse || '',
        r.informationType || '',
        r.explorationMode || '',
        r.errorConsequence || '',
        r.controlPreference || '',
        vals[0] || '', vals[1] || '', vals[2] || '', vals[3] || '', vals[4] || '',
        pr.primary?.paradigm   || '', pr.primary?.pct   || '',
        pr.secondary?.paradigm || '', pr.secondary?.pct || '',
        pr.tertiary?.paradigm  || '', pr.tertiary?.pct  || '',
        pr.allScores?.traditional_screen ?? '',
        pr.allScores?.invisible          ?? '',
        pr.allScores?.ai_vectorial       ?? '',
        pr.allScores?.spatial            ?? '',
        pr.allScores?.voice              ?? '',
      ].join(',');
    });

    download([headers.join(','), ...rows].join('\n'), 'text/csv', `nexus-data-${today()}.csv`);
  }

  function exportRatingsCSV() {
    const headers = [
      'id', 'assessment_id', 'date', 'rating',
      'accuracy_rating', 'clarity_rating', 'usefulness_rating', 'would_recommend', 'feedback_text',
      'user_demographics', 'primary_paradigm',
    ];

    const q = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`;

    const rows = ratings.map(r => {
      const a   = assessments.find(ass => ass.id === r.assessment_id);
      const res = (a?.responses || {}) as Record<string, unknown>;
      const pr  = (a?.paradigm_results || {}) as { primary?: { paradigm?: string } } | null;
      return [
        r.id, r.assessment_id,
        r.created_at?.split('T')[0] || '',
        r.rating,
        r.accuracy_rating  ?? '',
        r.clarity_rating   ?? '',
        r.usefulness_rating ?? '',
        r.would_recommend  ?? '',
        q(r.feedback_text),
        q(res.userDemographics),
        pr?.primary?.paradigm || '',
      ].join(',');
    });

    download([headers.join(','), ...rows].join('\n'), 'text/csv', `nexus-ratings-${today()}.csv`);
  }

  function exportJSON() {
    download(JSON.stringify(assessments, null, 2), 'application/json', `nexus-data-${today()}.json`);
  }

  function today() { return new Date().toISOString().split('T')[0]; }
  function download(content: string, type: string, filename: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const completionRate = stats.total > 0
    ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  const feedbackWithText = ratings.filter(r => r.feedback_text?.trim());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Thesis data collection &amp; pattern analysis</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-1" /> Assessments CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportRatingsCSV}>
              <FileDown className="h-4 w-4 mr-1" /> Ratings CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportJSON}>
              <FileText className="h-4 w-4 mr-1" /> JSON
            </Button>
          </div>
        </div>

        {/* ── Primary stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" /> Total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">{stats.completed} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Avg Time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {Math.floor(stats.avgTime / 60)}m {Math.floor(stats.avgTime % 60)}s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> PDF Downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats.pdfCount}</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? ((stats.pdfCount / stats.total) * 100).toFixed(0) : 0}% of completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Star className="h-4 w-4" /> Avg Rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {ratingStats.count > 0 ? `${ratingStats.avg} ⭐` : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">
                {ratingStats.count > 0 ? `${ratingStats.count} ratings` : 'No ratings yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Feedback sub-metrics ── */}
        {ratingStats.count > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Accuracy', value: ratingStats.accuracy },
              { label: 'Clarity', value: ratingStats.clarity },
              { label: 'Usefulness', value: ratingStats.usefulness },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardDescription>{label} Rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{value > 0 ? `${value} / 5` : 'N/A'}</p>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Would Recommend</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {ratingStats.count > 0
                    ? `${Math.round((ratingStats.wouldRecommend / ratingStats.count) * 100)}%`
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ratingStats.wouldRecommend} of {ratingStats.count}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Paradigm distribution ── */}
        {Object.keys(stats.paradigmCounts).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Primary Paradigm Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.paradigmCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([paradigm, count]) => (
                    <div key={paradigm} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                      <span className="text-sm font-medium text-foreground">
                        {PARADIGM_LABELS[paradigm as keyof ParadigmScores] || paradigm}
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        ({stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Top values distribution ── */}
        {Object.keys(stats.valueCounts).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Top Design Value (#1 Priority)</CardTitle>
              <CardDescription>Most frequently ranked first by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.valueCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([value, count]) => {
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={value} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-28 shrink-0">{value}</span>
                        <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full bg-accent/70 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-20 text-right shrink-0">
                          {count} ({Math.round(pct)}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Agreement vs Confidence (thesis validation) ── */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Agreement Rate by Confidence Level
            </CardTitle>
            <CardDescription>
              Does higher algorithmic confidence (score gap) correlate with user agreement? — Thesis validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessments.filter(a => a.agreement_rating !== null).length === 0 ? (
              <p className="text-sm text-muted-foreground">No agreement ratings collected yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                {(
                  [
                    { key: 'high', label: 'High Confidence', sub: '≥30pt gap' },
                    { key: 'med',  label: 'Moderate',        sub: '15–29pt gap' },
                    { key: 'low',  label: 'Low Confidence',  sub: '<15pt gap' },
                  ] as const
                ).map(({ key, label, sub }) => {
                  const b = stats.agreementByConfidence[key];
                  const rate = b.total > 0 ? Math.round((b.agree / b.total) * 100) : null;
                  const color = key === 'high' ? 'text-accent' : key === 'med' ? 'text-amber-500' : 'text-destructive';
                  return (
                    <div key={key} className="p-4 rounded-lg border bg-card">
                      <p className={`text-3xl font-bold ${color}`}>{rate !== null ? `${rate}%` : '—'}</p>
                      <p className="text-sm font-medium text-foreground mt-1">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                      <p className="text-xs text-muted-foreground mt-1">{b.total} assessments</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Feedback comments ── */}
        {feedbackWithText.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Feedback ({feedbackWithText.length} comments)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackWithText.map(r => {
                  const a   = assessments.find(ass => ass.id === r.assessment_id);
                  const res = (a?.responses || {}) as Record<string, unknown>;
                  return (
                    <div key={r.id} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-sm ${s <= r.rating ? 'text-amber-400' : 'text-muted-foreground/30'}`}>★</span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {r.would_recommend === true && (
                            <Badge variant="outline" className="text-xs">
                              <ThumbsUp className="h-3 w-3 mr-1" /> Recommends
                            </Badge>
                          )}
                          {r.would_recommend === false && (
                            <Badge variant="outline" className="text-xs">
                              <ThumbsDown className="h-3 w-3 mr-1" /> Doesn't recommend
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-foreground italic">"{r.feedback_text}"</p>
                      {res.userDemographics && (
                        <p className="text-xs text-muted-foreground mt-2">
                          — {String(res.userDemographics).substring(0, 80)}
                          {String(res.userDemographics).length > 80 ? '…' : ''}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Assessments table ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Assessments ({stats.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentTable assessments={assessments} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
