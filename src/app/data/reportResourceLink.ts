/** Knowledge sources that can be linked when creating a report (standard admin resources). */
export const LINKABLE_KNOWLEDGE_SOURCES = [
  {
    id: '2',
    title: 'Humanitarian Access Incident Tracker — regional annexes',
    /** Reports already using this resource — excluded from the create-report picker */
    usedByReports: ['Aid Flow Intelligence', 'Migration & Displacement Intelligence'],
  },
  {
    id: '3',
    title: 'IPC Food Security Phase Classification Bay & Bakool',
    usedByReports: ['Somalia Joint Fund Intelligence'],
  },
  {
    id: '4',
    title: 'WASH Cluster Assessment — Baidoa & Dollow',
    usedByReports: [] as string[],
  },
] as const;

export type ReportResourcePool = 'admin' | 'user';

export interface LinkableReportResource {
  id: string;
  title: string;
}

export interface ReportResourceLinkContext {
  reportId: string;
  reportTitle: string;
  prefillTitle: string;
  prefillDescription: string;
  /** Defaults to admin Documents when omitted */
  resourcePool?: ReportResourcePool;
}

export interface ManageReportsReturnContext {
  reportId: string;
  toastMessage?: string;
  /** Where to reopen the builder after attaching sources */
  returnView?: 'manageReports' | 'reports';
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
