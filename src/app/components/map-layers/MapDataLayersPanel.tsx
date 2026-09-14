import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronsDown } from 'lucide-react';
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
  onCollapse?: () => void;
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
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setCanScrollUp(scrollTop > 2);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [selectedLayers, selectedOverlays, riskOn]);

  return (
    <aside
      className={cn(
        'pointer-events-auto flex w-[220px] max-h-full flex-col overflow-hidden rounded-xl border border-[#1E293B]/90 bg-[#0F172A]/92 shadow-lg backdrop-blur-md',
        className,
      )}
      aria-label="Data layers"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-[#1E293B] px-3 py-2 pr-9">
        <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-white uppercase">
          Data layers
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        {canScrollUp && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-5 bg-gradient-to-b from-[#0F172A] to-transparent"
            aria-hidden
          />
        )}

        <div
          ref={scrollRef}
          className="map-legend-scroll h-full max-h-[min(38vh,320px)] overflow-y-auto overscroll-contain px-1.5 py-1.5"
        >
          <ul className="space-y-0" role="list">
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
                      'flex h-auto min-h-0 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors',
                      active
                        ? 'bg-[#1E293B]/80 text-[#F8FAFC]'
                        : 'text-[#CBD5E1] hover:bg-[#1E293B]/45',
                    )}
                  >
                    <LayerCheckbox checked={active} />
                    <span className="flex-1 text-[0.8125rem] font-medium leading-snug">
                      {layer.label}
                    </span>
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
            <div className="mt-1.5 space-y-1.5 border-t border-[#1E293B] px-1.5 pt-2 pb-0.5">
              <div>
                <p className="mb-1 block text-[0.6875rem] font-medium text-white">
                  Type of risk
                </p>
                <div className="relative">
                  <select
                    value={riskDimension}
                    onChange={(e) =>
                      onRiskDimensionChange(e.target.value as RiskDimension)
                    }
                    className="visualization-control w-full appearance-none rounded-lg border border-[#334155] bg-[#0B1220] py-1.5 pr-8 pl-2.5 text-[0.75rem] text-white outline-none focus:border-[#3B82F6] [color-scheme:dark]"
                    style={{ color: '#FFFFFF' }}
                  >
                    {RISK_DIMENSIONS.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#0B1220] text-white">
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#94A3B8]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-1.5 border-t border-[#1E293B] pt-1.5">
            <p className="mb-1 px-2 text-[0.625rem] font-semibold tracking-[0.1em] text-[#CBD5E1] uppercase">
              Dataset overlays
            </p>
            {MAP_OVERLAY_GROUPS.map((group) => (
              <div key={group.id} className="mb-1">
                <p className="px-2 pb-0.5 text-[0.625rem] font-semibold tracking-[0.08em] text-[#64748B] uppercase">
                  {group.label}
                </p>
                <ul className="space-y-0">
                  {group.items.map((item) => {
                    const active = selectedOverlays.has(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onToggleOverlay(item.id)}
                          aria-pressed={active}
                          className={cn(
                            'flex h-auto min-h-0 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors',
                            active
                              ? 'bg-[#1E293B]/80 text-[#F8FAFC]'
                              : 'text-[#CBD5E1] hover:bg-[#1E293B]/45',
                          )}
                        >
                          <LayerCheckbox checked={active} />
                          <span className="text-[0.8125rem] font-medium leading-snug">
                            {item.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {canScrollDown && (
          <button
            type="button"
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              el.scrollBy({ top: Math.max(72, el.clientHeight * 0.65), behavior: 'smooth' });
            }}
            className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center border-0 bg-transparent p-0"
            aria-label="Scroll data layers for more items"
          >
            <div
              className="pointer-events-none h-8 w-full bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent"
              aria-hidden
            />
            <span className="absolute bottom-1 inline-flex items-center gap-1 rounded-full bg-[#1E293B] px-2 py-0.5 text-[0.5625rem] font-medium text-[#E2E8F0] shadow-sm transition-colors hover:bg-[#334155] hover:text-white">
              <ChevronsDown size={10} strokeWidth={2.5} />
              More
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
