import type { ChatSource } from '../components/chats/chatSource';
import type { ActiveReport } from '../components/Reports';

export type { ChatSource, ChatSourceFilter } from '../components/chats/chatSource';

export interface ChatHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  date: string;
  messages?: unknown[];
  sharedWith?: string[];
  shareMode?: 'outgoing' | 'incoming';
  createdBy?: string;
  createdByName?: string;
  unread?: boolean;
  source?: ChatSource;
  resourceId?: string;
  resourceTitle?: string;
  reportId?: ActiveReport;
  reportTitle?: string;
}
