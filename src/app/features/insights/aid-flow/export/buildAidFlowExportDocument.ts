import { COLORS, SCENES } from '../data/aidFlowData';
import type { useAidFlowFilters } from '../hooks/useAidFlowFilters';
import { stripHtml } from '../../shared/classifyReportPrompt';
import {
  formatExportTimestamp,
  type ReportExportDocument,
  type ExportChartSpec,
} from '../../shared/export';

type AidFlowFilterState = ReturnType<typeof useAidFlowFilters>;

function sceneChart(index: number, f: AidFlowFilterState): ExportChartSpec {
  if (index === 0) {
    return {
      kind: 'hbars',
      valueFormat: 'money',
      rows: [
        { label: 'Total committed', value: f.filteredEnvelope, color: COLORS.other },
        { label: 'Actually disbursed', value: f.filteredActual, color: COLORS.resil },
        { label: 'Planned (future)', value: f.filteredPlanned, color: COLORS.basic },
      ],
    };
  }
  if (index === 1) {
    return {
      kind: 'hbars',
      valueFormat: 'money',
      rows: f.filteredDonors.slice(0, 8).map(([label, value]) => ({
        label,
        value,
        color: COLORS.brand,
      })),
    };
  }
  if (index === 2) {
    return {
      kind: 'treemapBlocks',
      valueFormat: 'money',
      rows: f.filteredSectors.map(([label, value, color]) => ({
        label,
        value,
        color: color ?? COLORS.food,
      })),
    };
  }
  if (index === 3) {
    return {
      kind: 'donut',
      valueFormat: 'money',
      centerLabel: 'Split',
      rows: [
        { label: 'Humanitarian', value: f.filteredHum, color: COLORS.basic },
        { label: 'Development', value: f.filteredDev, color: COLORS.resil },
      ],
    };
  }
  if (index === 4) {
    return {
      kind: 'vbars',
      valueFormat: 'money',
      rows: f.trendRows.map(([label, value, color]) => ({
        label: String(label),
        value,
        color: color ?? COLORS.brand,
      })),
    };
  }
  if (index === 5) {
    return {
      kind: 'hbars',
      valueFormat: 'money',
      rows: f.filteredRegions.map(([label, value]) => ({
        label,
        value: value * f.combinedScale,
        color: COLORS.basic,
      })),
    };
  }
  if (index === 6) {
    return {
      kind: 'hbars',
      valueFormat: 'money',
      rows: f.filteredImplementers.slice(0, 8).map(([label, value]) => ({
        label,
        value,
        color: COLORS.wash,
      })),
    };
  }
  return {
    kind: 'hbars',
    valueFormat: 'money',
    rows: f.filteredMarkers.slice(0, 8).map(([label, value]) => ({
      label,
      value,
      color: COLORS.prot,
    })),
  };
}

export function buildAidFlowExportDocument(f: AidFlowFilterState): ReportExportDocument {
  const themeAccents = ['#1f6feb', '#3fa85a', '#2a7fe0', '#9b59b6', '#ef6c2e', '#c97a2a'];

  return {
    meta: {
      title: 'Aid Flow Intelligence',
      subtitle: 'Explore how development and humanitarian funding is flowing across Somalia.',
      slug: 'aid-flow-intelligence',
      themeId: 'aid_flow',
      generatedAt: formatExportTimestamp(),
      filterLabels: [
        { label: 'Date Range', value: f.yearLabel },
        {
          label: 'Donor',
          value: f.selectedDonors.length ? f.selectedDonors.join(', ') : 'All Donors',
        },
        {
          label: 'Sector',
          value: f.selectedSectors.length ? f.selectedSectors.join(', ') : 'All Sectors',
        },
        {
          label: 'Region',
          value: f.selectedRegions.length ? f.selectedRegions.join(', ') : 'All Regions',
        },
      ],
    },
    kpis: f.kpiCards.map((k, i) => ({
      label: k.label,
      value: k.value,
      sub: k.sub,
      accent: themeAccents[i] ?? COLORS.brand,
    })),
    scenes: SCENES.map((s, i) => ({
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
