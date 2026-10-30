import {
  getDefaultPrompt,
  getSectionConfig,
  HUB_DASHBOARD_PROMPTS_CHANGED_EVENT,
  HUB_DASHBOARD_SECTIONS,
  loadHomeDashboardPrompts,
  promptDiffersFromDefault,
  saveHomeDashboardPrompts,
  type HomeDashboardSectionId,
} from '../data/homeDashboardCustomize';
import { useDashboardCustomize } from './useDashboardCustomize';

const HOME_CUSTOMIZE_CONFIG = {
  sections: HUB_DASHBOARD_SECTIONS,
  changedEvent: HUB_DASHBOARD_PROMPTS_CHANGED_EVENT,
  loadPrompts: loadHomeDashboardPrompts,
  savePrompts: saveHomeDashboardPrompts,
  getDefaultPrompt,
  promptDiffersFromDefault,
  getSectionLabel: (sectionId: HomeDashboardSectionId) => getSectionConfig(sectionId).label,
};

export function useHomeDashboardCustomize() {
  return useDashboardCustomize<HomeDashboardSectionId>(HOME_CUSTOMIZE_CONFIG);
}
