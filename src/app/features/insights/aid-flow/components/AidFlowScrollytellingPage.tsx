import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { DONOR_OPTIONS, FORWARD_ICONS, REGION_OPTIONS, SCENES, SECTOR_OPTIONS } from '../data/aidFlowData';
import { useAidFlowFilters } from '../hooks/useAidFlowFilters';
import { useAidFlowReportPrompt } from '../hooks/useAidFlowReportPrompt';
import { AidFlowChatFeed } from './AidFlowChatFeed';
import { AidFlowResultPanel } from './AidFlowResultPanel';
import { AidFlowSceneChart } from './AidFlowCharts';
import { MultiSelectMenu } from './MultiSelectMenu';
import {
  AnimatedNarrative,
  AnimatedStat,
  AID_FLOW_CUSTOMIZE_THEME,
  ReportChatHeaderCollapse,
  ReportChatLayout,
  ReportChatPromptInput,
  ReportChatScrollSync,
  AID_FLOW_CHAT_PROMPT_THEME,
  ReportDashboardCustomizeOverlay,
  ReportLoadDeferred,
  AID_FLOW_FILTER_THEME,
  ReportFilterBar,
  ReportLoadItem,
  REPORT_LOAD_ORDER,
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
  useReportFilterMode,
} from '../../shared';
import { cn } from '../../../../components/ui/utils';
import { PageBreadcrumb } from '../../../../components/ui/page-breadcrumb';

interface AidFlowScrollytellingProps {
  onBack?: () => void;
}

export function AidFlowScrollytellingPage({ onBack }: AidFlowScrollytellingProps) {
  const [activeScene, setActiveScene] = useState(0);
  const [openMenu, setOpenMenu] = useState<'time' | 'donors' | 'sectors' | 'regions' | null>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filtersAppliedPulse, setFiltersAppliedPulse] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const chatLayoutRef = useRef<ReportChatLayoutHandle>(null);

  const {
    selectedDonors,
    setSelectedDonors,
    selectedSectors,
    setSelectedSectors,
    selectedRegions,
    setSelectedRegions,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    yearLabel,
    hasAnyFilter,
    filteredDonors,
    filteredSectors,
    filteredRegions,
    filteredHum,
    filteredDev,
    trendRows,
    filteredImplementers,
    filteredMarkers,
    kpiCards,
    sceneStats,
    forwardCards,
    filteredEnvelope,
    filteredActual,
    filteredPlanned,
  } = useAidFlowFilters();

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
  } = useAidFlowReportPrompt({
    onChatLaneReady: () => chatLayoutRef.current?.openChat(),
  });

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
  }, [selectedDonors, selectedSectors, selectedRegions, startYear, endYear]);

  const toggleItem = (value: string, setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clearMenu = (menu: 'donors' | 'sectors' | 'regions' | 'time') => {
    if (menu === 'donors') setSelectedDonors([]);
    if (menu === 'sectors') setSelectedSectors([]);
    if (menu === 'regions') setSelectedRegions([]);
    if (menu === 'time') {
      setStartYear(2014);
      setEndYear(2026);
    }
  };

  const clearAllFilters = () => {
    setSelectedDonors([]);
    setSelectedSectors([]);
    setSelectedRegions([]);
    setStartYear(2014);
    setEndYear(2026);
    setOpenMenu(null);
  };

  const isDashboardLocked = isQuerying || customizePhase !== 'idle';

  const handleBreadcrumbBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <ReportPageShell className="bg-[#f6f7f9]">
        <header
          className={cn(
            reportHeaderClassName,
            reportMobileHeaderClassName,
            'shrink-0 border-b border-[#e6e9ef] bg-[#f6f7f9]/95',
            reportHeaderPaddingClassName,
          )}
        >
          <ReportLoadItem order={REPORT_LOAD_ORDER.breadcrumb}>
            <PageBreadcrumb
              className="mb-3 lg:mb-4"
              items={[
                { label: 'Reports', onClick: handleBreadcrumbBack },
                { label: 'Aid Flow Intelligence' },
              ]}
              suffix={
                <span className="rounded-full bg-[#eafaf0] px-2 py-1 text-[11px] font-semibold text-[#3fa85a]">
                  AIMS + SSF - synced nightly
                </span>
              }
            />
          </ReportLoadItem>
          <div className={reportTitleFilterRowClassName}>
            <ReportLoadItem order={REPORT_LOAD_ORDER.title} className="lg:min-w-0 lg:flex-1">
              <h1 className="report-display-title truncate text-[22px] leading-[1.05] font-semibold text-[#0d1b2a] sm:text-[30px]">
                Aid Flow Intelligence
              </h1>
              <p className="mt-1 hidden max-w-[560px] text-[13.5px] text-[#6b7a8d] lg:block">
                Explore how development and humanitarian funding is flowing across Somalia.
              </p>
            </ReportLoadItem>
            <ReportLoadItem order={REPORT_LOAD_ORDER.filters}>
              <ReportFilterBar
                filterRef={filterRef}
                mode={filterMode}
                theme={AID_FLOW_FILTER_THEME}
                onBackToReport={backToReport}
                hasAppliedFilters={hasAnyFilter && filtersInteractive}
                onClearAll={clearAllFilters}
                isApplyingFilters={isApplyingFilters}
                filtersAppliedPulse={filtersAppliedPulse}
              >
              <div className="relative">
                <button
                  type="button"
                  disabled={!filtersInteractive}
                  onClick={() => setOpenMenu((prev) => (prev === 'time' ? null : 'time'))}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 ${openMenu === 'time' || startYear !== 2014 || endYear !== 2026 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}
                >
                  <Calendar size={13} />
                  {yearLabel}
                  <ChevronDown size={13} />
                </button>
                {openMenu === 'time' && (
                  <div className="absolute left-0 right-0 top-[44px] z-50 w-auto rounded-xl border border-[#e6e9ef] bg-white p-3 shadow-lg sm:left-auto sm:right-0 sm:w-[320px]">
                    <div className="mb-2 flex items-center justify-between border-b border-[#eef1f6] pb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7a8d]">
                        Year Range
                      </span>
                      {(startYear !== 2014 || endYear !== 2026) && (
                        <button onClick={() => clearMenu('time')} className="text-[11px] text-[#1f6feb]">
                          Clear Filters
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#e6e9ef] px-2 py-1.5">
                        <span className="text-[11px] text-[#6b7a8d]">Start</span>
                        <select
                          value={startYear}
                          onChange={(e) => setStartYear(Number(e.target.value))}
                          className="bg-transparent text-[12px] text-[#3a4a5c] outline-none"
                        >
                          {Array.from({ length: 13 }, (_, i) => 2014 + i).map((year) => (
                            <option key={`start-${year}`} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#e6e9ef] px-2 py-1.5">
                        <span className="text-[11px] text-[#6b7a8d]">End</span>
                        <select
                          value={endYear}
                          onChange={(e) => setEndYear(Number(e.target.value))}
                          className="bg-transparent text-[12px] text-[#3a4a5c] outline-none"
                        >
                          {Array.from({ length: 13 }, (_, i) => 2014 + i).map((year) => (
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
                  onClick={() => setOpenMenu((prev) => (prev === 'donors' ? null : 'donors'))}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 ${openMenu === 'donors' || selectedDonors.length > 0 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}
                >
                  {selectedDonors.length > 0 ? `Donors (${selectedDonors.length})` : 'All Donors'}
                  <ChevronDown size={13} />
                </button>
                {openMenu === 'donors' && (
                  <MultiSelectMenu
                    title="Donors"
                    options={DONOR_OPTIONS}
                    selected={selectedDonors}
                    onToggle={(v) => toggleItem(v, setSelectedDonors)}
                    onClear={() => clearMenu('donors')}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  disabled={!filtersInteractive}
                  onClick={() => setOpenMenu((prev) => (prev === 'sectors' ? null : 'sectors'))}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 ${openMenu === 'sectors' || selectedSectors.length > 0 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}
                >
                  {selectedSectors.length > 0 ? `Sectors (${selectedSectors.length})` : 'All Sectors'}
                  <ChevronDown size={13} />
                </button>
                {openMenu === 'sectors' && (
                  <MultiSelectMenu
                    title="Sectors"
                    options={SECTOR_OPTIONS}
                    selected={selectedSectors}
                    onToggle={(v) => toggleItem(v, setSelectedSectors)}
                    onClear={() => clearMenu('sectors')}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  disabled={!filtersInteractive}
                  onClick={() => setOpenMenu((prev) => (prev === 'regions' ? null : 'regions'))}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 ${openMenu === 'regions' || selectedRegions.length > 0 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}
                >
                  {selectedRegions.length > 0 ? `Regions (${selectedRegions.length})` : 'All Regions'}
                  <ChevronDown size={13} />
                </button>
                {openMenu === 'regions' && (
                  <MultiSelectMenu
                    title="Regions"
                    options={REGION_OPTIONS}
                    selected={selectedRegions}
                    onToggle={(v) => toggleItem(v, setSelectedRegions)}
                    onClear={() => clearMenu('regions')}
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
          chatLabel="Ask Aid Flow"
          messageCount={messages.length}
          sidebarClassName="border-l border-[#e6e9ef] bg-white"
          chatHeader={
            <ReportLoadItem order={REPORT_LOAD_ORDER.chat} className="shrink-0 border-b border-[#e6e9ef] bg-white px-4 py-3">
              <ReportChatScrollSync scrollRef={chatScrollRef} deps={[messages, isQuerying]} />
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1f6feb] to-[#16a39a] text-white">
                  <Sparkles size={14} />
                </span>
                <h3 className="text-[15px] font-semibold text-[#0d1b2a]">Ask Aid Flow</h3>
                <ReportChatHeaderCollapse className="border-[#e6e9ef] hover:text-[#1f6feb]" />
              </div>
              <p className="mt-1 text-[11.5px] text-[#6b7a8d]">
                Ask about donors, sectors, regions or trends. Answers reshape the dashboard on the left.
              </p>
            </ReportLoadItem>
          }
          chatFeed={
            <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-4">
              <AidFlowChatFeed
                messages={messages}
                isQuerying={isQuerying}
                queryingMode={queryingMode}
                onChipClick={runPrompt}
              />
            </div>
          }
          promptInput={
            <ReportChatPromptInput
              value={promptInput}
              onChange={setPromptInput}
              onSubmit={runPrompt}
              disabled={isQuerying}
              placeholder="Ask anything about aid flows..."
              theme={AID_FLOW_CHAT_PROMPT_THEME}
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
                theme={AID_FLOW_CUSTOMIZE_THEME}
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
                  className="relative rounded-[14px] border border-[#e6e9ef] bg-white px-[18px] pb-[16px] pt-[14px] text-left transition hover:-translate-y-0.5 hover:border-[#d4def0] hover:shadow-lg disabled:opacity-50"
                >
                  <div
                    className="mb-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
                    style={{ backgroundColor: k.iconBg }}
                  >
                    <k.icon size={14} style={{ color: k.iconColor }} />
                  </div>
                  <div className="mb-1 text-[10.5px] uppercase tracking-[0.04em] text-[#6b7a8d]">
                    {k.label}
                  </div>
                  <AnimatedStat value={k.value} className="text-[23px] font-semibold text-[#0d1b2a]" />
                  <div className="mt-1 text-[11px] text-[#6b7a8d]">{k.sub}</div>
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
              {SCENES.map((s, i) => (
                <ReportLoadDeferred
                  key={s.num}
                  data-scene-index={i}
                  order={REPORT_LOAD_ORDER.scene(i)}
                  minHeight="280px"
                  className={cn(reportSceneSectionClassName, 'border-[#e6e9ef]')}
                >
                  <div
                    data-chart-root
                    className={cn(reportSceneChartCardClassName, 'border-[#e6e9ef]')}
                  >
                    <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#6b7a8d]">
                      {s.cap}
                    </div>
                    <div className="mb-4 text-base font-semibold text-[#0d1b2a] sm:mb-5 sm:text-[18px]">
                      {s.ctitle}
                    </div>
                    <AidFlowSceneChart
                      index={i}
                      totals={{
                        envelope: filteredEnvelope,
                        actual: filteredActual,
                        planned: filteredPlanned,
                      }}
                      donors={filteredDonors}
                      sectors={filteredSectors}
                      trendRows={trendRows}
                      regions={filteredRegions.filter((l) => l[0] !== 'FGS (federal)')}
                      hum={filteredHum}
                      dev={filteredDev}
                      implementers={filteredImplementers}
                      markers={filteredMarkers}
                    />
                  </div>
                  <AnimatedNarrative
                    className={cn(reportSceneNarrativeClassName, activeScene === i ? 'opacity-100' : 'opacity-70')}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1f6feb]">
                      {s.num}
                    </div>
                    <h3 className={cn(reportSceneTitleClassName, 'text-[#0d1b2a]')}>{s.title}</h3>
                    <AnimatedStat
                      value={sceneStats[i]?.stat ?? s.stat}
                      className={cn(reportSceneStatClassName, 'text-[#1f6feb]')}
                    />
                    <p className="mt-1 text-[12.5px] text-[#6b7a8d]">
                      {sceneStats[i]?.statLbl ?? s.statLbl}
                    </p>
                    <p
                      className="mt-4 text-[14.5px] text-[#3a4a5c]"
                      dangerouslySetInnerHTML={{ __html: s.body }}
                    />
                    <ul className="mt-2">
                      {s.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-3 border-t border-[#eef1f6] py-2 text-[13.5px] text-[#3a4a5c]"
                        >
                          <span className="mt-[7px] inline-block h-[8px] w-[8px] shrink-0 rounded-[2px] bg-[#2a7fe0]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => runPrompt(s.ask)}
                      disabled={isDashboardLocked}
                      className={cn(
                        reportSceneAskButtonClassName,
                        'border-[#cfe0fd] bg-[#eaf1fe] text-[#1550b3]',
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
              <AidFlowResultPanel
                recipe={activeRecipe}
                resultTitle={resultTitle}
                onBack={backToReport}
                onFollowUp={runPrompt}
              />
            </div>
          )}

          {!resultMode && (
            <ReportLoadDeferred order={REPORT_LOAD_ORDER.forwardLook(SCENES.length)}>
            <section className="mt-8 rounded-[18px] bg-gradient-to-br from-[#0d1b2a] to-[#16263a] p-6 text-white">
              <h2 className="report-display-title text-[20px] font-semibold">Forward Look - Predictive Insights</h2>
              <p className="mb-5 mt-1 text-[13px] text-[#9fb3c8]">
                Modelled from AIMS commitments + Somalia Stabilization Fund pipeline. Directional, not
                guaranteed.
              </p>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {forwardCards.map((c, i) => {
                  const Icon = FORWARD_ICONS[i];
                  return (
                    <div
                      key={c[0]}
                      className="rounded-[14px] border border-white/10 bg-white/5 p-4"
                    >
                      <div
                        className="mb-3 inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: c[3] }}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="text-[14px] font-semibold">{c[0]}</div>
                      <AnimatedStat value={c[1]} className="mt-2 block text-[24px] font-semibold" />
                      <p className="mt-2 text-[12.5px] text-[#aebfd0]">{c[2]}</p>
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
