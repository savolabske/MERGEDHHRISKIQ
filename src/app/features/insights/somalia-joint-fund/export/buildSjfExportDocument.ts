import {
  COLORS,
  PBI_PLAN_Y25,
  PBI_PLAN_Y26,
  PBI_PLAN_Y27,
  SCENES,
  SJF_DATA,
  SJF_THEME,
} from '../data/sjfData';
import {
  donorTrendSeries,
  pbiAgg,
  scenarioTotals,
  winColor,
} from '../data/sjfPbiUtils';
import type { useSjfFilters } from '../hooks/useSjfFilters';
import type { SjfChartKind } from '../types';
import { stripHtml } from '../../shared/classifyReportPrompt';
import {
  formatExportTimestamp,
  type ExportChartSpec,
  type ReportExportDocument,
} from '../../shared/export';

type SjfFilterState = ReturnType<typeof useSjfFilters>;

const DONUT_PALETTE = [
  COLORS.brand,
  COLORS.navy,
  COLORS.coral,
  COLORS.wRol,
  COLORS.wHrg,
  COLORS.gold,
  COLORS.wCrlg,
  COLORS.wCr,
  COLORS.plum,
  COLORS.wSd,
];

function normalizeSjfChart(chart: SjfChartKind, f: SjfFilterState): ExportChartSpec {
  switch (chart.kind) {
    case 'hbars':
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: chart.rows.map(([label, value, color]) => ({
          label,
          value,
          color: color ?? COLORS.brand,
        })),
      };
    case 'donut':
      return {
        kind: 'donut',
        valueFormat: 'number',
        rows: [
          { label: chart.labelA, value: chart.a, color: chart.colorA ?? COLORS.brand },
          { label: chart.labelB, value: chart.b, color: chart.colorB ?? COLORS.wMgt },
        ],
      };
    case 'gapCallout':
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: chart.rows.map(([label, value, color]) => ({
          label,
          value,
          color: color ?? COLORS.brand,
        })),
      };
    case 'donorTrend':
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: donorTrendSeries()
          .slice(0, 10)
          .map(([label, y25]) => ({
            label,
            value: y25,
            color: COLORS.brand,
          })),
      };
    case 'windowYearBars': {
      const data = pbiAgg(chart.donor, chart.year);
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: data.map(([label, value]) => ({
          label,
          value,
          color: winColor(label),
        })),
      };
    }
    case 'projectDonut': {
      const rows =
        chart.year === 2025 ? SJF_DATA.pbi.transfers2025 : SJF_DATA.pbi.transfers2026;
      return {
        kind: 'donut',
        valueFormat: 'money',
        centerLabel: chart.label ?? String(chart.year),
        rows: rows.map(([label, value], i) => ({
          label,
          value,
          color: DONUT_PALETTE[i % DONUT_PALETTE.length],
        })),
      };
    }
    case 'scenarioBars': {
      const totals = scenarioTotals();
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: [
          { label: 'Best Case 2026', value: totals.best, color: COLORS.brand },
          { label: 'Most Likely 2026', value: totals.most, color: COLORS.navy },
          { label: 'Worst Case 2026', value: totals.worst, color: COLORS.coral },
        ],
      };
    }
    case 'planYearBars':
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: [
          { label: '2025 Plan', value: PBI_PLAN_Y25, color: COLORS.brand },
          { label: '2026 Plan', value: PBI_PLAN_Y26, color: COLORS.navy },
          { label: '2027 Plan', value: PBI_PLAN_Y27, color: COLORS.coral },
        ],
      };
    case 'yearlyDual':
      return {
        kind: 'vbars',
        valueFormat: 'money',
        rows: (f.filteredYearly.length ? f.filteredYearly : chart.rows).map(
          ([year, dep]) => ({
            label: String(year),
            value: dep,
            color: COLORS.brand,
          }),
        ),
      };
    case 'windowGrid':
      return {
        kind: 'hbars',
        valueFormat: 'number',
        rows: (f.filteredWindows.length ? f.filteredWindows : chart.rows).map(
          ([label, pct]) => ({
            label,
            value: pct,
            color: winColor(label),
          }),
        ),
      };
    case 'depositGauges':
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: chart.rows.map(([label, deposited]) => ({
          label,
          value: deposited,
          color: COLORS.brand,
        })),
      };
    case 'programmeTable':
      return {
        kind: 'table',
        columns: ['Programme', 'Window', 'Transfers'],
        rows: chart.rows.slice(0, 10).map((p) => [p[0], p[1], `$${Math.round(p[3] / 1e6)}M`]),
      };
    case 'scenarioTable': {
      const programmes = SJF_DATA.pbi.scenarios.programmes;
      return {
        kind: 'table',
        columns: ['Programme', 'Best', 'Likely', 'Worst'],
        rows: programmes.slice(0, 8).map((p) => [
          p[1],
          `$${Math.round(p[4] / 1e6)}M`,
          `$${Math.round(p[5] / 1e6)}M`,
          `$${Math.round(p[6] / 1e6)}M`,
        ]),
      };
    }
    case 'achievements':
      return {
        kind: 'table',
        columns: ['Achievement'],
        rows: chart.rows.slice(0, 8).map((row) => [Array.isArray(row) ? String(row[0]) : String(row)]),
      };
    default:
      return {
        kind: 'hbars',
        valueFormat: 'money',
        rows: [
          { label: '2025 Plan', value: PBI_PLAN_Y25, color: COLORS.brand },
          { label: '2026 Plan', value: PBI_PLAN_Y26, color: COLORS.navy },
          { label: '2027 Plan', value: PBI_PLAN_Y27, color: COLORS.coral },
        ],
      };
  }
}

export function buildSjfExportDocument(f: SjfFilterState): ReportExportDocument {
  return {
    meta: {
      title: SJF_THEME.title,
      subtitle:
        'Forward commitment plan, thematic windows, programme transfers, and funding scenarios for the Somalia Joint Fund.',
      slug: 'somalia-joint-fund-intelligence',
      themeId: 'sjf',
      generatedAt: formatExportTimestamp(),
      filterLabels: [
        { label: 'Date Range', value: f.yearLabel },
        {
          label: 'Window',
          value: f.selectedWindows.length ? f.selectedWindows.join(', ') : 'All Windows',
        },
        {
          label: 'Donor',
          value: f.selectedDonors.length ? f.selectedDonors.join(', ') : 'All Donors',
        },
        {
          label: 'UN Entity',
          value: f.selectedUnEntities.length
            ? f.selectedUnEntities.join(', ')
            : 'All UN Entities',
        },
      ],
    },
    kpis: f.kpiCards.map((k) => ({
      label: k.label,
      value: k.value,
      sub: k.sub,
      accent: k.color,
    })),
    scenes: SCENES.map((s, i) => {
      const chart = f.getSceneChart(i, s.chart);
      return {
        num: s.num,
        title: s.title,
        stat: f.sceneStats[i]?.stat ?? s.stat,
        statLbl: f.sceneStats[i]?.statLbl ?? s.statLbl,
        body: stripHtml(s.body),
        bullets: s.bullets,
        chartCap: s.cap,
        chartTitle: s.ctitle,
        chart: normalizeSjfChart(chart, f),
      };
    }),
  };
}
