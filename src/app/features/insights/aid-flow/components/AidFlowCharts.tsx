import React from 'react';
import { RacingTimeSeriesBars } from '../../shared/RacingTimeSeriesBars';
import {
  AnimatedDonut,
  AnimatedHBars,
  AnimatedTreemap,
} from '../../shared/animations';
import { AID_FLOW_DATA, COLORS } from '../data/aidFlowData';
import type { AidFlowChartKind, Pair, PairWithColor } from '../types';
import { fmtM } from '../hooks/useAidFlowFilters';

export function HBars({ rows, color = COLORS.brand }: { rows: PairWithColor[]; color?: string }) {
  return (
    <AnimatedHBars
      rows={rows}
      formatter={fmtM}
      color={color}
      emptyClassName="rounded-lg border border-dashed border-[#d7dee8] p-4 text-[12px] text-[#6b7a8d]"
    />
  );
}

export function SectorTreemap({ sectors }: { sectors: PairWithColor[] }) {
  return <AnimatedTreemap sectors={sectors} formatter={fmtM} />;
}

export function SplitDonut({
  hum,
  dev,
  labelA = 'Humanitarian',
  labelB = 'Development',
  colorA = COLORS.basic,
  colorB = COLORS.resil,
}: {
  hum: number;
  dev: number;
  labelA?: string;
  labelB?: string;
  colorA?: string;
  colorB?: string;
}) {
  return (
    <AnimatedDonut
      segments={[
        { value: hum, color: colorA, label: labelA },
        { value: dev, color: colorB, label: labelB },
      ]}
      formatter={fmtM}
    />
  );
}

export function RegionBars({ regions }: { regions: Pair[] }) {
  return <HBars rows={regions} color={COLORS.basic} />;
}

export function ProjectsTable({ rows }: { rows: [string, string, string, string, number, number, string][] }) {
  return (
    <table className="w-full border-collapse text-[13px] leading-[18px]">
      <thead>
        <tr className="text-left text-[12px] leading-4 font-semibold text-[#6b7a8d]">
          <th className="border-b border-[#e6e9ef] px-2.5 py-2">Project</th>
          <th className="border-b border-[#e6e9ef] px-2.5 py-2">Donor</th>
          <th className="border-b border-[#e6e9ef] px-2.5 py-2">Sector</th>
          <th className="border-b border-[#e6e9ef] px-2.5 py-2">Region</th>
          <th className="border-b border-[#e6e9ef] px-2.5 py-2 text-right">Actual</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p[0]} className="transition-colors hover:bg-[#f8fafc]">
            <td className="border-b border-[#eef1f6] px-2.5 py-2.5 text-[14px] leading-5 font-medium text-[#0d1b2a]">{p[0]}</td>
            <td className="border-b border-[#eef1f6] px-2.5 py-2.5 text-[#3a4a5c]">{p[1]}</td>
            <td className="border-b border-[#eef1f6] px-2.5 py-2.5 text-[#3a4a5c]">{p[2]}</td>
            <td className="border-b border-[#eef1f6] px-2.5 py-2.5 text-[#3a4a5c]">{p[3]}</td>
            <td className="border-b border-[#eef1f6] px-2.5 py-2.5 text-right font-medium tabular-nums whitespace-nowrap text-[#3a4a5c]">{fmtM(p[4])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AidFlowSceneChart({
  index,
  totals,
  donors,
  sectors,
  trendRows,
  regions,
  hum,
  dev,
  implementers,
  markers,
}: {
  index: number;
  totals: { envelope: number; actual: number; planned: number };
  donors: Pair[];
  sectors: PairWithColor[];
  trendRows: PairWithColor[];
  regions: Pair[];
  hum: number;
  dev: number;
  implementers: Pair[];
  markers: Pair[];
}) {
  if (index === 0) return <HBars rows={[['Total committed', totals.envelope, COLORS.other], ['Actually disbursed', totals.actual, COLORS.resil], ['Planned (future)', totals.planned, COLORS.basic]]} />;
  if (index === 1) return <HBars rows={donors} />;
  if (index === 2) return <SectorTreemap sectors={sectors} />;
  if (index === 3) return <SplitDonut hum={hum} dev={dev} />;
  if (index === 4) {
    return (
      <RacingTimeSeriesBars
        rows={trendRows}
        formatter={fmtM}
        defaultColor={COLORS.brand}
        theme="aid-flow"
      />
    );
  }
  if (index === 5) return <RegionBars regions={regions} />;
  if (index === 6) return <HBars rows={implementers} color={COLORS.wash} />;
  return <HBars rows={markers} color={COLORS.prot} />;
}

function TrendDualChart() {
  const actualRows = AID_FLOW_DATA.trend
    .filter(([year, actual]) => year <= 2023 && actual > 0)
    .map(([year, actual]) => [`${year}`, actual, COLORS.brand] as PairWithColor);
  const plannedRows = AID_FLOW_DATA.trend
    .filter(([year, , planned]) => year >= 2020 && planned > 0)
    .map(([year, , planned]) => [`${year}`, planned, COLORS.edu] as PairWithColor);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6b7a8d]">
          Actual disbursements
        </div>
        <RacingTimeSeriesBars rows={actualRows} formatter={fmtM} defaultColor={COLORS.brand} theme="aid-flow" />
      </div>
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6b7a8d]">
          Planned commitments
        </div>
        <RacingTimeSeriesBars rows={plannedRows} formatter={fmtM} defaultColor={COLORS.edu} theme="aid-flow" />
      </div>
    </div>
  );
}

export function AidFlowChartRenderer({ chart }: { chart: AidFlowChartKind }) {
  switch (chart.kind) {
    case 'hbars':
      return <HBars rows={chart.rows} color={chart.color} />;
    case 'treemap':
      return <SectorTreemap sectors={chart.rows} />;
    case 'donut':
      return (
        <SplitDonut
          hum={chart.a}
          dev={chart.b}
          labelA={chart.labelA}
          labelB={chart.labelB}
          colorA={chart.colorA}
          colorB={chart.colorB}
        />
      );
    case 'trendDual':
      return <TrendDualChart />;
    case 'yearBars':
      return (
        <HBars
          rows={chart.rows.map(([n, v]) => [String(n), v, chart.color ?? COLORS.brand])}
          color={chart.color}
        />
      );
    case 'regionBars':
      return <RegionBars regions={chart.rows} />;
    case 'climateTrend':
      return (
        <RacingTimeSeriesBars
          rows={chart.rows.map(([n, v]) => [String(n), v, COLORS.resil])}
          formatter={fmtM}
          defaultColor={COLORS.resil}
          theme="aid-flow"
        />
      );
    case 'projectsTable':
      return <ProjectsTable rows={chart.rows} />;
    default:
      return null;
  }
}
