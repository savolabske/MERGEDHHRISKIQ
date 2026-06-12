import React from 'react';
import { AnimatedDonut, AnimatedHBars } from '../../shared/animations';
import { COLORS, SJF_DATA } from '../data/sjfData';
import {
  PBI_PLAN_Y25,
  PBI_PLAN_Y26,
  PBI_PLAN_Y27,
  pbiAgg,
  scenarioTotals,
  winColor,
} from '../data/sjfPbiUtils';
import { fmtM, fmtMillions } from '../hooks/useSjfFilters';
import type { SjfChartKind, SjfPairWithColor } from '../types';
import { AchievementGrid } from './AchievementGrid';
import { AnimatedDepositGauges } from './AnimatedDepositGauges';
import { AnimatedWindowGrid } from './AnimatedWindowGrid';
import { DonorTrendChart, DonorYearBars } from './DonorTrendChart';
import { ProjectDonut } from './ProjectDonut';
import { ProgrammeTable } from './ProgrammeTable';
import { ScenarioTable } from './ScenarioTable';
import { SjfYearlyDualBars } from './SjfYearlyDualBars';

export function HBars({
  rows,
  color = COLORS.brand,
  formatter = fmtM,
}: {
  rows: SjfPairWithColor[];
  color?: string;
  formatter?: (v: number) => string;
}) {
  return (
    <AnimatedHBars
      rows={rows}
      formatter={formatter}
      color={color}
      emptyClassName="rounded-lg border border-dashed border-[#B8D9EE] p-4 text-[12px] text-[#6f8094]"
      labelClassName="w-[140px] text-right text-[12px] font-medium text-[#324559]"
      trackClassName="h-[22px] flex-1 overflow-hidden rounded-md bg-[#eef1f7]"
      valueClassName="w-[66px] text-[12px] font-semibold text-[#0b1a2c]"
    />
  );
}

function WindowYearBars({
  donor,
  year,
}: {
  donor: string | null;
  year: '2025' | '2026' | '2027' | null;
}) {
  const data = pbiAgg(donor, year);
  if (!data.length) {
    return (
      <div className="py-8 text-center text-[13px] text-[#6f8094]">
        No allocation recorded{donor ? ` for ${donor}` : ''}
        {year ? ` in ${year}` : ''}.
      </div>
    );
  }
  const rows: SjfPairWithColor[] = data.map(([w, v]) => [w, v, winColor(w)]);
  return <HBars rows={rows} />;
}

function ScenarioBars() {
  const totals = scenarioTotals();
  return (
    <HBars
      rows={[
        ['Best Case 2026 Plan', totals.best, COLORS.brand],
        ['Most Likely 2026 Plan', totals.most, COLORS.navy],
        ['Worst Case 2026 Plan', totals.worst, COLORS.coral],
      ]}
    />
  );
}

export function SjfChartRenderer({ chart }: { chart: SjfChartKind }) {
  switch (chart.kind) {
    case 'hbars':
      return (
        <HBars
          rows={chart.rows}
          formatter={chart.formatter === 'millions' ? fmtMillions : fmtM}
        />
      );
    case 'depositGauges':
      return <AnimatedDepositGauges rows={chart.rows} />;
    case 'yearlyDual':
      return <SjfYearlyDualBars rows={chart.rows} />;
    case 'windowGrid':
      return <AnimatedWindowGrid rows={chart.rows} />;
    case 'donut':
      return (
        <div className="flex flex-col items-center gap-3">
          <AnimatedDonut
            segments={[
              { value: chart.a, color: chart.colorA ?? COLORS.brand, label: chart.labelA },
              { value: chart.b, color: chart.colorB ?? COLORS.wMgt, label: chart.labelB },
            ]}
            formatter={(v) => `${v}`}
            centerClassName="text-[20px] font-semibold text-[#0b1a2c]"
          />
        </div>
      );
    case 'achievements':
      return <AchievementGrid rows={chart.rows} limit={chart.limit} />;
    case 'programmeTable':
      return <ProgrammeTable rows={chart.rows} />;
    case 'gapCallout':
      return (
        <div>
          <HBars rows={chart.rows} formatter={fmtM} />
          <div className="mt-4 rounded-[10px] bg-[#f4f6fa] p-3.5 text-[12.5px] text-[#324559]">
            <b>The 2027 cliff:</b> {chart.note}
          </div>
        </div>
      );
    case 'planYearBars':
      return (
        <HBars
          rows={[
            ['2025 Plan', PBI_PLAN_Y25, COLORS.brand],
            ['2026 Plan', PBI_PLAN_Y26, COLORS.navy],
            ['2027 Plan', PBI_PLAN_Y27, COLORS.coral],
          ]}
        />
      );
    case 'donorTrend':
      return <DonorTrendChart />;
    case 'windowYearBars':
      return <WindowYearBars donor={chart.donor} year={chart.year} />;
    case 'projectDonut':
      return <ProjectDonut year={chart.year} label={chart.label} />;
    case 'scenarioBars':
      return <ScenarioBars />;
    case 'scenarioTable':
      return <ScenarioTable />;
    default:
      return null;
  }
}

export function SjfSceneChart({ chart }: { chart: SjfChartKind }) {
  return <SjfChartRenderer chart={chart} />;
}

export function getDefaultAchievements() {
  return SJF_DATA.achievements_H1_2025;
}

