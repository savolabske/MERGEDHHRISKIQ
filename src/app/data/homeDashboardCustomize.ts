import {
  HUB_KEY_INSIGHTS,
  HUB_MAIN_INSIGHT,
  HUB_PREDICTIVE_INSIGHTS,
  type HubKeyInsight,
  type HubPredictiveTheme,
} from './homeDashboardMock';

export type HomeDashboardSectionId =
  | 'main-insight'
  | 'emerging-insights'
  | 'predictive-insights';

export interface HomeDashboardSectionConfig {
  id: HomeDashboardSectionId;
  label: string;
  sidebarTitle: string;
  defaultPrompt: string;
  promptHint: string;
}

export const HUB_DASHBOARD_SECTIONS: HomeDashboardSectionConfig[] = [
  {
    id: 'main-insight',
    label: 'Main insight',
    sidebarTitle: 'Main insight',
    defaultPrompt:
      'Summarize the single most urgent humanitarian development in Somalia right now. Lead with the headline number, name the affected regions, and close with what decision-makers should watch next. Keep it to 2–3 sentences.',
    promptHint:
      'This is the instruction the AI uses to generate this section. Be specific about what to prioritize, rank, or compare.',
  },
  {
    id: 'emerging-insights',
    label: 'Emerging insights',
    sidebarTitle: 'Emerging insights',
    defaultPrompt:
      'Surface the top flagged signals across climate, aid flow, and displacement. Prioritize items with the highest operational urgency — funding gaps, access constraints, and rapid-onset hazards first.',
    promptHint:
      'This is the instruction the AI uses to generate this section. Be specific about categories, thresholds, or regions to emphasize.',
  },
  {
    id: 'predictive-insights',
    label: 'Predictive insights',
    sidebarTitle: 'Predictive insights',
    defaultPrompt:
      'Forecast humanitarian risks for the next 30 days across aid delivery, climate, and displacement. For each theme, state the likely trigger, affected population or geography, and the earliest decision point for cluster leads.',
    promptHint:
      'This is the instruction the AI uses to generate this section. Be specific about time horizon, themes, or indicators to weight.',
  },
];

export const HUB_DASHBOARD_PROMPTS_STORAGE_KEY = 'hh.homeDashboardPrompts';
export const HUB_DASHBOARD_PROMPTS_CHANGED_EVENT = 'hh:home-dashboard-prompts-changed';

export type HomeDashboardPromptPrefs = Partial<Record<HomeDashboardSectionId, string>>;

export interface HubMainInsightBody {
  lead: string;
  foodInsecure: string;
  regions: string;
  into: string;
  idpSites: string;
  displacementChange: string;
  tail: string;
}

export interface HubPredictiveInsightView {
  id: string;
  theme: string;
  themeId: HubPredictiveTheme;
  horizon: string;
  title: string;
  description: string;
  footer: readonly { label: string }[];
  background: string;
  borderClass: string;
}

const MAIN_INSIGHT_VARIANTS: Record<string, HubMainInsightBody> = {
  default: { ...HUB_MAIN_INSIGHT.body },
  displacement: {
    lead: 'Displacement inflows are pushing',
    foodInsecure: '42,000 new arrivals',
    regions: 'Baidoa and Mogadishu',
    into: 'past site capacity this month.',
    idpSites: 'WASH and shelter clusters',
    displacementChange: '18%',
    tail: 'report strain at 6 high-density sites — surge staffing is the immediate gap.',
  },
  funding: {
    lead: 'Q2 funding gaps may leave',
    foodInsecure: '$4.2M unfunded',
    regions: 'nutrition and WASH',
    into: 'programmes exposed in Bay and Bakool.',
    idpSites: 'Six cluster programmes',
    displacementChange: '3 weeks',
    tail: 'face delivery delays if donor payments slip — cluster leads should scenario-plan now.',
  },
  climate: {
    lead: 'Late Gu rains are widening drought stress for',
    foodInsecure: '240,000 people',
    regions: 'central Somalia',
    into: 'who may reach IPC 3+ by July.',
    idpSites: 'Bay and Bakool',
    displacementChange: '2–3 weeks',
    tail: 'behind normal rainfall — food aid timing is the critical lever.',
  },
};

const EMERGING_INSIGHTS_VARIANTS: Record<string, HubKeyInsight[]> = {
  default: [...HUB_KEY_INSIGHTS],
  displacement: HUB_KEY_INSIGHTS.map((insight) =>
    insight.category === 'displacement'
      ? {
          ...insight,
          headline: 'Baidoa IDP sites at 94% WASH capacity',
          description: 'Three sites exceeded safe occupancy — partners requesting surge kits this week.',
        }
      : insight,
  ),
  funding: HUB_KEY_INSIGHTS.map((insight) =>
    insight.category === 'aid'
      ? {
          ...insight,
          headline: 'Nutrition pipeline funding 22% below Q2 target',
          description: 'Delayed pledges may push six programmes into partial suspension by mid-June.',
        }
      : insight,
  ),
};

const PREDICTIVE_VARIANTS: Record<string, HubPredictiveInsightView[]> = {
  default: HUB_PREDICTIVE_INSIGHTS.map((item) => ({ ...item })),
  displacement: HUB_PREDICTIVE_INSIGHTS.map((item) =>
    item.themeId === 'displacement'
      ? {
          ...item,
          title: 'IDP site saturation likely in Baidoa by late May',
          description:
            'At current arrival rates, three high-density sites may exceed WASH capacity within 3 weeks unless partners pre-position surge kits.',
        }
      : { ...item },
  ),
  funding: HUB_PREDICTIVE_INSIGHTS.map((item) =>
    item.themeId === 'aid'
      ? {
          ...item,
          title: 'Nutrition funding shortfall may delay six programmes',
          description:
            'If Q2 pledges arrive 3+ weeks late, Bay and Bakool could see an 18% delivery gap on nutrition and WASH before mid-June.',
        }
      : { ...item },
  ),
};

function pickVariantKey(prompt: string, defaultPrompt: string): string {
  if (prompt.trim() === defaultPrompt.trim()) return 'default';

  const lower = prompt.toLowerCase();
  if (
    lower.includes('displacement') ||
    lower.includes('idp') ||
    lower.includes('arrival')
  ) {
    return 'displacement';
  }
  if (
    lower.includes('fund') ||
    lower.includes('aid') ||
    lower.includes('donor') ||
    lower.includes('pipeline')
  ) {
    return 'funding';
  }
  if (
    lower.includes('climate') ||
    lower.includes('rain') ||
    lower.includes('drought') ||
    lower.includes('ipc')
  ) {
    return 'climate';
  }
  return 'default';
}

export function getDefaultPrompt(sectionId: HomeDashboardSectionId): string {
  return HUB_DASHBOARD_SECTIONS.find((section) => section.id === sectionId)?.defaultPrompt ?? '';
}

export function getSectionConfig(sectionId: HomeDashboardSectionId): HomeDashboardSectionConfig {
  const section = HUB_DASHBOARD_SECTIONS.find((item) => item.id === sectionId);
  if (!section) throw new Error(`Unknown dashboard section: ${sectionId}`);
  return section;
}

export function promptDiffersFromDefault(
  sectionId: HomeDashboardSectionId,
  prompt: string,
): boolean {
  return prompt.trim() !== getDefaultPrompt(sectionId).trim();
}

function notifyPromptsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(HUB_DASHBOARD_PROMPTS_CHANGED_EVENT));
}

export function loadHomeDashboardPrompts(): HomeDashboardPromptPrefs {
  try {
    const raw = localStorage.getItem(HUB_DASHBOARD_PROMPTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HomeDashboardPromptPrefs;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveHomeDashboardPrompts(prefs: HomeDashboardPromptPrefs): void {
  try {
    localStorage.setItem(HUB_DASHBOARD_PROMPTS_STORAGE_KEY, JSON.stringify(prefs));
    notifyPromptsChanged();
  } catch {
    /* ignore */
  }
}

export function resetHomeDashboardPrompts(): void {
  try {
    localStorage.removeItem(HUB_DASHBOARD_PROMPTS_STORAGE_KEY);
    notifyPromptsChanged();
  } catch {
    /* ignore */
  }
}

export function resolveMainInsightBody(
  sectionId: HomeDashboardSectionId,
  prefs: HomeDashboardPromptPrefs,
): HubMainInsightBody {
  const config = getSectionConfig(sectionId);
  const prompt = prefs[sectionId] ?? config.defaultPrompt;
  const variant = pickVariantKey(prompt, config.defaultPrompt);
  return MAIN_INSIGHT_VARIANTS[variant] ?? MAIN_INSIGHT_VARIANTS.default;
}

export function resolveEmergingInsights(
  sectionId: HomeDashboardSectionId,
  prefs: HomeDashboardPromptPrefs,
): HubKeyInsight[] {
  const config = getSectionConfig(sectionId);
  const prompt = prefs[sectionId] ?? config.defaultPrompt;
  const variant = pickVariantKey(prompt, config.defaultPrompt);
  return EMERGING_INSIGHTS_VARIANTS[variant] ?? EMERGING_INSIGHTS_VARIANTS.default;
}

export function resolvePredictiveInsights(
  sectionId: HomeDashboardSectionId,
  prefs: HomeDashboardPromptPrefs,
): HubPredictiveInsightView[] {
  const config = getSectionConfig(sectionId);
  const prompt = prefs[sectionId] ?? config.defaultPrompt;
  const variant = pickVariantKey(prompt, config.defaultPrompt);
  return PREDICTIVE_VARIANTS[variant] ?? PREDICTIVE_VARIANTS.default;
}

export function hasCustomizedPrompts(prefs: HomeDashboardPromptPrefs): boolean {
  return HUB_DASHBOARD_SECTIONS.some((section) => {
    const saved = prefs[section.id];
    return saved !== undefined && promptDiffersFromDefault(section.id, saved);
  });
}
