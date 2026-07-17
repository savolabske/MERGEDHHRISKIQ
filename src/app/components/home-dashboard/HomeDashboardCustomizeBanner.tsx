import { Info } from 'lucide-react';

interface DashboardCustomizeBannerProps {
  title?: string;
}

export function DashboardCustomizeBanner({
  title = 'Customize your home view',
}: DashboardCustomizeBannerProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-dotted border-primary/40 bg-primary-subtle/40 px-5 py-3.5"
    >
      <Info size={16} className="shrink-0 mt-0.5 text-primary" aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
          Each highlighted section is powered by an AI prompt. Click{' '}
          <span className="font-medium text-foreground">Edit</span> to customize what it
          shows. Changes are visible only to you.
        </p>
      </div>
    </div>
  );
}

/** @deprecated Use DashboardCustomizeBanner */
export const HomeDashboardCustomizeBanner = DashboardCustomizeBanner;
