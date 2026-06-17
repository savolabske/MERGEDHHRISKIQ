export type ResourceOwnership = 'created_by_me' | 'shared_with_me';

export type ResourceFileType = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'OTHER';

export type PlatformResourceStatus = 'uploading' | 'completed';

export interface PlatformResourceStatusInfo {
  state: PlatformResourceStatus;
  updatedAt: string;
  uploadedFiles?: number;
  totalFiles?: number;
}

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
  status?: PlatformResourceStatusInfo;
  files: ResourceFile[];
  webLinks: ResourceWebLink[];
  userGroups: string[];
  individualUsers: string[];
}

export interface ResourceUserGroup {
  id: string;
  name: string;
  members: string[];
}

export const INITIAL_RESOURCE_USER_GROUPS: ResourceUserGroup[] = [
  {
    id: '1',
    name: 'Humanitarian Affairs',
    members: ['sarah.johnson@un.org', 'ahmed.hassan@un.org', 'maria.garcia@un.org'],
  },
  {
    id: '2',
    name: 'Mission Leadership',
    members: ['collins.otieno@un.org', 'david.mutua@ocha.org'],
  },
  {
    id: '3',
    name: 'Security & Access',
    members: ['field.ops@un.org', 'geo.analyst@un.org', 'risk.officer@un.org'],
  },
  {
    id: '4',
    name: 'WASH Cluster',
    members: ['wash.lead@un.org'],
  },
];

export const MOCK_USER_GROUPS = INITIAL_RESOURCE_USER_GROUPS.map((group) => group.name);

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

interface ResourceTemplate {
  title: string;
  description: string;
  ownership: ResourceOwnership;
  tags: string[];
  fileCount: number;
  userGroups: string[];
  lastModified: string;
  createdAt: string;
  status?: PlatformResourceStatusInfo;
}

const ADDITIONAL_RESOURCE_TEMPLATES: ResourceTemplate[] = [
  {
    title: 'Nutrition Cluster Sitrep — Feb 2026',
    description:
      'Monthly nutrition cluster situation report covering acute malnutrition trends, SAM/MAM caseloads, and partner coverage across priority districts.',
    ownership: 'shared_with_me',
    tags: ['nutrition', 'sitrep', '2026'],
    fileCount: 4,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 19, 2026',
    createdAt: 'Feb 14, 2026',
  },
  {
    title: 'Protection Monitoring Framework',
    description:
      'Standardized indicators and data collection tools for protection monitoring, including displacement-related risks and civilian harm documentation.',
    ownership: 'created_by_me',
    tags: ['protection', 'monitoring', 'framework'],
    fileCount: 7,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 17, 2026',
    createdAt: 'Feb 05, 2026',
  },
  {
    title: 'CCCM Camp Management Guidelines',
    description:
      'Camp coordination and camp management operational guidelines for IDP sites, covering site planning, service standards, and population tracking.',
    ownership: 'shared_with_me',
    tags: ['CCCM', 'displacement', 'guidelines'],
    fileCount: 5,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 16, 2026',
    createdAt: 'Jan 22, 2026',
  },
  {
    title: 'Education in Emergencies Baseline',
    description:
      'Baseline assessment of education access, school functionality, and learning continuity needs in conflict-affected and drought-impacted areas.',
    ownership: 'created_by_me',
    tags: ['education', 'baseline', 'assessment'],
    fileCount: 9,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 14, 2026',
    createdAt: 'Jan 30, 2026',
  },
  {
    title: 'Shelter & NFI Distribution Plan Q1',
    description:
      'Quarterly distribution plan for emergency shelter materials and non-food items, including pipeline status and gap analysis by region.',
    ownership: 'shared_with_me',
    tags: ['shelter', 'NFI', 'distribution'],
    fileCount: 6,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 13, 2026',
    createdAt: 'Jan 25, 2026',
  },
  {
    title: 'Health Cluster Epidemiological Surveillance',
    description:
      'Weekly epidemiological surveillance summary covering AWD/cholera alerts, measles cases, and health facility reporting completeness.',
    ownership: 'created_by_me',
    tags: ['health', 'surveillance', 'epidemiology'],
    fileCount: 3,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 12, 2026',
    createdAt: 'Feb 01, 2026',
  },
  {
    title: 'Logistics Common Transport Arrangements',
    description:
      'Shared transport arrangements and corridor access protocols for humanitarian cargo movement across Somalia supply routes.',
    ownership: 'shared_with_me',
    tags: ['logistics', 'transport', 'supply chain'],
    fileCount: 4,
    userGroups: ['Mission Leadership'],
    lastModified: 'Feb 11, 2026',
    createdAt: 'Jan 18, 2026',
  },
  {
    title: 'Food Security Analysis — Feb 2026',
    description:
      'Integrated food security phase classification analysis with market price trends, livestock conditions, and household coping strategies.',
    ownership: 'created_by_me',
    tags: ['food security', 'FSNAU', 'analysis'],
    fileCount: 8,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 10, 2026',
    createdAt: 'Jan 20, 2026',
  },
  {
    title: 'Drought Response Operational Plan',
    description:
      'Multi-sector drought response plan outlining priority interventions, geographic targeting, and resource requirements for Q1 2026.',
    ownership: 'shared_with_me',
    tags: ['drought', 'response', 'operations'],
    fileCount: 11,
    userGroups: ['Humanitarian Affairs', 'Mission Leadership'],
    lastModified: 'Feb 09, 2026',
    createdAt: 'Jan 12, 2026',
  },
  {
    title: 'Displacement Tracking Matrix Update',
    description:
      'Latest displacement tracking matrix with population movements, return intentions, and site-level population figures.',
    ownership: 'created_by_me',
    tags: ['DTM', 'displacement', 'tracking'],
    fileCount: 5,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 07, 2026',
    createdAt: 'Jan 08, 2026',
  },
  {
    title: 'GBV Referral Pathways Directory',
    description:
      'Comprehensive directory of gender-based violence referral pathways, safe spaces, and psychosocial support services by location.',
    ownership: 'shared_with_me',
    tags: ['GBV', 'protection', 'referral'],
    fileCount: 4,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 06, 2026',
    createdAt: 'Jan 05, 2026',
  },
  {
    title: 'Cash & Voucher Assistance Toolkit',
    description:
      'Operational toolkit for cash and voucher assistance programming, including targeting criteria, delivery mechanisms, and MEAL frameworks.',
    ownership: 'created_by_me',
    tags: ['CVA', 'cash', 'toolkit'],
    fileCount: 10,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Feb 05, 2026',
    createdAt: 'Dec 28, 2025',
  },
  {
    title: 'Mine Action Survey — South Central',
    description:
      'Explosive ordnance contamination survey results for south-central Somalia, including hazard area mapping and clearance priorities.',
    ownership: 'shared_with_me',
    tags: ['mine action', 'EO', 'survey'],
    fileCount: 6,
    userGroups: ['Security & Access'],
    lastModified: 'Feb 04, 2026',
    createdAt: 'Jan 02, 2026',
  },
  {
    title: 'Famine Prevention Early Warning Bulletin',
    description:
      'Early warning bulletin on famine risk indicators, including rainfall deficits, pasture conditions, and market access constraints.',
    ownership: 'created_by_me',
    tags: ['early warning', 'famine', 'IPC'],
    fileCount: 3,
    userGroups: ['Humanitarian Affairs', 'Mission Leadership'],
    lastModified: 'Feb 03, 2026',
    createdAt: 'Dec 20, 2025',
  },
  {
    title: 'Partner Capacity Assessment Matrix',
    description:
      'Standardized partner capacity assessment matrix covering financial management, programme quality, and accountability standards.',
    ownership: 'shared_with_me',
    tags: ['partners', 'capacity', 'assessment'],
    fileCount: 7,
    userGroups: ['Mission Leadership'],
    lastModified: 'Feb 02, 2026',
    createdAt: 'Jan 10, 2026',
  },
  {
    title: 'Contingency Stock Pre-positioning Map',
    description:
      'Geospatial map of pre-positioned contingency stocks including warehouse locations, stock levels, and replenishment timelines.',
    ownership: 'created_by_me',
    tags: ['logistics', 'stock', 'map'],
    fileCount: 4,
    userGroups: ['Mission Leadership'],
    lastModified: 'Feb 01, 2026',
    createdAt: 'Jan 03, 2026',
  },
  {
    title: 'Inter-Cluster Coordination Minutes',
    description:
      'Minutes from the latest inter-cluster coordination meeting covering cross-cutting issues, pipeline updates, and action points.',
    ownership: 'shared_with_me',
    tags: ['coordination', 'clusters', 'minutes'],
    fileCount: 2,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Jan 31, 2026',
    createdAt: 'Jan 31, 2026',
  },
  {
    title: 'Environmental Impact Assessment Guidelines',
    description:
      'Guidelines for conducting environmental impact assessments in humanitarian programming, aligned with donor compliance requirements.',
    ownership: 'created_by_me',
    tags: ['environment', 'compliance', 'guidelines'],
    fileCount: 5,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Jan 30, 2026',
    createdAt: 'Jan 15, 2026',
  },
  {
    title: 'Community Engagement & Accountability Framework',
    description:
      'Framework for community engagement and accountability mechanisms, including feedback channels, complaint handling, and participation standards.',
    ownership: 'shared_with_me',
    tags: ['CEA', 'accountability', 'community'],
    fileCount: 6,
    userGroups: ['Humanitarian Affairs'],
    lastModified: 'Jan 29, 2026',
    createdAt: 'Jan 07, 2026',
  },
];

function generateAdditionalResources(): PlatformResource[] {
  return ADDITIONAL_RESOURCE_TEMPLATES.map((template, index) => {
    const id = String(index + 6);
    const slug = template.title.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 24);
    return {
      id,
      title: template.title,
      description: template.description,
      ownership: template.ownership,
      tags: template.tags,
      lastModified: template.lastModified,
      createdAt: template.createdAt,
      status: template.status ?? {
        state: 'completed',
        updatedAt: template.lastModified,
      },
      files: generateFiles(slug, template.fileCount),
      webLinks: [],
      userGroups: template.userGroups,
      individualUsers: index % 3 === 0 ? ['field.ops@un.org'] : [],
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
    status: {
      state: 'uploading',
      updatedAt: '3 of 5 files',
      uploadedFiles: 3,
      totalFiles: 5,
    },
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
    status: {
      state: 'completed',
      updatedAt: 'Mar 15, 2026',
    },
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
    status: {
      state: 'completed',
      updatedAt: 'Mar 12, 2026',
    },
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
    status: {
      state: 'completed',
      updatedAt: 'Mar 10, 2026',
    },
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
    status: {
      state: 'completed',
      updatedAt: 'Mar 08, 2026',
    },
    files: generateFiles('Risk_Strategy_2026', 6),
    webLinks: [],
    userGroups: ['Humanitarian Affairs'],
    individualUsers: ['risk.officer@un.org'],
  },
  ...generateAdditionalResources(),
];
