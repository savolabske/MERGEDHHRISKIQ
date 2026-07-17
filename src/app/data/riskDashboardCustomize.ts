import {
  DASHBOARD_BRIEFING_UPDATES,
  DASHBOARD_EMERGING_RISKS,
} from './dashboardMock';
import type { DashboardPromptPrefs, DashboardSectionConfig } from './dashboardCustomizeTypes';

export type RiskDashboardSectionId = 'risk-summary' | 'emerging-risks' | 'risk-briefing';

export const RISK_DASHBOARD_SECTIONS: DashboardSectionConfig[] = [
  {
    id: 'risk-summary',
    label: 'Risk intelligence summary',
    sidebarTitle: 'Risk intelligence summary',
    defaultPrompt:
      'Summarize the most important risk picture for Somalia this week. Lead with total active risks, name the hottest regions, and close with the dominant risk drivers and open critical cases.',
    promptHint:
      'This is the instruction the AI uses to generate this section. Be specific about registers, severity, or geographies to emphasize.',
  },
  {
    id: 'emerging-risks',
    label: 'Top emerging risks',
    sidebarTitle: 'Top emerging risks',
    defaultPrompt:
      'Surface the top three emerging risks detected in the last 7 days. Rank by operational urgency — security threats, compliance gaps, and funding exposure first. Each card should name the trigger, geography, and why it matters now.',
    promptHint:
      'This is the instruction the AI uses to generate this section. Be specific about risk types, thresholds, or registers to weight.',
  },
  {
    id: 'risk-briefing',
    label: 'Risk briefing',
    sidebarTitle: 'Risk briefing',
    defaultPrompt:
      'List the latest AI-flagged updates across all registers. Prioritize items that need action within 48 hours — climate triggers, funding gaps, displacement spikes, and accountability flags.',
    promptHint:
      'This is the instruction the AI uses to generate this section. Be specific about urgency, clusters, or update types to surface.',
  },
];

export const RISK_DASHBOARD_PROMPTS_STORAGE_KEY = 'hh.riskDashboardPrompts';
export const RISK_DASHBOARD_PROMPTS_CHANGED_EVENT = 'hh:risk-dashboard-prompts-changed';

export type RiskDashboardPromptPrefs = Partial<Record<RiskDashboardSectionId, string>>;

export interface RiskSummaryBody {
  activeRisks: string;
  region1: string;
  region2: string;
  drivers: string;
  criticalCases: string;
}

export type RiskEmergingRiskView = (typeof DASHBOARD_EMERGING_RISKS)[number];
export type RiskBriefingUpdateView = (typeof DASHBOARD_BRIEFING_UPDATES)[number];

const RISK_SUMMARY_VARIANTS: Record<string, RiskSummaryBody> = {
  default: {
    activeRisks: '247 active risks',
    region1: 'Lower Shabelle',
    region2: 'Banadir',
    drivers: 'Supply chain and security risks',
    criticalCases: '18 critical cases',
  },
  security: {
    activeRisks: '247 active risks',
    region1: 'Lower Shabelle',
    region2: 'Marka corridor',
    drivers: 'Security and convoy risks',
    criticalCases: '9 linked IED incidents',
  },
  compliance: {
    activeRisks: '247 active risks',
    region1: 'Banadir',
    region2: 'Middle Shabelle',
    drivers: 'Vendor compliance and procurement gaps',
    criticalCases: '4 flagged contractors',
  },
  funding: {
    activeRisks: '247 active risks',
    region1: 'Bay',
    region2: 'Bakool',
    drivers: 'Funding shortfall and pipeline risks',
    criticalCases: '6 exposed programmes',
  },
};

const EMERGING_RISKS_VARIANTS: Record<string, RiskEmergingRiskView[]> = {
  default: DASHBOARD_EMERGING_RISKS.map((risk) => ({ ...risk })),
  security: DASHBOARD_EMERGING_RISKS.map((risk) =>
    risk.id === '1'
      ? {
          ...risk,
          title: 'Convoy threat spike on MSR-3 — pre-attack pattern detected',
          description:
            '12 convoy-related incidents in 9 days. Pattern matches prior IED clustering before major attacks on supply routes.',
        }
      : { ...risk },
  ),
  compliance: DASHBOARD_EMERGING_RISKS.map((risk) =>
    risk.id === '2'
      ? {
          ...risk,
          title: 'Repeat vendor non-compliance across Banadir contracts',
          description:
            '5 contractors flagged for missing certifications and delivery delays. 3 are servicing active MPCA and WASH sites.',
        }
      : { ...risk },
  ),
  funding: DASHBOARD_EMERGING_RISKS.map((risk) =>
    risk.id === '3'
      ? {
          ...risk,
          title: 'WASH and nutrition pipeline at 22% Q3 shortfall risk',
          description:
            'Donor pledges lagging across six programmes. Bay and Bakool clusters face the earliest delivery exposure.',
        }
      : { ...risk },
  ),
};

const BRIEFING_VARIANTS: Record<string, RiskBriefingUpdateView[]> = {
  default: DASHBOARD_BRIEFING_UPDATES.map((update) => ({ ...update })),
  security: DASHBOARD_BRIEFING_UPDATES.map((update) =>
    update.id === '1'
      ? {
          ...update,
          headline: 'IED pattern on MSR-3 escalated — convoy holds recommended',
          description:
            'Security incidents crossed the early-action threshold in Lower Shabelle. Three convoy routes flagged for reassessment within 24 hours.',
        }
      : { ...update },
  ),
  compliance: DASHBOARD_BRIEFING_UPDATES.map((update) =>
    update.id === '2'
      ? {
          ...update,
          headline: 'Procurement compliance review triggered for 4 Banadir vendors',
          description:
            'Vendor due-diligence flags matched repeat certification gaps. Accountability cluster recommended contract holds on two active distributions.',
        }
      : { ...update },
  ),
  funding: DASHBOARD_BRIEFING_UPDATES.map((update) =>
    update.id === '2'
      ? {
          ...update,
          headline: 'Nutrition and WASH funding gap widens into Q3',
          description:
            'FTS pledges trail portfolio needs by 22%. Six programmes in Bay and Bakool face partial suspension without revised donor timelines.',
        }
      : { ...update },
  ),
};

function pickVariantKey(prompt: string, defaultPrompt: string): string {
  if (prompt.trim() === defaultPrompt.trim()) return 'default';

  const lower = prompt.toLowerCase();
  if (
    lower.includes('security') ||
    lower.includes('ied') ||
    lower.includes('convoy') ||
    lower.includes('incident')
  ) {
    return 'security';
  }
  if (
    lower.includes('compliance') ||
    lower.includes('vendor') ||
    lower.includes('procurement') ||
    lower.includes('contract')
  ) {
    return 'compliance';
  }
  if (
    lower.includes('fund') ||
    lower.includes('donor') ||
    lower.includes('pipeline') ||
    lower.includes('shortfall')
  ) {
    return 'funding';
  }
  return 'default';
}

export function getRiskDefaultPrompt(sectionId: RiskDashboardSectionId): string {
  return RISK_DASHBOARD_SECTIONS.find((section) => section.id === sectionId)?.defaultPrompt ?? '';
}

export function getRiskSectionConfig(sectionId: RiskDashboardSectionId): DashboardSectionConfig {
  const section = RISK_DASHBOARD_SECTIONS.find((item) => item.id === sectionId);
  if (!section) throw new Error(`Unknown risk dashboard section: ${sectionId}`);
  return section;
}

export function riskPromptDiffersFromDefault(
  sectionId: RiskDashboardSectionId,
  prompt: string,
): boolean {
  return prompt.trim() !== getRiskDefaultPrompt(sectionId).trim();
}

function notifyPromptsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RISK_DASHBOARD_PROMPTS_CHANGED_EVENT));
}

export function loadRiskDashboardPrompts(): RiskDashboardPromptPrefs {
  try {
    const raw = localStorage.getItem(RISK_DASHBOARD_PROMPTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RiskDashboardPromptPrefs;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveRiskDashboardPrompts(prefs: RiskDashboardPromptPrefs): void {
  try {
    localStorage.setItem(RISK_DASHBOARD_PROMPTS_STORAGE_KEY, JSON.stringify(prefs));
    notifyPromptsChanged();
  } catch {
    /* ignore */
  }
}

export function resolveRiskSummaryBody(
  sectionId: RiskDashboardSectionId,
  prefs: RiskDashboardPromptPrefs,
): RiskSummaryBody {
  const config = getRiskSectionConfig(sectionId);
  const prompt = prefs[sectionId] ?? config.defaultPrompt;
  const variant = pickVariantKey(prompt, config.defaultPrompt);
  return RISK_SUMMARY_VARIANTS[variant] ?? RISK_SUMMARY_VARIANTS.default;
}

export function resolveEmergingRisks(
  sectionId: RiskDashboardSectionId,
  prefs: RiskDashboardPromptPrefs,
): RiskEmergingRiskView[] {
  const config = getRiskSectionConfig(sectionId);
  const prompt = prefs[sectionId] ?? config.defaultPrompt;
  const variant = pickVariantKey(prompt, config.defaultPrompt);
  return EMERGING_RISKS_VARIANTS[variant] ?? EMERGING_RISKS_VARIANTS.default;
}

export function resolveRiskBriefingUpdates(
  sectionId: RiskDashboardSectionId,
  prefs: RiskDashboardPromptPrefs,
): RiskBriefingUpdateView[] {
  const config = getRiskSectionConfig(sectionId);
  const prompt = prefs[sectionId] ?? config.defaultPrompt;
  const variant = pickVariantKey(prompt, config.defaultPrompt);
  return BRIEFING_VARIANTS[variant] ?? BRIEFING_VARIANTS.default;
}

export function getRiskSectionLabel(sectionId: RiskDashboardSectionId): string {
  return getRiskSectionConfig(sectionId).label;
}
