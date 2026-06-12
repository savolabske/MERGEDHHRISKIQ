export type GridTableDensity = 'compact' | 'standard' | 'entity' | 'narrative';

export const checkboxInputClass =
  'size-4 shrink-0 rounded border-checkbox-unchecked text-primary focus:ring-ring focus:ring-offset-0 cursor-pointer';

export const gridTableHeaderClass =
  'data-grid-header bg-muted/70 border-b border-border text-xs leading-4 font-semibold text-muted-foreground';

export const gridTableRowClass: Record<GridTableDensity, string> = {
  compact:
    'data-grid-row min-h-10 border-b border-border px-3 py-2 text-sm leading-5 transition-colors duration-150 hover:bg-surface-row-hover',
  standard:
    'data-grid-row min-h-12 border-b border-border px-4 py-2.5 text-sm leading-5 transition-colors duration-150 hover:bg-surface-row-hover',
  entity:
    'data-grid-row min-h-14 border-b border-border px-4 py-3 text-sm leading-5 transition-colors duration-150 hover:bg-surface-row-hover',
  narrative:
    'data-grid-row min-h-[68px] border-b border-border px-4 py-3.5 text-sm leading-5 transition-colors duration-150 hover:bg-surface-row-hover',
};

export const tableText = {
  header: 'text-xs leading-4 font-semibold text-muted-foreground',
  primary: 'text-sm leading-5 font-medium text-foreground',
  value: 'text-sm leading-5 font-normal text-foreground',
  supporting: 'text-[13px] leading-[18px] font-normal text-muted-foreground',
  metadata: 'text-xs leading-4 font-normal text-text-subtle',
  numeric: 'text-sm leading-5 font-medium text-foreground tabular-nums whitespace-nowrap',
  badge: 'text-xs leading-4 font-medium',
  mobileLabel: 'text-xs leading-4 font-semibold text-muted-foreground',
  action: 'text-right whitespace-nowrap',
} as const;
