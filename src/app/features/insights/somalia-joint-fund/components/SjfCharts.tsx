import React from 'react';
import { AnimatedDonut, AnimatedHBars } from '../../shared/animations';
import { COLORS, SJF_DATA } from '../data/sjfData';
import { fmtM, fmtMillions } from '../hooks/useSjfFilters';
import type { SjfChartKind, SjfDonorH1, SjfPair, SjfPairWithColor, SjfProgramme, SjfWindow, SjfYearly, SjfAchievement } from '../types';
import { AchievementGrid } from './AchievementGrid';
import { AnimatedDepositGauges } from './AnimatedDepositGauges';
import { AnimatedWindowGrid } from './AnimatedWindowGrid';
import { SjfYearlyDualBars } from './SjfYearlyDualBars';
import { ProgrammeTable } from './ProgrammeTable';

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
      emptyClassName="rounded-lg border border-dashed border-[#c4dcd5] p-4 text-[12px] text-[#6f8094]"
      labelClassName="w-[140px] text-right text-[12px] font-medium text-[#324559]"
      trackClassName="h-[22px] flex-1 overflow-hidden rounded-md bg-[#eef1f7]"
      valueClassName="w-[66px] text-[12px] font-semibold text-[#0b1a2c]"
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
          <HBars rows={chart.rows} formatter={fmtMillions} />
          <div className="mt-4 rounded-[10px] bg-[#f4f6fa] p-3.5 text-[12.5px] text-[#324559]">
            <b>Gap:</b> {chart.note}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function SjfSceneChart({
  index,
  donorsAllTime,
  donorsH1,
  yearly,
  windows,
  punoH1,
  topProgrammes,
  achievements,
  gapBars,
}: {
  index: number;
  donorsAllTime: SjfPair[];
  donorsH1: SjfDonorH1[];
  yearly: SjfYearly[];
  windows: SjfWindow[];
  punoH1: SjfPair[];
  topProgrammes: SjfPairWithColor[];
  achievements: SjfAchievement[];
  gapBars: SjfPairWithColor[];
}) {
  if (index === 0) {
    return (
      <HBars
        rows={donorsAllTime.map(([name, val]) => [name, val, COLORS.navy] as SjfPairWithColor)}
        color={COLORS.navy}
      />
    );
  }
  if (index === 1) return <AnimatedDepositGauges rows={donorsH1} />;
  if (index === 2) return <SjfYearlyDualBars rows={yearly} />;
  if (index === 3) return <AnimatedWindowGrid rows={windows} />;
  if (index === 4) {
    return (
      <HBars
        rows={punoH1.map(([name, val]) => [name, val, COLORS.brand] as SjfPairWithColor)}
        color={COLORS.brand}
      />
    );
  }
  if (index === 5) return <HBars rows={topProgrammes} color={COLORS.brand} />;
  if (index === 6) return <AchievementGrid rows={achievements} limit={8} />;
  if (index === 7) {
    return (
      <div className="px-2.5 py-2">
        <HBars rows={gapBars} formatter={fmtMillions} />
        <div className="mt-4 rounded-[10px] bg-[#f4f6fa] p-3.5 text-[12.5px] text-[#324559]">
          <b>Gap:</b> roughly <b>$35M annually</b>, before factoring two unfunded windows. SJF Connect
          platform launches H2 2025 to strengthen transparency.
        </div>
      </div>
    );
  }
  return null;
}

export function getDefaultAchievements() {
  return SJF_DATA.achievements_H1_2025;
}
