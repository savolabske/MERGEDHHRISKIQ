export interface DashboardSectionConfig {
  id: string;
  label: string;
  sidebarTitle: string;
  defaultPrompt: string;
  promptHint: string;
}

export type DashboardPromptPrefs = Partial<Record<string, string>>;
