import type { ReportChartDatum, ReportChartType } from '../../data/reportsAdminMock';
import { cn } from '../ui/utils';

function formatBarWidth(value: number, max: number): string {
  if (max <= 0) return '8%';
  return `${Math.max(8, Math.round((value / max) * 100))}%`;
}

export function ChartFilledGraphic({
  chartType,
  data,
  className,
  palette,
  muted,
  accent,
}: {
  chartType: ReportChartType;
  data: ReportChartDatum[];
  className?: string;
  palette: string[];
  muted: string;
  accent: string;
}) {
  const primary = palette[0] ?? accent;
  const secondary = palette[1] ?? primary;
  const tertiary = palette[2] ?? secondary;
  const max = Math.max(...data.map((d) => d.value), 1);

  if (chartType === 'single_stat') {
    const item = data[0];
    return (
      <div className={cn('flex flex-col items-center justify-center gap-1 py-6', className)}>
        <p className="text-3xl font-semibold tracking-tight" style={{ color: accent }}>
          {item?.displayValue ?? item?.label ?? '—'}
        </p>
        <p className="text-xs font-medium" style={{ color: muted }}>
          {item?.label ?? 'Key metric'}
        </p>
      </div>
    );
  }

  if (chartType === 'donut_split') {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    let angle = 0;
    const stops = data.map((d, i) => {
      const start = angle;
      angle += (d.value / total) * 360;
      return `${palette[i % palette.length] ?? primary} ${start}deg ${angle}deg`;
    });
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3 py-3', className)}>
        <div
          className="size-24 rounded-full"
          style={{
            background: `conic-gradient(${stops.join(', ')})`,
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px))',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 14px), #000 calc(100% - 14px))',
          }}
        />
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-2">
          {data.map((d, i) => (
            <span key={d.label} className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: muted }}>
              <span
                className="size-2 rounded-sm"
                style={{ backgroundColor: palette[i % palette.length] ?? primary }}
              />
              {d.label}
              {d.displayValue ? ` · ${d.displayValue}` : ''}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (chartType === 'treemap') {
    const colors = [primary, secondary, tertiary, palette[3] ?? muted];
    return (
      <div className={cn('grid h-32 grid-cols-3 grid-rows-2 gap-1.5 p-3', className)}>
        {data.slice(0, 4).map((d, i) => (
          <div
            key={d.label}
            className={cn(
              'rounded-md p-2 flex flex-col justify-end',
              i === 0 ? 'col-span-2 row-span-2' : '',
            )}
            style={{ backgroundColor: colors[i] ?? muted }}
          >
            <p className="text-[10px] font-semibold text-white/90 truncate">{d.label}</p>
            <p className="text-xs font-bold text-white">
              {d.displayValue ?? d.value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (chartType === 'trend_line') {
    const w = 200;
    const h = 80;
    const pts = data.map((d, i) => {
      const x = data.length <= 1 ? w / 2 : (i / (data.length - 1)) * w;
      const y = h - 8 - (d.value / max) * (h - 16);
      return `${x},${y}`;
    });
    const line = pts.join(' ');
    const area = `0,${h} ${line} ${w},${h}`;
    return (
      <div className={cn('flex items-center justify-center px-4 py-3 h-28', className)}>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" aria-hidden>
          <polyline points={area} fill={`${primary}22`} stroke="none" />
          <polyline
            points={line}
            fill="none"
            stroke={primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (chartType === 'stat_bar') {
    return (
      <div className={cn('flex flex-col gap-2.5 p-4', className)}>
        <p className="text-2xl font-semibold tracking-tight" style={{ color: accent }}>
          {data[0]?.displayValue ?? '—'}
        </p>
        {data.map((d, i) => (
          <div key={d.label} className="space-y-1">
            <div className="flex justify-between text-[10px]" style={{ color: muted }}>
              <span>{d.label}</span>
              <span>{d.displayValue ?? d.value}</span>
            </div>
            <div
              className="h-2.5 rounded-sm"
              style={{
                width: formatBarWidth(d.value, max),
                backgroundColor: palette[i % palette.length] ?? primary,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // ranked_bars + auto
  return (
    <div className={cn('flex flex-col gap-2 p-4', className)}>
      {data.map((d, i) => (
        <div key={d.label} className="space-y-1">
          <div className="flex justify-between text-[10px] font-medium" style={{ color: muted }}>
            <span className="truncate pr-2">{d.label}</span>
            <span className="shrink-0">{d.displayValue ?? d.value}</span>
          </div>
          <div
            className="h-2.5 rounded-sm"
            style={{
              width: formatBarWidth(d.value, max),
              backgroundColor: palette[i % palette.length] ?? primary,
            }}
          />
        </div>
      ))}
    </div>
  );
}
