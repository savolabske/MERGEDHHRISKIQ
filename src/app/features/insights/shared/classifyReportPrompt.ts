export type ReportPromptLane = 'dashboard' | 'chat';

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Prompts that should stay in chat — no dashboard reshape. */
export function isChatOnlyPrompt(query: string): boolean {
  const t = query.toLowerCase().trim();
  if (!t) return true;

  if (/^(hi|hello|hey|thanks|thank you|thx|ok|okay|cheers|bye|goodbye)\b[!.?\s]*$/.test(t)) {
    return true;
  }

  if (
    /what does .+ (mean|stand for)|what is the difference|what's the difference|define |meaning of|how often|how is this (updated|synced)|when (is|was) this (updated|synced)|what is aims\b|what is dtm\b|what is sjf\b|what is iom\b|can you export|who (built|made) this/.test(
      t,
    )
  ) {
    return true;
  }

  if (
    /^(tell me more|more|why\??|how\??|what\??|explain\??|help\??)$/.test(t) ||
    (t.length < 18 &&
      !/(show|compare|analy|break|trend|which|where|who|list|rank|top|underfund|summar|fund|donor|sector|region|window|displac|cause|migrat|deposit|programme|project|202\d)/.test(
        t,
      ))
  ) {
    return true;
  }

  return false;
}

type ReportChatContext = 'aid-flow' | 'migration' | 'sjf';

export function getChatOnlyAnswer(context: ReportChatContext, query: string): string {
  const t = query.toLowerCase().trim();

  if (/^(thanks|thank you|thx|cheers)\b/.test(t)) {
    const thanks: Record<ReportChatContext, string> = {
      'aid-flow':
        'Happy to help. Ask about donors, sectors, regions, or trends — or pick a suggestion to open a full view.',
      migration:
        'Happy to help. Ask about causes, regions, movement patterns, or needs — or pick a suggestion to open a full view.',
      sjf: 'Happy to help. Ask about donors, windows, programmes, or financials — or pick a suggestion to open a full view.',
    };
    return thanks[context];
  }

  if (/^(hi|hello|hey)\b/.test(t)) {
    const hello: Record<ReportChatContext, string> = {
      'aid-flow': 'Hello. Ask about aid flows, donors, sectors, or regions — I can answer here or open a detailed view.',
      migration: 'Hello. Ask about displacement causes, regions, or trends — I can answer here or open a detailed view.',
      sjf: 'Hello. Ask about the Joint Fund — donors, windows, programmes, or deposits. I can answer here or open a detailed view.',
    };
    return hello[context];
  }

  if (/committed|disbursed|planned|envelope/.test(t) && /difference|mean|what is|what's/.test(t)) {
    return 'Committed is what donors have pledged; disbursed is what has actually been paid out; planned is forward pipeline in the dataset. Use filters on the main report to explore each slice — or ask for a specific breakdown to open a view.';
  }

  if (/how often|updated|synced/.test(t)) {
    const sync: Record<ReportChatContext, string> = {
      'aid-flow': 'Aid Flow pulls from AIMS + SSF and is synced nightly.',
      migration: 'Displacement data comes from IOM DTM ETT weekly updates.',
      sjf: 'Somalia Joint Fund figures are sourced from the fund portfolio and updated on the fund reporting cycle.',
    };
    return sync[context];
  }

  if (/^(tell me more|more|why\??|how\??|what\??|explain\??|help\??)$/.test(t)) {
    return 'Which angle should I focus on? Pick a topic below to open a full breakdown on the left.';
  }

  return `I can help with that in chat, but there isn't a dedicated view for "${query.trim()}". Pick a topic below if you want charts and detail on the left.`;
}
