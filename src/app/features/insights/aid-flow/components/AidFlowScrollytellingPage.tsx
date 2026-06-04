import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Calendar, Check, ChevronDown, Layers, MapPin, Send, Sparkles, TrendingDown, X } from 'lucide-react';
import { AI_CHIPS, COLORS, DONOR_OPTIONS, FORWARD_ICONS, REGION_OPTIONS, SCENES, SECTOR_OPTIONS } from '../data/aidFlowData';
import { useAidFlowFilters } from '../hooks/useAidFlowFilters';
import { AidFlowSceneChart, HBars, ProjectsTable, RegionBars } from './AidFlowCharts';
import { MultiSelectMenu } from './MultiSelectMenu';

interface AidFlowScrollytellingProps { onBack?: () => void; }

export function AidFlowScrollytellingPage({ onBack }: AidFlowScrollytellingProps) {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<string[]>(['I can read the AIMS + Somalia Stabilization Fund data and reshape the dashboard for you.']);
  const [resultMode, setResultMode] = useState(false);
  const [resultTitle, setResultTitle] = useState('Aid flow overview');
  const [activeScene, setActiveScene] = useState(0);
  const [openMenu, setOpenMenu] = useState<'time' | 'donors' | 'sectors' | 'regions' | null>(null);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [filtersAppliedPulse, setFiltersAppliedPulse] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const {
    selectedDonors, setSelectedDonors, selectedSectors, setSelectedSectors, selectedRegions, setSelectedRegions,
    startYear, setStartYear, endYear, setEndYear, yearLabel, hasAnyFilter, minYear, maxYear, combinedScale,
    filteredDonors, filteredSectors, filteredRegions, filteredHum, filteredDev, trendRows, filteredImplementers,
    filteredMarkers, projectsForTable, kpiCards, sceneStats, forwardCards, filteredEnvelope, filteredActual, filteredPlanned,
  } = useAidFlowFilters();

  useEffect(() => {
    const onScroll = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-scene-index]');
      let next = 0;
      nodes.forEach((node, idx) => { if (node.getBoundingClientRect().top <= window.innerHeight * 0.35) next = idx; });
      setActiveScene(next);
    };
    onScroll();
    const scrollRoot = document.querySelector<HTMLElement>('[data-report-scroll]') ?? window;
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollRoot.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (!filterRef.current?.contains(event.target as Node)) setOpenMenu(null); };
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setIsApplyingFilters(true);
    const applyTimer = window.setTimeout(() => { setIsApplyingFilters(false); setFiltersAppliedPulse(true); }, 220);
    const pulseTimer = window.setTimeout(() => { setFiltersAppliedPulse(false); }, 1300);
    return () => { window.clearTimeout(applyTimer); window.clearTimeout(pulseTimer); };
  }, [selectedDonors, selectedSectors, selectedRegions, startYear, endYear]);

  const chips = useMemo(() => AI_CHIPS, []);

  const runPrompt = (query?: string) => {
    const q = (query ?? promptInput).trim();
    if (!q) return;
    setMessages((prev) => [...prev, q, "I've built a summary, charts and a project table on the left."]);
    setResultTitle(q);
    setPromptInput('');
    setResultMode(true);
  };

  const toggleItem = (value: string, setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const clearMenu = (menu: 'donors' | 'sectors' | 'regions' | 'time') => {
    if (menu === 'donors') setSelectedDonors([]);
    if (menu === 'sectors') setSelectedSectors([]);
    if (menu === 'regions') setSelectedRegions([]);
    if (menu === 'time') { setStartYear(2014); setEndYear(2026); }
  };

  const clearAllFilters = () => {
    setSelectedDonors([]);
    setSelectedSectors([]);
    setSelectedRegions([]);
    setStartYear(2014);
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

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="mx-auto max-w-[1780px]">
        <header className="sticky top-0 z-30 border-b border-[#e6e9ef] bg-[#f6f7f9]/95 px-[30px] py-[16px] backdrop-blur">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] text-[#6b7a8d]">
            <button onClick={handleBreadcrumbBack} className="text-[#3a4a5c] hover:text-[#1f6feb]">Insights</button>
            <span>/</span>
            <b className="font-semibold text-[#3a4a5c]">Aid Flow Intelligence</b>
            <span className="rounded-full bg-[#eafaf0] px-2 py-1 text-[11px] font-semibold text-[#3fa85a]">AIMS + SSF - synced nightly</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[30px] leading-[1.05] font-semibold text-[#0d1b2a]">Aid Flow Intelligence</h1>
              <p className="mt-1 max-w-[560px] text-[13.5px] text-[#6b7a8d]">Explore how development and humanitarian funding is flowing across Somalia. Scroll for the picture, or ask a question to reshape it.</p>
            </div>
            <div className="relative flex flex-wrap gap-2" ref={filterRef}>
              <div className="relative">
                <button onClick={() => setOpenMenu((prev) => (prev === 'time' ? null : 'time'))} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] ${openMenu === 'time' || startYear !== 2014 || endYear !== 2026 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}>
                  <Calendar size={13} />{yearLabel}<ChevronDown size={13} />
                </button>
                {openMenu === 'time' && (
                  <div className="absolute right-0 top-[44px] z-40 w-[320px] rounded-xl border border-[#e6e9ef] bg-white p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between border-b border-[#eef1f6] pb-2"><span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7a8d]">Year Range</span>{(startYear !== 2014 || endYear !== 2026) && <button onClick={() => clearMenu('time')} className="text-[11px] text-[#1f6feb]">Clear Filters</button>}</div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#e6e9ef] px-2 py-1.5"><span className="text-[11px] text-[#6b7a8d]">Start</span><select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="bg-transparent text-[12px] text-[#3a4a5c] outline-none">{Array.from({ length: 13 }, (_, i) => 2014 + i).map((year) => <option key={`start-${year}`} value={year}>{year}</option>)}</select></div>
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#e6e9ef] px-2 py-1.5"><span className="text-[11px] text-[#6b7a8d]">End</span><select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="bg-transparent text-[12px] text-[#3a4a5c] outline-none">{Array.from({ length: 13 }, (_, i) => 2014 + i).map((year) => <option key={`end-${year}`} value={year}>{year}</option>)}</select></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setOpenMenu((prev) => (prev === 'donors' ? null : 'donors'))} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] ${openMenu === 'donors' || selectedDonors.length > 0 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}>
                  {selectedDonors.length > 0 ? `Donors (${selectedDonors.length})` : 'All Donors'}<ChevronDown size={13} />
                </button>
                {openMenu === 'donors' && <MultiSelectMenu title="Donors" options={DONOR_OPTIONS} selected={selectedDonors} onToggle={(v) => toggleItem(v, setSelectedDonors)} onClear={() => clearMenu('donors')} />}
              </div>
              <div className="relative">
                <button onClick={() => setOpenMenu((prev) => (prev === 'sectors' ? null : 'sectors'))} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] ${openMenu === 'sectors' || selectedSectors.length > 0 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}>
                  {selectedSectors.length > 0 ? `Sectors (${selectedSectors.length})` : 'All Sectors'}<ChevronDown size={13} />
                </button>
                {openMenu === 'sectors' && <MultiSelectMenu title="Sectors" options={SECTOR_OPTIONS} selected={selectedSectors} onToggle={(v) => toggleItem(v, setSelectedSectors)} onClear={() => clearMenu('sectors')} />}
              </div>
              <div className="relative">
                <button onClick={() => setOpenMenu((prev) => (prev === 'regions' ? null : 'regions'))} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] ${openMenu === 'regions' || selectedRegions.length > 0 ? 'border-[#2a7fe0] bg-[#eaf1fe] text-[#1550b3]' : 'border-[#e6e9ef] bg-white text-[#3a4a5c]'}`}>
                  {selectedRegions.length > 0 ? `Regions (${selectedRegions.length})` : 'All Regions'}<ChevronDown size={13} />
                </button>
                {openMenu === 'regions' && <MultiSelectMenu title="Regions" options={REGION_OPTIONS} selected={selectedRegions} onToggle={(v) => toggleItem(v, setSelectedRegions)} onClear={() => clearMenu('regions')} />}
              </div>
              <div className="flex items-center">{hasAnyFilter ? <button onClick={clearAllFilters} className={`inline-flex items-center text-[11px] font-medium transition ${isApplyingFilters ? 'text-[#1550b3]' : filtersAppliedPulse ? 'text-[#2d8a4c]' : 'text-[#6b7a8d] hover:text-[#1550b3]'}`}><X size={11} className="mr-1" />{isApplyingFilters ? 'Applying filters...' : 'Clear All Filters'}</button> : null}</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_372px]">
          <main className="px-[30px] pb-20 pt-6">
            <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">{kpiCards.map((k) => <button key={k.label} onClick={() => runPrompt(k.prompt)} className="relative rounded-[14px] border border-[#e6e9ef] bg-white px-[18px] pb-[16px] pt-[14px] text-left transition hover:-translate-y-0.5 hover:border-[#d4def0] hover:shadow-lg"><div className="mb-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px]" style={{ backgroundColor: k.iconBg }}><k.icon size={14} style={{ color: k.iconColor }} /></div><div className="mb-1 text-[10.5px] uppercase tracking-[0.04em] text-[#6b7a8d]">{k.label}</div><div className="text-[23px] font-semibold text-[#0d1b2a]">{k.value}</div><div className="mt-1 text-[11px] text-[#6b7a8d]">{k.sub}</div><span className="absolute right-[12px] top-[12px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: k.color }} /></button>)}</section>
            {!resultMode && <section>{SCENES.map((s, i) => <div key={s.num} data-scene-index={i} className={`grid min-h-[72vh] grid-cols-1 items-center gap-[26px] border-t border-dashed border-[#e6e9ef] py-[30px] lg:grid-cols-[minmax(0,1.25fr)_360px] ${i === 0 ? 'border-t-0' : ''}`}><div className="sticky top-[120px] flex min-h-[430px] w-full flex-col justify-center rounded-[18px] border border-[#e6e9ef] bg-white p-6 shadow-sm"><div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#6b7a8d]">{s.cap}</div><div className="mb-5 text-[18px] font-semibold text-[#0d1b2a]">{s.ctitle}</div><AidFlowSceneChart index={i} totals={{ envelope: filteredEnvelope, actual: filteredActual, planned: filteredPlanned }} donors={filteredDonors} sectors={filteredSectors} trendRows={trendRows} regions={filteredRegions.filter((l) => l[0] !== 'FGS (federal)')} hum={filteredHum} dev={filteredDev} implementers={filteredImplementers} markers={filteredMarkers} /></div><article className={`transition ${activeScene === i ? 'opacity-100' : 'opacity-70'}`}><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1f6feb]">{s.num}</div><h3 className="mt-2 text-[20px] font-semibold leading-[1.12] text-[#0d1b2a]">{s.title}</h3><div className="mt-3 text-[38px] font-semibold leading-none text-[#1f6feb]">{sceneStats[i]?.stat ?? s.stat}</div><p className="mt-1 text-[12.5px] text-[#6b7a8d]">{sceneStats[i]?.statLbl ?? s.statLbl}</p><p className="mt-4 text-[14.5px] text-[#3a4a5c]" dangerouslySetInnerHTML={{ __html: s.body }} /><ul className="mt-2">{s.bullets.map((b) => <li key={b} className="flex items-start gap-3 border-t border-[#eef1f6] py-2 text-[13.5px] text-[#3a4a5c]"><span className="mt-[7px] inline-block h-[8px] w-[8px] shrink-0 rounded-[2px] bg-[#2a7fe0]" /><span>{b}</span></li>)}</ul><button onClick={() => runPrompt(s.ask)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#cfe0fd] bg-[#eaf1fe] px-3 py-2 text-[12.5px] font-semibold text-[#1550b3]"><Sparkles size={13} /> Ask: "{s.ask}"</button></article></div>)}</section>}
            {resultMode && <section><div className="mb-4 flex items-center justify-between rounded-[14px] border border-[#cfe0fd] bg-gradient-to-r from-[#eaf1fe] to-[#e6f7f4] px-4 py-3"><div className="text-[13.5px] font-semibold text-[#0d1b2a]">AI-generated from AIMS + SSF data: {resultTitle}</div><button onClick={() => setResultMode(false)} className="rounded-lg border border-[#cfe0fd] bg-white px-3 py-2 text-[12px] font-semibold text-[#1f6feb]">Back to report</button></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 lg:col-span-2"><h4 className="mb-2 text-[14px] font-semibold text-[#0d1b2a]">Summary</h4><p className="text-[14px] text-[#3a4a5c]">Somalia aid flows remain concentrated by donor, sector, and delivery channel. Food Security dominates allocation, WFP dominates delivery, and planned 2025 commitments imply notable pipeline risk if conversion lags.</p></div><div className="rounded-2xl border border-[#e6e9ef] bg-white p-5"><h4 className="mb-2 text-[14px] font-semibold text-[#0d1b2a]">Top donors</h4><HBars rows={filteredDonors.slice(0, 6)} /></div><div className="rounded-2xl border border-[#e6e9ef] bg-white p-5"><h4 className="mb-2 text-[14px] font-semibold text-[#0d1b2a]">Regional distribution</h4><RegionBars regions={filteredRegions.filter((l) => l[0] !== 'FGS (federal)')} /></div><div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 lg:col-span-2"><h4 className="mb-2 text-[14px] font-semibold text-[#0d1b2a]">Top projects</h4><ProjectsTable rows={projectsForTable} /></div></div></section>}
            <section className="mt-8 rounded-[18px] bg-gradient-to-br from-[#0d1b2a] to-[#16263a] p-6 text-white"><h2 className="text-[20px] font-semibold">Forward Look - Predictive Insights</h2><p className="mb-5 mt-1 text-[13px] text-[#9fb3c8]">Modelled from AIMS commitments + Somalia Stabilization Fund pipeline. Directional, not guaranteed.</p><div className="grid grid-cols-1 gap-3 lg:grid-cols-3">{forwardCards.map((c, i) => { const Icon = FORWARD_ICONS[i]; return <div key={c[0]} className="rounded-[14px] border border-white/10 bg-white/5 p-4"><div className="mb-3 inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px]" style={{ backgroundColor: c[3] }}><Icon size={17} /></div><div className="text-[14px] font-semibold">{c[0]}</div><div className="mt-2 text-[24px] font-semibold">{c[1]}</div><p className="mt-2 text-[12.5px] text-[#aebfd0]">{c[2]}</p></div>; })}</div></section>
          </main>
          <aside className="sticky top-[84px] hidden h-[calc(100vh-104px)] flex-col border-l border-[#e6e9ef] bg-white xl:flex"><div className="border-b border-[#e6e9ef] px-4 py-3"><div className="flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1f6feb] to-[#16a39a] text-white"><Sparkles size={14} /></span><h3 className="text-[15px] font-semibold text-[#0d1b2a]">Ask Aid Flow</h3></div><p className="mt-1 text-[11.5px] text-[#6b7a8d]">Ask about donors, sectors, regions or trends. Answers reshape the dashboard on the left.</p></div><div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">{messages.map((m, i) => <div key={`${m}-${i}`} className={`rounded-xl px-3 py-2 text-[12.5px] ${i % 2 ? 'ml-8 bg-[#eaf1fe] text-[#1550b3]' : 'mr-6 border border-[#e6e9ef] bg-[#f8f9fb] text-[#3a4a5c]'}`}>{m}</div>)}<div className="flex flex-wrap gap-2">{chips.map((chip) => <button key={chip} onClick={() => runPrompt(chip)} className="rounded-full border border-[#e6e9ef] px-3 py-1.5 text-[11.5px] text-[#3a4a5c] hover:border-[#1f6feb] hover:text-[#1f6feb]">{chip}</button>)}</div></div><div className="border-t border-[#e6e9ef] p-3"><div className="flex items-end gap-2 rounded-xl border border-[#e6e9ef] bg-[#f6f7f9] px-3 py-2"><textarea value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Ask anything about aid flows..." className="min-h-[36px] max-h-[90px] flex-1 resize-none bg-transparent text-[12.8px] text-[#0d1b2a] outline-none" /><button onClick={() => runPrompt()} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f6feb] text-white hover:bg-[#1550b3]"><Send size={14} /></button></div><div className="mt-2 text-center text-[10px] text-[#6b7a8d]">AI can make mistakes. Verify critical insights.</div></div></aside>
        </div>
      </div>
    </div>
  );
}
