import type { ReportChartType } from '../../data/reportsAdminMock';
import { cn } from '../ui/utils';

function SkeletonBar({
  width,
  fill,
}: {
  width: string;
  fill: string;
}) {
  return (
    <div
      className="h-3 rounded-sm"
      style={{
        width,
        background: `repeating-linear-gradient(135deg,${fill} 0,${fill} 1px,transparent 1px,transparent 6px)`,
      }}
    />
  );
}

function TrendLineSkeleton({ stroke, fill }: { stroke: string; fill: string }) {
  return (
    <div className="flex items-center justify-center px-4 py-3 h-28">
      <svg viewBox="0 0 200 80" className="w-full h-full" aria-hidden>
        <path
          d="M0 60 L30 45 L60 52 L90 28 L120 38 L150 18 L180 32 L200 12"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 60 L30 45 L60 52 L90 28 L120 38 L150 18 L180 32 L200 12 L200 80 L0 80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

function DonutSkeleton({ ring, segment }: { ring: string; segment: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative size-20">
        <div
          className="absolute inset-0 rounded-full border-[10px]"
          style={{ borderColor: ring }}
        />
        <div
          className="absolute inset-0 rounded-full border-[10px] border-transparent"
          style={{ borderTopColor: segment, borderRightColor: segment, transform: 'rotate(-30deg)' }}
        />
      </div>
    </div>
  );
}

export function ChartSkeletonGraphic({
  chartType,
  className,
  palette,
  muted,
}: {
  chartType: ReportChartType;
  className?: string;
  palette: string[];
  muted: string;
}) {
  const primary = palette[0] ?? '#94a3b8';
  const secondary = palette[1] ?? primary;
  const tertiary = palette[2] ?? secondary;
  const hatchFill = muted;

  if (chartType === 'single_stat') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2 py-6', className)}>
        <div className="h-12 w-28 rounded-lg opacity-80" style={{ backgroundColor: primary }} />
        <div className="h-2.5 w-20 rounded-sm opacity-50" style={{ backgroundColor: muted }} />
      </div>
    );
  }

  if (chartType === 'donut_split') {
    return (
      <div className={className}>
        <DonutSkeleton ring={muted} segment={primary} />
      </div>
    );
  }

  if (chartType === 'treemap') {
    return (
      <div className={cn('grid h-28 grid-cols-3 gap-1.5 p-3', className)}>
        <div className="col-span-2 row-span-2 rounded-md opacity-90" style={{ backgroundColor: primary }} />
        <div className="rounded-md opacity-80" style={{ backgroundColor: secondary }} />
        <div className="rounded-md opacity-70" style={{ backgroundColor: tertiary }} />
      </div>
    );
  }

  if (chartType === 'trend_line') {
    return (
      <div className={className}>
        <TrendLineSkeleton stroke={primary} fill={`${primary}22`} />
      </div>
    );
  }

  if (chartType === 'stat_bar') {
    return (
      <div className={cn('flex flex-col gap-3 p-4', className)}>
        <div className="h-9 w-24 rounded-md opacity-90" style={{ backgroundColor: primary }} />
        <SkeletonBar width="92%" fill={hatchFill} />
        <SkeletonBar width="72%" fill={hatchFill} />
        <SkeletonBar width="48%" fill={secondary} />
      </div>
    );
  }

  if (chartType === 'auto') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2 p-4 py-6', className)}>
        <div
          className="h-16 w-full rounded-lg border border-dashed opacity-60"
          style={{ borderColor: muted }}
        />
        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: muted }}>
          Auto · picks on generate
        </p>
      </div>
    );
  }

  // ranked_bars — varying palette colors per bar
  const barWidths = ['95%', '78%', '62%', '48%'];
  return (
    <div className={cn('flex flex-col gap-2.5 p-4', className)}>
      {barWidths.map((width, i) => (
        <div
          key={width}
          className="h-3 rounded-sm opacity-90"
          style={{
            width,
            background:
              i < 2
                ? palette[i] ?? primary
                : `repeating-linear-gradient(135deg,${hatchFill} 0,${hatchFill} 1px,transparent 1px,transparent 6px)`,
          }}
        />
      ))}
    </div>
  );
}
