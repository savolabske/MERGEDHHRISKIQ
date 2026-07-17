import type { ReportThemeId } from '../../../../data/reportsAdminMock';

export type ReportExportFormat = 'pdf' | 'pptx';

export type ExportChartRow = {
  label: string;
  value: number;
  color?: string;
};

export type ExportChartSpec =
  | { kind: 'hbars'; rows: ExportChartRow[]; valueFormat?: 'money' | 'number' | 'compact' }
  | { kind: 'vbars'; rows: ExportChartRow[]; valueFormat?: 'money' | 'number' | 'compact' }
  | { kind: 'donut'; rows: ExportChartRow[]; centerLabel?: string; valueFormat?: 'money' | 'number' | 'compact' }
  | { kind: 'gap'; rows: { label: string; need: number; response: number }[]; valueFormat?: 'money' | 'number' | 'compact' }
  | { kind: 'treemapBlocks'; rows: ExportChartRow[]; valueFormat?: 'money' | 'number' | 'compact' }
  | {
      kind: 'table';
      columns: string[];
      rows: string[][];
    };

export type ReportExportKpi = {
  label: string;
  value: string;
  sub: string;
  accent: string;
};

export type ReportExportScene = {
  num: string;
  title: string;
  stat: string;
  statLbl: string;
  body: string;
  bullets: string[];
  chartCap: string;
  chartTitle: string;
  chart: ExportChartSpec;
};

export type ReportExportMeta = {
  title: string;
  subtitle: string;
  slug: string;
  themeId: ReportThemeId;
  generatedAt: string;
  filterLabels: { label: string; value: string }[];
};

export type ReportExportDocument = {
  meta: ReportExportMeta;
  kpis: ReportExportKpi[];
  scenes: ReportExportScene[];
};
