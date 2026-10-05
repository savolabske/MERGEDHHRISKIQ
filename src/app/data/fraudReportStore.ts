export const FRAUD_CATEGORIES = [
  { id: 'aid-diversion', label: 'Aid diversion' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'beneficiary', label: 'Beneficiary registration' },
  { id: 'supplier', label: 'Supplier or vendor' },
  { id: 'documentation', label: 'Documentation or identity' },
  { id: 'other', label: 'Other' },
] as const;

export const FRAUD_STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'reviewing', label: 'In review' },
  { id: 'closed', label: 'Closed' },
] as const;

export type FraudCategory = (typeof FRAUD_CATEGORIES)[number]['id'];
export type FraudReportStatus = (typeof FRAUD_STATUSES)[number]['id'];

export interface FraudReport {
  id: string;
  category?: FraudCategory;
  location?: string;
  description: string;
  reference?: string;
  status: FraudReportStatus;
  submittedAt: string;
  submittedBy: string;
  submittedById: string;
  /** When true, the reporter's name is not stored or shown. */
  anonymous?: boolean;
}

export const FRAUD_REPORTS_STORAGE_KEY = 'riskiq.fraud-reports';
export const FRAUD_REPORTS_CHANGED_EVENT = 'riskiq:fraud-reports-changed';

const SEED_REPORTS: FraudReport[] = [
  {
    id: 'seed-fraud-1',
    category: 'aid-diversion',
    location: 'Lower Shabelle',
    description:
      'Distribution lists in Afgooye showed 40 households that partners could not locate. Tokens had already been marked redeemed at the warehouse.',
    reference: 'Afgooye food distribution, September cycle',
    status: 'new',
    submittedAt: '2026-09-29T07:40:00.000Z',
    submittedBy: 'Amina Mohamed',
    submittedById: 'me',
  },
  {
    id: 'seed-fraud-2',
    category: 'procurement',
    location: 'Banadir',
    description:
      'A fuel supplier invoiced the same delivery note against two programmes in the same week. The second invoice was approved before the first was reconciled.',
    reference: 'Mogadishu fuel framework',
    status: 'reviewing',
    submittedAt: '2026-09-27T14:12:00.000Z',
    submittedBy: '',
    submittedById: '',
    anonymous: true,
  },
  {
    id: 'seed-fraud-3',
    category: 'beneficiary',
    location: 'Bay',
    description:
      'The same national ID appeared on cash-transfer lists for two different household names in Baidoa. Both payments were queued for this cycle.',
    reference: 'Baidoa MPCA list',
    status: 'new',
    submittedAt: '2026-09-24T09:05:00.000Z',
    submittedBy: '',
    submittedById: '',
    anonymous: true,
  },
  {
    id: 'seed-fraud-4',
    category: 'supplier',
    location: 'Gedo',
    description:
      'A vendor in Dollow delivered half the agreed sorghum quantity. The waybill was later altered to match the full order. The partner recovered the balance.',
    reference: 'Dollow sorghum delivery',
    status: 'closed',
    submittedAt: '2026-09-18T11:22:00.000Z',
    submittedBy: 'Fatima Noor',
    submittedById: '7',
  },
];

const CATEGORY_IDS = new Set<string>(FRAUD_CATEGORIES.map((item) => item.id));
const STATUS_IDS = new Set<string>(FRAUD_STATUSES.map((item) => item.id));

function isFraudReport(value: unknown): value is FraudReport {
  if (!value || typeof value !== 'object') return false;
  const item = value as FraudReport;
  return (
    typeof item.id === 'string' &&
    (item.category === undefined || CATEGORY_IDS.has(item.category)) &&
    (item.location === undefined || typeof item.location === 'string') &&
    typeof item.description === 'string' &&
    STATUS_IDS.has(item.status) &&
    typeof item.submittedAt === 'string' &&
    typeof item.submittedBy === 'string' &&
    typeof item.submittedById === 'string' &&
    (item.anonymous === undefined || typeof item.anonymous === 'boolean')
  );
}

function notifyChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FRAUD_REPORTS_CHANGED_EVENT));
}

function persist(reports: FraudReport[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FRAUD_REPORTS_STORAGE_KEY, JSON.stringify(reports));
  notifyChanged();
}

export function fraudCategoryLabel(id: FraudCategory): string {
  return FRAUD_CATEGORIES.find((item) => item.id === id)?.label ?? id;
}

export function fraudStatusLabel(id: FraudReportStatus): string {
  return FRAUD_STATUSES.find((item) => item.id === id)?.label ?? id;
}

export function fraudReporterLabel(report: Pick<FraudReport, 'anonymous' | 'submittedBy'>): string {
  return report.anonymous ? 'Anonymous' : report.submittedBy;
}

/** Keep the sample reports' named vs anonymous state in sync with the examples. */
function syncExampleReporters(items: FraudReport[]): FraudReport[] {
  const seedsById = new Map(SEED_REPORTS.map((item) => [item.id, item]));
  let changed = false;
  const next = items.map((item) => {
    const seed = seedsById.get(item.id);
    if (!seed) return item;
    if (
      Boolean(item.anonymous) === Boolean(seed.anonymous) &&
      item.submittedBy === seed.submittedBy &&
      item.submittedById === seed.submittedById
    ) {
      return item;
    }
    changed = true;
    return {
      ...item,
      anonymous: seed.anonymous,
      submittedBy: seed.submittedBy,
      submittedById: seed.submittedById,
    };
  });

  if (changed) persist(next);
  return next;
}

export function loadFraudReports(): FraudReport[] {
  if (typeof window === 'undefined') return [...SEED_REPORTS];

  try {
    const raw = localStorage.getItem(FRAUD_REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FRAUD_REPORTS_STORAGE_KEY, JSON.stringify(SEED_REPORTS));
      return [...SEED_REPORTS];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...SEED_REPORTS];

    const items = parsed.filter(isFraudReport);
    if (items.length === 0) return [...SEED_REPORTS];

    return syncExampleReporters(items);
  } catch {
    return [...SEED_REPORTS];
  }
}

export function countOpenFraudReports(): number {
  return loadFraudReports().filter((item) => item.status !== 'closed').length;
}

export function saveFraudReport(
  entry: Omit<FraudReport, 'id' | 'submittedAt' | 'status'>,
): FraudReport {
  const anonymous = Boolean(entry.anonymous);
  const record: FraudReport = {
    ...entry,
    anonymous,
    submittedBy: anonymous ? '' : entry.submittedBy,
    submittedById: anonymous ? '' : entry.submittedById,
    reference: entry.reference?.trim() || undefined,
    description: entry.description.trim(),
    id: `fraud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'new',
    submittedAt: new Date().toISOString(),
  };

  const next = [record, ...loadFraudReports()];
  persist(next);
  return record;
}

export function updateFraudReportStatus(id: string, status: FraudReportStatus): void {
  const next = loadFraudReports().map((item) => (item.id === id ? { ...item, status } : item));
  persist(next);
}
