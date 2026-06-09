import React, { useMemo } from 'react';
import { parseDisplayValue } from './parseDisplayValue';
import { useAnimateOnView } from './useAnimateOnView';
import { useCountUp } from './useCountUp';

interface AnimatedStatProps {
  value: string;
  raw?: number;
  className?: string;
  active?: boolean;
}

export function AnimatedStat({ value, raw, className = '', active }: AnimatedStatProps) {
  const { ref, inView } = useAnimateOnView({ disabled: active !== undefined });
  const isActive = active ?? inView;

  const parsed = useMemo(() => parseDisplayValue(value, raw), [value, raw]);
  const formatFn = useMemo(
    () => (parsed.kind === 'numeric' ? parsed.format : () => value),
    [parsed, value]
  );
  const target = parsed.kind === 'numeric' ? parsed.target : 0;

  const display = useCountUp(target, isActive && parsed.kind === 'numeric', formatFn);

  if (parsed.kind === 'text') {
    return (
      <span ref={ref as React.RefCallback<HTMLSpanElement>} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref as React.RefCallback<HTMLSpanElement>} className={className}>
      {display}
    </span>
  );
}
