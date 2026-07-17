import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import {
  FORWARD_ICONS,
  MIGRATION_DATA,
  MIGRATION_KPI_BASE,
  MIGRATION_SCENES,
  MIGRATION_THEME,
} from '../data/migrationData';
import { useMigrationFilters } from '../hooks/useMigrationFilters';
import { useMigrationReportPrompt } from '../hooks/useMigrationReportPrompt';
import { buildMigrationExportDocument } from '../export/buildMigrationExportDocument';
import { MigrationDisplacementProps } from '../types';
import { MigrationChatFeed } from './MigrationChatFeed';
import { MigrationResultPanel } from './MigrationResultPanel';
import { MigrationSceneChart } from './MigrationCharts';
import { MultiSelectMenu } from '../../aid-flow/components/MultiSelectMenu';
import {
  AnimatedNarrative,
  AnimatedStat,
  MIGRATION_CUSTOMIZE_THEME,
  ReportChatHeaderCollapse,
  ReportChatHistoryBackButton,
  ReportChatHistoryButton,
  ReportChatHistoryPanel,
  ReportChatLayout,
  ReportChatPromptInput,
  ReportChatScrollSync,
  MIGRATION_CHAT_PROMPT_THEME,
  MIGRATION_EXTENDED_KNOWLEDGE_THEME,
  ReportDashboardCustomizeOverlay,
  ReportExtendedKnowledgeToggle,
  ReportLoadDeferred,
  ReportFilterBar,
  ReportLoadItem,
  REPORT_LOAD_ORDER,
  MIGRATION_FILTER_THEME,
  ReportPageShell,
  reportChatLayoutShellClassName,
  reportHeaderClassName,
  reportMobileHeaderClassName,
  reportHeaderPaddingClassName,
  reportMainPaddingClassName,
  reportSceneAskButtonClassName,
  reportSceneChartCardClassName,
  reportSceneNarrativeClassName,
  reportSceneSectionClassName,
  reportSceneStatClassName,
  reportSceneTitleClassName,
  reportTitleFilterRowClassName,
  type ReportChatLayoutHandle,
  useReportChatHistory,
  useReportFilterMode,
} from '../../shared';
import { ReportExportButton, useReportExport } from '../../shared/export';
import { cn } from '../../../../components/ui/utils';
import { PageBreadcrumb } from '../../../../components/ui/page-breadcrumb';

export function MigrationDisplacementPage({ onBack }: MigrationDisplacementProps) {
  const [activeScene, setActiveScene] = useState(0);
  const [openMenu, setOpenMenu] = useState<'time' | 'regions' | 'causes' | null>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filtersAppliedPulse, setFiltersAppliedPulse] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const chatLayoutRef = useRef<ReportChatLayoutHandle>(null);

  const filters = useMigrationFilters();
  const {
    startYear,
    endYear,
    regions,
    causes,
    setStartYear,
    setEndYear,
    setRegions,
    setCauses,
    monthly,
    filteredRegions,
    filteredCauses,
    needsGapRows,
    totalArrivals,
    recentArrivals,
    topCause,
    topRegion,
    childrenPct,
    kpis,
    sceneStats,
    yearLabel,
    hasAnyFilter,
    K,
  } = filters;

  const { exportReport, isExporting } = useReportExport(() => buildMigrationExportDocument(filters));

  const {
    promptInput,
    setPromptInput,
    messages,
    resultMode,
    resultTitle,
    activeRecipe,
    isQuerying,
    queryingMode,
    customizePhase,
    activeQuery,
    resultSectionRef,
    kpiSectionRef,
    chatScrollRef,
    runPrompt,
    backToReport,
    restoreSession,
    extendedKnowledge,
    toggleExtendedKnowledge,
  } = useMigrationReportPrompt({
    onChatLaneReady: () => chatLayoutRef.current?.openChat(),
  });

  const {
    historyItems,
    isHistoryOpen,
    openHistory,
    closeHistory,
    restoreHistoryItem,
    deleteHistoryItem,
    togglePinHistoryItem,
  } = useReportChatHistory({
    reportId: 'migration-data',
    messages,
    extendedKnowledge,
    resultMode,
    resultTitle,
    onRestore: restoreSession,
  });
  const regionOptions = useMemo(() => MIGRATION_DATA.regions.map(([name]) => name), []);
  const causeOptions = useMemo(() => MIGRATION_DATA.cause.map(([name]) => name), []);

  const { mode: filterMode, filtersInteractive } = useReportFilterMode(resultMode, customizePhase);

  useEffect(() => {
    const onScroll = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-scene-index]');
      let next = 0;
      nodes.forEach((node, idx) => {
        if (node.getBoundingClientRect().top <= window.innerHeight * 0.35) next = idx;
      });
      setActiveScene(next);
    };
    onScroll();
    const scrollRoot = document.querySelector<HTMLElement>('[data-report-scroll]') ?? window;
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!filtersInteractive) setOpenMenu(null);
  }, [filtersInteractive]);

  useEffect(() => {
    setIsApplyingFilters(true);
    const applyTimer = window.setTimeout(() => {
      setIsApplyingFilters(false);
      setFiltersAppliedPulse(true);
    }, 220);
    const pulseTimer = window.setTimeout(() => {
      setFiltersAppliedPulse(false);
    }, 1300);
    return () => {
      window.clearTimeout(applyTimer);
      window.clearTimeout(pulseTimer);
    };
  }, [regions, causes, startYear, endYear]);

  const toggleItem = (value: string, setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clearMenu = (menu: 'regions' | 'causes' | 'time') => {
    if (menu === 'regions') setRegions([]);
    if (menu === 'causes') setCauses([]);
    if (menu === 'time') {
      setStartYear(2023);
      setEndYear(2026);
    }
  };

  const clearAllFilters = () => {
    setRegions([]);
    setCauses([]);
    setStartYear(2023);
    setEndYear(2026);
    setOpenMenu(null);
  };

  const handleBreadcrumbBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  const kpiCards = MIGRATION_KPI_BASE.map((base, idx) => ({
    ...base,
    value: kpis[idx].value,
    sub: kpis[idx].sub,
  }));
  const isDashboardLocked = isQuerying || customizePhase !== 'idle';

  const forwardCards = [
    ['Drought outlook', topCause, 'Climate pressure remains a key movement trigger in current filters.'],
    ['Conflict pressure', 'Watch trends', 'Conflict spikes can quickly alter movement and destination patterns.'],
    ['Hub saturation', topRegion, 'Top receiving areas likely face sustained pressure on services.'],
    ['Response gap', '~94% unmet', 'Needs continue to outpace recorded response across sectors.'],
    ['Child protection', `${childrenPct}% children`, 'Child-focused support remains central in displacement response.'],
    ['Coverage caution', yearLabel, 'Interpret changes with attention to selected period and monitoring scope.'],
  ] as const;

  return (
    <ReportPageShell className="bg-[#f7f4ef]">
        <header
          className={cn(
            reportHeaderClassName,
            reportMobileHeaderClassName,
            'shrink-0 border-b border-[#ece6df] bg-[#f7f4ef]/95',
            reportHeaderPaddingClassName,
          )}
        >
          <ReportLoadItem order={REPORT_LOAD_ORDER.breadcrumb}>
            <PageBreadcrumb
              className="mb-3 lg:mb-4"
              items={[
                { label: 'Reports', onClick: handleBreadcrumbBack },
                { label: MIGRATION_THEME.title },
              ]}
              suffix={
                <span className="rounded-full bg-[#e7f3f1] px-2 py-1 text-[11px] font-semibold text-[#1f7a6e]">
                  IOM DTM · ETT weekly
                </span>
              }
            />
          </ReportLoadItem>
          <div className={reportTitleFilterRowClassName}>
            <ReportLoadItem order={REPORT_LOAD_ORDER.title} className="lg:min-w-0 lg:flex-1">
              <h1 className="report-display-title truncate text-[22px] leading-[1.05] font-semibold text-[#1a1410] sm:text-[30px]">
                {MIGRATION_THEME.title}
              </h1>
              <p className="mt-1 hidden max-w-[580px] text-[13.5px] text-[#8a7d72] lg:block">{MIGRATION_THEME.subtitle}</p>
            </ReportLoadItem>
            <ReportLoadItem order={REPORT_LOAD_ORDER.filters}>
              <ReportFilterBar
                filterRef={filterRef}
                mode={filterMode}
                theme={MIGRATION_FILTER_THEME}
                onBackToReport={backToReport}
                hasAppliedFilters={hasAnyFilter && filtersInteractive}
                onClearAll={clearAllFilters}
                isApplyingFilters={isApplyingFilters}
                filtersAppliedPulse={filtersAppliedPulse}
                trailingAction={
                  <ReportExportButton onExport={exportReport} disabled={isExporting} />
                }
              >
              <div className="relative">
                <button
                  type="button"
                  disabled={!filtersInteractive}
                  onClick={() => setOpenMenu((prev) => (prev === 'time' ? null : 'time'))}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 ${openMenu === 'time' || startYear !== 2023 || endYear !== 2026 ? 'border-[#d8b9a2] bg-[#fbeee5] text-[#a3461f]' : 'border-[#ece6df] bg-white text-[#4a3f38]'}`}
                >
                  {yearLabel}
                  <ChevronDown size={13} />
                </button>
                {openMenu === 'time' && (
                  <div className="absolute left-0 right-0 top-[44px] z-50 w-auto rounded-xl border border-[#ece6df] bg-white p-3 shadow-lg sm:left-auto sm:right-0 sm:w-[320px]">
                    <div className="mb-2 flex items-center justify-between border-b border-[#f3efe9] pb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8a7d72]">
                        Year Range
                      </span>
                      {(startYear !== 2023 || endYear !== 2026) && (
                        <button onClick={() => clearMenu('time')} className="text-[11px] text-[#c2562a]">
                          Clear Filters
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#ece6df] px-2 py-1.5">
                        <span className="text-[11px] text-[#8a7d72]">Start</span>
                        <select
                          value={startYear}
                          onChange={(e) => setStartYear(Number(e.target.value))}
                          className="bg-transparent text-[12px] text-[#4a3f38] outline-none"
                        >
                          {[2023, 2024, 2025, 2026].map((year) => (
                            <option key={`start-${year}`} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#ece6df] px-2 py-1.5">
                        <span className="text-[11px] text-[#8a7d72]">End</span>
                        <select
                          value={endYear}
                          onChange={(e) => setEndYear(Number(e.target.value))}
                          className="bg-transparent text-[12px] text-[#4a3f38] outline-none"
                        >
                          {[2023, 2024, 2025, 2026].map((year) => (
                            <option key={`end-${year}`} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  disabled={!filtersInteractive}
                  onClick={() => setOpenMenu((prev) => (prev === 'regions' ? null : 'regions'))}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 ${openMenu === 'regions' || regions.length > 0 ? 'border-[#d8b9a2] bg-[#fbeee5] text-[#a3461f]' : 'border-[#ece6df] bg-white text-[#4a3f38]'}`}
                >
                  {regions.length > 0 ? `Regions (${regions.length})` : 'All Regions'}
                  <ChevronDown size={13} />
                </button>
                {openMenu === 'regions' && (
                  <MultiSelectMenu
                    title="Regions"
                    options={regionOptions}
                    selected={regions}
                    onToggle={(v) => toggleItem(v, setRegions)}
                    onClear={() => clearMenu('regions')}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  disabled={!filtersInteractive}
                  onClick={() => setOpenMenu((prev) => (prev === 'causes' ? null : 'causes'))}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 ${openMenu === 'causes' || causes.length > 0 ? 'border-[#d8b9a2] bg-[#fbeee5] text-[#a3461f]' : 'border-[#ece6df] bg-white text-[#4a3f38]'}`}
                >
                  {causes.length > 0 ? `Causes (${causes.length})` : 'All Causes'}
                  <ChevronDown size={13} />
                </button>
                {openMenu === 'causes' && (
                  <MultiSelectMenu
                    title="Causes"
                    options={causeOptions}
                    selected={causes}
                    onToggle={(v) => toggleItem(v, setCauses)}
                    onClear={() => clearMenu('causes')}
                  />
                )}
              </div>
              </ReportFilterBar>
            </ReportLoadItem>
          </div>
        </header>

        <ReportChatLayout
          ref={chatLayoutRef}
          className={reportChatLayoutShellClassName}
          mainClassName={reportMainPaddingClassName}
          chatLabel="Ask Displacement"
          messageCount={messages.length}
          showPromptInput={!isHistoryOpen}
          sidebarClassName="border-l border-[#ece6df] bg-white"
          chatHeader={
            <ReportLoadItem order={REPORT_LOAD_ORDER.chat} className="shrink-0 border-b border-[#ece6df] bg-white px-4 py-3">
              <ReportChatScrollSync scrollRef={chatScrollRef} deps={[messages, isQuerying, isHistoryOpen]} />
              <div className="mb-2 flex items-center justify-between">
                {isHistoryOpen ? (
                  <ReportChatHistoryBackButton onClick={closeHistory} />
                ) : (
                  <ReportChatHistoryButton onClick={openHistory} />
                )}
                <ReportChatHeaderCollapse className="border-[#ece6df] hover:text-[#c2562a]" />
              </div>
              {!isHistoryOpen && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c2562a] to-[#d99a21] text-white">
                      <Sparkles size={14} />
                    </span>
                    <h3 className="text-[15px] font-semibold text-[#1a1410]">Ask Displacement</h3>
                  </div>
                  <ReportExtendedKnowledgeToggle
                    enabled={extendedKnowledge}
                    onToggle={toggleExtendedKnowledge}
                    theme={MIGRATION_EXTENDED_KNOWLEDGE_THEME}
                  />
                </>
              )}
              {isHistoryOpen && (
                <h3 className="text-[15px] font-semibold text-[#1a1410]">Chat history</h3>
              )}
            </ReportLoadItem>
          }
          chatFeed={
            <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-4">
              {isHistoryOpen ? (
                <ReportChatHistoryPanel
                  items={historyItems}
                  onSelect={restoreHistoryItem}
                  onDelete={deleteHistoryItem}
                  onTogglePin={togglePinHistoryItem}
                  accentClassName="group-hover:text-[#c2562a] hover:border-[#c2562a]"
                  emptyClassName="text-[#8a7d72]"
                />
              ) : (
                <MigrationChatFeed
                  messages={messages}
                  isQuerying={isQuerying}
                  queryingMode={queryingMode}
                  extendedKnowledge={extendedKnowledge}
                  onChipClick={runPrompt}
                />
              )}
            </div>
          }
          promptInput={
            <ReportChatPromptInput
              value={promptInput}
              onChange={setPromptInput}
              onSubmit={runPrompt}
              disabled={isQuerying}
              placeholder="Ask anything about displacement..."
              theme={MIGRATION_CHAT_PROMPT_THEME}
            />
          }
        >
          <div
            className={cn(
              'relative',
              customizePhase !== 'idle' && 'pointer-events-none min-h-[min(70vh,640px)]',
            )}
          >
            {customizePhase !== 'idle' && activeQuery ? (
              <ReportDashboardCustomizeOverlay
                query={activeQuery}
                phase={customizePhase}
                theme={MIGRATION_CUSTOMIZE_THEME}
                extendedKnowledge={extendedKnowledge}
              />
            ) : null}

            <div
              className={cn(
                'transition-[filter,opacity] duration-300',
                customizePhase === 'customizing' && 'scale-[0.995] opacity-50 blur-[2px]',
                customizePhase === 'revealing' && 'opacity-90 blur-0',
              )}
            >
          {!resultMode && (
            <ReportLoadItem order={REPORT_LOAD_ORDER.kpis}>
            <section ref={kpiSectionRef} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              {kpiCards.map((k) => (
                <button
                  key={k.label}
                  onClick={() => runPrompt(k.prompt)}
                  disabled={isDashboardLocked}
                  className="relative rounded-[14px] border border-[#ece6df] bg-white px-[18px] pb-[16px] pt-[14px] text-left transition hover:-translate-y-0.5 hover:border-[#e4d6c5] hover:shadow-lg disabled:opacity-50"
                >
                  <div
                    className="mb-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
                    style={{ backgroundColor: k.iconBg }}
                  >
                    <k.icon size={14} style={{ color: k.iconColor }} />
                  </div>
                  <div className="mb-1 text-[10.5px] uppercase tracking-[0.04em] text-[#8a7d72]">
                    {k.label}
                  </div>
                  <AnimatedStat value={k.value} className="text-[23px] font-semibold text-[#1a1410]" />
                  <div className="mt-1 text-[11px] text-[#8a7d72]">{k.sub}</div>
                  <span
                    className="absolute right-[12px] top-[12px] h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: k.color }}
                  />
                </button>
              ))}
            </section>
            </ReportLoadItem>
          )}

          {!resultMode && (
            <section>
              {MIGRATION_SCENES.map((s, i) => (
                <ReportLoadDeferred
                  key={s.num}
                  data-scene-index={i}
                  order={REPORT_LOAD_ORDER.scene(i)}
                  minHeight="280px"
                  className={cn(reportSceneSectionClassName, 'border-[#ece6df]')}
                >
                  <div
                    data-chart-root
                    className={cn(reportSceneChartCardClassName, 'border-[#ece6df]')}
                  >
                    <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#8a7d72]">
                      {s.cap}
                    </div>
                    <div className="mb-4 text-base font-semibold text-[#1a1410] sm:mb-5 sm:text-[18px]">
                      {s.ctitle}
                    </div>
                    <MigrationSceneChart
                      index={i}
                      K={K}
                      totalArrivals={totalArrivals}
                      recentArrivals={recentArrivals}
                      causes={filteredCauses}
                      monthly={monthly}
                      demo={{
                        children: Math.round(MIGRATION_DATA.demo.children),
                        women: Math.round(MIGRATION_DATA.demo.women),
                        men: Math.round(MIGRATION_DATA.demo.men),
                      }}
                      regions={filteredRegions}
                      gapRows={needsGapRows}
                      stay={MIGRATION_DATA.stay}
                    />
                  </div>
                  <AnimatedNarrative
                    className={cn(reportSceneNarrativeClassName, activeScene === i ? 'opacity-100' : 'opacity-70')}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c2562a]">
                      {s.num}
                    </div>
                    <h3 className={cn(reportSceneTitleClassName, 'text-[#1a1410]')}>{s.title}</h3>
                    <AnimatedStat
                      value={sceneStats[i]?.stat ?? s.stat}
                      className={cn(reportSceneStatClassName, 'text-[#c2562a]')}
                    />
                    <p className="mt-1 text-[12.5px] text-[#8a7d72]">
                      {sceneStats[i]?.statLbl ?? s.statLbl}
                    </p>
                    <p className="mt-4 text-[14.5px] text-[#4a3f38]">{s.body}</p>
                    <ul className="mt-2">
                      {s.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-3 border-t border-[#f3efe9] py-2 text-[13.5px] text-[#4a3f38]"
                        >
                          <span className="mt-[7px] inline-block h-[8px] w-[8px] shrink-0 rounded-[2px] bg-[#c2562a]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => runPrompt(s.ask)}
                      disabled={isDashboardLocked}
                      className={cn(
                        reportSceneAskButtonClassName,
                        'border-[#f0d8c5] bg-[#fbeee5] text-[#a3461f]',
                      )}
                    >
                      <Sparkles size={13} /> Ask: &quot;{s.ask}&quot;
                    </button>
                  </AnimatedNarrative>
                </ReportLoadDeferred>
              ))}
            </section>
          )}

          {resultMode && activeRecipe && (
            <div ref={resultSectionRef}>
              <MigrationResultPanel
                recipe={activeRecipe}
                resultTitle={resultTitle}
                onBack={backToReport}
                onFollowUp={runPrompt}
              />
            </div>
          )}

          {!resultMode && (
            <ReportLoadDeferred order={REPORT_LOAD_ORDER.forwardLook(MIGRATION_SCENES.length)}>
            <section className="mt-8 rounded-[18px] bg-gradient-to-br from-[#1a1410] to-[#2e231b] p-6 text-white">
              <h2 className="report-display-title text-[20px] font-semibold">Forward Look - Predictive Insights</h2>
              <p className="mb-5 mt-1 text-[13px] text-[#c9b8a8]">
                Signals from displacement patterns and response trends in active filters.
              </p>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {forwardCards.map((c, i) => {
                  const Icon = FORWARD_ICONS[i];
                  return (
                    <div
                      key={c[0]}
                      className="rounded-[14px] border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-3 inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white/15">
                        <Icon size={17} />
                      </div>
                      <div className="text-[14px] font-semibold">{c[0]}</div>
                      <AnimatedStat value={c[1]} className="mt-2 block text-[24px] font-semibold" />
                      <p className="mt-2 text-[12.5px] text-[#cbbdaf]">{c[2]}</p>
                    </div>
                  );
                })}
              </div>
            </section>
            </ReportLoadDeferred>
          )}
            </div>
          </div>
        </ReportChatLayout>
    </ReportPageShell>
  );
}
