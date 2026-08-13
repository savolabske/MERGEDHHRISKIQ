import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getActiveInterests,
  INTERESTS_CHANGED_EVENT,
  type ManagedInterest,
} from '../../data/interestsAdminMock';
import {
  applyUserInterestsAndCustomizeHome,
  loadUserInterestIds,
  ONBOARDING_MAX_INTERESTS,
} from '../../data/userOnboarding';
import { CURRENT_USER } from '../../utils/mockUsers';
import { InterestPickerStep } from './InterestPickerStep';
import { OnboardingCustomizeOverlay } from './OnboardingCustomizeOverlay';

type OnboardingPhase = 'select' | 'customizing' | 'revealing';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [interests, setInterests] = useState<ManagedInterest[]>(() => getActiveInterests());
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const existing = loadUserInterestIds();
    const activeIds = new Set(getActiveInterests().map((item) => item.id));
    return existing.filter((id) => activeIds.has(id)).slice(0, ONBOARDING_MAX_INTERESTS);
  });
  const [phase, setPhase] = useState<OnboardingPhase>('select');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const refresh = () => setInterests(getActiveInterests());
    window.addEventListener(INTERESTS_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener(INTERESTS_CHANGED_EVENT, refresh);
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const firstName = useMemo(() => CURRENT_USER.name.split(' ')[0] ?? '', []);

  const selectedLabels = useMemo(
    () =>
      selectedIds
        .map((id) => interests.find((item) => item.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [selectedIds, interests],
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= ONBOARDING_MAX_INTERESTS) return prev;
      return [...prev, id];
    });
  };

  const startCustomization = (ids: string[]) => {
    if (ids.length === 0) return;
    setSelectedIds(ids);
    setPhase('customizing');

    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [
      window.setTimeout(() => {
        applyUserInterestsAndCustomizeHome(ids);
      }, 400),
      window.setTimeout(() => setPhase('revealing'), 2400),
      window.setTimeout(() => onComplete(), 3100),
    ];
  };

  const handleContinue = () => startCustomization(selectedIds);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F7F8FA]">
      {/* Atmospheric background — product-native, not purple/cream AI defaults */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 60% at 10% -10%, rgba(36,99,235,0.09), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 0%, rgba(14,165,233,0.07), transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(5,150,105,0.05), transparent 55%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(26,31,43,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(26,31,43,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)',
          }}
        />
      </div>

      {phase === 'select' ? (
        <InterestPickerStep
          firstName={firstName}
          interests={interests}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onContinue={handleContinue}
        />
      ) : (
        <>
          {/* Faint preview of the picker behind the overlay for continuity */}
          <div className="pointer-events-none opacity-40" aria-hidden>
            <InterestPickerStep
              firstName={firstName}
              interests={interests}
              selectedIds={selectedIds}
              onToggle={() => {}}
              onContinue={() => {}}
            />
          </div>
          <OnboardingCustomizeOverlay
            interestLabels={selectedLabels}
            phase={phase === 'revealing' ? 'revealing' : 'customizing'}
          />
        </>
      )}
    </div>
  );
}
