export type FeedbackRating = 'positive' | 'negative';

export type ResponseFeedbackSource = 'chat';

export type ConversationSnapshotRole = 'user' | 'assistant';

export interface ConversationSnapshotMessage {
  id: string;
  role: ConversationSnapshotRole;
  content: string;
  senderName?: string;
  webIntelligenceSummary?: string;
}

export interface ResponseFeedback {
  id: string;
  messageId: string;
  threadId?: string;
  threadTitle?: string;
  rating: FeedbackRating;
  issueCategory?: string;
  details?: string;
  responsePreview: string;
  responseContent?: string;
  webIntelligenceContent?: string;
  userQueryPreview?: string;
  conversationSnapshot?: ConversationSnapshotMessage[];
  submittedAt: string;
  submittedBy: string;
  submittedById: string;
  source: ResponseFeedbackSource;
}

export const RESPONSE_FEEDBACK_STORAGE_KEY = 'riskiq.response-feedback';
export const RESPONSE_FEEDBACK_CHANGED_EVENT = 'riskiq:response-feedback-changed';

const AFGOOYE_RESPONSE =
  '🛡️ **Afgooye corridor protocols**\n\n**7 incidents** in 30 days — treat as **high threat**. All movements need Security Cell approval **48h** ahead. [Source 3]\n\n• **Daylight only** (07:00–16:30); no weekend travel [Source 3]\n• **2 armed guards** minimum; GPS check-in every **15 min** [Source 3]\n• Use approved green routes; **avoid KM13** [Source 3]\n\n🔴 **Threat level: HIGH** [Source 1]';

const IED_WEB_INTEL =
  '**External signals** [Source 1]\n\n• Uptick in confrontations along **Afgooye–Marka** [Source 1]\n• Checkpoint incidents reported by humanitarian actors [Source 1]\n• **~40%** of rural Lower Shabelle missions disrupted [Source 2]';

const SEED_FEEDBACK: ResponseFeedback[] = [
  {
    id: 'seed-1',
    messageId: 'seed-msg-1',
    threadId: 'thread-afgooye',
    threadTitle: 'Afgooye corridor security protocols',
    rating: 'positive',
    details: 'Clear escalation steps and timing windows — exactly what field teams need.',
    responsePreview:
      'Afgooye corridor protocols — 7 incidents in 30 days. All movements need Security Cell approval 48h ahead.',
    responseContent: AFGOOYE_RESPONSE,
    userQueryPreview: 'What are the recommended security protocols for the Afgooye corridor?',
    conversationSnapshot: [
      {
        id: 'seed-turn-1-user',
        role: 'user',
        content: 'Security incidents in Lower Shabelle in the last 30 days',
        senderName: 'James Njoroge',
      },
      {
        id: 'seed-turn-1-assistant',
        role: 'assistant',
        content:
          '🛡️ **Lower Shabelle — Last 30 days**\n\n**9 incidents** in 30 days, mostly **Afgooye** and **Marka**. Armed clashes and IEDs drive the highest exposure; **3 rated high risk**.',
        senderName: 'Humanity Hub',
      },
      {
        id: 'seed-msg-1-user',
        role: 'user',
        content: 'What are the recommended security protocols for the Afgooye corridor?',
        senderName: 'James Njoroge',
      },
      {
        id: 'seed-msg-1',
        role: 'assistant',
        content: AFGOOYE_RESPONSE,
        senderName: 'Humanity Hub',
        webIntelligenceSummary:
          '**External signals** [Source 1]\n\n• Uptick in confrontations along **Afgooye–Marka** [Source 1]\n• Checkpoint incidents reported by humanitarian actors [Source 1]',
      },
    ],
    submittedAt: '2026-03-11T08:42:00.000Z',
    submittedBy: 'James Njoroge',
    submittedById: '3',
    source: 'chat',
  },
  {
    id: 'seed-2',
    messageId: 'seed-msg-2',
    threadId: 'thread-ied',
    threadTitle: 'IED incidents along Afgooye corridor',
    rating: 'negative',
    issueCategory: 'Incomplete',
    details: 'Missing detail on alternate routes when KM13 is closed.',
    responsePreview:
      'IED incidents — Afgooye corridor — 5 IED-related events in 30 days on Afgooye–Marka routes.',
    responseContent:
      '🛡️ **IED incidents — Afgooye corridor**\n\n**5 IED-related events** in 30 days on Afgooye–Marka routes; **KM13** remains the highest-risk junction. [Source 1]\n\n• **2 convoy strikes**; roads closed up to **6 hours** [Source 1]\n• Illegal checkpoints add **2+ hour** delays [Source 2]\n\n🔴 Armored escort mandatory; vary timing and routes. [Source 2]',
    webIntelligenceContent: IED_WEB_INTEL,
    userQueryPreview: 'Show me IED incidents along the Afgooye corridor',
    conversationSnapshot: [
      {
        id: 'seed-msg-2-user',
        role: 'user',
        content: 'Show me IED incidents along the Afgooye corridor',
        senderName: 'Sarah Chen',
      },
      {
        id: 'seed-msg-2',
        role: 'assistant',
        content:
          '🛡️ **IED incidents — Afgooye corridor**\n\n**5 IED-related events** in 30 days on Afgooye–Marka routes; **KM13** remains the highest-risk junction. [Source 1]\n\n• **2 convoy strikes**; roads closed up to **6 hours** [Source 1]\n• Illegal checkpoints add **2+ hour** delays [Source 2]\n\n🔴 Armored escort mandatory; vary timing and routes. [Source 2]',
        senderName: 'Humanity Hub',
        webIntelligenceSummary: IED_WEB_INTEL,
      },
    ],
    submittedAt: '2026-03-10T16:15:00.000Z',
    submittedBy: 'Sarah Chen',
    submittedById: '1',
    source: 'chat',
  },
  {
    id: 'seed-3',
    messageId: 'seed-msg-3',
    threadId: 'thread-briefing',
    threadTitle: 'Daily operational briefing',
    rating: 'positive',
    responsePreview:
      "Today's priorities — Lower Shabelle security is deteriorating: 3 incidents in 72h.",
    responseContent:
      "**Today's priorities — 2 Mar 2026**\n\n**Lower Shabelle** security is deteriorating: **3 incidents** in 72h (IED on Afgooye corridor, checkpoint activity near Marka). Restrict to essential travel with armed escort. [Source 1]\n\n• **Cholera** in Baidoa IDP camps: **89 cases** this week — containment lagging [Source 3]\n• **Port delays** affecting 3 health programmes (~12k beneficiaries) [Source 3]",
    userQueryPreview: 'Give me a daily operational briefing for Somalia',
    conversationSnapshot: [
      {
        id: 'seed-msg-3-user',
        role: 'user',
        content: 'Give me a daily operational briefing for Somalia',
        senderName: 'Amina Mohamed',
      },
      {
        id: 'seed-msg-3',
        role: 'assistant',
        content:
          "**Today's priorities — 2 Mar 2026**\n\n**Lower Shabelle** security is deteriorating: **3 incidents** in 72h (IED on Afgooye corridor, checkpoint activity near Marka). Restrict to essential travel with armed escort. [Source 1]\n\n• **Cholera** in Baidoa IDP camps: **89 cases** this week — containment lagging [Source 3]\n• **Port delays** affecting 3 health programmes (~12k beneficiaries) [Source 3]",
        senderName: 'Humanity Hub',
      },
    ],
    submittedAt: '2026-03-09T09:30:00.000Z',
    submittedBy: 'Amina Mohamed',
    submittedById: 'me',
    source: 'chat',
  },
];

function isConversationSnapshotMessage(value: unknown): value is ConversationSnapshotMessage {
  if (!value || typeof value !== 'object') return false;
  const item = value as ConversationSnapshotMessage;
  return (
    typeof item.id === 'string' &&
    (item.role === 'user' || item.role === 'assistant') &&
    typeof item.content === 'string'
  );
}

function isResponseFeedback(value: unknown): value is ResponseFeedback {
  if (!value || typeof value !== 'object') return false;
  const item = value as ResponseFeedback;
  return (
    typeof item.id === 'string' &&
    typeof item.messageId === 'string' &&
    (item.rating === 'positive' || item.rating === 'negative') &&
    typeof item.responsePreview === 'string' &&
    typeof item.submittedAt === 'string' &&
    typeof item.submittedBy === 'string' &&
    typeof item.submittedById === 'string' &&
    item.source === 'chat' &&
    (item.conversationSnapshot === undefined ||
      (Array.isArray(item.conversationSnapshot) &&
        item.conversationSnapshot.every(isConversationSnapshotMessage)))
  );
}

function notifyChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RESPONSE_FEEDBACK_CHANGED_EVENT));
}

export function stripMarkdownPreview(text: string, maxLength = 120): string {
  const cleaned = text
    .replace(/\*\*/g, '')
    .replace(/\[Source \d+\]/g, '')
    .replace(/[🛡️🔴🟠🟡🟢⚪📍🚧⚠️🤝🧭📈🗺️💧🌊]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}…`;
}

export function formatFeedbackOneLinePreview(text: string, maxLength = 220): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const previewParts: string[] = [];

  for (const paragraph of paragraphs) {
    if (/^•\s/m.test(paragraph)) break;
    previewParts.push(paragraph.replace(/\n/g, ' '));
  }

  const hasMoreContent =
    paragraphs.length > previewParts.length ||
    paragraphs.some((paragraph) => /^•\s/m.test(paragraph));

  let cleaned = previewParts
    .join(' ')
    .replace(/\*\*/g, '')
    .replace(/[•·]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const exceedsMaxLength = cleaned.length > maxLength;
  if (exceedsMaxLength) {
    cleaned = cleaned.slice(0, maxLength).trimEnd();
  }

  if (hasMoreContent || exceedsMaxLength) {
    return `${cleaned} ...`;
  }

  return cleaned;
}

export function getFeedbackResponseContent(item: ResponseFeedback): string {
  return item.responseContent || item.responsePreview;
}

export function loadResponseFeedback(): ResponseFeedback[] {
  if (typeof window === 'undefined') return [...SEED_FEEDBACK];

  try {
    const raw = localStorage.getItem(RESPONSE_FEEDBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RESPONSE_FEEDBACK_STORAGE_KEY, JSON.stringify(SEED_FEEDBACK));
      return [...SEED_FEEDBACK];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...SEED_FEEDBACK];

    const items = parsed.filter(isResponseFeedback);
    return items.length > 0 ? items : [...SEED_FEEDBACK];
  } catch {
    return [...SEED_FEEDBACK];
  }
}

export function saveResponseFeedback(entry: Omit<ResponseFeedback, 'id' | 'submittedAt'>): ResponseFeedback {
  const record: ResponseFeedback = {
    ...entry,
    id: `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: new Date().toISOString(),
  };

  const existing = loadResponseFeedback().filter((item) => item.messageId !== record.messageId);
  const next = [record, ...existing];

  if (typeof window !== 'undefined') {
    localStorage.setItem(RESPONSE_FEEDBACK_STORAGE_KEY, JSON.stringify(next));
    notifyChanged();
  }

  return record;
}

export function getFeedbackForMessage(messageId: string): ResponseFeedback | undefined {
  return loadResponseFeedback().find((item) => item.messageId === messageId);
}

export function hasSubmittedFeedback(messageId: string): boolean {
  return Boolean(getFeedbackForMessage(messageId));
}

export function removeResponseFeedback(messageId: string): boolean {
  const existing = loadResponseFeedback();
  const next = existing.filter((item) => item.messageId !== messageId);

  if (next.length === existing.length) {
    return false;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(RESPONSE_FEEDBACK_STORAGE_KEY, JSON.stringify(next));
    notifyChanged();
  }

  return true;
}
