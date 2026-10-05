export type DashboardCountryId = 'all' | 'somalia' | 'kenya' | 'ethiopia' | 'south-sudan';

export type DashboardUsagePreset = 'today' | 'week' | 'lastWeek' | 'month';

type SpecificCountry = Exclude<DashboardCountryId, 'all'>;

export const DASHBOARD_COUNTRIES: { id: DashboardCountryId; label: string }[] = [
  { id: 'all', label: 'All countries' },
  { id: 'somalia', label: 'Somalia' },
  { id: 'kenya', label: 'Kenya' },
  { id: 'ethiopia', label: 'Ethiopia' },
  { id: 'south-sudan', label: 'South Sudan' },
];

const COUNTRY_IDS: SpecificCountry[] = ['somalia', 'kenya', 'ethiopia', 'south-sudan'];

/** Registered users. All-countries totals on the dashboard split on these weights. */
const COUNTRY_USERS: Record<SpecificCountry, number> = {
  somalia: 168,
  kenya: 22,
  ethiopia: 16,
  'south-sudan': 8,
};

const PERIOD_FACTOR: Record<DashboardUsagePreset, number> = {
  today: 341 / 2186,
  week: 1,
  lastWeek: 1904 / 2186,
  month: 8420 / 2186,
};

export function countryPortion(total: number, country: DashboardCountryId): number {
  if (country === 'all') return total;
  const weightSum = COUNTRY_IDS.reduce((sum, id) => sum + COUNTRY_USERS[id], 0);
  const exact = COUNTRY_IDS.map((id) => (total * COUNTRY_USERS[id]) / weightSum);
  const shares = exact.map((value) => Math.floor(value));
  let leftover = total - shares.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - shares[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < leftover; i += 1) {
    shares[byRemainder[i].index] += 1;
  }

  return shares[COUNTRY_IDS.indexOf(country)];
}

export function splitTotal(weights: number[], total: number): number[] {
  const sum = weights.reduce((running, weight) => running + weight, 0);
  if (sum === 0 || total === 0) return weights.map(() => 0);
  const exact = weights.map((weight) => (weight / sum) * total);
  const shares = exact.map((value) => Math.floor(value));
  let leftover = total - shares.reduce((running, value) => running + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - shares[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < leftover; i += 1) {
    shares[byRemainder[i].index] += 1;
  }

  return shares;
}

export function distributeCounts<T extends { count: number }>(items: T[], total: number): T[] {
  const sum = items.reduce((running, item) => running + item.count, 0);
  if (sum === 0 || total === 0) return [];
  const exact = items.map((item) => (item.count / sum) * total);
  const shares = exact.map((value) => Math.floor(value));
  let leftover = total - shares.reduce((running, value) => running + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - shares[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < leftover; i += 1) {
    shares[byRemainder[i].index] += 1;
  }

  return items
    .map((item, index) => ({ ...item, count: shares[index] }))
    .filter((item) => item.count > 0);
}

function periodCount(weekCount: number, preset: DashboardUsagePreset): number {
  if (weekCount === 0 || preset === 'week') return weekCount;
  return Math.round(weekCount * PERIOD_FACTOR[preset]);
}

function largestRemainderShares(counts: number[]): number[] {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total === 0) return counts.map(() => 0);
  const exact = counts.map((count) => (count / total) * 100);
  const shares = exact.map((value) => Math.floor(value));
  let leftover = 100 - shares.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - shares[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < leftover; i += 1) {
    shares[byRemainder[i].index] += 1;
  }

  return shares;
}

type InterestSeed = {
  id: string;
  name: string;
  accent: string;
  week: Record<SpecificCountry, number>;
};

const INTEREST_SEEDS: InterestSeed[] = [
  {
    id: 'food-security',
    name: 'Food security & nutrition',
    accent: '#059669',
    week: { somalia: 78, kenya: 9, ethiopia: 8, 'south-sudan': 4 },
  },
  {
    id: 'displacement',
    name: 'Displacement & protection',
    accent: '#c2562a',
    week: { somalia: 70, kenya: 6, ethiopia: 5, 'south-sudan': 5 },
  },
  {
    id: 'climate',
    name: 'Climate & drought',
    accent: '#0ea5e9',
    week: { somalia: 52, kenya: 14, ethiopia: 6, 'south-sudan': 1 },
  },
  {
    id: 'aid-funding',
    name: 'Aid delivery & funding',
    accent: '#2463eb',
    week: { somalia: 49, kenya: 4, ethiopia: 4, 'south-sudan': 0 },
  },
  {
    id: 'security-access',
    name: 'Security & access',
    accent: '#7c3aed',
    week: { somalia: 41, kenya: 0, ethiopia: 0, 'south-sudan': 3 },
  },
  {
    id: 'wash-health',
    name: 'WASH & health',
    accent: '#0891b2',
    week: { somalia: 36, kenya: 5, ethiopia: 3, 'south-sudan': 2 },
  },
  {
    id: 'gender-inclusion',
    name: 'Gender & inclusion',
    accent: '#db2777',
    week: { somalia: 18, kenya: 2, ethiopia: 1, 'south-sudan': 0 },
  },
  {
    id: 'early-warning',
    name: 'Early warning & forecasting',
    accent: '#d97706',
    week: { somalia: 14, kenya: 3, ethiopia: 1, 'south-sudan': 0 },
  },
];

export type InterestStat = {
  id: string;
  name: string;
  accent: string;
  count: number;
  share: number;
  barWidth: string;
};

export function interestStats(country: DashboardCountryId, preset: DashboardUsagePreset): InterestStat[] {
  const rows = INTEREST_SEEDS.map((item) => {
    const selected = country === 'all' ? COUNTRY_IDS : [country];
    const count = selected.reduce((sum, id) => sum + periodCount(item.week[id], preset), 0);
    return { id: item.id, name: item.name, accent: item.accent, count };
  })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const max = rows[0]?.count ?? 0;
  const shares = largestRemainderShares(rows.map((row) => row.count));
  return rows.map((row, index) => ({
    ...row,
    share: shares[index],
    barWidth: max === 0 ? '0%' : `${(row.count / max) * 100}%`,
  }));
}

type ReportSeed = {
  id: string;
  title: string;
  countryId: SpecificCountry;
  countryLabel: string;
  weekViews: number;
};

const REPORT_SEEDS: ReportSeed[] = [
  { id: 'aid-flow', title: 'Aid Flow Intelligence', countryId: 'somalia', countryLabel: 'Somalia', weekViews: 186 },
  {
    id: 'migration',
    title: 'Migration & Displacement Intelligence',
    countryId: 'somalia',
    countryLabel: 'Somalia',
    weekViews: 142,
  },
  {
    id: 'sjf',
    title: 'Somalia Joint Fund Intelligence',
    countryId: 'somalia',
    countryLabel: 'Somalia',
    weekViews: 97,
  },
  { id: 'ke-drought', title: 'Kenya Drought Bulletin', countryId: 'kenya', countryLabel: 'Kenya', weekViews: 54 },
  {
    id: 'ke-dadaab',
    title: 'Refugee Situation Dadaab',
    countryId: 'kenya',
    countryLabel: 'Kenya',
    weekViews: 41,
  },
  {
    id: 'ke-asal',
    title: 'ASAL Food Security Outlook',
    countryId: 'kenya',
    countryLabel: 'Kenya',
    weekViews: 27,
  },
  {
    id: 'et-snapshot',
    title: 'Ethiopia Humanitarian Snapshot',
    countryId: 'ethiopia',
    countryLabel: 'Ethiopia',
    weekViews: 36,
  },
  {
    id: 'et-north',
    title: 'Northern Ethiopia Displacement',
    countryId: 'ethiopia',
    countryLabel: 'Ethiopia',
    weekViews: 24,
  },
  {
    id: 'ss-flood',
    title: 'South Sudan Flood Watch',
    countryId: 'south-sudan',
    countryLabel: 'South Sudan',
    weekViews: 19,
  },
  {
    id: 'ss-ipc',
    title: 'IPC Acute Food Insecurity',
    countryId: 'south-sudan',
    countryLabel: 'South Sudan',
    weekViews: 13,
  },
];

export type AdminReportStat = {
  id: string;
  title: string;
  countryLabel: string;
  views: number;
};

export function adminReportStats(country: DashboardCountryId, preset: DashboardUsagePreset): AdminReportStat[] {
  return REPORT_SEEDS.filter((report) => country === 'all' || report.countryId === country)
    .map((report) => ({
      id: report.id,
      title: report.title,
      countryLabel: report.countryLabel,
      views: periodCount(report.weekViews, preset),
    }))
    .filter((report) => report.views > 0)
    .sort((a, b) => b.views - a.views);
}

/** Model totals for 1 Jan 2026–5 Oct 2026. Shorter filters take a share of these days. */
const AI_WINDOW_DAYS = 278;
const AI_WINDOW = {
  requests: 19_560,
  inputTokens: 133_240_000,
  outputTokens: 11_080_000,
  costUsd: 2103.44,
};

function scaleWindowCount(total: number, days: number): number {
  const capped = Math.max(1, Math.min(days, AI_WINDOW_DAYS));
  return Math.round((total * capped) / AI_WINDOW_DAYS);
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${trimCompact(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${trimCompact(value / 1_000)}K`;
  }
  return value.toLocaleString('en-US');
}

function trimCompact(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAvgPerRequest(tokens: number, requests: number): string {
  if (requests <= 0) return '0 avg per request';
  return `${Math.round(tokens / requests).toLocaleString('en-US')} avg per request`;
}

export type AiUsageStat = {
  requestsLabel: string;
  tokensLabel: string;
  tokensAvgLabel: string;
  inputLabel: string;
  inputAvgLabel: string;
  outputLabel: string;
  outputAvgLabel: string;
  costLabel: string;
};

export function aiUsageStats(country: DashboardCountryId, days: number): AiUsageStat {
  const requestsTotal = scaleWindowCount(AI_WINDOW.requests, days);
  const inputTotal = scaleWindowCount(AI_WINDOW.inputTokens, days);
  const outputTotal = scaleWindowCount(AI_WINDOW.outputTokens, days);
  const weights = COUNTRY_IDS.map((id) => COUNTRY_USERS[id]);
  const countryIndex = country === 'all' ? -1 : COUNTRY_IDS.indexOf(country);
  const requests = countryIndex === -1 ? requestsTotal : splitTotal(weights, requestsTotal)[countryIndex];
  const inputTokens = countryIndex === -1 ? inputTotal : splitTotal(weights, inputTotal)[countryIndex];
  const outputTokens = countryIndex === -1 ? outputTotal : splitTotal(weights, outputTotal)[countryIndex];
  const tokens = inputTokens + outputTokens;
  const windowTokens = AI_WINDOW.inputTokens + AI_WINDOW.outputTokens;
  const costUsd = windowTokens === 0 ? 0 : (tokens / windowTokens) * AI_WINDOW.costUsd;

  return {
    requestsLabel: formatCompact(requests),
    tokensLabel: formatCompact(tokens),
    tokensAvgLabel: formatAvgPerRequest(tokens, requests),
    inputLabel: formatCompact(inputTokens),
    inputAvgLabel: formatAvgPerRequest(inputTokens, requests),
    outputLabel: formatCompact(outputTokens),
    outputAvgLabel: formatAvgPerRequest(outputTokens, requests),
    costLabel: formatUsd(costUsd),
  };
}

export const serverStats: {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'muted';
  meter?: string;
}[] = [
  { label: 'Uptime, 30 days', value: '99.98%', tone: 'success' },
  { label: 'Response time, p95', value: '240 ms', tone: 'muted' },
  { label: 'Memory, average', value: '6.2 / 16 GB', tone: 'muted', meter: '39%' },
  { label: 'CPU, average', value: '28%', tone: 'muted', meter: '28%' },
  { label: 'Storage', value: '310 / 500 GB', tone: 'muted', meter: '62%' },
  { label: 'Error rate, 24 hours', value: '0.4%', tone: 'muted' },
];
