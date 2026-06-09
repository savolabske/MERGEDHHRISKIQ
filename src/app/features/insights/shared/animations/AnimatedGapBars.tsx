import React, { useMemo } from 'react';
import { useAnimateOnView } from './useAnimateOnView';
import { useCountUp } from './useCountUp';
import { usePrefersReducedMotion } from './motionPrefs';

const BAR_STAGGER_MS = 60;

interface AnimatedGapBarsProps {
  rows: [string, number, number][];
  formatter: (value: number) => string;
  emptyMessage?: string;
  emptyClassName?: string;
  labelClassName?: string;
  trackClassName?: string;
  valueClassName?: string;
  needColor?: string;
  responseColor?: string;
}

function GapValue({
  response,
  need,
  formatter,
  active,
}: {
  response: number;
  need: number;
  formatter: (v: number) => string;
  active: boolean;
}) {
  const responseDisplay = useCountUp(response, active, formatter);
  const needDisplay = useCountUp(need, active, formatter);
  return (
    <>
      {responseDisplay}/{needDisplay}
    </>
  );
}

export function AnimatedGapBars({
  rows,
  formatter,
  emptyMessage = 'No data for selected filters.',
  emptyClassName = 'rounded-lg border border-dashed border-[#d7cec4] p-4 text-[12px] text-[#8a7d72]',
  labelClassName = 'w-[108px] text-right text-[12px] font-medium text-[#4a3f38]',
  trackClassName = 'relative h-[24px] flex-1 overflow-hidden rounded-md bg-[#f3efe9]',
  valueClassName = 'w-[92px] text-[11px] text-[#8a7d72]',
  needColor = '#e9d9c6',
  responseColor = '#c2562a',
}: AnimatedGapBarsProps) {
  const { ref, inView } = useAnimateOnView();
  const max = useMemo(
    () => (rows.length > 0 ? Math.max(...rows.map((r) => r[1])) : 0),
    [rows]
  );
  const reduced = usePrefersReducedMotion();

  if (rows.length === 0) {
    return <div className={emptyClassName}>{emptyMessage}</div>;
  }

  return (
    <div ref={ref as React.RefCallback<HTMLDivElement>} className="report-animate-bar space-y-2">
      {rows.slice(0, 8).map(([name, need, response], index) => {
        const needPct = max > 0 ? (need / max) * 100 : 0;
        const responsePct = max > 0 ? (response / max) * 100 : 0;
        const barActive = inView || reduced;
        const delay = reduced ? 0 : index * BAR_STAGGER_MS;

        return (
          <div key={name} className="flex items-center gap-2">
            <div className={labelClassName}>{name}</div>
            <div className={trackClassName}>
              <div
                className={`report-animate-bar-fill absolute inset-y-0 left-0 rounded-md ${barActive ? 'is-visible' : ''}`}
                style={
                  {
                    '--bar-target-width': `${needPct}%`,
                    backgroundColor: needColor,
                    transitionDelay: `${delay}ms`,
                  } as React.CSSProperties
                }
              />
              <div
                className={`report-animate-bar-fill absolute inset-y-0 left-0 rounded-md ${barActive ? 'is-visible' : ''}`}
                style={
                  {
                    '--bar-target-width': `${responsePct}%`,
                    backgroundColor: responseColor,
                    transitionDelay: `${delay}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
            <div className={valueClassName}>
              <GapValue response={response} need={need} formatter={formatter} active={barActive} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
