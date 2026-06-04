import { useState } from 'react';
import { MIGRATION_DATA } from '../data/migrationData';
import type { MigrationPair } from '../types';

const K = (v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `${Math.round(v / 1_000)}k` : `${Math.round(v)}`);
const Kf = (v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : Math.round(v).toLocaleString());

export function useMigrationFilters() {
  const [startYear, setStartYear] = useState(2023);
  const [endYear, setEndYear] = useState(2026);
  const [regions, setRegions] = useState<string[]>([]);
  const [causes, setCauses] = useState<string[]>([]);

  const minYear = Math.min(startYear, endYear);
  const maxYear = Math.max(startYear, endYear);
  const yearLabel = `${minYear} - ${maxYear}`;
  const hasAnyFilter = regions.length > 0 || causes.length > 0 || minYear !== 2023 || maxYear !== 2026;

  const monthly = MIGRATION_DATA.monthly.filter(([month]) => {
    const year = Number(month.slice(0, 4));
    return year >= minYear && year <= maxYear;
  });
  const yearlyScale = Math.max(0.08, monthly.reduce((s, [, v]) => s + v, 0) / Math.max(1, MIGRATION_DATA.monthly.reduce((s, [, v]) => s + v, 0)));
  const filteredRegions = regions.length > 0 ? MIGRATION_DATA.regions.filter(([name]) => regions.includes(name)) : MIGRATION_DATA.regions;
  const filteredCauses = causes.length > 0 ? MIGRATION_DATA.cause.filter(([name]) => causes.includes(name)) : MIGRATION_DATA.cause;
  const regionScale = regions.length > 0 ? Math.max(0.12, filteredRegions.reduce((s, [, v]) => s + v, 0) / Math.max(1, MIGRATION_DATA.regions.reduce((s, [, v]) => s + v, 0))) : 1;
  const causeScale = causes.length > 0 ? Math.max(0.12, filteredCauses.reduce((s, [, v]) => s + v, 0) / Math.max(1, MIGRATION_DATA.cause.reduce((s, [, v]) => s + v, 0))) : 1;
  const combinedScale = Math.max(0.06, Math.min(1, yearlyScale * regionScale * causeScale));

  const totalArrivals = Math.round(MIGRATION_DATA.totals.arrivalsAll * combinedScale);
  const recentArrivals = Math.round(MIGRATION_DATA.totals.arrivalsPeriod * combinedScale);
  const demo = {
    children: Math.round(MIGRATION_DATA.demo.children * combinedScale),
    women: Math.round(MIGRATION_DATA.demo.women * combinedScale),
    men: Math.round(MIGRATION_DATA.demo.men * combinedScale),
  };
  const topCause = filteredCauses[0]?.[0] ?? 'N/A';
  const topRegion = filteredRegions[0]?.[0] ?? 'N/A';
  const childrenPct = Math.round((demo.children / Math.max(1, demo.children + demo.women + demo.men)) * 100);
  const needsGapRows = MIGRATION_DATA.gap.map(([name, need, resp]) => [name, Math.round(need * combinedScale), Math.round(resp * combinedScale)] as [string, number, number]);
  const districts = MIGRATION_DATA.districts
    .filter(([, , region, cause]) => (regions.length === 0 || regions.includes(region)) && (causes.length === 0 || causes.includes(cause)))
    .map((row) => [row[0], Math.round(row[1] * combinedScale), row[2], row[3]] as [string, number, string, string]);
  const topDistricts = (districts.length ? districts : MIGRATION_DATA.districts).slice(0, 8);

  const kpis = [
    { value: K(totalArrivals), sub: yearLabel },
    { value: K(recentArrivals), sub: 'Filtered round estimate' },
    { value: topCause, sub: 'leading driver in active filters' },
    { value: `${childrenPct}%`, sub: 'children in active filter' },
    { value: topRegion, sub: `${Kf(filteredRegions[0]?.[1] ?? 0)} arrivals` },
    { value: 'Food', sub: `${Kf(needsGapRows[0]?.[0] ? needsGapRows[0][1] : 0)} need flags` },
  ];

  const sceneStats = [
    { stat: K(totalArrivals), statLbl: `new arrivals in ${yearLabel}` },
    { stat: topCause, statLbl: 'largest active displacement driver' },
    { stat: yearLabel, statLbl: 'selected trend window' },
    { stat: `${childrenPct}%`, statLbl: 'share of children in filtered arrivals' },
    { stat: 'Seasonal', statLbl: 'movement fluctuates across periods' },
    { stat: topRegion, statLbl: 'largest receiving region in filter' },
    { stat: '~6%', statLbl: 'response vs food need remains low' },
    { stat: '6+ months', statLbl: 'common reported intended stay' },
  ];

  return {
    startYear,
    endYear,
    regions,
    causes,
    setStartYear,
    setEndYear,
    setRegions,
    setCauses,
    minYear,
    maxYear,
    yearLabel,
    hasAnyFilter,
    monthly,
    filteredRegions,
    filteredCauses,
    topDistricts,
    needsGapRows,
    combinedScale,
    totalArrivals,
    recentArrivals,
    topCause,
    topRegion,
    childrenPct,
    kpis,
    sceneStats,
    K,
    Kf,
  };
}
