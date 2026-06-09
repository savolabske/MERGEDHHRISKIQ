import React, { useEffect, useMemo, useState } from 'react';
import { easeOut, getPrefersReducedMotion } from './motionPrefs';
import { useAnimateOnView } from './useAnimateOnView';
import { AnimatedStat } from './AnimatedStat';

const DONUT_DURATION_MS = 700;
const RADIUS = 62;
const STROKE = 24;
const SIZE = 176;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface AnimatedDonutProps {
  segments: { value: number; color: string; label: string }[];
  formatter: (value: number) => string;
  centerClassName?: string;
  legendClassName?: string;
}

export function AnimatedDonut({
  segments,
  formatter,
  centerClassName = 'text-[20px] font-semibold text-[#0d1b2a]',
  legendClassName = 'space-y-3 text-[12px] text-[#3a4a5c]',
}: AnimatedDonutProps) {
  const { ref, inView } = useAnimateOnView();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const reduced = getPrefersReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  const arcData = useMemo(() => {
    let rotation = -90;
    return segments.map((segment) => {
      const fraction = total > 0 ? segment.value / total : 0;
      const length = fraction * CIRCUMFERENCE;
      const data = { ...segment, length, rotation };
      rotation += fraction * 360;
      return data;
    });
  }, [segments, total]);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setProgress(1);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DONUT_DURATION_MS, 1);
      setProgress(easeOut(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  return (
    <div ref={ref as React.RefCallback<HTMLDivElement>} className="flex flex-wrap items-center gap-6">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {arcData.map((arc) => {
            const drawn = arc.length * progress;
            const offset = arc.length - drawn;
            return (
              <circle
                key={arc.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                strokeDasharray={`${arc.length} ${CIRCUMFERENCE}`}
                strokeDashoffset={reduced ? 0 : offset}
                transform={`rotate(${arc.rotation} ${CENTER} ${CENTER})`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-[26px] flex items-center justify-center rounded-full bg-white">
          <AnimatedStat
            value={formatter(total)}
            raw={total}
            className={centerClassName}
            active={inView || reduced}
          />
        </div>
      </div>
      <div className={legendClassName}>
        {segments.map((segment) => (
          <div key={segment.label}>
            <span
              className="mr-2 inline-block h-2 w-2 rounded"
              style={{ backgroundColor: segment.color }}
            />
            {segment.label}:{' '}
            <AnimatedStat
              value={formatter(segment.value)}
              raw={segment.value}
              active={inView || reduced}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
