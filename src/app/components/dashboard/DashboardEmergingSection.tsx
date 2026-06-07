import type { KeyboardEvent } from 'react';
import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import {
  buildEmergingRiskChatPayload,
  buildRiskTrendChatPayload,
  dashboardCardClass,
} from '../../utils/dashboardChatContext';
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DASHBOARD_EMERGING_RISKS,
  DASHBOARD_RISK_TREND,
  type DashboardRiskTrendRange,
} from '../../data/dashboardMock';
import { RisksByStatusCard } from './RisksByStatusCard';

const TREND_RANGE_META: Record<
  DashboardRiskTrendRange,
  { tabLabel: string; title: string; subtitle: string }
> = {
  week: {
    tabLabel: '7 days',
    title: 'Risk trend',
    subtitle: 'This week · Mon to Sun',
  },
  month: {
    tabLabel: 'Month',
    title: 'Risk trend',
    subtitle: 'May · Wk 1 to Wk 4',
  },
  year: {
    tabLabel: 'Year',
    title: 'Risk trend',
    subtitle: '2026 · Jan to May',
  },
};

function niceTrendYAxis(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padding = Math.max(6, Math.round(span * 0.1));
  const rawMin = Math.max(0, min - padding);
  const rawMax = max + padding;
  const magnitude = 10 ** Math.floor(Math.log10(rawMax - rawMin || 1));
  const step = Math.max(magnitude / 2, Math.ceil((rawMax - rawMin) / 4 / magnitude) * magnitude);
  const floor = Math.floor(rawMin / step) * step;
  const ceil = Math.ceil(rawMax / step) * step;
  const ticks: number[] = [];
  for (let t = floor; t <= ceil; t += step) ticks.push(t);
  return { domain: [floor, ceil] as [number, number], ticks };
}

function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      className="flex items-center bg-muted border border-border rounded-lg p-0.5 shrink-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(option.id);
          }}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            value === option.id
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

function activateOnKeyDown(e: KeyboardEvent, onActivate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onActivate();
  }
}

export function EmergingRiskCard({
  risk,
  onOpenChat,
}: {
  risk: (typeof DASHBOARD_EMERGING_RISKS)[number];
  onOpenChat: (payload: DashboardChatPayload) => void;
}) {
  const open = () => onOpenChat(buildEmergingRiskChatPayload(risk));
  const customBackground = 'background' in risk ? risk.background : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => activateOnKeyDown(e, open)}
      style={customBackground ? { background: customBackground } : undefined}
      className={`relative flex flex-col rounded-2xl border ${risk.borderClass} ${
        customBackground ? '' : `bg-gradient-to-br ${risk.gradientClass}`
      } p-5 sm:p-6 text-white overflow-hidden min-h-[220px] text-left group ${dashboardCardClass.gradient}`}
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-card/10 blur-2xl pointer-events-none"
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-white/90 relative">
        {risk.rank} · {risk.level}
      </p>
      <h3 className="text-base sm:text-sm font-semibold leading-snug mt-3 relative">{risk.title}</h3>
      <p className="text-sm leading-relaxed text-white/90 mt-2 flex-1 relative">{risk.description}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-white/20 text-xs text-white/85 relative">
        {risk.footer.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
      <ChevronRight
        size={18}
        className="absolute bottom-5 right-5 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
    </div>
  );
}

function RiskTrendCard({ onOpenChat }: { onOpenChat: (payload: DashboardChatPayload) => void }) {
  const [range, setRange] = useState<DashboardRiskTrendRange>('month');

  const trendData = useMemo(() => [...DASHBOARD_RISK_TREND[range]], [range]);

  const rangeMeta = TREND_RANGE_META[range];

  const yAxis = useMemo(
    () =>
      niceTrendYAxis(
        trendData.flatMap((row) => [row.active, row.critical, row.mitigated]),
      ),
    [trendData],
  );

  const lastTrendIndex = trendData.length - 1;

  const renderActiveDot = (props: {
    cx?: number;
    cy?: number;
    index?: number;
    payload?: { label: string; active: number };
  }) => {
    const { cx, cy, index, payload } = props;
    if (index !== lastTrendIndex || cx == null || cy == null || !payload) {
      return <g />;
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="var(--primary)" stroke="var(--card)" strokeWidth={2} />
        <foreignObject x={cx - 52} y={cy - 36} width={104} height={28}>
          <div className="flex justify-center h-full items-center">
            <span className="inline-block text-xs font-semibold text-foreground bg-card border border-border rounded-md px-2 py-0.5 shadow-sm whitespace-nowrap">
              {payload.active} active
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  const open = () => onOpenChat(buildRiskTrendChatPayload());

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => activateOnKeyDown(e, open)}
      className={`bg-card rounded-2xl border border-border p-5 sm:p-6 text-left ${dashboardCardClass.white}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{rangeMeta.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{rangeMeta.subtitle}</p>
        </div>
        <SegmentToggle
          options={(['week', 'month', 'year'] as const).map((id) => ({
            id,
            label: TREND_RANGE_META[id].tabLabel,
          }))}
          value={range}
          onChange={setRange}
        />
      </div>

      <div className="h-[240px] w-full pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 28, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboardActiveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.12} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--secondary)" vertical={false} />
            <Area
              type="monotone"
              dataKey="active"
              stroke="none"
              fill="url(#dashboardActiveFill)"
              dot={false}
              activeDot={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-subtle)', fontSize: 11 }}
              interval={0}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-subtle)', fontSize: 11 }}
              ticks={yAxis.ticks}
              domain={yAxis.domain}
              allowDecimals={false}
              width={44}
            />
            <Line
              type="monotone"
              dataKey="active"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={renderActiveDot}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="critical"
              stroke="var(--destructive-text)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="mitigated"
              stroke="var(--success)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.5 bg-primary rounded-full" aria-hidden />
          <span className="text-xs text-muted-foreground">Active risks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-0.5 bg-destructive rounded-full" aria-hidden />
          <span className="text-xs text-muted-foreground">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 border-t-2 border-dashed border-success" aria-hidden />
          <span className="text-xs text-muted-foreground">Mitigated cumulative</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardEmergingSection({
  onOpenChat,
}: {
  onOpenChat: (payload: DashboardChatPayload) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Top Emerging Risks</h2>
        <p className="text-sm sm:text-sm text-muted-foreground">
          Detected by RiskIQ across all registers in the last 7 days
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DASHBOARD_EMERGING_RISKS.map((risk) => (
          <EmergingRiskCard key={risk.id} risk={risk} onOpenChat={onOpenChat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskTrendCard onOpenChat={onOpenChat} />
        <RisksByStatusCard onOpenChat={onOpenChat} />
      </div>
    </div>
  );
}
