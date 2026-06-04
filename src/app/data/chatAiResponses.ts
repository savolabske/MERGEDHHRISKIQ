export type ChatAiResponseConfig = {
  response: {
    content: string;
    contentType:
      | 'text'
      | 'table'
      | 'matrix'
      | 'briefing'
      | 'comparison'
      | 'geographic'
      | 'incidents';
    data?: { headers: string[]; rows: string[][] };
  };
  followUps?: string[];
};

export function getChatAiResponse(query: string, messageCount: number): ChatAiResponseConfig {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('security incident') && lowerQuery.includes('lower shabelle')) {
    return {
      response: {
        content:
          '🛡️ **Lower Shabelle — Last 30 days**\n\n**9 incidents** in 30 days, mostly **Afgooye** and **Marka**. Armed clashes and IEDs drive the highest exposure; **3 rated high risk**. [Source 1]\n\n• Two missions rerouted; **no staff casualties** [Source 2]\n• Slight **uptick** vs the prior cycle [Source 2]\n• Restrict to essential movements; **armed escort** mandatory [Source 1]',
        contentType: 'incidents',
      },
      followUps: [
        'Compare this to the same period last year',
        'What are the recommended security protocols?',
        'Show me incidents in other regions',
      ],
    };
  }

  if (
    lowerQuery.includes('contractor') &&
    (lowerQuery.includes('flagged') ||
      lowerQuery.includes('compliance') ||
      lowerQuery.includes('delivery'))
  ) {
    return {
      response: {
        content:
          '🤝 **Flagged contractors**\n\n**8 vendors** flagged (**$4.7M** combined). **2 critical** need immediate action. [Source 2]\n\n🔴 **Baraako Logistics** — missed deliveries, cold-chain breach ($850K) [Source 2]\n🔴 **Sahal Construction** — failed inspections; stop-work issued ($1.2M) [Source 2]\n🟠 **Hormuud Transport** — breakdowns, insurance lapse ($420K) [Source 1]\n🟠 **Jubba Tech** — outages and SLA breaches ($380K) [Source 1]\n\n• Replace or suspend **critical** vendors this week [Source 2]\n• Reduce single-vendor exposure on Banadir routes [Source 1]',
        contentType: 'text',
      },
      followUps: [
        'What is our vendor selection process?',
        'Show me contract performance metrics over time',
        'How do we mitigate vendor risk?',
      ],
    };
  }

  if (lowerQuery.includes('access constraint') && lowerQuery.includes('jubaland')) {
    return {
      response: {
        content:
          '🚧 **Jubaland access**\n\nReach is **restricted** — about **34%** of target populations are reachable through standard modalities. [Source 1]\n\n🔴 **Security** — AS control in ~60% of rural districts; 12 access denials in 45 days [Source 1]\n🟠 **Infrastructure** — Kismayo–Jilib road impassable in rains; key bridges out [Source 2]\n🟡 **Admin** — permits take 5–14 days; dual federal/state approvals [Source 2]\n\n• Use remote programming and cash where face-to-face access fails [Source 1]\n• Prioritize Kismayo environs; avoid Jamaame/Jilib without negotiated access [Source 2]',
        contentType: 'text',
      },
      followUps: [
        'What are the access trends over the past 6 months?',
        'Compare access constraints across all regions',
        'Show negotiated access success rates',
      ],
    };
  }

  if (lowerQuery.includes('summarize') && lowerQuery.includes('top') && lowerQuery.includes('operational')) {
    return {
      response: {
        content:
          '🧭 **Top operational risks — February 2026**\n\n**Moderate rise** in high-likelihood risks across South-Central Somalia. [Source 3]\n\n• **Armed conflict** limiting field mobility [Source 1]\n• **Flooding** disrupting riverine access [Source 2]\n• **Supply delays** hitting humanitarian delivery [Source 3]\n\nHighest impact clusters: **Lower Shabelle, Hiraan, and Bay**. [Source 3]',
        contentType: 'matrix',
      },
      followUps: [
        'Show me risks in the critical zone',
        'Which risks have escalated this month?',
        'Break down security risks by region',
      ],
    };
  }

  if (
    lowerQuery.includes('what should i be worried about') ||
    lowerQuery.includes("today's risk overview") ||
    lowerQuery.includes('worried about today') ||
    lowerQuery.includes("today's risk overview")
  ) {
    return {
      response: {
        content:
          '**Today\'s priorities — 2 Mar 2026**\n\n**Lower Shabelle** security is deteriorating: **3 incidents** in 72h (IED on Afgooye corridor, checkpoint activity near Marka). Restrict to essential travel with armed escort. [Source 1]\n\n• **Cholera** in Baidoa IDP camps: **89 cases** this week — containment lagging [Source 3]\n• **Port delays** affecting 3 health programmes (~12k beneficiaries) [Source 3]\n• **Heavy rain** mid-week — pre-position supplies before roads cut [Source 1]\n\n🟢 **Positive:** Galmudug mediation holding; Jubaland access talks progressing [Source 1]',
        contentType: 'matrix',
      },
      followUps: [
        'Show me the Lower Shabelle security incidents in detail',
        'What are the cholera containment protocols?',
        'Which supply routes are still operational?',
      ],
    };
  }

  if (lowerQuery.includes('compare') && lowerQuery.includes('last month')) {
    return {
      response: {
        content:
          '📈 **February vs January 2026**\n\nRisk profile **worsened**: high-likelihood threats **+12%**, severe-impact **+8%**. Conflict entries rose **9 → 13**; flooding intensified in **Hiraan** and **Middle Shabelle**. [Source 3]\n\n| Category | Jan | Feb |\n|----------|-----|-----|\n| High likelihood | 8 | 9 |\n| Severe impact | 5 | 6 |\n| Conflict risks | 9 | 13 |\n\nPrimary driver: renewed insecurity in **Lower Shabelle**. [Source 1]',
        contentType: 'comparison',
      },
    };
  }

  if (lowerQuery.includes('map') && lowerQuery.includes('increase')) {
    return {
      response: {
        content:
          '🗺️ **Geographic escalation — February**\n\n🔴 **Lower Shabelle** — +3 conflict risks [Source 1]\n🟠 **Hiraan** — +2 flood risks [Source 2]\n🟡 **Bay** — +1 logistics constraint [Source 3]\n\nClusters align with supply routes and riverine settlements. [Source 1]',
        contentType: 'geographic',
      },
    };
  }

  if (lowerQuery.includes('matrix') || lowerQuery.includes('visual') || (lowerQuery.includes('map') && !lowerQuery.includes('increase'))) {
    return {
      response: {
        content:
          '**Risk matrix** — likelihood × impact. Critical items (**RSK-SEC-070**, **RSK-ECO-069**) sit in the high/high quadrant. [Source 3]',
        contentType: 'matrix',
      },
    };
  }

  if (lowerQuery.includes('table') || lowerQuery.includes('list all') || lowerQuery.includes('show all')) {
    return {
      response: {
        content: '**Critical risks** — current register snapshot: [Source 3]',
        contentType: 'table',
        data: {
          headers: ['Risk ID', 'Title', 'Category', 'Risk Level', 'Status'],
          rows: [
            ['RSK-SEC-070', 'Staff Kidnapping Threat', 'Security', 'CRITICAL', 'Escalating'],
            ['RSK-ECO-069', 'Donor Funding Reduction', 'Economic', 'HIGH', 'Active'],
            ['RSK-HUM-065', 'Cholera Outbreak Risk', 'Health', 'HIGH', 'Active'],
            ['RSK-LOG-063', 'Supply Chain Disruption', 'Logistics', 'MEDIUM', 'Stable'],
          ],
        },
      },
    };
  }

  if (lowerQuery.includes('escalat') || lowerQuery.includes('security threat')) {
    return {
      response: {
        content:
          '**Escalating security — February 2026**\n\nAl-Shabaab attacks **+34%** (90d); shift toward **soft targets** (hotels, restaurants). VBIED sophistication improving. [Source 1]\n\n• **3 kidnapping attempts** on aid workers in 14 days [Source 1]\n🔴 **Districts 1 & 16** — limited government control; armed escort mandatory [Source 1]\n🔴 **Airport Road / KM4** — 8 incidents in 60 days [Source 1]\n\n**Now:** two-vehicle convoys, journey management, vary routes/timing. [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('humanitarian') || lowerQuery.includes('region') || lowerQuery.includes('break')) {
    return {
      response: {
        content:
          '**Humanitarian risks by region**\n\n**Banadir** — security **critical**; **214 cholera cases** in IDP sites; movement restricted after 19:00. [Source 1]\n\n• **Bay** — kidnapping risk high; **312 cholera cases**; GAM **18.4%** [Source 3]\n• **Lower Juba** — measles outbreak (**89 cases**); rural access limited [Source 2]\n• **Middle Shabelle** — flooding displaced **23k**; cholera rising [Source 2]\n\n**Cross-cutting:** ~**37%** of targets in AS/contested areas; 8 missions denied in 30 days. [Source 3]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('trend') || lowerQuery.includes('change') || lowerQuery.includes('pattern')) {
    return {
      response: {
        content:
          '**Risk trends — last 90 days**\n\nSecurity incidents accelerating (**+45%** in 30d vs **+34%** over 90d) — pattern matches prior escalation cycles (2018, 2022). [Source 1]\n\n• **Cholera:** secondary surge to **847 cases** (Feb) after flooding displacement [Source 3]\n• **Funding:** ECHO **−25%** signal; SIDA non-renewal (**€4.2M**); ~**28%** gap Q2–Q3 [Source 3]\n\nPrioritize Lower Shabelle movement controls and cholera surge funding. [Source 1]',
        contentType: 'text',
      },
    };
  }

  if (
    (lowerQuery.includes('security protocol') || lowerQuery.includes('recommended security')) &&
    lowerQuery.includes('afgooye')
  ) {
    return {
      response: {
        content:
          '🛡️ **Afgooye corridor protocols**\n\n**7 incidents** in 30 days — treat as **high threat**. All movements need Security Cell approval **48h** ahead. [Source 3]\n\n• **Daylight only** (07:00–16:30); no weekend travel [Source 3]\n• **2 armed guards** minimum; GPS check-in every **15 min** [Source 3]\n• Use approved green routes; **avoid KM13** [Source 3]\n\n🔴 **Threat level: HIGH** [Source 1]',
        contentType: 'text',
      },
    };
  }

  if (
    lowerQuery.includes('afgooye') &&
    (lowerQuery.includes('ied') || lowerQuery.includes('incident') || lowerQuery.includes('corridor'))
  ) {
    return {
      response: {
        content:
          '🛡️ **IED incidents — Afgooye corridor**\n\n**5 IED-related events** in 30 days on Afgooye–Marka routes; **KM13** remains the highest-risk junction. [Source 1]\n\n• **2 convoy strikes**; roads closed up to **6 hours** [Source 1]\n• Illegal checkpoints add **2+ hour** delays [Source 2]\n\n🔴 Armored escort mandatory; vary timing and routes. [Source 2]',
        contentType: 'incidents',
      },
    };
  }

  if (lowerQuery.includes('middle shabelle') && lowerQuery.includes('shabaab')) {
    return {
      response: {
        content:
          '**Al-Shabaab — Middle Shabelle (this month)**\n\nActivity **up ~28%** vs last month: taxation checkpoints on Mogadishu–Jowhar road and night raids on riverine villages. [Source 1]\n\n• **4 ambush incidents** near Jowhar in past 30 days [Source 1]\n• Flooding limits response mobility in **14 underwater villages** [Source 2]\n\n🔴 Avoid unpaved routes after 18:00; notify UNDSS before movements. [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('staff safety') || (lowerQuery.includes('safety') && lowerQuery.includes('incident'))) {
    return {
      response: {
        content:
          '**Staff safety — last 60 days**\n\n**11 staff-related incidents** logged: **3 near-miss kidnappings**, **5 movement restrictions**, **2 vehicle interceptions** (no casualties). [Source 1]\n\n• Highest exposure: **Afgooye corridor**, **Baidoa rural**, **Kismayo outskirts** [Source 1]\n• **2 INGO compounds** reported surveillance activity [Source 2]\n\n🔴 Reinforce journey management and curfew compliance. [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('compare') && lowerQuery.includes('mogadishu') && lowerQuery.includes('baidoa')) {
    return {
      response: {
        content:
          '**Mogadishu vs Baidoa — risk comparison**\n\n**Mogadishu:** security **critical** (VBIED/clan violence); cholera in IDP sites **214 cases**. [Source 1]\n\n**Baidoa:** kidnapping risk **high** on rural roads; cholera **312 cases**; GAM **18.4%**. [Source 3]\n\n• Mogadishu: restrict night movement; KM4/Airport Road highest incident density [Source 1]\n• Baidoa: escort for >15km travel; prioritize WASH in IDP camps [Source 3]',
        contentType: 'comparison',
      },
    };
  }

  if (lowerQuery.includes('kidnapping') && lowerQuery.includes('hiraan')) {
    return {
      response: {
        content:
          '**Kidnapping threat — Hiraan**\n\nThreat level **HIGH**: criminal networks active on Beledweyne supply routes; **2 attempted abductions** in 45 days. [Source 1]\n\n• Ransom bands share targeting data with local militias [Source 1]\n• Flooding reduces escape routes — longer convoy exposure [Source 2]\n\n🔴 Two-vehicle convoys, 30-min check-ins, no predictable schedules. [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (
    lowerQuery.includes('flood') &&
    (lowerQuery.includes('riverine') || lowerQuery.includes('infrastructure') || lowerQuery.includes('impact'))
  ) {
    return {
      response: {
        content:
          '🌊 **Flood impact — riverine districts**\n\nShabelle overflow (10–22 Feb): **$12.8M** infrastructure damage; **48,000** affected in Hiraan and Middle Shabelle. [Source 1]\n\n🔴 **Beledweyne bridge** closed — +180km detours [Source 1]\n🔴 **Jowhar–Balcad road** impassable [Source 1]\n\n• Bailey bridge + emergency water trucking this week [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('supply chain') && lowerQuery.includes('health')) {
    return {
      response: {
        content:
          '**Supply chain — health programmes**\n\n**3 active health programmes** delayed **14+ days**; port customs hold primary cause. [Source 3]\n\n• **~12,000 beneficiaries** affected across Bay and Hiraan [Source 3]\n• **2 mobile clinic** deployments postponed [Source 2]\n\n🔴 Escalate customs clearance; activate contingency pharma stock. [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('rsk-sec-070') || (lowerQuery.includes('mitigat') && lowerQuery.includes('kidnapping'))) {
    return {
      response: {
        content:
          '**Mitigations — RSK-SEC-070 (kidnapping)**\n\n**CRITICAL** threat to humanitarian staff in Mogadishu, Baidoa, and Kismayo corridors. [Source 1]\n\n• **0–48h:** Red Alert; suspend non-essential travel; armed escort only [Source 1]\n• **1–2 weeks:** two-vehicle convoys, GPS check-ins every **30 min** [Source 2]\n• Brief all staff on counter-surveillance; vary routes/times [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('cholera') && (lowerQuery.includes('prevent') || lowerQuery.includes('spread'))) {
    return {
      response: {
        content:
          '💧 **Cholera prevention — next 72h**\n\nFocus on **water safety** and **case detection** in affected IDP camps. [Source 3]\n\n• Chlorinate all points to **0.5 mg/L**; 3× daily testing [Source 3]\n• Deploy emergency water bladders; double trucking [Source 2]\n• Expand CTC capacity; pre-position IV fluids [Source 3]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('sahal') && lowerQuery.includes('terminat')) {
    return {
      response: {
        content:
          '📋 **Terminate Sahal Construction**\n\nGrounds: **material breach** — **67 units** failed inspection, falsified progress claims. [Source 2]\n\n• **Day 1:** notice of breach, stop-work, freeze payments [Source 2]\n• **Days 6–10:** third-party structural audit (~$18k) [Source 2]\n• **Days 20–40:** fast-track replacement contractor [Source 2]\n\n🔴 Cordon failed units; deploy emergency shelter tents [Source 1]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('clan violence') && lowerQuery.includes('mogadishu')) {
    return {
      response: {
        content:
          '**Clan violence — Mogadishu districts**\n\n**6 clan-related incidents** in 30 days, mainly **Hamarweyne** and **Hodan**; often tied to market disputes and elections. [Source 1]\n\n• **Bakara Market** periphery highest flare-up risk [Source 1]\n• Spikes follow security operations or resource disputes [Source 2]\n\n🔴 Avoid large gatherings; monitor local elder channels before movements. [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('kismayo') && lowerQuery.includes('afmadow') && lowerQuery.includes('road')) {
    return {
      response: {
        content:
          '**Kismayo–Afmadow road conditions**\n\nRoad **CONDITIONAL** — armed escort required; **112 km** average **9–12 km/h** on unpaved sections. [Source 1]\n\n🟠 **Rainy season:** impassable Nov–Jan; bridge damage at 2 river crossings [Source 2]\n🔴 **Criminal kidnapping risk** on isolated segments [Source 1]\n\n• Daylight-only movements; no stops en route [Source 2]',
        contentType: 'text',
      },
    };
  }

  if (lowerQuery.includes('risk matrix') || (lowerQuery.includes('matrix') && lowerQuery.includes('q1'))) {
    return {
      response: {
        content:
          '**Risk matrix — Q1 2026**\n\n**247 active risks** mapped; **18 critical** in high/high quadrant. [Source 3]\n\n• **Security cluster:** Lower Shabelle convoy/IED risks [Source 1]\n• **Operational cluster:** port delays, vendor compliance [Source 3]\n• **Health cluster:** cholera in Bay IDP sites [Source 2]\n\nSee matrix below for likelihood × impact view. [Source 3]',
        contentType: 'matrix',
      },
    };
  }

  if (
    lowerQuery.includes('mitigat') ||
    lowerQuery.includes('recommend') ||
    lowerQuery.includes('action') ||
    (lowerQuery.includes('what should') && !lowerQuery.includes('worried'))
  ) {
    return {
      response: {
        content:
          '**Priority mitigations**\n\n**RSK-SEC-070 (kidnapping)** — Red Alert in Mogadishu, Baidoa, Kismayo; suspend non-essential travel; armed escort only. [Source 1]\n\n• **48h:** safe rooms, two-vehicle convoys, 30-min check-ins [Source 2]\n• **RSK-ECO-069 (funding):** scenario plan for 20–40% cuts; freeze non-critical spend [Source 3]\n• **RSK-HUM-065 (cholera):** ORS points, water tablets, activate CTCs with WHO [Source 3]',
        contentType: 'text',
      },
    };
  }

  if (messageCount === 1 || lowerQuery.includes('mogadishu') || lowerQuery.includes('critical risk')) {
    return {
      response: {
        content:
          '**Mogadishu threat picture**\n\nAl-Shabaab remains active — **3–5 major incidents/month**, mainly VBIEDs and complex attacks. Clan violence flares near **Bakara Market** and peripheral districts. [Source 1]\n\n🔴 **Districts 1 & 16** and **KM4 / Airport Road** — highest movement risk [Source 1]\n• **3 kidnapping attempts** on aid workers in 14 days [Source 1]\n• **214 cholera cases** in IDP camps (30d) [Source 3]\n\n**Actions:** armed escorts in red zones; avoid KM4 at rush hour; no ops after **19:00**. [Source 2]',
        contentType: 'text',
      },
    };
  }

  return {
    response: {
      content:
        '**Risk intelligence**\n\nI analyse **156 active risks** across Somalia using internal registers, 18 months of field data, and feeds (UNDSS, WHO, OCHA). [Source 3]\n\n• **Security** — threats, kidnapping patterns, district assessments [Source 1]\n• **Regional breakdown** — health, access, displacement [Source 3]\n• **Mitigations & trends** — matrix view and time-series [Source 3]\n\nAsk about a location, threat type, or operational concern.',
      contentType: 'text',
    },
  };
}

export function getWebIntelligenceSummary(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes('worried about') ||
    lowerQuery.includes("today's risk") ||
    lowerQuery.includes('risk overview')
  ) {
    return `**External signals** (supplementary) [Source 1]

• Elevated security reporting in **Lower Shabelle** [Source 1]
• Public health pressure in **Baidoa** IDP sites [Source 2]
• **~34%** of planned missions affected by access constraints (60d) [Source 2]

Validate against internal incident logs before changing movement rules.`;
  }

  if (lowerQuery.includes('summarize') && lowerQuery.includes('operational')) {
    return `**External signals** [Source 1]

• **~23%** rise in security events affecting aid ops (quarter) [Source 1]
• Checkpoint activity on **Mogadishu–Afgooye** corridor [Source 1]
• Health emergencies (AWD/cholera) in IDP settlements [Source 2]`;
  }

  if (lowerQuery.includes('lower shabelle') || lowerQuery.includes('security incident')) {
    return `**External signals** [Source 1]

• Uptick in confrontations along **Afgooye–Marka** [Source 1]
• Checkpoint incidents reported by humanitarian actors [Source 1]
• **~40%** of rural Lower Shabelle missions disrupted [Source 2]`;
  }

  if (lowerQuery.includes('contractor') || lowerQuery.includes('vendor') || lowerQuery.includes('high-risk')) {
    return `**External signals** [Source 2]

• Stronger vendor due diligence cuts delivery risk ~**45%** (sector benchmarks) [Source 2]
• KPI-based contracts improve outcomes in fragile settings [Source 2]`;
  }

  if (lowerQuery.includes('jubaland') || lowerQuery.includes('access constraint')) {
    return `**External signals** [Source 1]

• **60–70%** of rural Jubaland districts severely access-limited [Source 1]
• Security denials drive most mission cancellations [Source 1]`;
  }

  return `**External signals** [Source 1]

• Elevated security events in south-central Somalia [Source 1]
• Checkpoint activity on major supply routes [Source 1]
• Health and access constraints in IDP areas [Source 2]`;
}

export function buildRefinedKnowledgeResponse(baseContent: string, originalQuery: string): string {
  const focusArea = originalQuery.trim() || 'current priorities';
  const firstLine =
    baseContent
      .replace(/\\n/g, '\n')
      .split('\n')
      .map((l) => l.replace(/\*\*/g, '').trim())
      .find(Boolean) || 'Internal indicators show elevated pressure in this area.';

  return `**Refined takeaway — ${focusArea}**

${firstLine} [Source 2]

• Tighten movement and logistics where incidents cluster [Source 1]
• Increase monitoring on accelerating indicators [Source 3]`;
}

export function buildRefinedWebIntelligence(query: string): string {
  return getWebIntelligenceSummary(query).replace(
    '**External signals**',
    '**External signals (refined)**'
  );
}

export const DEFAULT_CHAT_SOURCES = [
  {
    id: '1',
    type: 'knowledge-base' as const,
    title: 'Security Incident Reporting SOP',
    excerpt:
      'Standard operating procedures for documenting, escalating, and reporting security incidents across UN mission locations in Somalia.',
    date: 'Feb 15, 2026',
    category: 'Resources',
    documentId: '3',
  },
  {
    id: '2',
    type: 'knowledge-base' as const,
    title: 'Somalia Security Risk Assessment Q4 2025',
    excerpt: 'Regional security analysis including incident trends, threat actors, and movement advisories.',
    date: 'Feb 15, 2026',
    category: 'Security Reports',
  },
  {
    id: '3',
    type: 'knowledge-base' as const,
    title: 'Internal Risks - Critical Threats Database',
    excerpt: 'Internal database of active risks with likelihood, impact, and historical incident data.',
    date: 'Updated daily',
    category: 'Internal Database',
  },
];

export type ChatHistoryMessage = {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  contentType: string;
  data?: { headers: string[]; rows: string[][] };
  isTyping?: boolean;
  sources?: typeof DEFAULT_CHAT_SOURCES;
  webIntelligenceSummary?: string;
};

/** Single-turn thread for chats list items without hand-crafted history. */
export function createChatHistoryThread(userQuery: string, idPrefix: string): ChatHistoryMessage[] {
  const config = getChatAiResponse(userQuery, 1);
  return [
    {
      id: `${idPrefix}-user`,
      type: 'user',
      content: userQuery,
      contentType: 'text',
    },
    {
      id: `${idPrefix}-assistant`,
      type: 'assistant',
      content: config.response.content,
      contentType: config.response.contentType,
      data: config.response.data,
      isTyping: false,
      sources: [...DEFAULT_CHAT_SOURCES],
      webIntelligenceSummary: getWebIntelligenceSummary(userQuery),
    },
  ];
}

/** Ensures history threads use concise formatted replies, source pills, and web intel. */
export function normalizePreloadedMessages(messages: any[]): ChatHistoryMessage[] {
  let userTurn = 0;

  return messages.map((message, index) => {
    if (message.type === 'user') {
      userTurn += 1;
      return {
        ...message,
        contentType: message.contentType || 'text',
      };
    }

    if (message.type !== 'assistant') {
      return message;
    }

    const priorUser = [...messages]
      .slice(0, index)
      .reverse()
      .find((entry) => entry.type === 'user');
    const query = (priorUser?.content as string) || '';
    const config = getChatAiResponse(query, userTurn);
    const useStoredContent =
      typeof message.content === 'string' &&
      message.content.includes('[Source') &&
      message.content.length < 1200;

    return {
      ...message,
      content: useStoredContent ? message.content : config.response.content,
      contentType: useStoredContent ? message.contentType || 'text' : config.response.contentType,
      data: useStoredContent ? message.data : config.response.data,
      isTyping: false,
      displayedContent: undefined,
      sources:
        message.sources?.length > 0 ? message.sources : [...DEFAULT_CHAT_SOURCES],
      webIntelligenceSummary:
        message.webIntelligenceSummary ?? getWebIntelligenceSummary(query),
      senderId: message.senderId,
      senderName: message.senderName,
    };
  });
}

export const CHAT_LIST_QUERIES: Record<string, string> = {
  '6': 'Al-Shabaab activity patterns in Middle Shabelle this month',
  '7': 'What are the access constraints for operations in Jubaland?',
  '8': 'Staff safety incidents reported in the last 60 days',
  '9': 'Compare risk levels between Mogadishu and Baidoa',
  '10': 'What is the current threat level for kidnapping in Hiraan?',
  '11': 'Show me IED incidents along the Afgooye corridor',
  '12': 'Flood impact assessment for riverine districts',
  '13': 'Supply chain delays affecting health programs',
  '14': 'What are the mitigation strategies for RSK-SEC-070?',
  '15': 'Political instability risks in Galmudug state',
  '16': 'Community acceptance issues in Gedo region',
  '17': 'Malnutrition rates in Bay region IDP settlements',
  '18': 'Show escalating security threats in South-Central Somalia',
  '19': 'VBIED attacks targeting government buildings - trend analysis',
  '20': 'What are the road conditions between Kismayo and Afmadow?',
  '21': 'Clan violence incidents in Mogadishu districts',
  '22': 'Partner NGO capacity issues in Jubaland operations',
  '23': 'Checkpoint taxation by AS along major supply routes',
  '24': 'Water trucking vendor performance in Bay region',
  '25': 'What is the current fuel shortage impact on field operations?',
  '26': 'Seasonal flooding forecast for Gu season 2026',
  '27': 'AMISOM troop withdrawal risks in Sector 2',
  '28': 'Medical evacuation constraints from remote field sites',
  '29': 'Show me the risk matrix for Q1 2026',
  '30': 'Cross-border incursions from Kenya - security implications',
  '31': 'Drought impact on pastoralist communities in Sool region',
  '32': 'What are the COVID-19 variant transmission risks in camps?',
  '33': 'Currency devaluation impact on program budgets',
  '34': 'Telecommunications outages affecting remote monitoring',
  '35': 'Female staff safety concerns in conservative districts',
  '36': 'Explosive remnants of war (ERW) contamination in Afmadow',
  '37': 'Donor funding gaps for health sector programming',
  '38': 'What are the humanitarian access negotiation outcomes with AS?',
  '39': 'Compound security assessment vulnerabilities in Baidoa',
  '40': 'Measles outbreak risk in under-vaccinated populations',
};
