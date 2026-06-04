import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Users,
  Globe,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PlatformResource } from '../../data/resourcesMock';
import { OwnershipBadge, SectionLabel, TagPill } from './resourceShared';
import { ResourceDocumentsList } from './ResourceDocumentsList';

interface ResourceDetailViewProps {
  resource: PlatformResource;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ResourceDetailView({
  resource,
  onBack,
  onEdit,
  onDelete,
}: ResourceDetailViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteConfirm = () => {
    toast.promise(
      Promise.resolve().then(() => {
        onDelete();
        setShowDeleteConfirm(false);
      }),
      {
        loading: 'Deleting resource...',
        success: 'Resource deleted successfully.',
        error: 'We could not delete this resource. Please try again.',
      },
    );
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Resources
      </button>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
              {resource.title}
            </h1>
            <OwnershipBadge ownership={resource.ownership} />
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <SectionLabel>Description</SectionLabel>
            <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
          </div>

          <ResourceDocumentsList files={resource.files} />

          {resource.webLinks.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <SectionLabel>Web Links</SectionLabel>
              <div className="space-y-4">
                {resource.webLinks.map((link) => (
                  <div key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe size={14} className="shrink-0" />
                      <span className="truncate">{link.url}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">Added {link.addedAt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border p-6">
            <SectionLabel>Shared With</SectionLabel>
            <p className="text-sm text-muted-foreground mb-4">
              Groups and individuals who have access to this resource.
            </p>
            {resource.userGroups.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">User Groups</p>
                <div className="flex flex-wrap gap-2">
                  {resource.userGroups.map((group) => (
                    <span
                      key={group}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-subtle text-primary text-sm font-medium"
                    >
                      <Users size={14} />
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {resource.individualUsers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Individual Users</p>
                <div className="space-y-2">
                  {resource.individualUsers.map((email) => (
                    <div key={email} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User size={14} className="text-muted-foreground" />
                      </span>
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="w-full xl:w-72 shrink-0 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Created
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar size={16} className="text-muted-foreground" />
                {resource.createdAt}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Last Modified
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock size={16} className="text-muted-foreground" />
                {resource.lastModified}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Pencil size={16} />
              Edit Resource
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-destructive-subtle text-destructive-text rounded-lg text-sm font-medium hover:bg-destructive-subtle transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </aside>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-5 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Delete Resource?</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-muted-foreground mb-2">
                Are you sure you want to delete this resource? This action cannot be undone.
              </p>
              <p className="text-sm font-medium text-foreground">&ldquo;{resource.title}&rdquo;</p>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 bg-destructive text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-colors"
              >
                Delete Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
