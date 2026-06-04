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
