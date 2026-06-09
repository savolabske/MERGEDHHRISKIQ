import React from 'react';
import { RacingTimeSeriesBars } from '../../shared/RacingTimeSeriesBars';
import {
  AnimatedDonut,
  AnimatedHBars,
  AnimatedTreemap,
} from '../../shared/animations';
import { COLORS } from '../data/aidFlowData';
import type { Pair, PairWithColor } from '../types';
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

export function SplitDonut({ hum, dev }: { hum: number; dev: number }) {
  return (
    <AnimatedDonut
      segments={[
        { value: hum, color: COLORS.basic, label: 'Humanitarian' },
        { value: dev, color: COLORS.resil, label: 'Development' },
      ]}
      formatter={fmtM}
    />
  );
}

export function RegionBars({ regions }: { regions: Pair[] }) {
  return <HBars rows={regions} color={COLORS.basic} />;
}

export function ProjectsTable({ rows }: { rows: [string, string, string, string, number, number, string][] }) {
  return <table className="w-full border-collapse text-[12px]"><thead><tr className="text-left text-[#6b7a8d]"><th className="border-b border-[#e6e9ef] px-2 py-2">Project</th><th className="border-b border-[#e6e9ef] px-2 py-2">Donor</th><th className="border-b border-[#e6e9ef] px-2 py-2">Sector</th><th className="border-b border-[#e6e9ef] px-2 py-2">Region</th><th className="border-b border-[#e6e9ef] px-2 py-2">Actual</th></tr></thead><tbody>{rows.map((p) => <tr key={p[0]}><td className="border-b border-[#eef1f6] px-2 py-2 text-[#0d1b2a]">{p[0]}</td><td className="border-b border-[#eef1f6] px-2 py-2 text-[#3a4a5c]">{p[1]}</td><td className="border-b border-[#eef1f6] px-2 py-2 text-[#3a4a5c]">{p[2]}</td><td className="border-b border-[#eef1f6] px-2 py-2 text-[#3a4a5c]">{p[3]}</td><td className="border-b border-[#eef1f6] px-2 py-2 text-[#3a4a5c]">{fmtM(p[4])}</td></tr>)}</tbody></table>;
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
