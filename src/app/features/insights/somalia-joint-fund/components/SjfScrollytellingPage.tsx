import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Calendar, ChevronDown, Copy, Shield, Sparkles } from 'lucide-react';
import {
  DONOR_OPTIONS,
  FORWARD_CARDS,
  SCENES,
  SJF_THEME,
  UN_ENTITY_OPTIONS,
  WINDOW_OPTIONS,
} from '../data/sjfData';
import { useSjfFilters } from '../hooks/useSjfFilters';
import { useSjfReportPrompt } from '../hooks/useSjfReportPrompt';
import { buildSjfExportDocument } from '../export/buildSjfExportDocument';
import type { SjfScrollytellingProps } from '../types';
import { SjfChatFeed } from './SjfChatFeed';
import { SjfSceneChart } from './SjfCharts';
import { SjfPbiMirror } from './SjfPbiMirror';
import { SjfResultPanel } from './SjfResultPanel';
import './sjfTheme.css';
import { MultiSelectMenu } from '../../aid-flow/components/MultiSelectMenu';
import {
  AnimatedAIResponse,
  AnimatedNarrative,
  AnimatedStat,
  ReportChatHeaderCollapse,
  ReportChatHistoryBackButton,
  ReportChatHistoryButton,
  ReportChatHistoryPanel,
  ReportChatLayout,
  ReportChatPromptInput,
  ReportChatScrollSync,
  SJF_CHAT_PROMPT_THEME,
  SJF_EXTENDED_KNOWLEDGE_THEME,
  ReportDashboardCustomizeOverlay,
  ReportExtendedKnowledgeToggle,
  SJF_CUSTOMIZE_THEME,
  ReportLoadDeferred,
  ReportFilterBar,
  ReportLoadItem,
  REPORT_LOAD_ORDER,
  SJF_FILTER_THEME,
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

const FORWARD_ICONS = [Sparkles, AlertTriangle, Calendar, Shield, Sparkles, Shield];

export function SjfScrollytellingPage({ onBack }: SjfScrollytellingProps) {
  const [activeScene, setActiveScene] = useState(0);
  const [openMenu, setOpenMenu] = useState<'time' | 'windows' | 'donors' | 'entities' | null>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filtersAppliedPulse, setFiltersAppliedPulse] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const chatLayoutRef = useRef<ReportChatLayoutHandle>(null);

  const filters = useSjfFilters();
  const {
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    selectedWindows,
    setSelectedWindows,
    selectedDonors,
    setSelectedDonors,
    selectedUnEntities,
    setSelectedUnEntities,
    yearLabel,
    hasAnyFilter,
    kpiCards,
    sceneStats,
    getSceneChart,
  } = filters;

  const { exportReport, isExporting } = useReportExport(() => buildSjfExportDocument(filters));

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
  } = useSjfReportPrompt({
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
    reportId: 'somalia-joint-fund',
    messages,
    extendedKnowledge,
    resultMode,
    resultTitle,
    onRestore: restoreSession,
  });

  const [copiedKpi, setCopiedKpi] = useState<string | null>(null);

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
  }, [resultMode]);

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
    setIsApplyingFilters(true);
    const applyTimer = window.setTimeout(() => {
      setIsApplyingFilters(false);
      setFiltersAppliedPulse(true);
    }, 220);
    const pulseTimer = window.setTimeout(() => setFiltersAppliedPulse(false), 1300);
    return () => {
      window.clearTimeout(applyTimer);
      window.clearTimeout(pulseTimer);
    };
  }, [selectedWindows, selectedDonors, selectedUnEntities, startYear, endYear]);

  const toggleItem = (value: string, setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clearMenu = (menu: 'windows' | 'donors' | 'entities' | 'time') => {
    if (menu === 'windows') setSelectedWindows([]);
    if (menu === 'donors') setSelectedDonors([]);
    if (menu === 'entities') setSelectedUnEntities([]);
    if (menu === 'time') {
      setStartYear(2014);
      setEndYear(2025);
    }
  };

  const clearAllFilters = () => {
    setSelectedWindows([]);
    setSelectedDonors([]);
    setSelectedUnEntities([]);
    setStartYear(2014);
    setEndYear(2025);
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

  const filterActiveClass = 'border-[#00689D] bg-[#E5F3FB] text-[#19486A]';
  const filterIdleClass = 'border-[#e2e6ee] bg-white text-[#324559]';
  const isDashboardLocked = isQuerying || customizePhase !== 'idle';

  useEffect(() => {
    if (!filtersInteractive) setOpenMenu(null);
  }, [filtersInteractive]);

  const copyKpiPrompt = async (label: string, prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedKpi(label);
      window.setTimeout(() => setCopiedKpi(null), 1500);
    } catch {
      setCopiedKpi(null);
    }
  };

  return (
    <ReportPageShell className="bg-[#f4f6fa]">
        <header
          className={cn(
            reportHeaderClassName,
            reportMobileHeaderClassName,
            'shrink-0 border-b border-[#e2e6ee] bg-[#f4f6fa]/95',
            reportHeaderPaddingClassName,
          )}
        >
          <ReportLoadItem order={REPORT_LOAD_ORDER.breadcrumb}>
            <PageBreadcrumb
              className="mb-3 lg:mb-4"
              items={[
                { label: 'Reports', onClick: handleBreadcrumbBack },
                { label: 'Somalia Joint Fund' },
              ]}
              suffix={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F3FB] px-2 py-1 text-[11px] font-semibold text-[#00689D]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00689D]" />
                  {SJF_THEME.sourceBadge}
                </span>
              }
            />
          </ReportLoadItem>
          <div className={reportTitleFilterRowClassName}>
            <ReportLoadItem order={REPORT_LOAD_ORDER.title} className="lg:min-w-0 lg:flex-1">
              <h1 className="report-display-title sjf-title-underline truncate text-[22px] leading-[1.05] font-semibold text-[#0b1a2c] sm:text-[30px]">
                {SJF_THEME.title}
              </h1>
            </ReportLoadItem>
            <ReportLoadItem order={REPORT_LOAD_ORDER.filters}>
              <ReportFilterBar
                filterRef={filterRef}
                mode={filterMode}
                theme={SJF_FILTER_THEME}
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
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50',
                      openMenu === 'time' || startYear !== 2014 || endYear !== 2025
                        ? filterActiveClass
                        : filterIdleClass,
                    )}
                  >
                    <Calendar size={13} />
                    {yearLabel}
                    <ChevronDown size={13} />
                  </button>
                  {openMenu === 'time' && (
                    <div className="absolute left-0 right-0 top-[44px] z-50 w-auto rounded-xl border border-[#e2e6ee] bg-white p-3 shadow-lg sm:left-auto sm:right-0 sm:w-[320px]">
                      <div className="mb-2 flex items-center justify-between border-b border-[#eef1f7] pb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6f8094]">
                          Year Range
                        </span>
                        {(startYear !== 2014 || endYear !== 2025) && (
                          <button onClick={() => clearMenu('time')} className="text-[11px] text-[#00689D]">
                            Clear Filters
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-[#e2e6ee] px-2 py-1.5">
                          <span className="text-[11px] text-[#6f8094]">Start</span>
                          <select
                            value={startYear}
                            onChange={(e) => setStartYear(Number(e.target.value))}
                            className="bg-transparent text-[12px] text-[#324559] outline-none"
                          >
                            {Array.from({ length: 12 }, (_, i) => 2014 + i).map((year) => (
                              <option key={`start-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-lg border border-[#e2e6ee] px-2 py-1.5">
                          <span className="text-[11px] text-[#6f8094]">End</span>
                          <select
                            value={endYear}
                            onChange={(e) => setEndYear(Number(e.target.value))}
                            className="bg-transparent text-[12px] text-[#324559] outline-none"
                          >
                            {Array.from({ length: 12 }, (_, i) => 2014 + i).map((year) => (
                              <option key={`end-${year}`} value={year}>
                                {year === 2025 ? 'Jun 2025' : year}
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
                    onClick={() => setOpenMenu((prev) => (prev === 'windows' ? null : 'windows'))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50',
                      openMenu === 'windows' || selectedWindows.length > 0 ? filterActiveClass : filterIdleClass,
                    )}
                  >
                    {selectedWindows.length > 0 ? `Windows (${selectedWindows.length})` : 'All Windows'}
                    <ChevronDown size={13} />
                  </button>
                  {openMenu === 'windows' && (
                    <MultiSelectMenu
                      title="Windows"
                      options={WINDOW_OPTIONS}
                      selected={selectedWindows}
                      onToggle={(v) => toggleItem(v, setSelectedWindows)}
                      onClear={() => clearMenu('windows')}
                    />
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    disabled={!filtersInteractive}
                    onClick={() => setOpenMenu((prev) => (prev === 'donors' ? null : 'donors'))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50',
                      openMenu === 'donors' || selectedDonors.length > 0 ? filterActiveClass : filterIdleClass,
                    )}
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
                    onClick={() => setOpenMenu((prev) => (prev === 'entities' ? null : 'entities'))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50',
                      openMenu === 'entities' || selectedUnEntities.length > 0 ? filterActiveClass : filterIdleClass,
                    )}
                  >
                    {selectedUnEntities.length > 0
                      ? `UN Entities (${selectedUnEntities.length})`
                      : 'All UN Entities'}
                    <ChevronDown size={13} />
                  </button>
                  {openMenu === 'entities' && (
                    <MultiSelectMenu
                      title="UN Entities"
                      options={UN_ENTITY_OPTIONS}
                      selected={selectedUnEntities}
                      onToggle={(v) => toggleItem(v, setSelectedUnEntities)}
                      onClear={() => clearMenu('entities')}
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
          chatLabel="Ask SJF"
          messageCount={messages.length}
          showPromptInput={!isHistoryOpen}
          sidebarClassName="border-l border-[#e2e6ee] bg-white"
          chatHeader={
            <ReportLoadItem order={REPORT_LOAD_ORDER.chat} className="shrink-0 border-b border-[#e2e6ee] bg-white px-4 py-3">
              <ReportChatScrollSync scrollRef={chatScrollRef} deps={[messages, isQuerying, isHistoryOpen]} />
              <div className="mb-2 flex items-center justify-between">
                {isHistoryOpen ? (
                  <ReportChatHistoryBackButton onClick={closeHistory} />
                ) : (
                  <ReportChatHistoryButton onClick={openHistory} />
                )}
                <ReportChatHeaderCollapse className="border-[#e2e6ee] hover:text-[#00689D]" />
              </div>
              {!isHistoryOpen && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00689D] to-[#19486A] text-white">
                      <Sparkles size={14} />
                    </span>
                    <h3 className="text-[15px] font-semibold text-[#0b1a2c]">Ask SJF</h3>
                    <span className="rounded-md bg-[#E5F3FB] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#00689D]">
                      BETA
                    </span>
                  </div>
                  <ReportExtendedKnowledgeToggle
                    enabled={extendedKnowledge}
                    onToggle={toggleExtendedKnowledge}
                    theme={SJF_EXTENDED_KNOWLEDGE_THEME}
                  />
                </>
              )}
              {isHistoryOpen && (
                <h3 className="text-[15px] font-semibold text-[#0b1a2c]">Chat history</h3>
              )}
            </ReportLoadItem>
          }
          chatFeed={
            <div ref={chatScrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white p-4">
              {isHistoryOpen ? (
                <ReportChatHistoryPanel
                  items={historyItems}
                  onSelect={restoreHistoryItem}
                  onDelete={deleteHistoryItem}
                  onTogglePin={togglePinHistoryItem}
                  accentClassName="group-hover:text-[#00689D] hover:border-[#00689D]"
                  emptyClassName="text-[#6f8094]"
                />
              ) : (
                <SjfChatFeed
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
              placeholder="Ask about the SJF…"
              theme={SJF_CHAT_PROMPT_THEME}
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
                theme={SJF_CUSTOMIZE_THEME}
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
              <div className="mb-4 flex gap-2.5 rounded-xl border border-[#C5E0F1] bg-[#EAF6FC] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#19486A]">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#00689D]" />
                <div>
                  Figures verified from the <b>SJF Semi-Annual Report (published 11 Sep 2025, covering Jan–Jun 2025)</b>, the 2024 Annual Narrative Report, and the MPTF Gateway. Cumulative totals are <b>as of 30 June 2025</b>; the next annual report is expected April 2026.
                </div>
              </div>
              <section ref={kpiSectionRef} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-6">
                {kpiCards.map((k) => {
                  const Icon = k.icon;
                  return (
                    <button
                      key={k.label}
                      type="button"
                      disabled={isDashboardLocked}
                      onClick={() => runPrompt(k.prompt)}
                      className="group relative overflow-hidden rounded-[14px] border border-[#e2e6ee] bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#B8D9EE] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <span
                        role="presentation"
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyKpiPrompt(k.label, k.prompt);
                        }}
                        className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#00689D] opacity-0 transition group-hover:opacity-100"
                      >
                        <Copy size={11} />
                        {copiedKpi === k.label ? 'copied' : 'copy prompt'}
                      </span>
                      <div
                        className="mb-2.5 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
                        style={{ backgroundColor: k.iconBg }}
                      >
                        <Icon size={16} style={{ color: k.iconColor }} />
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wide text-[#6f8094]">
                        {k.label}
                      </div>
                      <div className="mt-0.5 text-[23px] font-semibold tracking-tight text-[#0b1a2c]">
                        {k.value}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#6f8094]">{k.sub}</div>
                    </button>
                  );
                })}
              </section>
            </ReportLoadItem>
          )}

          {resultMode && activeRecipe && (
            <div ref={resultSectionRef}>
              <SjfResultPanel
                recipe={activeRecipe}
                resultTitle={resultTitle}
                onBack={backToReport}
                onFollowUp={runPrompt}
              />
            </div>
          )}

          {!resultMode && (
            <section>
              {SCENES.map((s, i) => (
                <ReportLoadDeferred
                  key={s.num}
                  data-scene-index={i}
                  order={REPORT_LOAD_ORDER.scene(i)}
                  minHeight="280px"
                  className={cn(reportSceneSectionClassName, 'border-[#e2e6ee]')}
                >
                  <div
                    data-chart-root
                    className={cn(
                      reportSceneChartCardClassName,
                      'border-[#e2e6ee] shadow-[0_1px_2px_rgba(11,26,44,0.04),0_4px_16px_rgba(11,26,44,0.06)]',
                    )}
                  >
                    <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#6f8094]">
                      {s.cap}
                    </div>
                    <div className="mb-4 text-base font-semibold text-[#0b1a2c] sm:mb-5 sm:text-[18px]">
                      {s.ctitle}
                    </div>
                    <div className="w-full min-w-0">
                      <SjfSceneChart chart={getSceneChart(i, s.chart)} />
                    </div>
                  </div>
                  <AnimatedNarrative
                    className={cn(
                      reportSceneNarrativeClassName,
                      'transition-opacity duration-300',
                      activeScene === i ? 'opacity-100' : 'opacity-70',
                    )}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#00689D]">
                      {s.num}
                    </div>
                    <h3 className={cn(reportSceneTitleClassName, 'text-[#0b1a2c] lg:text-[25px]')}>
                      {s.title}
                    </h3>
                    <AnimatedStat
                      value={sceneStats[i]?.stat ?? s.stat}
                      className={cn(reportSceneStatClassName, 'text-[#00689D]')}
                    />
                    <p className="mt-1 text-[12.5px] text-[#6f8094]">
                      {sceneStats[i]?.statLbl ?? s.statLbl}
                    </p>
                    <p
                      className="mt-3.5 text-[14.5px] text-[#324559]"
                      dangerouslySetInnerHTML={{ __html: s.body }}
                    />
                    <ul className="mt-2 list-none">
                      {s.bullets.map((b) => (
                        <li
                          key={b}
                          className="relative border-t border-[#eef1f7] py-1.5 pl-5 text-[13.5px] text-[#324559] first:border-t-0"
                        >
                          <span className="absolute left-0.5 top-3.5 h-1.5 w-1.5 rounded-sm bg-[#00689D]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => runPrompt(s.ask)}
                      disabled={isQuerying}
                      className={cn(
                        reportSceneAskButtonClassName,
                        'rounded-[10px] border-[#B8D9EE] bg-[#E5F3FB] text-[#19486A] hover:bg-[#D7ECF8]',
                      )}
                    >
                      <Sparkles size={13} /> Ask: &quot;{s.ask}&quot;
                    </button>
                    {i === 0 && (
                      <div className="mt-4 flex flex-col items-center gap-1 text-[11px] text-[#6f8094]">
                        <span>scroll to explore</span>
                        <ChevronDown size={18} className="animate-bounce" />
                      </div>
                    )}
                  </AnimatedNarrative>
                </ReportLoadDeferred>
              ))}
            </section>
          )}

          {!resultMode && (
            <>
              <ReportLoadDeferred order={5 + SCENES.length}>
                <SjfPbiMirror />
              </ReportLoadDeferred>

              <ReportLoadDeferred order={6 + SCENES.length}>
                <section className="mt-8 rounded-[18px] bg-gradient-to-br from-[#0b1a2c] to-[#1a2e44] p-6 text-white">
                  <h2 className="report-display-title text-[20px] font-semibold">Forward Look — Strategic Signals</h2>
                  <p className="mb-5 mt-1 text-[13px] text-[#a8bccf]">
                    From the SJF Semi-Annual Report (Sep 2025) &quot;Looking Forward&quot; section and observable
                    trends in the data.
                  </p>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {FORWARD_CARDS.map((c, i) => {
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
                          <AnimatedStat
                            value={c[1]}
                            className="mt-2 block text-[24px] font-semibold"
                          />
                          <p className="mt-2 text-[12.5px] leading-snug text-[#bbcadc]">{c[2]}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </ReportLoadDeferred>
            </>
          )}
            </div>
          </div>
        </ReportChatLayout>
    </ReportPageShell>
  );
}
