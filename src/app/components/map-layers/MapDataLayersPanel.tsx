import { Layers, ChevronDown, Check } from 'lucide-react';
import { cn } from '../ui/utils';
import {
  MAP_DATA_LAYERS,
  MAP_OVERLAY_GROUPS,
  RISK_DIMENSIONS,
  type MapDataLayerId,
  type MapOverlayId,
  type RiskDimension,
} from '../../data/mapLayersMock';

type MapDataLayersPanelProps = {
  selectedLayers: Set<MapDataLayerId>;
  selectedOverlays: Set<MapOverlayId>;
  fillLayer: MapDataLayerId | null;
  riskDimension: RiskDimension;
  onToggleLayer: (id: MapDataLayerId) => void;
  onToggleOverlay: (id: MapOverlayId) => void;
  onRiskDimensionChange: (dim: RiskDimension) => void;
  className?: string;
};

function LayerCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors',
        checked
          ? 'border-[#3B82F6] bg-[#3B82F6] text-white'
          : 'border-[#64748B] bg-transparent',
      )}
      aria-hidden
    >
      {checked && <Check size={10} strokeWidth={3} />}
    </span>
  );
}

export function MapDataLayersPanel({
  selectedLayers,
  selectedOverlays,
  fillLayer,
  riskDimension,
  onToggleLayer,
  onToggleOverlay,
  onRiskDimensionChange,
  className,
}: MapDataLayersPanelProps) {
  const riskOn = selectedLayers.has('risk');

  return (
    <aside
      className={cn(
        'pointer-events-auto flex max-h-[min(72vh,640px)] w-[220px] flex-col overflow-hidden rounded-2xl border border-[#1E293B]/90 bg-[#0F172A]/92 shadow-2xl shadow-black/40 backdrop-blur-md',
        className,
      )}
      aria-label="Data layers"
    >
      <div className="flex items-center gap-2 border-b border-[#1E293B] px-3.5 py-3 pr-10">
        <Layers size={14} className="text-[#E2E8F0]" strokeWidth={1.75} />
        <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-white uppercase">
          Data layers
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        <ul className="space-y-0.5" role="list">
          {MAP_DATA_LAYERS.map((layer) => {
            const active = selectedLayers.has(layer.id);
            const showFill = active && fillLayer === layer.id;
            return (
              <li key={layer.id}>
                <button
                  type="button"
                  onClick={() => onToggleLayer(layer.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                    active
                      ? 'bg-[#1E293B]/80 text-[#F8FAFC]'
                      : 'text-[#CBD5E1] hover:bg-[#1E293B]/45',
                  )}
                >
                  <LayerCheckbox checked={active} />
                  <span className="flex-1 text-[0.8125rem] font-medium">{layer.label}</span>
                  {showFill && (
                    <span className="rounded-md bg-[#334155]/80 px-1.5 py-0.5 text-[0.5625rem] font-semibold tracking-wide text-[#94A3B8]">
                      FILL
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {riskOn && (
          <div className="mt-2 space-y-2 border-t border-[#1E293B] px-1.5 pt-3 pb-1">
            <div>
              <label className="mb-1 block text-[0.6875rem] !text-[#94A3B8]">
                Risk dimension
              </label>
              <div className="relative">
                <select
                  value={riskDimension}
                  onChange={(e) =>
                    onRiskDimensionChange(e.target.value as RiskDimension)
                  }
                  className="w-full appearance-none rounded-lg border border-[#334155] bg-[#0B1220] py-2 pr-8 pl-2.5 text-[0.75rem] text-[#E2E8F0] outline-none focus:border-[#3B82F6]"
                >
                  {RISK_DIMENSIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#64748B]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 border-t border-[#1E293B] pt-3">
          <p className="mb-2 px-2 text-[0.625rem] font-semibold tracking-[0.1em] text-[#CBD5E1] uppercase">
            Dataset overlays
          </p>
          {MAP_OVERLAY_GROUPS.map((group) => (
            <div key={group.id} className="mb-2">
              <p className="px-2 pb-1 text-[0.625rem] font-semibold tracking-[0.08em] text-[#475569] uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = selectedOverlays.has(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onToggleOverlay(item.id)}
                        aria-pressed={active}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                          active
                            ? 'bg-[#1E293B]/80 text-[#F8FAFC]'
                            : 'text-[#CBD5E1] hover:bg-[#1E293B]/45',
                        )}
                      >
                        <LayerCheckbox checked={active} />
                        <span className="text-[0.8125rem] font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
