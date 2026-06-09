import React, { useMemo } from 'react';
import { useAnimateOnView } from './useAnimateOnView';
import { AnimatedStat } from './AnimatedStat';
import { usePrefersReducedMotion } from './motionPrefs';

const CELL_STAGGER_MS = 40;

export type TreemapSector = [name: string, value: number, color: string];

interface AnimatedTreemapProps {
  sectors: TreemapSector[];
  formatter: (value: number) => string;
  layoutClasses?: string[];
  pctClasses?: string[];
}

export function AnimatedTreemap({
  sectors,
  formatter,
  layoutClasses = ['col-span-2 row-span-2', '', '', '', '', '', '', 'col-span-2'],
  pctClasses = ['text-[20px]', 'text-[14px]', 'text-[14px]', 'text-[14px]', 'text-[14px]', 'text-[13px]', 'text-[13px]', 'text-[16px]'],
}: AnimatedTreemapProps) {
  const { ref, inView } = useAnimateOnView();
  const total = sectors.reduce((sum, [, value]) => sum + value, 0);
  const reduced = usePrefersReducedMotion();

  const staggerOrder = useMemo(() => {
    const indexed = sectors.map((sector, index) => ({ sector, index }));
    indexed.sort((a, b) => b.sector[1] - a.sector[1]);
    const delays = new Map<number, number>();
    indexed.forEach(({ index }, rank) => {
      delays.set(index, rank * CELL_STAGGER_MS);
    });
    return delays;
  }, [sectors]);

  return (
    <div
      ref={ref as React.RefCallback<HTMLDivElement>}
      className="grid h-[330px] grid-cols-4 grid-rows-3 gap-2"
    >
      {sectors.map(([name, value, color], i) => {
        const pct = Math.round((value / total) * 100);
        const delay = reduced ? 0 : (staggerOrder.get(i) ?? 0);
        const visible = inView || reduced;

        return (
          <div
            key={name}
            className={`report-animate-treemap-cell flex min-h-0 flex-col justify-between rounded-xl p-3 text-white ${layoutClasses[i] ?? ''} ${visible ? 'is-visible' : ''}`}
            style={{
              backgroundColor: color,
              transitionDelay: `${delay}ms`,
            }}
          >
            <div className="text-[12px] font-semibold leading-snug">{name}</div>
            <div>
              <div className={`${pctClasses[i] ?? 'text-[14px]'} leading-none font-semibold`}>
                <AnimatedStat value={`${pct}%`} raw={pct} active={visible} />
              </div>
              <div className="mt-0.5 text-[11px] opacity-95">
                <AnimatedStat value={formatter(value)} raw={value} active={visible} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
