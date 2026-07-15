/** Knowledge sources that can be linked when creating a report (standard admin resources). */
export const LINKABLE_KNOWLEDGE_SOURCES = [
  { id: '2', title: 'Humanitarian Access Incident Tracker — regional annexes' },
  { id: '3', title: 'IPC Food Security Phase Classification Bay & Bakool' },
  { id: '4', title: 'WASH Cluster Assessment — Baidoa & Dollow' },
] as const;

export interface ReportResourceLinkContext {
  reportId: string;
  reportTitle: string;
  prefillTitle: string;
  prefillDescription: string;
}

export interface ManageReportsReturnContext {
  reportId: string;
  toastMessage?: string;
}

const LINK_CONTEXT_KEY = 'hh.reportResourceLinkContext';
const RETURN_CONTEXT_KEY = 'hh.manageReportsReturnContext';

export function saveReportResourceLinkContext(ctx: ReportResourceLinkContext): void {
  try {
    sessionStorage.setItem(LINK_CONTEXT_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function loadReportResourceLinkContext(): ReportResourceLinkContext | null {
  try {
    const raw = sessionStorage.getItem(LINK_CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReportResourceLinkContext;
  } catch {
    return null;
  }
}

export function clearReportResourceLinkContext(): void {
  try {
    sessionStorage.removeItem(LINK_CONTEXT_KEY);
  } catch {
    /* ignore */
  }
}

export function saveManageReportsReturnContext(ctx: ManageReportsReturnContext): void {
  try {
    sessionStorage.setItem(RETURN_CONTEXT_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function loadManageReportsReturnContext(): ManageReportsReturnContext | null {
  try {
    const raw = sessionStorage.getItem(RETURN_CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ManageReportsReturnContext;
  } catch {
    return null;
  }
}

export function clearManageReportsReturnContext(): void {
  try {
    sessionStorage.removeItem(RETURN_CONTEXT_KEY);
  } catch {
    /* ignore */
  }
}
