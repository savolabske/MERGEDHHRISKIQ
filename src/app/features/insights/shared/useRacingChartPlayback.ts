import { useCallback, useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '../../../components/reports/reportMotion';

export const FRAME_DURATION_MS = 600;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return prefersReducedMotion;
}

export function useRacingChartPlayback(frameCount: number, rowsKey: string) {
  const { ref, inView } = useInViewOnce(0.12, '0px 0px -8% 0px');
  const prefersReducedMotion = usePrefersReducedMotion();
  const lastFrame = Math.max(0, frameCount - 1);

  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRowsKeyRef = useRef(rowsKey);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (prevRowsKeyRef.current === rowsKey) return;
    prevRowsKeyRef.current = rowsKey;
    clearTimer();
    setFrame(0);
    setHasCompleted(false);
    setIsPlaying(inView && !prefersReducedMotion);
  }, [rowsKey, inView, prefersReducedMotion, clearTimer]);

  useEffect(() => {
    if (!inView || prefersReducedMotion || frameCount === 0) return;
    setIsPlaying(true);
  }, [inView, prefersReducedMotion, frameCount]);

  useEffect(() => {
    if (prefersReducedMotion && frameCount > 0) {
      clearTimer();
      setFrame(lastFrame);
      setIsPlaying(false);
      setHasCompleted(true);
    }
  }, [prefersReducedMotion, frameCount, lastFrame, clearTimer]);

  useEffect(() => {
    clearTimer();
    if (!isPlaying || frameCount === 0) return;

    if (frame >= lastFrame) {
      setIsPlaying(false);
      setHasCompleted(true);
      return;
    }

    timerRef.current = setTimeout(() => {
      setFrame((current) => Math.min(current + 1, lastFrame));
    }, FRAME_DURATION_MS);

    return clearTimer;
  }, [isPlaying, frame, lastFrame, frameCount, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const togglePlay = useCallback(() => {
    if (frameCount === 0) return;

    setIsPlaying((playing) => {
      if (playing) return false;

      if (frame >= lastFrame) {
        setFrame(0);
        setHasCompleted(false);
      }
      return true;
    });
  }, [frame, lastFrame, frameCount]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const scrubTo = useCallback(
    (nextFrame: number) => {
      clearTimer();
      setIsPlaying(false);
      setHasCompleted(nextFrame >= lastFrame);
      setFrame(Math.max(0, Math.min(nextFrame, lastFrame)));
    },
    [clearTimer, lastFrame]
  );

  return {
    ref,
    frame,
    isPlaying,
    hasCompleted,
    togglePlay,
    pause,
    scrubTo,
    lastFrame,
  };
}
