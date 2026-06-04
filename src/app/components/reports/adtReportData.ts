import type { AdtCategory } from './adtCategoryColors';
import { ADT_CATEGORY_CONFIG } from './adtCategoryColors';

export const ADT_REPORT_CREATED = 'March 1, 2026';

export const ADT_KPIS = {
  totalAllegations2025: 962,
  q4_2025: 329,
  gatekeeperShare: 70,
  yoyChangePercent: 14,
  allegations2024: 855,
  allegations2025: 977,
  cumulativeAllegations: 1802,
  gatekeeperComprehensiveShare: 62,
};

export const q4_2025_byCategory: Array<{ category: AdtCategory; value: number }> = [
  { category: 'economicExtortion', value: 220 },
  { category: 'improperInfluence', value: 55 },
  { category: 'preventionOfDelivery', value: 40 },
  { category: 'theftDamage', value: 10 },
  { category: 'aidSoldInMarket', value: 5 },
  { category: 'unethicalBehaviour', value: 5 },
];

export const annualComparisonByCategory = [
  {
    category: 'economicExtortion' as AdtCategory,
    y2024: 82,
    y2025: 448,
  },
  {
    category: 'improperInfluence' as AdtCategory,
    y2024: 324,
    y2025: 239,
  },
  {
    category: 'preventionOfDelivery' as AdtCategory,
    y2024: 145,
    y2025: 166,
  },
  {
    category: 'theftDamage' as AdtCategory,
    y2024: 200,
    y2025: 50,
  },
  {
    category: 'unethicalBehaviour' as AdtCategory,
    y2024: 64,
    y2025: 47,
  },
  {
    category: 'finance' as AdtCategory,
    y2024: 2,
    y2025: 10,
  },
  {
    category: 'aidSoldInMarket' as AdtCategory,
    y2024: 38,
    y2025: 2,
  },
];

export type HotspotEntry = Record<AdtCategory, number> & { location: string; total: number };

export const top10Hotspots: HotspotEntry[] = [
  {
    location: 'Garasbaley (SWS)',
    economicExtortion: 201,
    improperInfluence: 0,
    preventionOfDelivery: 0,
    theftDamage: 0,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 201,
  },
  {
    location: 'Daynile (BN)',
    economicExtortion: 85,
    improperInfluence: 0,
    preventionOfDelivery: 0,
    theftDamage: 0,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 85,
  },
  {
    location: 'Balcad (SWS)',
    economicExtortion: 55,
    improperInfluence: 5,
    preventionOfDelivery: 3,
    theftDamage: 2,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 65,
  },
  {
    location: 'Baidoa (SWS)',
    economicExtortion: 45,
    improperInfluence: 5,
    preventionOfDelivery: 3,
    theftDamage: 2,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 55,
  },
  {
    location: 'Bulo Burto (HS)',
    economicExtortion: 0,
    improperInfluence: 35,
    preventionOfDelivery: 15,
    theftDamage: 0,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 50,
  },
  {
    location: 'Dhobley (JL)',
    economicExtortion: 0,
    improperInfluence: 45,
    preventionOfDelivery: 0,
    theftDamage: 0,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 45,
  },
  {
    location: 'Mogadishu (BN)',
    economicExtortion: 20,
    improperInfluence: 10,
    preventionOfDelivery: 5,
    theftDamage: 3,
    unethicalBehaviour: 2,
    finance: 0,
    aidSoldInMarket: 0,
    total: 40,
  },
  {
    location: 'Luuq (JL)',
    economicExtortion: 8,
    improperInfluence: 5,
    preventionOfDelivery: 5,
    theftDamage: 2,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 20,
  },
  {
    location: 'Afgooye (SWS)',
    economicExtortion: 0,
    improperInfluence: 15,
    preventionOfDelivery: 3,
    theftDamage: 2,
    unethicalBehaviour: 0,
    finance: 0,
    aidSoldInMarket: 0,
    total: 20,
  },
  {
    location: 'Kismayo (JL)',
    economicExtortion: 5,
    improperInfluence: 5,
    preventionOfDelivery: 3,
    theftDamage: 1,
    unethicalBehaviour: 1,
    finance: 0,
    aidSoldInMarket: 0,
    total: 15,
  },
];

export const q4HotspotsTop5: HotspotEntry[] = top10Hotspots.slice(0, 5);

export const perpetrators = [
  { name: 'Gatekeeper', count: 200 },
  { name: 'Community Leader', count: 110 },
  { name: 'NGO', count: 60 },
  { name: 'FMS (incl. Security)', count: 50 },
  { name: 'AS', count: 25 },
  { name: 'Criminal', count: 20 },
  { name: 'Local Govt Authority', count: 20 },
  { name: 'Camp Leader', count: 20 },
  { name: 'Police', count: 20 },
  { name: 'FGS (incl. Security)', count: 15 },
  { name: 'Security Guard', count: 15 },
  { name: 'Other', count: 10 },
  { name: 'UN AFP', count: 8 },
  { name: 'Clan Leaders', count: 7 },
  { name: 'Landowner', count: 5 },
  { name: 'UN Contractor', count: 3 },
];

export const adProfileComparison = {
  q3: {
    label: 'Q3 2025',
    total: 113,
    economicExtortion: 35,
    improperInfluence: 22,
    preventionOfDelivery: 30,
    theftDamage: 12,
    aidSoldInMarket: 8,
    unethicalBehaviour: 6,
    finance: 0,
  },
  q4: {
    label: 'Q4 2025',
    total: 128,
    economicExtortion: 45,
    improperInfluence: 55,
    preventionOfDelivery: 18,
    theftDamage: 5,
    aidSoldInMarket: 3,
    unethicalBehaviour: 2,
    finance: 0,
  },
};

export const mix2025 = [
  { category: 'economicExtortion' as AdtCategory, value: 47, count: 452 },
  { category: 'improperInfluence' as AdtCategory, value: 25, count: 240 },
  { category: 'preventionOfDelivery' as AdtCategory, value: 17, count: 163 },
  { category: 'theftDamage' as AdtCategory, value: 5, count: 48 },
  { category: 'unethicalBehaviour' as AdtCategory, value: 5, count: 48 },
  { category: 'aidSoldInMarket' as AdtCategory, value: 1, count: 10 },
  { category: 'finance' as AdtCategory, value: 0.21, count: 2 },
];

export const gatekeeperTrackingMonthly = [
  { month: 'Jan-24', mpcaReach: 180000, iiEeAllegations: 8 },
  { month: 'Feb-24', mpcaReach: 165000, iiEeAllegations: 10 },
  { month: 'Mar-24', mpcaReach: 155000, iiEeAllegations: 12 },
  { month: 'Apr-24', mpcaReach: 140000, iiEeAllegations: 14 },
  { month: 'May-24', mpcaReach: 130000, iiEeAllegations: 16 },
  { month: 'Jun-24', mpcaReach: 120000, iiEeAllegations: 18 },
  { month: 'Jul-24', mpcaReach: 110000, iiEeAllegations: 22 },
  { month: 'Aug-24', mpcaReach: 95000, iiEeAllegations: 28 },
  { month: 'Sep-24', mpcaReach: 85000, iiEeAllegations: 32 },
  { month: 'Oct-24', mpcaReach: 75000, iiEeAllegations: 35 },
  { month: 'Nov-24', mpcaReach: 65000, iiEeAllegations: 38 },
  { month: 'Dec-24', mpcaReach: 55000, iiEeAllegations: 42 },
  { month: 'Jan-25', mpcaReach: 48000, iiEeAllegations: 45 },
  { month: 'Feb-25', mpcaReach: 52000, iiEeAllegations: 40 },
  { month: 'Mar-25', mpcaReach: 58000, iiEeAllegations: 38 },
  { month: 'Apr-25', mpcaReach: 65000, iiEeAllegations: 35 },
  { month: 'May-25', mpcaReach: 72000, iiEeAllegations: 32 },
  { month: 'Jun-25', mpcaReach: 80000, iiEeAllegations: 28 },
  { month: 'Jul-25', mpcaReach: 90000, iiEeAllegations: 25 },
  { month: 'Aug-25', mpcaReach: 100000, iiEeAllegations: 22 },
  { month: 'Sep-25', mpcaReach: 110000, iiEeAllegations: 20 },
  { month: 'Oct-25', mpcaReach: 120000, iiEeAllegations: 18 },
  { month: 'Nov-25', mpcaReach: 130000, iiEeAllegations: 16 },
  { month: 'Dec-25', mpcaReach: 140000, iiEeAllegations: 14 },
];

export const gkIntensityQuarterly = [
  { quarter: 'Q1 2024', intensity: 4.2, mpcaReach: 167000 },
  { quarter: 'Q2 2024', intensity: 5.1, mpcaReach: 130000 },
  { quarter: 'Q3 2024', intensity: 6.8, mpcaReach: 90000 },
  { quarter: 'Q4 2024', intensity: 8.5, mpcaReach: 58000 },
  { quarter: 'Q1 2025', intensity: 9.2, mpcaReach: 51000 },
  { quarter: 'Q2 2025', intensity: 10.5, mpcaReach: 73000 },
  { quarter: 'Q3 2025', intensity: 11.8, mpcaReach: 100000 },
  { quarter: 'Q4 2025', intensity: 14.2, mpcaReach: 130000 },
];

export const gkResidualComparison = {
  y2024: { actual: 38, predicted: 45, residual: -6.54 },
  y2025: { actual: 52, predicted: 45, residual: 5.61 },
};

export const adtMapLocations = [
  { name: 'Garasbaley (SWS)', lat: 2.02, lng: 45.18, allegations: 201, severity: 'critical' as const },
  { name: 'Daynile (BN)', lat: 2.12, lng: 45.32, allegations: 85, severity: 'critical' as const },
  { name: 'Balcad (SWS)', lat: 2.28, lng: 45.52, allegations: 65, severity: 'high' as const },
  { name: 'Baidoa (SWS)', lat: 3.11, lng: 43.65, allegations: 55, severity: 'high' as const },
  { name: 'Bulo Burto (HS)', lat: 4.38, lng: 45.82, allegations: 50, severity: 'high' as const },
  { name: 'Dhobley (JL)', lat: 0.41, lng: 40.92, allegations: 45, severity: 'high' as const },
  { name: 'Mogadishu (BN)', lat: 2.05, lng: 45.34, allegations: 40, severity: 'moderate' as const },
  { name: 'Luuq (JL)', lat: 3.80, lng: 42.54, allegations: 20, severity: 'moderate' as const },
  { name: 'Afgooye (SWS)', lat: 2.14, lng: 45.12, allegations: 20, severity: 'moderate' as const },
  { name: 'Kismayo (JL)', lat: -0.36, lng: 42.55, allegations: 15, severity: 'moderate' as const },
];

export const ADT_INSIGHTS = [
  'Gatekeeper AD = 70% of all allegations',
  'Less delivery ≠ less diversion',
  'Intensity doubled in 2025 vs 2024',
  'Spikes when MPCA reach drops below 50K',
];

export const ADT_RMU_NOTES = {
  garasbaley:
    'Large batch of 201 allegations from Garasbaley in Q4 — from a one-off assessment — accounts for its hotspot position.',
  gatekeeper:
    'Gatekeeper counts include community leaders, camp leaders, clan, and local government authority. Comprehensive view = 62% of all allegations.',
  categoryChange:
    'Category definitions changed between 2024 and 2025. Annual comparison should be read with this caveat.',
};

export function toChartLabel(category: AdtCategory): string {
  return ADT_CATEGORY_CONFIG[category].shortLabel;
}

export function formatHotspotForChart(h: HotspotEntry) {
  return {
    location: h.location,
    ...Object.fromEntries(
      Object.entries(h).filter(([key]) => key !== 'location' && key !== 'total')
    ),
  };
}
