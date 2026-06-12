export type MigrationPair = [string, number];
export type MigrationPairWithColor = [string, number, string?];

export interface MigrationDisplacementProps {
  onBack?: () => void;
}

export interface MigrationScene {
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

export type MigrationChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; lane: 'dashboard'; title: string; chips?: string[] }
  | { role: 'assistant'; lane: 'chat'; body: string; chips?: string[] };

export interface MigrationKeyFinding {
  value: string;
  label: string;
}

export type MigrationChartKind =
  | { kind: 'hbars'; rows: MigrationPairWithColor[]; color?: string }
  | { kind: 'gap'; rows: [string, number, number][] }
  | { kind: 'line'; rows: MigrationPair[] }
  | { kind: 'donut'; rows: MigrationPairWithColor[] }
  | { kind: 'stackedCauseQ'; rows: [string, number, number][] }
  | { kind: 'districtTable'; rows: [string, number, string, string][] }
  | { kind: 'coverage'; rows: MigrationPair[] };

export type MigrationRecipeSection =
  | { type: 'full'; title: string; subtitle?: string; chart: MigrationChartKind }
  | { type: 'grid'; items: { title: string; subtitle?: string; chart: MigrationChartKind }[] };

export interface MigrationRecipeResult {
  title: string;
  summaryHtml: string;
  findings: MigrationKeyFinding[];
  sections: MigrationRecipeSection[];
  followUps: string[];
  chips?: string[];
  isFallback?: boolean;
}

export type MigrationPromptResult =
  | { lane: 'dashboard'; recipe: MigrationRecipeResult }
  | { lane: 'chat'; body: string; chips?: string[] };
