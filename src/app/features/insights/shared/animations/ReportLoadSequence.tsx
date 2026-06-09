import React, { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './motionPrefs';

/** Delay between each staged reveal step. */
export const REPORT_LOAD_STAGGER_MS = 200;

/** Shared order slots so pages reveal top → bottom consistently. */
export const REPORT_LOAD_ORDER = {
  breadcrumb: 0,
  title: 1,
  filters: 2,
  kpis: 3,
  chat: 4,
  scene: (index: number) => 5 + index,
  forwardLook: (sceneCount: number) => 5 + sceneCount,
} as const;

interface ReportLoadItemProps extends React.HTMLAttributes<HTMLDivElement> {
  order: number;
  children: React.ReactNode;
}

export function ReportLoadItem({
  order,
  children,
  className = '',
  style,
  ...rest
}: ReportLoadItemProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className={`${reduced ? '' : 'report-load-item'} ${className}`.trim()}
      style={
        reduced
          ? style
          : { animationDelay: `${order * REPORT_LOAD_STAGGER_MS}ms`, ...style }
      }
      {...rest}
    >
      {children}
    </div>
  );
}

interface ReportLoadDeferredProps extends React.HTMLAttributes<HTMLDivElement> {
  order: number;
  children: React.ReactNode;
  minHeight?: string | number;
}

/** Mounts children only when their turn in the load sequence arrives (lazy below-fold content). */
export function ReportLoadDeferred({
  order,
  children,
  className = '',
  minHeight,
  style,
  ...rest
}: ReportLoadDeferredProps) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(
      () => setMounted(true),
      order * REPORT_LOAD_STAGGER_MS,
    );
    return () => window.clearTimeout(timer);
  }, [order, reduced]);

  if (!mounted) {
    if (minHeight == null) return null;
    return (
      <div
        className={className}
        style={{ minHeight, ...style }}
        aria-hidden
        {...rest}
      />
    );
  }

  return (
    <ReportLoadItem order={0} className={className} style={style} {...rest}>
      {children}
    </ReportLoadItem>
  );
}
