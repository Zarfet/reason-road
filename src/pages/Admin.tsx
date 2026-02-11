/**
 * NEXUS - Admin Dashboard
 * 
 * Analytics dashboard for thesis data collection.
 * Protected by user_roles table (admin role required).
 * Features: stats, assessment table, CSV export.
 */

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navbar } from '@/components/layout/Navbar';
import {
  Download,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  FileText,
} from 'lucide-react';
import { PARADIGM_LABELS, type ParadigmScores } from '@/types/assessment';

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

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssessments(data as unknown as AssessmentRow[]);
    }
    setLoading(false);
  }

  // Compute stats from loaded data
  const stats = useMemo(() => {
    const total = assessments.length;
    const completed = assessments.filter((a) => a.is_completed).length;
    const withTime = assessments.filter((a) => a.time_to_complete_seconds);
    const avgTime =
      withTime.length > 0
        ? withTime.reduce((s, a) => s + (a.time_to_complete_seconds || 0), 0) / withTime.length
        : 0;
    const pdfCount = assessments.filter((a) => a.pdf_downloaded).length;

    // Paradigm distribution
    const paradigmCounts: Record<string, number> = {};
    assessments.forEach((a) => {
      if (!a.paradigm_results) return;
      const results = a.paradigm_results as unknown as { primary?: { paradigm?: string } };
      const primary = results?.primary?.paradigm;
      if (primary) {
        paradigmCounts[primary] = (paradigmCounts[primary] || 0) + 1;
      }
    });

    return { total, completed, avgTime, pdfCount, paradigmCounts };
  }, [assessments]);

  function exportCSV() {
    const headers = [
      'id',
      'date',
      'completed',
      'time_seconds',
      'pdf_downloaded',
      'agreement_rating',
      'project_name',
      'user_demographics',
      'geography',
      'task_complexity',
      'frequency',
      'predictability',
      'context_of_use',
      'information_type',
      'exploration_mode',
      'error_consequence',
      'control_preference',
      'values_ranking',
      'primary_paradigm',
      'primary_pct',
    ];

    const rows = assessments.map((a) => {
      const r = (a.responses || {}) as Record<string, unknown>;
      const pr = (a.paradigm_results || {}) as Record<string, unknown>;
      const primary = pr?.primary as { paradigm?: string; pct?: number } | undefined;

      return [
        a.id,
        a.created_at?.split('T')[0] || '',
        a.is_completed,
        a.time_to_complete_seconds || '',
        a.pdf_downloaded || false,
        a.agreement_rating || '',
        r.projectName || '',
        `"${String(r.userDemographics || '').replace(/"/g, '""')}"`,
        r.geography || '',
        r.taskComplexity || '',
        r.frequency || '',
        r.predictability || '',
        r.contextOfUse || '',
        r.informationType || '',
        r.explorationMode || '',
        r.errorConsequence || '',
        r.controlPreference || '',
        `"${JSON.stringify(r.valuesRanking || [])}"`,
        primary?.paradigm || '',
        primary?.pct || '',
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const json = JSON.stringify(assessments, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Thesis data collection &amp; pattern analysis
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportJSON}>
              <FileText className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" /> Total Assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Completion Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Avg Time
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
                <Download className="h-4 w-4" /> PDF Downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats.pdfCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Paradigm Distribution */}
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
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Assessments ({stats.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Primary Paradigm</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>PDF</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((a) => {
                  const r = (a.responses || {}) as Record<string, unknown>;
                  const pr = (a.paradigm_results || {}) as Record<string, unknown>;
                  const primary = pr?.primary as { paradigm?: string; pct?: number } | undefined;
                  const demographics = String(r.userDemographics || 'N/A');

                  return (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm">
                        {new Date(a.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm" title={demographics}>
                        {demographics}
                      </TableCell>
                      <TableCell>
                        {primary?.paradigm ? (
                          <Badge variant="outline">
                            {PARADIGM_LABELS[primary.paradigm as keyof ParadigmScores] || primary.paradigm}{' '}
                            ({Math.round(primary.pct || 0)}%)
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.time_to_complete_seconds
                          ? `${Math.floor(a.time_to_complete_seconds / 60)}m`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {a.pdf_downloaded ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.agreement_rating ? `${a.agreement_rating}/5` : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {assessments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No assessments yet. Data will appear as users complete assessments.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
