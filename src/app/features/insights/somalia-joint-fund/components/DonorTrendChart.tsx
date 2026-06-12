import React, { useEffect, useMemo, useState } from 'react';
import { COLORS } from '../data/sjfData';
import { donorTrendSeries, pbiDonorTotals } from '../data/sjfPbiUtils';
import { fmtM } from '../hooks/useSjfFilters';
import { easeOut, getPrefersReducedMotion } from '../../shared/animations/motionPrefs';
import { useAnimateOnView } from '../../shared/animations/useAnimateOnView';

const YEAR_COLORS = {
  y2025: COLORS.brand,
  y2026: COLORS.navy,
  y2027: COLORS.coral,
  balanceCf: COLORS.gold,
} as const;

function formatBarLabel(value: number) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 1 : 1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}k`;
  return `${(value / 1e6).toFixed(2)}M`;
}

export function DonorTrendChart() {
  const series = donorTrendSeries();
  const { ref, inView } = useAnimateOnView();
  const reduced = getPrefersReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  const max = useMemo(
    () => Math.max(...series.flatMap((s) => [s[1], s[2], s[3]]), 1) * 1.08,
    [series],
  );

  const W = 560;
  const pl = 108;
  const pr = 24;
  const pt = 8;
  const pb = 36;
  const barH = 8;
  const barGap = 3;
  const rowPad = 6;
  const rowH = Math.max(38, barH * 3 + barGap * 2 + rowPad * 2);
  const H = pt + series.length * rowH + pb;
  const chartW = W - pl - pr;
  const barX = (v: number) => pl + (chartW * v) / max;

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setProgress(1);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = easeOut(Math.min((now - start) / 950, 1));
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  return (
    <div ref={ref as React.RefCallback<HTMLDivElement>} className="w-full min-w-0">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="min-w-[480px] w-full"
          role="img"
          aria-label="Donor contributions across 2025, 2026 and 2027"
        >
          {/* vertical grid + x-axis */}
          {Array.from({ length: 5 }, (_, k) => {
            const xx = pl + (chartW * k) / 4;
            return (
              <g key={`grid-${k}`}>
                <line
                  x1={xx}
                  y1={pt}
                  x2={xx}
                  y2={H - pb}
                  stroke="#eef1f7"
                  strokeWidth={1}
                />
                <text
                  x={xx}
                  y={H - pb + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill={COLORS.muted}
                  fontFamily="inherit"
                >
                  ${((max * k) / 4 / 1e6).toFixed(1)}M
                </text>
              </g>
            );
          })}
          <line
            x1={pl}
            y1={H - pb}
            x2={W - pr}
            y2={H - pb}
            stroke="#e2e6ee"
            strokeWidth={1}
          />

          {series.map(([donor, y25, y26, y27], i) => {
            const rowTop = pt + rowH * i;
            const bars = [
              { v: y25, color: donor === 'Balance C/F' ? YEAR_COLORS.balanceCf : YEAR_COLORS.y2025 },
              { v: y26, color: YEAR_COLORS.y2026 },
              { v: y27, color: YEAR_COLORS.y2027 },
            ].filter((b) => b.v > 0);

            const groupH = bars.length * barH + (bars.length - 1) * barGap;
            const groupTop = rowTop + (rowH - groupH) / 2;
            const labelY = rowTop + rowH / 2 + 4;

            return (
              <g key={donor}>
                {i > 0 && (
                  <line
                    x1={pl}
                    y1={rowTop}
                    x2={W - pr}
                    y2={rowTop}
                    stroke="#f4f6fa"
                    strokeWidth={1}
                  />
                )}

                <text
                  x={pl - 10}
                  y={labelY}
                  textAnchor="end"
                  fontSize={11.5}
                  fill={COLORS.ink2}
                  fontWeight={500}
                  fontFamily="inherit"
                >
                  {donor}
                </text>

                {bars.map((bar, bi) => {
                  const y = groupTop + bi * (barH + barGap);
                  const fullW = barX(bar.v) - pl;
                  const w = Math.max(0, fullW * progress);
                  const labelX = pl + w + 5;

                  return (
                    <g key={`${donor}-${bi}`}>
                      {/* track */}
                      <rect
                        x={pl}
                        y={y}
                        width={chartW}
                        height={barH}
                        rx={4}
                        fill="#f4f6fa"
                      />
                      {/* fill */}
                      <rect
                        x={pl}
                        y={y}
                        width={w}
                        height={barH}
                        rx={4}
                        fill={bar.color}
                      />
                      {(progress > 0.85 || reduced) && w > 28 && (
                        <text
                          x={labelX}
                          y={y + barH - 2}
                          fontSize={10}
                          fill={COLORS.ink}
                          fontWeight={600}
                          fontFamily="inherit"
                        >
                          {formatBarLabel(bar.v)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eef1f7] pt-3 text-[12px] text-[#324559]">
        <span className="flex items-center gap-2 font-medium">
          <i
            className="inline-block h-2.5 w-2.5 rounded-[3px]"
            style={{ backgroundColor: YEAR_COLORS.y2025 }}
          />
          2025
        </span>
        <span className="flex items-center gap-2 font-medium">
          <i
            className="inline-block h-2.5 w-2.5 rounded-[3px]"
            style={{ backgroundColor: YEAR_COLORS.y2026 }}
          />
          2026
        </span>
        <span className="flex items-center gap-2 font-medium">
          <i
            className="inline-block h-2.5 w-2.5 rounded-[3px]"
            style={{ backgroundColor: YEAR_COLORS.y2027 }}
          />
          2027
        </span>
        <span className="flex items-center gap-2 text-[#6f8094]">
          <i
            className="inline-block h-2.5 w-2.5 rounded-[3px]"
            style={{ backgroundColor: YEAR_COLORS.balanceCf }}
          />
          Balance C/F (2025 bar)
        </span>
      </div>
    </div>
  );
}

export function DonorYearBars({ year }: { year: '2025' | '2026' | '2027' }) {
  const rows = pbiDonorTotals(year);
  const max = Math.max(...rows.map((r) => r[1]), 1);
  const { ref, inView } = useAnimateOnView();
  const [progress, setProgress] = useState(getPrefersReducedMotion() ? 1 : 0);

  useEffect(() => {
    if (!inView) return;
    if (getPrefersReducedMotion()) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = easeOut(Math.min((now - start) / 800, 1));
      setProgress(t);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  if (!rows.length) {
    return (
      <div className="py-8 text-center text-[13px] text-[#6f8094]">
        No commitments recorded for {year}.
      </div>
    );
  }

  return (
    <div ref={ref as React.RefCallback<HTMLDivElement>} className="space-y-2.5">
      {rows.map(([donor, val]) => {
        const isCF = donor === 'Balance C/F';
        const col = isCF ? COLORS.gold : COLORS.brand;
        const pct = (val / max) * 100 * progress;
        return (
          <div key={donor} className="flex items-center gap-2.5">
            <div className="w-[140px] shrink-0 text-right text-[12px] font-medium text-[#324559]">
              {donor}
              {isCF && (
                <span className="ml-1 rounded bg-[#fdf3e0] px-1.5 py-0.5 text-[9px] font-bold text-[#DDA63A]">
                  CARRY-FWD
                </span>
              )}
            </div>
            <div className="h-[22px] flex-1 overflow-hidden rounded-md bg-[#eef1f7]">
              <div
                className="h-full rounded-md transition-[width] duration-300"
                style={{ width: `${pct}%`, backgroundColor: col }}
              />
            </div>
            <div className="w-[66px] shrink-0 text-right text-[12px] font-semibold text-[#0b1a2c]">
              {fmtM(val)}
            </div>
          </div>
        );
      })}
      <div className="mt-3 flex flex-wrap gap-3 border-t border-[#eef1f7] pt-3 text-[12px] text-[#324559]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: COLORS.brand }} />
          New donor commitment
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: COLORS.gold }} />
          Balance carried forward
        </span>
      </div>
    </div>
  );
}
