import type { LucideIcon } from 'lucide-react';

export type SjfPair = [string, number];
export type SjfPairWithColor = [string, number, string?];
export type SjfDonorH1 = [string, number, number, number];
export type SjfWindow = [string, number, number, string, string];
export type SjfProgramme = [string, string, string, number, number, string, string, string];
export type SjfYearly = [number, number, number | null];
export type SjfAchievement = [string, string];

export interface SjfTotals {
  portfolio: number;
  netFunded: number;
  transfers2024: number;
  transfersH1_2025: number;
  commits2024: number;
  deposits2024: number;
  depositRate2024: number;
  commitsH1_2025: number;
  depositsH1_2025: number;
  depositRateH1_2025: number;
  capInception: number;
  commitInception: number;
  programmesActive: number;
  unEntities: number;
  windows: number;
  windowsOpen: number;
  donorsH1_2025: number;
  donorsInception: number;
}

export interface SjfDataset {
  totals: SjfTotals;
  donorsH1_2025: SjfDonorH1[];
  donors2024: SjfDonorH1[];
  donorsAllTime: SjfPair[];
  punoTransfersH1_2025: SjfPair[];
  punoTransfers2024: SjfPair[];
  windows: SjfWindow[];
  programmes: SjfProgramme[];
  yearly: SjfYearly[];
  achievements_H1_2025: SjfAchievement[];
}

export interface SjfKpiCard {
  label: string;
  value: string;
  sub: string;
  prompt: string;
  color: string;
  iconBg: string;
  iconColor: string;
  icon: LucideIcon;
}

export interface SjfScene {
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

export interface SjfScrollytellingProps {
  onBack?: () => void;
}

export interface SjfFilterState {
  startYear: number;
  endYear: number;
  selectedWindows: string[];
  selectedDonors: string[];
  selectedUnEntities: string[];
}

export interface SjfKeyFinding {
  value: string;
  label: string;
}

export interface SjfRecipeResult {
  title: string;
  extended?: boolean;
  summaryHtml: string;
  findings: SjfKeyFinding[];
  sections: SjfRecipeSection[];
  followUps: string[];
  chips?: string[];
}

export type SjfRecipeSection =
  | { type: 'full'; title: string; subtitle?: string; chart: SjfChartKind }
  | { type: 'half'; title: string; subtitle?: string; chart: SjfChartKind }
  | { type: 'grid'; items: { title: string; subtitle?: string; chart: SjfChartKind }[] }
  | { type: 'followups'; prompts: string[] }
  | { type: 'html'; content: string };

export type SjfChartKind =
  | { kind: 'hbars'; rows: SjfPairWithColor[]; formatter?: 'money' | 'millions' }
  | { kind: 'depositGauges'; rows: SjfDonorH1[] }
  | { kind: 'yearlyDual'; rows: SjfYearly[] }
  | { kind: 'windowGrid'; rows: SjfWindow[] }
  | { kind: 'donut'; a: number; b: number; labelA: string; labelB: string; colorA?: string; colorB?: string }
  | { kind: 'achievements'; rows: SjfAchievement[]; limit?: number }
  | { kind: 'programmeTable'; rows: SjfProgramme[] }
  | { kind: 'gapCallout'; rows: SjfPairWithColor[]; note: string };
