import { useEffect, useState } from 'react';

export const REPORT_MOBILE_BREAKPOINT = 1024;

function readIsBelowLg(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${REPORT_MOBILE_BREAKPOINT - 1}px)`).matches;
}

export function useIsBelowLg() {
  const [isBelowLg, setIsBelowLg] = useState(readIsBelowLg);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${REPORT_MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsBelowLg(mql.matches);
    mql.addEventListener('change', onChange);
    onChange();
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isBelowLg;
}
