import React from 'react';
import { useAnimateOnView } from '../../shared/animations/useAnimateOnView';
import { COLORS } from '../data/sjfData';
import type { SjfAchievement } from '../types';

export function AchievementGrid({
  rows,
  limit,
}: {
  rows: SjfAchievement[];
  limit?: number;
}) {
  const { ref, inView } = useAnimateOnView();
  const items = limit ? rows.slice(0, limit) : rows;

  return (
    <div
      ref={ref as React.RefCallback<HTMLDivElement>}
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
    >
      {items.map(([stat, desc], i) => (
        <div
          key={`${stat}-${i}`}
          className="rounded-lg border-l-[3px] bg-[#f4f6fa] px-3 py-2.5 transition-opacity duration-500"
          style={{
            borderLeftColor: COLORS.brand,
            opacity: inView ? 1 : 0,
            transitionDelay: `${i * 50}ms`,
          }}
        >
          <div className="text-[18px] font-semibold text-[#0b6b5d]">{stat}</div>
          <div className="mt-0.5 text-[11.5px] leading-snug text-[#324559]">{desc}</div>
        </div>
      ))}
    </div>
  );
}
