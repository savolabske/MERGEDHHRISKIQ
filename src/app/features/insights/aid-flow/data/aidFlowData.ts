import { AlertTriangle, Briefcase, Calendar, Check, Heart, Home, Layers, MapPin, Sparkles, Sprout, TrendingDown } from 'lucide-react';
import type { AidFlowDataset, AidFlowKpiCard, AidFlowScene } from '../types';

export const COLORS = {
  brand: '#1f6feb',
  brandD: '#1550b3',
  line: '#e6e9ef',
  line2: '#eef1f6',
  muted: '#6b7a8d',
  ink: '#0d1b2a',
  ink2: '#3a4a5c',
  food: '#ef6c2e',
  health: '#d8413c',
  resil: '#3fa85a',
  basic: '#2a7fe0',
  wash: '#16a39a',
  edu: '#9b59b6',
  prot: '#c79a2e',
  other: '#9aa6b2',
} as const;

export const AID_FLOW_DATA: AidFlowDataset = {
  totals: { envelope: 14997, actual: 9075, planned: 4885, projects: 1334, donors: 176, regions: 8 },
  donors: [
    ['FCDO', 1096.7], ['USAID (USA)', 703.6], ['Germany', 695.3], ['World Bank', 640.9], ['EU', 633.0],
    ['Sweden', 472.0], ['African Dev Bank', 424.5], ['Denmark', 262.1], ['CERF', 233.5], ['Canada', 225.4],
  ],
  sectors: [
    ['Food Security', 3802.5, COLORS.food], ['Health', 656.4, COLORS.health], ['Social Protection', 405.7, COLORS.basic], ['Refugees & Durable Sol.', 304.3, COLORS.resil],
    ['Public Fin. Mgmt', 278.9, COLORS.wash], ['Nutrition', 247.1, COLORS.edu], ['Civil Service Reform', 234.1, COLORS.prot], ['Budget Support', 222.9, COLORS.other],
  ],
  locations: [
    ['Puntland', 1426.0], ['FGS (federal)', 1194.7], ['South West', 1112.7], ['Somaliland', 1107.6],
    ['Banadir (BRA)', 990.6], ['Jubaland', 918.2], ['Hirshabelle', 638.4], ['Galmudug', 558.0],
  ],
  trend: [[2014, 5.9, 0], [2015, 49.3, 0], [2016, 277.3, 0], [2017, 1110.7, 0], [2018, 1122.7, 0], [2019, 1665.0, 0], [2020, 1605.5, 629.6], [2021, 942.3, 912.1], [2022, 1093.4, 322.2], [2023, 1203.1, 946.2], [2024, 0, 130.6], [2025, 0, 1824.8], [2026, 0, 118.7]],
  markers: { Humanitarian: [312, 4992], Resilience: [374, 6114], Stabilization: [349, 5217], 'Durable Solutions': [400, 5609], Gender: [635, 6946], 'Capacity Dev': [713, 7616], Climate: [146, 3770] },
  humdev: { hum: 4992, dev: 4083 },
  implementers: [['WFP', 3148.0], ['FGS Min. of Finance', 544.4], ['UNICEF', 433.0], ['Federal Gov of Somalia', 298.4], ['FGS Min. of Education', 295.5], ['FGS Health/Labour', 285.7], ['Adam Smith Intl', 222.3], ['IOM', 168.0]],
  topProjects: [
    ['Access to nutritious food (PROSCAL)', 'Denmark', 'Food Security', 'Puntland', 1685.3, 1850, 'Active'],
    ['Ensuring access to adequate food', 'China', 'Food Security', 'Puntland', 736.7, 800, 'Active'],
    ['Reducing Malnutrition & Strengthening Sys.', 'China', 'Food Security', 'Puntland', 571.4, 600, 'Closing'],
    ['Internal Risk Facility (SHARP)', 'FCDO', 'Food Security', 'Hirshabelle', 166.6, 210, 'Active'],
    ['Building Resilience: Safety Nets (Baxnaano)', 'World Bank', 'Social Protection', 'Hirshabelle', 160.8, 200, 'Active'],
  ],
};

export const KPI_CARDS: AidFlowKpiCard[] = [
  { label: 'Total Aid Envelope', value: '$15.00B', sub: '2014-2026 - 1,334 projects', prompt: "Summarise the total aid envelope and what's driving it", color: COLORS.brand, iconBg: '#eaf1fe', iconColor: COLORS.brand, icon: Home },
  { label: 'Actual Disbursements', value: '$9.08B', sub: '61% of envelope', prompt: 'Compare actual vs planned disbursements over time', color: COLORS.resil, iconBg: '#eafaf0', iconColor: COLORS.resil, icon: Check },
  { label: 'Planned Disbursements', value: '$4.88B', sub: '2020-2030 commitments', prompt: 'Where are future planned disbursements concentrated?', color: COLORS.basic, iconBg: '#eef4ff', iconColor: COLORS.basic, icon: Calendar },
  { label: 'Active Projects', value: '1,334', sub: 'across 8 regions', prompt: 'List the largest active projects', color: COLORS.edu, iconBg: '#f3eefe', iconColor: COLORS.edu, icon: Briefcase },
  { label: 'Top Donor', value: 'FCDO (UK)', sub: '$1.10B - 12%', prompt: 'Analyze FCDO funding by sector', color: COLORS.food, iconBg: '#fdeeea', iconColor: COLORS.food, icon: Heart },
  { label: 'Top Sector', value: 'Food Security', sub: '$3.80B - 42%', prompt: 'Why is Food Security so dominant?', color: COLORS.food, iconBg: '#fdeeea', iconColor: '#c97a2a', icon: Sprout },
];

export const SCENES: AidFlowScene[] = [
  { num: '01 / 08', title: 'The big picture', stat: '$15.00B', statLbl: 'committed across 1,334 projects since 2014', body: "Somalia's recorded aid since 2014 totals roughly <b>$15 billion</b> in commitments. Of that, <b>$9.08B</b> has actually been disbursed - about 61 cents on every committed dollar.", bullets: ['$9.08B actually disbursed (61%)', '$4.88B planned for 2020-2030', '176 distinct donors recorded'], ask: "Summarise the total aid envelope and what's driving it", cap: 'Envelope vs disbursed', ctitle: 'Committed -> Disbursed -> Planned' },
  { num: '02 / 08', title: 'A handful of donors carry it', stat: '$4.6B', statLbl: 'from the top 5 donors alone', body: 'Funding is concentrated. The top five donors - FCDO, USAID, Germany, the World Bank and the EU - account for about half of all disbursements. FCDO alone leads at <b>$1.10B</b>.', bullets: ['FCDO (UK) leads with $1.10B', 'Long tail of 170+ smaller donors', 'Multilateral + bilateral mix'], ask: 'Show the donor ranking and concentration', cap: 'Top donors', ctitle: 'Disbursements by donor (USD)' },
  { num: '03 / 08', title: 'Food Security dominates', stat: '42%', statLbl: 'of all disbursements go to Food Security', body: 'Sector funding is heavily skewed. <b>Food Security</b> absorbs <b>$3.80B</b> - more than the next seven sectors combined - reflecting recurring drought and famine response.', bullets: ['Food Security: $3.80B (42%)', 'Health a distant second at $656M', 'Governance & PFM steadily funded'], ask: 'Why is Food Security so dominant?', cap: 'Sector allocation', ctitle: 'Top sectors by actual disbursements' },
  { num: '04 / 08', title: 'Humanitarian still outweighs development', stat: '55 / 45', statLbl: 'humanitarian vs development split', body: 'Roughly <b>$4.99B</b> flows through humanitarian-marked projects versus <b>$4.08B</b> development. The country remains in a response posture more than a building one.', bullets: ['Humanitarian: $4.99B (55%)', 'Development: $4.08B (45%)', '312 humanitarian-marked projects'], ask: 'Compare humanitarian vs development funding', cap: 'Humanitarian vs development', ctitle: 'Envelope split by marker' },
  { num: '05 / 08', title: 'Disbursements peaked, then thin out', stat: '2019', statLbl: 'the peak year at $1.67B disbursed', body: 'Actual disbursements climbed sharply to 2019, then plateaued. Reporting thins after 2023 - but planned commitments spike to $1.82B in 2025, signalling a pipeline yet to land.', bullets: ['Peak actual: $1.67B in 2019', 'Reported actuals taper after 2023', 'Planned surge: $1.82B for 2025'], ask: 'Compare actual vs planned disbursements over time', cap: 'Disbursement trend', ctitle: 'Actual vs planned, 2014-2026' },
  { num: '06 / 08', title: 'Where the money lands', stat: '$1.43B', statLbl: 'to Puntland - the most-funded region', body: 'Disbursements spread across all federal member states. Puntland leads at $1.43B, followed by federal-level (FGS) programmes and South West. Galmudug sits lowest at $558M.', bullets: ['Puntland highest: $1.43B', 'Galmudug lowest: $558M', '8 regions tracked + federal'], ask: 'Which regions are underfunded?', cap: 'Regional allocation', ctitle: 'Disbursements by region' },
  { num: '07 / 08', title: 'Who actually delivers it', stat: '$3.15B', statLbl: 'channelled through WFP alone', body: 'Delivery is concentrated too. WFP moves $3.15B - a third of everything - followed by Somali federal ministries and UNICEF. The mix shows a blend of UN agencies and government systems.', bullets: ['WFP: $3.15B delivered', 'Govt ministries rising as channels', 'UNICEF, IOM, INGOs follow'], ask: 'Analyse implementers and delivery partners', cap: 'Implementer analysis', ctitle: 'Top implementing partners' },
  { num: '08 / 08', title: 'Cross-cutting priorities', stat: '$3.77B', statLbl: 'touches climate & environment', body: 'Markers show how priorities thread through projects. Capacity development ($7.6B) and gender ($6.9B) are tagged most. Climate touches $3.77B across 146 projects - growing fast.', bullets: ['Capacity Dev: 713 projects', 'Gender-marked: 635 projects', 'Climate: 146 projects, $3.77B'], ask: 'Show climate-related aid flows', cap: 'Markers', ctitle: 'Funding by cross-cutting marker' },
];

export const DONOR_OPTIONS = ['FCDO', 'USAID (USA)', 'Germany', 'World Bank', 'EU', 'Sweden', 'Denmark', 'CERF', 'UNICEF', 'WFP'];
export const SECTOR_OPTIONS = ['Food Security', 'Health', 'Nutrition', 'Social Protection', 'Refugees & Durable Sol.', 'Public Fin. Mgmt', 'Civil Service Reform', 'Budget Support'];
export const REGION_OPTIONS = ['Banadir (BRA)', 'Puntland', 'Somaliland', 'South West', 'Jubaland', 'Hirshabelle', 'Galmudug', 'FGS (federal)'];
export const AI_CHIPS = ['Analyze FCDO funding by sector', 'Which regions are underfunded?', 'Show climate-related aid flows', 'Compare humanitarian vs development funding'];
export const FORWARD_ICONS = [AlertTriangle, TrendingDown, MapPin, Sparkles, Layers, Check] as const;
