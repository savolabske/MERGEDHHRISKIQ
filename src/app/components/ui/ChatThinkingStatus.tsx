import { useEffect, useState } from 'react';
import { cn } from './utils';

/** Shared copy for chat prompt loading — rotate so users see context of what’s happening. */
export const CHAT_THINKING_PHASES = {
  default: ['Looking through knowledge base...', 'Preparing answer...'],
  extended: [
    'Looking through knowledge base...',
    'Searching web sources...',
    'Preparing answer...',
  ],
  reportDashboard: ['Reading data...', 'Choosing charts...', 'Preparing answer...'],
  reportDashboardExtended: [
    'Reading data...',
    'Cross-checking linked reports...',
    'Preparing answer...',
  ],
  reportSections: [
    'Looking through knowledge base...',
    'Reading report sections...',
    'Preparing answer...',
  ],
  map: [
    'Looking through knowledge base...',
    'Updating map layers...',
    'Preparing answer...',
  ],
  workflow: ['Looking through knowledge base...', 'Preparing answer...'],
} as const;

export const DEFAULT_THINKING_PHASE_MS = 900;

/** Total wait that fits the default two-phase rotation with a short buffer. */
export const DEFAULT_CHAT_THINKING_DURATION_MS =
  DEFAULT_THINKING_PHASE_MS * CHAT_THINKING_PHASES.default.length + 400;

export function useRotatingThinkingPhase(
  active: boolean,
  phases: readonly string[],
  intervalMs = DEFAULT_THINKING_PHASE_MS,
): string | null {
  const [index, setIndex] = useState(0);
  const phasesKey = phases.join('\0');

  useEffect(() => {
    if (!active || phases.length === 0) {
      setIndex(0);
      return;
    }

    setIndex(0);
    if (phases.length === 1) return;

    const id = window.setInterval(() => {
      setIndex((prev) => {
        if (prev >= phases.length - 1) {
          window.clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [active, phasesKey, phases.length, intervalMs]);

  if (!active || phases.length === 0) return null;
  return phases[Math.min(index, phases.length - 1)] ?? null;
}

interface ChatThinkingStatusProps {
  /** Controlled label — skips auto-rotation when provided */
  message?: string | null;
  /** Phases to rotate while `active` (ignored when `message` is set) */
  phases?: readonly string[];
  active?: boolean;
  intervalMs?: number;
  className?: string;
  textClassName?: string;
  spinnerClassName?: string;
  size?: 'sm' | 'md';
}

export function ChatThinkingStatus({
  message,
  phases = CHAT_THINKING_PHASES.default,
  active = true,
  intervalMs = DEFAULT_THINKING_PHASE_MS,
  className,
  textClassName,
  spinnerClassName,
  size = 'md',
}: ChatThinkingStatusProps) {
  const rotated = useRotatingThinkingPhase(
    active && (message == null || message === ''),
    phases,
    intervalMs,
  );
  const label = message || rotated;

  if (!active || !label) return null;

  const spinnerSize = size === 'sm' ? 'size-4' : 'size-5';
  const textSize = size === 'sm' ? 'text-[13px]' : 'text-base';

  return (
    <div
      className={cn('flex items-center gap-2.5', className)}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'shrink-0 rounded-full border-2 border-primary border-t-transparent animate-spin',
          spinnerSize,
          spinnerClassName,
        )}
        aria-hidden
      />
      <span className={cn('font-medium shimmer-text', textSize, textClassName)}>
        {label}
      </span>
    </div>
  );
}
