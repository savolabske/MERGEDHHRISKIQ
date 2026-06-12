import { useCallback, useEffect, useRef, useState } from 'react';
import { getPrefersReducedMotion } from './motionPrefs';

const LOAD_IN_VIEW_DELAY_MS = 300;
const DEFAULT_THRESHOLD = 0.12;

function isInViewport(el: HTMLElement, scrollRoot?: HTMLElement | null): boolean {
  const rect = el.getBoundingClientRect();
  if (!scrollRoot) {
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
  const rootRect = scrollRoot.getBoundingClientRect();
  return rect.top < rootRect.bottom && rect.bottom > rootRect.top;
}

export function useAnimateOnView(options?: {
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}) {
  const { threshold = DEFAULT_THRESHOLD, rootMargin = '0px', disabled = false } = options ?? {};
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const triggeredRef = useRef(false);

  const trigger = useCallback(() => {
    const el = element;
    if (!el || triggeredRef.current) return;
    if (el.dataset.animated === 'true') {
      triggeredRef.current = true;
      setInView(true);
      return;
    }
    triggeredRef.current = true;
    el.dataset.animated = 'true';
    setInView(true);
  }, [element]);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (disabled) {
      trigger();
      return;
    }

    if (!element) return;

    if (element.dataset.animated === 'true') {
      triggeredRef.current = true;
      setInView(true);
      return;
    }

    if (getPrefersReducedMotion()) {
      trigger();
      return;
    }

    const scrollRoot = element.closest('[data-report-scroll]') as HTMLElement | null;

    if (isInViewport(element, scrollRoot)) {
      const loadTimer = window.setTimeout(trigger, LOAD_IN_VIEW_DELAY_MS);
      return () => window.clearTimeout(loadTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trigger();
          observer.disconnect();
        }
      },
      { threshold, rootMargin, root: scrollRoot },
    );
    observer.observe(element);

    const onScroll = () => {
      if (triggeredRef.current) return;
      if (isInViewport(element, scrollRoot)) {
        trigger();
        observer.disconnect();
      }
    };

    const scrollTarget = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener('scroll', onScroll);
    };
  }, [disabled, element, threshold, rootMargin, trigger]);

  return { ref, inView, trigger };
}
