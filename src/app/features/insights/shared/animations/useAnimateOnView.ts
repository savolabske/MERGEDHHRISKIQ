import { useCallback, useEffect, useRef, useState } from 'react';
import { getPrefersReducedMotion } from './motionPrefs';

const LOAD_IN_VIEW_DELAY_MS = 300;
const DEFAULT_THRESHOLD = 0.12;

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
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

    if (isInViewport(element)) {
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
      { threshold, rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [disabled, element, threshold, rootMargin, trigger]);

  return { ref, inView, trigger };
}
