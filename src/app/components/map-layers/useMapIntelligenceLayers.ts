import { useCallback, useEffect, useRef } from 'react';
import type { Map as MapboxMap, MapLayerMouseEvent } from 'mapbox-gl';
import { mapboxgl, type MapBasemapTheme } from '../../config/mapbox';
import somaliaAdm1 from '../../data/somalia-adm1.json';
import { getHubRegionIdFromAdm1Name } from '../../data/somaliaRegionMapping';
import {
  ALERT_SEVERITY_COLORS,
  getActiveFillLayer,
  getFillColor,
  getRegionById,
  getRegionFillValue,
  MAP_ALERT_POINTS,
  MAP_DETECTED_WATERS_GEO,
  MAP_REGION_INTELLIGENCE,
  MAP_ROADS_GEO,
  MAP_SEA_PORTS,
  type MapAlertPoint,
  type MapDataLayerId,
  type MapOverlayId,
  type MapRegionIntelligence,
  type RiskDimension,
} from '../../data/mapLayersMock';
import {
  buildAlertHoverCardHtml,
  buildRegionHoverCardHtml,
} from './mapHoverCards';

const SOURCE_ADM1 = 'intel-adm1';
const SOURCE_ALERTS = 'intel-alerts';
const SOURCE_DISPLACEMENT = 'intel-displacement';
const SOURCE_PORTS = 'intel-ports';
const SOURCE_ROADS = 'intel-roads';
const SOURCE_WATERS = 'intel-waters';

const LAYER_FILL = 'intel-adm1-fill';
const LAYER_OUTLINE = 'intel-adm1-outline';
const LAYER_HIGHLIGHT = 'intel-adm1-highlight';
const LAYER_ALERTS = 'intel-alerts-circle';
const LAYER_ALERTS_GLOW = 'intel-alerts-glow';
const LAYER_DISPLACEMENT = 'intel-displacement-circle';
const LAYER_PORTS = 'intel-ports-circle';
const LAYER_ROADS = 'intel-roads-line';
const LAYER_WATERS = 'intel-waters-fill';
const LAYER_DROUGHT_LABELS = 'intel-drought-labels';

const ALL_LAYER_IDS = [
  LAYER_WATERS,
  LAYER_FILL,
  LAYER_OUTLINE,
  LAYER_HIGHLIGHT,
  LAYER_ROADS,
  LAYER_DISPLACEMENT,
  LAYER_ALERTS_GLOW,
  LAYER_ALERTS,
  LAYER_PORTS,
  LAYER_DROUGHT_LABELS,
];

const ALL_SOURCE_IDS = [
  SOURCE_ADM1,
  SOURCE_ALERTS,
  SOURCE_DISPLACEMENT,
  SOURCE_PORTS,
  SOURCE_ROADS,
  SOURCE_WATERS,
];

export type MapIntelligenceLayerOptions = {
  enabled: boolean;
  mapRef: React.RefObject<MapboxMap | null>;
  selectedLayers: Set<MapDataLayerId>;
  selectedOverlays: Set<MapOverlayId>;
  riskDimension: RiskDimension;
  selectedRegionId: string | null;
  /** Bumps after map.setStyle so custom layers are reattached. */
  styleEpoch?: number;
  basemapTheme?: MapBasemapTheme;
  onHoverRegion: (region: MapRegionIntelligence | null) => void;
  onSelectRegion: (region: MapRegionIntelligence | null) => void;
  onHoverAlert: (alert: MapAlertPoint | null) => void;
};

function enrichAdm1GeoJSON(
  selectedLayers: Set<MapDataLayerId>,
  riskDimension: RiskDimension,
): GeoJSON.FeatureCollection {
  const fillLayer = getActiveFillLayer(selectedLayers);
  const features = (somaliaAdm1 as GeoJSON.FeatureCollection).features.map((feature) => {
    const shapeName = (feature.properties as { shapeName?: string } | null)?.shapeName ?? '';
    const regionId = getHubRegionIdFromAdm1Name(shapeName);
    const region = regionId ? getRegionById(regionId) : undefined;
    const fillT = region && fillLayer
      ? getRegionFillValue(region, fillLayer, riskDimension)
      : 0;
    const fillColor = fillLayer ? getFillColor(fillLayer, fillT) : 'rgba(0,0,0,0)';
    const droughtLabel =
      region && selectedLayers.has('drought')
        ? `D ${region.drought}`
        : '';

    return {
      ...feature,
      properties: {
        ...feature.properties,
        regionId: regionId ?? null,
        regionName: region?.name ?? shapeName,
        fillColor,
        fillOpacity: fillLayer && region ? 0.55 + fillT * 0.35 : 0,
        droughtLabel,
        displacementPop: region?.displacementPop ?? 0,
        riskScore: region?.riskScore ?? 0,
      },
    };
  });

  return { type: 'FeatureCollection', features };
}

function alertsGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: MAP_ALERT_POINTS.map((alert) => ({
      type: 'Feature' as const,
      properties: {
        id: alert.id,
        name: alert.name,
        severity: alert.severity,
        color: ALERT_SEVERITY_COLORS[alert.severity],
        regionId: alert.regionId,
        summary: alert.summary,
        updatedLabel: alert.updatedLabel,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: alert.coordinates,
      },
    })),
  };
}

function displacementGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: MAP_REGION_INTELLIGENCE.map((region) => ({
      type: 'Feature' as const,
      properties: {
        regionId: region.id,
        name: region.name,
        population: region.displacementPop,
        radius: Math.max(8, Math.min(42, Math.sqrt(region.displacementPop) / 12)),
      },
      geometry: {
        type: 'Point' as const,
        coordinates: region.center,
      },
    })),
  };
}

function portsGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: MAP_SEA_PORTS.map((port) => ({
      type: 'Feature' as const,
      properties: { id: port.id, name: port.name },
      geometry: { type: 'Point' as const, coordinates: port.coordinates },
    })),
  };
}

export function useMapIntelligenceLayers({
  enabled,
  mapRef,
  selectedLayers,
  selectedOverlays,
  riskDimension,
  selectedRegionId,
  styleEpoch = 0,
  basemapTheme = 'dark',
  onHoverRegion,
  onSelectRegion,
  onHoverAlert,
}: MapIntelligenceLayerOptions) {
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);
  const handlersBoundRef = useRef(false);
  const selectedLayersRef = useRef(selectedLayers);
  selectedLayersRef.current = selectedLayers;
  const basemapThemeRef = useRef(basemapTheme);
  basemapThemeRef.current = basemapTheme;

  const clearHoverPopup = useCallback(() => {
    hoverPopupRef.current?.remove();
    hoverPopupRef.current = null;
  }, []);

  const removeIntelligenceLayers = useCallback((map: MapboxMap) => {
    clearHoverPopup();
    ALL_LAYER_IDS.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ALL_SOURCE_IDS.forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
    // Layer event handlers are tied to layer ids; after setStyle they must rebind.
    handlersBoundRef.current = false;
  }, [clearHoverPopup]);

  const ensureSourcesAndLayers = useCallback(
    (map: MapboxMap) => {
      const isLight = basemapThemeRef.current === 'light';
      const outlineColor = isLight ? '#334155' : '#E2E8F0';
      const droughtHalo = isLight ? '#F8FAFC' : '#0F172A';
      const portsFill = isLight ? '#0F172A' : '#F8FAFC';

      if (!map.getSource(SOURCE_ADM1)) {
        map.addSource(SOURCE_ADM1, {
          type: 'geojson',
          data: enrichAdm1GeoJSON(selectedLayersRef.current, riskDimension),
        });
      }
      if (!map.getSource(SOURCE_ALERTS)) {
        map.addSource(SOURCE_ALERTS, { type: 'geojson', data: alertsGeoJSON() });
      }
      if (!map.getSource(SOURCE_DISPLACEMENT)) {
        map.addSource(SOURCE_DISPLACEMENT, {
          type: 'geojson',
          data: displacementGeoJSON(),
        });
      }
      if (!map.getSource(SOURCE_PORTS)) {
        map.addSource(SOURCE_PORTS, { type: 'geojson', data: portsGeoJSON() });
      }
      if (!map.getSource(SOURCE_ROADS)) {
        map.addSource(SOURCE_ROADS, { type: 'geojson', data: MAP_ROADS_GEO });
      }
      if (!map.getSource(SOURCE_WATERS)) {
        map.addSource(SOURCE_WATERS, {
          type: 'geojson',
          data: MAP_DETECTED_WATERS_GEO,
        });
      }

      if (!map.getLayer(LAYER_WATERS)) {
        map.addLayer({
          id: LAYER_WATERS,
          type: 'fill',
          source: SOURCE_WATERS,
          paint: {
            'fill-color': '#38BDF8',
            'fill-opacity': 0.22,
          },
          layout: { visibility: 'none' },
        });
      }

      if (!map.getLayer(LAYER_FILL)) {
        map.addLayer({
          id: LAYER_FILL,
          type: 'fill',
          source: SOURCE_ADM1,
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': ['get', 'fillOpacity'],
          },
          layout: { visibility: 'none' },
        });
      }

      if (!map.getLayer(LAYER_OUTLINE)) {
        map.addLayer({
          id: LAYER_OUTLINE,
          type: 'line',
          source: SOURCE_ADM1,
          paint: {
            'line-color': outlineColor,
            'line-width': 1,
            'line-opacity': 0.55,
          },
          layout: { visibility: 'none' },
        });
      } else {
        map.setPaintProperty(LAYER_OUTLINE, 'line-color', outlineColor);
      }

      if (!map.getLayer(LAYER_HIGHLIGHT)) {
        map.addLayer({
          id: LAYER_HIGHLIGHT,
          type: 'line',
          source: SOURCE_ADM1,
          paint: {
            'line-color': '#38BDF8',
            'line-width': 2.5,
            'line-opacity': 0.95,
          },
          filter: ['==', ['get', 'regionId'], ''],
          layout: { visibility: 'none' },
        });
      }

      if (!map.getLayer(LAYER_ROADS)) {
        map.addLayer({
          id: LAYER_ROADS,
          type: 'line',
          source: SOURCE_ROADS,
          paint: {
            'line-color': isLight ? '#64748B' : '#94A3B8',
            'line-width': 2,
            'line-opacity': 0.7,
          },
          layout: { visibility: 'none' },
        });
      } else {
        map.setPaintProperty(LAYER_ROADS, 'line-color', isLight ? '#64748B' : '#94A3B8');
      }

      if (!map.getLayer(LAYER_DISPLACEMENT)) {
        map.addLayer({
          id: LAYER_DISPLACEMENT,
          type: 'circle',
          source: SOURCE_DISPLACEMENT,
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': '#2DD4BF',
            'circle-opacity': 0.45,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#5EEAD4',
          },
          layout: { visibility: 'none' },
        });
      }

      if (!map.getLayer(LAYER_ALERTS_GLOW)) {
        map.addLayer({
          id: LAYER_ALERTS_GLOW,
          type: 'circle',
          source: SOURCE_ALERTS,
          paint: {
            'circle-radius': 18,
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.18,
            'circle-blur': 0.6,
          },
          layout: { visibility: 'none' },
        });
      }

      if (!map.getLayer(LAYER_ALERTS)) {
        map.addLayer({
          id: LAYER_ALERTS,
          type: 'circle',
          source: SOURCE_ALERTS,
          paint: {
            'circle-radius': 7,
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.95,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255,255,255,0.85)',
          },
          layout: { visibility: 'none' },
        });
      }

      if (!map.getLayer(LAYER_PORTS)) {
        map.addLayer({
          id: LAYER_PORTS,
          type: 'circle',
          source: SOURCE_PORTS,
          paint: {
            'circle-radius': 6,
            'circle-color': portsFill,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#3B82F6',
          },
          layout: { visibility: 'none' },
        });
      } else {
        map.setPaintProperty(LAYER_PORTS, 'circle-color', portsFill);
      }

      if (!map.getLayer(LAYER_DROUGHT_LABELS)) {
        map.addLayer({
          id: LAYER_DROUGHT_LABELS,
          type: 'symbol',
          source: SOURCE_ADM1,
          layout: {
            'text-field': ['get', 'droughtLabel'],
            'text-size': 11,
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            visibility: 'none',
          },
          paint: {
            'text-color': '#FDBA74',
            'text-halo-color': droughtHalo,
            'text-halo-width': 1.2,
          },
          filter: ['!=', ['get', 'droughtLabel'], ''],
        });
      } else {
        map.setPaintProperty(LAYER_DROUGHT_LABELS, 'text-halo-color', droughtHalo);
      }
    },
    [riskDimension],
  );

  const bindHandlers = useCallback(
    (map: MapboxMap) => {
      if (handlersBoundRef.current) return;
      handlersBoundRef.current = true;

      const showRegionHover = (e: MapLayerMouseEvent) => {
        const props = e.features?.[0]?.properties;
        if (!props?.regionId) return;
        const region = getRegionById(String(props.regionId));
        if (!region) return;
        onHoverRegion(region);
        map.getCanvas().style.cursor = 'pointer';
        clearHoverPopup();
        hoverPopupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: 'gis-tooltip region-hover-card',
          maxWidth: '300px',
        })
          .setLngLat(e.lngLat)
          .setHTML(buildRegionHoverCardHtml(region, selectedLayersRef.current))
          .addTo(map);
      };

      const hideRegionHover = () => {
        onHoverRegion(null);
        map.getCanvas().style.cursor = '';
        clearHoverPopup();
      };

      map.on('mousemove', LAYER_FILL, showRegionHover);
      map.on('mouseleave', LAYER_FILL, hideRegionHover);

      map.on('click', LAYER_FILL, (e) => {
        e.originalEvent.stopPropagation();
        const props = e.features?.[0]?.properties;
        if (!props?.regionId) return;
        const region = getRegionById(String(props.regionId));
        onSelectRegion(region ?? null);
      });

      map.on('mousemove', LAYER_ALERTS, (e) => {
        const props = e.features?.[0]?.properties;
        if (!props?.id) return;
        const alert = MAP_ALERT_POINTS.find((a) => a.id === props.id);
        if (!alert) return;
        onHoverAlert(alert);
        map.getCanvas().style.cursor = 'pointer';
        clearHoverPopup();
        hoverPopupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 14,
          className: 'gis-tooltip region-hover-card',
          maxWidth: '280px',
        })
          .setLngLat(e.lngLat)
          .setHTML(buildAlertHoverCardHtml(alert))
          .addTo(map);
      });

      map.on('mouseleave', LAYER_ALERTS, () => {
        onHoverAlert(null);
        map.getCanvas().style.cursor = '';
        clearHoverPopup();
      });

      map.on('click', LAYER_ALERTS, (e) => {
        e.originalEvent.stopPropagation();
        const props = e.features?.[0]?.properties;
        if (!props?.regionId) return;
        const region = getRegionById(String(props.regionId));
        onSelectRegion(region ?? null);
      });

      map.on('click', LAYER_DISPLACEMENT, (e) => {
        e.originalEvent.stopPropagation();
        const props = e.features?.[0]?.properties;
        if (!props?.regionId) return;
        const region = getRegionById(String(props.regionId));
        onSelectRegion(region ?? null);
      });
    },
    [clearHoverPopup, onHoverAlert, onHoverRegion, onSelectRegion],
  );

  // Sync visibility + data when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = () => {
      if (!enabled) {
        if (map.getSource(SOURCE_ADM1)) {
          removeIntelligenceLayers(map);
        }
        return;
      }

      // After setStyle, Mapbox drops custom sources/layers but keeps our handler flag.
      if (!map.getSource(SOURCE_ADM1)) {
        handlersBoundRef.current = false;
      }

      ensureSourcesAndLayers(map);
      bindHandlers(map);

      const fillLayer = getActiveFillLayer(selectedLayers);
      const adm1Data = enrichAdm1GeoJSON(selectedLayers, riskDimension);
      const adm1Source = map.getSource(SOURCE_ADM1) as mapboxgl.GeoJSONSource | undefined;
      adm1Source?.setData(adm1Data);

      const showFill = Boolean(fillLayer);
      // Keep an invisible hit-target fill whenever regional intel is on so hover/click work
      const showHitFill =
        showFill ||
        selectedLayers.has('risk') ||
        selectedLayers.has('aid') ||
        selectedLayers.has('drought') ||
        selectedLayers.has('floods') ||
        selectedLayers.has('displacement');
      const showOutline =
        showFill ||
        selectedLayers.has('displacement') ||
        selectedLayers.has('drought') ||
        selectedLayers.has('floods') ||
        selectedLayers.has('aid') ||
        selectedLayers.has('risk');

      setVisibility(map, LAYER_FILL, showHitFill);
      setVisibility(map, LAYER_OUTLINE, showOutline);
      setVisibility(map, LAYER_HIGHLIGHT, Boolean(selectedRegionId));
      setVisibility(map, LAYER_ALERTS, selectedLayers.has('alerts'));
      setVisibility(map, LAYER_ALERTS_GLOW, selectedLayers.has('alerts'));
      setVisibility(map, LAYER_DISPLACEMENT, selectedLayers.has('displacement'));
      setVisibility(map, LAYER_DROUGHT_LABELS, selectedLayers.has('drought'));
      setVisibility(map, LAYER_PORTS, selectedOverlays.has('sea-ports'));
      setVisibility(map, LAYER_ROADS, selectedOverlays.has('roads'));
      setVisibility(map, LAYER_WATERS, selectedOverlays.has('detected-waters'));

      if (map.getLayer(LAYER_HIGHLIGHT)) {
        map.setFilter(LAYER_HIGHLIGHT, [
          '==',
          ['get', 'regionId'],
          selectedRegionId ?? '',
        ]);
      }

      if (map.getLayer(LAYER_FILL)) {
        map.setPaintProperty(LAYER_FILL, 'fill-opacity', ['get', 'fillOpacity']);
      }
    };

    if (map.isStyleLoaded()) {
      sync();
    } else {
      map.once('style.load', sync);
    }
  }, [
    basemapTheme,
    bindHandlers,
    enabled,
    ensureSourcesAndLayers,
    mapRef,
    removeIntelligenceLayers,
    riskDimension,
    selectedLayers,
    selectedOverlays,
    selectedRegionId,
    styleEpoch,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const map = mapRef.current;
      if (map) removeIntelligenceLayers(map);
    };
  }, [mapRef, removeIntelligenceLayers]);

  return { clearHoverPopup, removeIntelligenceLayers };
}

function setVisibility(map: MapboxMap, layerId: string, visible: boolean) {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
}
