/**
 * Enhanced Assessment Table with Search, Filters, Sorting, Expandable Rows
 * Used in Admin Dashboard for thesis data analysis
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PARADIGM_LABELS, type ParadigmScores } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  ArrowUpDown,
  Eye,
  FileDown,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { generatePDFReport } from '@/lib/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';

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

type SortField = 'date' | 'completion_time' | 'primary_paradigm';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function AssessmentTable({ assessments }: { assessments: AssessmentRow[] }) {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParadigm, setFilterParadigm] = useState('all');
  const [filterCompleted, setFilterCompleted] = useState('all');
  const [filterGeography, setFilterGeography] = useState('all');
  const [filterSustainabilityImpact, setFilterSustainabilityImpact] = useState('all');
  const [filterRegulatoryRisk, setFilterRegulatoryRisk] = useState('all');

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Expandable rows
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper: Delete assessment
  const handleDeleteAssessment = async (assessmentId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId);
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      alert('Failed to delete assessment. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setAssessmentToDelete(null);
    }
  };

  // Helper: Get primary paradigm
  const getPrimaryParadigm = (paradigmResults: Record<string, unknown> | null) => {
    if (!paradigmResults) return { name: 'N/A', pct: 0 };
    const pr = paradigmResults as { primary?: { paradigm?: string; pct?: number } };
    const primary = pr?.primary;
    if (primary?.paradigm) {
      return { name: primary.paradigm, pct: primary.pct || 0 };
    }
    return { name: 'N/A', pct: 0 };
  };


  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let filtered = [...assessments];

    if (searchTerm) {
      filtered = filtered.filter((a) => {
        const r = (a.responses || {}) as Record<string, unknown>;
        const demographics = String(r.userDemographics || '').toLowerCase();
        return demographics.includes(searchTerm.toLowerCase());
      });
    }

    if (filterParadigm !== 'all') {
      filtered = filtered.filter((a) => getPrimaryParadigm(a.paradigm_results).name === filterParadigm);
    }

    if (filterCompleted !== 'all') {
      const shouldBeCompleted = filterCompleted === 'completed';
      filtered = filtered.filter((a) => a.is_completed === shouldBeCompleted);
    }

    if (filterGeography !== 'all') {
      filtered = filtered.filter((a) => {
        const r = (a.responses || {}) as Record<string, unknown>;
        return r.geography === filterGeography;
      });
    }

    if (filterSustainabilityImpact !== 'all') {
      filtered = filtered.filter((a) => {
        const pr = (a.paradigm_results || {}) as Record<string, unknown>;
        const sustainability = pr.sustainability as { weightedCO2?: number } | undefined;

        if (!sustainability || sustainability.weightedCO2 === undefined) {
          return filterSustainabilityImpact === 'none';
        }

        const co2 = sustainability.weightedCO2;
        if (filterSustainabilityImpact === 'low') return co2 < 30;
        if (filterSustainabilityImpact === 'medium') return co2 >= 30 && co2 < 50;
        if (filterSustainabilityImpact === 'high') return co2 >= 50;
        return true;
      });
    }

    if (filterRegulatoryRisk !== 'all') {
      filtered = filtered.filter((a) => {
        const pr = (a.paradigm_results || {}) as Record<string, unknown>;
        const regulatory = pr.regulatory as { overallRiskLevel?: string } | undefined;

        if (!regulatory || !regulatory.overallRiskLevel) {
          return filterRegulatoryRisk === 'none';
        }

        const riskLevel = regulatory.overallRiskLevel.toLowerCase();
        return filterRegulatoryRisk === riskLevel;
      });
    }

    filtered.sort((a, b) => {
      let aVal: number = 0;
      let bVal: number = 0;

      switch (sortConfig.field) {
        case 'date':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case 'completion_time':
          aVal = a.time_to_complete_seconds || 0;
          bVal = b.time_to_complete_seconds || 0;
          break;
        case 'primary_paradigm':
          aVal = getPrimaryParadigm(a.paradigm_results).pct;
          bVal = getPrimaryParadigm(b.paradigm_results).pct;
          break;
        default:
          return 0;
      }

      const result = aVal - bVal;
      return sortConfig.direction === 'asc' ? result : -result;
    });

    return filtered;
  }, [assessments, searchTerm, filterParadigm, filterCompleted, filterGeography, filterSustainabilityImpact, filterRegulatoryRisk, sortConfig]);

  const paginatedData = processedData.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(processedData.length / pageSize);

  const toggleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      setSortConfig({ field, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ field, direction: 'desc' });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterParadigm('all');
    setFilterCompleted('all');
    setFilterGeography('all');
    setFilterSustainabilityImpact('all');
    setFilterRegulatoryRisk('all');
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-40" />;
    }
    return (
      <ArrowUpDown
        className={`h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project description..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={filterParadigm} onValueChange={(val) => { setFilterParadigm(val); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Interface Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="traditional_screen">Traditional Screen</SelectItem>
              <SelectItem value="invisible">Invisible</SelectItem>
              <SelectItem value="ai_vectorial">AI Vectorial</SelectItem>
              <SelectItem value="spatial">Spatial</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCompleted} onValueChange={(val) => { setFilterCompleted(val); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterGeography} onValueChange={(val) => { setFilterGeography(val); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Primarily Europe">Europe</SelectItem>
              <SelectItem value="Primarily United States">United States</SelectItem>
              <SelectItem value="Global (multiple regions)">Global</SelectItem>
              <SelectItem value="Internal Only">Internal Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSustainabilityImpact} onValueChange={(val) => { setFilterSustainabilityImpact(val); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Carbon Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact Levels</SelectItem>
              <SelectItem value="low">Low (&lt;30 kg CO₂)</SelectItem>
              <SelectItem value="medium">Medium (30-50 kg)</SelectItem>
              <SelectItem value="high">High (&gt;50 kg)</SelectItem>
              <SelectItem value="none">No Sustainability</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRegulatoryRisk} onValueChange={(val) => { setFilterRegulatoryRisk(val); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Regulatory Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="critical">Critical Risk</SelectItem>
              <SelectItem value="none">No Regulatory</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || filterParadigm !== 'all' || filterCompleted !== 'all' || filterGeography !== 'all' || filterSustainabilityImpact !== 'all' || filterRegulatoryRisk !== 'all') && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto">
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground px-1">
        Showing {paginatedData.length} of {processedData.length} assessments
        {processedData.length !== assessments.length && ` (filtered from ${assessments.length} total)`}
      </div>


      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>
                <button onClick={() => toggleSort('date')} className="flex items-center gap-1.5 font-semibold hover:text-foreground">
                  Date <SortIcon field="date" />
                </button>
              </TableHead>
              <TableHead>Assessment Summary</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('primary_paradigm')} className="flex items-center gap-1.5 font-semibold hover:text-foreground">
                  Primary Type <SortIcon field="primary_paradigm" />
                </button>
              </TableHead>
              
              <TableHead>
                <button onClick={() => toggleSort('completion_time')} className="flex items-center gap-1.5 font-semibold hover:text-foreground">
                  Time <SortIcon field="completion_time" />
                </button>
              </TableHead>
              <TableHead>PDF</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((assessment) => {
              const r = (assessment.responses || {}) as Record<string, unknown>;
              const primary = getPrimaryParadigm(assessment.paradigm_results);
              const demographics = String(r.userDemographics || 'N/A');
              const isExpanded = expandedId === assessment.id;

              return (
                <>
                  <TableRow key={assessment.id}>
                    {/* Date */}
                    <TableCell className="text-sm font-medium">
                      {new Date(assessment.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: '2-digit',
                      })}
                    </TableCell>

                    {/* Assessment Summary */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-sm text-primary hover:underline max-w-[200px] truncate text-left">
                              {(() => {
                                const projectName = String(r.projectName || 'Untitled Assessment');
                                return projectName.length > 40 ? projectName.substring(0, 40) + '…' : projectName;
                              })()}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{String(r.projectName || 'Untitled Assessment')}</DialogTitle>
                              <DialogDescription>Assessment Summary</DialogDescription>
                            </DialogHeader>
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">User Context</div>
                              <div className="text-sm">{demographics}</div>
                            </div>
                            {(() => {
                              const pr = (assessment.paradigm_results || {}) as Record<string, unknown>;
                              const prim = pr.primary as { paradigm?: string; pct?: number } | undefined;
                              const sec = pr.secondary as { paradigm?: string; pct?: number } | undefined;
                              const tert = pr.tertiary as { paradigm?: string; pct?: number } | undefined;
                              const vals = r.valuesRanking as string[] | undefined;

                              return (
                                <div className="space-y-5">
                                  {/* Recommendation */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recommendation</h4>
                                    <div className="space-y-1.5">
                                      {prim && (
                                        <div className="flex justify-between items-center p-2 rounded bg-muted">
                                          <span className="text-sm font-medium">{PARADIGM_LABELS[prim.paradigm as keyof ParadigmScores] || prim.paradigm}</span>
                                          <Badge variant="default">{Math.round(prim.pct || 0)}%</Badge>
                                        </div>
                                      )}
                                      {sec && (sec.pct ?? 0) > 15 && (
                                        <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                                          <span className="text-sm">{PARADIGM_LABELS[sec.paradigm as keyof ParadigmScores] || sec.paradigm}</span>
                                          <span className="text-sm text-muted-foreground">{Math.round(sec.pct || 0)}%</span>
                                        </div>
                                      )}
                                      {tert && (tert.pct ?? 0) > 10 && (
                                        <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                                          <span className="text-sm">{PARADIGM_LABELS[tert.paradigm as keyof ParadigmScores] || tert.paradigm}</span>
                                          <span className="text-sm text-muted-foreground">{Math.round(tert.pct || 0)}%</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Details */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assessment Details</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      {[
                                        ['Geography', r.geography],
                                        ['Complexity', r.taskComplexity],
                                        ['Frequency', r.frequency],
                                        ['Context', r.contextOfUse],
                                      ].map(([label, val]) => (
                                        <div key={String(label)}>
                                          <span className="text-muted-foreground">{String(label)}:</span>{' '}
                                          <span className="text-foreground">{String(val || '—')}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Values */}
                                  {vals && vals.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Design Values Priority</h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {vals.map((v, i) => (
                                          <Badge key={v} variant={i === 0 ? 'default' : 'outline'} className="text-xs">
                                            #{i + 1} {v}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* PDF Download */}
                                  {assessment.is_completed && assessment.responses && assessment.paradigm_results && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={async () => {
                                        try {
                                          await generatePDFReport({
                                            answers: assessment.responses as any,
                                            recommendation: assessment.paradigm_results as any,
                                          });
                                        } catch (error) {
                                          console.error('PDF generation failed:', error);
                                        }
                                      }}
                                    >
                                      <FileDown className="h-4 w-4 mr-1" /> Download PDF Report
                                    </Button>
                                  )}
                                </div>
                              );
                            })()}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>

                    {/* Primary Paradigm */}
                    <TableCell>
                      {primary.name !== 'N/A' ? (
                        <Badge variant="secondary">
                          {primary.name.replace(/_/g, ' ')} ({Math.round(primary.pct)}%)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>


                    {/* Completion Time */}
                    <TableCell className="text-sm">
                      {assessment.time_to_complete_seconds
                        ? `${Math.floor(assessment.time_to_complete_seconds / 60)}m ${Math.floor(assessment.time_to_complete_seconds % 60)}s`
                        : '—'}
                    </TableCell>

                    {/* PDF */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!assessment.is_completed || !assessment.responses || !assessment.paradigm_results) return;
                          try {
                            await generatePDFReport({
                              answers: assessment.responses as any,
                              recommendation: assessment.paradigm_results as any,
                            });
                          } catch (error) {
                            console.error('PDF generation failed:', error);
                          }
                        }}
                        disabled={!assessment.is_completed}
                        title={assessment.is_completed ? "Download PDF report" : "Assessment incomplete"}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="text-sm">
                      {assessment.agreement_rating ? (
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-semibold text-foreground">{assessment.agreement_rating}</span>
                          <span className="text-xs text-muted-foreground">/ 5</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAssessmentToDelete(assessment.id);
                          setDeleteConfirmOpen(true);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete assessment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>

                  </TableRow>

                  {/* Expandable detail row */}
                  {isExpanded && (
                    <TableRow key={`${assessment.id}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm">
                          {[
                            ['Geography',      String(r.geography        || '—')],
                            ['Complexity',      String(r.taskComplexity    || '—')],
                            ['Frequency',       String(r.frequency         || '—')],
                            ['Predictability',  String(r.predictability    || '—')],
                            ['Context',         String(r.contextOfUse      || '—')],
                            ['Info Type',       String(r.informationType   || '—')],
                            ['Exploration',     String(r.explorationMode   || '—')],
                            ['Error Risk',      String(r.errorConsequence  || '—')],
                            ['Control',         String(r.controlPreference || '—')],
                            ['Values',          ((r.valuesRanking as string[] | undefined) ?? []).join(' › ')],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {label}
                              </span>
                              <p className="text-foreground mt-0.5">{val || '—'}</p>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}

            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {processedData.length === 0
                    ? 'No assessments match your filters.'
                    : 'No results on this page.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-1">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmOpen(false);
          setAssessmentToDelete(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assessment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium text-foreground">
              {assessmentToDelete && (() => {
                const assessment = assessments.find(a => a.id === assessmentToDelete);
                if (!assessment) return 'Assessment not found';
                const r = (assessment.responses || {}) as Record<string, unknown>;
                return String(r.projectName || 'Untitled Assessment');
              })()}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setAssessmentToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (assessmentToDelete) handleDeleteAssessment(assessmentToDelete);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Assessment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
