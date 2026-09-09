import { MessageSquare, X, Info } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../ui/utils';
import {
  formatAidMoney,
  formatCompactCount,
  RISK_BAND_COLORS,
  type MapRegionIntelligence,
} from '../../data/mapLayersMock';

type MapRegionDetailPanelProps = {
  region: MapRegionIntelligence;
  onClose: () => void;
  onAskAboutRegion: (region: MapRegionIntelligence) => void;
  className?: string;
};

export function MapRegionDetailPanel({
  region,
  onClose,
  onAskAboutRegion,
  className,
}: MapRegionDetailPanelProps) {
  const bandColor = RISK_BAND_COLORS[region.riskBand];
  const radarData = [
    { axis: 'Security', value: region.dimensions.security },
    { axis: 'Political', value: region.dimensions.political },
    { axis: 'Economic', value: region.dimensions.economic },
    { axis: 'Environmental', value: region.dimensions.environmental },
    { axis: 'Operational', value: region.dimensions.operational },
    { axis: 'Access', value: region.dimensions.access },
    { axis: 'Humanitarian', value: region.dimensions.humanitarian },
  ];

  const trendLabel =
    region.trend7d === 0
      ? '0'
      : region.trend7d > 0
        ? `+${region.trend7d.toFixed(1)}`
        : region.trend7d.toFixed(1);

  return (
    <aside
      className={cn(
        'pointer-events-auto flex max-h-[min(78vh,720px)] w-[min(100%,380px)] flex-col overflow-hidden rounded-2xl border border-[#334155] bg-[#0F172A]/96 shadow-2xl shadow-black/50 backdrop-blur-md animate-slide-in-right',
        className,
      )}
      role="dialog"
      aria-label={`${region.name} region details`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#1E293B] px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[1.125rem] font-semibold tracking-tight text-white">
              {region.name}
            </p>
            <span
              className="rounded-md px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-white"
              style={{ background: bandColor }}
            >
              {region.riskBand}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.8125rem] text-[#94A3B8]">
            <span>
              Score{' '}
              <span className="font-semibold text-[#E2E8F0]">
                {region.riskScore.toFixed(1)} / {region.riskMax}
              </span>
            </span>
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium',
                region.trend7d < 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : region.trend7d > 0
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-slate-500/15 text-slate-400',
              )}
            >
              7d {trendLabel}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close region details"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#E2E8F0]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
        {region.escalated14d && region.escalationCopy && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[0.75rem] leading-relaxed text-red-200">
            {region.escalationCopy}
          </div>
        )}

        <div>
          <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
            Risk categories
          </p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                />
                <Radar
                  name="Risk"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.28}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-[0.8125rem] leading-relaxed text-[#CBD5E1]">
          {region.narrative}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Arrivals" value={formatCompactCount(region.arrivals)} />
          <StatTile label="Departures" value={formatCompactCount(region.departures)} />
          <StatTile
            label="Aid tracked"
            value={formatAidMoney(region.aidTrackedM)}
            hint={`${region.aidSharePct}% of total · ${region.aidPeriod}`}
          />
          <StatTile label="Drought" value={region.drought} />
        </div>
      </div>

      <div className="border-t border-[#1E293B] p-3">
        <button
          type="button"
          onClick={() => onAskAboutRegion(region)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-[0.875rem] font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          <MessageSquare size={16} />
          Ask about this region
        </button>
      </div>
    </aside>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#020617]/50 px-3 py-2.5">
      <div className="flex items-center gap-1 text-[0.625rem] font-semibold tracking-[0.08em] text-[#64748B] uppercase">
        {label}
        {hint && (
          <span title={hint} className="text-[#475569]">
            <Info size={10} />
          </span>
        )}
      </div>
      <div className="mt-1 text-[1.0625rem] font-semibold text-[#F8FAFC]">{value}</div>
      {hint && (
        <div className="mt-0.5 text-[0.625rem] leading-snug text-[#64748B]">{hint}</div>
      )}
    </div>
  );
}
