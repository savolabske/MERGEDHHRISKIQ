export type RiskIqTab = 'dashboard' | 'riskMatrix' | 'riskRegister' | 'collectiveRisk' | 'chats';

export type AppView =
  | 'home'
  | 'platformChats'
  | 'resourcesHub'
  | 'mapAI'
  | 'reports'
  | 'riskIQ'
  | 'aiSearch'
  | 'insights'
  | 'profile'
  | 'adminDashboard'
  | 'approvals'
  | 'usersAccess'
  | 'auditTrails'
  | 'locations'
  | 'definitions'
  | 'resources'
  | 'links'
  | 'documentDetail';

export const RISK_IQ_TAB_STORAGE_KEY = 'riskiq.lastTab';

export function loadRiskIqTab(): RiskIqTab {
  try {
    const stored = sessionStorage.getItem(RISK_IQ_TAB_STORAGE_KEY);
    if (
      stored === 'dashboard' ||
      stored === 'riskMatrix' ||
      stored === 'riskRegister' ||
      stored === 'collectiveRisk' ||
      stored === 'chats'
    ) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return 'dashboard';
}

export function saveRiskIqTab(tab: RiskIqTab) {
  try {
    sessionStorage.setItem(RISK_IQ_TAB_STORAGE_KEY, tab);
  } catch {
    /* ignore */
  }
}
