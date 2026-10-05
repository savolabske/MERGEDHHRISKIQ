import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  BarChart3,
  BookOpen,
  FileText,
  Home,
  MessagesSquare,
  Navigation,
  Search,
  Shield,
  Sparkles,
  Users,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { AppView } from '../types/navigation';
import {
  DASHBOARD_COUNTRIES,
  adminReportStats,
  aiUsageStats,
  countryPortion,
  distributeCounts,
  interestStats,
  splitTotal,
  serverStats,
  type DashboardCountryId,
} from '../data/adminCountryStats';
import { PageScrollShell } from './PageScrollShell';
import { cn } from './ui/utils';
import { segmentPillClass } from './ui/interaction';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from './ui/sheet';

const PREVIEW_LIMIT = 5;

type PulseMetric = {
  label: string;
  value: string;
  hint: string;
  hintTone?: 'success' | 'warning' | 'danger' | 'muted';
  view?: AppView;
  tintClass: string;
};

type UsagePreset = 'today' | 'week' | 'lastWeek' | 'month';

const groupDirectory = [
  { name: 'DEFAULT', total: 9, color: 'var(--chart-2)', active: { today: 1, week: 4, lastWeek: 3, month: 6 } },
  { name: 'RMU', total: 3, color: 'var(--success)', active: { today: 2, week: 3, lastWeek: 3, month: 3 } },
  { name: 'IOM', total: 4, color: 'var(--chart-2)', active: { today: 1, week: 2, lastWeek: 2, month: 3 } },
  { name: 'UNTMIS', total: 2, color: 'var(--success)', active: { today: 1, week: 2, lastWeek: 2, month: 2 } },
  { name: 'FAO', total: 1, color: 'var(--success)', active: { today: 1, week: 1, lastWeek: 1, month: 1 } },
  { name: 'UNDSS', total: 1, color: 'var(--success)', active: { today: 0, week: 1, lastWeek: 1, month: 1 } },
  { name: 'WHO', total: 1, color: 'var(--success)', active: { today: 1, week: 1, lastWeek: 0, month: 1 } },
  { name: 'UNOPS', total: 1, color: 'var(--success)', active: { today: 0, week: 1, lastWeek: 1, month: 1 } },
  { name: 'UNICEF', total: 38, color: 'var(--chart-2)', active: { today: 8, week: 24, lastWeek: 18, month: 30 } },
  { name: 'WFP', total: 32, color: 'var(--success)', active: { today: 9, week: 26, lastWeek: 20, month: 28 } },
  { name: 'UNHCR', total: 29, color: '#818cf8', active: { today: 6, week: 21, lastWeek: 15, month: 24 } },
  { name: 'UNDP', total: 19, color: '#65a30d', active: { today: 2, week: 8, lastWeek: 6, month: 12 } },
  { name: 'OCHA', total: 13, color: 'var(--warning-strong)', active: { today: 1, week: 5, lastWeek: 4, month: 8 } },
];

type InsightTone = 'danger' | 'warning' | 'info';

type InsightLink = { label: string; view: AppView };

type InsightDetail = {
  label: string;
  meta?: string;
  action?: InsightLink;
};

type PlatformInsight = {
  id: string;
  tone: InsightTone;
  body: ReactNode;
  link?: InsightLink;
  details?: InsightDetail[];
};

const INSIGHT_PREVIEW = 3;
const INSIGHTS_UPDATED = '25 Sep 2026, 09:38';

function insightEmphasis(text: string) {
  return <strong className="font-semibold text-foreground">{text}</strong>;
}

function insightNeedsAction(insight: PlatformInsight) {
  return Boolean(insight.link || insight.details?.length);
}

const platformInsights: PlatformInsight[] = [
  {
    id: 'no-results',
    tone: 'danger',
    body: <>{insightEmphasis('12 searches')} today returned no results.</>,
    details: [
      { label: 'Gu 2026 rainfall forecast', meta: '5×', action: { label: 'Add content', view: 'resources' } },
      { label: 'Las Anod displacement', meta: '4×', action: { label: 'Add content', view: 'resources' } },
      { label: 'cash transfer tracker', meta: '3×', action: { label: 'Add content', view: 'resources' } },
    ],
  },
  {
    id: 'approvals',
    tone: 'warning',
    body: (
      <>
        {insightEmphasis('7 approvals')} are waiting. The oldest request has been open for{' '}
        {insightEmphasis('6 days')}.
      </>
    ),
    link: { label: 'Review approvals', view: 'approvals' },
  },
  {
    id: 'search-up',
    tone: 'info',
    body: (
      <>
        Search volume is {insightEmphasis('up 15%')} this week compared with last week, led by monitoring
        needs in {insightEmphasis('Banadir')}.
      </>
    ),
  },
  {
    id: 'feedback',
    tone: 'danger',
    body: (
      <>
        {insightEmphasis('12 responses')} were marked unhelpful in the last {insightEmphasis('24 hours')}.
      </>
    ),
    link: { label: 'Review feedback', view: 'responseFeedback' },
  },
  {
    id: 'dormant',
    tone: 'warning',
    body: (
      <>
        {insightEmphasis('31 users')} have not signed in for more than {insightEmphasis('30 days')}.
      </>
    ),
    details: [
      { label: 'Hassan Ali', meta: 'FAO · 46 days' },
      { label: 'Fatima Yusuf', meta: 'UNDP · 41 days' },
      { label: 'Omar Hassan', meta: 'OCHA · 38 days' },
      { label: '28 other users', meta: '30+ days' },
    ],
    link: { label: 'Review users', view: 'usersAccess' },
  },
  {
    id: 'new-orgs',
    tone: 'warning',
    body: (
      <>
        {insightEmphasis('3 organizations')} requested access this month and are not on the platform yet.
      </>
    ),
    details: [
      { label: 'Save the Children', meta: 'requested 12 Sep' },
      { label: 'Norwegian Refugee Council', meta: 'requested 8 Sep' },
      { label: 'Danish Refugee Council', meta: 'requested 2 Sep' },
    ],
    link: { label: 'Review requests', view: 'approvals' },
  },
  {
    id: 'silent-orgs',
    tone: 'info',
    body: (
      <>
        Most registered organizations show {insightEmphasis('zero activity')} this week. Usage is concentrated
        in {insightEmphasis('DEFAULT, RMU, IOM, and UNTMIS')}.
      </>
    ),
  },
  {
    id: 'power-users',
    tone: 'info',
    body: (
      <>
        {insightEmphasis('WFP')} and {insightEmphasis('UNHCR')} account for {insightEmphasis('58% of searches')}{' '}
        and {insightEmphasis('28% of users')}.
      </>
    ),
  },
];

type FeatureUsageItem = {
  id: string;
  name: string;
  view: AppView;
  icon: LucideIcon;
  visits: number;
  users: number;
};

type RankedFeatureUsage = FeatureUsageItem & {
  share: number;
  barWidth: string;
};

const featureUsageByPeriod: Record<UsagePreset, FeatureUsageItem[]> = {
  today: [
    { id: 'chats', name: 'Chats', view: 'platformChats', icon: MessagesSquare, visits: 286, users: 41 },
    { id: 'maps', name: 'Maps', view: 'mapAI', icon: Navigation, visits: 198, users: 33 },
    { id: 'riskiq', name: 'Risk iQ', view: 'riskIQ', icon: Shield, visits: 154, users: 29 },
    { id: 'resources', name: 'My Resources', view: 'resourcesHub', icon: BookOpen, visits: 112, users: 27 },
    { id: 'reports', name: 'Reports', view: 'reports', icon: FileText, visits: 96, users: 18 },
    { id: 'workflows', name: 'Custom Workflows', view: 'customWorkflows', icon: Workflow, visits: 38, users: 9 },
    { id: 'home', name: 'Home', view: 'home', icon: Home, visits: 31, users: 24 },
  ],
  week: [
    { id: 'chats', name: 'Chats', view: 'platformChats', icon: MessagesSquare, visits: 1842, users: 71 },
    { id: 'maps', name: 'Maps', view: 'mapAI', icon: Navigation, visits: 1264, users: 54 },
    { id: 'riskiq', name: 'Risk iQ', view: 'riskIQ', icon: Shield, visits: 986, users: 48 },
    { id: 'reports', name: 'Reports', view: 'reports', icon: FileText, visits: 742, users: 39 },
    { id: 'resources', name: 'My Resources', view: 'resourcesHub', icon: BookOpen, visits: 618, users: 44 },
    { id: 'workflows', name: 'Custom Workflows', view: 'customWorkflows', icon: Workflow, visits: 407, users: 22 },
    { id: 'home', name: 'Home', view: 'home', icon: Home, visits: 186, users: 63 },
  ],
  lastWeek: [
    { id: 'chats', name: 'Chats', view: 'platformChats', icon: MessagesSquare, visits: 1510, users: 64 },
    { id: 'maps', name: 'Maps', view: 'mapAI', icon: Navigation, visits: 1402, users: 58 },
    { id: 'reports', name: 'Reports', view: 'reports', icon: FileText, visits: 910, users: 41 },
    { id: 'riskiq', name: 'Risk iQ', view: 'riskIQ', icon: Shield, visits: 820, users: 40 },
    { id: 'resources', name: 'My Resources', view: 'resourcesHub', icon: BookOpen, visits: 540, users: 36 },
    { id: 'workflows', name: 'Custom Workflows', view: 'customWorkflows', icon: Workflow, visits: 310, users: 18 },
    { id: 'home', name: 'Home', view: 'home', icon: Home, visits: 160, users: 55 },
  ],
  month: [
    { id: 'chats', name: 'Chats', view: 'platformChats', icon: MessagesSquare, visits: 7240, users: 96 },
    { id: 'maps', name: 'Maps', view: 'mapAI', icon: Navigation, visits: 4980, users: 81 },
    { id: 'riskiq', name: 'Risk iQ', view: 'riskIQ', icon: Shield, visits: 3610, users: 70 },
    { id: 'reports', name: 'Reports', view: 'reports', icon: FileText, visits: 3080, users: 62 },
    { id: 'resources', name: 'My Resources', view: 'resourcesHub', icon: BookOpen, visits: 2410, users: 74 },
    { id: 'workflows', name: 'Custom Workflows', view: 'customWorkflows', icon: Workflow, visits: 1520, users: 34 },
    { id: 'home', name: 'Home', view: 'home', icon: Home, visits: 890, users: 102 },
  ],
};

function rankFeatureUsage(items: FeatureUsageItem[]): RankedFeatureUsage[] {
  const total = items.reduce((sum, item) => sum + item.visits, 0);
  const max = Math.max(...items.map((item) => item.visits));
  const sorted = [...items].sort((a, b) => b.visits - a.visits);
  const exact = sorted.map((item) => (total === 0 ? 0 : (item.visits / total) * 100));
  const shares = exact.map((value) => Math.floor(value));
  let leftover = 100 - shares.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - shares[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < leftover; i += 1) {
    shares[byRemainder[i].index] += 1;
  }

  return sorted.map((item, index) => ({
    ...item,
    share: shares[index],
    barWidth: max === 0 ? '0%' : `${(item.visits / max) * 100}%`,
  }));
}

type SearchSurface = 'all' | 'chats' | 'maps' | 'reports' | 'workflows';

type SearchHit = { query: string; count: number; place?: string };

type SearchSlice = {
  searches: number;
  clickRate: string;
  top: SearchHit[];
  gaps: { query: string; count: number }[];
};

const SEARCH_SURFACES: { id: SearchSurface; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chats', label: 'Chats' },
  { id: 'maps', label: 'Maps' },
  { id: 'reports', label: 'Reports' },
  { id: 'workflows', label: 'Workflows' },
];

const searchActivityByPeriod: Record<UsagePreset, Record<SearchSurface, SearchSlice>> = {
  today: {
    all: {
      searches: 341,
      clickRate: '86%',
      top: [
        { query: 'cholera situation report', count: 42, place: 'Chats' },
        { query: 'IDP sites Baidoa', count: 31, place: 'Maps' },
        { query: '3W who what where', count: 24, place: 'Reports' },
        { query: 'access map south central', count: 18, place: 'Maps' },
        { query: 'FCDO checklist', count: 15, place: 'Workflows' },
        { query: 'rainfall Baidoa', count: 12, place: 'Chats' },
        { query: 'WASH pipeline Mogadishu', count: 9, place: 'Reports' },
      ],
      gaps: [
        { query: 'Gu 2026 rainfall forecast', count: 5 },
        { query: 'Las Anod displacement', count: 4 },
        { query: 'cash transfer tracker', count: 3 },
      ],
    },
    chats: {
      searches: 176,
      clickRate: '88%',
      top: [
        { query: 'cholera situation report', count: 42 },
        { query: 'rainfall Baidoa', count: 12 },
        { query: 'nutrition cluster contacts', count: 8 },
      ],
      gaps: [
        { query: 'Gu 2026 rainfall forecast', count: 3 },
        { query: 'cash transfer tracker', count: 2 },
      ],
    },
    maps: {
      searches: 84,
      clickRate: '85%',
      top: [
        { query: 'IDP sites Baidoa', count: 31 },
        { query: 'access map south central', count: 18 },
        { query: 'flood extent Beledweyne', count: 7 },
      ],
      gaps: [{ query: 'Las Anod displacement', count: 4 }],
    },
    reports: {
      searches: 52,
      clickRate: '82%',
      top: [
        { query: '3W who what where', count: 24 },
        { query: 'WASH pipeline Mogadishu', count: 9 },
        { query: 'food security Bay Bakool', count: 6 },
      ],
      gaps: [{ query: 'Gu 2026 rainfall forecast', count: 2 }],
    },
    workflows: {
      searches: 29,
      clickRate: '79%',
      top: [
        { query: 'FCDO checklist', count: 15 },
        { query: 'security advisory Gedo', count: 5 },
      ],
      gaps: [{ query: 'cash transfer tracker', count: 1 }],
    },
  },
  week: {
    all: {
      searches: 2186,
      clickRate: '84%',
      top: [
        { query: 'cholera situation report', count: 186, place: 'Chats' },
        { query: 'IDP sites Baidoa', count: 154, place: 'Maps' },
        { query: 'access map south central', count: 121, place: 'Maps' },
        { query: '3W who what where', count: 98, place: 'Reports' },
        { query: 'food security Bay Bakool', count: 76, place: 'Reports' },
        { query: 'FCDO checklist', count: 64, place: 'Workflows' },
        { query: 'rainfall Baidoa', count: 52, place: 'Chats' },
        { query: 'WASH pipeline Mogadishu', count: 41, place: 'Chats' },
        { query: 'nutrition cluster contacts', count: 33, place: 'Reports' },
        { query: 'security advisory Gedo', count: 28, place: 'Workflows' },
      ],
      gaps: [
        { query: 'Gu 2026 rainfall forecast', count: 18 },
        { query: 'Las Anod displacement', count: 11 },
        { query: 'cash transfer tracker', count: 9 },
      ],
    },
    chats: {
      searches: 1124,
      clickRate: '87%',
      top: [
        { query: 'cholera situation report', count: 186 },
        { query: 'rainfall Baidoa', count: 52 },
        { query: 'WASH pipeline Mogadishu', count: 41 },
        { query: 'nutrition site list Banadir', count: 29 },
      ],
      gaps: [
        { query: 'Gu 2026 rainfall forecast', count: 12 },
        { query: 'cash transfer tracker', count: 6 },
      ],
    },
    maps: {
      searches: 548,
      clickRate: '82%',
      top: [
        { query: 'IDP sites Baidoa', count: 154 },
        { query: 'access map south central', count: 121 },
        { query: 'flood extent Beledweyne', count: 36 },
      ],
      gaps: [{ query: 'Las Anod displacement', count: 11 }],
    },
    reports: {
      searches: 332,
      clickRate: '79%',
      top: [
        { query: '3W who what where', count: 98 },
        { query: 'food security Bay Bakool', count: 76 },
        { query: 'nutrition cluster contacts', count: 33 },
      ],
      gaps: [{ query: 'Gu 2026 rainfall forecast', count: 6 }],
    },
    workflows: {
      searches: 182,
      clickRate: '76%',
      top: [
        { query: 'FCDO checklist', count: 64 },
        { query: 'security advisory Gedo', count: 28 },
        { query: 'partner due diligence', count: 17 },
      ],
      gaps: [{ query: 'cash transfer tracker', count: 3 }],
    },
  },
  lastWeek: {
    all: {
      searches: 1904,
      clickRate: '81%',
      top: [
        { query: 'IDP sites Baidoa', count: 168, place: 'Maps' },
        { query: 'cholera situation report', count: 142, place: 'Chats' },
        { query: 'FCDO checklist', count: 110, place: 'Workflows' },
        { query: '3W who what where', count: 94, place: 'Reports' },
        { query: 'access map south central', count: 71, place: 'Maps' },
        { query: 'food security Bay Bakool', count: 58, place: 'Reports' },
        { query: 'security advisory Gedo', count: 34, place: 'Workflows' },
      ],
      gaps: [
        { query: 'Las Anod displacement', count: 14 },
        { query: 'Gu 2026 rainfall forecast', count: 8 },
        { query: 'cash transfer tracker', count: 6 },
      ],
    },
    chats: {
      searches: 980,
      clickRate: '83%',
      top: [
        { query: 'cholera situation report', count: 142 },
        { query: 'rainfall Baidoa', count: 40 },
        { query: 'WASH pipeline Mogadishu', count: 27 },
      ],
      gaps: [
        { query: 'Gu 2026 rainfall forecast', count: 5 },
        { query: 'cash transfer tracker', count: 4 },
      ],
    },
    maps: {
      searches: 510,
      clickRate: '80%',
      top: [
        { query: 'IDP sites Baidoa', count: 168 },
        { query: 'access map south central', count: 71 },
        { query: 'flood extent Beledweyne', count: 22 },
      ],
      gaps: [{ query: 'Las Anod displacement', count: 14 }],
    },
    reports: {
      searches: 270,
      clickRate: '77%',
      top: [
        { query: '3W who what where', count: 94 },
        { query: 'food security Bay Bakool', count: 58 },
      ],
      gaps: [{ query: 'Gu 2026 rainfall forecast', count: 3 }],
    },
    workflows: {
      searches: 144,
      clickRate: '74%',
      top: [
        { query: 'FCDO checklist', count: 110 },
        { query: 'security advisory Gedo', count: 34 },
      ],
      gaps: [{ query: 'cash transfer tracker', count: 2 }],
    },
  },
  month: {
    all: {
      searches: 8420,
      clickRate: '83%',
      top: [
        { query: 'cholera situation report', count: 640, place: 'Chats' },
        { query: 'IDP sites Baidoa', count: 512, place: 'Maps' },
        { query: '3W who what where', count: 401, place: 'Reports' },
        { query: 'access map south central', count: 366, place: 'Maps' },
        { query: 'FCDO checklist', count: 290, place: 'Workflows' },
        { query: 'food security Bay Bakool', count: 244, place: 'Reports' },
        { query: 'rainfall Baidoa', count: 188, place: 'Chats' },
        { query: 'WASH pipeline Mogadishu', count: 151, place: 'Chats' },
      ],
      gaps: [
        { query: 'Gu 2026 rainfall forecast', count: 42 },
        { query: 'cash transfer tracker', count: 31 },
        { query: 'Las Anod displacement', count: 27 },
      ],
    },
    chats: {
      searches: 4320,
      clickRate: '85%',
      top: [
        { query: 'cholera situation report', count: 640 },
        { query: 'rainfall Baidoa', count: 188 },
        { query: 'WASH pipeline Mogadishu', count: 151 },
      ],
      gaps: [
        { query: 'Gu 2026 rainfall forecast', count: 24 },
        { query: 'cash transfer tracker', count: 16 },
      ],
    },
    maps: {
      searches: 2110,
      clickRate: '82%',
      top: [
        { query: 'IDP sites Baidoa', count: 512 },
        { query: 'access map south central', count: 366 },
        { query: 'flood extent Beledweyne', count: 120 },
      ],
      gaps: [{ query: 'Las Anod displacement', count: 27 }],
    },
    reports: {
      searches: 1280,
      clickRate: '80%',
      top: [
        { query: '3W who what where', count: 401 },
        { query: 'food security Bay Bakool', count: 244 },
      ],
      gaps: [{ query: 'Gu 2026 rainfall forecast', count: 18 }],
    },
    workflows: {
      searches: 710,
      clickRate: '77%',
      top: [
        { query: 'FCDO checklist', count: 290 },
        { query: 'security advisory Gedo', count: 96 },
      ],
      gaps: [{ query: 'cash transfer tracker', count: 15 }],
    },
  },
};

const resourceCatalog = [
  {
    type: 'PDF',
    typeClass: 'bg-destructive-subtle text-destructive-text',
    title: 'Somalia Humanitarian Response Plan 2026',
    meta: 'uploaded Mar 2026',
    views: { today: 36, week: 218, lastWeek: 151, month: 860 },
  },
  {
    type: 'PDF',
    typeClass: 'bg-destructive-subtle text-destructive-text',
    title: 'Food Security & Nutrition Assessment - Q1 2026',
    meta: 'uploaded Feb 2026',
    views: { today: 28, week: 174, lastWeek: 140, month: 690 },
  },
  {
    type: 'XLS',
    typeClass: 'bg-success-subtle text-success-text',
    title: 'IDP Population Tracking Dataset - Banadir',
    meta: 'uploaded Mar 2026',
    views: { today: 22, week: 139, lastWeek: 160, month: 640 },
  },
  {
    type: 'DOC',
    typeClass: 'bg-sidebar-accent text-primary',
    title: 'Protection Risk Analysis - South Somalia',
    meta: 'uploaded Jan 2026',
    views: { today: 14, week: 112, lastWeek: 88, month: 410 },
  },
  {
    type: 'PDF',
    typeClass: 'bg-destructive-subtle text-destructive-text',
    title: 'Health Cluster Bulletin - March 2026',
    meta: 'uploaded Mar 2026',
    views: { today: 11, week: 98, lastWeek: 70, month: 310 },
  },
  {
    type: 'XLS',
    typeClass: 'bg-success-subtle text-success-text',
    title: 'Funding Tracker - Somalia 2026',
    meta: 'uploaded Feb 2026',
    views: { today: 9, week: 87, lastWeek: 99, month: 380 },
  },
];

type GroupUsageItem = {
  name: string;
  value: string;
  width: string;
  color: string;
};

function groupsForPreset(preset: UsagePreset, country: DashboardCountryId): GroupUsageItem[] {
  return groupDirectory.map((group) => {
    const total = countryPortion(group.total, country);
    const active = Math.min(countryPortion(group.active[preset], country), total);
    const percent = total === 0 ? 0 : Math.round((active / total) * 100);
    return {
      name: group.name,
      value: `${percent}% (${active}/${total})`,
      width: `${percent}%`,
      color: group.color,
    };
  });
}

function scaleSearchSlice(slice: SearchSlice, searches: number, gapTotal: number): SearchSlice {
  const ratio = slice.searches === 0 ? 0 : searches / slice.searches;
  return {
    searches,
    clickRate: slice.clickRate,
    top: slice.top
      .map((item) => ({ ...item, count: Math.round(item.count * ratio) }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count),
    gaps: distributeCounts(slice.gaps, gapTotal),
  };
}

function scaleSearchPeriod(
  period: Record<SearchSurface, SearchSlice>,
  country: DashboardCountryId,
): Record<SearchSurface, SearchSlice> {
  if (country === 'all') return period;
  const surfaceIds = ['chats', 'maps', 'reports', 'workflows'] as const;
  const searchShares = splitTotal(
    surfaceIds.map((id) => period[id].searches),
    countryPortion(period.all.searches, country),
  );
  const gapShares = splitTotal(
    surfaceIds.map((id) => period[id].gaps.reduce((sum, gap) => sum + gap.count, 0)),
    countryPortion(
      period.all.gaps.reduce((sum, gap) => sum + gap.count, 0),
      country,
    ),
  );
  const scaled = {
    chats: scaleSearchSlice(period.chats, searchShares[0], gapShares[0]),
    maps: scaleSearchSlice(period.maps, searchShares[1], gapShares[1]),
    reports: scaleSearchSlice(period.reports, searchShares[2], gapShares[2]),
    workflows: scaleSearchSlice(period.workflows, searchShares[3], gapShares[3]),
  };
  const allGapTotal = gapShares.reduce((sum, count) => sum + count, 0);
  return {
    ...scaled,
    all: {
      searches: searchShares.reduce((sum, count) => sum + count, 0),
      clickRate: period.all.clickRate,
      top: period.all.top
        .map((item) => ({ ...item, count: countryPortion(item.count, country) }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count),
      gaps: distributeCounts(period.all.gaps, allGapTotal),
    },
  };
}

function buildPulseMetrics(country: DashboardCountryId): PulseMetric[] {
  const users = countryPortion(214, country);
  const joined = countryPortion(12, country);
  const pending = countryPortion(7, country);
  const active = countryPortion(89, country);
  const feedback = countryPortion(12, country);
  const activePct = users === 0 ? 0 : Math.round((active / users) * 100);
  const oldest =
    pending === 0 ? 'None waiting' : country === 'somalia' || country === 'all' ? 'Oldest: 6 days ago' : 'Oldest: 2 days ago';

  return [
    {
      label: 'Total users',
      value: users.toLocaleString('en-US'),
      hint: `+${joined} this month`,
      hintTone: 'success',
      view: 'usersAccess',
      tintClass: 'from-primary-subtle',
    },
    {
      label: 'Pending approvals',
      value: String(pending),
      hint: oldest,
      hintTone: pending === 0 ? 'muted' : 'warning',
      view: 'approvals',
      tintClass: 'from-warning-subtle',
    },
    {
      label: 'Active this week',
      value: String(active),
      hint: `${activePct}% of all users`,
      hintTone: 'muted',
      view: 'usersAccess',
      tintClass: 'from-success-subtle',
    },
    {
      label: 'Negative feedback',
      value: String(feedback),
      hint: 'Last 24 hours · dipped vs last week',
      hintTone: 'danger',
      view: 'responseFeedback',
      tintClass: 'from-destructive-subtle',
    },
  ];
}

function searchSurfaceShares(period: Record<SearchSurface, SearchSlice>) {
  const ids = ['chats', 'maps', 'reports', 'workflows'] as const;
  const total = period.all.searches;
  const exact = ids.map((id) => (total === 0 ? 0 : (period[id].searches / total) * 100));
  const shares = exact.map((value) => Math.floor(value));
  let leftover = 100 - shares.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - shares[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < leftover; i += 1) {
    shares[byRemainder[i].index] += 1;
  }

  return {
    chats: shares[0],
    maps: shares[1],
    reports: shares[2],
    workflows: shares[3],
  };
}

function UsageBar({ width, color }: { width: string; color: string }) {
  return (
    <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
      <span className="block h-full rounded-full" style={{ width, backgroundColor: color }} />
    </span>
  );
}

function TruncatedLabel({ text }: { text: string }) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const update = () => setTruncated(el.scrollWidth > el.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, truncated]);

  const label = (
    <span
      ref={labelRef}
      className="w-[9.5rem] shrink-0 cursor-default truncate text-sm font-medium text-foreground"
    >
      {text}
    </span>
  );

  if (!truncated) return label;

  return (
    <HoverCard openDelay={180} closeDelay={80}>
      <HoverCardTrigger asChild>{label}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={8}
        className="z-[1500] w-auto max-w-xs p-3 text-left text-sm font-medium leading-snug text-foreground"
      >
        {text}
      </HoverCardContent>
    </HoverCard>
  );
}

function InterestStatList({ items }: { items: ReturnType<typeof interestStats> }) {
  return (
    <ol className="space-y-3">
      {items.map((interest, index) => (
        <li key={interest.id} className="flex min-w-0 items-center gap-3">
          <span className="w-4 shrink-0 text-xs tabular-nums text-text-subtle">{index + 1}</span>
          <TruncatedLabel text={interest.name} />
          <UsageBar width={interest.barWidth} color={interest.accent} />
          <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground-emphasis">
            {interest.count.toLocaleString('en-US')}
          </span>
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {interest.share}%
          </span>
        </li>
      ))}
    </ol>
  );
}

function ReportStatList({ items }: { items: ReturnType<typeof adminReportStats> }) {
  const max = Math.max(...items.map((report) => report.views), 0);
  return (
    <ol className="space-y-3">
      {items.map((report, index) => (
        <li key={report.id} className="flex min-w-0 items-center gap-3">
          <span className="w-4 shrink-0 text-xs tabular-nums text-text-subtle">{index + 1}</span>
          <TruncatedLabel text={report.title} />
          <UsageBar
            width={max === 0 ? '0%' : `${(report.views / max) * 100}%`}
            color="var(--chart-2)"
          />
          <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground-emphasis">
            {report.views.toLocaleString('en-US')}
          </span>
        </li>
      ))}
    </ol>
  );
}

function GroupUsageList({ groups }: { groups: GroupUsageItem[] }) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.name} className="flex min-w-0 items-center gap-3 py-1">
          <span className="w-[9.25rem] shrink-0 truncate text-sm font-semibold text-foreground">
            {group.name}
          </span>
          <UsageBar width={group.width} color={group.color} />
          <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-secondary-foreground">
            {group.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeatureUsageList({
  items,
  onSelect,
}: {
  items: RankedFeatureUsage[];
  onSelect?: (view: AppView) => void;
}) {
  return (
    <ol className="space-y-3">
      {items.map((item) => {
        const content = (
          <>
            <span className="w-[9.25rem] shrink-0 truncate text-sm font-semibold text-foreground">
              {item.name}
            </span>
            <UsageBar width={item.barWidth} color="var(--chart-2)" />
            <span className="shrink-0 text-right text-sm tabular-nums text-secondary-foreground">
              {item.visits.toLocaleString('en-US')}
            </span>
            <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground-emphasis">
              {item.share}%
            </span>
          </>
        );

        return (
          <li key={item.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.view)}
                title={`${item.visits.toLocaleString('en-US')} visits · ${item.users.toLocaleString('en-US')} users`}
                className="flex w-full min-w-0 items-center gap-3 rounded-lg py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {content}
              </button>
            ) : (
              <div
                className="flex min-w-0 items-center gap-3 py-1"
                title={`${item.visits.toLocaleString('en-US')} visits · ${item.users.toLocaleString('en-US')} users`}
              >
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function insightDotClass(tone: InsightTone) {
  if (tone === 'danger') return 'bg-destructive';
  if (tone === 'warning') return 'bg-warning-strong';
  return 'bg-primary';
}

function InsightAction({
  action,
  onAction,
}: {
  action: InsightLink;
  onAction?: (view: AppView) => void;
}) {
  if (!onAction) return null;
  return (
    <button
      type="button"
      onClick={() => onAction(action.view)}
      className="text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
    >
      {action.label}
    </button>
  );
}

function InsightsList({
  insights,
  onAction,
}: {
  insights: PlatformInsight[];
  onAction?: (view: AppView) => void;
}) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <ul>
      {insights.map((insight) => {
        const open = openIds.includes(insight.id);
        const hasDetails = Boolean(insight.details?.length);
        return (
          <li key={insight.id} className="border-b border-border py-3 last:border-b-0">
            <div className="flex items-start gap-3">
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', insightDotClass(insight.tone))} />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{insight.body}</p>
                {hasDetails ? (
                  <button
                    type="button"
                    onClick={() => toggle(insight.id)}
                    aria-expanded={open}
                    className="mt-1.5 text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
                  >
                    {open ? 'Show less' : 'View more'}
                  </button>
                ) : insight.link ? (
                  <div className="mt-1.5">
                    <InsightAction action={insight.link} onAction={onAction} />
                  </div>
                ) : null}
                {hasDetails && open ? (
                  <div className="mt-2">
                    <ul className="space-y-1.5">
                      {insight.details?.map((detail) => (
                        <li key={detail.label} className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                            {detail.label}
                          </span>
                          {detail.meta ? (
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {detail.meta}
                            </span>
                          ) : null}
                          {detail.action ? (
                            <InsightAction action={detail.action} onAction={onAction} />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {insight.link ? (
                      <div className="mt-2">
                        <InsightAction action={insight.link} onAction={onAction} />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function hintClass(tone: PulseMetric['hintTone']) {
  if (tone === 'success') return 'text-success';
  if (tone === 'warning') return 'text-warning-strong';
  if (tone === 'danger') return 'text-destructive-text';
  return 'text-muted-foreground';
}

type UsageRange = UsagePreset | 'custom';

const USAGE_PRESETS: { id: UsagePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'lastWeek', label: 'Last week' },
  { id: 'month', label: 'Last 30 days' },
];

function formatRangeDate(value: string, withYear: boolean) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' as const } : {}),
  });
}

function formatCustomRange(from: string, to: string) {
  const withYear = from.slice(0, 4) !== to.slice(0, 4);
  return {
    start: formatRangeDate(from, withYear),
    end: formatRangeDate(to, withYear),
  };
}

function inclusiveDays(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function presetForCustomRange(from: string, to: string): UsagePreset {
  const days = inclusiveDays(from, to);
  if (days <= 1) return 'today';
  if (days <= 10) return 'week';
  if (days <= 21) return 'lastWeek';
  return 'month';
}

function usageRangeLabel(range: UsageRange, from: string, to: string) {
  if (range === 'today') return 'today';
  if (range === 'week') return 'this week';
  if (range === 'lastWeek') return 'last week';
  if (range === 'month') return 'the last 30 days';
  if (from && to) {
    const { start, end } = formatCustomRange(from, to);
    return `${start} – ${end}`;
  }
  return 'a custom range';
}

function usageRangePhrase(range: UsageRange, from: string, to: string) {
  if (range === 'month') return 'in the last 30 days';
  if (range === 'custom' && from && to) {
    const { start, end } = formatCustomRange(from, to);
    return `from ${start} to ${end}`;
  }
  return usageRangeLabel(range, from, to);
}

const AI_AS_OF = '2026-10-05';

function shiftIsoDate(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatAiDate(iso: string) {
  return formatRangeDate(iso, true);
}

function PeriodMark({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full bg-primary-subtle px-2.5 text-xs font-medium text-primary">
      {children}
    </span>
  );
}

function ScopeMark({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function aiUsageWindow(range: UsageRange, from: string, to: string) {
  if (range === 'today') {
    return { days: 1, label: formatAiDate(AI_AS_OF) };
  }
  if (range === 'week') {
    return { days: 7, label: `${formatAiDate(shiftIsoDate(AI_AS_OF, -6))} – ${formatAiDate(AI_AS_OF)}` };
  }
  if (range === 'lastWeek') {
    return {
      days: 7,
      label: `${formatAiDate(shiftIsoDate(AI_AS_OF, -13))} – ${formatAiDate(shiftIsoDate(AI_AS_OF, -7))}`,
    };
  }
  if (range === 'month') {
    return { days: 30, label: `${formatAiDate(shiftIsoDate(AI_AS_OF, -29))} – ${formatAiDate(AI_AS_OF)}` };
  }
  if (from && to) {
    return { days: Math.max(1, inclusiveDays(from, to)), label: `${formatAiDate(from)} – ${formatAiDate(to)}` };
  }
  return { days: 7, label: `${formatAiDate(shiftIsoDate(AI_AS_OF, -6))} – ${formatAiDate(AI_AS_OF)}` };
}

type AdminDashboardProps = {
  onNavigate?: (view: AppView) => void;
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [groupsDrawerOpen, setGroupsDrawerOpen] = useState(false);
  const [featuresDrawerOpen, setFeaturesDrawerOpen] = useState(false);
  const [insightsDrawerOpen, setInsightsDrawerOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchSurface, setSearchSurface] = useState<SearchSurface>('all');
  const [interestsDrawerOpen, setInterestsDrawerOpen] = useState(false);
  const [reportsDrawerOpen, setReportsDrawerOpen] = useState(false);
  const [country, setCountry] = useState<DashboardCountryId>('all');
  const [usageRange, setUsageRange] = useState<UsageRange>('week');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [customError, setCustomError] = useState('');

  const usagePreset: UsagePreset =
    usageRange === 'custom' && customFrom && customTo
      ? presetForCustomRange(customFrom, customTo)
      : usageRange === 'custom'
        ? 'week'
        : usageRange;
  const rangeLabel = usageRangeLabel(usageRange, customFrom, customTo);
  const rangePhrase = usageRangePhrase(usageRange, customFrom, customTo);
  const countryLabel = DASHBOARD_COUNTRIES.find((item) => item.id === country)?.label ?? 'All countries';
  const countryPhrase = country === 'all' ? '' : ` in ${countryLabel}`;
  const pulseMetrics = buildPulseMetrics(country);
  const rankedGroups = groupsForPreset(usagePreset, country);
  const previewGroups = rankedGroups.slice(0, PREVIEW_LIMIT);
  const previewInsights = platformInsights.slice(0, INSIGHT_PREVIEW);
  const hasMoreGroups = rankedGroups.length > PREVIEW_LIMIT;
  const hasMoreInsights = platformInsights.length > INSIGHT_PREVIEW;

  const rankedResources = [...resourceCatalog]
    .map((resource) => ({
      ...resource,
      viewCount: countryPortion(resource.views[usagePreset], country),
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .map((resource, index) => ({
      ...resource,
      rank: index + 1,
      views: `${resource.viewCount.toLocaleString('en-US')} views`,
    }));
  const searchPeriod = scaleSearchPeriod(searchActivityByPeriod[usagePreset], country);
  const searchActivity = searchPeriod.all;
  const searchDetail = searchPeriod[searchSurface];
  const surfaceShares = searchSurfaceShares(searchPeriod);
  const searchShare = searchSurface === 'all' ? 100 : surfaceShares[searchSurface];
  const interests = interestStats(country, usagePreset);
  const previewInterests = interests.slice(0, PREVIEW_LIMIT);
  const hasMoreInterests = interests.length > PREVIEW_LIMIT;
  const adminReports = adminReportStats(country, usagePreset);
  const previewReports = adminReports.slice(0, PREVIEW_LIMIT);
  const hasMoreReports = adminReports.length > PREVIEW_LIMIT;
  const aiWindow = aiUsageWindow(usageRange, customFrom, customTo);
  const aiUsage = aiUsageStats(country, aiWindow.days);
  const periodMarkLabel =
    usageRange === 'custom'
      ? aiWindow.label
      : (USAGE_PRESETS.find((preset) => preset.id === usageRange)?.label ?? 'This week');

  const rankedFeatures = rankFeatureUsage(
    featureUsageByPeriod[usagePreset].map((item) => {
      if (country === 'all') return item;
      const visits = countryPortion(item.visits, country);
      return { ...item, visits, users: Math.min(countryPortion(item.users, country), visits) };
    }),
  );
  const previewFeatures = rankedFeatures.slice(0, PREVIEW_LIMIT);
  const hasMoreFeatures = rankedFeatures.length > PREVIEW_LIMIT;
  const leadingFeature = rankedFeatures[0];

  const applyCustomRange = () => {
    if (!customFrom || !customTo) {
      setCustomError('Choose a start and end date.');
      return;
    }
    if (customFrom > customTo) {
      setCustomError('Start date must be before the end date.');
      return;
    }
    setCustomError('');
    setUsageRange('custom');
    setCustomOpen(false);
  };

  const go = (view: AppView) => {
    onNavigate?.(view);
  };

  return (
    <PageScrollShell>
      <h2 className="text-page-title mb-1">Admin Dashboard</h2>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Monitor platform usage and key signals across Humanity Hub.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Country</p>
        <Select value={country} onValueChange={(value) => setCountry(value as DashboardCountryId)}>
          <SelectTrigger
            size="sm"
            aria-label="Country"
            className="w-[11.5rem] shrink-0 gap-2 rounded-lg border-border bg-card px-3 text-sm font-medium shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[11.5rem] rounded-lg border-border bg-card shadow-md">
            {DASHBOARD_COUNTRIES.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="mt-6">
        <h3 className="text-sm font-semibold text-foreground-emphasis">Overview</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Current snapshot. These cards keep their own time window and do not use the time filter.
        </p>
      </section>

      <div className="mt-3 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2">
          {pulseMetrics.map((metric) => {
            const interactive = Boolean(metric.view && onNavigate);
            const body = (
              <>
                <div
                  className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent',
                    metric.tintClass,
                  )}
                />
                <p className="relative text-xs font-semibold uppercase tracking-wider text-text-subtle">
                  {metric.label}
                </p>
                <p className="text-kpi relative mt-2">{metric.value}</p>
                <p className={cn('relative mt-2 text-xs font-medium', hintClass(metric.hintTone))}>
                  {metric.hint}
                </p>
              </>
            );
            const cardClass =
              'relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 text-left';

            if (interactive && metric.view) {
              return (
                <button
                  key={metric.label}
                  type="button"
                  onClick={() => go(metric.view!)}
                  className={cn(
                    cardClass,
                    'transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                  )}
                >
                  {body}
                </button>
              );
            }

            return (
              <div key={metric.label} className={cardClass}>
                {body}
              </div>
            );
          })}
        </div>

        <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">AI platform Insights</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {country === 'all' ? 'Current briefing' : 'Platform briefing · all countries'} · {INSIGHTS_UPDATED}
                {' · '}
                {platformInsights.filter(insightNeedsAction).length} to act on
              </p>
            </div>
            <ScopeMark>Current</ScopeMark>
          </div>
          <div className="mt-1 flex-1">
            <InsightsList insights={previewInsights} onAction={onNavigate ? go : undefined} />
          </div>
          {hasMoreInsights ? (
            <button
              type="button"
              onClick={() => setInsightsDrawerOpen(true)}
              className="mt-auto self-start pt-3 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              View more
            </button>
          ) : null}
        </div>
      </div>

      <section className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground-emphasis">Activity</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            These cards follow the time filter
            {' · '}
            <span className="font-medium text-foreground">{aiWindow.label}</span>
            {country === 'all' ? '' : ` · ${countryLabel}`}
          </p>
        </div>
        <div className="flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
          {USAGE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setUsageRange(preset.id)}
              className={cn(
                segmentPillClass.base,
                usageRange === preset.id ? segmentPillClass.active : segmentPillClass.idle,
              )}
            >
              {preset.label}
            </button>
          ))}
          <Popover open={customOpen} onOpenChange={setCustomOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  segmentPillClass.base,
                  usageRange === 'custom' ? segmentPillClass.active : segmentPillClass.idle,
                )}
              >
                Custom
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <p className="text-sm font-semibold text-foreground">Custom range</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Applies to every card in Activity, for the selected country.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  From
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(event) => setCustomFrom(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  To
                  <input
                    type="date"
                    value={customTo}
                    onChange={(event) => setCustomTo(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                  />
                </label>
              </div>
              {customError ? <p className="mt-2 text-xs text-destructive-text">{customError}</p> : null}
              <button
                type="button"
                onClick={applyCustomRange}
                className="mt-3 w-full rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Apply range
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="min-w-0 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Most used features</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {leadingFeature.name} accounts for {leadingFeature.share}% of visits · {leadingFeature.users.toLocaleString('en-US')} users.
              </p>
            </div>
            <PeriodMark>{periodMarkLabel}</PeriodMark>
          </div>

          <div className="mt-5">
            <FeatureUsageList
              items={previewFeatures}
              onSelect={onNavigate ? go : undefined}
            />
          </div>

          {hasMoreFeatures && (
            <button
              type="button"
              onClick={() => setFeaturesDrawerOpen(true)}
              className="mt-5 text-sm text-primary font-medium hover:text-primary-hover transition-colors"
            >
              View more
            </button>
          )}
        </div>

        <div className="min-w-0 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Usage by user groups</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Active people vs total registered</p>
            </div>
            <PeriodMark>{periodMarkLabel}</PeriodMark>
          </div>

          <div className="mt-5">
            <GroupUsageList groups={previewGroups} />
          </div>

          {hasMoreGroups && (
            <button
              type="button"
              onClick={() => setGroupsDrawerOpen(true)}
              className="mt-5 text-sm text-primary font-medium hover:text-primary-hover transition-colors"
            >
              View more
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="min-w-0 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Search activity</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Searches across the platform
                {usageRange === 'today' ? ' · updated 2 min ago' : ''}
              </p>
            </div>
            <PeriodMark>{periodMarkLabel}</PeriodMark>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-2xl font-semibold leading-none tabular-nums text-foreground-emphasis">
                {searchActivity.searches.toLocaleString('en-US')}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">searches</p>
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none tabular-nums text-foreground-emphasis">
                {searchActivity.clickRate}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">led to a click</p>
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none tabular-nums text-destructive">
                {searchActivity.gaps.reduce((sum, gap) => sum + gap.count, 0)}
              </p>
              <p className="mt-1.5 text-xs text-destructive">no results</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-foreground-emphasis">Top searches</p>
            <ol className="mt-2 divide-y divide-border">
              {searchActivity.top.slice(0, PREVIEW_LIMIT).map((search, index) => (
                <li key={search.query} className="flex items-center gap-3 py-2.5">
                  <span className="w-4 shrink-0 text-sm tabular-nums text-text-subtle">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{search.query}</span>
                  <span className="shrink-0 text-sm tabular-nums text-secondary-foreground">
                    {search.count}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4 rounded-xl border border-[#f3d4d4] bg-[#fff6f6] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-destructive-text">Searched but not found</p>
              <p className="text-xs text-destructive-text/80">Content gaps</p>
            </div>
            <ul className="mt-2 space-y-2">
              {searchActivity.gaps.map((gap) => (
                <li key={gap.query} className="flex items-center gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm text-foreground">“{gap.query}”</p>
                  <span className="shrink-0 text-sm tabular-nums text-destructive-text">{gap.count}×</span>
                  <button
                    type="button"
                    onClick={() => go('resources')}
                    className="shrink-0 text-sm font-medium text-destructive-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
                  >
                    Add content
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchSurface('all');
              setSearchDrawerOpen(true);
            }}
            className="mt-5 text-sm text-primary font-medium hover:text-primary-hover transition-colors"
          >
            View more
          </button>
        </div>

        <div className="min-w-0 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Top resources being accessed</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Document and dataset opens</p>
            </div>
            <PeriodMark>{periodMarkLabel}</PeriodMark>
          </div>

          <div className="mt-4">
            {rankedResources.map((doc, idx) => (
              <div
                key={doc.rank}
                className={cn(
                  'flex items-center gap-3 py-2',
                  idx < rankedResources.length - 1 && 'border-b border-sidebar-border',
                )}
              >
                <span className="w-5 text-sm font-semibold text-text-subtle">{doc.rank}</span>
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
                    doc.typeClass,
                  )}
                >
                  {doc.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground-emphasis">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.meta}</p>
                </div>
                <span className="whitespace-nowrap text-sm font-semibold text-secondary-foreground">
                  {doc.views}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Top areas of interest</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {interests[0]
                  ? `${interests[0].name} leads · ${interests[0].count.toLocaleString('en-US')} people`
                  : 'No interests selected'}
              </p>
            </div>
            <PeriodMark>{periodMarkLabel}</PeriodMark>
          </div>
          <div className="mt-4">
            <InterestStatList items={previewInterests} />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            {hasMoreInterests ? (
              <button
                type="button"
                onClick={() => setInterestsDrawerOpen(true)}
                className="text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
              >
                View more
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => go('manageInterests')}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
            >
              Manage interests
            </button>
          </div>
        </div>

        <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Admin report views</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Opens on reports added by admin</p>
            </div>
            <PeriodMark>{periodMarkLabel}</PeriodMark>
          </div>
          <div className="mt-3">
            <ReportStatList items={previewReports} />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            {hasMoreReports ? (
              <button
                type="button"
                onClick={() => setReportsDrawerOpen(true)}
                className="text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
              >
                View more
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => go('manageReports')}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
            >
              Manage reports
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">AI usage</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Requests, tokens, and estimated cost</p>
            </div>
            <PeriodMark>{periodMarkLabel}</PeriodMark>
          </div>
          <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
            {[
              { label: 'Total requests', value: aiUsage.requestsLabel },
              { label: 'Total token count', value: aiUsage.tokensLabel, note: aiUsage.tokensAvgLabel },
              { label: 'Input tokens', value: aiUsage.inputLabel, note: aiUsage.inputAvgLabel },
              { label: 'Output tokens', value: aiUsage.outputLabel, note: aiUsage.outputAvgLabel },
            ].map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col justify-center rounded-xl border border-border bg-muted/40 px-4 py-3"
              >
                <p className="text-2xl font-semibold leading-none tabular-nums text-foreground-emphasis">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">{metric.label}</p>
                {metric.note ? (
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{metric.note}</p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
            <span className="text-xs text-muted-foreground">Estimated total cost</span>
            <span className="text-2xl font-semibold leading-none tabular-nums text-foreground-emphasis">
              {aiUsage.costLabel}
            </span>
          </div>
        </div>

        <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Server</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Platform-wide · all countries. Each row keeps its own window.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ScopeMark>Live</ScopeMark>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-text">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                Operational
              </span>
            </div>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {serverStats.map((stat) => (
              <li key={stat.label} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span
                    className={cn(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      stat.tone === 'success' && 'text-success',
                      stat.tone === 'warning' && 'text-warning-strong',
                      stat.tone === 'muted' && 'text-foreground',
                    )}
                  >
                    {stat.value}
                    {stat.meter && !stat.value.endsWith('%') ? (
                      <span className="font-medium text-muted-foreground"> · {stat.meter}</span>
                    ) : null}
                  </span>
                </div>
                {stat.meter ? (
                  <div className="mt-1.5 flex w-full">
                    <UsageBar width={stat.meter} color="var(--chart-2)" />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        </div>
      </section>

      <Sheet open={featuresDrawerOpen} onOpenChange={setFeaturesDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[420px] [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">Most used features</SheetTitle>
          <SheetDescription className="sr-only">
            Full list of feature visits for the selected period
          </SheetDescription>

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <BarChart3 size={18} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Most used features</h2>
                <p className="text-sm text-muted-foreground">
                  {rankedFeatures.length} features · {rangeLabel}{countryPhrase}
                </p>
              </div>
            </div>
            <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <X size={20} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>

          <div className="h-px bg-border" />

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FeatureUsageList
              items={rankedFeatures}
              onSelect={
                onNavigate
                  ? (view) => {
                      setFeaturesDrawerOpen(false);
                      go(view);
                    }
                  : undefined
              }
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={groupsDrawerOpen} onOpenChange={setGroupsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[420px] [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">Usage by user groups</SheetTitle>
          <SheetDescription className="sr-only">
            Full list of active users by group versus total registered
          </SheetDescription>

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <Users size={18} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Usage by user groups</h2>
                <p className="text-sm text-muted-foreground">
                  {rankedGroups.length} groups · {rangeLabel}{countryPhrase}
                </p>
              </div>
            </div>
            <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <X size={20} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>

          <div className="h-px bg-border" />

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <GroupUsageList groups={rankedGroups} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={insightsDrawerOpen} onOpenChange={setInsightsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[420px] [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">AI platform Insights</SheetTitle>
          <SheetDescription className="sr-only">
            Full list of AI-generated platform insights
          </SheetDescription>

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <Sparkles size={18} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">AI platform Insights</h2>
                <p className="text-sm text-muted-foreground">
                  {platformInsights.length} insights · {INSIGHTS_UPDATED}
                </p>
              </div>
            </div>
            <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <X size={20} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>

          <div className="h-px bg-border" />

          <div className="flex-1 overflow-y-auto px-5 py-2">
            <InsightsList
              insights={platformInsights}
              onAction={
                onNavigate
                  ? (view) => {
                      setInsightsDrawerOpen(false);
                      go(view);
                    }
                  : undefined
              }
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={searchDrawerOpen} onOpenChange={setSearchDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[440px] [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">Search activity</SheetTitle>
          <SheetDescription className="sr-only">
            Search volume, click-through, and unanswered queries by where people search
          </SheetDescription>

          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <Search size={18} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Search activity</h2>
                <p className="text-sm text-muted-foreground">
                  {rangeLabel}{countryPhrase}
                </p>
              </div>
            </div>
            <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <X size={20} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>

          <div className="h-px bg-border" />

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
              {SEARCH_SURFACES.map((surface) => (
                <button
                  key={surface.id}
                  type="button"
                  onClick={() => setSearchSurface(surface.id)}
                  className={cn(
                    segmentPillClass.base,
                    searchSurface === surface.id ? segmentPillClass.active : segmentPillClass.idle,
                  )}
                >
                  {surface.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <p className="text-2xl font-semibold leading-none tabular-nums text-foreground-emphasis">
                  {searchDetail.searches.toLocaleString('en-US')}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">searches</p>
              </div>
              <div>
                <p className="text-2xl font-semibold leading-none tabular-nums text-foreground-emphasis">
                  {searchDetail.clickRate}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">led to a click</p>
              </div>
              <div>
                <p className="text-2xl font-semibold leading-none tabular-nums text-destructive">
                  {searchDetail.gaps.reduce((sum, gap) => sum + gap.count, 0)}
                </p>
                <p className="mt-1.5 text-xs text-destructive">no results</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {searchSurface === 'all'
                ? 'Across Chats, Maps, Reports, and Workflows'
                : `${searchShare}% of searches ${rangePhrase}`}
            </p>

            {searchSurface === 'all' ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-foreground-emphasis">Where people search</p>
                <div className="mt-3 space-y-3">
                  {SEARCH_SURFACES.filter((surface) => surface.id !== 'all').map((surface) => {
                    const id = surface.id as Exclude<SearchSurface, 'all'>;
                    const slice = searchPeriod[id];
                    const max = Math.max(
                      searchPeriod.chats.searches,
                      searchPeriod.maps.searches,
                      searchPeriod.reports.searches,
                      searchPeriod.workflows.searches,
                    );
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSearchSurface(id)}
                        className="flex w-full min-w-0 items-center gap-3 rounded-lg py-1 text-left hover:bg-muted/60"
                      >
                        <span className="w-[5.5rem] shrink-0 text-sm text-foreground">{surface.label}</span>
                        <UsageBar
                          width={max === 0 ? '0%' : `${(slice.searches / max) * 100}%`}
                          color="var(--chart-2)"
                        />
                        <span className="w-16 shrink-0 text-right text-sm tabular-nums text-secondary-foreground">
                          {surfaceShares[id]}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground-emphasis">Top searches</p>
              <ol className="mt-2 divide-y divide-border">
                {searchDetail.top.map((search, index) => (
                  <li key={search.query} className="flex items-center gap-3 py-2.5">
                    <span className="w-4 shrink-0 text-sm tabular-nums text-text-subtle">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{search.query}</span>
                      {search.place ? (
                        <span className="block text-xs text-muted-foreground">{search.place}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-secondary-foreground">
                      {search.count.toLocaleString('en-US')}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-xl border border-[#f3d4d4] bg-[#fff6f6] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-destructive-text">Searched but not found</p>
                <p className="text-xs text-destructive-text/80">Content gaps</p>
              </div>
              <ul className="mt-2 space-y-2">
                {searchDetail.gaps.map((gap) => (
                  <li key={gap.query} className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm text-foreground">“{gap.query}”</p>
                    <span className="shrink-0 text-sm tabular-nums text-destructive-text">{gap.count}×</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchDrawerOpen(false);
                        go('resources');
                      }}
                      className="shrink-0 text-sm font-medium text-destructive-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
                    >
                      Add content
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={interestsDrawerOpen} onOpenChange={setInterestsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[440px] [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">Top areas of interest</SheetTitle>
          <SheetDescription className="sr-only">
            Full list of selected areas of interest for the country and period
          </SheetDescription>
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">Top areas of interest</h2>
              <p className="text-sm text-muted-foreground">
                {interests.length} interests · {rangeLabel}{countryPhrase}
              </p>
            </div>
            <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <X size={20} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          <div className="h-px bg-border" />
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <InterestStatList items={interests} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={reportsDrawerOpen} onOpenChange={setReportsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[440px] [&>button.absolute]:hidden"
        >
          <SheetTitle className="sr-only">Admin report views</SheetTitle>
          <SheetDescription className="sr-only">
            Views on reports added by admin for the country and period
          </SheetDescription>
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <FileText size={18} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Admin report views</h2>
                <p className="text-sm text-muted-foreground">
                  {adminReports.length} reports · {rangeLabel}{countryPhrase}
                </p>
              </div>
            </div>
            <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <X size={20} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          <div className="h-px bg-border" />
          <div className="flex-1 overflow-y-auto px-5 py-3">
            <ReportStatList items={adminReports} />
          </div>
        </SheetContent>
      </Sheet>
    </PageScrollShell>
  );
}
