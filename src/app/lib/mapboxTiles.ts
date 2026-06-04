import type { Map as LeafletMap } from 'leaflet';

type LeafletModule = typeof import('leaflet');

/** Mapbox raster tiles when configured; otherwise OpenStreetMap. */
export function addMapBaseTileLayer(L: LeafletModule, map: LeafletMap): void {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
  const rawMapboxStyle =
    (import.meta.env.VITE_MAPBOX_STYLE_ID as string | undefined) || 'mapbox/streets-v12';
  const mapboxStylePath = rawMapboxStyle
    .replace(/^mapbox:\/\/styles\//, '')
    .replace(/^styles\//, '');

  if (mapboxToken) {
    L.tileLayer(
      `https://api.mapbox.com/styles/v1/${mapboxStylePath}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 20,
        attribution:
          '© <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      },
    ).addTo(map);
    return;
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
}
