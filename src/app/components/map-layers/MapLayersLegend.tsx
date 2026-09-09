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

type LegendItem = {
  id: string;
  label: string;
  swatch: LegendSwatch;
};

type LegendSection = {
  id: string;
  title: string;
  items: LegendItem[];
};

function fillRamp(layer: MapDataLayerId): string[] {
  return [0.15, 0.4, 0.7, 1].map((t) => getFillColor(layer, t));
}

function buildLegendSections(
  selectedLayers: Set<MapDataLayerId>,
  selectedOverlays: Set<MapOverlayId>,
  fillLayer: MapDataLayerId | null,
): LegendSection[] {
  const sections: LegendSection[] = [];

  if (fillLayer) {
    const meta = MAP_DATA_LAYERS.find((l) => l.id === fillLayer);
    const labels: Record<MapDataLayerId, [string, string]> = {
      risk: ['Lower', 'Higher'],
      aid: ['Lower', 'Higher'],
      drought: ['Mild', 'Extreme'],
      floods: ['Lower', 'Higher'],
      displacement: ['Lower', 'Higher'],
      alerts: ['Lower', 'Higher'],
    };
    const [low, high] = labels[fillLayer];
    sections.push({
      id: `fill-${fillLayer}`,
      title: `${meta?.label ?? 'Fill'} intensity`,
      items: [
        {
          id: 'ramp',
          label: `${low} → ${high}`,
          swatch: { kind: 'ramp', colors: fillRamp(fillLayer) },
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

  if (selectedLayers.has('drought') && fillLayer !== 'drought') {
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
        className="h-2.5 w-full min-w-[72px] rounded-full"
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
  className?: string;
};

export function MapLayersLegend({
  selectedLayers,
  selectedOverlays,
  fillLayer,
  className,
}: MapLayersLegendProps) {
  const sections = buildLegendSections(selectedLayers, selectedOverlays, fillLayer);
  if (sections.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none max-w-[220px] rounded-xl border border-[#1E293B]/90 bg-[#0F172A]/92 px-3 py-2.5 shadow-lg backdrop-blur-md',
        className,
      )}
      aria-label="Map legend"
    >
      <p className="mb-2 text-[0.625rem] font-semibold tracking-[0.08em] text-[#64748B] uppercase">
        Legend
      </p>
      <div className="space-y-2.5">
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
    </div>
  );
}
