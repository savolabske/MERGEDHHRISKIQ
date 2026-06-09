import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Calendar, ChevronDown, Send, Shield, Sparkles, X } from 'lucide-react';
import {
  AI_CHIPS,
  DONOR_OPTIONS,
  FORWARD_CARDS,
  SCENES,
  SJF_DATA,
  SJF_THEME,
  UN_ENTITY_OPTIONS,
  WINDOW_OPTIONS,
} from '../data/sjfData';
import { useSjfFilters } from '../hooks/useSjfFilters';
import { useSjfReportPrompt } from '../hooks/useSjfReportPrompt';
import type { SjfScrollytellingProps } from '../types';
import { SjfSceneChart } from './SjfCharts';
import { SjfResultPanel } from './SjfResultPanel';
import { MultiSelectMenu } from '../../aid-flow/components/MultiSelectMenu';
import {
  AnimatedAIResponse,
  AnimatedNarrative,
  AnimatedStat,
  ReportChatLayout,
  ReportLoadDeferred,
  ReportLoadItem,
  REPORT_LOAD_ORDER,
  ReportThinkingIndicator,
  reportChatAsideClassName,
} from '../../shared';
import { cn } from '../../../../components/ui/utils';

const FORWARD_ICONS = [Sparkles, AlertTriangle, Calendar, Shield, Sparkles, Shield];

export function SjfScrollytellingPage({ onBack }: SjfScrollytellingProps) {
  const [activeScene, setActiveScene] = useState(0);
  const [openMenu, setOpenMenu] = useState<'time' | 'windows' | 'donors' | 'entities' | null>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filtersAppliedPulse, setFiltersAppliedPulse] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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
    filteredDonorsAllTime,
    filteredDonorsH1,
    filteredPunoH1,
    filteredWindows,
    filteredYearly,
    topProgrammesBars,
    gapBars,
    kpiCards,
    sceneStats,
  } = useSjfFilters();

  const {
    promptInput,
    setPromptInput,
    messages,
    resultMode,
    resultTitle,
    activeRecipe,
    isQuerying,
    resultSectionRef,
    chatScrollRef,
    runPrompt,
    backToReport,
  } = useSjfReportPrompt();

  const chips = useMemo(() => AI_CHIPS, []);
  const achievements = SJF_DATA.achievements_H1_2025;

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

  const filterActiveClass = 'border-[#0b6b5d] bg-[#e3f0ed] text-[#054f43]';
  const filterIdleClass = 'border-[#e2e6ee] bg-white text-[#324559]';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f4f6fa]">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1780px] flex-col">
        <header className="shrink-0 border-b border-[#e2e6ee] bg-[#f4f6fa]/95 px-[30px] py-[16px] backdrop-blur">
          <ReportLoadItem order={REPORT_LOAD_ORDER.breadcrumb}>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[12.5px] text-[#6f8094]">
              <button onClick={handleBreadcrumbBack} className="text-[#324559] hover:text-[#0b6b5d]">
                Insights
              </button>
              <span>/</span>
              <b className="font-semibold text-[#324559]">Somalia Joint Fund</b>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f0ed] px-2 py-1 text-[11px] font-semibold text-[#0b6b5d]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0b6b5d]" />
                {SJF_THEME.sourceBadge}
              </span>
            </div>
          </ReportLoadItem>
          <div className="flex items-end justify-between gap-4">
            <ReportLoadItem order={REPORT_LOAD_ORDER.title} className="min-w-0 flex-1">
              <h1 className="text-[30px] leading-[1.05] font-semibold text-[#0b1a2c]">
                {SJF_THEME.title}
              </h1>
              <p className="mt-1 max-w-[580px] text-[13.5px] text-[#6f8094]">{SJF_THEME.subtitle}</p>
            </ReportLoadItem>
            <ReportLoadItem order={REPORT_LOAD_ORDER.filters}>
              <div className="relative flex shrink-0 flex-wrap justify-end gap-2" ref={filterRef}>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu((prev) => (prev === 'time' ? null : 'time'))}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px]',
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
                    <div className="absolute right-0 top-[44px] z-40 w-[320px] rounded-xl border border-[#e2e6ee] bg-white p-3 shadow-lg">
                      <div className="mb-2 flex items-center justify-between border-b border-[#eef1f7] pb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6f8094]">
                          Year Range
                        </span>
                        {(startYear !== 2014 || endYear !== 2025) && (
                          <button onClick={() => clearMenu('time')} className="text-[11px] text-[#0b6b5d]">
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
                    onClick={() => setOpenMenu((prev) => (prev === 'windows' ? null : 'windows'))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px]',
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
                    onClick={() => setOpenMenu((prev) => (prev === 'donors' ? null : 'donors'))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px]',
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
                    onClick={() => setOpenMenu((prev) => (prev === 'entities' ? null : 'entities'))}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px]',
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

                {hasAnyFilter ? (
                  <button
                    onClick={clearAllFilters}
                    className={cn(
                      'inline-flex items-center text-[11px] font-medium transition',
                      isApplyingFilters
                        ? 'text-[#054f43]'
                        : filtersAppliedPulse
                          ? 'text-[#0b6b5d]'
                          : 'text-[#6f8094] hover:text-[#054f43]',
                    )}
                  >
                    <X size={11} className="mr-1" />
                    {isApplyingFilters ? 'Applying filters...' : 'Clear All Filters'}
                  </button>
                ) : null}
              </div>
            </ReportLoadItem>
          </div>
        </header>

        <ReportChatLayout
          className="min-h-0 flex-1"
          mainClassName="px-[30px] pb-20 pt-6"
          chatPanel={
            <ReportLoadItem
              order={REPORT_LOAD_ORDER.chat}
              className={cn(reportChatAsideClassName, 'border-l border-[#e2e6ee] bg-white')}
            >
              <aside className="flex h-full min-h-0 flex-col">
                <div className="border-b border-[#e2e6ee] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0b6b5d] to-[#1e3a5f] text-white">
                      <Sparkles size={14} />
                    </span>
                    <h3 className="text-[15px] font-semibold text-[#0b1a2c]">Ask SJF</h3>
                    <span className="rounded-md bg-[#e3f0ed] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#0b6b5d]">
                      BETA
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-[#6f8094]">
                    Ask about donors, windows, programmes, results or financials. The dashboard on the left
                    reshapes to answer.
                  </p>
                </div>
                <div ref={chatScrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m, i) => (
                    <AnimatedAIResponse
                      key={`${m}-${i}`}
                      messageKey={`sjf-msg-${i}-${m}`}
                      animate={i > 0}
                      className={cn(
                        'rounded-xl px-3 py-2 text-[12.5px]',
                        i % 2 === 0
                          ? 'ml-8 bg-[#e3f0ed] text-[#054f43]'
                          : 'mr-6 border border-[#e2e6ee] bg-[#f8fafc] text-[#324559]',
                      )}
                    >
                      {m}
                    </AnimatedAIResponse>
                  ))}
                  {isQuerying && (
                    <ReportThinkingIndicator
                      accentColor="#0b6b5d"
                      className="ml-8 bg-[#e3f0ed]"
                      textClassName="text-[#054f43]"
                    />
                  )}
                  {messages.length === 0 && !isQuerying && (
                    <div className="flex flex-wrap gap-2">
                      {chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => runPrompt(chip)}
                          className="rounded-full border border-[#e2e6ee] px-3 py-1.5 text-[11.5px] text-[#324559] hover:border-[#0b6b5d] hover:text-[#0b6b5d]"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-[#e2e6ee] p-3">
                  <div className="flex items-end gap-2 rounded-xl border border-[#e2e6ee] bg-[#f4f6fa] px-3 py-2 focus-within:border-[#0b6b5d] focus-within:ring-2 focus-within:ring-[#e3f0ed]">
                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      disabled={isQuerying}
                      placeholder="Ask about the SJF…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          runPrompt();
                        }
                      }}
                      className="min-h-[36px] max-h-[90px] flex-1 resize-none bg-transparent text-[12.8px] text-[#0b1a2c] outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={() => runPrompt()}
                      disabled={isQuerying}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b6b5d] text-white hover:bg-[#054f43] disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                  <div className="mt-2 text-center text-[10px] text-[#6f8094]">
                    AI can make mistakes. Verify critical insights.
                  </div>
                </div>
              </aside>
            </ReportLoadItem>
          }
        >
          {isQuerying && !resultMode && (
            <div className="mb-4 xl:hidden">
              <ReportThinkingIndicator accentColor="#0b6b5d" className="bg-[#e3f0ed]" />
            </div>
          )}

          {!resultMode && (
            <ReportLoadItem order={REPORT_LOAD_ORDER.kpis}>
              <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-6">
                {kpiCards.map((k) => {
                  const Icon = k.icon;
                  return (
                    <button
                      key={k.label}
                      onClick={() => runPrompt(k.prompt)}
                      className="group relative overflow-hidden rounded-[14px] border border-[#e2e6ee] bg-white p-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#c8d8d3] hover:shadow-lg"
                    >
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
                  minHeight="72vh"
                  className="grid grid-cols-1 items-center gap-6 border-t border-dashed border-[#e2e6ee] py-8 first:border-t-0 lg:grid-cols-[1fr_360px]"
                >
                  <div data-chart-root className="sticky top-6 rounded-[18px] border border-[#e2e6ee] bg-white p-6 shadow-sm">
                    <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-[#6f8094]">
                      {s.cap}
                    </div>
                    <div className="mb-4 text-[18px] font-semibold text-[#0b1a2c]">{s.ctitle}</div>
                    <SjfSceneChart
                      index={i}
                      donorsAllTime={filteredDonorsAllTime}
                      donorsH1={filteredDonorsH1}
                      yearly={filteredYearly}
                      windows={filteredWindows}
                      punoH1={filteredPunoH1}
                      topProgrammes={topProgrammesBars}
                      achievements={achievements}
                      gapBars={gapBars}
                    />
                  </div>
                  <AnimatedNarrative
                    className={cn('transition-opacity duration-300', activeScene === i ? 'opacity-100' : 'opacity-70')}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b6b5d]">
                      {s.num}
                    </div>
                    <h3 className="mt-2 text-[25px] leading-tight font-semibold text-[#0b1a2c]">{s.title}</h3>
                    <AnimatedStat
                      value={sceneStats[i]?.stat ?? s.stat}
                      className="mt-2 block text-[42px] leading-none font-semibold text-[#0b6b5d]"
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
                          <span className="absolute left-0.5 top-3.5 h-1.5 w-1.5 rounded-sm bg-[#0b6b5d]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => runPrompt(s.ask)}
                      disabled={isQuerying}
                      className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#b6d4cc] bg-[#e3f0ed] px-3 py-2 text-[12.5px] font-semibold text-[#054f43] hover:bg-[#cfe5e0] disabled:opacity-50"
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
            <ReportLoadDeferred order={REPORT_LOAD_ORDER.forwardLook(SCENES.length)}>
              <section className="mt-8 rounded-[18px] bg-gradient-to-br from-[#0b1a2c] to-[#1a2e44] p-6 text-white">
                <h2 className="text-[20px] font-semibold">Forward Look — Strategic Signals</h2>
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
                        <AnimatedStat value={c[1]} className="mt-2 block text-[24px] font-semibold" />
                        <p className="mt-2 text-[12.5px] leading-snug text-[#bbcadc]">{c[2]}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </ReportLoadDeferred>
          )}
        </ReportChatLayout>
      </div>
    </div>
  );
}
