import { useEffect, useState } from 'react';
import { APP_VERSION } from '../data/releases';

const STORAGE_KEY = 'hh:last-seen-release';

function readHasUnseen() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== APP_VERSION;
  } catch {
    return false;
  }
}

export function markReleaseSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
  } catch {
    /* storage unavailable */
  }
}

/** True until the user opens the Changelog page for the current version. */
export function useUnseenRelease() {
  const [hasUnseen, setHasUnseen] = useState(readHasUnseen);

  useEffect(() => {
    // Changelog opens in a new tab, so listen for the write from that tab.
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setHasUnseen(readHasUnseen());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const markSeen = () => {
    markReleaseSeen();
    setHasUnseen(false);
  };

  return [hasUnseen, markSeen] as const;
}
