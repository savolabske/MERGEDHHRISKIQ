import { AlertTriangle, Calendar, Check, Home, MapPin, Sparkles, TrendingUp, Users } from 'lucide-react';
import type { MigrationPair, MigrationPairWithColor, MigrationScene } from '../types';

export const COLORS = {
  brand: '#c2562a',
  brandD: '#a3461f',
  muted: '#8a7d72',
  ink: '#1a1410',
  ink2: '#4a3f38',
  line: '#ece6df',
  line2: '#f3efe9',
  drought: '#d98324',
  conflict: '#b23a2e',
  flood: '#2f7fb5',
  teal: '#1f7a6e',
  amber: '#d99a21',
  men: '#3d6b9e',
  women: '#c2562a',
  child: '#d99a21',
} as const;

export const MIGRATION_THEME = {
  title: 'Migration & Displacement Intelligence',
  subtitle: 'Track who is moving across Somalia, why, where to, and whether support is keeping pace.',
};

export const MIGRATION_DATA = {
  totals: { arrivalsAll: 970896, arrivalsPeriod: 461865, departures: 40394, regions: 12, districts: 25, sites: 3921, weeks: 61 },
  demo: { men: 110298, women: 148993, children: 202574 },
  cause: [['Drought', 27624, COLORS.drought], ['Conflict', 11225, COLORS.conflict], ['Flood', 904, COLORS.flood], ['Eviction', 737, '#7a6a8a'], ['Other Hazards', 67, COLORS.amber], ['Other', 137, '#9a8f86']] as MigrationPairWithColor[],
  regions: [['Bay', 133491], ['Banadir', 124222], ['Gedo', 82164], ['Middle Shabelle', 49598], ['Hiraan', 19364], ['Lower Shabelle', 14856], ['Lower Juba', 13372], ['Bakool', 11123], ['Galgaduud', 4958], ['Mudug', 3924], ['Middle Juba', 3166], ['Nugaal', 1627]] as MigrationPair[],
  districts: [['Kahda', 78685, 'Banadir', 'Drought'], ['Baidoa', 73522, 'Bay', 'Drought'], ['Diinsoor', 44888, 'Bay', 'Drought'], ['Doolow', 42120, 'Gedo', 'Conflict'], ['Dayniile', 41910, 'Banadir', 'Drought'], ['Jowhar', 27845, 'Middle Shabelle', 'Flood'], ['Baardheere', 22581, 'Gedo', 'Conflict'], ['Balcad', 21753, 'Middle Shabelle', 'Conflict'], ['Qansax Dheere', 15081, 'Bay', 'Drought'], ['Afgooye', 14856, 'Lower Shabelle', 'Conflict']] as [string, number, string, string][],
  monthly: [['2023-10', 41181], ['2023-11', 92195], ['2023-12', 51922], ['2024-01', 78075], ['2024-02', 7700], ['2024-03', 1744], ['2024-04', 21967], ['2024-05', 34463], ['2024-06', 34682], ['2024-07', 47440], ['2024-08', 40314], ['2024-09', 42759], ['2024-10', 7531], ['2024-11', 3521], ['2024-12', 3537], ['2025-02', 47430], ['2025-03', 55605], ['2025-04', 52816], ['2025-05', 47144], ['2025-06', 52644], ['2025-07', 49584], ['2025-08', 7191], ['2025-09', 18705], ['2025-10', 16199], ['2025-11', 17100], ['2025-12', 21227], ['2026-01', 20344], ['2026-02', 19716], ['2026-03', 21660], ['2026-04', 7383], ['2026-05', 7117]] as MigrationPair[],
  needs: [['Food', 25746], ['Drinking Water', 5927], ['Shelter', 3355], ['Livelihoods', 2813], ['Water (wash/cook)', 1129], ['Cash', 1083], ['Sanitation & Hygiene', 257], ['NFIs', 176]] as MigrationPair[],
  gap: [['Food', 38627, 2258], ['Shelter', 37426, 1802], ['Health', 35367, 1324], ['Nutrition', 34365, 1244], ['Water', 33069, 913], ['Sanitation', 30201, 1511], ['Protection', 28644, 785], ['Hygiene', 26905, 1071], ['GBV', 12053, 319], ['Child Prot.', 11560, 353], ['Learning', 10739, 293]] as [string, number, number][],
  stay: [['More than 6 months', 21874], ['A week to 6 months', 3804], ['Less than a week', 2723]] as MigrationPair[],
};

export const MIGRATION_SCENES: MigrationScene[] = [
  { num: '01 / 08', title: 'Nearly a million moves, tracked', stat: '971k', statLbl: 'new arrivals recorded since Oct 2023', body: "IOM's Emergency Trends Tracking has logged nearly one million new arrivals across Somalia since October 2023.", bullets: ['971k arrivals tracked over 2.5 years', '462k in the current round', 'Across 12 regions, 25 districts'], ask: 'Summarise the overall displacement picture', cap: 'Scale of movement', ctitle: 'Arrivals by round' },
  { num: '02 / 08', title: 'Drought is the main engine', stat: '68%', statLbl: 'of recent arrivals fled drought', body: 'Most movement remains climate-driven, with drought as the largest driver and conflict as the second.', bullets: ['Drought: dominant driver', 'Conflict: persistent second', 'Floods and evictions: episodic'], ask: 'What is driving displacement — drought or conflict?', cap: 'Causes', ctitle: 'Arrivals by cause' },
  { num: '03 / 08', title: 'Conflict pressure is rising', stat: '2025', statLbl: 'conflict spikes changed the mix', body: 'The cause mix evolves over time, with conflict shocks increasingly shaping movement patterns.', bullets: ['Mix shifts across periods', 'Conflict spikes in 2025', 'Two overlapping crises'], ask: 'How has the drought vs conflict mix changed over time?', cap: 'Cause trend', ctitle: 'Arrivals over time' },
  { num: '04 / 08', title: 'Children carry the burden', stat: '44%', statLbl: 'of arrivals are children under 18', body: 'Women and children make up the majority of arrivals, indicating family-centered displacement pressure.', bullets: ['Children under 18: largest group', 'Women are second largest', 'Families are central profile'], ask: 'Break down arrivals by age and gender', cap: 'Demographics', ctitle: 'Arrivals by group' },
  { num: '05 / 08', title: 'Seasonality matters', stat: 'Peaks', statLbl: 'movement pulses with stress seasons', body: 'Arrivals rise and fall over time, with changes also affected by monitoring coverage shifts.', bullets: ['Peaks align with stress periods', 'Coverage shifts affect totals', 'Compare equivalent windows'], ask: 'Show the displacement trend over time', cap: 'Seasonal pulse', ctitle: 'Monthly arrivals' },
  { num: '06 / 08', title: 'Where people land', stat: 'Bay', statLbl: 'largest receiving region', body: 'Arrivals concentrate in a handful of receiving hubs, especially Bay and Banadir.', bullets: ['Bay and Banadir lead', 'Top districts absorb pressure', 'Rural-to-urban flow'], ask: 'Which regions and districts receive the most people?', cap: 'Destinations', ctitle: 'Arrivals by region' },
  { num: '07 / 08', title: 'Needs outpace response', stat: '~6%', statLbl: 'food needs met by recorded response', body: 'Across sectors, flagged needs are consistently higher than recorded response levels.', bullets: ['Food gap is severe', 'Shelter/health/water gaps persist', 'Protection coverage remains thin'], ask: 'Where are the biggest gaps between needs and response?', cap: 'Needs vs response', ctitle: 'Gap by sector' },
  { num: '08 / 08', title: 'Most expect to stay', stat: '6+ months', statLbl: 'majority intend long stays', body: 'Most respondents indicate medium to long stays, signaling protracted displacement dynamics.', bullets: ['Most report 6+ month intent', 'Camp settlement remains common', 'Not a purely short-term shock'], ask: 'Are these movements temporary or long-term?', cap: 'Intentions', ctitle: 'Intended stay duration' },
];

export const MIGRATION_KPI_BASE = [
  { label: 'Tracked Arrivals', prompt: 'Summarise the overall displacement picture', icon: Home, iconBg: '#fbeee5', iconColor: COLORS.brand, color: COLORS.brand },
  { label: 'Recent Wave', prompt: 'Show the displacement trend over time', icon: TrendingUp, iconBg: '#e7f3f1', iconColor: COLORS.teal, color: COLORS.teal },
  { label: 'Top Driver', prompt: 'What is driving displacement — drought or conflict?', icon: AlertTriangle, iconBg: '#fbeede', iconColor: COLORS.drought, color: COLORS.drought },
  { label: 'Children', prompt: 'Break down arrivals by age and gender', icon: Users, iconBg: '#fdf3df', iconColor: COLORS.amber, color: COLORS.amber },
  { label: 'Top Destination', prompt: 'Which regions and districts receive the most people?', icon: MapPin, iconBg: '#fbeee5', iconColor: COLORS.brand, color: COLORS.brand },
  { label: 'Unmet Need', prompt: 'Where are the biggest gaps between needs and response?', icon: Check, iconBg: '#fbe6e3', iconColor: COLORS.conflict, color: COLORS.conflict },
];

export const MIGRATION_CHIPS = ['What is driving displacement?', 'Which regions receive the most people?', 'Break down by age and gender', 'Where are the biggest response gaps?', 'Show the trend over time', 'Are these movements long-term?'];
export const FORWARD_ICONS = [AlertTriangle, TrendingUp, MapPin, AlertTriangle, Users, Calendar] as const;
