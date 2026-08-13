import { useEffect, useState, type CSSProperties } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '../ui/utils';
import '../../features/insights/shared/animations/reportAnimations.css';

const CUSTOMIZE_STEPS = [
  'Reading your interests',
  'Tuning your main insight',
  'Shaping emerging signals',
  'Arranging predictive views',
] as const;

interface OnboardingCustomizeOverlayProps {
  interestLabels: string[];
  phase: 'customizing' | 'revealing';
}

function formatInterestSummary(labels: string[]): string {
  if (labels.length === 0) return 'your operational focus';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

export function OnboardingCustomizeOverlay({
  interestLabels,
  phase,
}: OnboardingCustomizeOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const isRevealing = phase === 'revealing';

  useEffect(() => {
    if (phase !== 'customizing') return;
    setStepIndex(0);
    const id = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % CUSTOMIZE_STEPS.length);
    }, 520);
    return () => window.clearInterval(id);
  }, [phase]);

  return (
    <div
      className={cn(
        'report-customize-overlay absolute inset-0 z-40 flex items-center justify-center overflow-hidden px-4',
        isRevealing && 'report-customize-overlay--exit',
      )}
      role="status"
      aria-live="polite"
      aria-label={
        isRevealing ? 'Your personalized home is ready' : 'Customizing your home dashboard'
      }
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[#F7F8FA]/88 backdrop-blur-[4px]"
        aria-hidden
      />

      {/* Soft atmosphere — not flat white */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(36,99,235,0.08), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(14,165,233,0.06), transparent 55%)',
        }}
        aria-hidden
      />

      <div
        className={cn(
          'report-customize-card relative w-full max-w-[440px] rounded-2xl border border-primary-border bg-white/95 p-6 shadow-[0_8px_40px_rgba(36,99,235,0.12)]',
          isRevealing && 'report-customize-card--ready',
        )}
      >
        <div className="mb-4 flex items-center gap-3">
          <span
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-active text-white shadow-md',
              !isRevealing && 'report-customize-sparkle',
            )}
            style={{ '--report-sparkle-shadow': 'rgba(36, 99, 235, 0.28)' } as CSSProperties}
          >
            {isRevealing ? <Check size={18} strokeWidth={2.5} /> : <Sparkles size={18} />}
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">
              {isRevealing ? 'Your home is ready' : 'Customizing your dashboard'}
            </h3>
            <p className="text-[12px] text-muted-foreground">
              {isRevealing
                ? 'Insights are arranged around what you care about'
                : 'Personalizing sections from your selected interests'}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-muted/60 px-3.5 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Focusing on
          </div>
          <p className="mt-1 text-[13px] font-medium leading-snug text-primary-text">
            {formatInterestSummary(interestLabels)}
          </p>
        </div>

        {isRevealing ? (
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-primary-text">
            <span className="report-customize-ready-dot h-2 w-2 rounded-full bg-primary" />
            Opening your personalized home
          </div>
        ) : (
          <>
            <div
              key={stepIndex}
              className="report-customize-step mb-3 flex items-center gap-2 text-[12.5px] text-secondary-foreground"
            >
              <span className="inline-flex items-center gap-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="report-thinking-dot h-[6px] w-[6px] rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </span>
              {CUSTOMIZE_STEPS[stepIndex]}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-primary-muted">
              <div className="report-customize-progress h-full rounded-full bg-gradient-to-r from-primary via-[#60a5fa] to-primary" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
