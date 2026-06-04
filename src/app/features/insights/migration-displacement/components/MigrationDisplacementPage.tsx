import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Send, Sparkles, X } from 'lucide-react';
import { COLORS, FORWARD_ICONS, MIGRATION_CHIPS, MIGRATION_DATA, MIGRATION_KPI_BASE, MIGRATION_SCENES, MIGRATION_THEME } from '../data/migrationData';
import { useMigrationFilters } from '../hooks/useMigrationFilters';
import { MigrationDisplacementProps } from '../types';
import { MigrationSceneChart, HBars } from './MigrationCharts';
import { MultiSelectMenu } from '../../aid-flow/components/MultiSelectMenu';

export function MigrationDisplacementPage({ onBack }: MigrationDisplacementProps) {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<string[]>(['I read IOM DTM Emergency Trends Tracking data and can reshape the report for you.']);
  const [resultMode, setResultMode] = useState(false);
  const [resultTitle, setResultTitle] = useState('Displacement overview');
  const [activeScene, setActiveScene] = useState(0);
  const [openMenu, setOpenMenu] = useState<'time' | 'regions' | 'causes' | null>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filtersAppliedPulse, setFiltersAppliedPulse] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const {
    startYear, endYear, regions, causes, setStartYear, setEndYear, setRegions, setCauses,
    monthly, filteredRegions, filteredCauses, topDistricts, needsGapRows, totalArrivals, recentArrivals,
    topCause, topRegion, childrenPct, kpis, sceneStats, yearLabel, hasAnyFilter, K, Kf,
  } = useMigrationFilters();

  const chips = useMemo(() => MIGRATION_CHIPS, []);
  const regionOptions = useMemo(() => MIGRATION_DATA.regions.map(([name]) => name), []);
  const causeOptions = useMemo(() => MIGRATION_DATA.cause.map(([name]) => name), []);

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

  const runPrompt = (query?: string) => {
    const q = (query ?? promptInput).trim();
    if (!q) return;
    setMessages((prev) => [...prev, q, "I've built a summary, charts and district detail on the left."]);
    setResultTitle(q);
    setPromptInput('');
    setResultMode(true);
  };

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

  const kpiCards = MIGRATION_KPI_BASE.map((base, idx) => ({ ...base, value: kpis[idx].value, sub: kpis[idx].sub }));
  const forwardCards = [
    ['Drought outlook', topCause, 'Climate pressure remains a key movement trigger in current filters.'],
    ['Conflict pressure', 'Watch trends', 'Conflict spikes can quickly alter movement and destination patterns.'],
    ['Hub saturation', topRegion, 'Top receiving areas likely face sustained pressure on services.'],
    ['Response gap', '~94% unmet', 'Needs continue to outpace recorded response across sectors.'],
    ['Child protection', `${childrenPct}% children`, 'Child-focused support remains central in displacement response.'],
    ['Coverage caution', yearLabel, 'Interpret changes with attention to selected period and monitoring scope.'],
  ] as const;

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <div className="mx-auto max-w-[1780px]">
        <header className="sticky top-0 z-30 border-b border-[#ece6df] bg-[#f7f4ef]/95 px-[30px] py-[16px] backdrop-blur">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] text-[#8a7d72]">
            <button onClick={handleBreadcrumbBack} className="text-[#4a3f38] hover:text-[#c2562a]">Insights</button>
            <span>/</span>
            <b className="font-semibold text-[#4a3f38]">{MIGRATION_THEME.title}</b>
            <span className="rounded-full bg-[#e7f3f1] px-2 py-1 text-[11px] font-semibold text-[#1f7a6e]">IOM DTM · ETT weekly</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[30px] leading-[1.05] font-semibold text-[#1a1410]">{MIGRATION_THEME.title}</h1>
              <p className="mt-1 max-w-[580px] text-[13.5px] text-[#8a7d72]">{MIGRATION_THEME.subtitle}</p>
            </div>
            <div className="relative flex flex-wrap gap-2" ref={filterRef}>
              <div className="relative">
                <button onClick={() => setOpenMenu((prev) => (prev === 'time' ? null : 'time'))} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] ${openMenu === 'time' || startYear !== 2023 || endYear !== 2026 ? 'border-[#d8b9a2] bg-[#fbeee5] text-[#a3461f]' : 'border-[#ece6df] bg-white text-[#4a3f38]'}`}>{yearLabel}<ChevronDown size={13} /></button>
                {openMenu === 'time' && (
                  <div className="absolute right-0 top-[44px] z-40 w-[320px] rounded-xl border border-[#ece6df] bg-white p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between border-b border-[#f3efe9] pb-2"><span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8a7d72]">Year Range</span>{(startYear !== 2023 || endYear !== 2026) && <button onClick={() => clearMenu('time')} className="text-[11px] text-[#c2562a]">Clear Filters</button>}</div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#ece6df] px-2 py-1.5"><span className="text-[11px] text-[#8a7d72]">Start</span><select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="bg-transparent text-[12px] text-[#4a3f38] outline-none">{[2023, 2024, 2025, 2026].map((year) => <option key={`start-${year}`} value={year}>{year}</option>)}</select></div>
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#ece6df] px-2 py-1.5"><span className="text-[11px] text-[#8a7d72]">End</span><select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="bg-transparent text-[12px] text-[#4a3f38] outline-none">{[2023, 2024, 2025, 2026].map((year) => <option key={`end-${year}`} value={year}>{year}</option>)}</select></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setOpenMenu((prev) => (prev === 'regions' ? null : 'regions'))} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] ${openMenu === 'regions' || regions.length > 0 ? 'border-[#d8b9a2] bg-[#fbeee5] text-[#a3461f]' : 'border-[#ece6df] bg-white text-[#4a3f38]'}`}>{regions.length > 0 ? `Regions (${regions.length})` : 'All Regions'}<ChevronDown size={13} /></button>
                {openMenu === 'regions' && <MultiSelectMenu title="Regions" options={regionOptions} selected={regions} onToggle={(v) => toggleItem(v, setRegions)} onClear={() => clearMenu('regions')} />}
              </div>
              <div className="relative">
                <button onClick={() => setOpenMenu((prev) => (prev === 'causes' ? null : 'causes'))} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] ${openMenu === 'causes' || causes.length > 0 ? 'border-[#d8b9a2] bg-[#fbeee5] text-[#a3461f]' : 'border-[#ece6df] bg-white text-[#4a3f38]'}`}>{causes.length > 0 ? `Causes (${causes.length})` : 'All Causes'}<ChevronDown size={13} /></button>
                {openMenu === 'causes' && <MultiSelectMenu title="Causes" options={causeOptions} selected={causes} onToggle={(v) => toggleItem(v, setCauses)} onClear={() => clearMenu('causes')} />}
              </div>
              <div className="flex items-center">{hasAnyFilter ? <button onClick={clearAllFilters} className={`inline-flex items-center text-[11px] font-medium transition ${isApplyingFilters ? 'text-[#a3461f]' : filtersAppliedPulse ? 'text-[#1f7a6e]' : 'text-[#8a7d72] hover:text-[#a3461f]'}`}><X size={11} className="mr-1" />{isApplyingFilters ? 'Applying filters...' : 'Clear All Filters'}</button> : null}</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_372px]">
          <main className="px-[30px] pb-20 pt-6">
            <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              {kpiCards.map((k) => (
                <button key={k.label} onClick={() => runPrompt(k.prompt)} className="relative rounded-[14px] border border-[#ece6df] bg-white px-[18px] pb-[16px] pt-[14px] text-left transition hover:-translate-y-0.5 hover:border-[#e4d6c5] hover:shadow-lg">
                  <div className="mb-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px]" style={{ backgroundColor: k.iconBg }}><k.icon size={14} style={{ color: k.iconColor }} /></div>
                  <div className="mb-1 text-[10.5px] uppercase tracking-[0.04em] text-[#8a7d72]">{k.label}</div>
                  <div className="text-[23px] font-semibold text-[#1a1410]">{k.value}</div>
                  <div className="mt-1 text-[11px] text-[#8a7d72]">{k.sub}</div>
                  <span className="absolute right-[12px] top-[12px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: k.color }} />
                </button>
              ))}
            </section>

            {!resultMode && (
              <section>
                {MIGRATION_SCENES.map((s, i) => (
                  <div key={s.num} data-scene-index={i} className={`grid min-h-[72vh] grid-cols-1 items-center gap-[26px] border-t border-dashed border-[#ece6df] py-[30px] lg:grid-cols-[minmax(0,1.25fr)_360px] ${i === 0 ? 'border-t-0' : ''}`}>
                    <div className="sticky top-[120px] flex min-h-[430px] w-full flex-col justify-center rounded-[18px] border border-[#ece6df] bg-white p-6 shadow-sm">
                      <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#8a7d72]">{s.cap}</div>
                      <div className="mb-5 text-[18px] font-semibold text-[#1a1410]">{s.ctitle}</div>
                      <MigrationSceneChart index={i} K={K} totalArrivals={totalArrivals} recentArrivals={recentArrivals} causes={filteredCauses} monthly={monthly} demo={{ children: Math.round(MIGRATION_DATA.demo.children), women: Math.round(MIGRATION_DATA.demo.women), men: Math.round(MIGRATION_DATA.demo.men) }} regions={filteredRegions} gapRows={needsGapRows} stay={MIGRATION_DATA.stay} />
                    </div>
                    <article className={`transition ${activeScene === i ? 'opacity-100' : 'opacity-70'}`}>
                      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c2562a]">{s.num}</div>
                      <h3 className="mt-2 text-[20px] font-semibold leading-[1.12] text-[#1a1410]">{s.title}</h3>
                      <div className="mt-3 text-[38px] font-semibold leading-none text-[#c2562a]">{sceneStats[i]?.stat ?? s.stat}</div>
                      <p className="mt-1 text-[12.5px] text-[#8a7d72]">{sceneStats[i]?.statLbl ?? s.statLbl}</p>
                      <p className="mt-4 text-[14.5px] text-[#4a3f38]">{s.body}</p>
                      <ul className="mt-2">{s.bullets.map((b) => <li key={b} className="flex items-start gap-3 border-t border-[#f3efe9] py-2 text-[13.5px] text-[#4a3f38]"><span className="mt-[7px] inline-block h-[8px] w-[8px] shrink-0 rounded-[2px] bg-[#c2562a]" /><span>{b}</span></li>)}</ul>
                      <button onClick={() => runPrompt(s.ask)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#f0d8c5] bg-[#fbeee5] px-3 py-2 text-[12.5px] font-semibold text-[#a3461f]"><Sparkles size={13} /> Ask: "{s.ask}"</button>
                    </article>
                  </div>
                ))}
              </section>
            )}

            {resultMode && (
              <section>
                <div className="mb-4 flex items-center justify-between rounded-[14px] border border-[#f0d8c5] bg-gradient-to-r from-[#fbeee5] to-[#fdf6ec] px-4 py-3">
                  <div className="text-[13.5px] font-semibold text-[#1a1410]">AI-generated from IOM DTM data: {resultTitle}</div>
                  <button onClick={() => setResultMode(false)} className="rounded-lg border border-[#f0d8c5] bg-white px-3 py-2 text-[12px] font-semibold text-[#c2562a]">Back to report</button>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#ece6df] bg-white p-5 lg:col-span-2">
                    <h4 className="mb-2 text-[14px] font-semibold text-[#1a1410]">Summary</h4>
                    <p className="text-[14px] text-[#4a3f38]">Movement remains climate-led but increasingly conflict-influenced, concentrated in a few destination hubs, with response still lagging behind reported needs.</p>
                  </div>
                  <div className="rounded-2xl border border-[#ece6df] bg-white p-5">
                    <h4 className="mb-2 text-[14px] font-semibold text-[#1a1410]">Top causes</h4>
                    <HBars rows={filteredCauses} formatter={K} color={COLORS.drought} />
                  </div>
                  <div className="rounded-2xl border border-[#ece6df] bg-white p-5">
                    <h4 className="mb-2 text-[14px] font-semibold text-[#1a1410]">Top regions</h4>
                    <HBars rows={filteredRegions.map((r) => [r[0], r[1], COLORS.brand])} formatter={K} color={COLORS.brand} />
                  </div>
                  <div className="rounded-2xl border border-[#ece6df] bg-white p-5 lg:col-span-2">
                    <h4 className="mb-2 text-[14px] font-semibold text-[#1a1410]">Top destination districts</h4>
                    <div className="space-y-1">{topDistricts.map((row) => <div key={row[0]} className="flex items-center justify-between border-b border-[#f3efe9] py-2 text-[12.5px]"><span className="font-medium text-[#1a1410]">{row[0]}</span><span className="text-[#8a7d72]">{row[2]}</span><span className="text-[#4a3f38]">{Kf(row[1])}</span></div>)}</div>
                  </div>
                </div>
              </section>
            )}

            <section className="mt-8 rounded-[18px] bg-gradient-to-br from-[#1a1410] to-[#2e231b] p-6 text-white">
              <h2 className="text-[20px] font-semibold">Forward Look - Predictive Insights</h2>
              <p className="mb-5 mt-1 text-[13px] text-[#c9b8a8]">Signals from displacement patterns and response trends in active filters.</p>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {forwardCards.map((c, i) => {
                  const Icon = FORWARD_ICONS[i];
                  return (
                    <div key={c[0]} className="rounded-[14px] border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px]" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}><Icon size={17} /></div>
                      <div className="text-[14px] font-semibold">{c[0]}</div>
                      <div className="mt-2 text-[24px] font-semibold">{c[1]}</div>
                      <p className="mt-2 text-[12.5px] text-[#cbbdaf]">{c[2]}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>

          <aside className="sticky top-[84px] hidden h-[calc(100vh-104px)] flex-col border-l border-[#ece6df] bg-white xl:flex">
            <div className="border-b border-[#ece6df] px-4 py-3">
              <div className="flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c2562a] to-[#d99a21] text-white"><Sparkles size={14} /></span><h3 className="text-[15px] font-semibold text-[#1a1410]">Ask Displacement</h3></div>
              <p className="mt-1 text-[11.5px] text-[#8a7d72]">Ask about causes, regions, demographics, needs, or trends.</p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => <div key={`${m}-${i}`} className={`rounded-xl px-3 py-2 text-[12.5px] ${i % 2 ? 'ml-8 bg-[#fbeee5] text-[#a3461f]' : 'mr-6 border border-[#ece6df] bg-[#faf7f2] text-[#4a3f38]'}`}>{m}</div>)}
              <div className="flex flex-wrap gap-2">{chips.map((chip) => <button key={chip} onClick={() => runPrompt(chip)} className="rounded-full border border-[#ece6df] px-3 py-1.5 text-[11.5px] text-[#4a3f38] hover:border-[#c2562a] hover:text-[#c2562a]">{chip}</button>)}</div>
            </div>
            <div className="border-t border-[#ece6df] p-3">
              <div className="flex items-end gap-2 rounded-xl border border-[#ece6df] bg-[#f7f4ef] px-3 py-2">
                <textarea value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Ask anything about displacement..." className="min-h-[36px] max-h-[90px] flex-1 resize-none bg-transparent text-[12.8px] text-[#1a1410] outline-none" />
                <button onClick={() => runPrompt()} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#c2562a] text-white hover:bg-[#a3461f]"><Send size={14} /></button>
              </div>
              <div className="mt-2 text-center text-[10px] text-[#8a7d72]">AI can make mistakes. Verify critical insights.</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
