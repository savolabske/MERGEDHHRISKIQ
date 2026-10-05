import {
  getAdminKnowledgeResource,
  type AdminKnowledgeResource,
} from '../../../data/adminKnowledgeResources';
import {
  loadManagedReports,
  type ManagedReport,
  type ReportCatalogId,
} from '../../../data/reportsAdminMock';
import { LINKABLE_KNOWLEDGE_SOURCES } from '../../../data/reportResourceLink';
import { loadPlatformResources, type PlatformResource } from '../../../data/resourcesMock';

export type ReportSourceKind = 'document' | 'web';

export type ReportResourcePool = 'admin' | 'user';

/** Whether the signed-in user can open the resource these documents belong to. */
export type ReportSourceAccess = 'open' | 'restricted' | 'deleted';

export type ReportSource = {
  id: string;
  kind: ReportSourceKind;
  /** Document file name, or the resource title when the file itself is gone. */
  title: string;
  /** Resource that contains this document. */
  resourceTitle: string;
  excerpt: string;
  date?: string;
  /** Short id shown beside the date. */
  citationId: string;
  resourceId?: string;
  pool?: ReportResourcePool;
  access: ReportSourceAccess;
  url?: string;
};

function viewerCanOpenPlatformResource(resource: PlatformResource): boolean {
  return resource.ownership === 'created_by_me' || resource.ownership === 'shared_with_me';
}

/** Source rows name the resource, which holds many documents, so drop a trailing file extension. */
function resourceSourceTitle(name: string): string {
  return name.replace(/\.(pdf|xlsx|xls|docx|doc|csv|pptx|ppt|zip)$/i, '');
}

function fileSource(input: {
  id: string;
  kind: ReportSourceKind;
  title: string;
  resource: { id: string; title: string; description: string };
  date?: string;
  citationId: string;
  pool: ReportResourcePool;
  access: Exclude<ReportSourceAccess, 'deleted'>;
  url?: string;
}): ReportSource {
  return {
    id: input.id,
    kind: input.kind,
    title: input.title,
    resourceTitle: input.resource.title,
    excerpt: input.resource.description,
    date: input.date,
    citationId: input.citationId,
    resourceId: input.resource.id,
    pool: input.pool,
    access: input.access,
    url: input.url,
  };
}

function sourcesFromAdmin(resource: AdminKnowledgeResource): ReportSource[] {
  // A resource linked to a report the user can open is available to them, including ones an admin added.
  const access: Exclude<ReportSourceAccess, 'deleted'> = 'open';
  const files = resource.files.map((file) =>
    fileSource({
      id: `file-${file.id}`,
      kind: 'document',
      title: resourceSourceTitle(file.name),
      resource,
      date: file.uploadedAt,
      citationId: file.id,
      pool: 'admin',
      access,
    }),
  );
  const links = resource.webLinks.map((url, index) =>
    fileSource({
      id: `link-${resource.id}-${index}`,
      kind: 'web',
      title: url,
      resource,
      citationId: resource.id,
      pool: 'admin',
      access,
      url,
    }),
  );
  if (files.length === 0 && links.length === 0) {
    return [
      fileSource({
        id: `resource-${resource.id}`,
        kind: 'document',
        title: resource.title,
        resource,
        date: resource.lastModified,
        citationId: resource.id,
        pool: 'admin',
        access,
      }),
    ];
  }
  return [...files, ...links];
}

function sourcesFromPlatform(resource: PlatformResource): ReportSource[] {
  const access: Exclude<ReportSourceAccess, 'deleted'> = viewerCanOpenPlatformResource(resource)
    ? 'open'
    : 'restricted';
  const files = resource.files.map((file) =>
    fileSource({
      id: `file-${file.id}`,
      kind: 'document',
      title: resourceSourceTitle(file.name),
      resource,
      date: file.uploadedAt,
      citationId: file.id,
      pool: 'user',
      access,
    }),
  );
  const links = resource.webLinks.map((link) =>
    fileSource({
      id: `link-${link.id}`,
      kind: 'web',
      title: link.url,
      resource,
      date: link.addedAt,
      citationId: link.id,
      pool: 'user',
      access,
      url: link.url,
    }),
  );
  if (files.length === 0 && links.length === 0) {
    return [
      fileSource({
        id: `resource-${resource.id}`,
        kind: 'document',
        title: resource.title,
        resource,
        date: resource.lastModified,
        citationId: resource.id,
        pool: 'user',
        access,
      }),
    ];
  }
  return [...files, ...links];
}

function deletedSource(resourceId: string): ReportSource[] {
  const linkable = LINKABLE_KNOWLEDGE_SOURCES.find((source) => source.id === resourceId);
  const title = linkable?.title ?? 'Untitled document';
  return [
    {
      id: `deleted-${resourceId}`,
      kind: 'document',
      title,
      resourceTitle: title,
      excerpt: '',
      citationId: resourceId,
      access: 'deleted',
    },
  ];
}

function linkedResourceSources(report: ManagedReport): ReportSource[] {
  const resourceId = report.resourceId;
  if (!resourceId) return [];

  if (report.resourcePool === 'user') {
    const platform = loadPlatformResources().find((resource) => resource.id === resourceId);
    return platform ? sourcesFromPlatform(platform) : deletedSource(resourceId);
  }

  const admin = getAdminKnowledgeResource(resourceId);
  return admin ? sourcesFromAdmin(admin) : deletedSource(resourceId);
}

/** Documents inside the resource added to a built-in report. */
export function sourcesForCatalogReport(catalogId: ReportCatalogId): ReportSource[] {
  const report = loadManagedReports().find((item) => item.catalogId === catalogId);
  if (!report) return [];
  return sourcesForManagedReport(report);
}

/** Documents inside the resource added to a managed or custom report. */
export function sourcesForManagedReport(report: ManagedReport): ReportSource[] {
  return linkedResourceSources(report);
}

/** The resource linked to a report, when that record still exists. */
export function linkedResourceForReport(
  report: ManagedReport,
): { id: string; title: string; pool: ReportResourcePool } | null {
  if (!report.resourceId) return null;
  if (report.resourcePool === 'user') {
    const platform = loadPlatformResources().find((resource) => resource.id === report.resourceId);
    if (!platform) return null;
    return { id: platform.id, title: platform.title, pool: 'user' };
  }
  const admin = getAdminKnowledgeResource(report.resourceId);
  if (!admin) return null;
  return { id: admin.id, title: admin.title, pool: 'admin' };
}

export function linkedResourceForCatalog(
  catalogId: ReportCatalogId,
): { id: string; title: string; pool: ReportResourcePool } | null {
  const report = loadManagedReports().find((item) => item.catalogId === catalogId);
  if (!report) return null;
  return linkedResourceForReport(report);
}
