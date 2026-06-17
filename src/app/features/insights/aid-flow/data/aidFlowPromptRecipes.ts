import { getChatOnlyAnswer, isChatOnlyPrompt, stripHtml } from '../../shared/classifyReportPrompt';
import { MIGRATION_DATA } from '../../migration-displacement/data/migrationData';
import { AI_CHIPS, AID_FLOW_DATA, COLORS } from './aidFlowData';
import type { AidFlowPromptResult, AidFlowRecipeResult } from '../types';

const D = AID_FLOW_DATA;

const FCDO_PROJECTS = [
  ...D.topProjects.filter((p) => p[1] === 'FCDO'),
  ['Somalia Stability Fund II', 'FCDO', 'Stabilization', 'South West', 92.0, 110, 'Active'],
  ["Girls' Education Somalia", 'FCDO', 'Education', 'Banadir (BRA)', 47.5, 60, 'Closing'],
].slice(0, 5) as typeof D.topProjects;

function rFCDO(): AidFlowRecipeResult {
  return {
    title: 'FCDO contribution by sector',
    summaryHtml:
      "<b>FCDO (UK)</b> is Somalia's largest single donor, disbursing <b>$1.10B</b> across <b>246 projects</b>. Its portfolio leans heavily on <b>Food Security ($427M)</b> and <b>Health ($144M)</b>, with a meaningful governance and rule-of-law footprint. Annual disbursements peaked around 2017–2019 and have since declined.",
    findings: [
      { value: '$1.10B', label: 'Total disbursed' },
      { value: '246', label: 'Projects funded' },
      { value: '$427M', label: 'Food Security (top sector)' },
      { value: '12%', label: 'Share of all aid' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'FCDO by sector',
            subtitle: 'Actual disbursements (USD)',
            chart: {
              kind: 'hbars',
              rows: D.fcdo.sectors.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: 'FCDO over time',
            subtitle: 'Disbursements per year',
            chart: {
              kind: 'yearBars',
              rows: D.fcdo.year,
              color: COLORS.brand,
            },
          },
        ],
      },
      {
        type: 'full',
        title: 'Relevant FCDO projects',
        subtitle: 'Largest by disbursement',
        chart: { kind: 'projectsTable', rows: FCDO_PROJECTS },
      },
    ],
    followUps: [
      'Compare FCDO with EU',
      'Show FCDO funding by region',
      'Analyze FCDO funding by sector',
    ],
    chips: ['Compare with EU', 'Show by region'],
  };
}

function rClimate(fcdo = false): AidFlowRecipeResult {
  return {
    title: fcdo ? 'FCDO climate-related programming' : 'Climate-related aid flows',
    summaryHtml:
      "Climate & environment-marked funding totals <b>$3.77B</b> across <b>146 projects</b> — and it's the fastest-growing theme, rising from <b>$33M (2018)</b> to <b>$1.19B (2023)</b>. The <b>World Bank ($490M)</b> and <b>FCDO ($259M)</b> lead. Geographically it concentrates in <b>Puntland ($834M)</b> and Banadir.",
    findings: [
      { value: '$3.77B', label: 'Climate-tagged funding' },
      { value: '146', label: 'Projects' },
      { value: '36×', label: 'Growth 2018→2023' },
      { value: 'Puntland', label: 'Top region' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Climate funding over time',
            subtitle: 'Actual disbursements, 2016–2023',
            chart: { kind: 'climateTrend', rows: D.climate.year },
          },
          {
            title: 'Climate by donor',
            subtitle: 'Disbursements (USD)',
            chart: {
              kind: 'hbars',
              rows: D.climate.donor.map(([n, v]) => [n, v, COLORS.resil]),
            },
          },
        ],
      },
      {
        type: 'full',
        title: 'Climate funding by region',
        subtitle: 'Where climate aid lands',
        chart: {
          kind: 'regionBars',
          rows: D.climate.region,
        },
      },
    ],
    followUps: [
      'Compare climate with Food Security',
      'Which donors fund climate?',
      'Show climate by region',
    ],
    chips: ['Compare with EU', 'Show by region'],
  };
}

function rRegions(): AidFlowRecipeResult {
  const sorted = D.locations.filter((l) => !l[0].includes('federal'));
  return {
    title: 'Regional funding & gaps',
    summaryHtml:
      'Funding spreads across all federal member states but unevenly. <b>Puntland ($1.43B)</b> and <b>South West ($1.11B)</b> lead, while <b>Galmudug ($558M)</b> and <b>Hirshabelle ($638M)</b> trail despite comparable humanitarian need — the clearest candidates for rebalancing.',
    findings: [
      { value: 'Galmudug', label: 'Most underfunded' },
      { value: '$558M', label: 'Galmudug total' },
      { value: '2.6×', label: 'Puntland vs Galmudug' },
      { value: '8', label: 'Regions tracked' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Funding by region',
            subtitle: 'Actual disbursements',
            chart: {
              kind: 'hbars',
              rows: sorted.map(([n, v]) => [n, v, COLORS.basic]),
            },
          },
          {
            title: 'Regional spread',
            subtitle: 'All tracked regions',
            chart: { kind: 'regionBars', rows: sorted },
          },
        ],
      },
    ],
    followUps: [
      'Which donors fund Galmudug?',
      'Show sectors in Galmudug',
      'Compare Puntland vs Galmudug',
    ],
    chips: ['Compare donors', 'Show by sector'],
  };
}

function rHumDev(): AidFlowRecipeResult {
  const markerRows = Object.entries(D.markers)
    .map(([k, v]) => [k, v[1], COLORS.edu] as const)
    .sort((a, b) => b[1] - a[1]);
  return {
    title: 'Humanitarian vs development',
    summaryHtml:
      "The split tilts toward crisis response: <b>$4.99B (55%)</b> flows through humanitarian-marked projects versus <b>$4.08B (45%)</b> development. With 312 humanitarian projects, Somalia's aid architecture is still response-led rather than systems-building.",
    findings: [
      { value: '55%', label: 'Humanitarian' },
      { value: '45%', label: 'Development' },
      { value: '$4.99B', label: 'Humanitarian total' },
      { value: '312', label: 'Humanitarian projects' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Envelope split',
            subtitle: 'By humanitarian marker',
            chart: {
              kind: 'donut',
              a: D.humdev.hum,
              b: D.humdev.dev,
              labelA: 'Humanitarian',
              labelB: 'Development',
              colorA: COLORS.basic,
              colorB: COLORS.resil,
            },
          },
          {
            title: 'Marker comparison',
            subtitle: 'Funding by cross-cutting marker',
            chart: { kind: 'hbars', rows: markerRows.map(([n, v, c]) => [n, v, c]) },
          },
        ],
      },
    ],
    followUps: [
      'Show humanitarian by region',
      'Trend of humanitarian funding',
      'Which donors are most development-focused?',
    ],
    chips: ['Show by region', 'Show trend'],
  };
}

function rImplementers(): AidFlowRecipeResult {
  return {
    title: 'Implementer & partner analysis',
    summaryHtml:
      'Delivery is highly concentrated. <b>WFP channels $3.15B</b> — roughly a third of all disbursements — far ahead of any other partner. Somali federal ministries collectively form the next tier, signalling a gradual shift toward government-led delivery alongside UN agencies.',
    findings: [
      { value: 'WFP', label: 'Top implementer' },
      { value: '$3.15B', label: 'WFP delivered' },
      { value: '35%', label: 'WFP share' },
      { value: 'Govt', label: 'Rising channel' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Top implementers',
            subtitle: 'Actual disbursements delivered',
            chart: {
              kind: 'hbars',
              rows: D.implementers.map(([n, v]) => [n, v, COLORS.wash]),
            },
          },
          {
            title: 'Channel mix',
            subtitle: 'UN vs government vs INGO',
            chart: { kind: 'treemap', rows: D.channelMix },
          },
        ],
      },
    ],
    followUps: [
      'Which donors fund WFP?',
      'Show WFP by region',
      'Government vs UN delivery trend',
    ],
    chips: ['Show by donor', 'Show trend'],
  };
}

function rDonors(): AidFlowRecipeResult {
  return {
    title: 'Donor concentration',
    summaryHtml:
      "Somalia's aid is dominated by a small group. The <b>top 5 donors</b> provide about half of all disbursements, led by <b>FCDO ($1.10B)</b>, with a long tail of 170+ smaller contributors. This concentration creates both coordination efficiency and dependency risk.",
    findings: [
      { value: 'FCDO', label: 'Largest donor' },
      { value: '$1.10B', label: 'FCDO total' },
      { value: '~50%', label: 'Top-5 share' },
      { value: '176', label: 'Total donors' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Donor ranking',
            subtitle: 'Top donors by disbursement',
            chart: {
              kind: 'hbars',
              rows: D.donors.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: 'Top 5 vs rest',
            subtitle: 'Concentration',
            chart: {
              kind: 'donut',
              a: 4549,
              b: 4526,
              labelA: 'Top 5 donors',
              labelB: '171 others',
              colorA: COLORS.basic,
              colorB: COLORS.resil,
            },
          },
        ],
      },
    ],
    followUps: [
      'Compare FCDO with USAID',
      'Show donors funding health',
      'Donor trends since 2020',
    ],
    chips: ['Show by sector', 'Show trend'],
  };
}

function rFood(): AidFlowRecipeResult {
  const foodProjects = D.topProjects
    .filter((p) => p[2] === 'Food Security')
    .map((p) => [p[0].slice(0, 22), p[4], COLORS.food] as const);
  return {
    title: 'Food Security dominance',
    summaryHtml:
      "<b>Food Security absorbs $3.80B (42%)</b> — more than the next seven sectors combined. This reflects Somalia's recurring drought-famine cycles, where large emergency food and cash transfers (largely via WFP) dwarf longer-term development spending. The biggest single projects are all food/nutrition programmes in Puntland.",
    findings: [
      { value: '42%', label: 'Of all aid' },
      { value: '$3.80B', label: 'Food Security total' },
      { value: 'WFP', label: 'Main channel' },
      { value: 'Puntland', label: 'Largest recipient' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Sector allocation',
            subtitle: 'All sectors',
            chart: { kind: 'treemap', rows: D.sectors },
          },
          {
            title: 'Largest food projects',
            subtitle: 'By disbursement',
            chart: { kind: 'hbars', rows: foodProjects.map(([n, v, c]) => [n, v, c]), color: COLORS.food },
          },
        ],
      },
    ],
    followUps: [
      'Show Food Security by region',
      'Which donors fund Food Security?',
      'Compare with Health funding',
    ],
    chips: ['Show by region', 'Show by donor'],
  };
}

function rPlanned(): AidFlowRecipeResult {
  return {
    title: 'Future / planned disbursements',
    summaryHtml:
      'Planned commitments total <b>$4.88B</b> for 2020–2030, with a striking <b>$1.82B concentrated in 2025</b>. That single-year figure is well above the recent ~$1.1B annual delivery average — a sign of an ambitious pipeline that historically tends to slip.',
    findings: [
      { value: '$4.88B', label: 'Total planned' },
      { value: '$1.82B', label: '2025 alone' },
      { value: '1.6×', label: 'Above avg. delivery' },
      { value: 'Risk', label: 'Likely slippage' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Actual vs planned over time',
        subtitle: 'Reported actuals taper after 2023; planned spikes in 2025',
        chart: { kind: 'trendDual' },
      },
    ],
    followUps: [
      'Which sectors have planned funding?',
      'Funding gap risk by region',
      'Show actual disbursement trend',
    ],
    chips: ['Show gap risk', 'Show by sector'],
  };
}

function rTrend(): AidFlowRecipeResult {
  return {
    title: 'Disbursement trends',
    summaryHtml:
      'Actual disbursements rose steeply to a <b>$1.67B peak in 2019</b>, then plateaued around $1.0–1.2B. Reporting <b>thins after 2023</b> in this dataset, while planned commitments jump to <b>$1.82B in 2025</b> — the gap between the dashed (planned) and solid (actual) lines is the story to watch.',
    findings: [
      { value: '2019', label: 'Peak year' },
      { value: '$1.67B', label: 'Peak disbursed' },
      { value: '2023', label: 'Last full actuals' },
      { value: '$1.82B', label: 'Planned 2025' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Actual vs planned, 2014–2026',
        subtitle: 'Solid = actual, dashed = planned',
        chart: { kind: 'trendDual' },
      },
    ],
    followUps: [
      'Show climate funding trend',
      'Trend by top donor',
      'Where is planned funding concentrated?',
    ],
    chips: ['Show planned', 'Show by donor'],
  };
}

function rProjects(): AidFlowRecipeResult {
  return {
    title: 'Largest active projects',
    summaryHtml:
      'The biggest projects are dominated by <b>large-scale Food Security and safety-net programmes in Puntland</b>. The single largest is a Danish-funded nutrition programme at <b>$1.69B</b> — an outlier that alone explains much of the Food Security and Puntland totals.',
    findings: [
      { value: '$1.69B', label: 'Largest project' },
      { value: 'Food Sec.', label: 'Dominant theme' },
      { value: 'Puntland', label: 'Top location' },
      { value: 'WFP', label: 'Main implementer' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Top projects by disbursement',
        subtitle: 'Filterable in the full project view',
        chart: { kind: 'projectsTable', rows: D.topProjects },
      },
    ],
    followUps: [
      'Show projects in South West',
      'Largest FCDO projects',
      'Filter by status: Active',
    ],
    chips: ['Filter by region', 'Filter by donor'],
  };
}

function rHealthSW(): AidFlowRecipeResult {
  return {
    title: 'Health funding in South West',
    summaryHtml:
      "In <b>South West</b>, health funding is led by the <b>EU</b> and <b>World Bank</b>, with Sweden and UNICEF-channelled programmes adding maternal-health and immunisation coverage. Health is a secondary priority regionally — Food Security still dominates South West's $1.11B total.",
    findings: [
      { value: 'EU', label: 'Top health donor (SW)' },
      { value: '$58M', label: 'Largest health project' },
      { value: '4+', label: 'Active health donors' },
      { value: '$1.11B', label: 'South West total' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Health donors in South West',
            subtitle: 'Estimated disbursements',
            chart: {
              kind: 'hbars',
              rows: [
                ['EU', 58.4, COLORS.health],
                ['World Bank', 41.2, COLORS.health],
                ['Sweden', 22.8, COLORS.health],
                ['UNICEF', 15.6, COLORS.health],
              ],
            },
          },
          {
            title: 'South West sector mix',
            subtitle: 'Share of regional funding',
            chart: { kind: 'treemap', rows: D.southWestSectors },
          },
        ],
      },
      {
        type: 'full',
        title: 'Health projects in South West',
        chart: { kind: 'projectsTable', rows: D.healthSouthWest },
      },
    ],
    followUps: [
      'Compare with health in Puntland',
      'Show all EU health projects',
      'Which regions get most health funding?',
    ],
    chips: ['Compare regions', 'Show all donors'],
  };
}

function rOverview(): AidFlowRecipeResult {
  return {
    title: 'Aid flow overview',
    summaryHtml:
      'Across 2014–2026, Somalia recorded <b>$15B committed / $9.08B disbursed</b> over 1,334 projects. The portfolio is dominated by Food Security, led by FCDO, and concentrated in Puntland.',
    findings: [
      { value: '$9.08B', label: 'Disbursed' },
      { value: '1,334', label: 'Projects' },
      { value: 'FCDO', label: 'Top donor' },
      { value: 'Food Sec.', label: 'Top sector' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'By donor',
            subtitle: 'Top 10',
            chart: {
              kind: 'hbars',
              rows: D.donors.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: 'By sector',
            subtitle: 'Top 8',
            chart: { kind: 'treemap', rows: D.sectors },
          },
        ],
      },
    ],
    followUps: [
      'Analyze FCDO funding by sector',
      'Which regions are underfunded?',
      'Show climate-related aid flows',
      'Compare humanitarian vs development funding',
    ],
    chips: ['Show donors', 'Show sectors'],
  };
}

function rGeneric(query: string): AidFlowRecipeResult {
  return {
    isFallback: true,
    title: 'Aid flow overview',
    summaryHtml: `Here's what the data shows for <b>"${query}"</b>. Across 2014–2026, Somalia recorded <b>$15B committed / $9.08B disbursed</b> over 1,334 projects. The portfolio is dominated by Food Security, led by FCDO, and concentrated in Puntland. Try one of the chips below for a sharper view.`,
    findings: [
      { value: '$9.08B', label: 'Disbursed' },
      { value: '1,334', label: 'Projects' },
      { value: 'FCDO', label: 'Top donor' },
      { value: 'Food Sec.', label: 'Top sector' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'By donor',
            subtitle: 'Top 10',
            chart: {
              kind: 'hbars',
              rows: D.donors.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: 'By sector',
            subtitle: 'Top 8',
            chart: { kind: 'treemap', rows: D.sectors },
          },
        ],
      },
    ],
    followUps: [
      'Analyze FCDO funding by sector',
      'Which regions are underfunded?',
      'Show climate-related aid flows',
      'Compare humanitarian vs development funding',
    ],
    chips: ['Show donors', 'Show sectors'],
  };
}

function resolveAidFlowRecipe(query: string): AidFlowRecipeResult {
  const t = query.toLowerCase();

  if (/fcdo|uk|foreign.*commonwealth/.test(t) && !/climate/.test(t)) return rFCDO();
  if (/climate|environment|fcdo.*climate/.test(t)) return rClimate(/fcdo/.test(t));
  if (/underfund|region|where/.test(t)) return rRegions();
  if (/humanitarian.*development|development.*humanitarian|hum vs dev|envelope split/.test(t)) return rHumDev();
  if (/implement|partner|deliver|wfp/.test(t)) return rImplementers();
  if (/donor|concentration|top.*fund|ranking/.test(t)) return rDonors();
  if (/food security|why.*food|dominant/.test(t)) return rFood();
  if (/planned|future|pipeline|2025|concentrated/.test(t)) return rPlanned();
  if (/trend|over time|since 20|actual.*planned|summarize/.test(t)) return rTrend();
  if (/largest|biggest|list.*project/.test(t)) return rProjects();
  if (/health.*south west|south west.*health|who fund/.test(t)) return rHealthSW();
  if (/overall|summar|picture|overview|envelope/.test(t)) return rOverview();

  return rGeneric(query);
}

function xSjf(): AidFlowRecipeResult {
  return {
    title: 'Aid Flow vs Somalia Joint Fund',
    extended: true,
    summaryHtml:
      'Cross-referencing with the SJF report: Somalia\'s total aid envelope 2014–2026 is <b>~$15B committed / $9.1B disbursed</b>. The SJF\'s <b>$597.7M deposited since 2014</b> represents <b>roughly 6.6% of disbursed aid</b> — a small but strategically positioned slice. Major bilateral donors like <b>FCDO ($1.10B) and USAID ($704M)</b> mostly fund outside the SJF. The SJF pools smaller European contributions into joint UN programming.',
    findings: [
      { value: '~6.6%', label: 'SJF share of disbursed aid' },
      { value: '$597.7M', label: 'SJF since 2014' },
      { value: '$9.1B', label: 'Total aid disbursed' },
      { value: 'EU donors', label: "SJF's core base" },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Somalia aid envelope (AIMS)',
            subtitle: 'Total disbursed 2014–2026',
            chart: {
              kind: 'hbars',
              rows: [
                ['Total disbursed (Aid Flow)', D.totals.actual, COLORS.brand],
                ['SJF deposits to date', 598e6, '#00689D'],
              ],
            },
          },
          {
            title: 'Donor overlap',
            subtitle: 'SJF vs bilateral channels',
            chart: {
              kind: 'hbars',
              rows: [
                ['FCDO (mostly outside SJF)', 1097e6, COLORS.brand],
                ['USAID (outside SJF)', 704e6, COLORS.brand],
                ['Sweden (mostly SJF)', 141e6, '#00689D'],
                ['EU (large SJF share)', 89e6, '#00689D'],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'Show climate funding across both',
      'Compare with Migration data',
      'Which donors fund both SJF and bilateral?',
    ],
    chips: ['Show by donor', 'Show by sector'],
  };
}

function xMigration(): AidFlowRecipeResult {
  return {
    title: 'Aid Flow vs displacement hotspots',
    extended: true,
    summaryHtml:
      'Cross-referencing with the Migration & Displacement report: IOM has tracked <b>~971,000 new arrivals</b> since Oct 2023, with <b>Bay (133k)</b> and <b>Banadir (124k)</b> the largest receiving regions. Aid Flow data shows humanitarian funding is heavily concentrated in <b>Food Security ($2.1B+)</b> and <b>Health</b>, but durable-solutions programming remains thin relative to the <b>~4M IDP</b> national caseload.',
    findings: [
      { value: '971k', label: 'Tracked arrivals (Oct23+)' },
      { value: '~4M', label: 'Total IDPs (national)' },
      { value: '$9.1B', label: 'Total aid disbursed' },
      { value: 'Bay', label: 'Top arrival region' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Scale comparison',
            subtitle: 'Aid vs displacement',
            chart: {
              kind: 'hbars',
              rows: [
                ['Total aid disbursed', D.totals.actual, COLORS.brand],
                ['Arrivals since Oct 23', MIGRATION_DATA.totals.arrivalsAll, '#c2562a'],
                ['Humanitarian share', D.humdev.hum, COLORS.brand],
              ],
            },
          },
          {
            title: 'Top arrival regions',
            subtitle: 'From Migration report',
            chart: {
              kind: 'hbars',
              rows: MIGRATION_DATA.regions.slice(0, 5).map(([n, v]) => [n, v, '#c2562a']),
            },
          },
        ],
      },
    ],
    followUps: [
      'Compare with SJF durable solutions',
      'Show climate-related aid flows',
      'Which regions are underfunded?',
    ],
    chips: ['Show by region', 'Show humanitarian split'],
  };
}

function xClimateMigration(): AidFlowRecipeResult {
  return {
    title: 'Climate aid, displacement & funding',
    extended: true,
    summaryHtml:
      'Linking three reports: IOM data shows <b>drought is the top driver of displacement</b> (~68% of recent arrivals). Aid Flow shows <b>$3.77B of total aid touches climate</b>. The SJF Climate & Resilience window holds <b>$16.2M in 2024</b> — about 0.4% of all climate-tagged aid, but focused on integration across climate, displacement and durable solutions.',
    findings: [
      { value: '68%', label: 'Displacement = drought' },
      { value: '$3.77B', label: 'Total climate aid' },
      { value: '$16.2M', label: 'SJF climate window 2024' },
      { value: '29%', label: 'Climate share of SJF' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Climate funding scale',
            subtitle: 'Across reports',
            chart: {
              kind: 'hbars',
              rows: [
                ['Total climate-tagged aid (AIMS)', 3770e6, COLORS.brand],
                ['SJF Climate & Resilience window', 16.2e6, '#00689D'],
              ],
            },
          },
          {
            title: 'Displacement drivers',
            subtitle: 'From Migration report',
            chart: {
              kind: 'hbars',
              rows: MIGRATION_DATA.cause.slice(0, 4).map(([n, v]) => [n, v, '#c2562a']),
            },
          },
        ],
      },
    ],
    followUps: [
      'Show drought-driven displacement',
      'Compare with SJF climate programmes',
      'Which regions get both?',
    ],
    chips: ['Show by region', 'Show by donor'],
  };
}

function xGeneric(_q: string): AidFlowRecipeResult {
  return {
    isFallback: true,
    title: 'Cross-report comparison',
    extended: true,
    summaryHtml:
      'Extended Knowledge is on. I can compare Aid Flow data against SJF, Migration & Displacement, and (where available) other Humanity Hub reports. Some example questions: <b>"Compare total aid with SJF funding"</b>, <b>"Show climate funding across all reports"</b>, <b>"Where is the biggest mismatch between displacement and aid?"</b>, <b>"Which donors fund both bilaterally and through SJF?"</b>',
    findings: [
      { value: '3', label: 'Reports linked so far' },
      { value: '$9.1B', label: 'Aid Flow disbursed' },
      { value: '971k', label: 'Migration arrivals' },
      { value: '$214.7M', label: 'SJF active' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Reports available for cross-reference',
            subtitle: 'Humanity Hub thematic areas',
            chart: {
              kind: 'hbars',
              rows: [
                ['Aid Flow (this report)', D.totals.actual, COLORS.brand],
                ['SJF', 214.7e6, '#00689D'],
                ['Migration arrivals', MIGRATION_DATA.totals.arrivalsAll, '#c2562a'],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'Compare with SJF donors',
      'Aid Flow vs displacement',
      'Climate cross-cut',
      'Show humanitarian vs development',
    ],
    chips: ['SJF comparison', 'Migration comparison'],
  };
}

function recipeExtended(q: string): AidFlowRecipeResult {
  const t = q.toLowerCase();
  if (/sjf|joint fund|pooled|un fund/.test(t)) return xSjf();
  if (/displac|migration|drought.*fund|where.*displaced|gap.*displac|idp/.test(t)) return xMigration();
  if (/climate/.test(t)) return xClimateMigration();
  return xGeneric(q);
}

function resolveAidFlowRecipeWithMode(query: string, extendedKnowledge: boolean): AidFlowRecipeResult {
  if (extendedKnowledge) return recipeExtended(query);
  return resolveAidFlowRecipe(query);
}

export function resolveAidFlowPrompt(query: string, extendedKnowledge = false): AidFlowPromptResult {
  if (isChatOnlyPrompt(query)) {
    return { lane: 'chat', body: getChatOnlyAnswer('aid-flow', query), chips: [...AI_CHIPS] };
  }

  const recipe = resolveAidFlowRecipeWithMode(query, extendedKnowledge);
  if (recipe.isFallback) {
    return {
      lane: 'chat',
      body: stripHtml(recipe.summaryHtml),
      chips: recipe.followUps.slice(0, 3),
    };
  }

  return { lane: 'dashboard', recipe };
}

export { resolveAidFlowRecipe };
