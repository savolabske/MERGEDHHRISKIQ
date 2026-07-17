import { COLORS, MIGRATION_DATA, MIGRATION_KPI_BASE, MIGRATION_SCENES, MIGRATION_THEME } from '../data/migrationData';
import type { useMigrationFilters } from '../hooks/useMigrationFilters';
import { stripHtml } from '../../shared/classifyReportPrompt';
import {
  formatExportTimestamp,
  type ExportChartSpec,
  type ReportExportDocument,
} from '../../shared/export';

type MigrationFilterState = ReturnType<typeof useMigrationFilters>;

function sceneChart(index: number, f: MigrationFilterState): ExportChartSpec {
  if (index === 0) {
    return {
      kind: 'hbars',
      valueFormat: 'compact',
      rows: [
        { label: 'Since Oct 2023', value: f.totalArrivals, color: COLORS.brand },
        { label: 'Current round', value: f.recentArrivals, color: COLORS.teal },
      ],
    };
  }
  if (index === 1) {
    return {
      kind: 'hbars',
      valueFormat: 'compact',
      rows: f.filteredCauses.map(([label, value, color]) => ({
        label,
        value: Math.round(value * f.combinedScale),
        color: color ?? COLORS.drought,
      })),
    };
  }
  if (index === 2 || index === 4) {
    const rows = (index === 2 ? f.monthly.slice(-12) : f.monthly).map(([label, value]) => ({
      label: String(label),
      value,
      color: COLORS.brand,
    }));
    return { kind: 'vbars', valueFormat: 'compact', rows };
  }
  if (index === 3) {
    const children = Math.round(MIGRATION_DATA.demo.children * f.combinedScale);
    const women = Math.round(MIGRATION_DATA.demo.women * f.combinedScale);
    const men = Math.round(MIGRATION_DATA.demo.men * f.combinedScale);
    return {
      kind: 'hbars',
      valueFormat: 'compact',
      rows: [
        { label: 'Children', value: children, color: COLORS.child },
        { label: 'Women', value: women, color: COLORS.women },
        { label: 'Men', value: men, color: COLORS.men },
      ],
    };
  }
  if (index === 5) {
    return {
      kind: 'hbars',
      valueFormat: 'compact',
      rows: f.filteredRegions.map(([label, value]) => ({
        label,
        value: Math.round(value * f.combinedScale),
        color: COLORS.brand,
      })),
    };
  }
  if (index === 6) {
    return {
      kind: 'gap',
      valueFormat: 'compact',
      rows: f.needsGapRows.map(([label, need, response]) => ({ label, need, response })),
    };
  }
  return {
    kind: 'hbars',
    valueFormat: 'compact',
    rows: MIGRATION_DATA.stay.map(([label, value]) => ({
      label,
      value: Math.round(value * f.combinedScale),
      color: COLORS.teal,
    })),
  };
}

export function buildMigrationExportDocument(f: MigrationFilterState): ReportExportDocument {
  return {
    meta: {
      title: MIGRATION_THEME.title,
      subtitle: MIGRATION_THEME.subtitle,
      slug: 'migration-displacement-intelligence',
      themeId: 'migration',
      generatedAt: formatExportTimestamp(),
      filterLabels: [
        { label: 'Date Range', value: f.yearLabel },
        {
          label: 'Region',
          value: f.regions.length ? f.regions.join(', ') : 'All Regions',
        },
        {
          label: 'Cause',
          value: f.causes.length ? f.causes.join(', ') : 'All Causes',
        },
      ],
    },
    kpis: MIGRATION_KPI_BASE.map((base, i) => ({
      label: base.label,
      value: f.kpis[i]?.value ?? '—',
      sub: f.kpis[i]?.sub ?? '',
      accent: base.color,
    })),
    scenes: MIGRATION_SCENES.map((s, i) => ({
      num: s.num,
      title: s.title,
      stat: f.sceneStats[i]?.stat ?? s.stat,
      statLbl: f.sceneStats[i]?.statLbl ?? s.statLbl,
      body: stripHtml(s.body),
      bullets: s.bullets,
      chartCap: s.cap,
      chartTitle: s.ctitle,
      chart: sceneChart(i, f),
    })),
  };
}
