import { BarChart3, FileText, Map, Shield, Sparkles, type LucideIcon } from 'lucide-react';

export type ChatSource = 'humanity-hub' | 'risk-iq' | 'resource' | 'map' | 'report';

export type ChatSourceFilter = ChatSource | 'all';

export const CHAT_SOURCE_OPTIONS: { id: ChatSourceFilter; label: string }[] = [
  { id: 'all', label: 'All sources' },
  { id: 'humanity-hub', label: 'Humanity Hub' },
  { id: 'risk-iq', label: 'Risk iQ' },
  { id: 'resource', label: 'Resource' },
  { id: 'map', label: 'Maps' },
  { id: 'report', label: 'Reports' },
];

type ChatSourceConfig = {
  label: string;
  Icon: LucideIcon;
  tileClassName: string;
  iconClassName: string;
  pillClassName: string;
};

export const CHAT_SOURCE_CONFIG: Record<ChatSource, ChatSourceConfig> = {
  'humanity-hub': {
    label: 'Humanity Hub',
    Icon: Sparkles,
    tileClassName: 'bg-primary-subtle',
    iconClassName: 'text-primary-text',
    pillClassName: 'bg-primary-subtle text-primary-text',
  },
  'risk-iq': {
    label: 'Risk iQ',
    Icon: Shield,
    tileClassName: 'bg-[#FAECE7]',
    iconClassName: 'text-[#712B13]',
    pillClassName: 'bg-[#FAECE7] text-[#712B13]',
  },
  resource: {
    label: 'Resource',
    Icon: FileText,
    tileClassName: 'bg-[#EAF3DE]',
    iconClassName: 'text-[#27500A]',
    pillClassName: 'bg-[#EAF3DE] text-[#27500A]',
  },
  map: {
    label: 'Maps',
    Icon: Map,
    tileClassName: 'bg-[#E8F0FE]',
    iconClassName: 'text-[#1A4B8C]',
    pillClassName: 'bg-[#E8F0FE] text-[#1A4B8C]',
  },
  report: {
    label: 'Reports',
    Icon: BarChart3,
    tileClassName: 'bg-[#F3E8FF]',
    iconClassName: 'text-[#6B21A8]',
    pillClassName: 'bg-[#F3E8FF] text-[#6B21A8]',
  },
};

export function chatSourceLabel(source: ChatSource): string {
  return CHAT_SOURCE_CONFIG[source].label;
}

/** Safe fallback when legacy chat rows are missing `source` (e.g. after HMR). */
export function resolveChatSource(chat?: {
  source?: ChatSource;
  resourceId?: string;
  reportId?: string;
  id?: string;
}): ChatSource {
  if (!chat) return 'humanity-hub';
  if (chat.source && CHAT_SOURCE_CONFIG[chat.source]) {
    return chat.source;
  }
  if (chat.reportId) return 'report';
  if (chat.resourceId) return 'resource';
  if (chat.id?.startsWith('map-')) return 'map';
  if (chat.id?.startsWith('report-')) return 'report';
  return 'humanity-hub';
}

export function chatSourceFilterLabel(filter: ChatSourceFilter): string {
  return CHAT_SOURCE_OPTIONS.find((o) => o.id === filter)?.label ?? 'All sources';
}

export function ChatSourceBadge({
  source,
  size = 'sm',
}: {
  source: ChatSource;
  size?: 'sm' | 'md';
}) {
  const config = CHAT_SOURCE_CONFIG[source];
  const pillClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-xs font-medium ${pillClass} ${config.pillClassName}`}
    >
      {config.label}
    </span>
  );
}

export function ChatSourceIcon({ source }: { source: ChatSource }) {
  const config = CHAT_SOURCE_CONFIG[source];
  const Icon = config.Icon;

  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.tileClassName}`}
      aria-hidden
    >
      <Icon size={16} strokeWidth={2} className={config.iconClassName} />
    </div>
  );
}
