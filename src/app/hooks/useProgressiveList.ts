import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

interface UseProgressiveListOptions {
  initialBatch?: number;
  batchSize?: number;
  intervalMs?: number;
  minLoadingMs?: number;
  transitionKey?: string | number;
  isFetching?: boolean;
}

export function useProgressiveList<T>(
  items: T[],
  options: UseProgressiveListOptions = {}
) {
  const {
    initialBatch = 20,
    batchSize = 20,
    intervalMs = 16,
    minLoadingMs = 0,
    transitionKey,
    isFetching = false,
  } = options;
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [isMinimumLoading, setIsMinimumLoading] = useState(false);
  const previousTransitionKeyRef = useRef<string | number | undefined>(transitionKey);

  useEffect(() => {
    if (items.length <= initialBatch) {
      setVisibleCount(items.length);
      return;
    }

    let isCancelled = false;
    let timerId = 0;
    setVisibleCount(initialBatch);

    const growBatch = () => {
      setVisibleCount((previousCount) => {
        const nextCount = Math.min(previousCount + batchSize, items.length);

        if (!isCancelled && nextCount < items.length) {
          timerId = window.setTimeout(growBatch, intervalMs);
        }

        return nextCount;
      });
    };

    timerId = window.setTimeout(growBatch, intervalMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timerId);
    };
  }, [items.length, transitionKey, initialBatch, batchSize, intervalMs]);

  useLayoutEffect(() => {
    const hasItems = items.length > 0;

    if (previousTransitionKeyRef.current === transitionKey) {
      return;
    }
    previousTransitionKeyRef.current = transitionKey;

    if (!hasItems || minLoadingMs <= 0) {
      setIsMinimumLoading(false);
      return;
    }

    setIsMinimumLoading(true);
    const minimumLoadingTimerId = window.setTimeout(() => {
      setIsMinimumLoading(false);
    }, minLoadingMs);

    return () => {
      window.clearTimeout(minimumLoadingTimerId);
    };
  }, [transitionKey, minLoadingMs, items.length]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  return {
    visibleItems,
    isProgressivelyLoading: isFetching || isMinimumLoading || visibleCount < items.length,
  };
}
