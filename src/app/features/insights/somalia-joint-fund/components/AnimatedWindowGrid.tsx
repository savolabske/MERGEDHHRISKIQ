import React from 'react';
import { useAnimateOnView } from '../../shared/animations/useAnimateOnView';
import type { SjfWindow } from '../types';

const LAYOUT = [
  'col-span-2 row-span-2',
  'col-start-3 row-start-1',
  'col-start-4 row-start-1',
  'col-start-3 row-start-2',
  'col-start-4 row-start-2',
  'col-span-2 row-start-3',
  'col-span-2 col-start-3 row-start-3',
];

export function AnimatedWindowGrid({ rows }: { rows: SjfWindow[] }) {
  const { ref, inView } = useAnimateOnView();

  return (
    <div
      ref={ref as React.RefCallback<HTMLDivElement>}
      className="grid h-[340px] grid-cols-4 grid-rows-3 gap-2"
    >
      {rows.map(([name, pct, allocM, , color], i) => (
        <div
          key={name}
          className={`flex flex-col justify-between rounded-xl p-3.5 text-white transition-transform duration-200 hover:scale-[1.015] ${LAYOUT[i] ?? ''} ${inView ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundColor: color,
            transitionDelay: `${i * 80}ms`,
          }}
        >
          <div className="text-[12.5px] font-semibold leading-tight opacity-95">{name}</div>
          <div>
            <div className="text-[24px] font-semibold">{pct}%</div>
            <div className="text-[11px] opacity-90">
              {allocM > 0 ? `$${allocM}M` : 'window open, no 2025 alloc.'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
