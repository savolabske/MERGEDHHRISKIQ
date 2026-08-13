import {
  CloudRain,
  Droplets,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  Users,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { InterestIconKey } from '../../data/interestsAdminMock';

export const INTEREST_ICONS: Record<InterestIconKey, LucideIcon> = {
  food: Utensils,
  displacement: Users,
  climate: CloudRain,
  funding: Wallet,
  security: ShieldAlert,
  wash: Droplets,
  gender: HeartHandshake,
  earlyWarning: Sparkles,
};
