export type InterestIconKey =
  | 'food'
  | 'displacement'
  | 'climate'
  | 'funding'
  | 'security'
  | 'wash'
  | 'gender'
  | 'earlyWarning';

export interface ManagedInterest {
  id: string;
  name: string;
  description: string;
  iconKey: InterestIconKey;
  /** Soft accent for picker cards (CSS color). */
  accent: string;
  active: boolean;
  sortOrder: number;
  /** Single backing prompt used to personalize Home when selected. */
  prompt: string;
  updatedAt: string;
}

export const INTERESTS_STORAGE_KEY = 'hh.managedInterests';
export const INTERESTS_CHANGED_EVENT = 'hh:managed-interests-changed';

const BUILTIN_INTERESTS: ManagedInterest[] = [
  {
    id: 'food-security',
    name: 'Food security & nutrition',
    description: 'IPC phases, pipeline gaps, and nutrition hotspots',
    iconKey: 'food',
    accent: '#059669',
    active: true,
    sortOrder: 1,
    updatedAt: 'Aug 10, 2026',
    prompt:
      'Focus Home on food security and nutrition in Somalia — IPC phases, caseloads, nutrition pipeline gaps, and regions under stress. Prioritize urgent numbers, affected geography, and the near-term decisions cluster leads should watch.',
  },
  {
    id: 'displacement',
    name: 'Displacement & protection',
    description: 'IDP inflows, site capacity, and protection risks',
    iconKey: 'displacement',
    accent: '#c2562a',
    active: true,
    sortOrder: 2,
    updatedAt: 'Aug 10, 2026',
    prompt:
      'Focus Home on displacement and protection in Somalia — IDP arrivals, site capacity, WASH strain at high-density sites, and protection risks. Prioritize operational urgency for CCCM and protection partners.',
  },
  {
    id: 'climate',
    name: 'Climate & drought',
    description: 'Rainfall, drought stress, and climate hazards',
    iconKey: 'climate',
    accent: '#0ea5e9',
    active: true,
    sortOrder: 3,
    updatedAt: 'Aug 10, 2026',
    prompt:
      'Focus Home on climate and drought affecting Somalia operations — delayed rains, drought stress, flood risk, and rapid-onset hazards. Lead with impact on people and geography, and surface near-term watchpoints.',
  },
  {
    id: 'aid-funding',
    name: 'Aid delivery & funding',
    description: 'Pipelines, pledges, and delivery bottlenecks',
    iconKey: 'funding',
    accent: '#2463eb',
    active: true,
    sortOrder: 4,
    updatedAt: 'Aug 10, 2026',
    prompt:
      'Focus Home on aid delivery and funding for Somalia programmes — delayed pledges, pipeline shortfalls, and delivery bottlenecks. Highlight exposed clusters or regions and the decisions donor and cluster leads should watch.',
  },
  {
    id: 'security-access',
    name: 'Security & access',
    description: 'Access constraints, incidents, and safe corridors',
    iconKey: 'security',
    accent: '#7c3aed',
    active: true,
    sortOrder: 5,
    updatedAt: 'Aug 10, 2026',
    prompt:
      'Focus Home on security and humanitarian access in Somalia — corridor closures, incidents, and partner movement constraints. Name affected routes or districts and the operational watchpoints for security and logistics leads.',
  },
  {
    id: 'wash-health',
    name: 'WASH & health',
    description: 'Water, sanitation, disease, and health system strain',
    iconKey: 'wash',
    accent: '#0891b2',
    active: true,
    sortOrder: 6,
    updatedAt: 'Aug 10, 2026',
    prompt:
      'Focus Home on WASH and health in Somalia — disease outbreaks, water access gaps, facility strain, and coverage shortfalls. Prioritize caseloads, affected sites or regions, and decisions for WASH and health cluster leads.',
  },
  {
    id: 'gender-inclusion',
    name: 'Gender & inclusion',
    description: 'GBV risk, inclusive access, and equity gaps',
    iconKey: 'gender',
    accent: '#db2777',
    active: true,
    sortOrder: 7,
    updatedAt: 'Aug 8, 2026',
    prompt:
      'Focus Home on gender and inclusion risks in Somalia response — GBV risk, barriers for women and girls, and equity gaps in assistance. Surface affected groups and locations, and the watchpoints for protection and programme leads.',
  },
  {
    id: 'early-warning',
    name: 'Early warning & forecasting',
    description: 'Forward-looking signals and decision windows',
    iconKey: 'earlyWarning',
    accent: '#d97706',
    active: true,
    sortOrder: 8,
    updatedAt: 'Aug 8, 2026',
    prompt:
      'Focus Home on early-warning and forecasting for Somalia operations — forward-looking climate, displacement, and aid signals where the decision window is measured in days or weeks. Lead with triggers, regions at risk, and the soonest closing decision points.',
  },
];

function notifyInterestsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(INTERESTS_CHANGED_EVENT));
}

function cloneBuiltins(): ManagedInterest[] {
  return BUILTIN_INTERESTS.map((item) => ({ ...item }));
}

/** Normalize legacy `{ prompts: { ... } }` records into a single `prompt`. */
function normalizeInterest(raw: Record<string, unknown>): ManagedInterest | null {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') return null;

  let prompt = '';
  if (typeof raw.prompt === 'string' && raw.prompt.trim()) {
    prompt = raw.prompt;
  } else if (raw.prompts && typeof raw.prompts === 'object') {
    const legacy = raw.prompts as Record<string, string>;
    prompt =
      legacy['main-insight'] ||
      legacy['emerging-insights'] ||
      legacy['predictive-insights'] ||
      '';
  }

  return {
    id: raw.id,
    name: typeof raw.name === 'string' ? raw.name : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    iconKey: (typeof raw.iconKey === 'string' ? raw.iconKey : 'earlyWarning') as InterestIconKey,
    accent: typeof raw.accent === 'string' ? raw.accent : '#2463eb',
    active: raw.active !== false,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : 0,
    prompt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : formatInterestUpdatedAt(),
  };
}

export function loadManagedInterests(): ManagedInterest[] {
  try {
    const raw = localStorage.getItem(INTERESTS_STORAGE_KEY);
    if (!raw) return cloneBuiltins();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneBuiltins();
    const normalized = parsed
      .map((item) => normalizeInterest(item as Record<string, unknown>))
      .filter((item): item is ManagedInterest => Boolean(item));
    if (normalized.length === 0) return cloneBuiltins();
    return normalized.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return cloneBuiltins();
  }
}

export function saveManagedInterests(interests: ManagedInterest[]): void {
  try {
    localStorage.setItem(INTERESTS_STORAGE_KEY, JSON.stringify(interests));
    notifyInterestsChanged();
  } catch {
    /* ignore */
  }
}

export function getActiveInterests(interests = loadManagedInterests()): ManagedInterest[] {
  return interests.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getInterestById(
  id: string,
  interests = loadManagedInterests(),
): ManagedInterest | undefined {
  return interests.find((item) => item.id === id);
}

export function formatInterestUpdatedAt(date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function createEmptyInterestDraft(sortOrder: number): Omit<ManagedInterest, 'id' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    iconKey: 'earlyWarning',
    accent: '#2463eb',
    active: true,
    sortOrder,
    prompt: '',
  };
}

export const INTEREST_ICON_OPTIONS: { key: InterestIconKey; label: string }[] = [
  { key: 'food', label: 'Food security' },
  { key: 'displacement', label: 'Displacement' },
  { key: 'climate', label: 'Climate' },
  { key: 'funding', label: 'Funding' },
  { key: 'security', label: 'Security' },
  { key: 'wash', label: 'WASH & health' },
  { key: 'gender', label: 'Gender' },
  { key: 'earlyWarning', label: 'Early warning' },
];
