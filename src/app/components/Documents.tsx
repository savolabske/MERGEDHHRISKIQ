import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  X,
  Search,
  FileText,
  Folder,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  MoreVertical,
  Edit2,
  Download,
  ArrowLeft,
  Calendar,
  RefreshCcw,
  Loader2,
  Map,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProgressiveList } from '../hooks/useProgressiveList';
import { PageFooter } from './PageFooter';
import { PageBreadcrumb } from './ui/page-breadcrumb';
import { TableSkeleton } from './ui/table-skeleton';
import { DetailFieldLabel, DetailSectionTitle } from './ui/detail-labels';

type DocumentFileProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface DocumentFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  /** 0–100 while uploading to storage; cleared after the document finishes uploading. */
  uploadFileProgress?: number;
  /** Per-file ingestion / embedding status; defaults to completed when omitted. */
  processingStatus?: DocumentFileProcessingStatus;
  /** 0–100 when processing */
  processingProgress?: number;
  /** Optional uploader label (stored / search metadata; not shown in status UI). */
  uploadedBy?: string;
}

type EditFileRow =
  | { kind: 'existing'; file: DocumentFile; index: number }
  | { kind: 'new'; file: File; index: number };

interface DocumentGroup {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  userGroup: string;
  files: DocumentFile[];
  uploadStatus: 'uploading' | 'uploaded' | 'failed';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadProgress: number;
  dateAdded: string;
  addedBy: string;
  lastModified: string;
  availabilityTarget?: 'map' | 'reports';
  reportTypes?: string[];
}

type AvailabilityTarget = 'map' | 'reports';

const REPORT_AVAILABILITY_OPTIONS = [
  'Security Incidents',
  'Aid Diversion Tracker',
  'Climate Risks',
  'Programmatic Risks',
] as const;

type DocumentAvailabilitySurface = 'chats' | 'map' | 'reports';

const AVAILABILITY_FILTER_OPTIONS = [
  'All Availability',
  'Chats only',
  'Map',
  'Reports',
] as const;

const AVAILABILITY_SURFACE_LABELS: Record<DocumentAvailabilitySurface, string> = {
  chats: 'Chats',
  map: 'Map',
  reports: 'Reports',
};

const AVAILABILITY_SURFACE_STYLES: Record<DocumentAvailabilitySurface, string> = {
  chats: 'bg-sidebar-accent text-primary-text',
  map: 'bg-success-subtle text-success-text',
  reports: 'bg-warning-subtle text-warning-text',
};

function getDocumentAvailabilitySurfaces(doc: DocumentGroup): DocumentAvailabilitySurface[] {
  const surfaces: DocumentAvailabilitySurface[] = ['chats'];
  if (doc.availabilityTarget === 'map') surfaces.push('map');
  if (doc.availabilityTarget === 'reports') surfaces.push('reports');
  return surfaces;
}

function getDocumentAvailabilitySearchText(doc: DocumentGroup): string {
  return getDocumentAvailabilitySurfaces(doc)
    .map((surface) => AVAILABILITY_SURFACE_LABELS[surface])
    .join(' ');
}

function documentMatchesAvailabilityFilter(doc: DocumentGroup, filter: string): boolean {
  if (filter === 'All Availability') return true;
  const surfaces = getDocumentAvailabilitySurfaces(doc);
  if (filter === 'Chats only') return surfaces.length === 1 && surfaces[0] === 'chats';
  if (filter === 'Map') return surfaces.includes('map');
  if (filter === 'Reports') return surfaces.includes('reports');
  return true;
}

function buildDocumentAvailabilityFields(
  target: AvailabilityTarget | null,
  reportTypes: string[],
): Pick<DocumentGroup, 'availabilityTarget' | 'reportTypes'> {
  if (!target) return {};
  return {
    availabilityTarget: target,
    ...(target === 'reports' && reportTypes.length ? { reportTypes } : {}),
  };
}

function DocumentAvailabilityFields({
  availabilityTarget,
  reportAvailabilityTypes,
  onToggleTarget,
  onToggleReportType,
  variant = 'form',
}: {
  availabilityTarget: AvailabilityTarget | null;
  reportAvailabilityTypes: string[];
  onToggleTarget: (target: AvailabilityTarget) => void;
  onToggleReportType: (reportType: string) => void;
  variant?: 'form' | 'sidebar';
}) {
  const heading =
    variant === 'sidebar' ? (
      <DetailFieldLabel as="h3">
        Availability{' '}
        <span className="font-normal normal-case text-border-muted">(optional)</span>
      </DetailFieldLabel>
    ) : (
      <label className="block text-sm font-medium text-foreground mb-1.5">
        Availability <span className="font-normal text-text-subtle">(optional)</span>
      </label>
    );

  return (
    <div className={variant === 'form' ? 'pt-4 border-t border-sidebar-border' : undefined}>
      {heading}
      <p className="text-sm text-muted-foreground leading-relaxed">
        This resource will be available as AI knowledge in{' '}
        <span className="font-semibold text-secondary-foreground">Chats by Default</span>.
      </p>

      <p className="text-sm font-medium text-secondary-foreground mt-5 mb-3">Also make available to</p>

      <div className="space-y-2.5" role="radiogroup" aria-label="Additional availability">
        <button
          type="button"
          role="radio"
          aria-checked={availabilityTarget === 'map'}
          onClick={() => onToggleTarget('map')}
          className={`w-full flex items-center gap-3.5 p-4 rounded-lg border text-left transition-colors ${
            availabilityTarget === 'map'
              ? 'border-primary bg-primary-subtle/60'
              : 'border-border bg-card hover:border-border-muted hover:bg-muted'
          }`}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              availabilityTarget === 'map' ? 'border-primary bg-primary' : 'border-border-muted bg-card'
            }`}
            aria-hidden
          >
            {availabilityTarget === 'map' && <span className="h-1.5 w-1.5 rounded-full bg-card" />}
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-snug">
              <Map size={16} className="text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">Map</span>
              <span className="text-xs font-normal text-text-subtle">
                Use as data source for geospatial risk overlay.
              </span>
            </span>
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={availabilityTarget === 'reports'}
          onClick={() => onToggleTarget('reports')}
          className={`w-full flex items-center gap-3.5 p-4 rounded-lg border text-left transition-colors ${
            availabilityTarget === 'reports'
              ? 'border-primary bg-primary-subtle/60'
              : 'border-border bg-card hover:border-border-muted hover:bg-muted'
          }`}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              availabilityTarget === 'reports' ? 'border-primary bg-primary' : 'border-border-muted bg-card'
            }`}
            aria-hidden
          >
            {availabilityTarget === 'reports' && <span className="h-1.5 w-1.5 rounded-full bg-card" />}
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-snug">
              <BarChart3 size={16} className="text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">Reports</span>
              <span className="text-xs font-normal text-text-subtle">
                Use as a knowledge source for specific reports.
              </span>
            </span>
          </span>
        </button>

        {availabilityTarget === 'reports' && (
          <div className="ml-1 pl-7 sm:pl-8 border-l-2 border-sidebar-accent">
            <p className="text-sm font-medium text-foreground mb-2.5 pt-1">Select report types</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REPORT_AVAILABILITY_OPTIONS.map((reportType) => {
                const selected = reportAvailabilityTypes.includes(reportType);
                return (
                  <button
                    key={reportType}
                    type="button"
                    onClick={() => onToggleReportType(reportType)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors ${
                      selected
                        ? 'border-primary bg-primary-subtle/50 text-foreground'
                        : 'border-border bg-muted text-secondary-foreground hover:border-border-muted'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        selected ? 'bg-primary border-primary' : 'border-border-muted bg-card'
                      }`}
                    >
                      {selected && <Check size={12} className="text-white" />}
                    </span>
                    <span className="font-medium leading-snug">{reportType}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentAvailabilityBadges({
  doc,
  size = 'sm',
}: {
  doc: DocumentGroup;
  size?: 'sm' | 'md';
}) {
  const surfaces = getDocumentAvailabilitySurfaces(doc);
  const pillClass =
    size === 'md'
      ? 'px-2.5 py-1 text-xs'
      : 'px-2 py-0.5 text-xs';

  return (
    <div className="flex flex-wrap gap-1">
      {surfaces.map((surface) => (
        <span
          key={surface}
          className={`inline-flex items-center rounded-xs font-medium ${pillClass} ${AVAILABILITY_SURFACE_STYLES[surface]}`}
          title={
            surface === 'chats'
              ? 'Available as AI knowledge in Chats'
              : surface === 'map'
                ? 'Used as geospatial risk overlay data'
                : doc.reportTypes?.length
                  ? `Reports: ${doc.reportTypes.join(', ')}`
                  : 'Used as knowledge source for reports'
          }
        >
          {AVAILABILITY_SURFACE_LABELS[surface]}
        </span>
      ))}
    </div>
  );
}

function clampFileProgressPct(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function countCompletedFileUploads(doc: DocumentGroup): number {
  return doc.files.filter((f) => (f.uploadFileProgress ?? 0) >= 100).length;
}

function groupProcessingStatusLabel(status: DocumentGroup['processingStatus']): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
  }
}

/** Lucide status glyphs use this wrapper; progress rings use smaller `CIRCULAR_PROGRESS_*` so they align with 14–18px icons. */
const STATUS_ICON_INNER_BOX =
  'relative flex h-7 w-7 shrink-0 items-center justify-center';

/** 40×40 viewBox scaled down; −ml nudges ring toward STATUS column edge like other icons. */
const CIRCULAR_PROGRESS_BOX =
  'relative flex h-[22px] w-[22px] shrink-0 items-center justify-center';
const CIRCULAR_PROGRESS_BOX_OPTICAL = `${CIRCULAR_PROGRESS_BOX} -ml-[2.5px]`;
const CIRCULAR_PROGRESS_RENDER_PX = 22;

function DetailFileCircularProgress({
  percent,
  opticalMargin = true,
}: {
  percent: number;
  /** Detail table aligns ring with STATUS header; document list skips negative margin */
  opticalMargin?: boolean;
}) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const boxClass = opticalMargin ? CIRCULAR_PROGRESS_BOX_OPTICAL : CIRCULAR_PROGRESS_BOX;
  return (
    <div className={boxClass} aria-hidden>
      <svg
        width={CIRCULAR_PROGRESS_RENDER_PX}
        height={CIRCULAR_PROGRESS_RENDER_PX}
        viewBox="0 0 40 40"
        className="absolute inset-0 m-auto block -rotate-90"
      >
        <circle cx={20} cy={20} r={r} fill="none" stroke="#e8ecf0" strokeWidth={2} />
        <circle
          cx={20}
          cy={20}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
}

function DetailFileStatusCell({ file }: { file: DocumentFile }) {
  const upl = file.uploadFileProgress;
  const subline = file.uploadedAt;
  /** Tighter gap than main list so Status column in file rows stays compact. */
  const rowClass = 'flex min-w-0 w-full items-center justify-start gap-1';
  const iconWrap = `${STATUS_ICON_INNER_BOX} shrink-0`;
  const sublineCls = 'mt-0.5 truncate text-xs leading-snug text-text-subtle';

  if (upl !== undefined && upl < 100) {
    return (
      <div className={rowClass}>
        <div className={`${iconWrap} text-warning-strong`} aria-hidden>
          <Loader2 size={18} strokeWidth={2.25} className="animate-spin" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-warning-text">Uploading...</p>
          <p className={sublineCls} title={subline}>
            {subline}
          </p>
        </div>
      </div>
    );
  }

  if (upl !== undefined && upl >= 100 && (file.processingStatus ?? 'completed') === 'pending') {
    return (
      <div className={rowClass}>
        <div className={iconWrap} aria-hidden>
          <CheckCircle2 size={16} className="text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-success">Uploaded</p>
          <p className={sublineCls} title={subline}>
            {subline}
          </p>
        </div>
      </div>
    );
  }

  const status = file.processingStatus ?? 'completed';
  const pct = clampFileProgressPct(file.processingProgress ?? (status === 'completed' ? 100 : 0));

  const textCol = (
    <div className="min-w-0 flex-1">
      {status === 'completed' ? (
        <p className="text-sm font-medium leading-snug text-success">Completed</p>
      ) : status === 'failed' ? (
        <p className="text-sm font-medium leading-snug text-destructive">Failed</p>
      ) : status === 'pending' ? (
        <p className="text-sm font-medium leading-snug text-warning">Pending</p>
      ) : (
        <p className="text-sm font-medium leading-snug text-primary">
          Processing {pct}%
        </p>
      )}
      <p className={sublineCls} title={subline}>
        {subline}
      </p>
    </div>
  );

  if (status === 'completed') {
    return (
      <div className={rowClass}>
        <div className={iconWrap} aria-hidden>
          <CheckCircle2 size={16} className="text-success" />
        </div>
        {textCol}
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={rowClass}>
        <div className={iconWrap} aria-hidden>
          <AlertCircle size={16} className="text-destructive" />
        </div>
        {textCol}
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className={rowClass}>
        <div className={iconWrap} aria-hidden>
          <Clock size={16} className="text-warning" />
        </div>
        {textCol}
      </div>
    );
  }

  return (
    <div className={rowClass}>
      <DetailFileCircularProgress percent={pct} opticalMargin={false} />
      {textCol}
    </div>
  );
}

/** Same column template for header + rows so Status lines up under “Status”. */
const DETAIL_FILES_TABLE_GRID =
  'grid grid-cols-[1rem_minmax(0,1fr)_minmax(168px,200px)_108px] sm:grid-cols-[1rem_minmax(0,1fr)_minmax(184px,220px)_108px] gap-x-3 items-center';

const DETAIL_FILE_MENU_WIDTH_PX = 200;
/** Viewport-fixed menu anchored to ⋮ trigger; escapes overflow clipping on file table wrappers. */
type DetailFileMenuAnchor = {
  fileId: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

function computeDetailFileMenuFixedPosition(
  anchor: Pick<DetailFileMenuAnchor, 'top' | 'bottom' | 'left' | 'right'>,
): { top: number; left: number } {
  const EST_HEIGHT = 160;
  const GAP = 6;
  const pad = typeof window !== 'undefined' ? 8 : 0;

  let topPx = anchor.bottom + GAP;
  let leftPx = anchor.right - DETAIL_FILE_MENU_WIDTH_PX;

  if (typeof window === 'undefined') return { top: topPx, left: leftPx };

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  leftPx = Math.max(pad, Math.min(leftPx, vw - DETAIL_FILE_MENU_WIDTH_PX - pad));

  if (topPx + EST_HEIGHT > vh - pad) {
    topPx = anchor.top - EST_HEIGHT - GAP;
  }

  topPx = Math.max(pad, Math.min(topPx, vh - EST_HEIGHT - pad));

  return { top: topPx, left: leftPx };
}

const mockDocuments: DocumentGroup[] = [
  {
    id: 'demo-upload-3-of-5',
    title: 'Humanitarian Access Incident Tracker Q1 2026',
    description:
      'Incident logging, checkpoints, movement restrictions, and supporting DTM and field annexes for Q1 humanitarian access.',
    tags: ['access', 'incidents', 'dtm'],
    userGroup: 'Program Staff',
    files: [
      {
        id: 'demo.1',
        name: 'Access_Incidents_Summary_Q1.pdf',
        size: '2.1 MB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 100,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.2',
        name: 'Checkpoint_Log.xlsx',
        size: '640 KB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 100,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.3',
        name: 'Movement_Restrictions_Annex.pdf',
        size: '1.4 MB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 100,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.4',
        name: 'DTM_Flow_Monitoring.csv',
        size: '320 KB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 0,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.5',
        name: 'Field_Photos_Archive.zip',
        size: '18.2 MB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 0,
        processingStatus: 'pending',
        processingProgress: 0,
      },
    ],
    uploadStatus: 'uploading',
    processingStatus: 'pending',
    uploadProgress: 60,
    dateAdded: 'May 2, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'May 2, 2026',
    availabilityTarget: 'map',
  },
  {
    id: '1',
    title: 'OCHA Somalia Risk Assessment 2026',
    description: 'Comprehensive risk analysis covering security threats, access constraints, humanitarian needs, and operational challenges across Somalia including Al-Shabaab activities and IDP displacement patterns',
    tags: ['risk', 'ocha', 'somalia'],
    userGroup: 'All Staff',
    files: Array.from({ length: 30 }, (_, index) => {
      const fileNumber = String(index + 1).padStart(2, '0');
      const extension = index % 4 === 0 ? 'xlsx' : index % 5 === 0 ? 'docx' : 'pdf';
      const size = `${(0.8 + index * 0.3).toFixed(1)} MB`;
      const uploadedAt = `Feb ${String(index + 1).padStart(2, '0')}, 2026`;
      const roster = ['Brian Osei', 'Amina Hassan', 'Sarah Chen', 'Mohamed Ali', 'Kwame Ntumi'];
      const by = roster[index % roster.length];
      const sampleProgress = [29, 21, 44, 67, 38, 55, 71, 19, 82, 34];
      let processingStatus: DocumentFileProcessingStatus = 'completed';
      let processingProgress = 100;
      if (index === 2) {
        processingStatus = 'pending';
        processingProgress = 0;
      } else if (index === 4) {
        processingStatus = 'failed';
      } else if (index % 2 === 1) {
        processingStatus = 'processing';
        processingProgress = sampleProgress[index % sampleProgress.length];
      }
      return {
        id: `1.${index + 1}`,
        name: `Somalia_Economic_Outlook_2024_${fileNumber}.${extension}`,
        size,
        uploadedAt,
        uploadedBy: by,
        processingStatus,
        processingProgress,
      };
    }),
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 15, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Mar 15, 2026',
    availabilityTarget: 'map',
  },
  {
    id: '2',
    title: 'Humanitarian Access Incident Tracker — regional annexes',
    description: 'Detailed documentation of access incidents, checkpoint restrictions, and movement constraints affecting humanitarian operations in Somalia',
    tags: ['access', 'incidents', 'dtm'],
    userGroup: 'Program Staff',
    files: Array.from({ length: 24 }, (_, index) => {
      const fileNumber = String(index + 1).padStart(2, '0');
      const extension = index % 3 === 0 ? 'xlsx' : index % 2 === 0 ? 'docx' : 'pdf';
      const size = `${(1.0 + index * 0.2).toFixed(1)} MB`;
      return {
        id: `2.${index + 1}`,
        name: `Humanitarian_Access_Tracker_2026_${fileNumber}.${extension}`,
        size,
        uploadedAt: `Mar ${String(Math.min(index + 1, 28)).padStart(2, '0')}, 2026`
      };
    }),
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 12, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Mar 12, 2026',
    availabilityTarget: 'reports',
    reportTypes: ['Security Incidents', 'Climate Risks'],
  },
  {
    id: '3',
    title: 'IPC Food Security Phase Classification Bay & Bakool',
    description: 'Integrated Food Security Phase Classification analysis and famine risk projections for Bay and Bakool regions with recommended humanitarian interventions',
    tags: ['foodsecurity', 'ipc', 'baybakool'],
    userGroup: 'All Staff',
    files: [
      {
        id: '3.1',
        name: 'IPC_Bay_Bakool_Analysis.pdf',
        size: '2.7 MB',
        uploadedAt: 'Mar 10, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 10, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Mar 10, 2026',
    availabilityTarget: 'map',
  },
  {
    id: '4',
    title: 'OCHA Cluster Coordination Meeting Notes',
    description: 'Inter-cluster coordination meeting documentation covering protection, WASH, food security, and health sector updates with action items and resource allocation decisions',
    tags: ['meetingnotes', 'coordination', 'clusters'],
    userGroup: 'Program Staff',
    files: [
      {
        id: '4.1',
        name: 'Cluster_Meeting_Minutes_Mar2026.pdf',
        size: '892 KB',
        uploadedAt: 'Mar 8, 2026',
        uploadedBy: 'James Wilson',
      },
      {
        id: '4.2',
        name: 'Action_Items_Tracker.xlsx',
        size: '456 KB',
        uploadedAt: 'Mar 8, 2026',
        uploadedBy: 'James Wilson',
      },
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 8, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Mar 8, 2026',
  },
  {
    id: '5',
    title: 'Mogadishu IED Attack Pattern Analysis',
    description: 'Comprehensive analysis of improvised explosive device incidents in Mogadishu including attack patterns, high-risk zones, and security recommendations for humanitarian operations',
    tags: ['security', 'mogadishu', 'ied'],
    userGroup: 'Security Team',
    files: [
      {
        id: '5.1',
        name: 'IED_Pattern_Analysis_2026.pdf',
        size: '4.1 MB',
        uploadedAt: 'Mar 5, 2026'
      },
      {
        id: '5.2',
        name: 'Security_Risk_Map.pdf',
        size: '2.3 MB',
        uploadedAt: 'Mar 5, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 5, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Mar 5, 2026',
    availabilityTarget: 'reports',
    reportTypes: ['Security Incidents'],
  },
  {
    id: '6',
    title: 'Drought Impact Assessment Gedo & Hiiraan',
    description: 'Multi-sector drought impact assessment covering agricultural losses, livestock mortality, water scarcity, and displacement projections with emergency response recommendations',
    tags: ['drought', 'gedo', 'hiiraan'],
    userGroup: 'All Staff',
    files: [
      {
        id: '6.1',
        name: 'Drought_Assessment_Gedo_Hiiraan.pdf',
        size: '3.8 MB',
        uploadedAt: 'Mar 3, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 3, 2026',
    addedBy: 'Michael Brown',
    lastModified: 'Mar 3, 2026'
  },
  {
    id: '7',
    title: 'Protection Monitoring Report Lower Shabelle',
    description: 'Human rights violations, gender-based violence incidents, child protection concerns, and forced eviction documentation with protection response recommendations',
    tags: ['protection', 'gbv', 'lowershabelle'],
    userGroup: 'Program Staff',
    files: [
      {
        id: '7.1',
        name: 'Protection_Monitoring_Lower_Shabelle.pdf',
        size: '2.9 MB',
        uploadedAt: 'Feb 28, 2026'
      },
      {
        id: '7.2',
        name: 'GBV_Incident_Data.xlsx',
        size: '1.2 MB',
        uploadedAt: 'Feb 28, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 28, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Feb 28, 2026'
  },
  {
    id: '8',
    title: 'OCHA Humanitarian Needs Overview 2026',
    description: 'Comprehensive overview of humanitarian needs across Somalia including population in need figures, severity analysis, and intersectoral response priorities',
    tags: ['hno', 'humanitarian', 'ocha'],
    userGroup: 'All Staff',
    files: [
      {
        id: '8.1',
        name: 'HNO_Somalia_2026.pdf',
        size: '5.2 MB',
        uploadedAt: 'Feb 25, 2026'
      },
      {
        id: '8.2',
        name: 'Population_Figures_Analysis.xlsx',
        size: '978 KB',
        uploadedAt: 'Feb 25, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 25, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Feb 25, 2026'
  },
  {
    id: '9',
    title: 'Cholera Outbreak Response Plan Banadir',
    description: 'Emergency disease outbreak response protocol including treatment center locations, WASH interventions, vaccination campaigns, and coordination mechanisms',
    tags: ['health', 'cholera', 'banadir'],
    userGroup: 'Program Staff',
    files: [
      {
        id: '9.1',
        name: 'Cholera_Response_Plan_Banadir.pdf',
        size: '2.1 MB',
        uploadedAt: 'Feb 23, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'pending',
    uploadProgress: 100,
    dateAdded: 'Feb 23, 2026',
    addedBy: 'Emily Rodriguez',
    lastModified: 'Feb 23, 2026'
  },
  {
    id: '10',
    title: 'IDP Camp Coordination Afgooye Corridor',
    description: 'Camp management coordination documentation covering site planning, service delivery, protection concerns, and interagency coordination for IDP settlements along Afgooye corridor',
    userGroup: 'Program Staff',
    files: [
      {
        id: '10.1',
        name: 'IDP_Camp_Coordination_Report.pdf',
        size: '3.4 MB',
        uploadedAt: 'Feb 20, 2026'
      },
      {
        id: '10.2',
        name: 'Camp_Service_Mapping.xlsx',
        size: '1.5 MB',
        uploadedAt: 'Feb 20, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 20, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Feb 20, 2026'
  },
  {
    id: '11',
    title: 'Supply Chain Logistics Risk Analysis',
    description: 'Port access analysis, road insecurity mapping, checkpoint negotiations, and alternative logistics routes for humanitarian supply chain operations in Somalia',
    userGroup: 'Logistics Team',
    files: [
      {
        id: '11.1',
        name: 'Supply_Chain_Risk_Analysis.pdf',
        size: '2.8 MB',
        uploadedAt: 'Feb 18, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 18, 2026',
    addedBy: 'Michael Brown',
    lastModified: 'Feb 18, 2026'
  },
  {
    id: '12',
    title: 'Education in Emergency Assessment Galkayo',
    description: 'School infrastructure damage, teacher availability, learning materials needs, and education access barriers for conflict-affected children in Galkayo',
    userGroup: 'Program Staff',
    files: [
      {
        id: '12.1',
        name: 'Education_Assessment_Galkayo.pdf',
        size: '1.9 MB',
        uploadedAt: 'Feb 15, 2026'
      },
      {
        id: '12.2',
        name: 'School_Infrastructure_Data.xlsx',
        size: '687 KB',
        uploadedAt: 'Feb 15, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'failed',
    uploadProgress: 100,
    dateAdded: 'Feb 15, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Feb 15, 2026'
  },
  {
    id: '13',
    title: 'OCHA Humanitarian Bulletin March 2026',
    description: 'Monthly humanitarian bulletin covering situation overview, key developments, funding status, and humanitarian access challenges across Somalia',
    userGroup: 'All Staff',
    files: [
      {
        id: '13.1',
        name: 'OCHA_Bulletin_March_2026.pdf',
        size: '2.3 MB',
        uploadedAt: 'Feb 12, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 12, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Feb 12, 2026'
  },
  {
    id: '14',
    title: 'WASH Sector Coordination Documents',
    description: 'Water, sanitation, and hygiene sector coordination documents including strategic response plan, 4W mapping, and gap analysis for drought-affected regions',
    userGroup: 'WASH Team',
    files: [
      {
        id: '14.1',
        name: 'WASH_Strategy_2026.pdf',
        size: '2.6 MB',
        uploadedAt: 'Feb 10, 2026'
      },
      {
        id: '14.2',
        name: 'WASH_4W_Mapping.xlsx',
        size: '1.3 MB',
        uploadedAt: 'Feb 10, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 10, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Feb 10, 2026'
  },
  {
    id: '15',
    title: 'Community Feedback Accountability Mechanisms',
    description: 'Beneficiary feedback analysis, complaints resolution tracking, and accountability to affected populations framework with community engagement recommendations',
    userGroup: 'All Staff',
    files: [
      {
        id: '15.1',
        name: 'Community_Feedback_Report.pdf',
        size: '1.7 MB',
        uploadedAt: 'Feb 8, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 8, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Feb 8, 2026'
  },
  {
    id: '16',
    title: 'Al-Shabaab Control Areas Mapping 2026',
    description: 'Territorial control analysis, governance structures, taxation systems, and movement restrictions in Al-Shabaab controlled and contested areas',
    userGroup: 'Security Team',
    files: [
      {
        id: '16.1',
        name: 'Al_Shabaab_Control_Mapping.pdf',
        size: '4.3 MB',
        uploadedAt: 'Feb 5, 2026'
      },
      {
        id: '16.2',
        name: 'Territorial_Control_Map.pdf',
        size: '2.8 MB',
        uploadedAt: 'Feb 5, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 5, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Feb 5, 2026'
  },
  {
    id: '17',
    title: 'Nutrition Cluster 4W Activity Mapping',
    description: 'Who does What Where When mapping for nutrition interventions including therapeutic feeding programs, IYCF counseling, and nutrition surveillance activities',
    userGroup: 'Program Staff',
    files: [
      {
        id: '17.1',
        name: 'Nutrition_4W_Mapping_Q1_2026.xlsx',
        size: '2.1 MB',
        uploadedAt: 'Feb 3, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 3, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Feb 3, 2026'
  },
  {
    id: '18',
    title: 'Baidoa IDP Settlement Profile Assessment',
    description: 'Comprehensive settlement profiling covering demographics, shelter conditions, WASH access, livelihoods, and protection concerns in Baidoa IDP sites',
    userGroup: 'All Staff',
    files: [
      {
        id: '18.1',
        name: 'Baidoa_IDP_Profile_2026.pdf',
        size: '3.6 MB',
        uploadedAt: 'Jan 30, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 30, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Jan 30, 2026'
  },
  {
    id: '19',
    title: 'OCHA Flash Update Flood Response Bay Region',
    description: 'Emergency flash update on riverine flooding impact, affected populations, immediate needs, and response activities in Bay region',
    userGroup: 'All Staff',
    files: [
      {
        id: '19.1',
        name: 'Flash_Update_Bay_Floods.pdf',
        size: '1.4 MB',
        uploadedAt: 'Jan 28, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 28, 2026',
    addedBy: 'Emily Rodriguez',
    lastModified: 'Jan 28, 2026'
  },
  {
    id: '20',
    title: 'Checkpoint Negotiation Protocols South Central',
    description: 'Standard operating procedures for checkpoint negotiations, required documentation, payment protocols, and escalation procedures for South Central Somalia',
    userGroup: 'Logistics Team',
    files: [
      {
        id: '20.1',
        name: 'Checkpoint_Protocols_SC_Somalia.pdf',
        size: '1.9 MB',
        uploadedAt: 'Jan 25, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 25, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Jan 25, 2026'
  },
  {
    id: '21',
    title: 'Mental Health Psychosocial Support Service Mapping',
    description: 'MHPSS service availability, provider capacity, referral pathways, and gaps analysis for conflict and drought-affected populations',
    userGroup: 'Program Staff',
    files: [
      {
        id: '21.1',
        name: 'MHPSS_Service_Mapping_2026.pdf',
        size: '2.5 MB',
        uploadedAt: 'Jan 22, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'processing',
    uploadProgress: 21,
    dateAdded: 'Jan 22, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Jan 22, 2026'
  },
  {
    id: '22',
    title: 'Cross-Border Trade Routes Risk Assessment',
    description: 'Analysis of trade routes between Somalia, Kenya, and Ethiopia including security risks, taxation points, and humanitarian supply implications',
    userGroup: 'Management Only',
    files: [
      {
        id: '22.1',
        name: 'Cross_Border_Trade_Risk_Analysis.pdf',
        size: '3.1 MB',
        uploadedAt: 'Jan 20, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 20, 2026',
    addedBy: 'Michael Brown',
    lastModified: 'Jan 20, 2026'
  },
  {
    id: '23',
    title: 'Child Recruitment Prevention Program Evaluation',
    description: 'Evaluation of child protection interventions targeting prevention of recruitment by armed groups, family reintegration, and livelihood support',
    userGroup: 'Program Staff',
    files: [
      {
        id: '23.1',
        name: 'Child_Protection_Program_Evaluation.pdf',
        size: '2.9 MB',
        uploadedAt: 'Jan 18, 2026'
      },
      {
        id: '23.2',
        name: 'Program_Data_Analysis.xlsx',
        size: '1.4 MB',
        uploadedAt: 'Jan 18, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 18, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Jan 18, 2026'
  },
  {
    id: '24',
    title: 'Kismayo Port Operations Security Assessment',
    description: 'Port security analysis, access procedures, cargo inspection protocols, and security incident history for humanitarian logistics operations',
    userGroup: 'Logistics Team',
    files: [
      {
        id: '24.1',
        name: 'Kismayo_Port_Security_Assessment.pdf',
        size: '2.7 MB',
        uploadedAt: 'Jan 15, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 15, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Jan 15, 2026'
  },
  {
    id: '25',
    title: 'Livelihood Recovery Program Design Document',
    description: 'Program design for agricultural recovery, livestock restocking, cash for work, and vocational training targeting drought and conflict-affected communities',
    userGroup: 'Program Staff',
    files: [
      {
        id: '25.1',
        name: 'Livelihood_Program_Design.pdf',
        size: '3.8 MB',
        uploadedAt: 'Jan 12, 2026'
      },
      {
        id: '25.2',
        name: 'Budget_Breakdown.xlsx',
        size: '892 KB',
        uploadedAt: 'Jan 12, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 12, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Jan 12, 2026'
  },
  {
    id: '26',
    title: 'Measles Outbreak Vaccination Campaign Report',
    description: 'Campaign coverage analysis, vaccine uptake rates, cold chain management, community mobilization strategies, and lessons learned from measles response',
    userGroup: 'All Staff',
    files: [
      {
        id: '26.1',
        name: 'Measles_Campaign_Report_2026.pdf',
        size: '2.4 MB',
        uploadedAt: 'Jan 10, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 10, 2026',
    addedBy: 'Emily Rodriguez',
    lastModified: 'Jan 10, 2026'
  },
  {
    id: '27',
    title: 'Teacher Training Emergency Education Materials',
    description: 'Training curriculum, teaching materials, and methodologies for educators working in emergency education contexts with conflict-affected children',
    userGroup: 'Program Staff',
    files: [
      {
        id: '27.1',
        name: 'Teacher_Training_Curriculum.pdf',
        size: '4.2 MB',
        uploadedAt: 'Jan 8, 2026'
      },
      {
        id: '27.2',
        name: 'Training_Modules.pdf',
        size: '3.1 MB',
        uploadedAt: 'Jan 8, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'pending',
    uploadProgress: 100,
    dateAdded: 'Jan 8, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Jan 8, 2026'
  },
  {
    id: '28',
    title: 'OCHA Humanitarian Response Plan Mid-Year Review',
    description: 'Mid-year progress review of HRP implementation, funding gaps, strategic adjustments, and revised response priorities for second half of 2026',
    userGroup: 'All Staff',
    files: [
      {
        id: '28.1',
        name: 'HRP_Mid_Year_Review_2026.pdf',
        size: '5.1 MB',
        uploadedAt: 'Jan 5, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 5, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Jan 5, 2026'
  },
  {
    id: '29',
    title: 'Forced Eviction Monitoring Legal Framework',
    description: 'Legal analysis of eviction protections, documentation protocols, advocacy strategies, and support services for communities at risk of forced eviction',
    userGroup: 'All Staff',
    files: [
      {
        id: '29.1',
        name: 'Eviction_Monitoring_Framework.pdf',
        size: '2.6 MB',
        uploadedAt: 'Jan 3, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 3, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Jan 3, 2026'
  },
  {
    id: '30',
    title: 'Remote Area Access Drone Feasibility Study',
    description: 'Technical and operational feasibility study for using drone technology for medical supply delivery, needs assessment, and remote area monitoring',
    userGroup: 'Management Only',
    files: [
      {
        id: '30.1',
        name: 'Drone_Feasibility_Study.pdf',
        size: '3.4 MB',
        uploadedAt: 'Jan 1, 2026'
      },
      {
        id: '30.2',
        name: 'Cost_Benefit_Analysis.xlsx',
        size: '1.1 MB',
        uploadedAt: 'Jan 1, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'failed',
    uploadProgress: 100,
    dateAdded: 'Jan 1, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Jan 1, 2026'
  }
];

const userGroups = ['All Staff', 'Program Staff', 'WASH Team', 'Logistics Team', 'Security Team', 'Management Only'];
const defaultTags = ['SomaliaGBHA', 'EconomicOutlook', 'FoodSystem', 'ClimateData', 'Humanitarian'];
const DOCUMENT_TAGS_STORAGE_KEY = 'documents.availableTags';

export function Documents() {
  const normalizeTagValue = (value: string) => value.replace(/^#+/, '').replace(/\s+/g, '').trim();
  const tagEquals = (a: string, b: string) =>
    normalizeTagValue(a).toLowerCase() === normalizeTagValue(b).toLowerCase();

  const deduplicateTags = (tagValues: string[]) => {
    const seen = new Set<string>();
    return tagValues.reduce<string[]>((acc, tagValue) => {
      const normalizedTag = normalizeTagValue(tagValue);
      if (!normalizedTag) return acc;
      const lowerCased = normalizedTag.toLowerCase();
      if (seen.has(lowerCased)) return acc;
      seen.add(lowerCased);
      acc.push(normalizedTag);
      return acc;
    }, []);
  };

  const getInitialAvailableTags = () => {
    if (typeof window === 'undefined') {
      return defaultTags;
    }

    const persistedTagsRaw = window.localStorage.getItem(DOCUMENT_TAGS_STORAGE_KEY);
    let persistedTags: string[] = [];
    if (persistedTagsRaw) {
      try {
        persistedTags = JSON.parse(persistedTagsRaw) as string[];
      } catch {
        persistedTags = [];
      }
    }
    const documentTags = mockDocuments.flatMap((document) => document.tags ?? []);

    return deduplicateTags([...persistedTags, ...documentTags, ...defaultTags]);
  };

  const [documents, setDocuments] = useState<DocumentGroup[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadPage, setShowUploadPage] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DocumentGroup | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [availabilityFilter, setAvailabilityFilter] = useState('All Availability');
  const [userGroupFilter, setUserGroupFilter] = useState('All Groups');
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [tagFilterSearchQuery, setTagFilterSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAvailabilityFilterDropdown, setShowAvailabilityFilterDropdown] = useState(false);
  const [showUserGroupFilterDropdown, setShowUserGroupFilterDropdown] = useState(false);
  const [showTagFilterDropdown, setShowTagFilterDropdown] = useState(false);
  const [showBulkActionsDropdown, setShowBulkActionsDropdown] = useState(false);
  const [detailSearchQuery, setDetailSearchQuery] = useState('');
  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const [detailItemsPerPage, setDetailItemsPerPage] = useState(10);
  const [editFilesSearchQuery, setEditFilesSearchQuery] = useState('');
  const [editFilesCurrentPage, setEditFilesCurrentPage] = useState(1);
  const [editFilesItemsPerPage, setEditFilesItemsPerPage] = useState(10);
  const [selectedDetailFiles, setSelectedDetailFiles] = useState<Set<string>>(new Set());
  const [showDetailDeleteConfirm, setShowDetailDeleteConfirm] = useState(false);
  const [pendingDetailDeleteIds, setPendingDetailDeleteIds] = useState<string[]>([]);
  const [detailFileMenuAnchor, setDetailFileMenuAnchor] = useState<DetailFileMenuAnchor | null>(null);
  const [showMainDeleteConfirm, setShowMainDeleteConfirm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userGroup, setUserGroup] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>(getInitialAvailableTags);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showUserGroupDropdown, setShowUserGroupDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [availabilityTarget, setAvailabilityTarget] = useState<AvailabilityTarget | null>(null);
  const [reportAvailabilityTypes, setReportAvailabilityTypes] = useState<string[]>([]);

  // Edit form state
  const [editAvailabilityTarget, setEditAvailabilityTarget] = useState<AvailabilityTarget | null>(null);
  const [editReportAvailabilityTypes, setEditReportAvailabilityTypes] = useState<string[]>([]);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUserGroup, setEditUserGroup] = useState<string[]>([]);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editFiles, setEditFiles] = useState<DocumentFile[]>([]);
  const [newEditFiles, setNewEditFiles] = useState<File[]>([]);
  const [showEditUserGroupDropdown, setShowEditUserGroupDropdown] = useState(false);
  const [showEditTagsDropdown, setShowEditTagsDropdown] = useState(false);
  const [editTagSearchQuery, setEditTagSearchQuery] = useState('');

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const availabilityFilterDropdownRef = useRef<HTMLDivElement>(null);
  const userGroupFilterDropdownRef = useRef<HTMLDivElement>(null);
  const tagFilterDropdownRef = useRef<HTMLDivElement>(null);
  const bulkActionsDropdownRef = useRef<HTMLDivElement>(null);
  const userGroupDropdownRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const uploadTagInputRef = useRef<HTMLInputElement>(null);
  const editUserGroupDropdownRef = useRef<HTMLDivElement>(null);
  const editTagsDropdownRef = useRef<HTMLDivElement>(null);
  const editTagInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const detailFileMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const detailFileMenuPortalRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (availabilityFilterDropdownRef.current && !availabilityFilterDropdownRef.current.contains(event.target as Node)) {
        setShowAvailabilityFilterDropdown(false);
      }
      if (userGroupFilterDropdownRef.current && !userGroupFilterDropdownRef.current.contains(event.target as Node)) {
        setShowUserGroupFilterDropdown(false);
      }
      if (tagFilterDropdownRef.current && !tagFilterDropdownRef.current.contains(event.target as Node)) {
        setShowTagFilterDropdown(false);
      }
      if (bulkActionsDropdownRef.current && !bulkActionsDropdownRef.current.contains(event.target as Node)) {
        setShowBulkActionsDropdown(false);
      }
      if (userGroupDropdownRef.current && !userGroupDropdownRef.current.contains(event.target as Node)) {
        setShowUserGroupDropdown(false);
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setShowTagsDropdown(false);
      }
      if (editUserGroupDropdownRef.current && !editUserGroupDropdownRef.current.contains(event.target as Node)) {
        setShowEditUserGroupDropdown(false);
      }
      if (editTagsDropdownRef.current && !editTagsDropdownRef.current.contains(event.target as Node)) {
        setShowEditTagsDropdown(false);
      }
      if (itemsPerPageDropdownRef.current && !itemsPerPageDropdownRef.current.contains(event.target as Node)) {
        setShowItemsPerPageDropdown(false);
      }
      
      // Close all 3-dot menus (document list + detail file rows)
      const clickedInsideMenu = Object.values(menuDropdownRefs.current).some(ref => ref && ref.contains(event.target as Node));
      if (!clickedInsideMenu) {
        setOpenMenuId(null);
      }
      const clickedInsideDetailFileTrigger = Object.values(detailFileMenuRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      const clickedInsideDetailFilePortal = detailFileMenuPortalRef.current?.contains(event.target as Node);
      if (!clickedInsideDetailFileTrigger && !clickedInsideDetailFilePortal) {
        setDetailFileMenuAnchor(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!detailFileMenuAnchor) return undefined;
    const closeOnScrollOrResize = () => setDetailFileMenuAnchor(null);
    window.addEventListener('scroll', closeOnScrollOrResize, true);
    window.addEventListener('resize', closeOnScrollOrResize);
    return () => {
      window.removeEventListener('scroll', closeOnScrollOrResize, true);
      window.removeEventListener('resize', closeOnScrollOrResize);
    };
  }, [detailFileMenuAnchor]);

  useEffect(() => {
    if (!showTagFilterDropdown) {
      setTagFilterSearchQuery('');
    }
  }, [showTagFilterDropdown]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.userGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDocumentAvailabilitySearchText(doc).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags ?? []).some((tag) => normalizeTagValue(tag).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.uploadStatus === 'uploading'
        ? `uploading ${countCompletedFileUploads(doc)} of ${doc.files.length} files`
        : groupProcessingStatusLabel(doc.processingStatus)
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      doc.addedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.dateAdded.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || 
      (statusFilter === 'Uploading' && doc.uploadStatus === 'uploading') ||
      (statusFilter === 'Completed' && doc.processingStatus === 'completed') ||
      (statusFilter === 'Processing' && doc.processingStatus === 'processing') ||
      (statusFilter === 'Pending' && doc.processingStatus === 'pending' && doc.uploadStatus !== 'uploading') ||
      (statusFilter === 'Failed' && doc.processingStatus === 'failed');
    const matchesUserGroup = userGroupFilter === 'All Groups' || doc.userGroup.includes(userGroupFilter);
    const matchesAvailability = documentMatchesAvailabilityFilter(doc, availabilityFilter);
    const matchesTag =
      selectedTagFilters.length === 0 ||
      selectedTagFilters.some((selected) =>
        (doc.tags ?? []).some(
          (tag) => normalizeTagValue(tag).toLowerCase() === normalizeTagValue(selected).toLowerCase()
        )
      );
    return matchesSearch && matchesStatus && matchesAvailability && matchesUserGroup && matchesTag;
  });

  const documentTagFilterTags = deduplicateTags(documents.flatMap((doc) => doc.tags ?? []));
  const normalizedTagFilterSearch = normalizeTagValue(tagFilterSearchQuery).toLowerCase();
  const filteredTagFilterOptions = documentTagFilterTags.filter((tag) =>
    normalizeTagValue(tag).toLowerCase().includes(normalizedTagFilterSearch)
  );

  const toggleTagFilterSelection = (tagValue: string) => {
    const normalized = normalizeTagValue(tagValue);
    if (!normalized) return;
    const lower = normalized.toLowerCase();
    setSelectedTagFilters((prev) =>
      prev.some((t) => normalizeTagValue(t).toLowerCase() === lower)
        ? prev.filter((t) => normalizeTagValue(t).toLowerCase() !== lower)
        : [...prev, normalized]
    );
  };

  const tagFilterButtonLabel =
    selectedTagFilters.length === 0
      ? 'All Tags'
      : selectedTagFilters.length === 1
        ? selectedTagFilters[0]
        : `${selectedTagFilters.length} tags`;

  const normalizedTagQuery = normalizeTagValue(tagSearchQuery).toLowerCase();
  const filteredTags = availableTags.filter((tag) => normalizeTagValue(tag).toLowerCase().includes(normalizedTagQuery));
  const canCreateTag = normalizedTagQuery.length > 0 && !availableTags.some((tag) => normalizeTagValue(tag).toLowerCase() === normalizedTagQuery);

  const toggleTagSelection = (tagValue: string) => {
    const normalizedTag = normalizeTagValue(tagValue);
    if (!normalizedTag) return;

    setTags((prev) => (
      prev.includes(normalizedTag)
        ? prev.filter((tag) => tag !== normalizedTag)
        : [...prev, normalizedTag]
    ));
  };

  const createAndSelectTag = () => {
    const newTag = normalizeTagValue(tagSearchQuery);
    if (!newTag) return;

    if (!availableTags.some((tag) => normalizeTagValue(tag).toLowerCase() === newTag.toLowerCase())) {
      setAvailableTags((prev) => [newTag, ...prev]);
    }

    setTags((prev) => (prev.includes(newTag) ? prev : [...prev, newTag]));
    setTagSearchQuery('');
  };

  const normalizedEditTagQuery = normalizeTagValue(editTagSearchQuery).toLowerCase();
  const filteredEditTags = availableTags.filter((tag) => normalizeTagValue(tag).toLowerCase().includes(normalizedEditTagQuery));
  const canCreateEditTag = normalizedEditTagQuery.length > 0 && !availableTags.some((tag) => normalizeTagValue(tag).toLowerCase() === normalizedEditTagQuery);

  const toggleEditTagSelection = (tagValue: string) => {
    const normalizedTag = normalizeTagValue(tagValue);
    if (!normalizedTag) return;

    setEditTags((prev) => (
      prev.includes(normalizedTag)
        ? prev.filter((tag) => tag !== normalizedTag)
        : [...prev, normalizedTag]
    ));
  };

  const createAndSelectEditTag = () => {
    const newTag = normalizeTagValue(editTagSearchQuery);
    if (!newTag) return;

    if (!availableTags.some((tag) => normalizeTagValue(tag).toLowerCase() === newTag.toLowerCase())) {
      setAvailableTags((prev) => [newTag, ...prev]);
    }

    setEditTags((prev) => (prev.includes(newTag) ? prev : [...prev, newTag]));
    setEditTagSearchQuery('');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DOCUMENT_TAGS_STORAGE_KEY, JSON.stringify(availableTags));
  }, [availableTags]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
      // Reset input so the same file can be added again if needed
      e.target.value = '';
    }
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setNewEditFiles([...newEditFiles, ...newFiles]);
      // Reset input so the same file can be added again if needed
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleAvailabilityTarget = (target: AvailabilityTarget) => {
    setAvailabilityTarget((prev) => {
      if (prev === target) {
        if (target === 'reports') setReportAvailabilityTypes([]);
        return null;
      }
      if (target !== 'reports') setReportAvailabilityTypes([]);
      return target;
    });
  };

  const toggleReportAvailabilityType = (reportType: string) => {
    setReportAvailabilityTypes((prev) =>
      prev.includes(reportType) ? prev.filter((r) => r !== reportType) : [...prev, reportType],
    );
  };

  const toggleEditAvailabilityTarget = (target: AvailabilityTarget) => {
    setEditAvailabilityTarget((prev) => {
      if (prev === target) {
        if (target === 'reports') setEditReportAvailabilityTypes([]);
        return null;
      }
      if (target !== 'reports') setEditReportAvailabilityTypes([]);
      return target;
    });
  };

  const toggleEditReportAvailabilityType = (reportType: string) => {
    setEditReportAvailabilityTypes((prev) =>
      prev.includes(reportType) ? prev.filter((r) => r !== reportType) : [...prev, reportType],
    );
  };

  const handleUploadDocument = () => {
    if (!title.trim() || !description.trim() || !userGroup.length || !selectedFiles.length) return;

    const docId = Date.now().toString();
    const trimmedTitle = title.trim();
    const uploadedAtStamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newDocument: DocumentGroup = {
      id: docId,
      title: trimmedTitle,
      description: description.trim(),      tags,
      userGroup: userGroup.join(', '),
      files: selectedFiles.map((file, idx) => ({
        id: `${docId}-${idx}`,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: uploadedAtStamp,
        uploadedBy: 'You',
        uploadFileProgress: 0,
        processingStatus: 'pending',
        processingProgress: 0,
      })),
      uploadStatus: 'uploading',
      processingStatus: 'pending',
      uploadProgress: 0,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      addedBy: 'You',
      lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...buildDocumentAvailabilityFields(availabilityTarget, reportAvailabilityTypes),
    };

    setDocuments([newDocument, ...documents]);

    const fileCount = selectedFiles.length;
    toast.success(fileCount === 1 ? 'Uploading 1 file' : `Uploading ${fileCount} files`, {
      description: trimmedTitle,
    });

    // Simulate sequential file uploads; when all reach storage the document is Completed.
    let uploadedFileCount = 0;
    const uploadInterval = setInterval(() => {
      uploadedFileCount += 1;
      const allFilesUploaded = uploadedFileCount >= fileCount;

      if (!allFilesUploaded) {
        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id !== docId) return doc;
            const files = doc.files.map((f, i) => ({
              ...f,
              uploadFileProgress: i < uploadedFileCount ? 100 : 0,
              processingStatus: 'pending' as DocumentFileProcessingStatus,
              processingProgress: 0,
            }));
            return {
              ...doc,
              files,
              uploadProgress: Math.round((uploadedFileCount / fileCount) * 100),
              uploadStatus: 'uploading',
              processingStatus: 'pending',
            };
          })
        );
        return;
      }

      clearInterval(uploadInterval);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                uploadProgress: 100,
                uploadStatus: 'uploaded',
                processingStatus: 'completed',
                files: doc.files.map((f) => ({
                  ...f,
                  uploadFileProgress: undefined,
                  processingStatus: 'completed' as DocumentFileProcessingStatus,
                  processingProgress: 100,
                })),
              }
            : doc
        )
      );
    }, 380);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTags([]);
    setTagSearchQuery('');
    setUserGroup([]);
    setSelectedFiles([]);
    setAvailabilityTarget(null);
    setReportAvailabilityTypes([]);
    setShowTagsDropdown(false);
    setShowUploadPage(false);
  };

  const handleDeleteSelected = () => {
    const count = selectedDocuments.size;
    toast.promise(
      Promise.resolve().then(() => {
        setDocuments(documents.filter(doc => !selectedDocuments.has(doc.id)));
        setSelectedDocuments(new Set());
        setShowBulkActionsDropdown(false);
      }),
      {
        loading: `Deleting ${count} resource${count > 1 ? 's' : ''}...`,
        success: `${count} resource${count > 1 ? 's' : ''} deleted successfully.`,
        error: 'We could not delete the selected resources. Please try again.',
      }
    );
  };

  const handleBulkAction = (action: string) => {
    const count = selectedDocuments.size;
    switch (action) {
      case 'delete':
        handleDeleteSelected();
        break;
      case 'process':
        toast.success(`Processing ${count} resource${count > 1 ? 's' : ''}...`);
        setSelectedDocuments(new Set());
        setShowBulkActionsDropdown(false);
        break;
      case 'reembed':
        toast.success(`Re-embedding ${count} resource${count > 1 ? 's' : ''}...`);
        setSelectedDocuments(new Set());
        setShowBulkActionsDropdown(false);
        break;
      case 'cleanup':
        toast.success(`Cleaning up ${count} resource${count > 1 ? 's' : ''}...`);
        setSelectedDocuments(new Set());
        setShowBulkActionsDropdown(false);
        break;
      case 'rebuild':
        toast.success(`Force rebuilding ${count} resource${count > 1 ? 's' : ''}...`);
        setSelectedDocuments(new Set());
        setShowBulkActionsDropdown(false);
        break;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentPageDocuments.map(doc => doc.id));
      setSelectedDocuments(allIds);
    } else {
      setSelectedDocuments(new Set());
    }
  };

  const toggleDocumentSelection = (id: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDocuments(newSelection);
  };

  const handleDeleteDocument = (id: string) => {
    toast.promise(
      Promise.resolve().then(() => {
        setDocuments(documents.filter(doc => doc.id !== id));
        setOpenMenuId(null);
      }),
      {
        loading: 'Deleting resource...',
        success: 'Resource deleted successfully.',
        error: 'We could not delete this resource. Please try again.',
      }
    );
  };

  const openDocumentGroup = (doc: DocumentGroup) => {
    setSelectedGroup(doc);
    setDetailSearchQuery('');
    setDetailCurrentPage(1);
    setSelectedDetailFiles(new Set());
    setIsInlineEditing(false);
    setShowFullView(true);
    setOpenMenuId(null);
    setDetailFileMenuAnchor(null);
  };

  const initializeInlineEdit = (doc: DocumentGroup) => {
    setDetailFileMenuAnchor(null);
    setEditTitle(doc.title);
    setEditDescription(doc.description);
    setEditUserGroup(doc.userGroup.split(', ').filter(group => userGroups.includes(group)));
    setEditTags((doc.tags ?? []).map((tag) => normalizeTagValue(tag)).filter(Boolean));
    setEditFiles(doc.files);
    setNewEditFiles([]);
    setEditFilesSearchQuery('');
    setEditFilesCurrentPage(1);
    setEditFilesItemsPerPage(10);
    setEditAvailabilityTarget(doc.availabilityTarget ?? null);
    setEditReportAvailabilityTypes(doc.reportTypes ?? []);
    setShowEditUserGroupDropdown(false);
    setShowEditTagsDropdown(false);
    setEditTagSearchQuery('');
  };

  const toggleDetailFileSelection = (id: string) => {
    setSelectedDetailFiles((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleSelectAllDetailFiles = (checked: boolean) => {
    if (!checked) {
      setSelectedDetailFiles(new Set());
      return;
    }
    setSelectedDetailFiles(new Set(currentDetailFiles.map((file) => file.id)));
  };

  const handleDetailDownload = (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    toast.success(
      fileIds.length === 1
        ? 'Download started'
        : `Download started for ${fileIds.length} files`
    );
  };

  const handleDetailReEmbed = (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    toast.success(
      fileIds.length === 1
        ? 'Re-embedding started for file'
        : `Re-embedding started for ${fileIds.length} files`
    );
  };

  const promptDeleteDetailFiles = (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    setDetailFileMenuAnchor(null);
    setPendingDetailDeleteIds(fileIds);
    setShowDetailDeleteConfirm(true);
  };

  const confirmDeleteDetailFiles = () => {
    if (!selectedGroup || pendingDetailDeleteIds.length === 0) return;

    const deleteSet = new Set(pendingDetailDeleteIds);
    const updatedGroup: DocumentGroup = {
      ...selectedGroup,
      files: selectedGroup.files.filter((file) => !deleteSet.has(file.id)),
      lastModified: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    setDocuments((prev) =>
      prev.map((doc) => (doc.id === selectedGroup.id ? updatedGroup : doc))
    );
    setSelectedGroup(updatedGroup);
    setSelectedDetailFiles(new Set());
    setPendingDetailDeleteIds([]);
    setShowDetailDeleteConfirm(false);
    setDetailCurrentPage(1);

    const deletedCount = deleteSet.size;
    toast.success(
      deletedCount === 1
        ? 'File deleted successfully'
        : `${deletedCount} files deleted successfully`
    );
    setDetailFileMenuAnchor(null);
  };

  const confirmDeleteMainDocument = () => {
    if (!selectedGroup) return;
    const documentId = selectedGroup.id;
    handleDeleteDocument(documentId);
    setShowMainDeleteConfirm(false);
    setShowFullView(false);
    setSelectedGroup(null);
    setDetailFileMenuAnchor(null);
  };

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageDocuments = filteredDocuments.slice(startIndex, endIndex);
  const { visibleItems: visibleCurrentPageDocuments, isProgressivelyLoading } = useProgressiveList(currentPageDocuments, {
    minLoadingMs: 200,
    transitionKey: `${currentPage}-${itemsPerPage}`,
  });

  // Generate smart page numbers for pagination - Max 3 pages at a time
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show max 3 consecutive pages with ellipsis
      // Determine which group of 3 the current page belongs to
      const groupStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
      const groupEnd = Math.min(groupStart + 2, totalPages);
      
      // Add leading ellipsis if not in first group
      if (groupStart > 1) {
        pages.push('...');
      }
      
      // Add the 3 pages in current group
      for (let i = groupStart; i <= groupEnd; i++) {
        pages.push(i);
      }
      
      // Add trailing ellipsis if not in last group
      if (groupEnd < totalPages) {
        pages.push('...');
      }
    }
    
    return pages;
  };

  const getStatusIcon = (status: DocumentGroup['processingStatus']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-success" />;
      case 'processing':
        /** Main list renders `DetailFileCircularProgress` beside this branch */
        return null;
      case 'pending':
        return <Clock size={16} className="text-warning" />;
      case 'failed':
        return <AlertCircle size={16} className="text-destructive" />;
    }
  };

  const getStatusText = (status: DocumentGroup['processingStatus']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
    }
  };

  const getStatusColor = (status: DocumentGroup['processingStatus']) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'processing':
        return 'text-primary';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-destructive';
    }
  };

  const filteredDetailFiles = selectedGroup
    ? selectedGroup.files.filter((file) => {
        const q = detailSearchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          file.name.toLowerCase().includes(q) ||
          file.size.toLowerCase().includes(q) ||
          file.uploadedAt.toLowerCase().includes(q)
        );
      })
    : [];

  const detailTotalPages = Math.max(1, Math.ceil(filteredDetailFiles.length / detailItemsPerPage));
  const detailStartIndex = (detailCurrentPage - 1) * detailItemsPerPage;
  const detailEndIndex = detailStartIndex + detailItemsPerPage;
  const currentDetailFiles = filteredDetailFiles.slice(detailStartIndex, detailEndIndex);
  const { visibleItems: visibleDetailFiles, isProgressivelyLoading: isDetailProgressivelyLoading } =
    useProgressiveList(currentDetailFiles, {
      minLoadingMs: 200,
      transitionKey: `${detailCurrentPage}-${detailItemsPerPage}`,
    });

  const allEditFileRows: EditFileRow[] =
    showFullView && selectedGroup && isInlineEditing
      ? [
          ...editFiles.map((file, index) => ({ kind: 'existing' as const, file, index })),
          ...newEditFiles.map((file, index) => ({ kind: 'new' as const, file, index })),
        ]
      : [];

  const filteredEditFileRows = allEditFileRows.filter((row) => {
    const q = editFilesSearchQuery.toLowerCase().trim();
    if (!q) return true;
    if (row.kind === 'existing') {
      return (
        row.file.name.toLowerCase().includes(q) ||
        row.file.size.toLowerCase().includes(q) ||
        row.file.uploadedAt.toLowerCase().includes(q)
      );
    }
    return (
      row.file.name.toLowerCase().includes(q) ||
      formatFileSize(row.file.size).toLowerCase().includes(q)
    );
  });

  const editFileTotalPages = Math.max(1, Math.ceil(filteredEditFileRows.length / editFilesItemsPerPage));
  const editFileStartIndex = (editFilesCurrentPage - 1) * editFilesItemsPerPage;
  const editFileEndIndex = editFileStartIndex + editFilesItemsPerPage;
  const currentEditFileRows = filteredEditFileRows.slice(editFileStartIndex, editFileEndIndex);

  const { visibleItems: visibleEditFileRows, isProgressivelyLoading: isEditFileProgressivelyLoading } =
    useProgressiveList(currentEditFileRows, {
      minLoadingMs: 200,
      transitionKey: `${editFilesCurrentPage}-${editFilesItemsPerPage}-${editFilesSearchQuery}`,
    });

  useEffect(() => {
    setEditFilesCurrentPage((prev) => Math.min(prev, editFileTotalPages));
  }, [editFileTotalPages]);

  if (showFullView && selectedGroup && isInlineEditing) {
    return (
      <div className="h-full flex flex-col bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 pt-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
              <PageBreadcrumb
                className="mb-4"
                items={[
                  {
                    label: 'Resources',
                    onClick: () => {
                      setShowFullView(false);
                      setSelectedGroup(null);
                      setIsInlineEditing(false);
                      setDetailFileMenuAnchor(null);
                    },
                  },
                  { label: editTitle.trim() || selectedGroup.title },
                ]}
              />

              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full text-2xl font-semibold text-foreground bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <DetailSectionTitle as="h3">Description</DetailSectionTitle>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Describe the resource content and purpose"
                      rows={4}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-base text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <DetailSectionTitle as="h3" className="mb-0">
                        Files
                      </DetailSectionTitle>
                      <span className="text-sm text-muted-foreground">
                        {editFiles.length + newEditFiles.length} file{editFiles.length + newEditFiles.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={editFilesSearchQuery}
                        onChange={(e) => {
                          setEditFilesSearchQuery(e.target.value);
                          setEditFilesCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    {currentEditFileRows.length > 0 && (
                      <div className="border-t border-border overflow-x-auto mb-5">
                        {isEditFileProgressivelyLoading ? (
                          <TableSkeleton
                            variant="detailFiles"
                            rows={Math.max(currentEditFileRows.length, 1)}
                          />
                        ) : (
                          <div className="min-w-[min(100%,720px)]">
                            <div
                              className={`${DETAIL_FILES_TABLE_GRID} min-h-10 py-2 border-b border-border table-header-label bg-muted/70`}
                              role="row"
                            >
                              <div className="flex items-center justify-center">
                                <div className="h-4 w-4 shrink-0" aria-hidden />
                              </div>
                              <div className="min-w-0" role="columnheader">
                                Document
                              </div>
                              <div className="min-w-0" role="columnheader">
                                Status
                              </div>
                              <div className="flex min-w-0 items-center justify-end pr-0.5" role="columnheader">
                                Actions
                              </div>
                            </div>
                            <div className="divide-y divide-border">
                              {visibleEditFileRows.map((row) => (
                                <div
                                  key={
                                    row.kind === 'existing'
                                      ? row.file.id
                                      : `new-${row.index}-${row.file.name}`
                                  }
                                  className={`${DETAIL_FILES_TABLE_GRID} table-row-entity bg-card transition-colors`}
                                  role="row"
                                >
                                  <div className="flex items-center justify-center" aria-hidden>
                                    <div className="h-4 w-4 shrink-0" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="table-primary-text truncate">{row.file.name}</p>
                                    <p className="table-supporting-text mt-0.5">
                                      {row.kind === 'existing'
                                        ? `${row.file.size} · Uploaded ${row.file.uploadedAt}`
                                        : `${formatFileSize(row.file.size)} · New file`}
                                    </p>
                                  </div>
                                  <div className="min-w-0">
                                    {row.kind === 'existing' ? (
                                      <DetailFileStatusCell file={row.file} />
                                    ) : (
                                      <div className="flex min-w-0 w-full items-center justify-start gap-1">
                                        <div
                                          className="relative flex h-7 w-7 shrink-0 items-center justify-center text-primary"
                                          aria-hidden
                                        >
                                          <FileText size={16} strokeWidth={2} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="table-primary-text text-primary">
                                            New file
                                          </p>
                                          <p className="table-metadata-text mt-0.5 truncate">
                                            Added in this edit
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (row.kind === 'existing') {
                                          setEditFiles(editFiles.filter((_, i) => i !== row.index));
                                        } else {
                                          setNewEditFiles(newEditFiles.filter((_, i) => i !== row.index));
                                        }
                                      }}
                                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive-subtle hover:text-destructive-text"
                                      title="Remove file"
                                      aria-label={`Remove ${row.kind === 'existing' ? row.file.name : row.file.name}`}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {currentEditFileRows.length === 0 && allEditFileRows.length > 0 && (
                      <div className="mb-5 py-10 text-center text-sm text-muted-foreground">
                        No files found
                      </div>
                    )}
                    {allEditFileRows.length === 0 && (
                      <div className="mb-5 py-6 text-center text-sm text-muted-foreground">
                        No files yet. Upload files below.
                      </div>
                    )}
                    {filteredEditFileRows.length > 0 && (
                      <div className="mb-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Show</span>
                          <select
                            value={editFilesItemsPerPage}
                            onChange={(e) => {
                              setEditFilesItemsPerPage(Number(e.target.value));
                              setEditFilesCurrentPage(1);
                            }}
                            className="px-2 py-1 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
                          >
                            {[10, 20, 30, 50].map((count) => (
                              <option key={count} value={count}>
                                {count}
                              </option>
                            ))}
                          </select>
                          <span>per page</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {isEditFileProgressivelyLoading
                              ? 'Loading...'
                              : `${editFileStartIndex + 1}-${Math.min(editFileEndIndex, filteredEditFileRows.length)} of ${filteredEditFileRows.length}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditFilesCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={editFilesCurrentPage === 1}
                            className={`px-2 py-1 rounded-lg text-sm ${
                              editFilesCurrentPage === 1
                                ? 'text-border-muted cursor-not-allowed'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            Previous
                          </button>
                          <span className="text-sm text-muted-foreground">{editFilesCurrentPage}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditFilesCurrentPage((prev) => Math.min(editFileTotalPages, prev + 1))
                            }
                            disabled={editFilesCurrentPage === editFileTotalPages}
                            className={`px-2 py-1 rounded-lg text-sm ${
                              editFilesCurrentPage === editFileTotalPages
                                ? 'text-border-muted cursor-not-allowed'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        onChange={handleEditFileSelect}
                        className="hidden"
                        id="file-upload-edit"
                        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                        multiple
                      />
                      <label
                        htmlFor="file-upload-edit"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload size={28} className="text-text-subtle mb-2" />
                        <span className="text-sm font-medium text-primary">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-text-subtle mt-1">
                          PDF, DOC, DOCX, TXT, XLSX (max 10MB)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <div>
                      <DetailFieldLabel as="h3">User Group</DetailFieldLabel>
                      <div className="relative" ref={editUserGroupDropdownRef}>
                        <button
                          onClick={() => {
                            setShowEditUserGroupDropdown(!showEditUserGroupDropdown);
                          }}
                          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-left hover:bg-muted transition-colors flex items-center justify-between"
                        >
                          <span className={editUserGroup.length > 0 ? 'text-foreground font-medium' : 'text-text-subtle'}>
                            {editUserGroup.length > 0 ? editUserGroup.join(', ') : 'Select user group'}
                          </span>
                          <ChevronDown size={16} className={`text-text-subtle transition-transform ${showEditUserGroupDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showEditUserGroupDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {userGroups.map((group) => (
                              <button
                                key={group}
                                onClick={() => {
                                  setEditUserGroup(prev =>
                                    prev.includes(group)
                                      ? prev.filter(g => g !== group)
                                      : [...prev, group]
                                  );
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  editUserGroup.includes(group)
                                    ? 'bg-primary border-primary'
                                    : 'border-border-muted'
                                }`}>
                                  {editUserGroup.includes(group) && <Check size={12} className="text-white" />}
                                </div>
                                <span className="flex-1">{group}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <DetailFieldLabel as="h3">Tags</DetailFieldLabel>
                      <div className="relative" ref={editTagsDropdownRef}>
                        <div
                          role="presentation"
                          data-composite-field
                          className={`flex w-full cursor-text flex-wrap items-center gap-1.5 min-h-[42px] rounded-lg border bg-card px-2 py-1.5 transition-colors ${
                            showEditTagsDropdown ? 'border-primary' : 'border-border'
                          } focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/10`}
                          onClick={() => {
                            setShowEditTagsDropdown(true);
                            setShowEditUserGroupDropdown(false);
                            editTagInputRef.current?.focus();
                          }}
                        >
                          {editTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex max-w-[220px] items-center gap-0.5 rounded-xs bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-primary-text"
                          >
                            <span className="truncate">{normalizeTagValue(tag)}</span>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEditTagSelection(tag);
                              }}
                                className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label={`Remove ${normalizeTagValue(tag)}`}
                                title="Remove tag"
                              >
                                <X size={12} strokeWidth={2} />
                              </button>
                            </span>
                          ))}
                          <input
                            ref={editTagInputRef}
                            type="text"
                            value={editTagSearchQuery}
                            onFocus={() => {
                              setShowEditTagsDropdown(true);
                            setShowEditUserGroupDropdown(false);
                            }}
                            onChange={(e) => {
                              setEditTagSearchQuery(e.target.value);
                              if (!showEditTagsDropdown) setShowEditTagsDropdown(true);
                            }}
                            placeholder={editTags.length === 0 ? 'Search or create tags...' : 'Add more tags...'}
                            className="focus-ring-container-control min-w-[140px] flex-1 border-0 bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-text-subtle focus:outline-none focus:ring-0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && canCreateEditTag) {
                                e.preventDefault();
                                createAndSelectEditTag();
                              }
                            }}
                          />
                        </div>
                        {showEditTagsDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                            <div className="max-h-52 overflow-y-auto">
                              {canCreateEditTag && (
                                <button
                                  onClick={createAndSelectEditTag}
                                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-sidebar-border"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-info-subtle text-info flex items-center justify-center text-xl leading-none">
                                    +
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      Create tag <span className="text-primary">{normalizeTagValue(editTagSearchQuery)}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">Press Enter to create</p>
                                  </div>
                                </button>
                              )}
                              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted border-b border-border">
                                Select from existing tags
                              </p>
                              {filteredEditTags.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => toggleEditTagSelection(tag)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    editTags.some((t) => tagEquals(t, tag))
                                      ? 'bg-primary border-primary'
                                      : 'border-border-muted'
                                  }`}>
                                    {editTags.some((t) => tagEquals(t, tag)) && (
                                      <Check size={12} className="text-white" />
                                    )}
                                  </div>
                                  <span className="text-foreground">{normalizeTagValue(tag)}</span>
                                </button>
                              ))}
                              {filteredEditTags.length === 0 && !canCreateEditTag && (
                                <p className="px-4 py-4 text-sm text-muted-foreground">No tags found.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <DocumentAvailabilityFields
                      variant="sidebar"
                      availabilityTarget={editAvailabilityTarget}
                      reportAvailabilityTypes={editReportAvailabilityTypes}
                      onToggleTarget={toggleEditAvailabilityTarget}
                      onToggleReportType={toggleEditReportAvailabilityType}
                    />

                    <div>
                      <DetailFieldLabel as="h3">Created</DetailFieldLabel>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar size={18} className="text-muted-foreground" />
                        {selectedGroup.dateAdded}
                      </div>
                    </div>

                    <div>
                      <DetailFieldLabel as="h3">Last Modified</DetailFieldLabel>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock size={18} className="text-muted-foreground" />
                        {selectedGroup.lastModified}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const { availabilityTarget: _prevTarget, reportTypes: _prevReports, ...docRest } =
                          selectedGroup;
                        const updatedDocument: DocumentGroup = {
                          ...docRest,
                          title: editTitle.trim(),
                          description: editDescription.trim(),
                          userGroup: editUserGroup.join(', '),
                          tags: editTags,
                          files: [
                            ...editFiles,
                            ...newEditFiles.map((file, addIdx) => ({
                              id: `${selectedGroup.id}-add-${Date.now()}-${addIdx}`,
                              name: file.name,
                              size: formatFileSize(file.size),
                              uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                              uploadedBy: 'You',
                              processingStatus: 'processing' satisfies DocumentFileProcessingStatus,
                              processingProgress: Math.min(45 + addIdx * 7, 88),
                            })),
                          ],
                          lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          ...buildDocumentAvailabilityFields(editAvailabilityTarget, editReportAvailabilityTypes),
                        };

                        setDocuments(documents.map(doc =>
                          doc.id === selectedGroup.id
                            ? updatedDocument
                            : doc
                        ));
                        setSelectedGroup(updatedDocument);
                        setIsInlineEditing(false);
                        toast.success('Document updated successfully');
                      }}
                      disabled={!editTitle.trim() || !editDescription.trim() || !editUserGroup.length || (editFiles.length === 0 && newEditFiles.length === 0)}
                      className={`w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        editTitle.trim() && editDescription.trim() && editUserGroup.length && (editFiles.length > 0 || newEditFiles.length > 0)
                          ? 'bg-primary hover:bg-primary-hover text-white'
                          : 'bg-muted text-text-subtle cursor-not-allowed'
                      }`}
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() => {
                        initializeInlineEdit(selectedGroup);
                        setIsInlineEditing(false);
                      }}
                      className="w-full px-4 py-3 border border-border hover:bg-muted rounded-lg text-base font-medium text-muted-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <PageFooter />
          </div>
        </div>
      </div>
    );
  }

  // Full page view
  if (showFullView && selectedGroup) {
    const detailFileMenuPortalFile =
      detailFileMenuAnchor !== null
        ? selectedGroup.files.find((f) => f.id === detailFileMenuAnchor.fileId)
        : undefined;
    const detailFileMenuPortalPos = detailFileMenuAnchor
      ? computeDetailFileMenuFixedPosition(detailFileMenuAnchor)
      : null;

    return (
      <div className="h-full flex flex-col bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 pt-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
              <PageBreadcrumb
                className="mb-4"
                items={[
                  {
                    label: 'Resources',
                    onClick: () => {
                      setShowFullView(false);
                      setSelectedGroup(null);
                      setIsInlineEditing(false);
                      setDetailFileMenuAnchor(null);
                    },
                  },
                  { label: selectedGroup.title },
                ]}
              />

              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {selectedGroup.title}
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Description and Files */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <DetailSectionTitle as="h3">Description</DetailSectionTitle>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedGroup.description}
                    </p>
                  </div>

                  {/* Documents */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <DetailSectionTitle as="h3" className="mb-0">
                        Files
                      </DetailSectionTitle>
                      <span className="text-sm text-muted-foreground">
                        {selectedGroup.files.length} file{selectedGroup.files.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={detailSearchQuery}
                        onChange={(e) => {
                          setDetailSearchQuery(e.target.value);
                          setDetailCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={currentDetailFiles.length > 0 && currentDetailFiles.every((file) => selectedDetailFiles.has(file.id))}
                          onChange={(e) => handleSelectAllDetailFiles(e.target.checked)}
                          className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-ring"
                        />
                        Select all on this page
                      </label>
                      {selectedDetailFiles.size > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-secondary-foreground">
                            {selectedDetailFiles.size} selected
                          </span>
                          <button
                            onClick={() => handleDetailDownload(Array.from(selectedDetailFiles))}
                            className="px-3 py-1.5 text-sm border border-primary text-primary-text bg-primary-subtle rounded-lg hover:bg-sidebar-accent transition-colors flex items-center gap-1.5"
                          >
                            <Download size={14} />
                            Download
                          </button>
                          <button
                            onClick={() => handleDetailReEmbed(Array.from(selectedDetailFiles))}
                            className="px-3 py-1.5 text-sm border border-border-muted text-secondary-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5"
                          >
                            <RefreshCcw size={14} />
                            Re-embed
                          </button>
                          <button
                            onClick={() => promptDeleteDetailFiles(Array.from(selectedDetailFiles))}
                            className="px-3 py-1.5 text-sm border border-destructive text-destructive-text bg-destructive-subtle rounded-lg hover:bg-destructive-subtle transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {currentDetailFiles.length > 0 && (
                      <div className="border-t border-border overflow-x-auto">
                        {isDetailProgressivelyLoading ? (
                          <TableSkeleton
                            variant="detailFiles"
                            rows={Math.max(currentDetailFiles.length, 1)}
                          />
                        ) : (
                          <div className="min-w-[min(100%,720px)]">
                            <div
                              className={`${DETAIL_FILES_TABLE_GRID} min-h-10 py-2 border-b border-border table-header-label bg-muted/70`}
                              role="row"
                            >
                              <div className="flex items-center justify-center">
                                <div className="h-4 w-4 shrink-0" aria-hidden />
                              </div>
                              <div className="min-w-0" role="columnheader">
                                Document
                              </div>
                              <div className="min-w-0" role="columnheader">
                                Status
                              </div>
                              <div className="flex min-w-0 items-center justify-end pr-0.5" role="columnheader">
                                Actions
                              </div>
                            </div>
                            <div className="divide-y divide-border">
                              {visibleDetailFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className={`${DETAIL_FILES_TABLE_GRID} table-row-entity bg-card transition-colors`}
                                  role="row"
                                >
                                  <div className="flex items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedDetailFiles.has(file.id)}
                                      onChange={() => toggleDetailFileSelection(file.id)}
                                      className="h-4 w-4 shrink-0 rounded border-checkbox-unchecked text-primary focus:ring-ring"
                                      aria-label={`Select ${file.name}`}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="table-primary-text truncate">
                                      {file.name}
                                    </p>
                                    <p className="table-supporting-text mt-0.5">
                                      {file.size} · Uploaded {file.uploadedAt}
                                    </p>
                                  </div>
                                  <div className="min-w-0">
                                    <DetailFileStatusCell file={file} />
                                  </div>
                                  <div
                                    className="relative flex items-center justify-end"
                                    ref={(el) => {
                                      detailFileMenuRefs.current[file.id] = el;
                                    }}
                                  >
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const btn = e.currentTarget;
                                          const rect = btn.getBoundingClientRect();
                                          setDetailFileMenuAnchor((prev) =>
                                            prev?.fileId === file.id
                                              ? null
                                              : {
                                                  fileId: file.id,
                                                  top: rect.top,
                                                  bottom: rect.bottom,
                                                  left: rect.left,
                                                  right: rect.right,
                                                },
                                          );
                                        }}
                                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
                                        aria-expanded={detailFileMenuAnchor?.fileId === file.id}
                                        aria-haspopup="menu"
                                        aria-label={`Actions for ${file.name}`}
                                        title="Actions"
                                      >
                                        <MoreVertical size={18} />
                                      </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {currentDetailFiles.length === 0 && (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        No files found
                      </div>
                    )}
                    {filteredDetailFiles.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Show</span>
                          <select
                            value={detailItemsPerPage}
                            onChange={(e) => {
                              setDetailItemsPerPage(Number(e.target.value));
                              setDetailCurrentPage(1);
                            }}
                            className="px-2 py-1 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
                          >
                            {[10, 20, 30, 50].map((count) => (
                              <option key={count} value={count}>
                                {count}
                              </option>
                            ))}
                          </select>
                          <span>per page</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {isDetailProgressivelyLoading
                              ? 'Loading...'
                              : `${detailStartIndex + 1}-${Math.min(detailEndIndex, filteredDetailFiles.length)} of ${filteredDetailFiles.length}`}
                          </span>
                          <button
                            onClick={() => setDetailCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={detailCurrentPage === 1}
                            className={`px-2 py-1 rounded-lg text-sm ${
                              detailCurrentPage === 1
                                ? 'text-border-muted cursor-not-allowed'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            Previous
                          </button>
                          <span className="text-sm text-muted-foreground">
                            {detailCurrentPage}
                          </span>
                          <button
                            onClick={() => setDetailCurrentPage((prev) => Math.min(detailTotalPages, prev + 1))}
                            disabled={detailCurrentPage === detailTotalPages}
                            className={`px-2 py-1 rounded-lg text-sm ${
                              detailCurrentPage === detailTotalPages
                                ? 'text-border-muted cursor-not-allowed'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column - Metadata and Actions */}
                <div className="space-y-6">
                  {/* Combined Metadata Card */}
                  <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    {/* Availability */}
                    <div>
                      <DetailFieldLabel as="h3">Available in</DetailFieldLabel>
                      <DocumentAvailabilityBadges doc={selectedGroup} size="md" />
                      {selectedGroup.availabilityTarget === 'reports' && (selectedGroup.reportTypes?.length ?? 0) > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Report types: {selectedGroup.reportTypes!.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* User Group */}
                    <div>
                      <DetailFieldLabel as="h3">User Group</DetailFieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {selectedGroup.userGroup.split(', ').map((group, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-success-subtle text-success-text rounded-lg text-sm font-medium"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedGroup.tags && selectedGroup.tags.length > 0 && (
                      <div>
                        <DetailFieldLabel as="h3">Tags</DetailFieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {selectedGroup.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-sidebar-accent text-primary-text rounded-lg text-sm font-medium"
                            >
                              {normalizeTagValue(tag)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Created */}
                    <div>
                      <DetailFieldLabel as="h3">Created</DetailFieldLabel>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar size={18} className="text-muted-foreground" />
                        {selectedGroup.dateAdded}
                      </div>
                    </div>

                    {/* Last Modified */}
                    <div>
                      <DetailFieldLabel as="h3">Last Modified</DetailFieldLabel>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock size={18} className="text-muted-foreground" />
                        {selectedGroup.lastModified}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        initializeInlineEdit(selectedGroup);
                        setIsInlineEditing(true);
                      }}
                      className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} />
                      Edit Resource
                    </button>
                    <button
                      onClick={() => {
                        setShowMainDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-3 border border-border hover:bg-destructive-subtle hover:border-destructive text-destructive-text rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showDetailDeleteConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1500] p-4">
              <div className="bg-card rounded-xl max-w-[460px] w-full shadow-2xl">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">Delete file{pendingDetailDeleteIds.length > 1 ? 's' : ''}?</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pendingDetailDeleteIds.length > 1
                      ? `Are you sure you want to delete ${pendingDetailDeleteIds.length} files? This action cannot be undone.`
                      : 'Are you sure you want to delete this file? This action cannot be undone.'}
                  </p>
                </div>
                <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDetailDeleteConfirm(false);
                      setPendingDetailDeleteIds([]);
                    }}
                    className="px-4 py-2.5 border border-border hover:bg-muted rounded-lg text-sm font-medium text-muted-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteDetailFiles}
                    className="px-4 py-2.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {showMainDeleteConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1500] p-4">
              <div className="bg-card rounded-xl max-w-[460px] w-full shadow-2xl">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">Delete resource?</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Are you sure you want to delete this resource? This action cannot be undone.
                  </p>
                  <p className="text-sm font-medium text-foreground mt-2">
                    {selectedGroup.title}
                  </p>
                </div>
                <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowMainDeleteConfirm(false)}
                    className="px-4 py-2.5 border border-border hover:bg-muted rounded-lg text-sm font-medium text-muted-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteMainDocument}
                    className="px-4 py-2.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {typeof document !== 'undefined' &&
            detailFileMenuAnchor &&
            detailFileMenuPortalFile &&
            detailFileMenuPortalPos &&
            createPortal(
              <div
                ref={detailFileMenuPortalRef}
                role="menu"
                className="fixed z-[1700] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg shadow-black/10"
                style={{
                  top: detailFileMenuPortalPos.top,
                  left: detailFileMenuPortalPos.left,
                  width: DETAIL_FILE_MENU_WIDTH_PX,
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailFileMenuAnchor(null);
                    handleDetailDownload([detailFileMenuPortalFile.id]);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted first:pt-3"
                >
                  <Download size={16} className="shrink-0 text-info" />
                  Download
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailFileMenuAnchor(null);
                    handleDetailReEmbed([detailFileMenuPortalFile.id]);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <RefreshCcw size={16} className="shrink-0 text-secondary-foreground" />
                  Re-embed
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailFileMenuAnchor(null);
                    promptDeleteDetailFiles([detailFileMenuPortalFile.id]);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 pb-3 text-left text-sm text-destructive-text transition-colors hover:bg-destructive-subtle"
                >
                  <Trash2 size={16} className="shrink-0 text-destructive-text" />
                  Delete
                </button>
              </div>,
              document.body,
            )}
            <PageFooter />
        </div>
      </div>
    );
  }

  if (showUploadPage) {
    return (
      <div className="h-full flex flex-col bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 pt-6">
            <div className="max-w-[900px] mx-auto space-y-6">
              <PageBreadcrumb
                className="mb-4"
                items={[
                  { label: 'Resources', onClick: () => setShowUploadPage(false) },
                  { label: 'Add New Resource' },
                ]}
              />

              <div>
                <h1 className="text-xl font-semibold text-foreground leading-tight">Add New Resource</h1>
                <p className="text-base text-muted-foreground mt-1">
                  Provide resource details and upload content to your workspace repository.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border">
                <div className="p-6 sm:p-8 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the resource content and purpose"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {/* User Group */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      User Group Access
                    </label>
                    <div className="relative" ref={userGroupDropdownRef}>
                      <button
                        onClick={() => {
                          setShowUserGroupDropdown(!showUserGroupDropdown);
                          setShowTagsDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-left hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <span className={userGroup.length > 0 ? 'text-foreground font-medium' : 'text-text-subtle'}>
                          {userGroup.length > 0 ? userGroup.join(', ') : 'Select user group'}
                        </span>
                        <ChevronDown size={16} className={`text-text-subtle transition-transform ${showUserGroupDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showUserGroupDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {userGroups.map((group) => (
                            <button
                              key={group}
                              onClick={() => {
                                setUserGroup(prev =>
                                  prev.includes(group)
                                    ? prev.filter(g => g !== group)
                                    : [...prev, group]
                                );
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                userGroup.includes(group) ? 'bg-primary border-primary' : 'border-border-muted'
                              }`}>
                                {userGroup.includes(group) && <Check size={12} className="text-white" />}
                              </div>
                              <span className="flex-1">{group}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                    <div className="relative" ref={tagsDropdownRef}>
                      <div
                        role="presentation"
                        data-composite-field
                        className={`flex w-full cursor-text flex-wrap items-center gap-1.5 min-h-[42px] rounded-lg border bg-card px-2 py-1.5 transition-colors ${
                          showTagsDropdown ? 'border-primary' : 'border-border'
                        } focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/10`}
                        onClick={() => {
                          setShowTagsDropdown(true);
                          setShowUserGroupDropdown(false);
                          uploadTagInputRef.current?.focus();
                        }}
                      >
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex max-w-[220px] items-center gap-0.5 rounded-xs bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-primary-text"
                          >
                            <span className="truncate">{normalizeTagValue(tag)}</span>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTagSelection(tag);
                              }}
                              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Remove ${normalizeTagValue(tag)}`}
                              title="Remove tag"
                            >
                              <X size={12} strokeWidth={2} />
                            </button>
                          </span>
                        ))}
                        <input
                          ref={uploadTagInputRef}
                          type="text"
                          value={tagSearchQuery}
                          onFocus={() => {
                            setShowTagsDropdown(true);
                            setShowUserGroupDropdown(false);
                          }}
                          onChange={(e) => {
                            setTagSearchQuery(e.target.value);
                            if (!showTagsDropdown) setShowTagsDropdown(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && canCreateTag) {
                              e.preventDefault();
                              createAndSelectTag();
                            }
                          }}
                          placeholder={tags.length === 0 ? 'Search or create tags...' : 'Add more tags...'}
                          className="focus-ring-container-control min-w-[140px] flex-1 border-0 bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-text-subtle focus:outline-none focus:ring-0"
                        />
                      </div>
                      {showTagsDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                          <div className="max-h-52 overflow-y-auto">
                            {canCreateTag && (
                              <button onClick={createAndSelectTag} className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-sidebar-border">
                                <div className="w-8 h-8 rounded-lg bg-info-subtle text-info flex items-center justify-center text-xl leading-none">+</div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">Create tag <span className="text-primary">{normalizeTagValue(tagSearchQuery)}</span></p>
                                  <p className="text-sm text-muted-foreground">Press Enter to create</p>
                                </div>
                              </button>
                            )}
                            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted border-b border-border">
                              Select from existing tags
                            </p>
                            {filteredTags.map((tag) => (
                              <button key={tag} onClick={() => toggleTagSelection(tag)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${tags.some((t) => tagEquals(t, tag)) ? 'bg-primary border-primary' : 'border-border-muted'}`}>
                                  {tags.some((t) => tagEquals(t, tag)) && <Check size={12} className="text-white" />}
                                </div>
                                <span className="text-foreground">{normalizeTagValue(tag)}</span>
                              </button>
                            ))}
                            {filteredTags.length === 0 && !canCreateTag && (
                              <p className="px-4 py-4 text-sm text-muted-foreground">No tags found.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Files</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <input type="file" onChange={handleFileSelect} className="hidden" id="file-upload" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls" multiple />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload size={32} className="text-text-subtle mb-2" />
                        <span className="text-sm font-medium text-primary">Click to Upload</span>
                        <span className="text-sm text-muted-foreground">or drag and drop</span>
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg">
                            <FileText size={18} className="text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                              <p className="text-xs text-text-subtle">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                              onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                              className="p-1.5 hover:bg-destructive-subtle rounded-lg transition-colors shrink-0"
                              title="Remove file"
                            >
                              <X size={16} className="text-muted-foreground hover:text-destructive-text" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <DocumentAvailabilityFields
                    variant="form"
                    availabilityTarget={availabilityTarget}
                    reportAvailabilityTypes={reportAvailabilityTypes}
                    onToggleTarget={toggleAvailabilityTarget}
                    onToggleReportType={toggleReportAvailabilityType}
                  />

                
                </div>

                <div className="p-6 sm:px-8 border-t border-border flex justify-end gap-3">
                  <button
                    onClick={() => setShowUploadPage(false)}
                    className="px-4 py-2.5 border border-border hover:bg-muted rounded-lg text-sm font-medium text-muted-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadDocument}
                    disabled={!title.trim() || !description.trim() || !userGroup.length || !selectedFiles.length}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      title.trim() && description.trim() && userGroup.length && selectedFiles.length
                        ? 'bg-primary hover:bg-primary-hover text-white'
                        : 'bg-muted text-text-subtle cursor-not-allowed'
                    }`}
                  >
                    Upload Resource
                  </button>
                </div>
              </div>
            </div>
            <PageFooter />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-page-title mb-1">Resources</h2>
                <p className="text-sm sm:text-sm text-muted-foreground">
                  Upload and manage knowledge base resources for AI chat
                </p>
              </div>
              <button 
                onClick={() => setShowUploadPage(true)}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus size={18} />
                Upload Resource
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
                />
              </div>

                {/* Status Filter Dropdown */}
                <div className="relative" ref={statusDropdownRef}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {statusFilter}
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                      {['All Status', 'Uploading', 'Completed', 'Processing', 'Pending', 'Failed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability Filter Dropdown */}
                <div className="relative" ref={availabilityFilterDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowAvailabilityFilterDropdown(!showAvailabilityFilterDropdown)}
                    className={`px-4 py-2.5 border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                      showAvailabilityFilterDropdown || availabilityFilter !== 'All Availability'
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {availabilityFilter}
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground transition-transform ${showAvailabilityFilterDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showAvailabilityFilterDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-lg z-10">
                      {AVAILABILITY_FILTER_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setAvailabilityFilter(option);
                            setShowAvailabilityFilterDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            availabilityFilter === option ? 'text-primary font-medium bg-muted' : 'text-foreground'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Group Filter Dropdown */}
                <div className="relative" ref={userGroupFilterDropdownRef}>
                  <button
                    onClick={() => setShowUserGroupFilterDropdown(!showUserGroupFilterDropdown)}
                    className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {userGroupFilter}
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showUserGroupFilterDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showUserGroupFilterDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                      {['All Groups', ...userGroups].map((group) => (
                        <button
                          key={group}
                          onClick={() => {
                            setUserGroupFilter(group);
                            setShowUserGroupFilterDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tag Filter Dropdown (multi-select + search) */}
                <div className="relative" ref={tagFilterDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowTagFilterDropdown(!showTagFilterDropdown)}
                    className={`px-4 py-2.5 border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap max-w-[220px] ${
                      showTagFilterDropdown || selectedTagFilters.length > 0
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    <span className="truncate">{tagFilterButtonLabel}</span>
                    <ChevronDown size={16} className={`text-muted-foreground shrink-0 transition-transform ${showTagFilterDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showTagFilterDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-10 flex flex-col overflow-hidden">
                      <div className="p-2 border-b border-border shrink-0">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
                          <input
                            type="search"
                            value={tagFilterSearchQuery}
                            onChange={(e) => setTagFilterSearchQuery(e.target.value)}
                            placeholder="Search tags..."
                            className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary"
                            autoComplete="off"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-[min(280px,calc(100vh-220px))] overflow-y-auto overscroll-contain py-1">
                        {filteredTagFilterOptions.length === 0 ? (
                          <p className="px-3 py-3 text-sm text-muted-foreground">No tags match your search.</p>
                        ) : (
                          filteredTagFilterOptions.map((tag) => {
                            const display = normalizeTagValue(tag);
                            const selected = selectedTagFilters.some(
                              (t) => normalizeTagValue(t).toLowerCase() === display.toLowerCase()
                            );
                            return (
                              <button
                                type="button"
                                key={display}
                                onClick={() => toggleTagFilterSelection(tag)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                              >
                                <div
                                  className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                                    selected ? 'bg-primary border-primary' : 'border-border-muted'
                                  }`}
                                >
                                  {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>
                                <span className="text-foreground truncate">{display}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                      {selectedTagFilters.length > 0 && (
                        <div className="px-2 py-2 border-t border-border shrink-0 bg-surface-subtle">
                          <button
                            type="button"
                            onClick={() => setSelectedTagFilters([])}
                            className="w-full px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary-subtle rounded-md transition-colors text-center"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Bulk Actions Bar */}
              {selectedDocuments.size > 0 && (
                <div className="px-6 py-3 bg-surface-subtle border-b border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    {selectedDocuments.size} resource{selectedDocuments.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="relative" ref={bulkActionsDropdownRef}>
                    <button
                      onClick={() => setShowBulkActionsDropdown(!showBulkActionsDropdown)}
                      className="px-4 py-2 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      Bulk Actions
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showBulkActionsDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showBulkActionsDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleBulkAction('delete')}
                          className="w-full px-4 py-2.5 text-left text-sm text-destructive-text hover:bg-destructive-subtle transition-colors first:rounded-t-lg"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleBulkAction('process')}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        >
                          Process
                        </button>
                        <button
                          onClick={() => handleBulkAction('reembed')}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        >
                          Re-embed
                        </button>
                        <button
                          onClick={() => handleBulkAction('cleanup')}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                        >
                          Clean up
                        </button>
                        <button
                          onClick={() => handleBulkAction('rebuild')}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors last:rounded-b-lg"
                        >
                          Force full rebuild
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Table Header - Desktop Only */}
              <div className="hidden min-h-10 lg:grid grid-cols-12 items-center gap-x-6 gap-y-0 px-6 py-3 bg-muted/70 border-b border-border">
                <div className="col-span-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.size === currentPageDocuments.length && currentPageDocuments.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                  />
                  <span className="table-header-label">Resource</span>
                </div>
                <div className="col-span-2 col-start-6 table-header-label">
                  Available in
                </div>
                <div className="col-span-2 col-start-8 table-header-label">
                  User group
                </div>
                <div className="col-span-2 col-start-10 table-header-label">
                  Status
                </div>
                <div className="col-span-1 col-start-12 table-header-label text-right">
                  Actions
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {isProgressivelyLoading ? (
                  <TableSkeleton variant="grid" rows={itemsPerPage} columns={5} />
                ) : (
                  visibleCurrentPageDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="table-row-entity grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-x-6 lg:gap-y-0 px-6 lg:items-center cursor-pointer"
                    onClick={() => openDocumentGroup(doc)}
                  >
                    {/* Checkbox & Document */}
                    <div className="lg:col-span-4 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(doc.id)}
                        onChange={() => toggleDocumentSelection(doc.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden lg:block w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer shrink-0"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-secondary rounded-lg shrink-0">
                          <Folder size={20} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="table-mobile-label mb-1 lg:hidden">Resource</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDocumentGroup(doc);
                            }}
                            className="table-primary-text hover:text-primary transition-colors text-left"
                            title={`Open ${doc.title}`}
                          >
                            {doc.title}
                          </button>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {doc.tags.map((tag, index) => (
                                <span
                                  key={`${doc.id}-tag-${index}`}
                                  className="px-2 py-0.5 bg-sidebar-accent text-primary-text rounded-xs text-xs font-medium"
                                >
                                  {normalizeTagValue(tag)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="lg:col-span-2 lg:col-start-6 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <div className="w-full">
                        <div className="table-mobile-label mb-1 lg:hidden">
                          Available in
                        </div>
                        <DocumentAvailabilityBadges doc={doc} />
                      </div>
                    </div>

                    {/* User Group */}
                    <div className="lg:col-span-2 lg:col-start-8 flex items-center">
                      <div className="w-full">
                        <div className="table-mobile-label mb-1 lg:hidden">User group</div>
                        <span className="text-sm text-foreground">
                          {doc.userGroup}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2 lg:col-start-10 flex items-center">
                      <div className="w-full">
                        <div className="table-mobile-label mb-1 lg:hidden">Status</div>
                        <div className="flex items-center gap-2">
                          {doc.uploadStatus === 'uploading' ? (
                            <>
                              <div className={`${STATUS_ICON_INNER_BOX} text-warning-strong`} aria-hidden title="Uploading files">
                                <Loader2 size={18} strokeWidth={2.25} className="animate-spin" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm font-medium text-warning-text">Uploading...</span>
                                <div className="mt-0.5 text-xs tabular-nums text-text-subtle">
                                  {countCompletedFileUploads(doc)} of {doc.files.length}{' '}
                                  {doc.files.length === 1 ? 'file' : 'files'}
                                </div>
                              </div>
                            </>
                          ) : doc.processingStatus === 'processing' ? (
                            <>
                              <DetailFileCircularProgress
                                percent={clampFileProgressPct(doc.uploadProgress)}
                                opticalMargin={false}
                              />
                              <div className="min-w-0">
                                <span className={`text-sm font-medium ${getStatusColor(doc.processingStatus)}`}>
                                  Processing {clampFileProgressPct(doc.uploadProgress)}%
                                </span>
                                <div className="text-xs text-text-subtle">
                                  {doc.dateAdded}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {getStatusIcon(doc.processingStatus)}
                              <div className="min-w-0">
                                <span className={`text-sm font-medium ${getStatusColor(doc.processingStatus)}`}>
                                  {getStatusText(doc.processingStatus)}
                                </span>
                                <div className="text-xs text-text-subtle">
                                  {doc.dateAdded}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions - 3 Dot Menu */}
                    <div className="lg:col-span-1 lg:col-start-12 flex items-center lg:justify-end">
                      <div className="relative" ref={el => menuDropdownRefs.current[doc.id] = el}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                          }}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          title="More actions"
                        >
                          <MoreVertical size={18} className="text-muted-foreground" />
                        </button>
                        {openMenuId === doc.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDocumentGroup(doc);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg flex items-center gap-2"
                            >
                              <FileText size={14} />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDocumentGroup(doc);
                                initializeInlineEdit(doc);
                                setIsInlineEditing(true);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-destructive-text hover:bg-destructive-subtle transition-colors last:rounded-b-lg flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>

              {currentPageDocuments.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No resources found</p>
                </div>
              )}

              {/* Pagination */}
              {filteredDocuments.length > 0 && (
                <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left: Items per page */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <div className="relative" ref={itemsPerPageDropdownRef}>
                      <button
                        onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                        className="px-3 py-1.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[70px] justify-between"
                      >
                        {itemsPerPage}
                        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showItemsPerPageDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showItemsPerPageDropdown && (
                        <div className="absolute bottom-full left-0 mb-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
                          {[5, 10, 25, 50, 100].map((count) => (
                            <button
                              key={count}
                              onClick={() => {
                                setItemsPerPage(count);
                                setCurrentPage(1);
                                setShowItemsPerPageDropdown(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                itemsPerPage === count ? 'bg-secondary font-medium' : ''
                              }`}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground leading-none">per page</span>
                  </div>

                  {/* Right: Page navigation */}
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span className="text-sm text-muted-foreground text-center sm:text-left">
                      {isProgressivelyLoading ? 'Loading...' : `${startIndex + 1}-${Math.min(endIndex, filteredDocuments.length)} of ${filteredDocuments.length}`}
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                      {/* Previous Arrow */}
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-lg transition-colors ${
                          currentPage === 1
                            ? 'text-border-muted cursor-not-allowed'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-1.5 sm:px-2 text-sm sm:text-sm text-text-subtle">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`min-w-[30px] h-[30px] sm:min-w-[32px] sm:h-[32px] px-2 rounded-lg text-sm sm:text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-primary text-white'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}

                      {/* Next Arrow */}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-1.5 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? 'text-border-muted cursor-not-allowed'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <PageFooter />
          </div>
        </div>
      </div>

    </div>
  );
}
