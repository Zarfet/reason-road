/**
 * Enhanced Assessment Table with Search, Filters, Sorting
 * Used in Admin Dashboard for thesis data analysis
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import {
  Search,
  ArrowUpDown,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Leaf,
  X,
} from 'lucide-react';

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
  const [filterSustainability, setFilterSustainability] = useState<boolean | null>(null);
  const [filterRegulatory, setFilterRegulatory] = useState<boolean | null>(null);

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

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

  // Helper: Check if sustainability report shown
  const hasSustainabilityReport = (assessment: AssessmentRow) => {
    const r = (assessment.responses || {}) as Record<string, unknown>;
    const valuesRanking = r.valuesRanking as string[] | undefined;
    if (!valuesRanking) return false;
    const sustainabilityRank = valuesRanking.indexOf('Sustainability');
    return sustainabilityRank >= 0 && sustainabilityRank <= 2;
  };

  // Helper: Check if regulatory impact shown
  const hasRegulatoryImpact = (assessment: AssessmentRow) => {
    const r = (assessment.responses || {}) as Record<string, unknown>;
    const geography = r.geography as string | undefined;
    return geography === 'Primarily Europe' || geography === 'Global (multiple regions)';
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let filtered = [...assessments];

    // Search filter (demographics)
    if (searchTerm) {
      filtered = filtered.filter((a) => {
        const r = (a.responses || {}) as Record<string, unknown>;
        const demographics = String(r.userDemographics || '').toLowerCase();
        return demographics.includes(searchTerm.toLowerCase());
      });
    }

    // Paradigm filter
    if (filterParadigm !== 'all') {
      filtered = filtered.filter((a) => {
        const primary = getPrimaryParadigm(a.paradigm_results);
        return primary.name === filterParadigm;
      });
    }

    // Completed filter
    if (filterCompleted !== 'all') {
      const shouldBeCompleted = filterCompleted === 'completed';
      filtered = filtered.filter((a) => a.is_completed === shouldBeCompleted);
    }

    // Geography filter
    if (filterGeography !== 'all') {
      filtered = filtered.filter((a) => {
        const r = (a.responses || {}) as Record<string, unknown>;
        return r.geography === filterGeography;
      });
    }

    // Sustainability filter
    if (filterSustainability !== null) {
      filtered = filtered.filter(
        (a) => hasSustainabilityReport(a) === filterSustainability
      );
    }

    // Regulatory filter
    if (filterRegulatory !== null) {
      filtered = filtered.filter(
        (a) => hasRegulatoryImpact(a) === filterRegulatory
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

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

      const result = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));

      return sortConfig.direction === 'asc' ? result : -result;
    });

    return filtered;
  }, [
    assessments,
    searchTerm,
    filterParadigm,
    filterCompleted,
    filterGeography,
    filterSustainability,
    filterRegulatory,
    sortConfig,
  ]);

  // Paginated data
  const paginatedData = processedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(processedData.length / pageSize);

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      setSortConfig({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ field, direction: 'desc' });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterParadigm('all');
    setFilterCompleted('all');
    setFilterGeography('all');
    setFilterSustainability(null);
    setFilterRegulatory(null);
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-40" />;
    }
    return (
      <ArrowUpDown
        className={`h-4 w-4 transition-transform ${
          sortConfig.direction === 'desc' ? 'rotate-180' : ''
        }`}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by demographics..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Paradigm Filter */}
          <Select value={filterParadigm} onValueChange={(val) => {
            setFilterParadigm(val);
            setPage(1);
          }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Paradigm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Paradigms</SelectItem>
              <SelectItem value="traditional_screen">Traditional Screen</SelectItem>
              <SelectItem value="invisible">Invisible</SelectItem>
              <SelectItem value="ai_vectorial">AI Vectorial</SelectItem>
              <SelectItem value="spatial">Spatial</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
            </SelectContent>
          </Select>

          {/* Completed Filter */}
          <Select value={filterCompleted} onValueChange={(val) => {
            setFilterCompleted(val);
            setPage(1);
          }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>

          {/* Geography Filter */}
          <Select value={filterGeography} onValueChange={(val) => {
            setFilterGeography(val);
            setPage(1);
          }}>
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

          {/* Sustainability Filter */}
          <Button
            variant={filterSustainability === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilterSustainability(filterSustainability === true ? null : true);
              setPage(1);
            }}
          >
            <Leaf className="h-4 w-4" />
            Sustainability
          </Button>

          {/* Regulatory Filter */}
          <Button
            variant={filterRegulatory === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFilterRegulatory(filterRegulatory === true ? null : true);
              setPage(1);
            }}
          >
            <Globe className="h-4 w-4" />
            Regulatory
          </Button>

          {/* Clear Filters */}
          {(searchTerm || 
            filterParadigm !== 'all' || 
            filterCompleted !== 'all' || 
            filterGeography !== 'all' || 
            filterSustainability !== null || 
            filterRegulatory !== null) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground px-1">
        Showing {paginatedData.length} of {processedData.length} assessments
        {processedData.length !== assessments.length &&
          ` (filtered from ${assessments.length} total)`}
      </div>

      {/* Flag Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-muted/30 rounded border text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-accent" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-destructive" />
          <span>Abandoned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4" style={{ color: 'hsl(38, 92%, 50%)' }} />
          <span>Warnings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Leaf className="h-4 w-4" style={{ color: 'hsl(142, 71%, 45%)' }} />
          <span>Sustainability</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4" style={{ color: 'hsl(217, 91%, 60%)' }} />
          <span>Regulatory</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {/* Date - Sortable */}
              <TableHead>
                <button
                  onClick={() => toggleSort('date')}
                  className="flex items-center gap-1.5 font-semibold hover:text-foreground"
                >
                  Date
                  <SortIcon field="date" />
                </button>
              </TableHead>

              {/* Demographics */}
              <TableHead>Demographics</TableHead>

              {/* Primary Paradigm - Sortable */}
              <TableHead>
                <button
                  onClick={() => toggleSort('primary_paradigm')}
                  className="flex items-center gap-1.5 font-semibold hover:text-foreground"
                >
                  Primary
                  <SortIcon field="primary_paradigm" />
                </button>
              </TableHead>

              {/* Flags */}
              <TableHead>Flags</TableHead>

              {/* Completion Time - Sortable */}
              <TableHead>
                <button
                  onClick={() => toggleSort('completion_time')}
                  className="flex items-center gap-1.5 font-semibold hover:text-foreground"
                >
                  Time
                  <SortIcon field="completion_time" />
                </button>
              </TableHead>

              {/* Actions */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((assessment) => {
              const r = (assessment.responses || {}) as Record<string, unknown>;
              const primary = getPrimaryParadigm(assessment.paradigm_results);
              const demographics = String(r.userDemographics || 'N/A');
              const hasSustainability = hasSustainabilityReport(assessment);
              const hasRegulatory = hasRegulatoryImpact(assessment);

              return (
                <TableRow key={assessment.id}>
                  {/* Date */}
                  <TableCell className="text-sm font-medium">
                    {new Date(assessment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    })}
                  </TableCell>

                  {/* Demographics - Dialog for full text */}
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-sm text-primary hover:underline max-w-[200px] truncate text-left">
                          {demographics.length > 40 
                            ? demographics.substring(0, 40) + '…'
                            : demographics}
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>User Demographics</DialogTitle>
                          <DialogDescription>
                            Full demographic description from assessment
                          </DialogDescription>
                        </DialogHeader>
                        <div className="p-3 bg-muted rounded text-sm">
                          {demographics}
                        </div>
                      </DialogContent>
                    </Dialog>
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

                  {/* Flags */}
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {/* Completion Status */}
                      <div title={assessment.is_completed ? "Completed" : "Abandoned"}>
                        {assessment.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>

                      {/* Sustainability Report */}
                      {hasSustainability && (
                        <div title="Sustainability Report">
                          <Leaf className="h-4 w-4" style={{ color: 'hsl(142, 71%, 45%)' }} />
                        </div>
                      )}

                      {/* Regulatory Impact */}
                      {hasRegulatory && (
                        <div title="Regulatory Impact">
                          <Globe className="h-4 w-4" style={{ color: 'hsl(217, 91%, 60%)' }} />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Completion Time */}
                  <TableCell className="text-sm">
                    {assessment.time_to_complete_seconds
                      ? `${Math.floor(assessment.time_to_complete_seconds / 60)}m ${Math.floor(
                          assessment.time_to_complete_seconds % 60
                        )}s`
                      : '—'}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(`/results/${assessment.id}`, '_blank')
                      }
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
