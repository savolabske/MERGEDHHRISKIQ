import React, { useMemo } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { Slider } from '../../../components/ui/slider';
import { useRacingChartPlayback } from './useRacingChartPlayback';

export type RacingBarRow = [label: string, value: number, color?: string];

const FRAME_TRANSITION = { duration: 0.6, ease: 'easeInOut' as const };
const BAR_WIDTH_TRANSITION = 'width 600ms ease-in-out';

const THEMES = {
  'aid-flow': {
    emptyBorder: 'border-[#d7dee8]',
    emptyText: 'text-[#6b7a8d]',
    labelText: 'text-[#3a4a5c]',
    valueText: 'text-[#0d1b2a]',
    periodText: 'text-[#0d1b2a]',
    trackBg: 'bg-[#eef1f6]',
    accentBg: 'bg-[#1f6feb] hover:bg-[#1550b3]',
    accentBorder: 'border-[#1f6feb]',
    accentColor: '#1f6feb',
    labelWidth: 'w-[126px]',
  },
  migration: {
    emptyBorder: 'border-[#d7cec4]',
    emptyText: 'text-[#8a7d72]',
    labelText: 'text-[#4a3f38]',
    valueText: 'text-[#1a1410]',
    periodText: 'text-[#1a1410]',
    trackBg: 'bg-[#f3efe9]',
    accentBg: 'bg-[#c2562a] hover:bg-[#a3461f]',
    accentBorder: 'border-[#c2562a]',
    accentColor: '#c2562a',
    labelWidth: 'w-[126px]',
  },
  sjf: {
    emptyBorder: 'border-[#c4dcd5]',
    emptyText: 'text-[#6f8094]',
    labelText: 'text-[#324559]',
    valueText: 'text-[#0b1a2c]',
    periodText: 'text-[#0b1a2c]',
    trackBg: 'bg-[#eef1f7]',
    accentBg: 'bg-[#0b6b5d] hover:bg-[#054f43]',
    accentBorder: 'border-[#0b6b5d]',
    accentColor: '#0b6b5d',
    labelWidth: 'w-[168px]',
  },
} as const;

export type RacingChartTheme = keyof typeof THEMES;

export type RacingPeriodFrame = {
  label: string;
  rows: RacingBarRow[];
};

function getDisplayRows(rows: RacingBarRow[], frame: number, lastFrame: number): RacingBarRow[] {
  const valued = rows.map(([label, value, color], index) => [
    label,
    index <= frame ? value : 0,
    color,
  ] as RacingBarRow);

  if (frame >= lastFrame) return valued;

  const active = valued.filter((row) => row[1] > 0).sort((a, b) => b[1] - a[1]);
  const inactive = valued.filter((row) => row[1] === 0);
  return [...active, ...inactive];
}

export function RacingTimeSeriesBars({
  rows = [],
  frames,
  formatter,
  defaultColor,
  theme,
  footer,
}: {
  rows?: RacingBarRow[];
  frames?: RacingPeriodFrame[];
  formatter: (value: number) => string;
  defaultColor: string;
  theme: RacingChartTheme;
  footer?: React.ReactNode;
}) {
  const styles = THEMES[theme];
  const periodMode = Boolean(frames?.length);
  const frameCount = periodMode ? frames!.length : rows.length;

  const rowsKey = useMemo(() => {
    if (periodMode) {
      return frames!
        .map((period) => `${period.label}:${period.rows.map(([label, value]) => `${label}:${value}`).join(',')}`)
        .join('|');
    }
    return rows.map(([label, value]) => `${label}:${value}`).join('|');
  }, [frames, periodMode, rows]);

  const globalMax = useMemo(() => {
    if (periodMode) {
      const values = frames!.flatMap((period) => period.rows.map((row) => row[1]));
      return values.length > 0 ? Math.max(...values) : 0;
    }
    return rows.length > 0 ? Math.max(...rows.map((row) => row[1])) : 0;
  }, [frames, periodMode, rows]);

  const { ref, frame, isPlaying, togglePlay, scrubTo, lastFrame } = useRacingChartPlayback(
    frameCount,
    rowsKey,
  );

  if (frameCount === 0) {
    return (
      <div className={`rounded-lg border border-dashed ${styles.emptyBorder} p-4 text-[12px] ${styles.emptyText}`}>
        No data for selected filters.
      </div>
    );
  }

  const displayRows = periodMode
    ? frames![frame].rows
    : getDisplayRows(rows, frame, lastFrame);
  const prominentLabel = periodMode
    ? frames![frame].label
    : rows[frame]?.[0] ?? rows[lastFrame][0];

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div
        className={`text-center text-[28px] font-semibold leading-none tracking-tight ${styles.periodText}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {prominentLabel}
      </div>

      <div className="max-h-[320px] overflow-y-auto pr-1">
        <LayoutGroup>
          <div className="space-y-2">
            {displayRows.map(([name, value, customColor]) => {
              const pct = globalMax > 0 ? (value / globalMax) * 100 : 0;
              const hasValue = value > 0;

              return (
                <motion.div
                  key={name}
                  layout
                  transition={{ layout: FRAME_TRANSITION }}
                  className="flex items-center gap-2"
                >
                  <div className={`${styles.labelWidth} text-right text-[12px] font-medium ${styles.labelText}`}>{name}</div>
                  <div className={`h-[22px] flex-1 overflow-hidden rounded-md ${styles.trackBg}`}>
                    <div
                      className="h-full rounded-md"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: customColor ?? defaultColor,
                        transition: BAR_WIDTH_TRANSITION,
                      }}
                    />
                  </div>
                  <div
                    className={`w-[66px] text-[12px] font-semibold ${styles.valueText}`}
                    style={{ opacity: hasValue ? 1 : 0, transition: 'opacity 300ms ease-in-out' }}
                  >
                    {hasValue ? formatter(value) : ''}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${styles.accentBorder} text-white ${styles.accentBg}`}
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
        <Slider
          value={[frame]}
          min={0}
          max={lastFrame}
          step={1}
          onValueChange={([nextFrame]) => scrubTo(nextFrame)}
          className="flex-1 [&_[data-slot=slider-range]]:bg-[var(--racing-accent)] [&_[data-slot=slider-thumb]]:border-[var(--racing-accent)]"
          style={{ '--racing-accent': styles.accentColor } as React.CSSProperties}
        />
        <span className={`w-[42px] text-right text-[11px] font-medium ${styles.labelText}`}>
          {frame + 1}/{frameCount}
        </span>
      </div>
      {footer}
    </div>
  );
}
