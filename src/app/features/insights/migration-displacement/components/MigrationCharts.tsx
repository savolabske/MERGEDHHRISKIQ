import React from 'react';
import { RacingTimeSeriesBars } from '../../shared/RacingTimeSeriesBars';
import { AnimatedDonut, AnimatedGapBars, AnimatedHBars } from '../../shared/animations';
import { COLORS } from '../data/migrationData';
import type { MigrationChartKind, MigrationPair, MigrationPairWithColor } from '../types';

export const migrationFmtK = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `${Math.round(v / 1_000)}k` : `${Math.round(v)}`;

export const migrationFmtKf = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M` : Math.round(v).toLocaleString();

export function HBars({
  rows,
  formatter,
  color = COLORS.brand,
}: {
  rows: MigrationPairWithColor[];
  formatter: (value: number) => string;
  color?: string;
}) {
  return (
    <AnimatedHBars
      rows={rows}
      formatter={formatter}
      color={color}
      emptyClassName="rounded-lg border border-dashed border-[#d7cec4] p-4 text-[12px] text-[#8a7d72]"
      labelClassName="min-w-0 max-w-[38%] shrink-0 truncate text-right text-[11px] font-medium text-[#4a3f38] sm:max-w-none sm:w-[126px] sm:text-[12px]"
      trackClassName="h-[22px] flex-1 min-w-0 overflow-hidden rounded-md bg-[#f3efe9]"
      valueClassName="shrink-0 w-[56px] text-right text-[11px] font-semibold tabular-nums text-[#1a1410] sm:w-[66px] sm:text-[12px]"
    />
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
  return <AnimatedGapBars rows={rows} formatter={formatter} />;
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
  if (index === 2) {
    return (
      <RacingTimeSeriesBars
        rows={monthly.slice(-12).map(([label, value]) => [label, value, COLORS.brand])}
        formatter={K}
        defaultColor={COLORS.brand}
        theme="migration"
      />
    );
  }
  if (index === 3) return <HBars rows={[['Children', demo.children, COLORS.child], ['Women', demo.women, COLORS.women], ['Men', demo.men, COLORS.men]]} formatter={K} />;
  if (index === 4) {
    return (
      <RacingTimeSeriesBars
        rows={monthly.map(([label, value]) => [label, value, COLORS.brand])}
        formatter={K}
        defaultColor={COLORS.brand}
        theme="migration"
      />
    );
  }
  if (index === 5) return <HBars rows={regions.map((r) => [r[0], r[1], COLORS.brand])} formatter={K} />;
  if (index === 6) return <GapBars rows={gapRows} formatter={K} />;
  return <HBars rows={stay.map((r) => [r[0], r[1], COLORS.teal])} formatter={K} />;
}

function StackedCauseQChart({
  rows,
  formatter,
}: {
  rows: [string, number, number][];
  formatter: (value: number) => string;
}) {
  const max = Math.max(...rows.map(([, drought, conflict]) => drought + conflict), 1);
  return (
    <div className="space-y-2">
      {rows.map(([label, drought, conflict]) => {
        const total = drought + conflict;
        const droughtPct = (drought / max) * 100;
        const conflictPct = (conflict / max) * 100;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="w-[52px] shrink-0 text-right text-[10px] font-medium text-[#4a3f38]">
              {label}
            </div>
            <div className="flex h-[20px] flex-1 overflow-hidden rounded-md bg-[#f3efe9]">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${droughtPct}%`, backgroundColor: COLORS.drought }}
                title={`Drought: ${formatter(drought)}`}
              />
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${conflictPct}%`, backgroundColor: COLORS.conflict }}
                title={`Conflict: ${formatter(conflict)}`}
              />
            </div>
            <div className="w-[72px] shrink-0 text-[10px] font-semibold text-[#1a1410]">
              {formatter(total)}
            </div>
          </div>
        );
      })}
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[#4a3f38]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: COLORS.drought }} />
          Drought
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: COLORS.conflict }} />
          Conflict
        </span>
      </div>
    </div>
  );
}

function DistrictTable({
  rows,
  formatter,
}: {
  rows: [string, number, string, string][];
  formatter: (value: number) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px] leading-[18px]">
        <thead>
          <tr className="border-b border-[#ece6df] text-left text-[12px] leading-4 font-semibold text-[#8a7d72]">
            <th className="px-2 py-2">District</th>
            <th className="px-2 py-2">Region</th>
            <th className="px-2 py-2 text-right">Arrivals</th>
            <th className="px-2 py-2">Main driver</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([district, arrivals, region, driver]) => (
            <tr key={district} className="border-b border-[#f3efe9] transition-colors hover:bg-[#f8fafc]">
              <td className="px-2 py-2.5 text-[14px] leading-5 font-medium text-[#1a1410]">{district}</td>
              <td className="px-2 py-2.5 text-[#4a3f38]">{region}</td>
              <td className="px-2 py-2.5 text-right font-medium tabular-nums whitespace-nowrap text-[#4a3f38]">{formatter(arrivals)}</td>
              <td className="px-2 py-2.5">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[12px] leading-4 font-semibold"
                  style={{
                    backgroundColor:
                      driver === 'Drought' ? '#fbeede' : driver === 'Conflict' ? '#fbe6e3' : '#e8f2fa',
                    color:
                      driver === 'Drought' ? COLORS.drought : driver === 'Conflict' ? COLORS.conflict : COLORS.flood,
                  }}
                >
                  {driver}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MigrationChartRenderer({ chart }: { chart: MigrationChartKind }) {
  const K = migrationFmtK;
  const Kf = migrationFmtKf;

  switch (chart.kind) {
    case 'hbars':
      return <HBars rows={chart.rows} formatter={K} color={chart.color} />;
    case 'gap':
      return <GapBars rows={chart.rows} formatter={K} />;
    case 'line':
      return (
        <RacingTimeSeriesBars
          rows={chart.rows.map(([label, value]) => [label, value, COLORS.brand])}
          formatter={K}
          defaultColor={COLORS.brand}
          theme="migration"
        />
      );
    case 'donut':
      return (
        <AnimatedDonut
          segments={chart.rows.map(([label, value, color]) => ({
            label,
            value,
            color: color ?? COLORS.brand,
          }))}
          formatter={K}
          centerClassName="text-[18px] font-semibold text-[#1a1410]"
          legendClassName="space-y-2 text-[12px] text-[#4a3f38]"
        />
      );
    case 'stackedCauseQ':
      return <StackedCauseQChart rows={chart.rows} formatter={K} />;
    case 'districtTable':
      return <DistrictTable rows={chart.rows} formatter={Kf} />;
    case 'coverage':
      return (
        <HBars
          rows={chart.rows.map(([name, pct]) => [name, pct, COLORS.teal])}
          formatter={(v) => `${v}%`}
          color={COLORS.teal}
        />
      );
    default:
      return null;
  }
}
