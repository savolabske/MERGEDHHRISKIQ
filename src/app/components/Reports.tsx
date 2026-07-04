import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DollarSign, Users, Search, Clock, Landmark, SlidersHorizontal } from 'lucide-react';
import { AidFlowScrollytelling } from '../features/insights/aid-flow';
import { MigrationDataScrollytelling } from './MigrationDataScrollytelling';
import { SomaliaJointFundScrollytelling } from './SomaliaJointFundScrollytelling';
import { PageScrollShell } from './PageScrollShell';
import { ReportDetailShell } from '../features/insights/shared/ReportDetailShell';
import { loadManagedReports, MANAGED_REPORTS_CHANGED_EVENT, type ReportCatalogId } from '../data/reportsAdminMock';
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
import { Button } from './ui/button';
import { ReportHubCard } from './reports/ReportHubCard';
import { ReportsCustomizeBar } from './reports/ReportsCustomizeBar';
import { ReportsHiddenSection } from './reports/ReportsHiddenSection';
import { ReportsSortableGrid } from './reports/ReportsSortableGrid';
import type { ReportHubCardData } from './reports/reportHubTypes';

const REPORT_CARD_META: Record<
  ReportCatalogId,
  {
    IconComponent: typeof DollarSign;
    iconBg: string;
    iconColor: string;
  }
> = {
  'aid-flow': {
    IconComponent: DollarSign,
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
  },
  'migration-displacement': {
    IconComponent: Users,
    iconBg: 'bg-chart-3/10',
    iconColor: 'text-chart-3',
  },
  'somalia-joint-fund': {
    IconComponent: Landmark,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-700',
  },
};

export type ActiveReport = 'aid-flow' | 'migration-data' | 'somalia-joint-fund' | null;

function buildReportCards(): ReportHubCardData[] {
  const managed = loadManagedReports().filter((r) => r.catalogId);
  return managed.map((report) => {
    const meta = REPORT_CARD_META[report.catalogId!];
    return {
      id: report.catalogId!,
      title: report.title,
      description: report.description,
      IconComponent: meta.IconComponent,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      available: report.status === 'published',
    };
  });
}

function matchesSearch(report: ReportHubCardData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    report.title.toLowerCase().includes(q) || report.description.toLowerCase().includes(q)
  );
}

interface ReportsProps {
  initialReport?: ActiveReport;
  onInitialReportConsumed?: () => void;
  onReportOpen?: () => void;
  onReportClose?: () => void;
}

export function Reports({
  initialReport = null,
  onInitialReportConsumed,
  onReportOpen,
  onReportClose,
}: ReportsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);
  const [catalogCards, setCatalogCards] = useState<ReportHubCardData[]>(() => buildReportCards());
  const [savedPrefs, setSavedPrefs] = useState<ReportsHubPreferences>(() => loadReportsHubPreferences());
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draftVisible, setDraftVisible] = useState<ReportHubCardData[]>([]);
  const [draftHidden, setDraftHidden] = useState<ReportHubCardData[]>([]);

  const refreshCatalog = useCallback(() => {
    const cards = buildReportCards();
    setCatalogCards(cards);
    setSavedPrefs((prev) => pruneReportsHubPreferences(prev, cards.map((c) => c.id)));
  }, []);

  useEffect(() => {
    refreshCatalog();
    window.addEventListener('focus', refreshCatalog);
    window.addEventListener(MANAGED_REPORTS_CHANGED_EVENT, refreshCatalog);
    window.addEventListener(REPORTS_HUB_LAYOUT_CHANGED_EVENT, () => {
      setSavedPrefs(loadReportsHubPreferences());
    });
    return () => {
      window.removeEventListener('focus', refreshCatalog);
      window.removeEventListener(MANAGED_REPORTS_CHANGED_EVENT, refreshCatalog);
    };
  }, [refreshCatalog]);

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

  const handleReportClick = (reportId: ReportCatalogId) => {
    if (reportId === 'aid-flow') {
      setActiveReport('aid-flow');
      onReportOpen?.();
    } else if (reportId === 'migration-displacement') {
      setActiveReport('migration-data');
      onReportOpen?.();
    } else if (reportId === 'somalia-joint-fund') {
      setActiveReport('somalia-joint-fund');
      onReportOpen?.();
    }
  };

  const handleReportBack = () => {
    setActiveReport(null);
    onReportClose?.();
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

  const browseEmptyAllHidden = !isCustomizing && visibleCards.length === 0;
  const browseEmptySearch = !isCustomizing && filteredVisible.length === 0 && !browseEmptyAllHidden;
  const editEmptyVisible = isCustomizing && filteredDraftVisible.length === 0 && draftVisible.length > 0;
  const editEmptyAllHidden = isCustomizing && draftVisible.length === 0;

  return (
    <PageScrollShell paddingClassName="px-4 sm:px-8 pt-8" maxWidth="1280">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-page-title">Reports</h2>
          <Clock size={18} className="text-text-subtle" />
        </div>
        <p className="text-sm text-muted-foreground">Thematic dashboards</p>
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
            placeholder="Search reports..."
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
          />
        </div>
        {!isCustomizing && (
          <Button
            type="button"
            variant="outline"
            onClick={startCustomizing}
            className="h-[46px] shrink-0 rounded-xl px-4"
          >
            <SlidersHorizontal size={16} />
            Customize
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

      {isCustomizing ? (
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
            No reports on your page. Customize which reports you see.
          </p>
          <Button type="button" size="sm" onClick={startCustomizing}>
            Customize reports
          </Button>
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
    </PageScrollShell>
  );
}
