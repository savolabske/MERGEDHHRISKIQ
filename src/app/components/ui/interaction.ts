import { cn } from './utils';

/**
 * Canonical interaction recipes for clickable surfaces.
 *
 * Prefer these (or `Button` / Radix primitives) over ad-hoc Tailwind hover classes.
 * Rules: hover = surface/color change · focus-visible = ring · active = press · disabled = opacity + no pointer.
 */

/** Ghost icon control — top bar, list chrome, dismiss/close. Matches `Button size="icon" variant="ghost"` density. */
export const iconButtonClass =
  'inline-flex items-center justify-center size-10 shrink-0 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-muted data-[state=open]:text-foreground disabled:pointer-events-none disabled:opacity-50';

/** Compact icon button (chip clear, inline row actions). */
export const iconButtonSmClass =
  'inline-flex items-center justify-center size-7 shrink-0 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50';

/** Remove control inside chips / tags. */
export const chipRemoveClass =
  'inline-flex items-center justify-center rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

/** Filter / suggestion chip base (idle hover included). Override colors via className. */
export const chipButtonClass =
  'rounded-full border border-border bg-card px-2.5 py-1 text-left text-[10.5px] font-medium leading-snug transition-colors hover:bg-surface-hover hover:border-border-muted active:bg-muted disabled:pointer-events-none disabled:opacity-50';

/** Shared base for report filter triggers (year / multi-select). Pair with idle or active color classes. */
export const filterTriggerBaseClass =
  'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-50';

/** Idle-state hover for themed filter triggers (add after idle fill/border colors). */
export const filterTriggerIdleHoverClass =
  'hover:bg-surface-hover hover:border-border-muted';

/** Compose filter trigger classes: active styles when open/applied, idle + hover otherwise. */
export function filterTriggerClass(
  active: boolean,
  idleColors: string,
  activeColors: string,
  className?: string,
) {
  return cn(
    filterTriggerBaseClass,
    active ? activeColors : cn(idleColors, filterTriggerIdleHoverClass),
    className,
  );
}

/** Text “Clear Filters” / secondary text actions. */
export const textLinkActionClass =
  'inline-flex items-center gap-1 text-[11px] font-medium transition-colors hover:underline underline-offset-2 hover:opacity-90';

/** Bordered outline control (result panel Back, secondary chrome). Add theme text/border via className. */
export const outlineControlClass =
  'rounded-lg border bg-card px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-surface-hover active:bg-muted disabled:pointer-events-none disabled:opacity-50';

/** Full-width select / filter dropdown trigger (RiskRegister CustomDropdown, list filters). */
export const selectTriggerClass =
  'flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent';

/** Compact list-toolbar filter trigger (ownership, status, items-per-page). */
export const listFilterTriggerClass =
  'inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted';

/** Menu / dropdown option row. */
export const menuItemClass =
  'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted first:rounded-t-lg last:rounded-b-lg';

/** Pagination page number / chevron control. Pair with active override via className. */
export const paginationControlClass =
  'inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:text-border-muted disabled:hover:bg-transparent';

/** Segmented / range pill (Admin date range, similar toggles). */
export const segmentPillClass = {
  base: 'px-3 py-1 text-xs rounded-md transition-colors',
  idle: 'text-muted-foreground hover:bg-card/80 hover:text-foreground',
  active: 'text-primary bg-card border border-border font-medium',
} as const;

/** Brand / text home control (no filled surface until hover). */
export const brandHomeButtonClass =
  'group min-w-0 rounded-md px-0.5 -mx-0.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

const interactiveSurfaceBaseClass =
  'cursor-pointer transition-all duration-150 hover:shadow-md active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25';

/**
 * Clickable card / row surfaces. Set `data-interactive-card` on the element
 * (see `interactiveCardProps`) so theme.css transition tokens apply.
 */
export const interactiveSurfaceClass = {
  white: `${interactiveSurfaceBaseClass} hover:border-primary active:border-primary`,
  gradient: `${interactiveSurfaceBaseClass} hover:brightness-[1.03] active:brightness-[0.98]`,
  row: `${interactiveSurfaceBaseClass} hover:bg-primary-subtle active:bg-primary-subtle rounded-xl -mx-2 px-2`,
} as const;

/** Spread onto clickable cards that use `interactiveSurfaceClass`. */
export const interactiveCardProps = {
  'data-interactive-card': true,
} as const;

/** @deprecated Prefer `interactiveSurfaceClass` — re-exported for existing imports. */
export const dashboardCardClass = interactiveSurfaceClass;
