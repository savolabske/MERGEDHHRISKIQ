import { useLayoutEffect, type RefObject } from 'react';

/** Grows a textarea with its content up to `maxHeight`, then scrolls. */
export function useAutoResizeTextarea(
  ref: RefObject<HTMLTextAreaElement | null> | undefined,
  value: string,
  maxHeight = 200,
) {
  useLayoutEffect(() => {
    const el = ref?.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [ref, value, maxHeight]);
}
