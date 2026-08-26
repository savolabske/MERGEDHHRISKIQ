import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Search, Clock, SlidersHorizontal, Plus, FilePenLine, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AidFlowScrollytelling } from '../features/insights/aid-flow';
import { MigrationDataScrollytelling } from './MigrationDataScrollytelling';
import { SomaliaJointFundScrollytelling } from './SomaliaJointFundScrollytelling';
import { PageScrollShell } from './PageScrollShell';
import { ReportDetailShell } from '../features/insights/shared/ReportDetailShell';
import {
  createDefaultReportSkeleton,
  linkReportResource,
  loadManagedReports,
  saveManagedReports,
  MANAGED_REPORTS_CHANGED_EVENT,
  type ManagedReport,
} from '../data/reportsAdminMock';
import {
  buildReportsHubCards,
  hubIdToActiveBuiltinReport,
} from '../data/reportsHubCatalog';
import {
  buildPreferencesFromVisibleOrder,
  loadReportsHubPreferences,
  partitionReportsByPreferences,
  preferencesDifferFromDefault,
  pruneReportsHubPreferences,
  resetReportsHubPreferences,
  saveReportsHubPreferences,
  REPORTS_HUB_LAYOUT_CHANGED_EVENT,
  type ReportsHubPreferences,
} from '../data/reportsHubPreferences';
import {
  clearManageReportsReturnContext,
  loadManageReportsReturnContext,
  saveReportResourceLinkContext,
  type ReportResourceLinkContext,
} from '../data/reportResourceLink';
import { getOwnedMyResources, loadPlatformResources } from '../data/resourcesMock';
import { Button } from './ui/button';
import { ManagedReportView } from './reports/ManagedReportView';
import { ReportHubCard } from './reports/ReportHubCard';
import { ReportsCustomizeBar } from './reports/ReportsCustomizeBar';
import { ReportsHiddenSection } from './reports/ReportsHiddenSection';
import { ReportsSortableGrid } from './reports/ReportsSortableGrid';
import { ReportAddModal } from './manage-reports/ReportAddModal';
import { ReportAttachMyResourceModal } from './manage-reports/ReportAttachMyResourceModal';
import { ReportBuilder } from './manage-reports/ReportBuilder';
import type { ReportHubCardData } from './reports/reportHubTypes';

/** Built-in scrollytelling keys, or a managed report id. */
export type ActiveReport = 'aid-flow' | 'migration-data' | 'somalia-joint-fund' | string | null;

function buildReportCards(): ReportHubCardData[] {
  return buildReportsHubCards();
}

function matchesSearch(report: ReportHubCardData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    report.title.toLowerCase().includes(q) || report.description.toLowerCase().includes(q)
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ReportsProps {
  initialReport?: ActiveReport;
  onInitialReportConsumed?: () => void;
  onReportOpen?: () => void;
  onReportClose?: () => void;
  onCreateResourceForReport?: (ctx: ReportResourceLinkContext) => void;
}

export function Reports({
  initialReport = null,
  onInitialReportConsumed,
  onReportOpen,
  onReportClose,
  onCreateResourceForReport,
}: ReportsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);
  const [catalogCards, setCatalogCards] = useState<ReportHubCardData[]>(() => buildReportCards());
  const [savedPrefs, setSavedPrefs] = useState<ReportsHubPreferences>(() => loadReportsHubPreferences());
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draftVisible, setDraftVisible] = useState<ReportHubCardData[]>([]);
  const [draftHidden, setDraftHidden] = useState<ReportHubCardData[]>([]);

  const [reports, setReports] = useState<ManagedReport[]>(() => loadManagedReports());
  const [showAddModal, setShowAddModal] = useState(false);
  const [builderReportId, setBuilderReportId] = useState<string | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [hubView, setHubView] = useState<'catalog' | 'drafts'>('catalog');
  const [savedSnapshots, setSavedSnapshots] = useState<Record<string, string>>(() =>
    Object.fromEntries(loadManagedReports().map((r) => [r.id, JSON.stringify(r)])),
  );

  const myResourceOptions = useMemo(
    () =>
      getOwnedMyResources(loadPlatformResources()).map((r) => ({
        id: r.id,
        title: r.title,
      })),
    [showAddModal, showAttachModal, builderReportId],
  );

  const refreshCatalog = useCallback(() => {
    const cards = buildReportCards();
    setCatalogCards(cards);
    setReports(loadManagedReports());
    setSavedPrefs((prev) => pruneReportsHubPreferences(prev, cards.map((c) => c.id)));
  }, []);

  useEffect(() => {
    refreshCatalog();
    const syncPrefs = () => setSavedPrefs(loadReportsHubPreferences());
    window.addEventListener('focus', refreshCatalog);
    window.addEventListener(MANAGED_REPORTS_CHANGED_EVENT, refreshCatalog);
    window.addEventListener(REPORTS_HUB_LAYOUT_CHANGED_EVENT, syncPrefs);
    return () => {
      window.removeEventListener('focus', refreshCatalog);
      window.removeEventListener(MANAGED_REPORTS_CHANGED_EVENT, refreshCatalog);
      window.removeEventListener(REPORTS_HUB_LAYOUT_CHANGED_EVENT, syncPrefs);
    };
  }, [refreshCatalog]);

  useEffect(() => {
    const returnCtx = loadManageReportsReturnContext();
    if (!returnCtx || returnCtx.returnView !== 'reports') return;
    clearManageReportsReturnContext();
    const fresh = loadManagedReports();
    setReports(fresh);
    setSavedSnapshots(Object.fromEntries(fresh.map((r) => [r.id, JSON.stringify(r)])));
    setBuilderReportId(returnCtx.reportId);
    onReportOpen?.();
    if (returnCtx.toastMessage) toast.success(returnCtx.toastMessage);
  }, [onReportOpen]);

  const { visible: visibleCards, hidden: hiddenCards } = useMemo(
    () => partitionReportsByPreferences(catalogCards, savedPrefs),
    [catalogCards, savedPrefs],
  );

  const filteredVisible = useMemo(
    () => visibleCards.filter((r) => matchesSearch(r, searchQuery)),
    [visibleCards, searchQuery],
  );

  const filteredDraftVisible = useMemo(
    () => draftVisible.filter((r) => matchesSearch(r, searchQuery)),
    [draftVisible, searchQuery],
  );

  const filteredDraftHidden = useMemo(
    () => draftHidden.filter((r) => matchesSearch(r, searchQuery)),
    [draftHidden, searchQuery],
  );

  const allIds = useMemo(() => catalogCards.map((c) => c.id), [catalogCards]);

  const showReset = useMemo(() => {
    const prefs = isCustomizing
      ? buildPreferencesFromVisibleOrder(draftVisible, draftHidden)
      : savedPrefs;
    return preferencesDifferFromDefault(prefs, allIds);
  }, [isCustomizing, draftVisible, draftHidden, savedPrefs, allIds]);

  useEffect(() => {
    if (!initialReport) return;
    setActiveReport(initialReport);
    onReportOpen?.();
    onInitialReportConsumed?.();
  }, [initialReport, onReportOpen, onInitialReportConsumed]);

  const persistReports = useCallback((updater: ManagedReport[] | ((prev: ManagedReport[]) => ManagedReport[])) => {
    setReports((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveManagedReports(next);
      return next;
    });
  }, []);

  const commitSnapshot = useCallback((report: ManagedReport) => {
    setSavedSnapshots((prev) => ({
      ...prev,
      [report.id]: JSON.stringify(report),
    }));
  }, []);

  const builderReport = useMemo(
    () => reports.find((r) => r.id === builderReportId) ?? null,
    [reports, builderReportId],
  );

  const myDrafts = useMemo(
    () =>
      reports.filter(
        (r) => r.resourcePool === 'user' && r.status === 'draft' && !r.catalogId,
      ),
    [reports],
  );

  const filteredDrafts = useMemo(() => {
    if (!searchQuery.trim()) return myDrafts;
    const q = searchQuery.toLowerCase();
    return myDrafts.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q),
    );
  }, [myDrafts, searchQuery]);

  const handleReportClick = (reportId: string) => {
    const builtin = hubIdToActiveBuiltinReport(reportId);
    if (builtin) {
      setActiveReport(builtin);
      onReportOpen?.();
      return;
    }
    setActiveReport(reportId);
    onReportOpen?.();
  };

  const handleReportBack = () => {
    setActiveReport(null);
    onReportClose?.();
  };

  const handleCreate = useCallback(
    (input: {
      title: string;
      description: string;
      userGroups: string[];
      resourceId?: string;
    }) => {
      const report = createDefaultReportSkeleton({
        ...input,
        resourcePool: 'user',
      });
      persistReports((prev) => [report, ...prev]);
      setSavedSnapshots((prev) => ({ ...prev, [report.id]: JSON.stringify(report) }));
      setShowAddModal(false);
      setBuilderReportId(report.id);
      onReportOpen?.();
      toast.success(
        input.resourceId
          ? 'Report linked. Choose how you want to build it.'
          : 'Draft created. Attach a resource from My Resources to continue.',
      );
    },
    [onReportOpen, persistReports],
  );

  const handleBuilderUpdate = useCallback(
    (updated: ManagedReport) => {
      persistReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    },
    [persistReports],
  );

  const handleBuilderPublish = useCallback(
    async (updated: ManagedReport) => {
      await new Promise((resolve) => setTimeout(resolve, 650));
      const published = {
        ...updated,
        status: 'published' as const,
        updatedAt: formatDate(new Date()),
      };
      persistReports((prev) => prev.map((r) => (r.id === published.id ? published : r)));
      commitSnapshot(published);
      toast.success('Report published');
    },
    [commitSnapshot, persistReports],
  );

  const handleBuilderUnpublish = useCallback(
    (id: string) => {
      let unpublished: ManagedReport | null = null;
      persistReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          unpublished = {
            ...r,
            status: 'draft' as const,
            updatedAt: formatDate(new Date()),
          };
          return unpublished;
        }),
      );
      if (unpublished) {
        commitSnapshot(unpublished);
        toast.success('Report unpublished');
      }
    },
    [commitSnapshot, persistReports],
  );

  const backFromBuilder = () => {
    if (builderReport) {
      setSavedSnapshots((prev) => ({
        ...prev,
        [builderReport.id]: JSON.stringify(builderReport),
      }));
    }
    setBuilderReportId(null);
    setShowAttachModal(false);
    onReportClose?.();
    refreshCatalog();
  };

  const handleAttachSelect = (resourceId: string) => {
    if (!builderReportId) return;
    const updated = linkReportResource(builderReportId, resourceId);
    if (updated) {
      setReports(loadManagedReports());
      setSavedSnapshots((prev) => ({ ...prev, [updated.id]: JSON.stringify(updated) }));
      toast.success('Resource attached — choose how you want to build it.');
    }
    setShowAttachModal(false);
  };

  const handleAttachCreateNew = () => {
    if (!builderReport) return;
    const ctx: ReportResourceLinkContext = {
      reportId: builderReport.id,
      reportTitle: builderReport.title,
      prefillTitle: builderReport.title,
      prefillDescription: builderReport.description,
      resourcePool: 'user',
    };
    saveReportResourceLinkContext(ctx);
    setShowAttachModal(false);
    onCreateResourceForReport?.(ctx);
  };

  const startCustomizing = () => {
    setDraftVisible(visibleCards);
    setDraftHidden(hiddenCards);
    setIsCustomizing(true);
  };

  const handleDone = () => {
    const next = buildPreferencesFromVisibleOrder(draftVisible, draftHidden);
    saveReportsHubPreferences(next);
    setSavedPrefs(next);
    setIsCustomizing(false);
    toast.success('Reports layout saved');
  };

  const handleCancel = () => {
    setIsCustomizing(false);
    setDraftVisible([]);
    setDraftHidden([]);
  };

  const handleReset = () => {
    resetReportsHubPreferences();
    const defaults = loadReportsHubPreferences();
    setSavedPrefs(defaults);
    if (isCustomizing) {
      const { visible, hidden } = partitionReportsByPreferences(catalogCards, defaults);
      setDraftVisible(visible);
      setDraftHidden(hidden);
    }
    toast.success('Reports layout reset to default');
  };

  const handleHide = (id: string) => {
    const card = draftVisible.find((r) => r.id === id);
    if (!card) return;
    setDraftVisible((prev) => prev.filter((r) => r.id !== id));
    setDraftHidden((prev) => [...prev, card]);
  };

  const handleShow = (id: string) => {
    const card = draftHidden.find((r) => r.id === id);
    if (!card) return;
    setDraftHidden((prev) => prev.filter((r) => r.id !== id));
    setDraftVisible((prev) => [...prev, card]);
  };

  const handleShowAll = () => {
    setDraftVisible((prev) => [...prev, ...draftHidden]);
    setDraftHidden([]);
  };

  if (builderReport) {
    return (
      <>
        <ReportBuilder
          report={builderReport}
          savedSnapshot={savedSnapshots[builderReport.id] ?? ''}
          onBack={backFromBuilder}
          onUpdate={handleBuilderUpdate}
          onPublish={handleBuilderPublish}
          onUnpublish={handleBuilderUnpublish}
          onCommit={commitSnapshot}
          onAttachSources={() => setShowAttachModal(true)}
        />
        <ReportAttachMyResourceModal
          open={showAttachModal}
          reportTitle={builderReport.title}
          resources={myResourceOptions}
          onClose={() => setShowAttachModal(false)}
          onSelect={handleAttachSelect}
          onCreateNew={handleAttachCreateNew}
        />
      </>
    );
  }

  if (activeReport === 'aid-flow') {
    return (
      <ReportDetailShell>
        <AidFlowScrollytelling onBack={handleReportBack} />
      </ReportDetailShell>
    );
  }

  if (activeReport === 'migration-data') {
    return (
      <ReportDetailShell>
        <MigrationDataScrollytelling onBack={handleReportBack} />
      </ReportDetailShell>
    );
  }

  if (activeReport === 'somalia-joint-fund') {
    return (
      <ReportDetailShell>
        <SomaliaJointFundScrollytelling onBack={handleReportBack} />
      </ReportDetailShell>
    );
  }

  if (activeReport) {
    const managed = loadManagedReports().find((r) => r.id === activeReport && !r.catalogId);
    if (managed) {
      return (
        <ReportDetailShell>
          <ManagedReportView report={managed} onBack={handleReportBack} />
        </ReportDetailShell>
      );
    }
  }

  const browseEmptyAllHidden = !isCustomizing && visibleCards.length === 0;
  const browseEmptySearch = !isCustomizing && filteredVisible.length === 0 && !browseEmptyAllHidden;
  const editEmptyVisible = isCustomizing && filteredDraftVisible.length === 0 && draftVisible.length > 0;
  const editEmptyAllHidden = isCustomizing && draftVisible.length === 0;

  return (
    <PageScrollShell paddingClassName="px-4 sm:px-8 pt-8" maxWidth="1280">
      <div className="mb-6">
        {hubView === 'drafts' ? (
          <>
            <button
              type="button"
              onClick={() => {
                setHubView('catalog');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              All reports
            </button>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-page-title">Drafts</h2>
              <span className="min-w-5 h-5 px-1.5 rounded-md bg-primary/10 text-primary text-xs font-semibold tabular-nums flex items-center justify-center">
                {myDrafts.length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Continue unfinished reports</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-page-title">Reports</h2>
              <Clock size={18} className="text-text-subtle" />
            </div>
            <p className="text-sm text-muted-foreground">Thematic dashboards</p>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={hubView === 'drafts' ? 'Search drafts...' : 'Search reports...'}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary"
          />
        </div>
        {!isCustomizing && hubView === 'catalog' && (
          <>
            {myDrafts.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setHubView('drafts');
                }}
                className="h-[46px] shrink-0 rounded-xl px-4 gap-2"
                aria-label={`${myDrafts.length} unfinished drafts`}
              >
                <FilePenLine size={16} />
                Drafts
                <span className="min-w-5 h-5 px-1.5 rounded-md bg-primary/10 text-primary text-xs font-semibold tabular-nums flex items-center justify-center">
                  {myDrafts.length}
                </span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={startCustomizing}
              className="h-[46px] shrink-0 rounded-xl px-4"
            >
              <SlidersHorizontal size={16} />
              Customize
            </Button>
            <Button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="h-[46px] shrink-0 rounded-xl px-4"
            >
              <Plus size={16} />
              Add report
            </Button>
          </>
        )}
        {!isCustomizing && hubView === 'drafts' && (
          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-[46px] shrink-0 rounded-xl px-4"
          >
            <Plus size={16} />
            Add report
          </Button>
        )}
      </div>

      {isCustomizing && (
        <ReportsCustomizeBar
          className="mb-5"
          onDone={handleDone}
          onCancel={handleCancel}
          onReset={handleReset}
          showReset={showReset}
        />
      )}

      {hubView === 'drafts' && !isCustomizing ? (
        myDrafts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
            <p className="text-sm text-muted-foreground mb-4">No drafts left.</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setHubView('catalog')}
            >
              Back to reports
            </Button>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
            <p className="text-sm text-muted-foreground">
              No drafts match &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => {
                  setBuilderReportId(draft.id);
                  onReportOpen?.();
                }}
                className="text-left bg-card border border-dashed border-border rounded-xl p-5 hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-foreground truncate">{draft.title}</p>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Draft
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                  {draft.description || 'Continue building from My Resources'}
                </p>
                <p className="text-xs text-primary mt-4 font-medium">Continue editing</p>
              </button>
            ))}
          </div>
        )
      ) : isCustomizing ? (
        <DndProvider backend={HTML5Backend}>
          {editEmptyAllHidden ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground mb-4">
                All reports are hidden from your page.
              </p>
              <Button type="button" size="sm" onClick={handleShowAll}>
                Show all reports
              </Button>
            </div>
          ) : editEmptyVisible ? (
            <div className="text-center py-12 bg-card border border-dashed border-border rounded-2xl mb-4">
              <p className="text-sm text-muted-foreground">
                No visible reports match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : (
            <ReportsSortableGrid
              reports={filteredDraftVisible}
              onReorder={(nextFiltered) => {
                if (!searchQuery) {
                  setDraftVisible(nextFiltered);
                  return;
                }
                const filteredIds = new Set(nextFiltered.map((r) => r.id));
                const nonMatching = draftVisible.filter((r) => !filteredIds.has(r.id));
                setDraftVisible([...nextFiltered, ...nonMatching]);
              }}
              onHide={handleHide}
            />
          )}

          <ReportsHiddenSection
            reports={filteredDraftHidden}
            onShow={handleShow}
            onShowAll={draftHidden.length > 0 ? handleShowAll : undefined}
          />
        </DndProvider>
      ) : browseEmptyAllHidden ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
          <p className="text-sm text-muted-foreground mb-4">
            No reports on your page. Customize which reports you see, or add your own.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={startCustomizing}>
              Customize reports
            </Button>
            <Button type="button" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} />
              Add report
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVisible.map((report) => (
              <ReportHubCard
                key={report.id}
                report={report}
                mode="browse"
                onOpen={() => report.available && handleReportClick(report.id)}
              />
            ))}
          </div>

          {browseEmptySearch && (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">
                No reports match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </>
      )}

      <ReportAddModal
        open={showAddModal}
        reports={reports}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreate}
        resourceOptions={myResourceOptions}
        resourceFieldHint="Link a resource you created in My Resources. Admin resources aren’t available here."
        emptyResourcesMessage="No resources of your own yet. Add one in My Resources, then come back."
        hideUserGroups
      />
    </PageScrollShell>
  );
}
