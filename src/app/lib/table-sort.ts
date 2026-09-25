export type SortDirection = 'asc' | 'desc';

export type SortKind = 'text' | 'number' | 'date' | 'relativeTime';

export type SortState<K extends string = string> = {
  column: K;
  direction: SortDirection;
} | null;

export const SORT_OPTION_LABELS: Record<
  SortKind,
  { asc: string; desc: string }
> = {
  text: { asc: 'A to Z', desc: 'Z to A' },
  number: { asc: 'Low to high', desc: 'High to low' },
  date: { asc: 'Oldest first', desc: 'Newest first' },
  relativeTime: { asc: 'Oldest first', desc: 'Newest first' },
};

export type SortColumnConfig<T, K extends string = string> = Record<
  K,
  {
    getValue: (item: T) => string | number | null | undefined;
    kind?: SortKind;
  }
>;

/** Parse relative strings like "2 min ago", "Yesterday", "3 days ago" into age in ms (larger = older). */
export function relativeTimeToAgeMs(value: string): number {
  const raw = value.trim().toLowerCase();
  if (!raw || raw === '—' || raw === '-') return Number.POSITIVE_INFINITY;
  if (raw === 'just now' || raw === 'now') return 0;
  if (raw === 'yesterday') return 24 * 60 * 60 * 1000;

  const match = raw.match(
    /^(\d+)\s*(min|mins|minute|minutes|hr|hrs|hour|hours|day|days|week|weeks|month|months|year|years)\s*ago$/,
  );
  if (match) {
    const n = Number(match[1]);
    const unit = match[2];
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (unit.startsWith('min')) return n * minute;
    if (unit.startsWith('hr') || unit.startsWith('hour')) return n * hour;
    if (unit.startsWith('day')) return n * day;
    if (unit.startsWith('week')) return n * 7 * day;
    if (unit.startsWith('month')) return n * 30 * day;
    if (unit.startsWith('year')) return n * 365 * day;
  }

  const asDate = Date.parse(value);
  if (!Number.isNaN(asDate)) {
    return Math.max(0, Date.now() - asDate);
  }

  return Number.POSITIVE_INFINITY;
}

function toComparable(
  value: string | number | null | undefined,
  kind: SortKind,
): string | number {
  if (value == null || value === '') {
    return kind === 'text' ? '' : Number.NEGATIVE_INFINITY;
  }

  if (kind === 'number') {
    if (typeof value === 'number') return value;
    const n = Number(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
  }

  if (kind === 'relativeTime') {
    // Negate age so "desc" = newest first (larger timestamp-like value)
    return -relativeTimeToAgeMs(String(value));
  }

  if (kind === 'date') {
    if (typeof value === 'number') return value;
    const parsed = Date.parse(String(value));
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
  }

  return String(value).toLocaleLowerCase();
}

function compareValues(
  a: string | number,
  b: string | number,
  direction: SortDirection,
): number {
  let result = 0;
  if (typeof a === 'number' && typeof b === 'number') {
    result = a - b;
  } else {
    result = String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }
  return direction === 'asc' ? result : -result;
}

/**
 * Sort a copy of `items` by the active column config.
 * Stable: equal keys keep original order.
 */
export function applySort<T, K extends string>(
  items: T[],
  sort: SortState<K>,
  columns: SortColumnConfig<T, K>,
): T[] {
  if (!sort) return items;
  const config = columns[sort.column];
  if (!config) return items;
  const kind = config.kind ?? 'text';

  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const av = toComparable(config.getValue(a.item), kind);
      const bv = toComparable(config.getValue(b.item), kind);
      const result = compareValues(av, bv, sort.direction);
      return result !== 0 ? result : a.index - b.index;
    })
    .map(({ item }) => item);
}
