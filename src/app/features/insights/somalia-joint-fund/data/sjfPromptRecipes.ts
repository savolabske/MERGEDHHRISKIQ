import { AID_FLOW_DATA } from '../../aid-flow/data/aidFlowData';
import { MIGRATION_DATA } from '../../migration-displacement/data/migrationData';
import { COLORS, SJF_DATA } from './sjfData';
import type { SjfRecipeResult } from '../types';

function rDonors(): SjfRecipeResult {
  return {
    title: 'Donor contributions',
    summaryHtml:
      'As of 30 June 2025, <b>14 donor governments and the Peacebuilding Fund</b> have deposited <b>$597.7M</b> into the SJF since 2014. <b>Sweden ($141.4M)</b> leads, followed by the EU ($89.1M) and Norway ($86.1M). In H1 2025 alone, <b>6 donors contributed $14.9M — more than double H1 2024</b>, signalling a recovery from the 2024 dip.',
    findings: [
      { value: '14', label: 'Donors all-time' },
      { value: 'Sweden', label: 'Largest ($141.4M)' },
      { value: '6', label: 'Active in H1 2025' },
      { value: '$597.7M', label: 'Total deposited' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'All-time donor ranking',
            subtitle: 'Cumulative deposits 2014–H1 2025',
            chart: {
              kind: 'hbars',
              rows: SJF_DATA.donorsAllTime.map(([n, v]) => [n, v, COLORS.navy]),
            },
          },
          {
            title: 'H1 2025 donor activity',
            subtitle: 'Commitment vs deposit',
            chart: { kind: 'depositGauges', rows: SJF_DATA.donorsH1_2025 },
          },
        ],
      },
    ],
    followUps: [
      'How are 2025 deposits trending?',
      'Compare H1 2025 vs 2024',
      'Which donors signed multi-year deals?',
    ],
    chips: ['Show 2025 only', 'Show all-time'],
  };
}

function rDepositRate(): SjfRecipeResult {
  return {
    title: '2025 deposit performance',
    summaryHtml:
      'In H1 2025 the SJF achieved an <b>87% deposit rate</b> — $14.9M deposited against $17.1M committed. <b>Switzerland\'s $2.2M was committed but not yet deposited</b> as of 30 June — a timing lag mirroring Finland\'s 2024 pattern. Six of seven contributors had landed 100% by mid-year. Crucially, contributions are now <b>mostly unearmarked</b>, restoring programming flexibility.',
    findings: [
      { value: '87%', label: 'H1 2025 deposit rate' },
      { value: '6 of 7', label: 'Donors at 100%' },
      { value: '$2.2M', label: 'Switzerland — pending' },
      { value: 'Unearmarked', label: 'Most of 2025 inflow' },
    ],
    sections: [
      {
        type: 'full',
        title: 'H1 2025 donor-by-donor performance',
        subtitle: 'Commitment (light) vs deposit (dark)',
        chart: { kind: 'depositGauges', rows: SJF_DATA.donorsH1_2025 },
      },
    ],
    followUps: [
      'Compare with 2024 deposit rates',
      'Show annual deposit trend',
      'Who are the most reliable donors?',
    ],
    chips: ['Show annual trend', 'Show by donor'],
  };
}

function rAnnualFlow(): SjfRecipeResult {
  return {
    title: 'Annual deposits and transfers',
    summaryHtml:
      'The annual flow tells a recovery story. After 2022\'s peak ($46M), deposits fell to $33M in 2023 and $29M in 2024. <b>H1 2025 alone reached $14.9M — already over half of 2024\'s full-year total</b>. Transfers to UN agencies also recovered, with $15.9M moved in H1 2025. The full-year trajectory points to ~$30M+ deposits, a stabilisation rather than further decline.',
    findings: [
      { value: '$14.9M', label: 'H1 2025 deposits' },
      { value: '$15.9M', label: 'H1 2025 transfers' },
      { value: '2.1×', label: 'vs H1 2024' },
      { value: '$46M', label: '2022 peak deposits' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Annual deposits vs transfers',
        subtitle: 'USD millions, 2021–H1 2025',
        chart: { kind: 'yearlyDual', rows: SJF_DATA.yearly },
      },
    ],
    followUps: [
      'What does the funding gap mean?',
      'Show donor concentration',
      'Which agencies absorbed the increase?',
    ],
    chips: ['Show gap', 'Show by agency'],
  };
}

function rWindows(): SjfRecipeResult {
  const funded = SJF_DATA.windows.filter((w) => w[2] > 0);
  return {
    title: 'Funding by thematic window',
    summaryHtml:
      'In H1 2025, <b>Inclusive Politics leads at 37% ($42M)</b> — anchored by the State-building & Reconciliation Programme and the Constitutional Review. Climate & Resilience follows at 32% ($35.9M), Rule of Law at 15% ($17.3M). <b>Two windows — Social Development and Economic Development — remain unfunded</b> pending dedicated donor commitments.',
    findings: [
      { value: '37%', label: 'Inclusive Politics' },
      { value: '32%', label: 'Climate & Resilience' },
      { value: '7', label: 'Total windows' },
      { value: '2', label: 'Unfunded' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Portfolio share by window',
        subtitle: 'Active 2025 allocation',
        chart: { kind: 'windowGrid', rows: SJF_DATA.windows },
      },
      {
        type: 'grid',
        items: [
          {
            title: 'Window ranking',
            subtitle: 'H1 2025 allocation in $M',
            chart: {
              kind: 'hbars',
              rows: funded.map((w) => [w[0], w[2] * 1e6, w[4]]),
              formatter: 'money',
            },
          },
          {
            title: 'Open vs unfunded',
            chart: {
              kind: 'donut',
              a: 5,
              b: 2,
              labelA: 'Open',
              labelB: 'windows',
              colorA: COLORS.brand,
              colorB: COLORS.wMgt,
            },
          },
        ],
      },
    ],
    followUps: [
      'Show programmes under Inclusive Politics',
      'Which donors fund Climate & Resilience?',
      'Why is Social Development unfunded?',
    ],
    chips: ['Show programmes', 'Show donors'],
  };
}

function rPUNO(): SjfRecipeResult {
  return {
    title: 'UN agencies & delivery partners',
    summaryHtml:
      'In H1 2025, <b>UNDP received $10.6M — two-thirds of all transfers</b> — followed by UNICEF ($2.8M) and UN-HABITAT ($868k). The mix narrowed considerably from 2024 when IOM was a strong second. The delivery picture: a small group of UN agencies carrying the bulk of execution, with UNDP\'s dominance growing as portfolio consolidates around governance work.',
    findings: [
      { value: 'UNDP', label: 'Top recipient' },
      { value: '$10.6M', label: 'UNDP H1 2025' },
      { value: '66%', label: 'UNDP share' },
      { value: '7', label: 'Agencies in H1 2025' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'H1 2025 transfers by UN agency',
            subtitle: '$ to PUNOs',
            chart: {
              kind: 'hbars',
              rows: SJF_DATA.punoTransfersH1_2025.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
          {
            title: '2024 transfers (comparison)',
            subtitle: 'Full year',
            chart: {
              kind: 'hbars',
              rows: SJF_DATA.punoTransfers2024.map(([n, v]) => [n, v, COLORS.wMgt]),
            },
          },
        ],
      },
    ],
    followUps: [
      'Show programmes by lead agency',
      'Which programmes is UNDP running?',
      'Why did IOM transfers drop?',
    ],
    chips: ['Show by programme', 'Show change'],
  };
}

function rProgrammes(): SjfRecipeResult {
  return {
    title: 'Programme portfolio',
    summaryHtml:
      'Following several closures in mid-2025, the SJF now holds <b>12 active programmes worth $214.7M in approved budgets</b>, delivered by 12 UN entities. The largest active programme is <b>State-building & Reconciliation ($27.6M)</b>. The <b>UNFPA Country Programme, JJCP, JCP and JPP legacy programmes have closed</b>; the Women Peace and Protection programme also concluded in July 2025, with a successor designed but awaiting funding.',
    findings: [
      { value: '12', label: 'Active programmes' },
      { value: '$214.7M', label: 'Approved total' },
      { value: '$110.1M', label: 'Net-funded' },
      { value: 'WPP', label: 'Closed Jul 2025' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Programme portfolio',
        subtitle: 'Approved budgets and status',
        chart: { kind: 'programmeTable', rows: SJF_DATA.programmes },
      },
    ],
    followUps: [
      'Show programmes by window',
      'Which programmes start in 2026?',
      'What replaces the WPP?',
    ],
    chips: ['Group by window', 'Show recently closed'],
  };
}

function rResults(): SjfRecipeResult {
  return {
    title: 'H1 2025 results & achievements',
    summaryHtml:
      'Delivery scaled fast in the first half of 2025. <b>Digital ID registrations more than doubled</b> in six months — from 90,000 at end-2024 to over <b>190,000 by mid-2025</b>. A national FGM/child-marriage campaign reached <b>2.1 million people</b>. Saameynta mapped <b>5,650 households</b> and issued 415 tenure documents in six months alone. <b>312 stakeholders helped design Somalia\'s first National Human Rights Commission</b>.',
    findings: [
      { value: '190k+', label: 'Digital ID registrations' },
      { value: '2.1M', label: 'FGM campaign reach' },
      { value: '5,650', label: 'Households mapped' },
      { value: 'NHRC', label: 'First-ever launched' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Selected achievements across windows',
        subtitle: 'Headline figures from the H1 2025 Semi-Annual Report',
        chart: { kind: 'achievements', rows: SJF_DATA.achievements_H1_2025 },
      },
    ],
    followUps: [
      'Show results by window',
      'Show gender-specific outcomes',
      "What's happening in Baidoa?",
    ],
    chips: ['Show by window', 'Show gender outcomes'],
  };
}

function rOutlook(): SjfRecipeResult {
  return {
    title: 'Funding gap & forward outlook',
    summaryHtml:
      'The Investment Strategy targets <b>$65M annually</b>. H1 2025\'s $14.9M is encouraging, but full-year is likely <b>~$30M</b> — still roughly half of ambition. <b>Two of seven windows</b> (Social Development, Economic Development) remain unfunded. The <b>UNTMIS transition through 2026</b> is the next pivotal moment. SJF Connect platform launching in H2 2025 will strengthen transparency.',
    findings: [
      { value: '$65M', label: 'Annual target' },
      { value: '~$30M', label: '2025 trajectory' },
      { value: '~46%', label: 'of target' },
      { value: '2 of 7', label: 'Windows unfunded' },
    ],
    sections: [
      {
        type: 'full',
        title: 'Target vs actual',
        subtitle: 'Where the funding gap sits',
        chart: {
          kind: 'gapCallout',
          rows: [
            ['Strategy target', 65, COLORS.wIp],
            ['2022 peak', 46, COLORS.gold],
            ['H1 2025 (annualised)', 30, COLORS.brand],
            ['2024 actual', 29, COLORS.coral],
          ],
          note: 'roughly $35M annually, before factoring two unfunded windows.',
        },
      },
    ],
    followUps: [
      'Which donors are at risk of leaving?',
      'Show multi-year commitment status',
      "What's the UNTMIS impact?",
    ],
    chips: ['Show donor risks', 'Show pipeline'],
  };
}

function rOverview(): SjfRecipeResult {
  return {
    title: 'SJF overview',
    summaryHtml:
      'The Somalia Joint Fund is the UN\'s main pooled-funding platform for Somalia. <b>$597.7M deposited since 2014</b>, with <b>$14.9M added in H1 2025 alone</b> — more than double the same period in 2024. The active portfolio holds <b>12 programmes worth $214.7M</b> delivered by 12 UN entities. <b>Inclusive Politics</b> is now the largest thematic window (37%); <b>UNDP</b> is the largest delivery partner.',
    findings: [
      { value: '$597.7M', label: 'Deposited since 2014' },
      { value: '$214.7M', label: 'Active portfolio' },
      { value: '12', label: 'Active programmes' },
      { value: '2.1×', label: 'H1 2025 vs H1 2024' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'By window',
            chart: { kind: 'windowGrid', rows: SJF_DATA.windows },
          },
          {
            title: 'By UN agency (H1 2025)',
            chart: {
              kind: 'hbars',
              rows: SJF_DATA.punoTransfersH1_2025.map(([n, v]) => [n, v, COLORS.brand]),
            },
          },
        ],
      },
    ],
    followUps: [
      'Show donor contributions',
      'How are 2025 deposits trending?',
      'What has the SJF achieved in 2025?',
      'What is the funding gap?',
    ],
    chips: ['Show donors', 'Show results'],
  };
}

function rGeneric(q: string): SjfRecipeResult {
  return {
    title: 'SJF data',
    summaryHtml: `Here's what the SJF data shows for <b>"${q}"</b>. As of mid-2025, the fund holds a $214.7M active portfolio, with $597.7M raised since 2014. 12 programmes run across 5 open windows; Inclusive Politics is the largest theme. H1 2025 deposits more than doubled vs H1 2024. Try a chip below for a sharper cut.`,
    findings: [
      { value: '$214.7M', label: 'Active portfolio' },
      { value: '12', label: 'Programmes' },
      { value: '6', label: 'Donors in H1 2025' },
      { value: '5', label: 'Open windows' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'By donor (H1 2025)',
            chart: {
              kind: 'hbars',
              rows: SJF_DATA.donorsH1_2025.map((d) => [d[0], d[1], COLORS.brand]),
            },
          },
          {
            title: 'By window',
            chart: { kind: 'windowGrid', rows: SJF_DATA.windows },
          },
        ],
      },
    ],
    followUps: [
      'Show donor contributions',
      'Break down by thematic window',
      'Show programme portfolio',
      'What has the SJF achieved in 2025?',
    ],
    chips: ['Show donors', 'Show windows'],
  };
}

function xAidFlow(): SjfRecipeResult {
  return {
    title: 'SJF in the wider Aid Flow picture',
    extended: true,
    summaryHtml:
      'Cross-referencing with the Aid Flow report: Somalia\'s total aid envelope 2014–2026 is <b>~$15B committed / $9.1B disbursed</b>. The SJF\'s <b>$597.7M deposited since 2014</b> represents <b>roughly 6.6% of disbursed aid</b> — a small but strategically positioned slice. Major bilateral donors like <b>FCDO ($1.10B) and USAID ($704M)</b> mostly fund outside the SJF. The SJF\'s distinctive value is in <b>pooling smaller European contributions</b> (Sweden, EU, Norway, Switzerland) into joint UN programming.',
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
                ['Total disbursed (Aid Flow)', 9075e6, COLORS.wMgt],
                ['SJF deposits to date', 598e6, COLORS.brand],
              ],
              formatter: 'money',
            },
          },
          {
            title: 'Donor overlap',
            subtitle: 'SJF vs bilateral channels',
            chart: {
              kind: 'hbars',
              rows: [
                ['FCDO (mostly outside SJF)', 1097e6, COLORS.wMgt],
                ['USAID (outside SJF)', 704e6, COLORS.wMgt],
                ['Sweden (mostly SJF)', 141e6, COLORS.brand],
                ['EU (large SJF share)', 89e6, COLORS.brand],
              ],
              formatter: 'money',
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

function xMigration(): SjfRecipeResult {
  return {
    title: 'SJF vs displacement reality',
    extended: true,
    summaryHtml:
      'Cross-referencing with the Migration & Displacement report: IOM has tracked <b>~971,000 new arrivals across Somalia</b> since Oct 2023, with <b>Bay (133k)</b> and <b>Banadir (124k)</b> the largest receiving regions. The SJF\'s Climate & Resilience window — including <b>Saameynta ($21.9M)</b> targeting IDPs — is the most directly relevant. In just H1 2025, Saameynta mapped <b>5,650 households</b> and issued <b>415 tenure documents</b>, against a national caseload of <b>~4M IDPs</b>. The mismatch between scale of displacement and scale of durable-solutions funding is the central tension.',
    findings: [
      { value: '971k', label: 'Tracked arrivals (Oct23+)' },
      { value: '~4M', label: 'Total IDPs (national)' },
      { value: '5,650', label: "Households mapped H1'25" },
      { value: '415', label: "Tenure docs H1'25" },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Scale of displacement',
            subtitle: 'From Migration report',
            chart: {
              kind: 'hbars',
              rows: [
                ['Total IDPs (national stock)', 4_000_000, COLORS.wMgt],
                ['Arrivals since Oct 23', MIGRATION_DATA.totals.arrivalsAll, COLORS.coral],
                ['Saameynta total budget', 21_850_278, COLORS.brand],
              ],
              formatter: 'money',
            },
          },
          {
            title: 'SJF response in H1 2025',
            subtitle: 'Saameynta achievements',
            chart: {
              kind: 'achievements',
              rows: [
                ['5,650', 'households mapped (33,900 people)'],
                ['415', 'tenure documents issued (61 to IDPs)'],
                ['218', 'jobs created (131 for IDPs)'],
                ['44', 'land disputes resolved in Baidoa & Bosaso'],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'Compare with all humanitarian aid',
      'Show climate-driven displacement',
      'Which regions are both most displaced and least funded?',
    ],
    chips: ['Compare with humanitarian', 'Show by region'],
  };
}

function xDiversion(): SjfRecipeResult {
  return {
    title: 'Aid diversion risk: SJF safeguards',
    extended: true,
    summaryHtml:
      'The UN Risk Management Unit operates the <b>Aid Diversion Tracker (ADT)</b>, shared in 2024 with UN, government, NGOs and donors. SJF programmes apply HACT, micro-assessments, spot checks, and direct payment modalities. The <b>Contractor Information Management System (CIMS)</b> has 10 agencies sharing data. In 2025, the ADT will add <b>geolocation of allegations</b> and a <b>diversion-rate metric over time</b>. This is one of the more developed risk frameworks in Somalia\'s aid architecture.',
    findings: [
      { value: 'ADT', label: 'Operational, multi-stakeholder' },
      { value: '10', label: 'Agencies on CIMS' },
      { value: '2025', label: 'Geolocation rollout' },
      { value: 'HACOF', label: 'External peer review' },
    ],
    sections: [
      {
        type: 'grid',
        items: [
          {
            title: 'Risk safeguards in place',
            subtitle: 'Cross-portfolio',
            chart: {
              kind: 'achievements',
              rows: [
                ['HACT', 'micro-assessments + spot checks'],
                ['Direct payment', 'modalities for high-risk'],
                ['CIMS', '10 agencies sharing partner data'],
                ['HACOF + Particip', 'external review + 3rd-party monitor'],
              ],
            },
          },
          {
            title: '2025 plans',
            subtitle: 'RMU forward priorities',
            chart: {
              kind: 'achievements',
              rows: [
                ['Geolocation', 'of diversion allegations'],
                ['Rate metric', 'measuring diversion over time'],
                ['NGO bill', 'supportive regulatory environment'],
                ['CIRT', 'redeveloped capacity tool'],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'Compare with bilateral aid risks',
      'Show governance window programmes',
      'What does third-party monitoring cover?',
    ],
    chips: ['Show governance work', 'Show monitoring'],
  };
}

function xClimateMigration(): SjfRecipeResult {
  return {
    title: 'Climate, displacement & SJF funding',
    extended: true,
    summaryHtml:
      'Linking three reports: IOM data shows <b>drought is the top driver of displacement</b> (~68% of recent arrivals). The Aid Flow report shows <b>$3.77B of total aid touches climate</b>. The SJF\'s response sits in the <b>Climate & Resilience window — $16.2M in 2024, 29% of the SJF portfolio</b>. That\'s about 0.4% of all climate-tagged aid to Somalia, but SJF\'s strength is <b>integration</b>: Saameynta links climate, displacement and durable solutions in one programme.',
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
                ['Total climate-tagged aid (AIMS)', 3770e6, COLORS.wMgt],
                ['SJF Climate & Resilience window', 16.2e6, COLORS.brand],
              ],
              formatter: 'money',
            },
          },
          {
            title: 'Why SJF matters here',
            subtitle: 'Despite small share',
            chart: {
              kind: 'achievements',
              rows: [
                ['Integration', 'climate + displacement + governance in one programme'],
                ['Saameynta', 'durable solutions for drought-displaced IDPs'],
                ['Maaryenta', 'new climate-governance programme launched 2024'],
                ['Joint UN', '6 agencies delivering together'],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'Show drought-driven displacement',
      'Compare with bilateral climate funding',
      'Which regions get both?',
    ],
    chips: ['Show by region', 'Show by donor'],
  };
}

function xGeneric(_q: string): SjfRecipeResult {
  return {
    title: 'Cross-report comparison',
    extended: true,
    summaryHtml:
      'Extended Knowledge is on. I can compare SJF data against Aid Flow, Migration & Displacement, and (where available) other Humanity Hub reports. Some example questions: <b>"Compare SJF with total donor funding"</b>, <b>"Show climate funding across all reports"</b>, <b>"Where is the biggest mismatch between displacement and SJF funding?"</b>, <b>"What\'s the aid diversion picture?"</b>',
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
              kind: 'achievements',
              rows: [
                ['Aid Flow', `AIMS + SSF · $${(AID_FLOW_DATA.totals.actual / 1000).toFixed(1)}B disbursed`],
                ['Migration & Displacement', 'IOM DTM · 971k arrivals'],
                ['SJF', 'this report · $214.7M'],
                ['Climate', 'planned'],
                ['Protection', 'planned'],
                ['Aid Diversion', 'planned'],
              ],
            },
          },
        ],
      },
    ],
    followUps: [
      'Compare SJF vs Aid Flow donors',
      'SJF vs displacement',
      'Climate cross-cut',
      'Diversion picture',
    ],
    chips: ['Aid Flow comparison', 'Migration comparison'],
  };
}

function recipeStandard(q: string): SjfRecipeResult {
  const t = q.toLowerCase();
  if (/summar|overall|overview|active portfolio|sjf overview/.test(t)) return rOverview();
  if (/donor|contribut|funding source|who fund/.test(t) && !/window/.test(t)) return rDonors();
  if (/deposit rate|deposit performance|trending|commit vs|finland|switzerland.*pending|deposits.*2025|2025.*deposit/.test(t))
    return rDepositRate();
  if (/annual|yearly|over time|deposit.*transfer|flow|rebound|peak|momentum/.test(t)) return rAnnualFlow();
  if (/window|theme|sector|breakdown.*alloc|climate.*resilience|inclusive politics|rule of law/.test(t))
    return rWindows();
  if (/un agenc|puno|undp|iom|implement|delivery|partner/.test(t)) return rPUNO();
  if (/result|achiev|outcome|impact|reach/.test(t)) return rResults();
  if (/gap|target|forward|outlook|next|future|65|risk|untmis/.test(t)) return rOutlook();
  if (/programme|project|portfolio|saameynta|jjcp|srsp|basis|jphr|wpp/.test(t)) return rProgrammes();
  return rGeneric(q);
}

function recipeExtended(q: string): SjfRecipeResult {
  const t = q.toLowerCase();
  if (/aid flow|donor.*compar|aims|fcdo|bilateral/.test(t)) return xAidFlow();
  if (/displac|migration|drought.*fund|where.*displaced|gap.*displac/.test(t)) return xMigration();
  if (/diver|leakage|adt|corrupt|risk/.test(t)) return xDiversion();
  if (/climate/.test(t)) return xClimateMigration();
  return xGeneric(q);
}

export function resolveSjfRecipe(query: string, extendedKnowledge: boolean): SjfRecipeResult {
  if (extendedKnowledge) return recipeExtended(query);
  return recipeStandard(query);
}

export function getRecipeAssistantReply(recipe: SjfRecipeResult): string {
  const ext = recipe.extended ? ' (cross-referencing linked reports)' : '';
  return `${recipe.title}${ext}: summary, charts and detail on the left.${recipe.chips?.length ? ' Drill further with the chips below.' : ''}`;
}
