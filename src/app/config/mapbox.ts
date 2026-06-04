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

export { mapboxgl };
