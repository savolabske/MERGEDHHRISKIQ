import { useEffect, useState } from 'react';

/**
 * Pixels of the layout viewport covered by the on-screen keyboard (or other
 * visual-viewport shrinkage). Use as `bottom` on fixed docks/sheets so the
 * composer stays above the keyboard on iOS/Android.
 */
function readKeyboardBottomInset(): number {
  if (typeof window === 'undefined') return 0;
  const vv = window.visualViewport;
  if (!vv) return 0;
  const inset = Math.round(window.innerHeight - vv.height - vv.offsetTop);
  return Math.max(0, inset);
}

export function useKeyboardBottomInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = readKeyboardBottomInset();
        setInset((prev) => (prev === next ? prev : next));
      });
    };

    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);

    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return inset;
}
