import type { LucideIcon } from 'lucide-react';

export type Pair = [string, number];
export type PairWithColor = [string, number, string?];

export interface AidFlowTotals {
  envelope: number;
  actual: number;
  planned: number;
  projects: number;
  donors: number;
  regions: number;
}

export interface AidFlowDataset {
  totals: AidFlowTotals & { actual: number; planned: number };
  donors: Pair[];
  sectors: PairWithColor[];
  locations: Pair[];
  trend: [number, number, number][];
  markers: Record<string, [number, number]>;
  humdev: { hum: number; dev: number };
  implementers: Pair[];
  topProjects: [string, string, string, string, number, number, string][];
  climate: {
    year: Pair[];
    donor: Pair[];
    region: Pair[];
    projects: number;
  };
  fcdo: {
    sectors: Pair[];
    year: Pair[];
    total: number;
    projects: number;
  };
  healthSouthWest: [string, string, string, string, number, number, string][];
  channelMix: PairWithColor[];
  southWestSectors: PairWithColor[];
}

export interface AidFlowKpiCard {
  label: string;
  value: string;
  sub: string;
  prompt: string;
  color: string;
  iconBg: string;
  iconColor: string;
  icon: LucideIcon;
}

export interface AidFlowScene {
  num: string;
  title: string;
  stat: string;
  statLbl: string;
  body: string;
  bullets: string[];
  ask: string;
  cap: string;
  ctitle: string;
}

export type AidFlowChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; lane: 'dashboard'; title: string; chips?: string[] }
  | { role: 'assistant'; lane: 'chat'; body: string; chips?: string[] };

export interface AidFlowKeyFinding {
  value: string;
  label: string;
}

export type AidFlowChartKind =
  | { kind: 'hbars'; rows: PairWithColor[]; color?: string }
  | { kind: 'treemap'; rows: PairWithColor[] }
  | { kind: 'donut'; a: number; b: number; labelA: string; labelB: string; colorA?: string; colorB?: string }
  | { kind: 'trendDual' }
  | { kind: 'yearBars'; rows: Pair[]; color?: string }
  | { kind: 'regionBars'; rows: Pair[] }
  | { kind: 'climateTrend'; rows: Pair[] }
  | { kind: 'projectsTable'; rows: AidFlowDataset['topProjects'] };

export type AidFlowRecipeSection =
  | { type: 'full'; title: string; subtitle?: string; chart: AidFlowChartKind }
  | { type: 'grid'; items: { title: string; subtitle?: string; chart: AidFlowChartKind }[] };

export interface AidFlowRecipeResult {
  title: string;
  summaryHtml: string;
  findings: AidFlowKeyFinding[];
  sections: AidFlowRecipeSection[];
  followUps: string[];
  chips?: string[];
  isFallback?: boolean;
}

export type AidFlowPromptResult =
  | { lane: 'dashboard'; recipe: AidFlowRecipeResult }
  | { lane: 'chat'; body: string; chips?: string[] };
