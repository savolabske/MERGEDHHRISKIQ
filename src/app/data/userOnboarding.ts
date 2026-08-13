import {
  type HomeDashboardPromptPrefs,
  type HomeDashboardSectionId,
  HUB_DASHBOARD_SECTIONS,
  saveHomeDashboardPrompts,
} from './homeDashboardCustomize';
import {
  getActiveInterests,
  getInterestById,
  type ManagedInterest,
} from './interestsAdminMock';

export const ONBOARDING_COMPLETE_KEY = 'hh.onboardingComplete';
export const USER_INTERESTS_KEY = 'hh.userInterests';
export const USER_INTERESTS_CHANGED_EVENT = 'hh:user-interests-changed';

export const ONBOARDING_MIN_INTERESTS = 1;
export const ONBOARDING_MAX_INTERESTS = 4;

const SECTION_LENSES: Record<HomeDashboardSectionId, string> = {
  'main-insight':
    'For the main insight: summarize the single most urgent development. Lead with the headline number, name affected regions, and close with what decision-makers should watch next.',
  'emerging-insights':
    'For emerging insights: surface the top flagged signals with the highest operational urgency.',
  'predictive-insights':
    'For predictive insights: forecast risks for the next 30 days — state likely triggers, affected population or geography, and the earliest decision points.',
};

export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearOnboardingCompleteFlag(): void {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

export function resetOnboardingState(): void {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    localStorage.removeItem(USER_INTERESTS_KEY);
  } catch {
    /* ignore */
  }
}

export function loadUserInterestIds(): string[] {
  try {
    const raw = localStorage.getItem(USER_INTERESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function notifyUserInterestsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(USER_INTERESTS_CHANGED_EVENT));
}

export function saveUserInterestIds(ids: string[]): void {
  try {
    localStorage.setItem(USER_INTERESTS_KEY, JSON.stringify(ids));
    notifyUserInterestsChanged();
  } catch {
    /* ignore */
  }
}

function joinFocusAreas(names: string[]): string {
  if (names.length === 0) return 'humanitarian operations';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function combineInterestPrompts(interests: ManagedInterest[]): string {
  if (interests.length === 0) return '';
  if (interests.length === 1) return interests[0].prompt.trim();

  const focus = joinFocusAreas(interests.map((i) => i.name.toLowerCase()));
  const joined = interests
    .map((i) => i.prompt.trim())
    .filter(Boolean)
    .join(' ');

  return `${joined} Prioritize themes the user selected during onboarding: ${focus}.`;
}

function composeSectionPrompt(
  sectionId: HomeDashboardSectionId,
  interests: ManagedInterest[],
): string {
  if (interests.length === 0) {
    return HUB_DASHBOARD_SECTIONS.find((s) => s.id === sectionId)?.defaultPrompt ?? '';
  }

  const combined = combineInterestPrompts(interests);
  const lens = SECTION_LENSES[sectionId];
  return `${combined} ${lens}`.trim();
}

export function buildPromptsFromInterestIds(
  interestIds: string[],
  catalog = getActiveInterests(),
): HomeDashboardPromptPrefs {
  const selected = interestIds
    .map((id) => getInterestById(id, catalog) ?? catalog.find((i) => i.id === id))
    .filter((item): item is ManagedInterest => Boolean(item));

  const prefs: HomeDashboardPromptPrefs = {};
  for (const section of HUB_DASHBOARD_SECTIONS) {
    prefs[section.id] = composeSectionPrompt(section.id, selected);
  }
  return prefs;
}

/** Persist interests and rewrite home dashboard prompts from admin interest prompts. */
export function applyUserInterestsAndCustomizeHome(interestIds: string[]): void {
  const catalog = getActiveInterests();
  const validIds = interestIds.filter((id) => catalog.some((item) => item.id === id));
  saveUserInterestIds(validIds);
  saveHomeDashboardPrompts(buildPromptsFromInterestIds(validIds, catalog));
  markOnboardingComplete();
}
