import { useMemo, useState } from 'react';
import {
  applySort,
  type SortColumnConfig,
  type SortState,
} from '../lib/table-sort';

export function useTableSort<T, K extends string>(
  items: T[],
  columns: SortColumnConfig<T, K>,
  initial: SortState<K> = null,
) {
  const [sort, setSort] = useState<SortState<K>>(initial);

  const sortedItems = useMemo(
    () => applySort(items, sort, columns),
    [items, sort, columns],
  );

  return { sort, setSort, sortedItems };
}
