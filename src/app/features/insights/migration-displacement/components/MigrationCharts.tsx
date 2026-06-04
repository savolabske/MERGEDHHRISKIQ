import React from 'react';
import { COLORS } from '../data/migrationData';
import type { MigrationPair, MigrationPairWithColor } from '../types';

export function HBars({
  rows,
  formatter,
  color = COLORS.brand,
}: {
  rows: MigrationPairWithColor[];
  formatter: (value: number) => string;
  color?: string;
}) {
  if (rows.length === 0) return <div className="rounded-lg border border-dashed border-[#d7cec4] p-4 text-[12px] text-[#8a7d72]">No data for selected filters.</div>;
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <div className="space-y-2">
      {rows.map(([name, value, customColor]) => (
        <div key={name} className="flex items-center gap-2">
          <div className="w-[126px] text-right text-[12px] font-medium text-[#4a3f38]">{name}</div>
          <div className="h-[22px] flex-1 overflow-hidden rounded-md bg-[#f3efe9]">
            <div className="h-full rounded-md" style={{ width: `${(value / max) * 100}%`, backgroundColor: customColor ?? color }} />
          </div>
          <div className="w-[66px] text-[12px] font-semibold text-[#1a1410]">{formatter(value)}</div>
        </div>
      ))}
    </div>
  );
}

export function LineBars({ rows, formatter }: { rows: MigrationPair[]; formatter: (value: number) => string }) {
  return <HBars rows={rows.map((r) => [r[0], r[1], COLORS.brand])} formatter={formatter} color={COLORS.brand} />;
}

export function GapBars({
  rows,
  formatter,
}: {
  rows: [string, number, number][];
  formatter: (value: number) => string;
}) {
  if (rows.length === 0) return <div className="rounded-lg border border-dashed border-[#d7cec4] p-4 text-[12px] text-[#8a7d72]">No data for selected filters.</div>;
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <div className="space-y-2">
      {rows.slice(0, 8).map(([name, need, response]) => (
        <div key={name} className="flex items-center gap-2">
          <div className="w-[108px] text-right text-[12px] font-medium text-[#4a3f38]">{name}</div>
          <div className="relative h-[24px] flex-1 overflow-hidden rounded-md bg-[#f3efe9]">
            <div className="absolute inset-y-0 left-0 rounded-md bg-[#e9d9c6]" style={{ width: `${(need / max) * 100}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-md bg-[#c2562a]" style={{ width: `${(response / max) * 100}%` }} />
          </div>
          <div className="w-[92px] text-[11px] text-[#8a7d72]">{formatter(response)}/{formatter(need)}</div>
        </div>
      ))}
    </div>
  );
}

export function MigrationSceneChart({
  index,
  K,
  totalArrivals,
  recentArrivals,
  causes,
  monthly,
  demo,
  regions,
  gapRows,
  stay,
}: {
  index: number;
  K: (value: number) => string;
  totalArrivals: number;
  recentArrivals: number;
  causes: MigrationPairWithColor[];
  monthly: MigrationPair[];
  demo: { children: number; women: number; men: number };
  regions: MigrationPair[];
  gapRows: [string, number, number][];
  stay: MigrationPair[];
}) {
  if (index === 0) return <HBars rows={[['Since Oct 2023', totalArrivals, COLORS.brand], ['Current round', recentArrivals, COLORS.teal]]} formatter={K} />;
  if (index === 1) return <HBars rows={causes} formatter={K} color={COLORS.drought} />;
  if (index === 2) return <LineBars rows={monthly.slice(-12)} formatter={K} />;
  if (index === 3) return <HBars rows={[['Children', demo.children, COLORS.child], ['Women', demo.women, COLORS.women], ['Men', demo.men, COLORS.men]]} formatter={K} />;
  if (index === 4) return <LineBars rows={monthly} formatter={K} />;
  if (index === 5) return <HBars rows={regions.map((r) => [r[0], r[1], COLORS.brand])} formatter={K} />;
  if (index === 6) return <GapBars rows={gapRows} formatter={K} />;
  return <HBars rows={stay.map((r) => [r[0], r[1], COLORS.teal])} formatter={K} />;
}
