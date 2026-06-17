import {
  ExternalLink,
  Trash2,
  Calendar,
  Clock,
  Globe,
  User,
  Edit2,
  MessagesSquare,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { PlatformResource } from '../../data/resourcesMock';
import {
  OwnershipBadge,
  ChatsAvailabilityBadge,
  SidebarTagBadge,
  SidebarUserGroupBadge,
  DetailSectionTitle,
  DetailFieldLabel,
} from './resourceShared';
import { ResourceDocumentsList } from './ResourceDocumentsList';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { Button } from '../ui/button';

interface ResourceDetailViewProps {
  resource: PlatformResource;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFilesChange?: (files: PlatformResource['files']) => void;
  onChatWithResource?: () => void;
}

export function ResourceDetailView({
  resource,
  onBack,
  onEdit,
  onDelete,
  onFilesChange,
  onChatWithResource,
}: ResourceDetailViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAllIndividualUsers, setShowAllIndividualUsers] = useState(false);

  const { individualUsers } = resource;
  const hiddenIndividualUserCount = individualUsers.length - 1;
  const visibleIndividualUsers =
    individualUsers.length <= 2 || showAllIndividualUsers
      ? individualUsers
      : individualUsers.slice(0, 1);

  useEffect(() => {
    setShowAllIndividualUsers(false);
  }, [resource.id]);

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
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: 'Resources', onClick: onBack },
          { label: resource.title },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-foreground">{resource.title}</h1>
        {onChatWithResource && (
          <Button
            type="button"
            onClick={onChatWithResource}
            className="w-full sm:w-auto shrink-0 gap-2"
          >
            <MessagesSquare size={16} />
            Chat with resource
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <DetailSectionTitle>Description</DetailSectionTitle>
            <p className="text-sm text-foreground leading-relaxed">{resource.description}</p>
          </div>

          {resource.webLinks.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <DetailSectionTitle>Web Links</DetailSectionTitle>
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

          <ResourceDocumentsList files={resource.files} onChange={onFilesChange} />
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div>
              <DetailFieldLabel>Available in</DetailFieldLabel>
              <div className="flex flex-wrap gap-1">
                <ChatsAvailabilityBadge />
              </div>
            </div>

            <div>
              <DetailFieldLabel>Ownership</DetailFieldLabel>
              <OwnershipBadge ownership={resource.ownership} />
            </div>

            {resource.userGroups.length > 0 && (
              <div>
                <DetailFieldLabel>User Group</DetailFieldLabel>
                <div className="flex flex-wrap gap-2">
                  {resource.userGroups.map((group) => (
                    <SidebarUserGroupBadge key={group} group={group} />
                  ))}
                </div>
              </div>
            )}

            {individualUsers.length > 0 && (
              <div>
                <DetailFieldLabel>Individual Users</DetailFieldLabel>
                <div className="space-y-2">
                  {visibleIndividualUsers.map((email) => (
                    <div key={email} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User size={14} className="text-muted-foreground" />
                      </span>
                      <span className="truncate">{email}</span>
                    </div>
                  ))}
                  {individualUsers.length > 2 && !showAllIndividualUsers && (
                    <button
                      type="button"
                      onClick={() => setShowAllIndividualUsers(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors pl-10 text-left"
                    >
                      + {hiddenIndividualUserCount} other email address
                      {hiddenIndividualUserCount === 1 ? '' : 'es'}
                    </button>
                  )}
                  {individualUsers.length > 2 && showAllIndividualUsers && (
                    <button
                      type="button"
                      onClick={() => setShowAllIndividualUsers(false)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors pl-10 text-left"
                    >
                      Show less
                    </button>
                  )}
                </div>
              </div>
            )}

            {resource.tags.length > 0 && (
              <div>
                <DetailFieldLabel>Tags</DetailFieldLabel>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <SidebarTagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <DetailFieldLabel>Created</DetailFieldLabel>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar size={18} className="text-muted-foreground" />
                {resource.createdAt}
              </div>
            </div>

            <div>
              <DetailFieldLabel>Last Modified</DetailFieldLabel>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock size={18} className="text-muted-foreground" />
                {resource.lastModified}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onEdit}
              className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 size={18} />
              Edit Resource
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-3 border border-border hover:bg-destructive-subtle hover:border-destructive text-destructive-text rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
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
