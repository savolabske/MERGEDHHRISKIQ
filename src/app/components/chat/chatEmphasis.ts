/**
 * Bold is the normal emphasis. Colour is rare.
 *
 * Use colour only when the bold span itself is the verdict: a high or
 * critical risk, or a clear positive. Counts, places, topics, delays,
 * and headings stay ink — icons and structure already carry those.
 *
 * A status line that starts with 🔴 🟠 🟡 🟢 already has its colour.
 * Pass `inherit` so a name on that line does not snap back to black.
 */

export type ChatEmphasisTone = 'threat' | 'caution' | 'positive' | 'neutral';

const TONE_CLASS: Record<Exclude<ChatEmphasisTone, 'neutral'>, string> = {
  threat: 'font-semibold text-destructive-text',
  caution: 'font-semibold text-warning-text',
  positive: 'font-semibold text-success-text',
};

const POSITIVE = [/^positive:?$/i, /\bno\b(?:[\w\s]{0,20})\bcasualt/i];

const THREAT = [
  /^(?:threat level:\s*)?(?:high|critical)$/i,
  /\bhigh\s+(?:risk|threat)\b/i,
  /\b\d+\s+critical\b/i,
  /^worsened$/i,
];

/** A single status word, not a topic like "flooding" or "delays". */
const CAUTION = [/^(?:conditional|medium)$/i, /^threat level:\s*medium$/i];

const MAX_COLOURED_SPAN = 40;

export function chatEmphasisTone(text: string): ChatEmphasisTone {
  const value = text.replace(/\s+/g, ' ').trim();
  if (!value || value.length > MAX_COLOURED_SPAN) return 'neutral';

  if (POSITIVE.some((pattern) => pattern.test(value))) return 'positive';
  if (THREAT.some((pattern) => pattern.test(value))) return 'threat';
  if (CAUTION.some((pattern) => pattern.test(value))) return 'caution';
  return 'neutral';
}

export function chatEmphasisClass(
  text: string,
  options?: { inherit?: boolean; neutralClass?: string },
): string {
  if (options?.inherit) return 'font-semibold';
  const tone = chatEmphasisTone(text);
  if (tone === 'neutral') {
    return options?.neutralClass ?? 'font-semibold text-foreground';
  }
  return TONE_CLASS[tone];
}
