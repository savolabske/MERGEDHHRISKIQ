import { adtAccent, adtAccentBg, adtCategoryColors } from '../../theme/palette';

export const ADT_CATEGORIES = [
  'economicExtortion',
  'improperInfluence',
  'preventionOfDelivery',
  'theftDamage',
  'unethicalBehaviour',
  'finance',
  'aidSoldInMarket',
] as const;

export type AdtCategory = (typeof ADT_CATEGORIES)[number];

export const ADT_CATEGORY_CONFIG: Record<
  AdtCategory,
  { label: string; shortLabel: string; color: string; definition: string }
> = {
  economicExtortion: {
    label: 'Economic Extortion',
    shortLabel: 'Economic extortion',
    color: adtCategoryColors.economicExtortion,
    definition: 'Illegal taxation, duties, gatekeeping fees on beneficiaries and humanitarian actors.',
  },
  improperInfluence: {
    label: 'Improper Influence',
    shortLabel: 'Improper influence',
    color: adtCategoryColors.improperInfluence,
    definition: 'Influence over beneficiary selection, distribution, or recruitment processes.',
  },
  preventionOfDelivery: {
    label: 'Prevention of Delivery',
    shortLabel: 'Prevention of delivery',
    color: adtCategoryColors.preventionOfDelivery,
    definition: 'Obstruction, threats, or violence preventing aid delivery.',
  },
  theftDamage: {
    label: 'Theft / Damage',
    shortLabel: 'Theft/damage',
    color: adtCategoryColors.theftDamage,
    definition: 'Aid stolen, taken, or damaged.',
  },
  unethicalBehaviour: {
    label: 'Unethical Behaviour',
    shortLabel: 'Unethical behaviour',
    color: adtCategoryColors.unethicalBehaviour,
    definition: 'Fraud, coercion, corruption, or bribery.',
  },
  finance: {
    label: 'Finance',
    shortLabel: 'Finance',
    color: adtCategoryColors.finance,
    definition: 'Terrorism financing, money laundering, or misuse of funds.',
  },
  aidSoldInMarket: {
    label: 'Aid Sold in Market',
    shortLabel: 'Aid sold in market',
    color: adtCategoryColors.aidSoldInMarket,
    definition: 'Aid commodities resold in local markets (tracked separately).',
  },
};

export const ADT_ACCENT = adtAccent;
export const ADT_ACCENT_BG = adtAccentBg;

export function categoryDataKey(cat: AdtCategory): string {
  return ADT_CATEGORY_CONFIG[cat].shortLabel;
}
