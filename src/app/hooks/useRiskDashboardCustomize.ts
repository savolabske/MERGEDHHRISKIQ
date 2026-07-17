import {
  getRiskDefaultPrompt,
  getRiskSectionLabel,
  loadRiskDashboardPrompts,
  RISK_DASHBOARD_PROMPTS_CHANGED_EVENT,
  RISK_DASHBOARD_SECTIONS,
  riskPromptDiffersFromDefault,
  saveRiskDashboardPrompts,
  type RiskDashboardSectionId,
} from '../data/riskDashboardCustomize';
import { useDashboardCustomize } from './useDashboardCustomize';

const RISK_CUSTOMIZE_CONFIG = {
  sections: RISK_DASHBOARD_SECTIONS,
  changedEvent: RISK_DASHBOARD_PROMPTS_CHANGED_EVENT,
  loadPrompts: loadRiskDashboardPrompts,
  savePrompts: saveRiskDashboardPrompts,
  getDefaultPrompt: getRiskDefaultPrompt,
  promptDiffersFromDefault: riskPromptDiffersFromDefault,
  getSectionLabel: getRiskSectionLabel,
};

export function useRiskDashboardCustomize() {
  return useDashboardCustomize<RiskDashboardSectionId>(RISK_CUSTOMIZE_CONFIG);
}
