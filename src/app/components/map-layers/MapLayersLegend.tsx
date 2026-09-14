import { useEffect, useRef, useState } from 'react';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import { cn } from '../ui/utils';
import {
  ALERT_SEVERITY_COLORS,
  getFillColor,
  MAP_DATA_LAYERS,
  type MapDataLayerId,
  type MapOverlayId,
} from '../../data/mapLayersMock';

type LegendSwatch =
  | { kind: 'ramp'; colors: string[] }
  | { kind: 'circle'; color: string; size?: 'sm' | 'md' | 'lg' }
  | { kind: 'line'; color: string }
  | { kind: 'square'; color: string; opacity?: number };

export type MapLegendItem = {
  id: string;
  label: string;
  swatch: LegendSwatch;
};

export type MapLegendSection = {
  id: string;
  title: string;
  items: MapLegendItem[];
};

type LegendItem = MapLegendItem;
type LegendSection = MapLegendSection;

function fillRamp(layer: MapDataLayerId): string[] {
  return [0.15, 0.4, 0.7, 1].map((t) => getFillColor(layer, t));
}

function buildLegendSections(
  selectedLayers: Set<MapDataLayerId>,
  selectedOverlays: Set<MapOverlayId>,
  fillLayer: MapDataLayerId | null,
): LegendSection[] {
  const sections: LegendSection[] = [];
  const fillLabels: Record<MapDataLayerId, [string, string]> = {
    risk: ['Lower', 'Higher'],
    aid: ['Lower', 'Higher'],
    drought: ['Mild', 'Extreme'],
    floods: ['Lower', 'Higher'],
    displacement: ['Lower', 'Higher'],
    alerts: ['Lower', 'Higher'],
  };

  const fillCapable: MapDataLayerId[] = ['risk', 'aid', 'drought', 'floods'];

  // Show a ramp for every selected fill-capable layer (active FILL first)
  const fillOrder = fillLayer
    ? [fillLayer, ...fillCapable.filter((id) => id !== fillLayer && selectedLayers.has(id))]
    : fillCapable.filter((id) => selectedLayers.has(id));

  for (const layerId of fillOrder) {
    if (!selectedLayers.has(layerId)) continue;
    const meta = MAP_DATA_LAYERS.find((l) => l.id === layerId);
    const [low, high] = fillLabels[layerId];
    const isActiveFill = fillLayer === layerId;
    sections.push({
      id: `fill-${layerId}`,
      title: isActiveFill
        ? `${meta?.label ?? layerId} intensity`
        : `${meta?.label ?? layerId} scale`,
      items: [
        {
          id: `ramp-${layerId}`,
          label: `${low} → ${high}`,
          swatch: { kind: 'ramp', colors: fillRamp(layerId) },
        },
      ],
    });
  }

  if (selectedLayers.has('displacement')) {
    sections.push({
      id: 'displacement',
      title: 'Displacement',
      items: [
        {
          id: 'disp-small',
          label: 'Fewer people',
          swatch: { kind: 'circle', color: '#2DD4BF', size: 'sm' },
        },
        {
          id: 'disp-large',
          label: 'More people',
          swatch: { kind: 'circle', color: '#2DD4BF', size: 'lg' },
        },
      ],
    });
  }

  if (selectedLayers.has('alerts')) {
    sections.push({
      id: 'alerts',
      title: 'Alerts',
      items: [
        {
          id: 'critical',
          label: 'Critical',
          swatch: { kind: 'circle', color: ALERT_SEVERITY_COLORS.critical },
        },
        {
          id: 'high',
          label: 'High',
          swatch: { kind: 'circle', color: ALERT_SEVERITY_COLORS.high },
        },
        {
          id: 'moderate',
          label: 'Moderate',
          swatch: { kind: 'circle', color: ALERT_SEVERITY_COLORS.moderate },
        },
        {
          id: 'watch',
          label: 'Watch',
          swatch: { kind: 'circle', color: ALERT_SEVERITY_COLORS.watch },
        },
      ],
    });
  }

  if (selectedLayers.has('drought')) {
    sections.push({
      id: 'drought-labels',
      title: 'Drought labels',
      items: [
        {
          id: 'd-label',
          label: 'D Mild → D Extreme',
          swatch: { kind: 'square', color: '#FDBA74' },
        },
      ],
    });
  }

  const overlayItems: LegendItem[] = [];
  if (selectedOverlays.has('sea-ports')) {
    overlayItems.push({
      id: 'ports',
      label: 'Sea ports',
      swatch: { kind: 'circle', color: '#F8FAFC', size: 'sm' },
    });
  }
  if (selectedOverlays.has('roads')) {
    overlayItems.push({
      id: 'roads',
      label: 'Roads',
      swatch: { kind: 'line', color: '#94A3B8' },
    });
  }
  if (selectedOverlays.has('detected-waters')) {
    overlayItems.push({
      id: 'waters',
      label: 'Detected waters',
      swatch: { kind: 'square', color: '#38BDF8', opacity: 0.45 },
    });
  }
  if (overlayItems.length > 0) {
    sections.push({
      id: 'overlays',
      title: 'Overlays',
      items: overlayItems,
    });
  }

  return sections;
}

function Swatch({ swatch }: { swatch: LegendSwatch }) {
  if (swatch.kind === 'ramp') {
    return (
      <div
        className="h-2.5 w-full min-w-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${swatch.colors.join(', ')})`,
        }}
      />
    );
  }
  if (swatch.kind === 'line') {
    return (
      <div
        className="h-0.5 w-4 shrink-0 rounded-full"
        style={{ background: swatch.color }}
      />
    );
  }
  if (swatch.kind === 'square') {
    return (
      <div
        className="size-3 shrink-0 rounded-sm"
        style={{
          background: swatch.color,
          opacity: swatch.opacity ?? 1,
        }}
      />
    );
  }
  const size =
    swatch.size === 'lg' ? 'size-3.5' : swatch.size === 'sm' ? 'size-2' : 'size-2.5';
  return (
    <div
      className={cn('shrink-0 rounded-full', size)}
      style={{
        background: swatch.color,
        boxShadow:
          swatch.color === '#F8FAFC' ? '0 0 0 1.5px #3B82F6' : undefined,
      }}
    />
  );
}

type MapLayersLegendProps = {
  selectedLayers: Set<MapDataLayerId>;
  selectedOverlays: Set<MapOverlayId>;
  fillLayer: MapDataLayerId | null;
  /** Extra sections from an active prompt/flow visualization */
  promptSections?: MapLegendSection[];
  className?: string;
};

export function MapLayersLegend({
  selectedLayers,
  selectedOverlays,
  fillLayer,
  promptSections = [],
  className,
}: MapLayersLegendProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const layerSections = buildLegendSections(selectedLayers, selectedOverlays, fillLayer);
  // Prompt-specific legend first when prompting, then selected data-layer keys
  const sections = [...promptSections, ...layerSections];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || collapsed) return;

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
  }, [collapsed, sections.length, selectedLayers, selectedOverlays, fillLayer, promptSections]);

  if (sections.length === 0) return null;

  const sectionCount = sections.length;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className={cn(
          'pointer-events-auto flex w-[220px] items-center justify-between gap-2 rounded-xl border border-[#1E293B]/90 bg-[#0F172A]/92 px-3 py-2 shadow-lg backdrop-blur-md transition-colors hover:border-[#334155]',
          className,
        )}
        aria-expanded={false}
        aria-label="Expand map legend"
      >
        <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-white uppercase">
          Legend
        </span>
        <span className="flex items-center gap-1.5">
          <span className="rounded-md bg-[#1E293B] px-1.5 py-0.5 text-[0.625rem] text-[#94A3B8]">
            {sectionCount}
          </span>
          <ChevronsDown size={14} className="text-[#94A3B8]" strokeWidth={2} />
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-[220px] flex-col overflow-hidden rounded-xl border border-[#1E293B]/90 bg-[#0F172A]/92 shadow-lg backdrop-blur-md',
        className,
      )}
      aria-label="Map legend"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#1E293B] px-3 py-2">
        <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-white uppercase">
          Legend
        </p>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse map legend"
          title="Collapse"
          className="flex size-7 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#1E293B] hover:text-[#E2E8F0]"
        >
          <ChevronsUp size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="relative min-h-0">
        {canScrollUp && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-5 bg-gradient-to-b from-[#0F172A] to-transparent"
            aria-hidden
          />
        )}

        <div
          ref={scrollRef}
          className="map-legend-scroll max-h-[min(28vh,220px)] space-y-2.5 overflow-y-auto overscroll-contain px-3 py-2.5"
        >
          {sections.map((section) => (
            <div key={section.id}>
              <p className="mb-1 text-[0.6875rem] font-medium text-[#94A3B8]">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-center gap-2',
                      item.swatch.kind === 'ramp' && 'flex-col items-stretch gap-1',
                    )}
                  >
                    <Swatch swatch={item.swatch} />
                    <span className="text-[0.6875rem] text-[#CBD5E1]">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
            aria-label="Scroll legend for more items"
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
    </div>
  );
}
