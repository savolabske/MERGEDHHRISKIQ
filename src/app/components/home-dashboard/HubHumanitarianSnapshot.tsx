import { useMemo, useState } from 'react';
import {
  HUB_CLIMATE_HAZARD_META,
  HUB_COVERAGE_LEGEND,
  HUB_MAP_LAYER_META,
  HUB_MAP_REGIONS,
  getHubChoroplethPalette,
  getHubRegionCoverage,
  type HubClimateHazard,
  type HubMapLayer,
} from '../../data/homeDashboardMock';
import { hubCard } from './hubStyles';
import { HubSnapshotMap } from './HubSnapshotMap';

function MapToggle<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex items-center bg-muted border border-border rounded-lg p-0.5 shrink-0">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            active === option.id
              ? 'bg-card border border-border text-foreground font-semibold shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const MAIN_LAYERS: HubMapLayer[] = ['aid', 'climate', 'displacement'];

export function HubHumanitarianSnapshot() {
  const [layer, setLayer] = useState<HubMapLayer>('aid');
  const [climateHazard, setClimateHazard] = useState<HubClimateHazard>('drought');

  const layerMeta = HUB_MAP_LAYER_META[layer];
  const climateMeta = HUB_CLIMATE_HAZARD_META[climateHazard];
  const activeMeta = layer === 'climate' ? climateMeta : layerMeta;

  const palette = useMemo(
    () => getHubChoroplethPalette(layer, climateHazard),
    [layer, climateHazard],
  );

  const legendItems = useMemo(
    () =>
      HUB_COVERAGE_LEGEND.map((item) => ({
        ...item,
        color: palette[item.id],
      })),
    [palette],
  );

  const regions = useMemo(
    () =>
      HUB_MAP_REGIONS.map((region) => ({
        id: region.id,
        name: region.name,
        coverage: getHubRegionCoverage(region, layer, climateHazard),
      })),
    [layer, climateHazard],
  );

  const mapLayerLabel =
    layer === 'climate'
      ? `${layerMeta.label} · ${climateMeta.label}`
      : layerMeta.label;

  const subtitle =
    layer === 'climate' ? `${layerMeta.label} · ${climateMeta.label}` : layerMeta.label;

  return (
    <div className={`${hubCard} p-5 sm:p-6`}>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Somalia humanitarian map</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <MapToggle
            options={MAIN_LAYERS.map((id) => ({
              id,
              label: HUB_MAP_LAYER_META[id].label,
            }))}
            active={layer}
            onChange={setLayer}
          />
        </div>

        {layer === 'climate' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-subtle">View</span>
            <MapToggle
              options={(
                ['drought', 'floods'] as const
              ).map((id) => ({
                id,
                label: HUB_CLIMATE_HAZARD_META[id].label,
              }))}
              active={climateHazard}
              onChange={setClimateHazard}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
        <div className="relative rounded-xl border border-border overflow-hidden min-h-[320px] sm:min-h-[380px]">
          <HubSnapshotMap
            regions={regions}
            layer={layer}
            climateHazard={climateHazard}
            layerLabel={mapLayerLabel}
            palette={palette}
          />

          <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-[401] rounded-xl border border-border bg-card px-4 py-3 shadow-sm pointer-events-none">
            <p className="text-xs font-semibold text-text-subtle">
              {activeMeta.statLabel}
            </p>
            <p className="text-2xl font-bold text-foreground leading-none mt-2 tabular-nums">
              {activeMeta.statValue}
            </p>
          </div>
        </div>

        <aside className="flex flex-col rounded-xl border border-border bg-muted/40 p-5">
          <p className="text-sm font-semibold text-foreground">
            {layer === 'climate'
              ? `${layerMeta.label} · ${climateMeta.label}`
              : `${layerMeta.label} coverage`}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {activeMeta.summary}
          </p>
          <div className="mt-5 pt-5 border-t border-border space-y-3">
            <p className="text-xs font-semibold text-text-subtle">
              Legend
            </p>
            {legendItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
