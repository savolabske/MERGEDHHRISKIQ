import type { ActiveReport } from '../../../components/Reports';

export type ReportChatHistoryReportId = Exclude<ActiveReport, null>;

export interface ReportChatHistoryItem<T = unknown> {
  id: string;
  reportId: ReportChatHistoryReportId;
  title: string;
  timestamp: number;
  messageCount: number;
  queries: string[];
  messages: T[];
  extendedKnowledge?: boolean;
  resultMode?: boolean;
  resultTitle?: string;
  pinned?: boolean;
  pinnedAt?: number;
}

const STORAGE_KEY = 'report-chat-history-v1';
const MAX_ITEMS_PER_REPORT = 20;

export function formatReportHistoryTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function seedHistoryItems(): ReportChatHistoryItem[] {
  const now = Date.now();
  return [
    {
      id: 'seed-aid-1',
      reportId: 'aid-flow',
      title: 'Which donors increased WASH funding in 2025?',
      timestamp: now - 2 * 60 * 60 * 1000,
      messageCount: 2,
      queries: ['Which donors increased WASH funding in 2025?'],
      messages: [
        { role: 'user', text: 'Which donors increased WASH funding in 2025?' },
        {
          role: 'assistant',
          lane: 'dashboard',
          title: 'WASH donor trends',
          chips: ['Analyze FCDO funding by sector', 'Which regions are underfunded?'],
        },
      ],
      extendedKnowledge: false,
      resultMode: true,
      resultTitle: 'WASH donor trends',
    },
    {
      id: 'seed-aid-2',
      reportId: 'aid-flow',
      title: 'Show climate-related aid flows',
      timestamp: now - 26 * 60 * 60 * 1000,
      messageCount: 4,
      queries: ['Show climate-related aid flows', 'Which donors lead on adaptation?'],
      messages: [
        { role: 'user', text: 'Show climate-related aid flows' },
        {
          role: 'assistant',
          lane: 'dashboard',
          title: 'Climate-related aid flows',
          chips: ['Compare humanitarian vs development climate spend'],
        },
        { role: 'user', text: 'Which donors lead on adaptation?' },
        {
          role: 'assistant',
          lane: 'chat',
          body: 'FCDO, EU, and World Bank lead adaptation programming in Somalia, with the largest share concentrated in Bay and Lower Shabelle.',
          chips: ['Show Bay region breakdown'],
        },
      ],
      extendedKnowledge: true,
      resultMode: false,
    },
    {
      id: 'seed-migration-1',
      reportId: 'migration-data',
      title: 'Compare Bay region displacement against food assistance delivery',
      timestamp: now - 4 * 60 * 60 * 1000,
      messageCount: 2,
      queries: ['Compare Bay region displacement against food assistance delivery'],
      messages: [
        { role: 'user', text: 'Compare Bay region displacement against food assistance delivery' },
        {
          role: 'assistant',
          lane: 'dashboard',
          title: 'Bay displacement vs food assistance',
          chips: ['Show IDP camp growth in Bay', 'Which corridors are most affected?'],
        },
      ],
      extendedKnowledge: false,
      resultMode: true,
      resultTitle: 'Bay displacement vs food assistance',
    },
    {
      id: 'seed-migration-2',
      reportId: 'migration-data',
      title: 'What are the main drivers of displacement in Gedo?',
      timestamp: now - 3 * 24 * 60 * 60 * 1000,
      messageCount: 2,
      queries: ['What are the main drivers of displacement in Gedo?'],
      messages: [
        { role: 'user', text: 'What are the main drivers of displacement in Gedo?' },
        {
          role: 'assistant',
          lane: 'chat',
          body: 'Conflict-related movement, drought stress, and cross-border pressure from Ethiopia are the primary displacement drivers in Gedo.',
          chips: ['Show monthly displacement trend'],
        },
      ],
      extendedKnowledge: false,
      resultMode: false,
    },
    {
      id: 'seed-sjf-1',
      reportId: 'somalia-joint-fund',
      title: 'What is the SJF portfolio allocation for protection programmes?',
      timestamp: now - 6 * 60 * 60 * 1000,
      messageCount: 2,
      queries: ['What is the SJF portfolio allocation for protection programmes?'],
      messages: [
        { role: 'user', text: 'What is the SJF portfolio allocation for protection programmes?' },
        {
          role: 'assistant',
          lane: 'dashboard',
          title: 'SJF protection portfolio',
          chips: ['Show protection spend by region', 'Compare with humanitarian protection funding'],
        },
      ],
      extendedKnowledge: false,
      resultMode: true,
      resultTitle: 'SJF protection portfolio',
      pinned: true,
      pinnedAt: now - 5 * 60 * 60 * 1000,
    },
    {
      id: 'seed-sjf-2',
      reportId: 'somalia-joint-fund',
      title: 'Which SJF projects are at delivery risk?',
      timestamp: now - 2 * 24 * 60 * 60 * 1000,
      messageCount: 2,
      queries: ['Which SJF projects are at delivery risk?'],
      messages: [
        { role: 'user', text: 'Which SJF projects are at delivery risk?' },
        {
          role: 'assistant',
          lane: 'chat',
          body: 'Four SJF projects show delayed disbursement or access constraints, mainly in Middle Shabelle and Galmudug.',
          chips: ['List projects with access constraints'],
        },
      ],
      extendedKnowledge: true,
      resultMode: false,
    },
  ];
}

export function loadAllReportChatHistory(): ReportChatHistoryItem[] {
  if (typeof window === 'undefined') {
    return seedHistoryItems();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedHistoryItems();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ReportChatHistoryItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedHistoryItems();
  } catch {
    return seedHistoryItems();
  }
}

export function saveAllReportChatHistory(items: ReportChatHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getReportChatHistory(
  reportId: ReportChatHistoryReportId,
  allItems?: ReportChatHistoryItem[],
): ReportChatHistoryItem[] {
  const items = allItems ?? loadAllReportChatHistory();
  return items
    .filter((item) => item.reportId === reportId)
    .sort((a, b) => {
      const aPinned = Boolean(a.pinned);
      const bPinned = Boolean(b.pinned);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;
      if (aPinned && bPinned) {
        return (b.pinnedAt ?? b.timestamp) - (a.pinnedAt ?? a.timestamp);
      }
      return b.timestamp - a.timestamp;
    });
}

function mergeHistoryItem(
  existing: ReportChatHistoryItem | undefined,
  item: ReportChatHistoryItem,
): ReportChatHistoryItem {
  if (!existing) return item;
  return {
    ...item,
    pinned: existing.pinned,
    pinnedAt: existing.pinnedAt,
  };
}

export function upsertReportChatHistoryItem(
  item: ReportChatHistoryItem,
  allItems?: ReportChatHistoryItem[],
): ReportChatHistoryItem[] {
  const items = allItems ?? loadAllReportChatHistory();
  const existing = items.find((entry) => entry.id === item.id);
  const merged = mergeHistoryItem(existing, item);
  const without = items.filter((entry) => entry.id !== item.id);
  const reportItems = without.filter((entry) => entry.reportId === item.reportId);
  const otherReports = without.filter((entry) => entry.reportId !== item.reportId);
  const nextReportItems = [merged, ...reportItems].slice(0, MAX_ITEMS_PER_REPORT);
  const next = [...nextReportItems, ...otherReports];
  saveAllReportChatHistory(next);
  return next;
}

export function deleteReportChatHistoryItem(
  id: string,
  allItems?: ReportChatHistoryItem[],
): ReportChatHistoryItem[] {
  const items = (allItems ?? loadAllReportChatHistory()).filter((item) => item.id !== id);
  saveAllReportChatHistory(items);
  return items;
}

export function toggleReportChatHistoryPin(
  id: string,
  allItems?: ReportChatHistoryItem[],
): ReportChatHistoryItem[] {
  const items = allItems ?? loadAllReportChatHistory();
  const next = items.map((item) => {
    if (item.id !== id) return item;
    const pinned = !item.pinned;
    return {
      ...item,
      pinned,
      pinnedAt: pinned ? Date.now() : undefined,
    };
  });
  saveAllReportChatHistory(next);
  return next;
}

export function clearReportChatHistory(reportId: ReportChatHistoryReportId): ReportChatHistoryItem[] {
  const items = loadAllReportChatHistory().filter((item) => item.reportId !== reportId);
  saveAllReportChatHistory(items);
  return items;
}

export function extractUserQueries(messages: { role: string; text?: string }[]): string[] {
  return messages
    .filter((message) => message.role === 'user' && message.text)
    .map((message) => message.text as string);
}
