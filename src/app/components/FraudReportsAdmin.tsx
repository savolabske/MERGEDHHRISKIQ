import { useEffect, useMemo, useState } from 'react';
import { PageScrollShell } from './PageScrollShell';
import { ListPageHeader, ListPageToolbar, listRowClass } from './ui/list-page';
import { SortableHeader } from './ui/sortable-header';
import { listFilterTriggerClass } from './ui/interaction';
import { applySort, type SortState } from '../lib/table-sort';
import { cn } from './ui/utils';
import { FraudReportDrawer } from './fraud/FraudReportDrawer';
import { FraudReportStatusBadge } from './fraud/FraudReportStatusBadge';
import {
  FRAUD_REPORTS_CHANGED_EVENT,
  FRAUD_STATUSES,
  fraudReporterLabel,
  loadFraudReports,
  type FraudReport,
  type FraudReportStatus,
} from '../data/fraudReportStore';

type StatusFilter = 'all' | FraudReportStatus;

function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function reportPreview(description: string): string {
  return description.replace(/\s+/g, ' ').trim();
}

export function FraudReportsAdmin() {
  const [reports, setReports] = useState<FraudReport[]>(() => loadFraudReports());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState<'status' | 'report' | 'user' | 'submitted'>>(null);

  useEffect(() => {
    const refresh = () => setReports(loadFraudReports());
    refresh();
    window.addEventListener(FRAUD_REPORTS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(FRAUD_REPORTS_CHANGED_EVENT, refresh);
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return reports.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!query) return true;

      const haystack = [item.description, fraudReporterLabel(item)].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [reports, statusFilter, searchQuery]);

  const sorted = useMemo(
    () =>
      applySort(filtered, sort, {
        status: { getValue: (item) => item.status, kind: 'text' },
        report: { getValue: (item) => item.description, kind: 'text' },
        user: { getValue: (item) => fraudReporterLabel(item), kind: 'text' },
        submitted: { getValue: (item) => item.submittedAt, kind: 'date' },
      }),
    [filtered, sort],
  );

  const openCount = reports.filter((item) => item.status !== 'closed').length;
  const selected = reports.find((item) => item.id === selectedId) ?? null;

  return (
    <>
    <PageScrollShell innerClassName="space-y-6">
      <ListPageHeader
        title="Fraud reports"
        subtitle={
          openCount === 0
            ? 'Reports filed from Risk IQ. Nothing is waiting for review.'
            : `${openCount} open ${openCount === 1 ? 'report' : 'reports'} filed from Risk IQ.`
        }
      />

      <ListPageToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search by description or reporter...',
        }}
        filters={
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className={cn(listFilterTriggerClass, 'min-w-[140px]')}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {FRAUD_STATUSES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        }
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
          <div className="col-span-2">
            <SortableHeader label="Status" column="status" kind="text" sort={sort} onSortChange={setSort} />
          </div>
          <div className="col-span-6">
            <SortableHeader label="Report" column="report" kind="text" sort={sort} onSortChange={setSort} />
          </div>
          <div className="col-span-2">
            <SortableHeader label="Reported by" column="user" kind="text" sort={sort} onSortChange={setSort} />
          </div>
          <div className="col-span-2">
            <SortableHeader
              label="Submitted"
              column="submitted"
              kind="date"
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {sorted.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No fraud reports match your search.
            </div>
          ) : (
            sorted.map((item) => {
              const isSelected = selectedId === item.id;
              const preview = reportPreview(item.description);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-haspopup="dialog"
                  aria-expanded={isSelected}
                  className={cn(
                    listRowClass,
                    'w-full text-left py-4 hover:bg-surface-row-hover cursor-pointer',
                    isSelected && 'bg-muted/50',
                  )}
                >
                  <div className="lg:col-span-2 flex items-center">
                    <FraudReportStatusBadge status={item.status} />
                  </div>
                  <div className="lg:col-span-6 min-w-0">
                    <p className="table-primary-text truncate" title={preview}>
                      {preview}
                    </p>
                  </div>
                  <div className="lg:col-span-2 min-w-0">
                    <p
                      className={cn(
                        'table-primary-text truncate',
                        item.anonymous && 'text-muted-foreground',
                      )}
                    >
                      {fraudReporterLabel(item)}
                    </p>
                  </div>
                  <div className="lg:col-span-2 min-w-0">
                    <p className="table-supporting-text truncate">{formatSubmittedAt(item.submittedAt)}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </PageScrollShell>

    <FraudReportDrawer
      report={selected}
      open={selected !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedId(null);
      }}
    />
    </>
  );
}
