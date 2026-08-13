import { Check } from 'lucide-react';
import type { ManagedInterest } from '../../data/interestsAdminMock';
import {
  ONBOARDING_MAX_INTERESTS,
  ONBOARDING_MIN_INTERESTS,
} from '../../data/userOnboarding';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { INTEREST_ICONS } from './interestIcons';

interface InterestPickerStepProps {
  firstName: string;
  interests: ManagedInterest[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}

export function InterestPickerStep({
  firstName,
  interests,
  selectedIds,
  onToggle,
  onContinue,
}: InterestPickerStepProps) {
  const selectedCount = selectedIds.length;
  const canContinue = selectedCount >= ONBOARDING_MIN_INTERESTS;
  const atMax = selectedCount >= ONBOARDING_MAX_INTERESTS;

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 max-w-xl sm:mb-10">
        <p className="label-caps text-primary-text mb-3">Welcome{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="text-[1.75rem] sm:text-[2rem] font-semibold tracking-tight text-foreground leading-tight">
          What should your home focus on?
        </h1>
        <p className="mt-3 text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-lg">
          We’ll shape your home around the interests you select. You can refine them later.
        </p>
      </header>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        role="group"
        aria-label="Select your interests"
      >
        {interests.map((interest, index) => {
          const selected = selectedIds.includes(interest.id);
          const Icon = INTEREST_ICONS[interest.iconKey];
          const disabled = !selected && atMax;

          return (
            <button
              key={interest.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(interest.id)}
              aria-pressed={selected}
              className={cn(
                'group relative rounded-xl border px-4 py-4 text-left transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20',
                selected
                  ? 'border-primary bg-primary-subtle/40 shadow-[0_0_0_1px_var(--primary)]'
                  : 'border-border bg-card/80 hover:border-primary-border hover:bg-card',
                disabled && 'cursor-not-allowed opacity-45 hover:border-border hover:bg-card/80',
              )}
              style={{
                animationDelay: `${index * 40}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                    selected ? 'text-white' : 'bg-muted text-foreground',
                  )}
                  style={
                    selected
                      ? { backgroundColor: interest.accent }
                      : { color: interest.accent }
                  }
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 pr-7">
                  <p className="text-sm font-semibold text-foreground tracking-tight">
                    {interest.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-snug">
                    {interest.description}
                  </p>
                </div>
                <span
                  className={cn(
                    'absolute right-3.5 top-3.5 inline-flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
                    selected
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-transparent',
                  )}
                  aria-hidden
                >
                  <Check size={12} strokeWidth={3} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:mt-10 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <p className="text-xs text-muted-foreground tabular-nums sm:text-right">
          {selectedCount === 0
            ? `Select at least ${ONBOARDING_MIN_INTERESTS}`
            : `${selectedCount} of ${ONBOARDING_MAX_INTERESTS} selected`}
        </p>
        <Button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="h-11 min-w-[160px] rounded-xl"
        >
          Personalize my home
        </Button>
      </div>
    </div>
  );
}
