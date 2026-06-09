import React from 'react';
import { useAnimateOnView } from './useAnimateOnView';
import { usePrefersReducedMotion } from './motionPrefs';

interface AnimatedNarrativeProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedNarrative({ children, className = '' }: AnimatedNarrativeProps) {
  const { ref, inView } = useAnimateOnView();
  const reduced = usePrefersReducedMotion();
  const visible = inView || reduced;

  return (
    <article
      ref={ref as React.RefCallback<HTMLElement>}
      className={`report-animate-narrative transition ${visible ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </article>
  );
}
