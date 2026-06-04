export type ResourceOwnership = 'created_by_me' | 'shared_with_me';

export type ResourceFileType = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'OTHER';

export interface ResourceFile {
  id: string;
  name: string;
  size: string;
  type: ResourceFileType;
  uploadedAt: string;
}

export interface ResourceWebLink {
  id: string;
  url: string;
  addedAt: string;
}

export interface PlatformResource {
  id: string;
  title: string;
  description: string;
  ownership: ResourceOwnership;
  tags: string[];
  lastModified: string;
  createdAt: string;
  files: ResourceFile[];
  webLinks: ResourceWebLink[];
  userGroups: string[];
  individualUsers: string[];
}

export const MOCK_USER_GROUPS = [
  'Humanitarian Affairs',
  'Mission Leadership',
  'Security & Access',
  'WASH Cluster',
];

function generateFiles(prefix: string, count: number): ResourceFile[] {
  const types: ResourceFileType[] = ['PDF', 'DOCX', 'XLSX', 'PPTX'];
  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const ext = type.toLowerCase();
    return {
      id: `${prefix}-file-${i + 1}`,
      name: `${prefix}_File_${String(i + 1).padStart(2, '0')}.${ext}`,
      size: `${(0.4 + (i % 5) * 0.2).toFixed(1)} MB`,
      type,
      uploadedAt: `Feb ${String((i % 28) + 1).padStart(2, '0')}, 2026`,
    };
  });
}

/**
 * Platform resources (main menu → Resources). Only these ids support
 * per-document chat from home trending or Risk IQ source citations.
 */
export const INITIAL_RESOURCES: PlatformResource[] = [
  {
    id: '1',
    title: 'HCT Meeting 2026',
    description:
      'Comprehensive documentation for the 2026 Humanitarian Country Team meeting, including coordination frameworks, sector updates, and strategic priorities for Somalia operations.',
    ownership: 'created_by_me',
    tags: ['HCT', 'coordination', '2026'],
    lastModified: 'Feb 20, 2026',
    createdAt: 'Feb 18, 2026',
    files: generateFiles('HCT_Meeting_2026', 30),
    webLinks: [
      {
        id: '1',
        url: 'https://response.reliefweb.int/hct-somalia-2026',
        addedAt: 'Feb 15, 2026',
      },
    ],
    userGroups: ['Humanitarian Affairs', 'Mission Leadership'],
    individualUsers: [
      'sarah.johnson@un.org',
      'ahmed.hassan@un.org',
      'maria.garcia@un.org',
    ],
  },
  {
    id: '2',
    title: 'WASH Sector Assessment Q1',
    description:
      'Quarterly water, sanitation, and hygiene sector assessment covering access gaps, infrastructure needs, and partner coordination in priority districts.',
    ownership: 'shared_with_me',
    tags: ['WASH', 'assessment', '2026', 'internal'],
    lastModified: 'Feb 18, 2026',
    createdAt: 'Feb 10, 2026',
    files: generateFiles('WASH_Q1', 12),
    webLinks: [],
    userGroups: ['WASH Cluster'],
    individualUsers: ['wash.lead@un.org'],
  },
  {
    id: '3',
    title: 'Security Incident Reporting SOP',
    description:
      'Standard operating procedures for documenting, escalating, and reporting security incidents across UN mission locations in Somalia.',
    ownership: 'created_by_me',
    tags: ['security', 'SOP', 'operations'],
    lastModified: 'Feb 15, 2026',
    createdAt: 'Jan 28, 2026',
    files: generateFiles('Security_SOP', 8),
    webLinks: [
      {
        id: '1',
        url: 'https://unsom.sharepoint.com/security-sop',
        addedAt: 'Jan 30, 2026',
      },
    ],
    userGroups: ['Security & Access'],
    individualUsers: [],
  },
  {
    id: '4',
    title: 'Mogadishu Access Map Overlay',
    description:
      'Geospatial overlay data showing restricted corridors, open routes, and checkpoint locations within the Mogadishu operational area.',
    ownership: 'shared_with_me',
    tags: ['map', 'access', 'Mogadishu'],
    lastModified: 'Feb 12, 2026',
    createdAt: 'Feb 01, 2026',
    files: generateFiles('Mogadishu_Map', 5),
    webLinks: [],
    userGroups: ['Mission Leadership'],
    individualUsers: ['geo.analyst@un.org', 'field.ops@un.org'],
  },
  {
    id: '5',
    title: 'Annual Risk Mitigation Strategy 2026',
    description:
      'Long-term strategic objectives for systemic risk reduction across the Somalia mission portfolio, aligned with HCT priorities.',
    ownership: 'created_by_me',
    tags: ['strategy', 'risk', '2026'],
    lastModified: 'Feb 08, 2026',
    createdAt: 'Jan 15, 2026',
    files: generateFiles('Risk_Strategy_2026', 6),
    webLinks: [],
    userGroups: ['Humanitarian Affairs'],
    individualUsers: ['risk.officer@un.org'],
  },
];
