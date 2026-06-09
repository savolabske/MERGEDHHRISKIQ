import type { ReactNode } from 'react';
import {
  Crown,
  User,
  FileText,
  FileSpreadsheet,
  FileType,
  Presentation,
  CheckCircle2,
} from 'lucide-react';
import type { ResourceFile, ResourceFileType, ResourceOwnership } from '../../data/resourcesMock';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

export function OwnershipBadge({ ownership }: { ownership: ResourceOwnership }) {
  if (ownership === 'created_by_me') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning-subtle text-warning-text text-xs font-medium">
        <Crown size={12} strokeWidth={2} />
        Created by me
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-subtle text-primary text-xs font-medium">
      <User size={12} strokeWidth={2} />
      Shared with me
    </span>
  );
}

export function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
      {tag}
    </span>
  );
}

export function FileTypeIcon({ type }: { type: ResourceFileType }) {
  const base = 'w-10 h-10 rounded-lg flex items-center justify-center shrink-0';
  switch (type) {
    case 'PDF':
      return (
        <div className={`${base} bg-destructive-subtle`}>
          <FileText size={18} className="text-destructive-text" strokeWidth={2} />
        </div>
      );
    case 'XLSX':
      return (
        <div className={`${base} bg-success-subtle`}>
          <FileSpreadsheet size={18} className="text-success-text" strokeWidth={2} />
        </div>
      );
    case 'PPTX':
      return (
        <div className={`${base} bg-warning-subtle`}>
          <Presentation size={18} className="text-warning-text" strokeWidth={2} />
        </div>
      );
    case 'DOCX':
      return (
        <div className={`${base} bg-primary-subtle`}>
          <FileType size={18} className="text-primary" strokeWidth={2} />
        </div>
      );
    default:
      return (
        <div className={`${base} bg-muted`}>
          <FileText size={18} className="text-muted-foreground" strokeWidth={2} />
        </div>
      );
  }
}

export const inputClass =
  'w-full px-4 py-2.5 border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 transition-colors';

export const textareaClass =
  'w-full px-4 py-2.5 border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 transition-colors resize-none';

/** Same column template as admin resource detail file table. */
export const DETAIL_FILES_TABLE_GRID =
  'grid grid-cols-[1rem_minmax(0,1fr)_minmax(168px,200px)_108px] sm:grid-cols-[1rem_minmax(0,1fr)_minmax(184px,220px)_108px] gap-x-3 items-center';

export function PlatformFileStatusCell({ file }: { file: ResourceFile }) {
  return (
    <div className="flex min-w-0 w-full items-center justify-start gap-1">
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center" aria-hidden>
        <CheckCircle2 size={16} className="text-success" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-success">Completed</p>
        <p className="mt-0.5 truncate text-xs leading-snug text-text-subtle" title={file.uploadedAt}>
          {file.uploadedAt}
        </p>
      </div>
    </div>
  );
}

export function SidebarTagBadge({ tag }: { tag: string }) {
  return (
    <span className="px-3 py-1.5 bg-sidebar-accent text-primary-text rounded-lg text-sm font-medium">
      {tag}
    </span>
  );
}

export function SidebarUserGroupBadge({ group }: { group: string }) {
  return (
    <span className="px-3 py-1.5 bg-success-subtle text-success-text rounded-lg text-sm font-medium">
      {group}
    </span>
  );
}

export function ChatsAvailabilityBadge() {
  return (
    <span className="inline-flex items-center rounded-xs px-2.5 py-1 text-xs font-medium bg-primary-subtle text-primary-text">
      Chats
    </span>
  );
}
