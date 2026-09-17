import mapboxgl from 'mapbox-gl';

/** Set at build time via VITE_MAPBOX_ACCESS_TOKEN (e.g. Netlify env vars). */
export const mapboxAccessToken =
  (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined)?.trim() ?? '';

export function hasMapboxAccessToken(): boolean {
  return mapboxAccessToken.length > 0;
}

if (hasMapboxAccessToken()) {
  mapboxgl.accessToken = mapboxAccessToken;
}

/** GIS map basemap schemes — night is the product default. */
export type MapBasemapTheme = 'dark' | 'light';

/**
 * Classic navigation styles match the original product look (charcoal land,
 * readable water contrast). Zoom-detail labels live on our GeoJSON layers.
 */
export const MAP_BASEMAP_STYLES: Record<MapBasemapTheme, string> = {
  dark: 'mapbox://styles/mapbox/navigation-night-v1',
  light: 'mapbox://styles/mapbox/navigation-day-v1',
};

export const DEFAULT_MAP_BASEMAP_THEME: MapBasemapTheme = 'dark';

export { mapboxgl };
