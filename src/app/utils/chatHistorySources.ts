import { INITIAL_RESOURCES } from '../data/resourcesMock';
import type { ChatHistoryItem } from '../types/chat';
import type { ChatSource } from '../components/chats/chatSource';

const RISK_IQ_IDS = new Set([
  '1', '2', '4', '5', '6', '8', '9', '10', '11', '14', '15', '18', '19', '23',
]);

const MAP_CHAT_CONFIG: Record<string, { query: string }> = {
  'map-1': {
    query: 'Show IDP camps near Mogadishu within 50km',
  },
  'map-2': {
    query: 'Which areas have the most aid diversion cases?',
  },
  'map-3': {
    query: 'Where are drought-affected districts projected to worsen in 2026?',
  },
};

const REPORT_CHAT_CONFIG: Record<
  string,
  { reportId: 'aid-flow' | 'migration-data' | 'somalia-joint-fund'; reportTitle: string; query: string }
> = {
  'report-1': {
    reportId: 'aid-flow',
    reportTitle: 'Aid Flow Intelligence',
    query: 'Which donors increased WASH funding in 2025?',
  },
  'report-2': {
    reportId: 'migration-data',
    reportTitle: 'Migration & Displacement Intelligence',
    query: 'Compare Bay region displacement against food assistance delivery',
  },
  'report-3': {
    reportId: 'somalia-joint-fund',
    reportTitle: 'Somalia Joint Fund Intelligence',
    query: 'What is the SJF portfolio allocation for protection programmes?',
  },
};

const RESOURCE_CHAT_CONFIG: Record<
  string,
  { resourceId: string; query: string }
> = {
  '33': {
    resourceId: '1',
    query: 'Clarify section 3 reporting requirements for security incidents',
  },
  '34': {
    resourceId: '2',
    query: 'Summarize key decisions from the latest HCT meeting',
  },
  '35': {
    resourceId: '3',
    query: 'What WASH gaps are flagged for Bay region cholera response?',
  },
  '36': {
    resourceId: '4',
    query: 'Which Mogadishu corridors are marked restricted on the access map?',
  },
  '37': {
    resourceId: '5',
    query: 'Outline long-term mitigation objectives in the risk reduction strategy',
  },
  '38': {
    resourceId: '1',
    query: 'What are the escort requirements for the Afgooye corridor?',
  },
};

function resourceTitleForId(resourceId: string): string {
  return INITIAL_RESOURCES.find((r) => r.id === resourceId)?.title ?? 'Resource';
}

export function assignChatSource(
  item: ChatHistoryItem,
): ChatHistoryItem {
  if (item.source) return item;

  const mapConfig = MAP_CHAT_CONFIG[item.id];
  if (mapConfig) {
    return {
      ...item,
      source: 'map',
      query: mapConfig.query ?? item.query,
    };
  }

  const reportConfig = REPORT_CHAT_CONFIG[item.id];
  if (reportConfig || item.reportId) {
    const config = reportConfig ?? (item.reportId
      ? { reportId: item.reportId, reportTitle: item.reportTitle ?? 'Report', query: item.query }
      : null);
    if (config) {
      return {
        ...item,
        source: 'report',
        reportId: config.reportId,
        reportTitle: config.reportTitle ?? item.reportTitle,
        query: config.query ?? item.query,
      };
    }
  }

  const resourceConfig = RESOURCE_CHAT_CONFIG[item.id];
  if (resourceConfig || item.resourceId) {
    const resourceId = resourceConfig?.resourceId ?? item.resourceId!;
    return {
      ...item,
      source: 'resource',
      resourceId,
      resourceTitle: item.resourceTitle ?? resourceTitleForId(resourceId),
      query: resourceConfig?.query ?? item.query,
    };
  }

  if (RISK_IQ_IDS.has(item.id)) {
    return { ...item, source: 'risk-iq' };
  }

  return { ...item, source: 'humanity-hub' };
}

export function withChatSources(items: ChatHistoryItem[]): ChatHistoryItem[] {
  return items.map(assignChatSource);
}
