export interface ReportsHubPreferences {
  order: string[];
  hidden: string[];
}

export const REPORTS_HUB_LAYOUT_STORAGE_KEY = 'hh.reportsHubLayout';

export const REPORTS_HUB_LAYOUT_CHANGED_EVENT = 'hh:reports-hub-layout-changed';

export const DEFAULT_REPORTS_HUB_PREFERENCES: ReportsHubPreferences = {
  order: [],
  hidden: [],
};

function notifyLayoutChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(REPORTS_HUB_LAYOUT_CHANGED_EVENT));
}

export function loadReportsHubPreferences(): ReportsHubPreferences {
  try {
    const raw = localStorage.getItem(REPORTS_HUB_LAYOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ReportsHubPreferences>;
      return {
        order: Array.isArray(parsed.order) ? parsed.order.map(String) : [],
        hidden: Array.isArray(parsed.hidden) ? parsed.hidden.map(String) : [],
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_REPORTS_HUB_PREFERENCES };
}

export function saveReportsHubPreferences(prefs: ReportsHubPreferences): void {
  try {
    localStorage.setItem(REPORTS_HUB_LAYOUT_STORAGE_KEY, JSON.stringify(prefs));
    notifyLayoutChanged();
  } catch {
    /* ignore */
  }
}

export function resetReportsHubPreferences(): void {
  try {
    localStorage.removeItem(REPORTS_HUB_LAYOUT_STORAGE_KEY);
    notifyLayoutChanged();
  } catch {
    /* ignore */
  }
}

export function pruneReportsHubPreferences(
  prefs: ReportsHubPreferences,
  validIds: string[],
): ReportsHubPreferences {
  const valid = new Set(validIds);
  return {
    order: prefs.order.filter((id) => valid.has(id)),
    hidden: prefs.hidden.filter((id) => valid.has(id)),
  };
}

export function preferencesDifferFromDefault(
  prefs: ReportsHubPreferences,
  allIds: string[],
): boolean {
  if (prefs.hidden.length > 0) return true;
  if (prefs.order.length === 0) return false;
  const defaultOrder = allIds.join(',');
  const savedOrder = allIds
    .slice()
    .sort((a, b) => {
      const ai = prefs.order.indexOf(a);
      const bi = prefs.order.indexOf(b);
      const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
      const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
      return aRank - bRank;
    })
    .join(',');
  return defaultOrder !== savedOrder;
}

export interface ReportHubItem {
  id: string;
}

/** Sort all cards by prefs order; split into visible vs hidden. */
export function partitionReportsByPreferences<T extends ReportHubItem>(
  cards: T[],
  prefs: ReportsHubPreferences,
): { visible: T[]; hidden: T[] } {
  const pruned = pruneReportsHubPreferences(prefs, cards.map((c) => c.id));
  const hiddenSet = new Set(pruned.hidden);

  const orderIndex = new Map(pruned.order.map((id, i) => [id, i]));

  const sorted = cards.slice().sort((a, b) => {
    const ai = orderIndex.get(a.id);
    const bi = orderIndex.get(b.id);
    const aRank = ai === undefined ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === undefined ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    return cards.indexOf(a) - cards.indexOf(b);
  });

  return {
    visible: sorted.filter((c) => !hiddenSet.has(c.id)),
    hidden: sorted.filter((c) => hiddenSet.has(c.id)),
  };
}

export function buildPreferencesFromVisibleOrder(
  visible: ReportHubItem[],
  hidden: ReportHubItem[],
): ReportsHubPreferences {
  return {
    order: [...visible, ...hidden].map((c) => c.id),
    hidden: hidden.map((c) => c.id),
  };
}

export function moveItemInList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  const next = items.slice();
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
