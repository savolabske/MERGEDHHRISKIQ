import { type ReactNode } from 'react';
import { cn } from './ui/utils';
import { PageFooter } from './PageFooter';

const MAX_WIDTH_CLASS = {
  '1400': 'max-w-[1400px] mx-auto',
  '1280': 'max-w-[1280px] mx-auto',
  none: '',
} as const;

type PageScrollShellProps = {
  children: ReactNode;
  className?: string;
  paddingClassName?: string;
  innerClassName?: string;
  showFooter?: boolean;
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
};

export function PageScrollShell({
  children,
  className,
  paddingClassName = 'px-4 sm:px-8 pt-6',
  innerClassName,
  showFooter = true,
  maxWidth = '1400',
}: PageScrollShellProps) {
  return (
    <div className={cn('h-full flex flex-col bg-background overflow-hidden', className)}>
      <div className="flex-1 overflow-y-auto">
        <div className={paddingClassName}>
          <div className={cn(MAX_WIDTH_CLASS[maxWidth], innerClassName)}>
            {children}
            {showFooter && <PageFooter />}
          </div>
        </div>
      </div>
    </div>
  );
}
