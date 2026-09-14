import { Moon, Sun } from 'lucide-react';
import { cn } from '../ui/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import type { MapBasemapTheme } from '../../config/mapbox';

type MapBasemapToggleProps = {
  theme: MapBasemapTheme;
  onChange: (theme: MapBasemapTheme) => void;
  className?: string;
};

const OPTIONS: {
  id: MapBasemapTheme;
  label: string;
  description: string;
  Icon: typeof Moon;
}[] = [
  {
    id: 'dark',
    label: 'Dark map',
    description: 'Dark background — the default. Best for seeing data layers and alerts.',
    Icon: Moon,
  },
  {
    id: 'light',
    label: 'Light map',
    description: 'Light background — easier to read place names and roads.',
    Icon: Sun,
  },
];

export function MapBasemapToggle({ theme, onChange, className }: MapBasemapToggleProps) {
  return (
    <div
      role="group"
      aria-label="Map color scheme"
      className={cn(
        'pointer-events-auto inline-flex items-center rounded-xl border border-[#1E293B]/90 bg-[#0F172A]/92 p-0.5 shadow-lg backdrop-blur-md',
        className,
      )}
    >
      {OPTIONS.map(({ id, label, description, Icon }) => {
        const active = theme === id;
        return (
          <HoverCard key={id} openDelay={120} closeDelay={60}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-label={label}
                aria-pressed={active}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-[10px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50',
                  active
                    ? 'bg-[#1E293B] text-[#F8FAFC] shadow-sm'
                    : 'text-[#64748B] hover:bg-[#1E293B]/60 hover:text-[#E2E8F0]',
                )}
              >
                <Icon size={15} strokeWidth={2} aria-hidden />
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              side="bottom"
              align="center"
              sideOffset={8}
              className="w-[200px] rounded-xl border-[#1E293B] bg-[#0F172A] p-3 text-[#E2E8F0] shadow-xl"
            >
              <p className="text-[0.8125rem] font-semibold tracking-tight text-white">{label}</p>
              <p className="mt-1 text-[0.6875rem] leading-snug text-[#94A3B8]">{description}</p>
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}
