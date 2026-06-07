import type { KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import { buildRiskStatusChatPayload, dashboardCardClass } from '../../utils/dashboardChatContext';
import { DASHBOARD_BRIEFING, DASHBOARD_RISK_STATUS } from '../../data/dashboardMock';

function activateOnKeyDown(e: KeyboardEvent, onActivate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onActivate();
  }
}

export function RisksByStatusCard({
  onOpenChat,
}: {
  onOpenChat: (payload: DashboardChatPayload) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const chartBlockRef = useRef<HTMLDivElement>(null);

  const statusData = useMemo(
    () =>
      DASHBOARD_RISK_STATUS.map((item) => ({
        id: item.id,
        name: item.label,
        value: isInView ? item.count : 0,
        color: item.color,
      })),
    [isInView]
  );

  const hoveredIndex = hoveredId
    ? DASHBOARD_RISK_STATUS.findIndex((item) => item.id === hoveredId)
    : -1;
  const activeIndex = hoveredIndex >= 0 ? hoveredIndex : undefined;

  const hoveredItem = hoveredId
    ? DASHBOARD_RISK_STATUS.find((item) => item.id === hoveredId)
    : null;

  const open = () => onOpenChat(buildRiskStatusChatPayload());

  useEffect(() => {
    const el = chartBlockRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const target = DASHBOARD_BRIEFING.activeRisksTotal;
    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setAnimatedTotal(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView]);

  const renderActiveShape = (props: {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    fill?: string;
  }) => {
    const { cx = 0, cy = 0, innerRadius = 52, outerRadius = 76, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="var(--card)"
        strokeWidth={2}
      />
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => activateOnKeyDown(e, open)}
      className={`bg-card rounded-2xl border border-border p-5 sm:p-6 text-left ${dashboardCardClass.white}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Risks by Status</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Where they sit in the workflow</p>
      </div>

      <div
        ref={chartBlockRef}
        className="flex flex-col sm:flex-row items-center gap-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          {hoveredItem && (
            <div
              className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-white shadow-md whitespace-nowrap pointer-events-none"
              role="tooltip"
            >
              {hoveredItem.label} · {hoveredItem.count} ({hoveredItem.percent}%)
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={1}
                isAnimationActive={isInView}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => {
                  const item = DASHBOARD_RISK_STATUS[index];
                  if (item) setHoveredId(item.id);
                }}
                onMouseLeave={() => setHoveredId(null)}
              >
                {statusData.map((entry) => {
                  const isHovered = hoveredId === entry.id;
                  const isDimmed = hoveredId != null && !isHovered;
                  return (
                    <Cell
                      key={entry.id}
                      fill={entry.color}
                      opacity={isDimmed ? 0.4 : 1}
                      style={{ cursor: 'pointer', transition: 'opacity 150ms ease' }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground leading-none tabular-nums">
              {animatedTotal}
            </span>
            <span className="text-xs font-semibold text-text-subtle uppercase tracking-wider mt-0.5">
              Risks
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-1">
          {DASHBOARD_RISK_STATUS.map((item) => {
            const isHovered = hoveredId === item.id;
            const isDimmed = hoveredId != null && !isHovered;
            return (
              <div
                key={item.id}
                role="presentation"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 cursor-default transition-all duration-150 ${
                  isHovered ? 'bg-primary-subtle ring-1 ring-ring' : isDimmed ? 'opacity-45' : 'hover:bg-muted'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-150 ${
                    isHovered ? 'scale-125' : ''
                  }`}
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span
                  className={`text-sm flex-1 min-w-0 transition-colors ${
                    isHovered ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-sm text-text-subtle w-10 text-right shrink-0">{item.percent}%</span>
                <span className="text-sm font-bold text-foreground w-8 text-right shrink-0 tabular-nums">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
