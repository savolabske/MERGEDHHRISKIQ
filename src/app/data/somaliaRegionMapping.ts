/**
 * Maps geoBoundaries ADM1 `shapeName` to hub region ids.
 * Boundaries: geoBoundaries-SOM-ADM1 (HDX / OCHA COD-AB, 18 regions).
 */
export const SOMALIA_ADM1_TO_HUB_ID: Record<string, string> = {
  Awdal: 'awdal',
  'Woqooyi Galbeed': 'woqooyi',
  Bari: 'bari',
  Nugaal: 'nugaal',
  Mudug: 'mudug',
  Galgaduud: 'galguduud',
  Hiiraan: 'hiraan',
  'Middle Shebelle': 'middle-shabelle',
  Banadir: 'banadir',
  'Lower Shebelle': 'lower-shabelle',
  Bay: 'bay',
  Bakool: 'bakool',
  Gedo: 'gedo',
  'Middle Juba': 'middle-juba',
  'Lower Juba': 'lower-juba',
  Sanaag: 'sanaag',
  Sool: 'sool',
  Togdheer: 'togdheer',
};

export function getHubRegionIdFromAdm1Name(shapeName: string): string | undefined {
  return SOMALIA_ADM1_TO_HUB_ID[shapeName];
}

/** Bounds that frame Somalia (geoBoundaries ADM0 extent). */
export const SOMALIA_MAP_BOUNDS: [[number, number], [number, number]] = [
  [-1.67, 40.99],
  [11.99, 51.41],
];
