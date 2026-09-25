'use client';

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { cn } from './utils';
import {
  SORT_OPTION_LABELS,
  type SortDirection,
  type SortKind,
  type SortState,
} from '../../lib/table-sort';

interface SortableHeaderProps<K extends string = string> {
  label: string;
  column: K;
  kind?: SortKind;
  sort: SortState<K>;
  onSortChange: (next: SortState<K>) => void;
  className?: string;
  align?: 'left' | 'right';
  /** Wrap in a native <th> for real HTML tables */
  as?: 'button' | 'th';
}

function SortCarets({ direction }: { direction: SortDirection | null }) {
  return (
    <span className="inline-flex flex-col items-center -space-y-1 shrink-0" aria-hidden>
      <ChevronUp
        className={cn(
          'size-3',
          direction === 'asc' ? 'text-primary' : 'text-muted-foreground/45',
        )}
        strokeWidth={direction === 'asc' ? 2.75 : 2}
      />
      <ChevronDown
        className={cn(
          'size-3',
          direction === 'desc' ? 'text-primary' : 'text-muted-foreground/45',
        )}
        strokeWidth={direction === 'desc' ? 2.75 : 2}
      />
    </span>
  );
}

export function SortableHeader<K extends string = string>({
  label,
  column,
  kind = 'text',
  sort,
  onSortChange,
  className,
  align = 'left',
  as = 'button',
}: SortableHeaderProps<K>) {
  const isActive = sort?.column === column;
  const direction = isActive ? sort.direction : null;
  const labels = SORT_OPTION_LABELS[kind];

  const trigger = (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className={cn(
          'table-header-label inline-flex items-center gap-1.5 rounded-md -mx-1 px-1 py-0.5 transition-colors',
          'hover:text-foreground hover:bg-muted/80',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'data-[state=open]:bg-muted/80 data-[state=open]:text-foreground',
          align === 'right' && 'flex-row-reverse ml-auto',
          isActive && 'text-foreground',
          className,
        )}
        aria-sort={
          !isActive ? 'none' : direction === 'asc' ? 'ascending' : 'descending'
        }
      >
        <span>{label}</span>
        <SortCarets direction={direction} />
      </button>
    </DropdownMenuTrigger>
  );

  const menu = (
    <DropdownMenuContent
      align={align === 'right' ? 'end' : 'start'}
      sideOffset={6}
      className="w-44"
    >
      <DropdownMenuItem
        className="justify-between gap-2"
        onClick={() => onSortChange({ column, direction: 'asc' })}
      >
        <span>{labels.asc}</span>
        {direction === 'asc' && <Check className="size-3.5 text-primary" />}
      </DropdownMenuItem>
      <DropdownMenuItem
        className="justify-between gap-2"
        onClick={() => onSortChange({ column, direction: 'desc' })}
      >
        <span>{labels.desc}</span>
        {direction === 'desc' && <Check className="size-3.5 text-primary" />}
      </DropdownMenuItem>
      {isActive && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-muted-foreground"
            onClick={() => onSortChange(null)}
          >
            Clear sort
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );

  if (as === 'th') {
    return (
      <th
        className={cn(
          'text-left px-6 py-3',
          align === 'right' && 'text-right',
        )}
        aria-sort={
          !isActive ? 'none' : direction === 'asc' ? 'ascending' : 'descending'
        }
      >
        <DropdownMenu>
          {trigger}
          {menu}
        </DropdownMenu>
      </th>
    );
  }

  return (
    <DropdownMenu>
      {trigger}
      {menu}
    </DropdownMenu>
  );
}
