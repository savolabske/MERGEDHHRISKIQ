import type { ReactNode } from 'react';
import { cn } from './utils';

/** Main-column card headings — Description, Files, Causes/Effects (14px / semibold) */
export function DetailSectionTitle({
  children,
  className = 'mb-3',
  as: Component = 'p',
}: {
  children: ReactNode;
  className?: string;
  as?: 'p' | 'h2' | 'h3';
}) {
  return <Component className={cn('detail-section-title', className)}>{children}</Component>;
}

/** Sidebar metadata labels — Available in, Tags, Created (14px / semibold) */
export function DetailFieldLabel({
  children,
  className = 'mb-3',
  as: Component = 'p',
}: {
  children: ReactNode;
  className?: string;
  as?: 'p' | 'h3' | 'label';
}) {
  return <Component className={cn('detail-field-label', className)}>{children}</Component>;
}

/** Muted placeholder for empty optional fields on detail views */
export function DetailEmptyValue({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

/** @deprecated Use DetailSectionTitle or DetailFieldLabel */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <DetailSectionTitle>{children}</DetailSectionTitle>;
}
