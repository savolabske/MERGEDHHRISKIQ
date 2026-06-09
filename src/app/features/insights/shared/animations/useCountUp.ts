import { useEffect, useState } from 'react';
import { easeOut } from './motionPrefs';
import { getPrefersReducedMotion } from './motionPrefs';

const COUNT_UP_DURATION_MS = 800;

export function useCountUp(
  target: number,
  active: boolean,
  format: (n: number) => string,
  duration = COUNT_UP_DURATION_MS
): string {
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    if (!active) {
      setDisplay(format(0));
      return;
    }

    if (getPrefersReducedMotion()) {
      setDisplay(format(target));
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOut(progress);
      setDisplay(format(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, format, duration]);

  return display;
}
