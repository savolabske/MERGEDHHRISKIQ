import React from 'react';
import { usePrefersReducedMotion } from './motionPrefs';

interface AnimatedAIResponseProps {
  children: React.ReactNode;
  className?: string;
  messageKey?: string;
  animate?: boolean;
}

export function AnimatedAIResponse({
  children,
  className = '',
  animate = true,
}: AnimatedAIResponseProps) {
  const reduced = usePrefersReducedMotion();
  const shouldAnimate = animate && !reduced;

  return (
    <div className={`${shouldAnimate ? 'report-animate-ai' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}
