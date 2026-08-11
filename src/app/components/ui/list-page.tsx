import { type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from './utils';

/**
 * Shared list-page chrome for consistent mobile + desktop layouts.
 *
 * Mobile contract:
 * - Title block full-width; primary CTA stacks below (full width)
 * - Search (+ compact trailing) on one row; filter selects stack in a grid below
 * - List rows rely on typography hierarchy — no per-field “Name/Description” labels
 *
 * Desktop (sm+):
 * - Search, filter selects, and trailing controls share one toolbar row
 */

export const listSearchInputClass =
  'w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors';

/** Make primary/secondary header actions full-width on mobile, auto on sm+. */
export const listHeaderActionClass = 'w-full sm:w-auto shrink-0 justify-center';

/** Mobile-first list row padding — denser on small screens. */
export const listRowClass =
  'table-row-narrative grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-4 sm:px-6 transition-colors';

type ListPageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
};

export function ListPageHeader({
  title,
  subtitle,
  action,
  secondaryAction,
  className,
}: ListPageHeaderProps) {
  const hasActions = Boolean(action || secondaryAction);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-page-title mb-1">{title}</h2>
        {subtitle != null && subtitle !== '' && (
          <p className="text-sm text-muted-foreground max-w-prose">{subtitle}</p>
        )}
      </div>
      {hasActions && (
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:shrink-0 sm:flex-row sm:items-center">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
}

type ListPageSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
};

export function ListPageSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  inputClassName,
  id,
}: ListPageSearchProps) {
  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
        size={20}
        aria-hidden
      />
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(listSearchInputClass, inputClassName)}
      />
    </div>
  );
}

type ListPageToolbarProps = {
  /** Search field — usually required for list pages. */
  search?: ListPageSearchProps;
  /**
   * Compact trailing controls (e.g. view toggles, Filters button).
   * Mobile: beside search. Desktop: after filters on the same toolbar row.
   */
  trailing?: ReactNode;
  /**
   * Filter selects.
   * Mobile: 2-col grid under search (single filter spans full width).
   * Desktop (sm+): inline on the same row as search.
   */
  filters?: ReactNode;
  /** Expanded filter panel content (shown below the toolbar). */
  children?: ReactNode;
  className?: string;
  /** Number of filter controls — drives mobile grid columns. */
  filterCount?: number;
};

export function ListPageToolbar({
  search,
  trailing,
  filters,
  children,
  className,
  filterCount,
}: ListPageToolbarProps) {
  const filterNodes = filters ? (Array.isArray(filters) ? filters : [filters]) : [];
  const count = filterCount ?? filterNodes.length;
  const hasFilters = count > 0;
  const hasTrailing = trailing != null && trailing !== false;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
        <div className="flex min-w-0 flex-1 gap-2 sm:gap-3 items-stretch">
          {search && <ListPageSearch {...search} />}
          {hasTrailing && (
            <div className="flex shrink-0 items-stretch sm:hidden">{trailing}</div>
          )}
        </div>

        {hasFilters && (
          <div
            className={cn(
              'grid gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:items-stretch sm:gap-3',
              count === 1 ? 'grid-cols-1' : 'grid-cols-2',
            )}
          >
            {filters}
          </div>
        )}

        {hasTrailing && (
          <div className="hidden sm:flex shrink-0 items-stretch">{trailing}</div>
        )}
      </div>

      {children}
    </div>
  );
}
