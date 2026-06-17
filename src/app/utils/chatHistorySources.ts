import { INITIAL_RESOURCES } from '../data/resourcesMock';
import type { ChatHistoryItem } from '../types/chat';
import type { ChatSource } from '../components/chats/chatSource';

const RISK_IQ_IDS = new Set([
  '1', '2', '4', '5', '6', '8', '9', '10', '11', '14', '15', '18', '19', '23',
]);

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
