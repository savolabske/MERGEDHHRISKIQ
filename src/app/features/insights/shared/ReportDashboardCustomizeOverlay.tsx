import React, { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '../../../components/ui/utils';

export type ReportCustomizePhase = 'idle' | 'customizing' | 'revealing';

export interface ReportCustomizeTheme {
  backdropClass: string;
  cardBorderClass: string;
  cardShadowClass: string;
  iconGradientClass: string;
  accentTextClass: string;
  accentStrongClass: string;
  questionTextClass: string;
  progressTrackClass: string;
  progressBarClass: string;
  dotClass: string;
  sparkleShadow?: string;
}

export const SJF_CUSTOMIZE_THEME: ReportCustomizeTheme = {
  backdropClass: 'bg-[#f4f6fa]/82',
  cardBorderClass: 'border-[#B8D9EE]',
  cardShadowClass: 'shadow-[0_8px_40px_rgba(0,104,157,0.12)]',
  iconGradientClass: 'bg-gradient-to-br from-[#00689D] to-[#19486A]',
  accentTextClass: 'text-[#00689D]',
  accentStrongClass: 'text-[#19486A]',
  questionTextClass: 'text-[#19486A]',
  progressTrackClass: 'bg-[#e8eef5]',
  progressBarClass: 'bg-gradient-to-r from-[#00689D] via-[#3ba3d4] to-[#00689D]',
  dotClass: 'bg-[#00689D]',
  sparkleShadow: 'rgba(0, 104, 157, 0.25)',
};

export const AID_FLOW_CUSTOMIZE_THEME: ReportCustomizeTheme = {
  backdropClass: 'bg-[#f6f7f9]/82',
  cardBorderClass: 'border-[#cfe0fd]',
  cardShadowClass: 'shadow-[0_8px_40px_rgba(31,111,235,0.12)]',
  iconGradientClass: 'bg-gradient-to-br from-[#1f6feb] to-[#16a39a]',
  accentTextClass: 'text-[#1f6feb]',
  accentStrongClass: 'text-[#1550b3]',
  questionTextClass: 'text-[#1550b3]',
  progressTrackClass: 'bg-[#e8eef5]',
  progressBarClass: 'bg-gradient-to-r from-[#1f6feb] via-[#4d9aff] to-[#1f6feb]',
  dotClass: 'bg-[#1f6feb]',
  sparkleShadow: 'rgba(31, 111, 235, 0.25)',
};

export const MIGRATION_CUSTOMIZE_THEME: ReportCustomizeTheme = {
  backdropClass: 'bg-[#f7f4ef]/82',
  cardBorderClass: 'border-[#f0d8c5]',
  cardShadowClass: 'shadow-[0_8px_40px_rgba(194,86,42,0.12)]',
  iconGradientClass: 'bg-gradient-to-br from-[#c2562a] to-[#d99a21]',
  accentTextClass: 'text-[#c2562a]',
  accentStrongClass: 'text-[#a3461f]',
  questionTextClass: 'text-[#a3461f]',
  progressTrackClass: 'bg-[#f3ece3]',
  progressBarClass: 'bg-gradient-to-r from-[#c2562a] via-[#e08a4a] to-[#c2562a]',
  dotClass: 'bg-[#c2562a]',
  sparkleShadow: 'rgba(194, 86, 42, 0.25)',
};

const DEFAULT_STEPS = [
  'Understanding your question',
  'Finding the right data & charts',
  'Arranging your custom view',
] as const;

const EXTENDED_STEPS = [
  'Understanding your question',
  'Cross-checking linked reports',
  'Arranging your custom view',
] as const;

interface ReportDashboardCustomizeOverlayProps {
  query: string;
  phase: Exclude<ReportCustomizePhase, 'idle'>;
  theme: ReportCustomizeTheme;
  extendedKnowledge?: boolean;
}

function truncateQuery(text: string, max = 72) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function ReportDashboardCustomizeOverlay({
  query,
  phase,
  theme,
  extendedKnowledge = false,
}: ReportDashboardCustomizeOverlayProps) {
  const steps = extendedKnowledge ? EXTENDED_STEPS : DEFAULT_STEPS;
  const [stepIndex, setStepIndex] = useState(0);
  const isRevealing = phase === 'revealing';

  useEffect(() => {
    if (phase !== 'customizing') return;
    setStepIndex(0);
    const id = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 420);
    return () => window.clearInterval(id);
  }, [phase, steps.length, query]);

  return (
    <div
      className={cn(
        'report-customize-overlay absolute inset-0 z-40 flex min-h-[min(72vh,680px)] items-start justify-center overflow-hidden px-4 pt-12 sm:pt-16',
        isRevealing && 'report-customize-overlay--exit',
      )}
      role="status"
      aria-live="polite"
      aria-label={isRevealing ? 'Your custom dashboard view is ready' : 'Shaping dashboard based on your question'}
    >
      <div
        className={cn('pointer-events-none absolute inset-0 backdrop-blur-[3px]', theme.backdropClass)}
        aria-hidden
      />

      <div
        className={cn(
          'report-customize-card relative w-full max-w-[420px] rounded-2xl border bg-white/95 p-6',
          theme.cardBorderClass,
          theme.cardShadowClass,
          isRevealing && 'report-customize-card--ready',
        )}
      >
        <div className="mb-4 flex items-center gap-3">
          <span
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md',
              theme.iconGradientClass,
              !isRevealing && 'report-customize-sparkle',
            )}
            style={
              theme.sparkleShadow
                ? ({ '--report-sparkle-shadow': theme.sparkleShadow } as React.CSSProperties)
                : undefined
            }
          >
            {isRevealing ? <Check size={18} strokeWidth={2.5} /> : <Sparkles size={18} />}
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-[#0b1a2c]">
              {isRevealing ? 'Your view is ready' : 'Shaping this dashboard'}
            </h3>
            <p className="text-[12px] text-[#6f8094]">
              {isRevealing
                ? 'Charts and detail are arranged for your question'
                : 'Customizing the report based on your question'}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-[#e2e6ee] bg-[#f8fafc] px-3.5 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6f8094]">
            Your question
          </div>
          <p className={cn('mt-1 text-[13px] font-medium leading-snug', theme.questionTextClass)}>
            &ldquo;{truncateQuery(query)}&rdquo;
          </p>
        </div>

        {isRevealing ? (
          <div className={cn('flex items-center gap-2 text-[12.5px] font-medium', theme.accentTextClass)}>
            <span className={cn('report-customize-ready-dot h-2 w-2 rounded-full', theme.dotClass)} />
            Revealing your answer
          </div>
        ) : (
          <>
            <div
              key={stepIndex}
              className="report-customize-step mb-3 flex items-center gap-2 text-[12.5px] text-[#324559]"
            >
              <span className="inline-flex items-center gap-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn('report-thinking-dot h-[6px] w-[6px] rounded-full', theme.dotClass)}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </span>
              {steps[stepIndex]}
            </div>
            <div className={cn('h-1.5 overflow-hidden rounded-full', theme.progressTrackClass)}>
              <div className={cn('report-customize-progress h-full rounded-full', theme.progressBarClass)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
