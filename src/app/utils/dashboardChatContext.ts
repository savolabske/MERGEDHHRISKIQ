import {
  DASHBOARD_BRIEFING,
  DASHBOARD_RISK_STATUS,
} from '../data/dashboardMock';
import {
  HUB_BRIEFING,
  HUB_MAIN_INSIGHT,
  HUB_PREDICTIVE_INSIGHTS,
  type HubPredictiveTheme,
} from '../data/homeDashboardMock';
import { RISK_IQ_USER } from './mockUsers';

const DASHBOARD_KNOWLEDGE_SOURCES = [
  {
    id: '1',
    type: 'knowledge-base' as const,
    title: 'WASH Sector Assessment Q1',
    excerpt:
      'Quarterly water, sanitation, and hygiene sector assessment from your Resources library — coverage gaps and partner coordination in priority districts.',
    url: 'https://docs.riskiq.local/wash-sector-assessment-q1',
    date: 'Feb 18, 2026',
    category: 'Resources',
    documentId: '2',
  },
  {
    id: '3',
    type: 'knowledge-base' as const,
    title: 'Internal Risks - Critical Threats Database',
    excerpt:
      'Internal database containing 156 active risks across all operational areas, including likelihood scores, impact assessments, and historical incident data.',
    url: 'https://docs.riskiq.local/internal-risks-critical-threats-database',
    date: 'Updated daily',
    category: 'Internal Database',
  },
];

export type DashboardResponseContentType =
  | 'text'
  | 'table'
  | 'matrix'
  | 'briefing'
  | 'comparison'
  | 'geographic'
  | 'incidents';

export type DashboardChatPayload = {
  title: string;
  prompt: string;
  context: string;
  response: string;
  contentType: DashboardResponseContentType;
  data?: { headers: string[]; rows: string[][] };
};

const cardInteractiveClass =
  'cursor-pointer transition-all duration-150 hover:shadow-md active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25';

export const dashboardCardClass = {
  white: `${cardInteractiveClass} hover:border-primary active:border-primary`,
  gradient: `${cardInteractiveClass} hover:brightness-[1.03] active:brightness-[0.98]`,
  row: `${cardInteractiveClass} hover:bg-primary-subtle active:bg-primary-subtle rounded-xl -mx-2 px-2`,
} as const;

export function buildDashboardThreadMessages(payload: DashboardChatPayload) {
  return [
    {
      id: 'dashboard-user-1',
      type: 'user' as const,
      content: payload.prompt,
      contentType: 'text' as const,
    },
    {
      id: 'dashboard-assistant-1',
      type: 'assistant' as const,
      content: payload.response,
      contentType: payload.contentType,
      data: payload.data,
      isTyping: false,
      sources: DASHBOARD_KNOWLEDGE_SOURCES,
      originatingQuery: payload.prompt,
      senderId: RISK_IQ_USER.id,
      senderName: RISK_IQ_USER.name,
    },
  ];
}

/** Assistant config for live streaming when opening chat from dashboard/home cards. */
export function getDashboardStreamingResponse(payload: DashboardChatPayload) {
  const assistant = buildDashboardThreadMessages(payload)[1];
  return {
    content: assistant.content,
    contentType: assistant.contentType as DashboardResponseContentType,
    data: assistant.data,
    sources: assistant.sources ?? DASHBOARD_KNOWLEDGE_SOURCES,
  };
}

export function buildHubInsightChatPayload(): DashboardChatPayload {
  const { body } = HUB_MAIN_INSIGHT;
  return {
    title: 'Main insight — Somalia',
    prompt:
      'Summarise the latest humanitarian picture for Somalia across aid delivery, climate stress, and displacement using the most recent cluster and field data in the system.',
    context:
      'System query — synthesize Humanity Hub main insight from humanitarian snapshots, DTM, FSNAU, and cluster reporting.',
    response: `Based on the latest humanitarian data (${HUB_MAIN_INSIGHT.meta}), here is your main insight:

${body.lead} **${body.foodInsecure}** in **${body.regions}** ${body.into} **${body.idpSites}** ${body.displacementChange} ${body.tail}

**Aid:** Bay and Bakool corridors need early stock and funding checks before Gu season peaks.

**Climate:** Central regions remain dry; watch Middle Shabelle for late heavy rains.

**Displacement:** Coordinate WASH and shelter surge with camp managers in Baidoa and Mogadishu. [Source 1]`,
    contentType: 'text',
  };
}

export function buildHubPredictiveInsightChatPayload(insight: {
  themeId: HubPredictiveTheme;
  theme: string;
  horizon: string;
  title: string;
  description: string;
  footer: readonly { label: string }[];
}): DashboardChatPayload {
  const footer = insight.footer.map((f) => f.label).join(' · ');

  const payloads: Record<HubPredictiveTheme, DashboardChatPayload> = {
    aid: {
      title: insight.title,
      prompt:
        'Explain the 30-day aid-flow outlook for Somalia WASH and nutrition pipelines, including disbursement delays and programme exposure in Bay and Bakool.',
      context: `System query — predictive aid-flow model. ${insight.title}. ${footer}`,
      response: `**${insight.title}** (${insight.theme} · ${insight.horizon})

${insight.description}

**${footer}**. Confirm donor payment dates, plan which programmes to protect first, and align prepositioning with cluster supply lines in Bay and Bakool. [Source 1] [Source 3]`,
      contentType: 'text',
    },
    climate: {
      title: insight.title,
      prompt:
        'Summarise the seasonal climate outlook for Somalia Gu rains and projected food-security impacts in central regions over the next 60–90 days.',
      context: `System query — predictive climate / FSNAU outlook. ${insight.title}. ${footer}`,
      response: `**${insight.title}** (${insight.theme} · ${insight.horizon})

${insight.description}

**${footer}**. Rains are late and vegetation stress is visible in field reports. Scale food aid in Bay and Bakool, and pair drought WASH with health checks along busy movement routes. [Source 1] [Source 3]`,
      contentType: 'text',
    },
    displacement: {
      title: insight.title,
      prompt:
        'Forecast IDP arrival trends for Baidoa and Mogadishu over the next 30 days and outline cluster capacity implications for WASH and shelter.',
      context: `System query — predictive displacement / DTM forecast. ${insight.title}. ${footer}`,
      response: `**${insight.title}** (${insight.theme} · ${insight.horizon})

${insight.description}

**${footer}**. Arrivals are running above the recent average, especially near Baidoa and Mogadishu. Preposition basic kits, agree reception capacity with local authorities, and surge shelter and WASH before sites fill. [Source 1] [Source 3]`,
      contentType: 'text',
    },
  };

  return payloads[insight.themeId];
}

type HubBriefingUpdate = {
  id: string;
  headline: string;
  description: string;
  relativeTime: string;
  absoluteTime: string;
};

/** Humanity Hub home — emerging insights (humanitarian data, not risk registers). */
export function buildHubBriefingUpdateChatPayload(update: HubBriefingUpdate): DashboardChatPayload {
  const payloads: Record<string, DashboardChatPayload> = {
    '1': {
      title: update.headline,
      prompt:
        'What do the latest rainfall and early-warning data show for Bay and Bakool, and which WASH and nutrition programmes need action in the next 48 hours?',
      context: `System query — climate early warning from cluster and field feeds. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime})

${update.description}

Rainfall is roughly **40% below the long-term average** across Bay and Bakool. Six districts crossed early-action thresholds used in prior drought responses. [Source 1]

Pre-position water trucking and therapeutic supplies in Baidoa, Burhakaba, and Hudur before river levels fall. Convene WASH and nutrition leads on trigger activation this week. [Source 3]

The geographic view below shows district-level rainfall deficit against programme footprints. [Source 3]`,
      contentType: 'geographic',
    },
    '2': {
      title: update.headline,
      prompt:
        'Review donor pledges and internal portfolio data for WASH and nutrition — which programmes face a Q3 funding gap in Somalia?',
      context: `System query — funding exposure from FTS and humanitarian portfolio resources. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime} · ${update.absoluteTime})

${update.description}

Tracking shows a projected **22% Q3 gap** on WASH and nutrition lines, with six programmes in Bay and Middle Shabelle most exposed — similar to last year’s pre-HRP revision delays that led to ration cuts. [Source 1]

Prioritize donor outreach on ECHO and USAID renewals and prepare contingency scenarios for MPCA scale-down if pledges slip past July. [Source 3]

The table below lists programmes by exposure and decision timeline. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Programme track', 'Exposure', 'Decision window'],
        rows: [
          ['WASH rural Bay', '$1.8M · 3 sites', 'Q3 donor board'],
          ['CMAM nutrition Bakool', '$920K', 'Pipeline review Jul'],
          ['Urban WASH Mogadishu', '$2.1M', 'ECHO renewal'],
          ['MPCA scale-up Middle Shabelle', '$1.4M', 'FY2026 planning'],
          ['NFI/shelter contingency', 'Logistics reserve', 'This month'],
        ],
      },
    },
    '3': {
      title: update.headline,
      prompt:
        'Summarise IDP arrival trends and shelter capacity in Mogadishu peri-urban camps and outline recommended cluster actions for today.',
      context: `System query — displacement and CCCM feeds. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime})

${update.description}

Protection, camp management, and WASH partners logged a sharp rise in arrivals within **18 hours** across **Kahda, Daynile, and Garasbaley** — three camps are above agreed capacity thresholds. [Source 3]

New arrivals correlate with insecurity in Lower Shabelle and dry-season movement from Bay. Assign a lead agency for site management and fast-track latrine and water trucking in the next 72 hours. [Source 1]

The geographic view below shows camp locations versus recent arrival reporting. [Source 3]`,
      contentType: 'geographic',
    },
    '4': {
      title: update.headline,
      prompt:
        'Summarise aid diversion allegations, partner reporting, and community feedback patterns in Banadir for accountability review.',
      context: `System query — accountability pattern from partner and field resources. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime})

${update.description}

Three concurrent diversion reports in 14 days share a **gatekeeper pattern** consistent with prior Garasbaley clusters — partner reporting and beneficiary feedback align on the same distribution nodes. [Source 1]

Recommend an accountability cluster review for MPCA sites in Garasbaley and Wadajir: strengthen post-distribution monitoring, rotate distribution committees, and cross-check beneficiary lists against registration data. [Source 3]

The table below summarizes allegation types and sites flagged this fortnight. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Site', 'Allegation type', 'Reports', 'Status'],
        rows: [
          ['Garasbaley MPCA', 'Gatekeeper AD', '4', 'Under review'],
          ['Wadajir distribution', 'Undocumented deductions', '2', 'Field verification'],
          ['Kahda NFI', 'List manipulation', '1', 'Monitoring reinforced'],
        ],
      },
    },
    '5': {
      title: update.headline,
      prompt:
        'Summarise cholera and AWD surveillance trends in Mogadishu IDP sites and outline WASH and health actions for the next 72 hours.',
      context: `System query — health cluster surveillance from IDP site reporting. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime})

${update.description}

Suspected **AWD/cholera cases rose roughly 40%** week-on-week across Kahda and Dayniile, with overlapping WASH gaps at three high-density blocks. [Source 1]

Scale oral rehydration points, door-to-door hygiene messaging, and emergency chlorination on communal water points. Align health and WASH cluster leads on a joint 72-hour surge plan. [Source 3]

The table below lists sites above threshold and response status. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Site', 'Signal', 'Cases (7d)', 'Action'],
        rows: [
          ['Kahda Block 12', 'AWD/cholera', '47', 'ORP activation'],
          ['Dayniile West', 'AWD/cholera', '31', 'Hygiene surge'],
          ['Garasbaley fringe', 'WASH + health', '12', 'Chlorination today'],
        ],
      },
    },
  };

  return (
    payloads[update.id] ?? {
      title: update.headline,
      prompt:
        'Summarise this emerging humanitarian insight from workspace data and outline recommended actions for field teams.',
      context: `System query — emerging insight from humanitarian feeds. ${update.description}`,
      response: `**${update.headline}**\n\n"${update.description}"\n\nRecommended next steps are in cluster sitreps and partner updates linked to this item. [Source 1] [Source 3]`,
      contentType: 'text',
    }
  );
}

type HubKeyInsight = {
  id: string;
  headline: string;
  description: string;
  category: 'climate' | 'aid' | 'displacement';
};

const HUB_KEY_INSIGHT_CATEGORY_LABELS: Record<HubKeyInsight['category'], string> = {
  climate: 'Climate',
  aid: 'Aid flow',
  displacement: 'Displacement',
};

/** Humanity Hub home — key insights by climate, aid flow, and displacement. */
export function buildHubKeyInsightChatPayload(insight: HubKeyInsight): DashboardChatPayload {
  const categoryLabel = HUB_KEY_INSIGHT_CATEGORY_LABELS[insight.category];
  return {
    title: insight.headline,
    prompt: `Explain this ${categoryLabel.toLowerCase()} insight for Somalia and what field teams should do next.`,
    context: `System query — ${categoryLabel} key insight from humanitarian workspace data. ${insight.description}`,
    response: `**${insight.headline}**

${insight.description}

This signal is flagged under **${categoryLabel}** on the Humanity Hub home dashboard. Cross-check cluster sitreps, DTM, FTS, and early-warning feeds for the latest figures. [Source 1] [Source 3]`,
    contentType: 'text',
  };
}

export function buildSummaryChatPayload(): DashboardChatPayload {
  return {
    title: 'Risk intelligence summary — Somalia',
    prompt:
      'Give me the risk intelligence summary for Somalia based on the most recent risk registers and documents uploaded in the system.',
    context: `System query — synthesize morning briefing from internal risk registers, uploaded field reports, and linked documents. Output: operational picture for dashboard card.`,
    response: `**Operational picture** (${DASHBOARD_BRIEFING.summaryMeta.replace('→ ', '')})

**247 active risks** this week; **18 critical**. Most activity in **Lower Shabelle** and **Banadir** — convoy incidents on MSR-3 and checkpoint pressure on Afgooye–Marka. [Source 1]

• Security reporting **+22%** vs last period [Source 1]
• **2 contractors** flagged on Banadir logistics routes [Source 3]

**Today:** restrict Lower Shabelle travel, schedule vendor reviews, check in critical risk owners. [Source 3]`,
    contentType: 'text',
  };
}

export function buildMetricChatPayload(metric: {
  id: string;
  label: string;
  value: string;
  trend: string;
}): DashboardChatPayload {
  const payloads: Record<string, DashboardChatPayload> = {
    'aid-diversion': {
      title: `${metric.label} — ${metric.value}`,
      prompt:
        'List all open aid diversion cases and allegations in Somalia from partner reporting, ADT data, and accountability feeds — include location, type, and status.',
      context: `System query — aid diversion tracker. ${metric.value} active cases. ${metric.trend}.`,
      response: `**${metric.value} aid diversion cases** are open — **${metric.trend}**. Most new flags this week cluster in **Banadir** and the **Afgooye corridor**, with gatekeeper patterns at MPCA distribution sites and checkpoint taxation on supply routes. [Source 1]

Three concurrent allegations in Garasbaley share the same gatekeeper profile flagged in prior accountability reviews. Partner warehouse audits in Baidoa and Mogadishu also surfaced inventory gaps. [Source 3]

The table below lists each open case with location, allegation type, and review status. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Case', 'Location', 'Type', 'Status'],
        rows: [
          ['ADT-034', 'Garasbaley MPCA', 'Gatekeeper deductions', 'Under review'],
          ['ADT-031', 'Afgooye corridor', 'Checkpoint taxation', 'Field verification'],
          ['ADT-028', 'Wadajir distribution', 'Undocumented deductions', 'Monitoring reinforced'],
          ['ADT-025', 'Baidoa warehouse', 'Inventory discrepancy', 'Partner audit'],
          ['ADT-022', 'Kahda IDP', 'Ghost registrations (340)', 'Biometric rollout'],
          ['ADT-019', 'Kismayo port', 'Cargo confiscation', 'Escalated'],
        ],
      },
    },
    'security-incidents': {
      title: `${metric.label} — ${metric.value}`,
      prompt:
        'List all security incidents affecting humanitarian operations in Somalia from the last 30 days — include type, location, date, and impact on aid access.',
      context: `System query — security incident log. ${metric.value} incidents. ${metric.trend}.`,
      response: `**${metric.value} security incidents** logged in the last 30 days — **${metric.trend}**. Lower Shabelle and the Afgooye corridor account for most of the increase, with IED activity on MSR-3 and checkpoint pressure on convoy routes. [Source 1]

Four incidents in the past 72 hours alone affect planned movements this week. Armed escort is mandatory for essential travel in flagged corridors. [Source 3]

The table below lists each incident with type, location, and current impact on operations. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Date', 'Type', 'Location', 'Impact'],
        rows: [
          ['Mar 4', 'IED (safely detonated)', 'Afgooye checkpoint', 'Route delay 6h'],
          ['Mar 2', 'Convoy taxation', 'MSR-3 near Marka', 'Cargo surrendered 18%'],
          ['Feb 28', 'Vehicle hijacking attempt', 'Daynile', 'INGO convoy — no loss'],
          ['Feb 26', 'Armed robbery', 'Kahda distribution', 'NFI shipment disrupted'],
          ['Feb 22', 'Kidnapping threat', 'Mogadishu–Baidoa route', 'Travel restricted'],
          ['Feb 19', 'Mortar attack', 'Near Mogadishu airport', 'No casualties'],
          ['Feb 15', 'Checkpoint blockade', 'Jowhar road', '3-day supply delay'],
          ['Feb 12', 'AS infiltration report', 'Lower Shabelle', 'Partner movement paused'],
        ],
      },
    },
    'climate-issues': {
      title: `${metric.label} — ${metric.value}`,
      prompt:
        'List all active climate-related issues in Somalia from FSNAU, CHIRPS, and field reporting — drought, flooding, and disease signals with affected regions.',
      context: `System query — climate hazards tracker. ${metric.value} active signals. ${metric.trend}.`,
      response: `**${metric.value} active climate signals** — **${metric.trend}**. Drought stress in **Bay and Bakool** remains the dominant driver, while flash flooding in **Baidoa** and cholera risk in **Mogadishu IDP camps** add concurrent pressure. [Source 1]

Gu rainfall is roughly **40% below average** in six districts. Three health facilities in Baidoa are non-operational after flooding. WASH and nutrition programmes should pre-position before river levels drop further. [Source 3]

The table below lists each active climate issue with region, hazard type, and recommended action window. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Signal', 'Region', 'Hazard', 'Action window'],
        rows: [
          ['Gu rainfall deficit', 'Bay & Bakool', 'Drought', '48h pre-position'],
          ['Flash floods', 'Baidoa', 'Flooding', 'Active — 15K displaced'],
          ['Livestock mortality 40%', 'Bakool pastoral', 'Drought', 'Cash + vet surge'],
          ['Health facilities flooded', 'Bay Region', 'Flooding', 'Helicopter access'],
          ['AWD/cholera spike', 'Kahda & Dayniile', 'Waterborne disease', '72h WASH surge'],
          ['Crop failure 70%', 'Hudur & Wajid', 'Drought', 'Nutrition screening'],
          ['Drainage overwhelmed', 'Kahda IDP', 'Urban flooding', 'Shelter repairs'],
        ],
      },
    },
    'programmatic-risks': {
      title: `${metric.label} — ${metric.value}`,
      prompt:
        'List all open programmatic risks affecting humanitarian programme delivery in Somalia — cash, partner capacity, supply chain, and compliance issues.',
      context: `System query — programmatic risk register. ${metric.value} open items. ${metric.trend}.`,
      response: `**${metric.value} programmatic risks** remain open — **${metric.trend}**. Cash transfer suspension risk from mobile money providers and partner capacity gaps in Bay, Gedo, and Hiraan are the highest-urgency items this week. [Source 3]

Three key implementing partners are behind delivery targets, while pharmaceutical delays at Mogadishu port affect two health programmes. Q3 WASH and nutrition funding exposure adds financial pressure on six programmes. [Source 1]

The table below lists each open programmatic risk with programme, exposure, and owner. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Risk', 'Programme / area', 'Exposure', 'Owner'],
        rows: [
          ['Mobile money suspension threat', 'Nationwide MPCA', '4,200 transfers at risk', 'Cash working group'],
          ['Partner capacity shortfall', 'Bay, Gedo, Hiraan', '3 partners behind target', 'Programme leads'],
          ['Port pharmaceutical delay', 'Mogadishu health', '2 programmes affected', 'Supply chain'],
          ['Q3 WASH funding gap', 'Bay & Middle Shabelle', '$4.2M · 6 programmes', 'Resource mobilization'],
          ['Vendor compliance (Banadir)', 'Logistics contracts', '2 active vendors flagged', 'Procurement'],
          ['Beneficiary data protection', '2 IDP programmes', 'Audit finding open', 'Compliance'],
        ],
      },
    },
  };

  return (
    payloads[metric.id] ?? {
      title: `${metric.label} — ${metric.value}`,
      prompt: `Analyze ${metric.label.toLowerCase()} metrics from the latest risk register entries in the system.`,
      context: `${metric.label}: system query for register metric.`,
      response: `**${metric.label}** is **${metric.value}** (${metric.trend}). [Source 3]`,
      contentType: 'text',
    }
  );
}

export function buildCategoryChatPayload(category: {
  id: string;
  label: string;
  count: number;
}): DashboardChatPayload {
  const payloads: Record<string, DashboardChatPayload> = {
    security: {
      title: `${category.label} risks — ${category.count}`,
      prompt:
        'Scan security-related risks and recent incident reports in the register to surface the current security risk picture for Somalia.',
      context: `System query — security category breakdown from registers and incident logs.`,
      response: `**${category.count} active security risks** account for about one-third of the register. Lower Shabelle drives most of this week's increase — convoy incidents on MSR-3 near Marka, checkpoint activity on Afgooye–Marka, and elevated kidnapping reporting across humanitarian routes. [Source 1]

Three security incidents were recorded in the past 72 hours alone, including IED activity on the Afgooye corridor. Field movements in this region should be restricted to essential operations with armed escort mandatory. [Source 1]

The incident map and timeline below cover the last 30 days in Lower Shabelle. [Source 3]`,
      contentType: 'incidents',
    },
    operational: {
      title: `${category.label} risks — ${category.count}`,
      prompt:
        'Review operational risks across the register — logistics, fuel supply, and vendor performance — based on the latest uploaded programme and field documents.',
      context: `System query — operational category from registers and uploaded programme docs.`,
      response: `**${category.count} operational risks** span logistics, fuel, and vendor performance across Somalia operations. The highest-urgency items this week are generator fuel supply in Baidoa after two consecutive missed deliveries, and pharmaceutical delays at Mogadishu port affecting three health programmes. [Source 3]

**4 contractors** are flagged for compliance and delivery issues, with two actively servicing Banadir operations and creating single-point-of-failure exposure on critical supply routes. [Source 3]

The briefing matrix below groups the top operational items by likelihood and impact. [Source 3]`,
      contentType: 'briefing',
    },
    compliance: {
      title: `${category.label} risks — ${category.count}`,
      prompt:
        'Identify open compliance risks from audit findings, vendor certification records, and safeguarding documentation uploaded to the system.',
      context: `System query — compliance category from audits and vendor records.`,
      response: `Among **${category.count} compliance risks**, vendor certification gaps and safeguarding documentation are the main open items. Baidoa generator fuel storage recently closed ahead of schedule after audit follow-up, but two findings remain in progress. [Source 3]

Procurement due diligence for contracts exceeding $200K and beneficiary data protection across two IDP programmes require review this week. [Source 3]

The table below ranks compliance items to address first. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Risk area', 'Status', 'Priority'],
        rows: [
          ['Vendor certification gaps (4 contractors)', 'Open', 'Critical'],
          ['Safeguarding records — 6 field sites', 'Under review', 'High'],
          ['Procurement due diligence >$200K', 'In progress', 'High'],
          ['Beneficiary data protection — 2 programmes', 'Open', 'Medium'],
          ['Baidoa fuel storage audit (residual)', 'Closing', 'Low'],
        ],
      },
    },
    financial: {
      title: `${category.label} risks — ${category.count}`,
      prompt:
        'Analyze financial and funding risks from donor pipeline data and programme budget registers uploaded to the system.',
      context: `System query — financial category from donor pipeline and budget registers.`,
      response: `**${category.count} financial risks** are dominated by a **Q3 funding shortfall** — a 22% pipeline gap on WASH and nutrition tracks, with **$4.2M exposed across six programmes** in Bay region. [Source 3]

Currency devaluation is eroding program budgets by roughly 8% in real terms, while two major grants remain under review with Q2 decision deadlines. [Source 3]

The table below lists financial risks by exposure and decision timeline. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Risk', 'Exposure', 'Timeline'],
        rows: [
          ['Q3 WASH & nutrition shortfall', '$4.2M · 6 programmes', 'Q2 donor decisions'],
          ['Currency devaluation (budget erosion)', '~8% real-terms', 'Ongoing'],
          ['ECHO grant renewal', '€4.2M annual', 'Under review'],
          ['USAID flat funding (no COLA)', 'Programme-wide', 'FY2026 planning'],
          ['Port delay cost overruns', 'Logistics contingency', 'This month'],
        ],
      },
    },
  };

  return (
    payloads[category.id] ?? {
      title: `${category.label} risks — ${category.count}`,
      prompt: `Analyze ${category.label.toLowerCase()} risks from the current register and uploaded documents in the system.`,
      context: `${category.label}: system query for category breakdown.`,
      response: `There are **${category.count} active ${category.label.toLowerCase()} risks** in the register. [Source 3]`,
      contentType: 'text',
    }
  );
}

export function buildEmergingRiskChatPayload(risk: {
  level: string;
  title: string;
  description: string;
  footer: readonly { label: string }[];
}): DashboardChatPayload {
  const footer = risk.footer.map((f) => f.label).join(' · ');

  if (risk.title.includes('IED threat cluster')) {
    return {
      title: risk.title,
      prompt:
        'Analyze recent security incident logs and convoy movement reports to detect emerging threat clusters in the last 7 days.',
      context: `System query — pattern detection on incident logs. Output: ${risk.title}. ${footer}`,
      response: `**${risk.title}** (${risk.level}) — ${risk.description}

Nine convoy-related incidents within a 12-day window on MSR-3 match prior pre-attack signaling patterns. RiskIQ links **9 risks** (${footer}). Non-essential convoy movements should be suspended and armed escort mandated for essential travel. [Source 1]

The incident map below covers convoy disruptions and security events in Lower Shabelle over the last 30 days. [Source 3]`,
      contentType: 'incidents',
    };
  }

  if (risk.title.includes('Vendor compliance')) {
    return {
      title: risk.title,
      prompt:
        'Review active contractor records and procurement compliance documents for emerging vendor performance and certification issues.',
      context: `System query — vendor scan across procurement registers. Output: ${risk.title}. ${footer}`,
      response: `**${risk.title}** (${risk.level}) — ${risk.description}

**${footer}**. Two Banadir-servicing vendors create single-point-of-failure on medical and logistics routes. Repeat delivery failures and missing certifications require immediate performance review before the next payment cycle. [Source 3]

The contractor table below lists flags, contract values, and recommended actions. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Contractor', 'Issue', 'Contract value', 'Action'],
        rows: [
          ['Baraako Logistics Ltd', '3 missed deliveries; cold chain breach', '$850K', 'Suspension in progress'],
          ['Sahal Construction', 'Substandard materials; 67 failed units', '$1.2M', 'Stop-work order'],
          ['Hormuud Transport', '12 breakdowns; insurance lapse', '$420K', 'Probationary review'],
          ['Jubba Tech Solutions', 'Network outages; SLA breaches', '$380K', '30-day improvement plan'],
        ],
      },
    };
  }

  if (risk.title.includes('Funding shortfall')) {
    return {
      title: risk.title,
      prompt:
        'Analyze donor pipeline registers and programme budget documents for emerging funding shortfall risks in upcoming quarters.',
      context: `System query — funding pipeline analysis. Output: ${risk.title}. ${footer}`,
      response: `**${risk.title}** (${risk.level}) — ${risk.description}

**${footer}**. Six WASH and nutrition programmes share donor-dependency markers. A 22% pipeline gap could materialize if Q2 donor decisions slip, requiring scenario planning for core vs. non-core programme prioritization. [Source 3]

The matrix below shows how funding and operational risks intersect across the register. [Source 3]`,
      contentType: 'matrix',
    };
  }

  return {
    title: risk.title,
    prompt:
      'Scan all registers and uploaded documents for emerging risk patterns detected in the last 7 days.',
    context: `System query — emerging risk detection. ${risk.title}. ${footer}`,
    response: `**${risk.title}** (${risk.level})\n\n${risk.description}\n\n${footer} [Source 3]`,
    contentType: 'text',
  };
}

export function buildBriefingUpdateChatPayload(update: {
  headline: string;
  description: string;
  relativeTime: string;
  absoluteTime: string;
}): DashboardChatPayload {
  if (update.headline.includes('Gu rainfall') || update.headline.includes('drought risk upgraded')) {
    return {
      title: update.headline,
      prompt:
        'Analyze CHIRPS rainfall anomalies, FEWS NET early-action thresholds, and programme exposure in Bay and Bakool for drought escalation.',
      context: `System query — climate early warning from resource feeds. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime})

${update.description}

Cross-referencing CHIRPS dekadal data with FEWS NET and FSNAU briefs shows Gu rainfall at roughly **40% below the 20-year average** across Bay and Bakool. Six districts crossed the early-action threshold used in the 2022–23 drought response. [Source 1]

WASH and nutrition programmes in Baidoa, Burhakaba, and Hudur should pre-position water trucking and therapeutic supplies before river levels fall. Lead the inter-cluster review on trigger activation this week. [Source 3]

The geographic view below shows district-level rainfall deficit versus programme footprints. [Source 3]`,
      contentType: 'geographic',
    };
  }

  if (update.headline.includes('donor pipeline') || update.headline.includes('shortfall risk')) {
    return {
      title: update.headline,
      prompt:
        'Review FTS pledges, internal portfolio data, and funding-gap risks flagged for WASH and nutrition programmes in Somalia.',
      context: `System query — funding exposure from FTS and portfolio resources. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime} · ${update.absoluteTime})

${update.description}

FTS tracking and uploaded HRP portfolio reviews show a projected **22% Q3 gap** on WASH and nutrition lines, with six programmes in Bay and Middle Shabelle most exposed. RiskIQ matched this pattern to last year's pre-HRP revision delays that forced ration cuts. [Source 1]

Prioritize donor outreach on ECHO and USAID renewals and flag contingency scenarios for MPCA scale-down if pledges slip past July. [Source 3]

The table below lists programmes by exposure and decision timeline. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Programme track', 'Exposure', 'Decision window'],
        rows: [
          ['WASH rural Bay', '$1.8M · 3 sites', 'Q3 donor board'],
          ['CMAM nutrition Bakool', '$920K', 'Pipeline review Jul'],
          ['Urban WASH Mogadishu', '$2.1M', 'ECHO renewal'],
          ['MPCA scale-up Middle Shabelle', '$1.4M', 'FY2026 planning'],
          ['NFI/shelter contingency', 'Logistics reserve', 'This month'],
        ],
      },
    };
  }

  if (update.headline.includes('IDP arrivals') || update.headline.includes('above capacity')) {
    return {
      title: update.headline,
      prompt:
        'Detect displacement and shelter capacity risks where multiple partners have flagged related concerns in Mogadishu peri-urban camps.',
      context: `System query — displacement clustering from CCCM and protection registers. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime})

${update.description}

CCCM, protection, and WASH partners logged concurrent displacement risks within 18 hours across **Kahda, Daynile, and Garasbaley** — three camps now above agreed capacity thresholds. RiskIQ created a collective risk entry for inter-agency shelter and WASH coordination. [Source 3]

New arrivals correlate with Lower Shabelle insecurity and dry-season movement from Bay. Assign a lead agency for site management and fast-track latrine and water trucking in the next 72 hours. [Source 1]

The geographic view below shows camp locations versus recent arrival reporting. [Source 3]`,
      contentType: 'geographic',
    };
  }

  if (update.headline.includes('Aid diversion') || update.headline.includes('gatekeeper pattern')) {
    return {
      title: update.headline,
      prompt:
        'Summarize aid diversion allegations, partner reporting, and beneficiary feedback patterns in Banadir for accountability review.',
      context: `System query — accountability pattern from partner and ADT resources. ${update.description}`,
      response: `**${update.headline}** (${update.relativeTime})

${update.description}

Three concurrent diversion flags in 14 days share a **gatekeeper AD pattern** consistent with prior Garasbaley clusters — partner reporting and beneficiary feedback align on the same distribution nodes. [Source 1]

Recommend an accountability cluster review for MPCA sites in Garasbaley and Wadajir: strengthen post-distribution monitoring, rotate distribution committees, and cross-check beneficiary lists against registration data. [Source 3]

The table below summarizes allegation types and sites flagged this fortnight. [Source 3]`,
      contentType: 'table',
      data: {
        headers: ['Site', 'Allegation type', 'Reports', 'Status'],
        rows: [
          ['Garasbaley MPCA', 'Gatekeeper AD', '4', 'Under review'],
          ['Wadajir distribution', 'Undocumented deductions', '2', 'Field verification'],
          ['Kahda NFI', 'List manipulation', '1', 'Monitoring reinforced'],
        ],
      },
    };
  }

  return {
    title: update.headline,
    prompt:
      'Review the latest register updates and uploaded documents for briefing items that need attention since the last sync.',
    context: `System query — briefing update scan. ${update.description}`,
    response: `**${update.headline}**\n\n"${update.description}" [Source 3]`,
    contentType: 'text',
  };
}

export function buildRiskTrendChatPayload(): DashboardChatPayload {
  return {
    title: 'Risk trend',
    prompt:
      'Summarise how active, critical, and mitigated risks have changed over the last 7 days, this month, and year to date using register history.',
    context: 'System query — risk trend chart (7-day, monthly weekly, and YTD monthly snapshots).',
    response: `**This week (Mon → Sun):** Active risks moved from **232 to 247** (+15), with a sharper step on Saturday–Sunday after Lower Shabelle security reporting. Critical count rose **15 → 18**. [Source 1]

**May (Wk 1 → Wk 4):** Active risks climbed **218 → 247** (+29). Week 3–4 accounts for most of the gain — new security and access entries outpaced mitigations. **Mitigated (cumulative)** reached **63** by Wk 4. [Source 3]

**2026 (Jan → May):** Year-to-date active risks are up **186 → 247** (+61). Critical exposure grew steadily from **11 to 18**. February–April show the steepest monthly increases (flooding, MSR-3, vendor compliance). [Source 1]

Use the chart tabs (7 days / Month / Year) to switch granularity. New entries still outpace closures in the latest period. [Source 3]`,
    contentType: 'comparison',
  };
}

export function buildRiskStatusChatPayload(): DashboardChatPayload {
  return {
    title: 'Risks by status',
    prompt:
      'Break down all active risks by workflow status using the current register and identify where bottlenecks are forming.',
    context: 'System query — workflow status distribution across full register.',
    response: `Across **${DASHBOARD_BRIEFING.activeRisksTotal} total risks**, workflow status shows where attention is needed most. **35 open · critical (14%)** require action plans this week — four escalated in the last seven days including the MSR-3 cluster and vendor compliance flags. [Source 1]

**54 under review (22%)** are the primary bottleneck, with 14 items stale for more than 21 days against an 11-day average cycle time. **69 in progress (28%)** is healthy but requires monitoring for 30-day stagnation. [Source 3]

The status table below matches the dashboard breakdown. [Source 3]`,
    contentType: 'table',
    data: {
      headers: ['Status', 'Count', 'Share', 'Note'],
      rows: DASHBOARD_RISK_STATUS.map((item) => [
        item.label,
        String(item.count),
        `${item.percent}%`,
        item.id === 'critical'
          ? '4 escalated this week'
          : item.id === 'review'
            ? '14 stale >21 days'
            : item.id === 'hold'
              ? '6 funding-blocked'
              : '—',
      ]),
    },
  };
}
