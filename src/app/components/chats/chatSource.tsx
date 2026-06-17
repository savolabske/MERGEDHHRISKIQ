import { FileText, Shield, Sparkles, type LucideIcon } from 'lucide-react';

export type ChatSource = 'humanity-hub' | 'risk-iq' | 'resource';

export type ChatSourceFilter = ChatSource | 'all';

export const CHAT_SOURCE_OPTIONS: { id: ChatSourceFilter; label: string }[] = [
  { id: 'all', label: 'All sources' },
  { id: 'humanity-hub', label: 'Humanity Hub' },
  { id: 'risk-iq', label: 'Risk iQ' },
  { id: 'resource', label: 'Resource' },
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
};

export function chatSourceLabel(source: ChatSource): string {
  return CHAT_SOURCE_CONFIG[source].label;
}

/** Safe fallback when legacy chat rows are missing `source` (e.g. after HMR). */
export function resolveChatSource(chat?: {
  source?: ChatSource;
  resourceId?: string;
}): ChatSource {
  if (!chat) return 'humanity-hub';
  if (chat.source && CHAT_SOURCE_CONFIG[chat.source]) {
    return chat.source;
  }
  if (chat.resourceId) return 'resource';
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
