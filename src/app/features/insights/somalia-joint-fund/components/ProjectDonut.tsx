import React, { useEffect, useState } from 'react';
import { COLORS, SJF_DATA } from '../data/sjfData';
import { fmtM } from '../hooks/useSjfFilters';
import { getPrefersReducedMotion } from '../../shared/animations/motionPrefs';
import { useAnimateOnView } from '../../shared/animations/useAnimateOnView';

const PALETTE = [
  COLORS.brand,
  COLORS.navy,
  COLORS.coral,
  COLORS.wRol,
  COLORS.wHrg,
  COLORS.gold,
  COLORS.wCrlg,
  COLORS.wCr,
  COLORS.plum,
  COLORS.wSd,
];

const R = 80;
const CX = 110;
const CY = 110;
const CIRC = 2 * Math.PI * R;

export function ProjectDonut({ year, label }: { year: 2025 | 2026; label?: string }) {
  const rows = year === 2025 ? SJF_DATA.pbi.transfers2025 : SJF_DATA.pbi.transfers2026;
  const total = rows.reduce((s, r) => s + r[1], 0);
  const { ref, inView } = useAnimateOnView();
  const reduced = getPrefersReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setProgress(1);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1000, 1);
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  let offset = 0;
  const segments = rows.map((row, i) => {
    const len = (row[1] / total) * CIRC * progress;
    const seg = { row, i, len, offset, color: PALETTE[i % PALETTE.length] };
    offset += (row[1] / total) * CIRC;
    return seg;
  });

  return (
    <div
      ref={ref as React.RefCallback<HTMLDivElement>}
      className="flex flex-wrap items-center gap-4 lg:gap-5"
    >
      <svg viewBox="0 0 220 220" className="max-w-[220px] shrink-0" aria-hidden>
        {segments.map(({ row, len, offset: off, color }) => (
          <circle
            key={row[0]}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={28}
            strokeDasharray={`${len} ${CIRC - len}`}
            strokeDashoffset={-off}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition: reduced ? undefined : 'stroke-dasharray 0.8s ease' }}
          />
        ))}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize={11} fill={COLORS.muted}>
          {label ?? String(year)}
        </text>
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          fontSize={22}
          fontFamily="inherit"
          fontWeight={600}
          fill={COLORS.ink}
        >
          {fmtM(total)}
        </text>
      </svg>
      <div className="min-w-[200px] flex-1 space-y-1.5">
        {rows.map(([name, val], i) => (
          <div key={name} className="flex items-center gap-2 text-[12px] text-[#324559]">
            <i
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <span>
              {name} · {fmtM(val)} ({((val / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
