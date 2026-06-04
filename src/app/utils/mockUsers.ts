import { palette } from '../theme/palette';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
};

export const CURRENT_USER: AppUser = {
  id: 'me',
  name: 'Amina Mohamed',
  email: 'amina.mohamed@undp.org',
  initials: 'AM',
  color: palette.primary,
};

export const RISK_IQ_USER = {
  id: 'risk-iq',
  name: 'Risk IQ',
};

export const appUsers: AppUser[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@un.org', initials: 'SC', color: palette.success },
  { id: '2', name: 'Jane Wanjiku', email: 'jane.wanjiku@un.org', initials: 'JW', color: palette.warning },
  { id: '3', name: 'Michael Kamau', email: 'michael.kamau@un.org', initials: 'MK', color: palette.chart2 },
  { id: '4', name: 'Collins Otieno', email: 'collins.otieno@un.org', initials: 'CO', color: palette.chart3 },
  { id: '5', name: 'Amina Hassan', email: 'amina.hassan@un.org', initials: 'AH', color: palette.warning },
  { id: '6', name: 'Yusuf Ali', email: 'yusuf.ali@un.org', initials: 'YA', color: palette.info },
  { id: '7', name: 'Fatima Noor', email: 'fatima.noor@un.org', initials: 'FN', color: palette.destructive },
  { id: '8', name: 'Peter Mwangi', email: 'peter.mwangi@un.org', initials: 'PM', color: palette.chart3 },
];

export function getUserById(id: string) {
  return appUsers.find((u) => u.id === id);
}
