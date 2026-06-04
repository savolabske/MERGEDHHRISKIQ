import { useEffect, useState, type ElementType } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { palette } from '../../theme/palette';
import type { IntelligenceLoadStep } from './intelligenceLoading';

const RISK_DOTS = [
  { color: palette.destructiveText, delay: 0 },
  { color: palette.warningStrong, delay: 0.35 },
  { color: palette.warning, delay: 0.7 },
  { color: palette.primary, delay: 1.05 },
] as const;

function useLoadingStepIndex(durationMs: number, steps: readonly IntelligenceLoadStep[]) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = durationMs / steps.length;
    const timers = steps.slice(1).map((_, i) =>
      window.setTimeout(() => setIndex(i + 1), interval * (i + 1))
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [durationMs, steps]);

  return index;
}

export interface IntelligenceLoadingScreenProps {
  durationMs: number;
  steps: readonly IntelligenceLoadStep[];
  eyebrow: string;
  subtitle: string;
  ariaLabel: string;
  centerIcon: ElementType<{ size?: number; className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;
  centerIconClassName?: string;
  className?: string;
}

export function IntelligenceLoadingScreen({
  durationMs,
  steps,
  eyebrow,
  subtitle,
  ariaLabel,
  centerIcon: CenterIcon,
  centerIconClassName = 'text-primary',
  className = '',
}: IntelligenceLoadingScreenProps) {
  const stepIndex = useLoadingStepIndex(durationMs, steps);
  const activeStep = steps[stepIndex];
  const Icon = CenterIcon;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-background px-6 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="intelligence-load-glow absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="intelligence-load-grid absolute inset-0 opacity-[0.35]" />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-[168px] w-[168px] items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <span
              key={ring}
              className="intelligence-load-ring absolute inset-0 rounded-full border border-primary/25"
              style={{ animationDelay: `${ring * 0.55}s` }}
            />
          ))}

          {RISK_DOTS.map((dot, i) => (
            <span
              key={dot.color}
              className="intelligence-load-orbit absolute h-full w-full"
              style={{ animationDelay: `${dot.delay}s` }}
            >
              <span
                className="intelligence-load-dot absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow-sm"
                style={{
                  backgroundColor: dot.color,
                  boxShadow: `0 0 12px color-mix(in srgb, ${dot.color} 40%, transparent)`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            </span>
          ))}

          <motion.div
            className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-card shadow-primary"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={32} className={centerIconClassName} strokeWidth={1.75} aria-hidden />
          </motion.div>
        </div>

        <p className="mt-8 label-caps tracking-[0.2em]">
          {eyebrow}
        </p>

        <div className="mt-3 h-7 min-w-[280px] text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeStep.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="text-base font-medium text-foreground shimmer-text"
            >
              {activeStep.label}
              <span className="intelligence-load-ellipsis" aria-hidden>
                ...
              </span>
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  );
}
