import { Button } from './button';
import {
  brandHomeButtonClass,
  chipButtonClass,
  chipRemoveClass,
  filterTriggerClass,
  iconButtonClass,
  iconButtonSmClass,
  interactiveCardProps,
  interactiveSurfaceClass,
  listFilterTriggerClass,
  menuItemClass,
  outlineControlClass,
  paginationControlClass,
  segmentPillClass,
  selectTriggerClass,
  textLinkActionClass,
} from './interaction';
import { cn } from './utils';
import { Bell, X } from 'lucide-react';

/**
 * Visual reference for shared interaction recipes.
 * Not routed in the app — import in Storybook/Canvas or review in isolation.
 */
export function InteractionShowcase() {
  return (
    <div className="space-y-8 p-8 bg-background text-foreground max-w-3xl">
      <header className="space-y-1">
        <h1 className="text-page-title">Interaction recipes</h1>
        <p className="text-sm text-muted-foreground">
          Hover, focus (Tab), and press each control. Prefer these over ad-hoc Tailwind.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-section-title">Button</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="icon" variant="ghost" aria-label="Icon">
            <Bell size={18} />
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title">Icon buttons</h2>
        <div className="flex items-center gap-2">
          <button type="button" className={iconButtonClass} aria-label="Notifications">
            <Bell size={20} />
          </button>
          <button type="button" className={iconButtonSmClass} aria-label="Close sm">
            <X size={16} />
          </button>
          <button type="button" className={chipRemoveClass} aria-label="Remove chip">
            <X size={12} />
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title">Chips &amp; filters</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={chipButtonClass}>
            Suggestion chip
          </button>
          <button
            type="button"
            className={filterTriggerClass(false, 'border-border bg-card text-foreground', 'border-primary bg-primary-subtle text-primary')}
          >
            Filter idle
          </button>
          <button
            type="button"
            className={filterTriggerClass(true, 'border-border bg-card text-foreground', 'border-primary bg-primary-subtle text-primary')}
          >
            Filter active
          </button>
          <button type="button" className={cn(textLinkActionClass, 'text-primary-text')}>
            Clear Filters
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title">List chrome</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={listFilterTriggerClass}>
            All Resources
          </button>
          <button type="button" className={selectTriggerClass}>
            All Locations
          </button>
          <button type="button" className={cn(menuItemClass, 'w-auto rounded-lg border border-border px-3')}>
            Menu item
          </button>
          <button type="button" className={paginationControlClass} aria-label="Previous page">
            ‹
          </button>
          <button
            type="button"
            className={cn(paginationControlClass, 'min-w-8 h-8 bg-primary text-white hover:bg-primary-hover hover:text-white')}
          >
            1
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title">Outline &amp; brand</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={cn(outlineControlClass, 'border-border text-primary')}>
            Back
          </button>
          <button type="button" className={brandHomeButtonClass}>
            <span className="block text-sm font-semibold tracking-tight text-primary uppercase">
              HUMANITY HUB
            </span>
          </button>
          <div className="flex items-center bg-muted border border-border rounded-lg p-0.5">
            <button type="button" className={cn(segmentPillClass.base, segmentPillClass.idle)}>
              Today
            </button>
            <button type="button" className={cn(segmentPillClass.base, segmentPillClass.active)}>
              This week
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title">Interactive surfaces</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={cn('rounded-2xl border border-border bg-card p-5 text-left', interactiveSurfaceClass.white)}
            {...interactiveCardProps}
          >
            <p className="text-sm font-semibold">White card</p>
            <p className="text-xs text-muted-foreground mt-1">Hover for border + shadow</p>
          </button>
          <button
            type="button"
            className={cn(
              'rounded-2xl border border-white/20 p-5 text-left text-white bg-gradient-to-br from-primary to-chart-2',
              interactiveSurfaceClass.gradient,
            )}
            {...interactiveCardProps}
          >
            <p className="text-sm font-semibold">Gradient card</p>
            <p className="text-xs text-white/80 mt-1">Hover for brightness</p>
          </button>
        </div>
      </section>
    </div>
  );
}
