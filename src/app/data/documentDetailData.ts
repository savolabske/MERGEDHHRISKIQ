import { INITIAL_RESOURCES, type PlatformResource } from './resourcesMock';

/** Resources added via main menu → Resources are eligible for per-document chat. */
export const CHAT_ELIGIBLE_PLATFORM_RESOURCE_IDS = new Set(
  INITIAL_RESOURCES.map((r) => r.id),
);

const RESOURCE_VIEW_COUNTS: Record<string, string> = {
  '1': '428',
  '2': '614',
  '3': '892',
  '4': '541',
  '5': '387',
};

export interface ResourceFileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  fileType: 'pdf' | 'doc' | 'xlsx' | 'pptx' | 'other';
}

export interface ResourceWebLinkItem {
  id: string;
  url: string;
  addedAt: string;
}

export interface DocumentContent {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
  views: string;
  fileCount: number;
  files: ResourceFileItem[];
  webLinks: ResourceWebLinkItem[];
  /** From main-menu Resources module */
  platformResourceId: string;
}

function fileTypeFromMime(type: string): ResourceFileItem['fileType'] {
  switch (type) {
    case 'PDF':
      return 'pdf';
    case 'DOCX':
      return 'doc';
    case 'XLSX':
      return 'xlsx';
    case 'PPTX':
      return 'pptx';
    default:
      return 'other';
  }
}

function buildResourceFiles(resource: PlatformResource): ResourceFileItem[] {
  return resource.files.map((file) => ({
    id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    uploadedAt: file.uploadedAt,
    fileType: fileTypeFromMime(file.type),
  }));
}

function buildContentFromResource(resource: PlatformResource): DocumentContent {
  return {
    id: resource.id,
    platformResourceId: resource.id,
    title: resource.title,
    summary: resource.description,
    createdAt: resource.createdAt,
    tags: resource.tags,
    views: RESOURCE_VIEW_COUNTS[resource.id] ?? '—',
    fileCount: resource.files.length,
    files: buildResourceFiles(resource),
    webLinks: resource.webLinks.map((link) => ({
      id: link.id,
      url: link.url,
      addedAt: link.addedAt,
    })),
  };
}

const FALLBACK: DocumentContent = {
  id: 'unknown',
  platformResourceId: '',
  title: 'Document',
  summary: 'This document is not available for document chat.',
  createdAt: '—',
  tags: ['Resource'],
  views: '—',
  fileCount: 0,
  files: [],
  webLinks: [],
};

export function isChatEligiblePlatformResource(resourceId: string): boolean {
  return CHAT_ELIGIBLE_PLATFORM_RESOURCE_IDS.has(resourceId);
}

export function getPlatformResourceById(id: string): PlatformResource | undefined {
  return INITIAL_RESOURCES.find((r) => r.id === id);
}

export function getPlatformResourceByTitle(title: string): PlatformResource | undefined {
  const exact = INITIAL_RESOURCES.find((r) => r.title === title);
  if (exact) return exact;
  const normalised = title.replace(/[–—]/g, '-').trim();
  return INITIAL_RESOURCES.find((r) => {
    const normTitle = r.title.replace(/[–—]/g, '-').trim();
    return normTitle === normalised;
  });
}

/** Resolve to a main-menu Resources id, or null if not chat-eligible. */
export function resolveChatEligibleResourceId(titleOrId: string): string | null {
  if (isChatEligiblePlatformResource(titleOrId)) return titleOrId;
  const byTitle = getPlatformResourceByTitle(titleOrId);
  return byTitle && isChatEligiblePlatformResource(byTitle.id) ? byTitle.id : null;
}

export function isChatEligibleKnowledgeSource(source: {
  type?: string;
  title?: string;
  documentId?: string;
}): boolean {
  if (source.type !== 'knowledge-base') return false;
  const id =
    source.documentId && isChatEligiblePlatformResource(source.documentId)
      ? source.documentId
      : resolveChatEligibleResourceId(source.title ?? '');
  return id !== null;
}

export function getDocumentContent(titleOrId: string): DocumentContent {
  const resourceId = resolveChatEligibleResourceId(titleOrId);
  if (!resourceId) return { ...FALLBACK, title: titleOrId };
  const resource = getPlatformResourceById(resourceId);
  if (!resource) return { ...FALLBACK, id: titleOrId, title: titleOrId };
  return buildContentFromResource(resource);
}
