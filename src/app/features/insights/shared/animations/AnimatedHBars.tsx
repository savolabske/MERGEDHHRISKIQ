import React, { useMemo } from 'react';
import { useAnimateOnView } from './useAnimateOnView';
import { useCountUp } from './useCountUp';
import { usePrefersReducedMotion } from './motionPrefs';

export type BarRow = [label: string, value: number, color?: string];

const BAR_STAGGER_MS = 60;

interface AnimatedHBarsProps {
  rows: BarRow[];
  formatter: (value: number) => string;
  color?: string;
  emptyMessage?: string;
  emptyClassName?: string;
  labelClassName?: string;
  trackClassName?: string;
  valueClassName?: string;
}

function BarValue({
  value,
  formatter,
  active,
}: {
  value: number;
  formatter: (v: number) => string;
  active: boolean;
}) {
  const display = useCountUp(value, active, formatter);
  return <>{display}</>;
}

export function AnimatedHBars({
  rows,
  formatter,
  color = '#1f6feb',
  emptyMessage = 'No data for selected filters.',
  emptyClassName = 'rounded-lg border border-dashed border-[#d7dee8] p-4 text-[12px] text-[#6b7a8d]',
  labelClassName = 'w-[126px] text-right text-[12px] font-medium text-[#3a4a5c]',
  trackClassName = 'h-[22px] flex-1 overflow-hidden rounded-md bg-[#eef1f6]',
  valueClassName = 'w-[66px] text-[12px] font-semibold text-[#0d1b2a]',
}: AnimatedHBarsProps) {
  const { ref, inView } = useAnimateOnView();
  const max = useMemo(() => (rows.length > 0 ? Math.max(...rows.map((r) => r[1])) : 0), [rows]);
  const reduced = usePrefersReducedMotion();

  if (rows.length === 0) {
    return <div className={emptyClassName}>{emptyMessage}</div>;
  }

  return (
    <div ref={ref as React.RefCallback<HTMLDivElement>} className="report-animate-bar space-y-2">
      {rows.map(([name, value, customColor], index) => {
        const pct = max > 0 ? (value / max) * 100 : 0;
        const barActive = inView || reduced;
        const delay = reduced ? 0 : index * BAR_STAGGER_MS;

        return (
          <div key={name} className="flex items-center gap-2">
            <div className={labelClassName}>{name}</div>
            <div className={trackClassName}>
              <div
                className={`report-animate-bar-fill h-full rounded-md ${barActive ? 'is-visible' : ''}`}
                style={
                  {
                    '--bar-target-width': `${pct}%`,
                    backgroundColor: customColor ?? color,
                    transitionDelay: `${delay}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
            <div className={valueClassName}>
              <BarValue value={value} formatter={formatter} active={barActive} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
