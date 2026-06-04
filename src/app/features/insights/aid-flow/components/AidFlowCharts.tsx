import React from 'react';
import { COLORS } from '../data/aidFlowData';
import type { Pair, PairWithColor } from '../types';
import { fmtM } from '../hooks/useAidFlowFilters';

export function HBars({ rows, color = COLORS.brand }: { rows: PairWithColor[]; color?: string }) {
  if (rows.length === 0) return <div className="rounded-lg border border-dashed border-[#d7dee8] p-4 text-[12px] text-[#6b7a8d]">No data for selected filters.</div>;
  const max = Math.max(...rows.map((r) => r[1]));
  return <div className="space-y-2">{rows.map(([name, value, customColor]) => <div key={name} className="flex items-center gap-2"><div className="w-[126px] text-right text-[12px] font-medium text-[#3a4a5c]">{name}</div><div className="h-[22px] flex-1 overflow-hidden rounded-md bg-[#eef1f6]"><div className="h-full rounded-md" style={{ width: `${(value / max) * 100}%`, backgroundColor: customColor ?? color }} /></div><div className="w-[66px] text-[12px] font-semibold text-[#0d1b2a]">{fmtM(value)}</div></div>)}</div>;
}

export function SectorTreemap({ sectors }: { sectors: PairWithColor[] }) {
  const total = sectors.reduce((sum, [, value]) => sum + value, 0);
  const layoutClasses = ['col-span-2 row-span-2', '', '', '', '', '', '', 'col-span-2'];
  const pctClasses = ['text-[20px]', 'text-[14px]', 'text-[14px]', 'text-[14px]', 'text-[14px]', 'text-[13px]', 'text-[13px]', 'text-[16px]'];
  return (
    <div className="grid h-[330px] grid-cols-4 grid-rows-3 gap-2">
      {sectors.map(([name, value, color], i) => (
        <div
          key={name}
          className={`flex min-h-0 flex-col justify-between rounded-xl p-3 text-white ${layoutClasses[i] ?? ''}`}
          style={{ backgroundColor: color }}
        >
          <div className="text-[12px] font-semibold leading-snug">{name}</div>
          <div>
            <div className={`${pctClasses[i] ?? 'text-[14px]'} leading-none font-semibold`}>
              {Math.round((value / total) * 100)}%
            </div>
            <div className="mt-0.5 text-[11px] opacity-95">{fmtM(value)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SplitDonut({ hum, dev }: { hum: number; dev: number }) {
  const total = hum + dev;
  const angle = (hum / total) * 360;
  return <div className="flex flex-wrap items-center gap-6"><div className="relative h-[176px] w-[176px] rounded-full" style={{ background: `conic-gradient(${COLORS.basic} 0 ${angle}deg, ${COLORS.resil} ${angle}deg 360deg)` }}><div className="absolute inset-[26px] flex items-center justify-center rounded-full bg-white text-[20px] font-semibold text-[#0d1b2a]">{fmtM(hum + dev)}</div></div><div className="space-y-3 text-[12px] text-[#3a4a5c]"><div><span className="mr-2 inline-block h-2 w-2 rounded bg-[#2a7fe0]" />Humanitarian: {fmtM(hum)}</div><div><span className="mr-2 inline-block h-2 w-2 rounded bg-[#3fa85a]" />Development: {fmtM(dev)}</div></div></div>;
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
  if (index === 4) return <HBars rows={trendRows} color={COLORS.brand} />;
  if (index === 5) return <RegionBars regions={regions} />;
  if (index === 6) return <HBars rows={implementers} color={COLORS.wash} />;
  return <HBars rows={markers} color={COLORS.prot} />;
}
