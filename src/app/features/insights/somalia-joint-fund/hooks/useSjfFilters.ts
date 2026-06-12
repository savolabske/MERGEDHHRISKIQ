import { useMemo, useState } from 'react';
import { KPI_CARDS, SCENES } from '../data/sjfData';
import type {
  SjfChartKind,
  SjfDonorH1,
  SjfPair,
  SjfPairWithColor,
  SjfProgramme,
  SjfWindow,
  SjfYearly,
} from '../types';
import { SJF_DATA } from '../data/sjfData';
import { COLORS } from '../data/sjfData';

export const fmtM = (v: number) =>
  v >= 1e9
    ? `$${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `$${(v / 1e6).toFixed(1)}M`
      : v >= 1e3
        ? `$${(v / 1e3).toFixed(0)}k`
        : `$${v}`;

export const fmtMillions = (v: number) => `$${v}M`;

function scaleRows<T extends [string, ...unknown[]]>(
  rows: T[],
  scale: number,
  valueIndices: number[],
): T[] {
  if (scale >= 0.999) return rows;
  return rows.map((row) => {
    const next = [...row] as unknown as T;
    valueIndices.forEach((idx) => {
      const val = row[idx];
      if (typeof val === 'number') {
        (next as unknown[])[idx] = Math.round(val * scale);
      }
    });
    return next;
  });
}

export function useSjfFilters() {
  const [startYear, setStartYear] = useState(2014);
  const [endYear, setEndYear] = useState(2025);
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [selectedUnEntities, setSelectedUnEntities] = useState<string[]>([]);

  const minYear = Math.min(startYear, endYear);
  const maxYear = Math.max(startYear, endYear);
  const yearLabel = maxYear === 2025 && minYear === 2014 ? '2014 – Jun 2025' : `${minYear} – ${maxYear}`;
  const hasAnyFilter =
    selectedWindows.length > 0 ||
    selectedDonors.length > 0 ||
    selectedUnEntities.length > 0 ||
    minYear !== 2014 ||
    maxYear !== 2025;

  const yearScale = useMemo(() => {
    const span = maxYear - minYear + 1;
    return Math.max(0.15, Math.min(1, span / 12));
  }, [minYear, maxYear]);

  const windowScale = useMemo(() => {
    if (selectedWindows.length === 0) return 1;
    const filtered = SJF_DATA.windows.filter(([name]) => selectedWindows.includes(name));
    const pct = filtered.reduce((s, [, p]) => s + p, 0);
    return Math.max(0.12, pct / 100);
  }, [selectedWindows]);

  const donorScale = useMemo(() => {
    if (selectedDonors.length === 0) return 1;
    const all = SJF_DATA.donorsAllTime.filter(([name]) => selectedDonors.includes(name));
    const total = all.reduce((s, [, v]) => s + v, 0);
    const base = SJF_DATA.donorsAllTime.reduce((s, [, v]) => s + v, 0);
    return Math.max(0.1, total / Math.max(1, base));
  }, [selectedDonors]);

  const entityScale = useMemo(() => {
    if (selectedUnEntities.length === 0) return 1;
    const filtered = SJF_DATA.punoTransfersH1_2025.filter(([name]) =>
      selectedUnEntities.includes(name),
    );
    const total = filtered.reduce((s, [, v]) => s + v, 0);
    const base = SJF_DATA.punoTransfersH1_2025.reduce((s, [, v]) => s + v, 0);
    return Math.max(0.1, total / Math.max(1, base));
  }, [selectedUnEntities]);

  const combinedScale = Math.max(0.08, Math.min(1, yearScale * windowScale * donorScale * entityScale));

  const filteredDonorsAllTime: SjfPair[] = useMemo(() => {
    let rows = SJF_DATA.donorsAllTime;
    if (selectedDonors.length > 0) {
      rows = rows.filter(([name]) => selectedDonors.includes(name));
    }
    return scaleRows(rows, combinedScale, [1]);
  }, [selectedDonors, combinedScale]);

  const filteredDonorsH1: SjfDonorH1[] = useMemo(() => {
    let rows = SJF_DATA.donorsH1_2025;
    if (selectedDonors.length > 0) {
      rows = rows.filter(([name]) => selectedDonors.includes(name));
    }
    return scaleRows(rows, combinedScale, [1, 2]);
  }, [selectedDonors, combinedScale]);

  const filteredPunoH1: SjfPair[] = useMemo(() => {
    let rows = SJF_DATA.punoTransfersH1_2025;
    if (selectedUnEntities.length > 0) {
      rows = rows.filter(([name]) => selectedUnEntities.includes(name));
    }
    return scaleRows(rows, combinedScale, [1]);
  }, [selectedUnEntities, combinedScale]);

  const filteredPuno2024: SjfPair[] = useMemo(() => {
    let rows = SJF_DATA.punoTransfers2024;
    if (selectedUnEntities.length > 0) {
      rows = rows.filter(([name]) => selectedUnEntities.includes(name));
    }
    return scaleRows(rows, combinedScale, [1]);
  }, [selectedUnEntities, combinedScale]);

  const filteredWindows: SjfWindow[] = useMemo(() => {
    let rows = SJF_DATA.windows;
    if (selectedWindows.length > 0) {
      rows = rows.filter(([name]) => selectedWindows.includes(name));
    }
    return rows;
  }, [selectedWindows]);

  const filteredYearly: SjfYearly[] = useMemo(() => {
    return SJF_DATA.yearly
      .filter(([year]) => year >= minYear && year <= maxYear)
      .map(([year, dep, tr]) => [
        year,
        Math.round(dep * combinedScale),
        tr != null ? Math.round(tr * combinedScale) : null,
      ] as SjfYearly);
  }, [minYear, maxYear, combinedScale]);

  const filteredProgrammes: SjfProgramme[] = useMemo(() => {
    let rows = SJF_DATA.programmes;
    if (selectedWindows.length > 0) {
      rows = rows.filter(([, window]) => selectedWindows.includes(window));
    }
    return scaleRows(rows, combinedScale, [3, 4]);
  }, [selectedWindows, combinedScale]);

  const topProgrammesBars: SjfPairWithColor[] = useMemo(() => {
    return [...filteredProgrammes]
      .sort((a, b) => b[3] - a[3])
      .slice(0, 8)
      .map((p) => [p[0], p[3], COLORS.brand] as SjfPairWithColor);
  }, [filteredProgrammes]);

  const capInception = Math.round(SJF_DATA.totals.capInception * donorScale * yearScale);

  const kpiCards = useMemo(() => {
    if (!hasAnyFilter) return KPI_CARDS;
    return KPI_CARDS.map((k) => ({
      ...k,
      sub: k.sub.includes('filtered') ? k.sub : `${k.sub} · filtered view`,
    }));
  }, [hasAnyFilter]);

  const sceneStats = useMemo(
    () =>
      SCENES.map((s) => ({
        stat: s.stat,
        statLbl: s.statLbl,
      })),
    [],
  );

  const getSceneChart = (sceneIndex: number, chart: SjfChartKind): SjfChartKind => {
    if (sceneIndex === 7 && chart.kind === 'hbars') {
      return {
        kind: 'hbars',
        rows: filteredDonorsAllTime.map(([n, v]) => [n, v, COLORS.navy] as SjfPairWithColor),
      };
    }
    if (sceneIndex === 8 && chart.kind === 'gapCallout' && hasAnyFilter) {
      return {
        ...chart,
        rows: chart.rows.map(([label, value, color]) => [
          label,
          Math.round(value * combinedScale),
          color,
        ]),
      };
    }
    return chart;
  };

  return {
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
    combinedScale,
    filteredDonorsAllTime,
    filteredDonorsH1,
    filteredPunoH1,
    filteredPuno2024,
    filteredWindows,
    filteredYearly,
    filteredProgrammes,
    topProgrammesBars,
    kpiCards,
    sceneStats,
    getSceneChart,
    totals: {
      capInception,
    },
  };
}
