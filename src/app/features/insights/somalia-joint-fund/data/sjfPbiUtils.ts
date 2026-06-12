import { COLORS, PBI_PLAN_Y25, PBI_PLAN_Y26, PBI_PLAN_Y27, SJF_DATA } from './sjfData';
import type { SjfPair, SjfPairWithColor, SjfScenarioProgramme } from '../types';

export { PBI_PLAN_Y25, PBI_PLAN_Y26, PBI_PLAN_Y27 };

const WIN_COLOR_MAP: Record<string, string> = {
  Unearmarked: COLORS.wMgt,
  'Inclusive Politics': COLORS.wIp,
  'Rule of Law': COLORS.wRol,
  'Climate and Resilience': COLORS.wCr,
  'Climate & Resilience': COLORS.wCr,
  'Human Rights and Gender': COLORS.wHrg,
  'Human Rights & Gender': COLORS.wHrg,
  'Community Recovery & LG': COLORS.wCrlg,
  'Community Recovery and Local Governance': COLORS.wCrlg,
  'Social Development': COLORS.wSd,
  'Secretariat Direct Cost': COLORS.wMgt,
  'Enablers Programme': COLORS.wMgt,
};

export function winColor(window: string): string {
  return WIN_COLOR_MAP[window] ?? COLORS.brand;
}

export function pbiAgg(
  donor: string | null,
  year: '2025' | '2026' | '2027' | null,
): SjfPair[] {
  const yi = year === '2025' ? 2 : year === '2026' ? 3 : year === '2027' ? 4 : null;
  const out: Record<string, number> = {};
  SJF_DATA.pbi.rows.forEach((r) => {
    if (donor && r[0] !== donor) return;
    const v = yi !== null ? r[yi] : r[2] + r[3] + r[4];
    if (v > 0) out[r[1]] = (out[r[1]] || 0) + v;
  });
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

export function pbiDonorTotals(year: '2025' | '2026' | '2027' | null): SjfPair[] {
  const yi = year === '2025' ? 2 : year === '2026' ? 3 : year === '2027' ? 4 : null;
  const out: Record<string, number> = {};
  SJF_DATA.pbi.rows.forEach((r) => {
    const v = yi !== null ? r[yi] : r[2] + r[3] + r[4];
    if (v > 0) out[r[0]] = (out[r[0]] || 0) + v;
  });
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

export function pbiYearTotals(donor: string | null): { y25: number; y26: number; y27: number } {
  let y25 = 0;
  let y26 = 0;
  let y27 = 0;
  SJF_DATA.pbi.rows.forEach((r) => {
    if (donor && r[0] !== donor) return;
    y25 += r[2];
    y26 += r[3];
    y27 += r[4];
  });
  return { y25, y26, y27 };
}

export function scenarioTotals(programmes: SjfScenarioProgramme[] = SJF_DATA.pbi.scenarios.programmes) {
  return {
    best: programmes.reduce((s, p) => s + p[4], 0),
    most: programmes.reduce((s, p) => s + p[5], 0),
    worst: programmes.reduce((s, p) => s + p[6], 0),
  };
}

export function balanceCfRows(year: '2025' | '2026'): SjfPairWithColor[] {
  const idx = year === '2025' ? 2 : 3;
  return SJF_DATA.pbi.rows
    .filter((r) => r[0] === 'Balance C/F')
    .map((r) => [r[1], r[idx], COLORS.gold] as SjfPairWithColor)
    .filter((r) => r[1] > 0);
}

export function donorTrendSeries(): [string, number, number, number][] {
  const donors = [...new Set(SJF_DATA.pbi.rows.map((r) => r[0]))];
  return donors
    .map((d) => {
      const totals = [0, 0, 0];
      SJF_DATA.pbi.rows
        .filter((r) => r[0] === d)
        .forEach((r) => {
          totals[0] += r[2];
          totals[1] += r[3];
          totals[2] += r[4];
        });
      return [d, totals[0], totals[1], totals[2]] as [string, number, number, number];
    })
    .sort((a, b) => b[1] + b[2] + b[3] - (a[1] + a[2] + a[3]));
}

export function pbiDonors(): string[] {
  return [...new Set(SJF_DATA.pbi.rows.map((r) => r[0]))];
}

