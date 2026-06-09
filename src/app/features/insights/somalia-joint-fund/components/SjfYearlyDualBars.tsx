import React, { useMemo } from 'react';
import { useAnimateOnView } from '../../shared/animations/useAnimateOnView';
import { usePrefersReducedMotion } from '../../shared/animations/motionPrefs';
import { COLORS } from '../data/sjfData';
import type { SjfYearly } from '../types';

const W = 560;
const H = 290;
const PL = 46;
const PR = 16;
const PT = 18;
const PB = 40;
const BAR_STAGGER_MS = 50;

export function SjfYearlyDualBars({ rows }: { rows: SjfYearly[] }) {
  const { ref, inView } = useAnimateOnView();
  const reduced = usePrefersReducedMotion();
  const active = inView || reduced;

  const max = useMemo(
    () => (rows.length > 0 ? Math.max(...rows.flatMap((d) => [d[1], d[2] ?? 0])) * 1.15 : 0),
    [rows],
  );

  const plotHeight = H - PT - PB;
  const step = rows.length > 0 ? (W - PL - PR) / rows.length : 0;
  const bw = step * 0.36;

  const yPos = (value: number) => H - PB - (plotHeight * value) / max;
  const barHeight = (value: number) => (plotHeight * value) / max;

  const yTicks = useMemo(() => [0, 1, 2, 3, 4].map((k) => Math.round((max * (1 - k / 4)) / 1e6)), [max]);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#c4dcd5] p-4 text-[12px] text-[#6f8094]">
        No data for selected filters.
      </div>
    );
  }

  return (
    <div ref={ref as React.RefCallback<HTMLDivElement>}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Annual deposits vs transfers">
        {yTicks.map((tick, k) => {
          const yy = PT + (plotHeight * k) / 4;
          return (
            <g key={tick}>
              <line x1={PL} y1={yy} x2={W - PR} y2={yy} stroke="#eef1f7" strokeWidth={1} />
              <text
                x={PL - 7}
                y={yy + 4}
                textAnchor="end"
                fontSize={10}
                fill={COLORS.muted}
                fontFamily="inherit"
              >
                ${tick}M
              </text>
            </g>
          );
        })}

        {rows.map(([year, deposits, transfers], i) => {
          const cx = PL + step * i + step / 2;
          const label = year === 2025 ? "H1'25" : String(year);
          const depositH = barHeight(deposits);
          const depositY = yPos(deposits);
          const delay = reduced ? 0 : i * BAR_STAGGER_MS;

          if (transfers == null) {
            const bx = cx - bw / 2;
            return (
              <g key={year}>
                <text
                  x={bx + bw / 2}
                  y={active ? depositY - 5 : H - PB - depositH - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill={COLORS.ink}
                  fontFamily="inherit"
                  style={{ transition: `y 800ms ease-out ${delay}ms` }}
                >
                  {(deposits / 1e6).toFixed(0)}
                </text>
                <rect
                  x={bx}
                  y={active ? depositY : H - PB}
                  width={bw}
                  height={active ? depositH : 0}
                  rx={3}
                  fill={COLORS.wMgt}
                  style={{ transition: `y 800ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms, height 800ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms` }}
                />
                <text x={cx} y={H - 14} textAnchor="middle" fontSize={11} fill={COLORS.muted} fontFamily="inherit">
                  {label}
                </text>
              </g>
            );
          }

          const bx1 = cx - bw - 2;
          const bx2 = cx + 2;
          const transferH = barHeight(transfers);
          const transferY = yPos(transfers);

          return (
            <g key={year}>
              <text
                x={bx1 + bw / 2}
                y={active ? depositY - 5 : H - PB - depositH - 5}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill={COLORS.ink}
                fontFamily="inherit"
                style={{ transition: `y 800ms ease-out ${delay}ms` }}
              >
                {(deposits / 1e6).toFixed(0)}
              </text>
              <rect
                x={bx1}
                y={active ? depositY : H - PB}
                width={bw}
                height={active ? depositH : 0}
                rx={3}
                fill={COLORS.wMgt}
                style={{ transition: `y 800ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms, height 800ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms` }}
              />
              <text
                x={bx2 + bw / 2}
                y={active ? transferY - 5 : H - PB - transferH - 5}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill={COLORS.ink}
                fontFamily="inherit"
                style={{ transition: `y 800ms ease-out ${delay + 45}ms` }}
              >
                {(transfers / 1e6).toFixed(0)}
              </text>
              <rect
                x={bx2}
                y={active ? transferY : H - PB}
                width={bw}
                height={active ? transferH : 0}
                rx={3}
                fill={COLORS.brand}
                style={{
                  transition: `y 800ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay + 45}ms, height 800ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay + 45}ms`,
                }}
              />
              <text x={cx} y={H - 14} textAnchor="middle" fontSize={11} fill={COLORS.muted} fontFamily="inherit">
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-[#324559]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.wMgt }} />
          Deposits (donor → fund)
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.brand }} />
          Transfers (fund → PUNOs)
        </span>
      </div>
      <p className="mt-2 text-[11px] text-[#6f8094]">
        2025 figures cover H1 only (Jan–Jun). Source: SJF Semi-Annual Report, Sep 2025.
      </p>
    </div>
  );
}
