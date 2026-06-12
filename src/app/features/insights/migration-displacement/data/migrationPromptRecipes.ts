import { getChatOnlyAnswer, isChatOnlyPrompt, stripHtml } from '../../shared/classifyReportPrompt';
import { COLORS, MIGRATION_CHIPS, MIGRATION_DATA } from './migrationData';
import type { MigrationPromptResult, MigrationRecipeResult } from '../types';

const D = MIGRATION_DATA;

function rCause(): MigrationRecipeResult {
  return {
    title: 'Causes of displacement',
    summaryHtml:
      'Displacement in Somalia is overwhelmingly <b>climate-driven</b>. In the latest round, <b>drought</b> accounts for the largest share of arrivals (27,600 records), more than double <b>conflict</b> (11,200). Floods and evictions cause sharp but localised spikes. The headline: this is a climate emergency with a worsening conflict overlay.',
    findings: [
      { value: '68%', label: 'Drought / natural' },
      { value: '28%', label: 'Conflict' },
      { value: '904', label: 'Flood records' },
      { value: '737', label: 'Eviction records' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Cause split',
            subtitle: 'Latest round',
            chart: { kind: 'donut', rows: D.cause },
          },
          {
            title: 'Drivers ranked',
            subtitle: 'By arrival records',
            chart: { kind: 'hbars', rows: D.cause, color: COLORS.drought },
          },
        ],
      },
    ],
    followUps: [
      'How has drought vs conflict changed over time?',
      'Which regions are most drought-hit?',
      'Show flood-driven displacement',
    ],
    chips: ['Show over time', 'Show by region'],
  };
}

function rMix(): MigrationRecipeResult {
  return {
    title: 'Drought vs conflict over time',
    summaryHtml:
      'The driver mix has shifted. <b>Drought dominated 2023 into 2024</b>, but <b>conflict arrivals (80k) overtook drought (70k) in Q2 2025</b> — the first time insecurity led. Somalia now faces two overlapping displacement engines rather than one, which complicates both forecasting and response.',
    findings: [
      { value: "Q2 2025", label: 'Conflict overtook drought' },
      { value: '80k', label: 'Peak conflict quarter' },
      { value: "159k", label: "Peak drought (Q4'23)" },
      { value: '2', label: 'Concurrent crises' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Drought vs conflict by quarter',
        subtitle: 'Stacked arrivals, 2023 Q4 – 2026 Q2',
        chart: { kind: 'stackedCauseQ', rows: D.causeQ },
      },
    ],
    followUps: [
      'Which regions drive the conflict spike?',
      'Show the seasonal trend',
      'Break down by cause and region',
    ],
    chips: ['Show by region', 'Show seasonal'],
  };
}

function rDemo(): MigrationRecipeResult {
  return {
    title: 'Age & gender of arrivals',
    summaryHtml:
      'The displaced population skews heavily toward <b>women and children</b>. Children under 18 are the single largest group at <b>44% (203k)</b>, women add <b>32% (149k)</b>, and adult men are just <b>24% (110k)</b>. Any response design — protection, nutrition, education — has to start from a child-and-family-centred reality.',
    findings: [
      { value: '44%', label: 'Children under 18' },
      { value: '32%', label: 'Women (18+)' },
      { value: '24%', label: 'Men (18+)' },
      { value: '76%', label: 'Women + children' },
    ],
    sections: [
      {
        type: 'full',
        title: 'By group',
        subtitle: 'Absolute numbers',
        chart: {
          kind: 'hbars',
          rows: [
            ['Children', D.demo.children, COLORS.child],
            ['Women', D.demo.women, COLORS.women],
            ['Men', D.demo.men, COLORS.men],
          ],
        },
      },
    ],
    followUps: [
      'What are the biggest needs?',
      'Show child protection gaps',
      'Where do families land?',
    ],
    chips: ['Show needs', 'Show destinations'],
  };
}

function rTrend(): MigrationRecipeResult {
  return {
    title: 'Displacement over time',
    summaryHtml:
      'Arrivals pulse with Somalia\'s dry seasons, peaking in late 2023 and across early–mid 2025. The sharp fall after <b>August 2025 is largely a coverage change</b> — DTM narrowed tracking to five priority districts due to funding — so recent lows reflect <b>less monitoring, not less displacement</b>. Read the tail of this curve with that caveat.',
    findings: [
      { value: '971k', label: 'Total tracked' },
      { value: "Late'23", label: 'First major peak' },
      { value: "Aug'25", label: 'Coverage narrowed' },
      { value: '5', label: 'Districts now tracked' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Monthly arrivals',
        subtitle: 'Oct 2023 – May 2026 (merged across rounds)',
        chart: { kind: 'line', rows: D.monthly },
      },
    ],
    followUps: [
      'Why did arrivals drop in late 2025?',
      'Show drought vs conflict over time',
      'Which season sees most movement?',
    ],
    chips: ['Show causes', 'Show by region'],
  };
}

function rDest(): MigrationRecipeResult {
  return {
    title: 'Where people land',
    summaryHtml:
      'Arrivals concentrate in a few receiving hubs. <b>Bay (133k)</b> and <b>Banadir / Mogadishu (124k)</b> dominate, with Gedo third. At district level, <b>Kahda</b> and <b>Baidoa</b> are the largest magnets — urban centres where people go seeking aid. Movement is overwhelmingly <b>rural → urban</b>.',
    findings: [
      { value: 'Bay', label: 'Top region (133k)' },
      { value: 'Banadir', label: 'Second (124k)' },
      { value: 'Kahda', label: 'Top district (79k)' },
      { value: 'Urban', label: 'Dominant pull' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Top regions',
            subtitle: 'By arrivals',
            chart: {
              kind: 'hbars',
              rows: D.regions.slice(0, 8).map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: 'Regional spread',
            subtitle: 'All tracked regions',
            chart: {
              kind: 'hbars',
              rows: D.regions.map(([n, v]) => [n, v, COLORS.teal]),
            },
          },
        ],
      },
      {
        type: 'full',
        title: 'Top destination districts',
        subtitle: 'Where arrivals concentrate',
        chart: { kind: 'districtTable', rows: D.districts },
      },
    ],
    followUps: [
      'Where do these people come from?',
      'Which districts are conflict-driven?',
      'Show camp vs host community split',
    ],
    chips: ['Show origins', 'Show causes'],
  };
}

function rGap(): MigrationRecipeResult {
  return {
    title: 'Needs vs response gap',
    summaryHtml:
      'The most urgent signal in the data: <b>recorded responses meet only a small fraction of flagged needs</b>. <b>Food</b> was flagged 38,600 times but a response logged just 2,300 — about <b>6%</b>. Shelter, health, water and protection all show similar gaps, and <b>GBV and child protection are least covered</b>.',
    findings: [
      { value: '~6%', label: 'Food needs met' },
      { value: '38.6k', label: 'Food need flags' },
      { value: '785', label: 'Protection responses' },
      { value: '94%', label: 'Estimated unmet' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Flagged needs vs recorded response',
        subtitle: 'Beige = need flagged · solid = response recorded',
        chart: { kind: 'gap', rows: D.gap },
      },
      {
        type: 'grid',
        items: [
          {
            title: 'Top priority needs',
            subtitle: 'Self-reported main need',
            chart: {
              kind: 'hbars',
              rows: D.needs.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: 'Coverage by sector',
            subtitle: 'Response as share of need',
            chart: {
              kind: 'coverage',
              rows: D.gap.map(([name, need, resp]) => [
                name,
                Math.round((resp / need) * 100),
              ]),
            },
          },
        ],
      },
    ],
    followUps: [
      'Which regions are least served?',
      'Show protection & GBV gaps',
      'What do families say they need most?',
    ],
    chips: ['Show by region', 'Show needs'],
  };
}

function rStay(): MigrationRecipeResult {
  return {
    title: 'Intentions: temporary or long-term?',
    summaryHtml:
      'Most displacement here is <b>not short-term</b>. Of those who stated intentions, the majority plan to stay <b>more than six months</b>, and <b>78% settle in IDP camps</b> rather than host communities. Movement is <b>91% spontaneous</b> — people fleeing on their own, not organised relocation. This points to protracted, settlement-based displacement.',
    findings: [
      { value: '6+ months', label: 'Majority intend to stay' },
      { value: '78%', label: 'Land in IDP camps' },
      { value: '91%', label: 'Move spontaneously' },
      { value: 'Protracted', label: 'Likely outcome' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Intended length of stay',
            subtitle: 'Of those who answered',
            chart: {
              kind: 'hbars',
              rows: D.stay.map(([n, v]) => [n, v, COLORS.teal]),
            },
          },
          {
            title: 'Settlement type',
            subtitle: 'Camp vs host community',
            chart: {
              kind: 'hbars',
              rows: [
                ['IDP camp/site', D.settlement['IDP camp/site'], COLORS.brand],
                ['Host community', D.settlement['Host community'], COLORS.teal],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'What do long-stay families need?',
      'Show the response gap',
      'Where are the largest camps?',
    ],
    chips: ['Show needs gap', 'Show destinations'],
  };
}

function rOrigin(): MigrationRecipeResult {
  return {
    title: 'Where people are displaced from',
    summaryHtml:
      'Almost all arrivals are <b>internally displaced Somalis</b> (98%), with a small Ethiopian cross-border flow (~990). The biggest sending regions — <b>Bay, Lower Shabelle and Middle Shabelle</b> — are largely the same regions receiving people, confirming dense <b>intra-regional, rural-to-urban</b> movement rather than long-distance flight.',
    findings: [
      { value: '98%', label: 'Somali (internal)' },
      { value: 'Bay', label: 'Top origin region' },
      { value: '~990', label: 'Ethiopian arrivals' },
      { value: 'Intra-regional', label: 'Dominant pattern' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Region of origin',
            subtitle: 'Where arrivals are coming from',
            chart: {
              kind: 'hbars',
              rows: D.originReg.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: 'Origin country',
            subtitle: 'Internal vs cross-border',
            chart: {
              kind: 'hbars',
              rows: [
                ['Somalia', D.origin.Somalia, COLORS.brand],
                ['Ethiopia', D.origin.Ethiopia, COLORS.teal],
                ['Other', D.origin.Other, COLORS.muted],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'Show destinations',
      'What drove them to move?',
      'Show the seasonal trend',
    ],
    chips: ['Show destinations', 'Show causes'],
  };
}

function rOverview(): MigrationRecipeResult {
  return {
    title: 'Displacement overview',
    summaryHtml:
      'Since October 2023, IOM has tracked <b>~971,000 new arrivals</b> across Somalia. Movement is <b>climate-led but increasingly conflict-driven</b>, falls hardest on <b>women and children (76%)</b>, concentrates in <b>Bay and Banadir</b>, and is met by responses covering only a <b>small fraction of needs</b>. Most people expect to stay for months in urban IDP camps.',
    findings: [
      { value: '971k', label: 'Tracked arrivals' },
      { value: 'Drought', label: 'Top driver' },
      { value: '76%', label: 'Women & children' },
      { value: '~6%', label: 'Food needs met' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'By cause',
            chart: { kind: 'donut', rows: D.cause },
          },
          {
            title: 'By region',
            chart: {
              kind: 'hbars',
              rows: D.regions.slice(0, 7).map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
        ],
      },
    ],
    followUps: [
      'What is driving displacement?',
      'Break down by age and gender',
      'Where are the biggest response gaps?',
      'Which regions receive the most people?',
    ],
    chips: ['Show causes', 'Show destinations'],
  };
}

function rGeneric(query: string): MigrationRecipeResult {
  return {
    isFallback: true,
    title: 'Displacement data',
    summaryHtml: `Here's what the DTM data shows for <b>"${query}"</b>. Across Oct 2023 – May 2026, ~971k arrivals were tracked, mostly drought-driven, landing in Bay and Banadir, with women and children making up three-quarters of those moving. Try a chip below for a sharper cut.`,
    findings: [
      { value: '971k', label: 'Arrivals' },
      { value: '12', label: 'Regions' },
      { value: '3,921', label: 'Sites' },
      { value: 'Drought', label: 'Top driver' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'By cause',
            chart: { kind: 'hbars', rows: D.cause },
          },
          {
            title: 'By region',
            chart: {
              kind: 'hbars',
              rows: D.regions.slice(0, 7).map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
        ],
      },
    ],
    followUps: [
      'What is driving displacement?',
      'Show the trend over time',
      'Where are the biggest response gaps?',
      'Break down by age and gender',
    ],
    chips: ['Show causes', 'Show trend'],
  };
}

const DRILL_CHIP_ALIASES: Record<string, string> = {
  'Show over time': 'Show the displacement trend over time',
  'Show by region': 'Which regions receive the most people?',
  'Show seasonal': 'Show the displacement trend over time',
  'Show needs': 'Where are the biggest gaps between needs and response?',
  'Show destinations': 'Which regions and districts receive the most people?',
  'Show causes': 'What is driving displacement?',
  'Show trend': 'Show the trend over time',
  'Show origins': 'Where do these people come from?',
  'Show needs gap': 'Where are the biggest gaps between needs and response?',
};

function resolveMigrationRecipe(query: string): MigrationRecipeResult {
  const normalized = DRILL_CHIP_ALIASES[query] ?? query;
  const t = normalized.toLowerCase();

  if (/temporary|long.?term|stay|intention|protracted|return|how long/.test(t)) return rStay();
  if (/drought.*conflict|conflict.*drought|mix|changed over time|over time.*driver/.test(t)) return rMix();
  if (/driv|cause|reason|why.*displac|drought|conflict|flood/.test(t)) return rCause();
  if (/age|gender|children|women|men|demograph|who.*mov/.test(t)) return rDemo();
  if (/trend|over time|monthly|season|when/.test(t)) return rTrend();
  if (/region|district|where.*land|receive|destination|most people/.test(t)) return rDest();
  if (/gap|need|response|unmet|reach|help/.test(t)) return rGap();
  if (/camp|host community/.test(t)) return rStay();
  if (/origin|come from|displaced from|source/.test(t)) return rOrigin();
  if (/overall|summar|picture|overview/.test(t)) return rOverview();

  return rGeneric(query);
}

export function resolveMigrationPrompt(query: string): MigrationPromptResult {
  if (isChatOnlyPrompt(query)) {
    return { lane: 'chat', body: getChatOnlyAnswer('migration', query), chips: [...MIGRATION_CHIPS] };
  }

  const recipe = resolveMigrationRecipe(query);
  if (recipe.isFallback) {
    return {
      lane: 'chat',
      body: stripHtml(recipe.summaryHtml),
      chips: recipe.followUps.slice(0, 3),
    };
  }

  return { lane: 'dashboard', recipe };
}

export { resolveMigrationRecipe };
