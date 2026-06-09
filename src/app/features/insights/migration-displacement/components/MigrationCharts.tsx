import React from 'react';
import { RacingTimeSeriesBars } from '../../shared/RacingTimeSeriesBars';
import { AnimatedGapBars, AnimatedHBars } from '../../shared/animations';
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
  return (
    <AnimatedHBars
      rows={rows}
      formatter={formatter}
      color={color}
      emptyClassName="rounded-lg border border-dashed border-[#d7cec4] p-4 text-[12px] text-[#8a7d72]"
      labelClassName="w-[126px] text-right text-[12px] font-medium text-[#4a3f38]"
      trackClassName="h-[22px] flex-1 overflow-hidden rounded-md bg-[#f3efe9]"
      valueClassName="w-[66px] text-[12px] font-semibold text-[#1a1410]"
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
