import * as React from 'react';
import { cn } from './utils';

export interface PageBreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageBreadcrumbProps {
  items: PageBreadcrumbItem[];
  suffix?: React.ReactNode;
  className?: string;
}

export function PageBreadcrumb({ items, suffix, className }: PageBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex flex-wrap items-center gap-2', className)}>
      <ol className="flex flex-wrap items-center gap-2 text-[14px] leading-[22px] font-medium text-[#64748B]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {isLast || !item.onClick ? (
                <span className="text-[#334155]">{item.label}</span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-[#64748B] transition-colors hover:text-[#334155]"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {suffix}
    </nav>
  );
}
