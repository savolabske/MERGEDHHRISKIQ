export interface AdtSectionNarrative {
  eyebrow: string;
  eyebrowTone?: 'blue';
  headline: string;
  headlineAccent?: string;
  insight: string;
  bullets?: string[];
  footnote?: string;
}

export const ADT_SECTION_NARRATIVES = {
  highlights: {
    eyebrow: 'Highlights',
    eyebrowTone: 'blue',
    headline: '1,802 allegations tracked',
    headlineAccent: 'between Q4 2023 and Q4 2025',
    insight:
      'Teams logged 329 allegations in Q4 2025 alone. Allegations rose year-on-year through 2025—field reporting and monitoring are catching more cases, not fewer.',
  },
  q4Hotspots: {
    eyebrow: 'Q4 2025 — Aid Diversion Hotspots',
    eyebrowTone: 'blue',
    headline: 'Where diversion is',
    headlineAccent: 'most concentrated',
    insight:
      'Garasbaley tops the Q4 map because of one large assessment batch—treat it as a spike, not the normal baseline. Dhobley and Merca show steadier, recurring pressure.',
  },
  top10Hotspots: {
    eyebrow: '2025 Top 10 Hotspots',
    eyebrowTone: 'blue',
    headline: 'The locations driving',
    headlineAccent: 'annual diversion volume',
    insight:
      'Extortion drove volume in Garasbaley and Daynile; improper influence clustered in Dhobley and Bulo Burto. Use the full-year list to prioritise oversight visits.',
  },
  categoryBreakdown: {
    eyebrow: 'Q4 2025 — By Category',
    eyebrowTone: 'blue',
    headline: 'How diversion manifests',
    headlineAccent: 'across allegation types',
    insight:
      'Extortion dominated Garasbaley, influence cases stacked up in Dhobley, and delivery blocking showed up in Hargeisa—each category needs a different field response.',
  },
  perpetrators: {
    eyebrow: '2025 — Perpetrators of AD Allegations',
    eyebrowTone: 'blue',
    headline: 'Gatekeepers at the',
    headlineAccent: 'heart of the problem',
    insight:
      'Most allegations involve gatekeepers—camp leaders, clan figures, and local authorities—not distant armed groups alone. Screening and community engagement should target those roles.',
  },
  adProfile: {
    eyebrow: 'Q3 vs Q4 2025',
    eyebrowTone: 'blue',
    headline: 'The quarterly profile',
    headlineAccent: 'returns to normal',
    insight:
      'Q3 looked unusual; Q4 settled back to the usual mix dominated by influence, blocked deliveries, and extortion.',
    bullets: [
      'Improper Influence, Prevention of Delivery, and Economic Extortion account for 89% of Q4 allegations.',
      'Improper Influence more than doubled from Q3 to Q4 — from 22 to 55 — a return to expected levels.',
      'Five Aid Sold in Market allegations in Q4 equal half the 2025 annual total of ten.',
    ],
    footnote: 'Q4 adjusted to exclude large batch reporting from one-off contributors.',
  },
  mix2025: {
    eyebrow: 'Aid Diversion in 2025',
    eyebrowTone: 'blue',
    headline: 'The full picture across',
    headlineAccent: '962 allegations',
    insight:
      'Extortion, improper influence, and blocked deliveries remain the top three allegation types nationwide—the same pattern as prior years.',
  },
  gatekeeperTracking: {
    eyebrow: 'Tracking Gatekeeper Aid Diversion',
    eyebrowTone: 'blue',
    headline: 'An emerging metric',
    headlineAccent: 'for monitoring GK AD',
    insight:
      'When cash reach drops, gatekeeper-related allegations often rise—track both together. Jul 2024–Jul 2025 is the most reliable window for comparing trends.',
    bullets: [
      'Jul 2024 – Jul 2025 is the strongest analysis window with reliable, standardised reporting.',
      '2024 actuals fell below predicted gatekeeper AD; 2025 rose above — likely reflecting improved monitoring, not necessarily more diversion.',
    ],
  },
  intensity: {
    eyebrow: 'RMU Analysis',
    eyebrowTone: 'blue',
    headline: 'Less aid delivery',
    headlineAccent: '≠ less aid diversion',
    insight:
      'Gatekeeper allegations per people reached doubled in 2025—partly because delivery volumes shrank. Tighten safeguards whenever monthly reach falls sharply.',
    bullets: [
      'More safeguards needed in low-delivery months.',
      'Adjust risk matrices to examine GK behaviour when funding and delivery shrink.',
    ],
  },
  geographic: {
    eyebrow: 'Geographic View',
    eyebrowTone: 'blue',
    headline: 'Hotspots mapped',
    headlineAccent: 'across Somalia',
    insight:
      'See where diversion allegations cluster across Somalia and how intense each hotspot is—use this map to align field monitoring with Q4 and annual rankings.',
  },
} satisfies Record<string, AdtSectionNarrative>;

export const q4HotspotsLocations: Array<{
  location: string;
  economicExtortion: number;
  improperInfluence: number;
  preventionOfDelivery: number;
  theftDamage: number;
  unethicalBehaviour: number;
}> = [
  { location: 'Garasbaley (SWS)', economicExtortion: 201, improperInfluence: 0, preventionOfDelivery: 0, theftDamage: 0, unethicalBehaviour: 0 },
  { location: 'Dhobley (JL)', economicExtortion: 0, improperInfluence: 40, preventionOfDelivery: 0, theftDamage: 0, unethicalBehaviour: 0 },
  { location: 'Buufow Bacaad, Merca (SWS)', economicExtortion: 3, improperInfluence: 2, preventionOfDelivery: 1, theftDamage: 0, unethicalBehaviour: 0 },
  { location: 'Mogadishu (BN)', economicExtortion: 4, improperInfluence: 3, preventionOfDelivery: 2, theftDamage: 1, unethicalBehaviour: 0 },
  { location: 'Dollow (JL)', economicExtortion: 0, improperInfluence: 5, preventionOfDelivery: 0, theftDamage: 0, unethicalBehaviour: 0 },
];

export const q4CategoryMiniCharts = [
  {
    title: 'Economic Extortion',
    category: 'economicExtortion' as const,
    data: [
      { location: 'Garasbaley (SWS)', value: 201 },
      { location: 'Merca (SWS)', value: 4 },
      { location: 'Mogadishu (BN)', value: 3 },
    ],
  },
  {
    title: 'Improper Influence',
    category: 'improperInfluence' as const,
    data: [
      { location: 'Dhobley (JL)', value: 40 },
      { location: 'Merca (SWS)', value: 3 },
      { location: 'Dollow (JL)', value: 3 },
    ],
  },
  {
    title: 'Prevention of Delivery',
    category: 'preventionOfDelivery' as const,
    data: [
      { location: 'Hargeisa (SL)', value: 3 },
      { location: 'Zeylac, Awdal (PL)', value: 2 },
      { location: 'Jamaame (JL)', value: 2 },
      { location: 'Beletweyne (HS)', value: 2 },
      { location: 'Badhaadhe (JL)', value: 2 },
    ],
  },
  {
    title: 'Theft / Damage',
    category: 'theftDamage' as const,
    data: [
      { location: 'Jalalaqsi (HS)', value: 1 },
      { location: 'Lughaya (SL)', value: 1 },
      { location: 'Afgoye (SWS)', value: 1 },
      { location: 'Burhakaba (SWS)', value: 1 },
    ],
  },
  {
    title: 'Aid Sold in Market',
    category: 'aidSoldInMarket' as const,
    data: [
      { location: 'Garbahaarey (JL)', value: 1 },
      { location: 'Afgoye (SWS)', value: 1 },
      { location: 'Galkayo (PL)', value: 1 },
    ],
  },
  {
    title: 'Unethical Behaviour',
    category: 'unethicalBehaviour' as const,
    data: [
      { location: 'Balcad (SWS)', value: 1 },
      { location: 'Hargeisa (SL)', value: 1 },
      { location: 'Garowe (PL)', value: 1 },
    ],
  },
];
