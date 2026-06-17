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

export interface RelatedDocument {
  id: string;
  title: string;
  type: string;
  size: string;
  fileType: 'pdf' | 'doc';
}

export interface DocumentContent {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  tag: string;
  views: string;
  size: string;
  fileType: 'pdf' | 'doc';
  relatedDocs: RelatedDocument[];
  /** From main-menu Resources module */
  platformResourceId: string;
}

function fileTypeFromResource(resource: PlatformResource): 'pdf' | 'doc' {
  const first = resource.files[0]?.type;
  return first === 'PDF' ? 'pdf' : 'doc';
}

function buildRelatedDocs(resourceId: string): RelatedDocument[] {
  return INITIAL_RESOURCES.filter((r) => r.id !== resourceId)
    .slice(0, 2)
    .map((r) => {
      const file = r.files[0];
      return {
        id: r.id,
        title: r.title,
        type: r.tags[0] ?? 'Resource',
        size: file?.size ?? '—',
        fileType: file?.type === 'PDF' ? 'pdf' : 'doc',
      };
    });
}

function buildContentFromResource(resource: PlatformResource): DocumentContent {
  const primaryFile = resource.files[0];
  return {
    id: resource.id,
    platformResourceId: resource.id,
    title: resource.title,
    summary: resource.description,
    createdAt: resource.createdAt,
    tag: resource.tags[0] ?? 'Resource',
    views: RESOURCE_VIEW_COUNTS[resource.id] ?? '—',
    size: primaryFile?.size ?? `${resource.files.length} files`,
    fileType: fileTypeFromResource(resource),
    relatedDocs: buildRelatedDocs(resource.id),
  };
}

const FALLBACK: DocumentContent = {
  id: 'unknown',
  platformResourceId: '',
  title: 'Document',
  summary: 'This document is not available for document chat.',
  createdAt: '—',
  tag: 'Resource',
  views: '—',
  size: '—',
  fileType: 'pdf',
  relatedDocs: [],
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
