import { useEffect, useMemo, useRef } from 'react';
import type { GeoJSON as LeafletGeoJSON, Map as LeafletMap, Path, PathOptions } from 'leaflet';
import {
  buildHubRegionTooltipHtml,
  getHubRegionTooltipStats,
  HUB_COVERAGE_LEGEND,
} from '../../data/homeDashboardMock';
import type {
  HubClimateHazard,
  HubMapCoverage,
  HubMapLayer,
} from '../../data/homeDashboardMock';
import somaliaAdm1 from '../../data/somalia-adm1.json';
import { getHubRegionIdFromAdm1Name, SOMALIA_MAP_BOUNDS } from '../../data/somaliaRegionMapping';
import { addMapBaseTileLayer } from '../../lib/mapboxTiles';

const COVERAGE_LABEL = Object.fromEntries(
  HUB_COVERAGE_LEGEND.map((item) => [item.id, item.label]),
) as Record<HubMapCoverage, string>;

const CHOROPLETH_STYLE: PathOptions = {
  color: '#ffffff',
  weight: 1.5,
  opacity: 1,
  fillOpacity: 0.78,
};

export type HubSnapshotMapRegion = {
  id: string;
  name: string;
  coverage: HubMapCoverage;
};

interface HubSnapshotMapProps {
  regions: HubSnapshotMapRegion[];
  layer: HubMapLayer;
  climateHazard: HubClimateHazard;
  layerLabel: string;
  palette: Record<HubMapCoverage, string>;
}

type Adm1Feature = GeoJSON.Feature<GeoJSON.Geometry, { shapeName?: string }>;

function regionStyle(
  coverageById: Map<string, HubSnapshotMapRegion>,
  palette: Record<HubMapCoverage, string>,
  feature?: Adm1Feature,
): PathOptions {
  const hubId = getHubRegionIdFromAdm1Name(feature?.properties?.shapeName ?? '');
  const coverage = hubId ? coverageById.get(hubId)?.coverage : undefined;
  const fill = coverage ? palette[coverage] : '#e2e8f0';

  return {
    ...CHOROPLETH_STYLE,
    fillColor: fill,
    fillOpacity: coverage ? 0.78 : 0.35,
  };
}

function buildChoroplethLayer(
  L: typeof import('leaflet'),
  coverageById: Map<string, HubSnapshotMapRegion>,
  palette: Record<HubMapCoverage, string>,
  mapLayer: HubMapLayer,
  climateHazard: HubClimateHazard,
  layerLabel: string,
): LeafletGeoJSON {
  return L.geoJSON(somaliaAdm1, {
    style: (feature) => regionStyle(coverageById, palette, feature as Adm1Feature),
    onEachFeature: (feature: Adm1Feature, featureLayer) => {
      const shapeName = feature.properties?.shapeName ?? 'Region';
      const hubId = getHubRegionIdFromAdm1Name(shapeName);
      const region = hubId ? coverageById.get(hubId) : undefined;
      const coverageLabel = region
        ? COVERAGE_LABEL[region.coverage]
        : 'No coverage data';
      const pathLayer = featureLayer as Path;
      const tooltipHtml = region
        ? buildHubRegionTooltipHtml({
            regionName: region.name,
            layerLabel,
            coverageLabel,
            stats: getHubRegionTooltipStats(
              region.id,
              mapLayer,
              climateHazard,
              region.coverage,
            ),
          })
        : `<div style="min-width:150px;">
            <div style="font-weight:600;font-size:13px;">${shapeName}</div>
            <div style="margin-top:4px;font-size:12px;color:#64748b;">${layerLabel}</div>
            <div style="margin-top:2px;font-size:12px;font-weight:500;">No coverage data</div>
          </div>`;

      pathLayer.bindTooltip(
        tooltipHtml,
        {
          sticky: false,
          direction: 'top',
          opacity: 0.97,
          className: 'map-hover-tooltip',
        },
      );

      const baseStyle = regionStyle(coverageById, palette, feature);

      pathLayer.on({
        mouseover: () => {
          pathLayer.setStyle({
            ...baseStyle,
            weight: 2.5,
            fillOpacity: 0.92,
          });
          pathLayer.bringToFront();
          pathLayer.openTooltip();
        },
        mouseout: () => {
          pathLayer.setStyle(baseStyle);
          pathLayer.closeTooltip();
        },
      });
    },
  });
}

export function HubSnapshotMap({
  regions,
  layer,
  climateHazard,
  layerLabel,
  palette,
}: HubSnapshotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const geoJsonLayerRef = useRef<LeafletGeoJSON | null>(null);
  const hasFitBoundsRef = useRef(false);

  const coverageById = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  );

  const paletteKey = useMemo(
    () => `${palette.well}-${palette.adequate}-${palette.critical}`,
    [palette],
  );

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) {
        return;
      }

      let map = mapInstanceRef.current;
      if (!map) {
        map = L.map(mapRef.current, {
          zoomControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          dragging: true,
          attributionControl: true,
          minZoom: 5,
          maxZoom: 10,
        });

        L.control
          .zoom({
            position: 'bottomright',
          })
          .addTo(map);

        map.fitBounds(SOMALIA_MAP_BOUNDS, { padding: [12, 12] });
        map.setMaxBounds([
          [-3.5, 39.5],
          [13.5, 52.5],
        ]);

        addMapBaseTileLayer(L, map);
        mapInstanceRef.current = map;
      }

      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
      }

      geoJsonLayerRef.current = buildChoroplethLayer(
        L,
        coverageById,
        palette,
        layer,
        climateHazard,
        layerLabel,
      ).addTo(map);

      if (!hasFitBoundsRef.current) {
        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 7 });
          hasFitBoundsRef.current = true;
        }
      }

      map.invalidateSize();
    });

    return () => {
      cancelled = true;
    };
  }, [climateHazard, coverageById, layer, layerLabel, palette, paletteKey, regions]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        geoJsonLayerRef.current = null;
        hasFitBoundsRef.current = false;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 z-0 h-full w-full cursor-grab active:cursor-grabbing [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-zoom]:z-[450] [&_.leaflet-control-zoom]:border-border [&_.leaflet-control-zoom_a]:text-foreground"
      role="application"
      aria-label="Interactive choropleth map of Somalia regions. Use zoom controls or scroll to zoom; hover regions for coverage details."
    />
  );
}
