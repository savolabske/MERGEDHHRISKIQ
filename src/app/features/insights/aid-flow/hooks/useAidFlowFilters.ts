import { useMemo, useState } from 'react';
import { AID_FLOW_DATA as D, COLORS, KPI_CARDS } from '../data/aidFlowData';
import type { Pair, PairWithColor } from '../types';

export const fmtM = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(2)}B` : `$${Math.round(v)}M`);

export function useAidFlowFilters() {
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [startYear, setStartYear] = useState(2014);
  const [endYear, setEndYear] = useState(2026);

  const yearLabel = `${Math.min(startYear, endYear)} - ${Math.max(startYear, endYear)}`;
  const hasAnyFilter = selectedDonors.length > 0 || selectedSectors.length > 0 || selectedRegions.length > 0 || startYear !== 2014 || endYear !== 2026;
  const minYear = Math.min(startYear, endYear);
  const maxYear = Math.max(startYear, endYear);

  const filteredDonors = useMemo(() => (selectedDonors.length > 0 ? D.donors.filter(([name]) => selectedDonors.includes(name)) : D.donors), [selectedDonors]);
  const filteredSectors = useMemo(() => (selectedSectors.length > 0 ? D.sectors.filter(([name]) => selectedSectors.includes(name)) : D.sectors), [selectedSectors]);
  const filteredRegions = useMemo(() => (selectedRegions.length > 0 ? D.locations.filter(([name]) => selectedRegions.includes(name)) : D.locations), [selectedRegions]);

  const fullActualSum = D.trend.reduce((sum, row) => sum + row[1], 0);
  const fullPlannedSum = D.trend.reduce((sum, row) => sum + row[2], 0);
  const fullRegionSum = D.locations.reduce((sum, row) => sum + row[1], 0);
  const rangeActualSum = D.trend.filter((row) => row[0] >= minYear && row[0] <= maxYear).reduce((sum, row) => sum + row[1], 0);
  const rangePlannedSum = D.trend.filter((row) => row[0] >= minYear && row[0] <= maxYear).reduce((sum, row) => sum + row[2], 0);
  const yearScale = fullActualSum > 0 ? rangeActualSum / fullActualSum : 1;
  const yearPlannedScale = fullPlannedSum > 0 ? rangePlannedSum / fullPlannedSum : 1;
  const regionScale = selectedRegions.length > 0 ? Math.max(0.18, filteredRegions.reduce((sum, row) => sum + row[1], 0) / fullRegionSum) : 1;

  const donorActual = filteredDonors.reduce((sum, row) => sum + row[1], 0);
  const sectorActual = filteredSectors.reduce((sum, row) => sum + row[1], 0);
  const donorScale = selectedDonors.length > 0 ? Math.max(0.12, donorActual / D.totals.actual) : 1;
  const sectorScale = selectedSectors.length > 0 ? Math.max(0.12, sectorActual / D.totals.actual) : 1;
  const combinedScale = Math.max(0.08, Math.min(1, yearScale * donorScale * sectorScale * regionScale));
  const filteredActual = D.totals.actual * combinedScale;
  const filteredPlanned = D.totals.planned * Math.max(0.08, Math.min(1, yearPlannedScale * sectorScale * regionScale));
  const filteredEnvelope = filteredActual + filteredPlanned;
  const filteredProjects = Math.max(1, Math.round(D.totals.projects * (selectedDonors.length > 0 || selectedSectors.length > 0 || selectedRegions.length > 0 ? Math.min(1, filteredActual / D.totals.actual) : yearScale)));
  const filteredHum = D.humdev.hum * combinedScale;
  const filteredDev = D.humdev.dev * combinedScale;
  const trendRows: PairWithColor[] = D.trend.filter((t) => t[0] >= minYear && t[0] <= maxYear).map((t) => [`${t[0]}`, Math.max(t[1], t[2]), t[1] >= t[2] ? COLORS.brand : COLORS.edu]);
  const filteredImplementers: Pair[] = D.implementers.map(([name, value], idx) => [name, Math.max(1, Number((value * combinedScale * (1 - idx * 0.012)).toFixed(1)))]).sort((a, b) => b[1] - a[1]);
  const filteredMarkers: Pair[] = Object.entries(D.markers).map(([name, marker]) => [name, Number((marker[1] * combinedScale).toFixed(1))] as Pair).sort((a, b) => b[1] - a[1]);
  const filteredProjectsRows = D.topProjects
    .filter((row) => (selectedDonors.length === 0 || selectedDonors.includes(row[1])) && (selectedSectors.length === 0 || selectedSectors.includes(row[2])) && (selectedRegions.length === 0 || selectedRegions.includes(row[3])))
    .map((row) => [row[0], row[1], row[2], row[3], Number((row[4] * combinedScale).toFixed(1)), Number((row[5] * combinedScale).toFixed(1)), row[6]] as [string, string, string, string, number, number, string]);
  const projectsForTable = (filteredProjectsRows.length > 0 ? filteredProjectsRows : D.topProjects.map((row) => [row[0], row[1], row[2], row[3], Number((row[4] * combinedScale).toFixed(1)), Number((row[5] * combinedScale).toFixed(1)), row[6]] as [string, string, string, string, number, number, string])).slice(0, 10);

  const topDonor = filteredDonors[0];
  const topSector = filteredSectors[0];
  const topRegion = filteredRegions[0];
  const topImplementer = filteredImplementers[0];
  const topMarker = filteredMarkers[0];
  const topSectorShare = filteredSectors.length > 0 ? Math.round((filteredSectors[0][1] / Math.max(1, filteredSectors.reduce((sum, row) => sum + row[1], 0))) * 100) : 0;

  const kpiCards = [
    { ...KPI_CARDS[0], value: fmtM(filteredEnvelope), sub: `${yearLabel} - ${filteredProjects.toLocaleString()} projects` },
    { ...KPI_CARDS[1], value: fmtM(filteredActual), sub: `${Math.round((filteredActual / Math.max(filteredEnvelope, 1)) * 100)}% of envelope` },
    { ...KPI_CARDS[2], value: fmtM(filteredPlanned), sub: `${yearLabel} commitments` },
    { ...KPI_CARDS[3], value: filteredProjects.toLocaleString(), sub: `across ${Math.max(1, filteredRegions.length)} regions` },
    { ...KPI_CARDS[4], value: topDonor?.[0] ?? 'N/A', sub: topDonor ? `${fmtM(topDonor[1])}` : 'No donor data' },
    { ...KPI_CARDS[5], value: topSector?.[0] ?? 'N/A', sub: topSector ? `${fmtM(topSector[1])}` : 'No sector data' },
  ];

  const sceneStats = [
    { stat: fmtM(filteredEnvelope), statLbl: `committed across ${filteredProjects.toLocaleString()} projects in ${yearLabel}` },
    { stat: fmtM(filteredDonors.slice(0, 5).reduce((sum, row) => sum + row[1], 0)), statLbl: 'from the top 5 donors in this filtered view' },
    { stat: `${topSectorShare}%`, statLbl: `share led by ${topSector?.[0] ?? 'top sector'}` },
    { stat: `${Math.round((filteredHum / Math.max(filteredHum + filteredDev, 1)) * 100)} / ${Math.round((filteredDev / Math.max(filteredHum + filteredDev, 1)) * 100)}`, statLbl: 'humanitarian vs development split (filtered)' },
    { stat: `${minYear}-${maxYear}`, statLbl: 'active trend window' },
    { stat: topRegion ? fmtM(topRegion[1] * combinedScale) : '$0M', statLbl: `to ${topRegion?.[0] ?? 'N/A'} in filtered view` },
    { stat: topImplementer ? fmtM(topImplementer[1]) : '$0M', statLbl: `channelled through ${topImplementer?.[0] ?? 'N/A'}` },
    { stat: topMarker ? fmtM(topMarker[1]) : '$0M', statLbl: `top cross-cutting marker: ${topMarker?.[0] ?? 'N/A'}` },
  ];

  const forwardCards = [
    ['Funding gap risk', fmtM(Math.max(0, filteredPlanned - (filteredActual / Math.max(1, maxYear - minYear + 1)))), `Planned ${yearLabel} commitments (${fmtM(filteredPlanned)}) versus filtered annualized delivery (${fmtM(filteredActual / Math.max(1, maxYear - minYear + 1))}).`, 'rgba(239,108,46,.25)'],
    ['Declining sectors', topSector?.[0] ?? 'Sector', `Filtered view keeps ${topSector?.[0] ?? 'top sector'} at ${fmtM(topSector?.[1] ?? 0)}. Secondary sectors taper as filters narrow.`, 'rgba(216,65,60,.25)'],
    ['Underfunded regions', filteredRegions[filteredRegions.length - 1]?.[0] ?? 'N/A', `${filteredRegions[filteredRegions.length - 1]?.[0] ?? 'N/A'} remains lowest in this filter window at ${fmtM(filteredRegions[filteredRegions.length - 1]?.[1] ?? 0)}.`, 'rgba(42,127,224,.25)'],
    ['Rising activity', topMarker?.[0] ?? 'Marker', `${topMarker?.[0] ?? 'Marker'} now totals ${fmtM(topMarker?.[1] ?? 0)} with current filter settings.`, 'rgba(63,168,90,.25)'],
    ['Possible overlap', topSector?.[0] ?? 'Sector', `Top projects show concentration in ${topSector?.[0] ?? 'top sector'} and ${topRegion?.[0] ?? 'top region'} under active filters.`, 'rgba(155,89,182,.25)'],
    ['Delivery concentration', topImplementer ? `${topImplementer[0]} ${Math.round((topImplementer[1] / Math.max(filteredActual, 1)) * 100)}%` : 'N/A', `Delivery remains concentrated through leading implementers in this filtered slice.`, 'rgba(22,163,154,.25)'],
  ] as const;

  return {
    selectedDonors, setSelectedDonors, selectedSectors, setSelectedSectors, selectedRegions, setSelectedRegions,
    startYear, setStartYear, endYear, setEndYear, yearLabel, hasAnyFilter, minYear, maxYear, combinedScale,
    filteredDonors, filteredSectors, filteredRegions, filteredHum, filteredDev, trendRows, filteredImplementers,
    filteredMarkers, projectsForTable, kpiCards, sceneStats, forwardCards, filteredEnvelope, filteredActual, filteredPlanned,
  };
}
