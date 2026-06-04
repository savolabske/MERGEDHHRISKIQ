import { ArrowLeft, ExternalLink, FileText, Edit, Trash2, Download, Globe, Lock, Tag as TagIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ResourceDetailProps {
  resourceId: string;
  onBack: () => void;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  isEditing: boolean;
}

export function ResourceDetail({ resourceId, onBack, onEdit, onSave, onDelete, isEditing }: ResourceDetailProps) {
  // Mock data - in real app this would come from API/props
  const resource = {
    name: 'Standard Operating Procedures - RMU Somalia',
    description: 'Standardized protocols for mission risk assessments and security protocols across Somalia field offices. This comprehensive document outlines all necessary procedures for field operations, emergency response, and daily security measures.',
    lastUpdated: 'Last updated Oct 12, 2023',
    createdBy: 'Sarah Johnson',
    privacySetting: 'public' as 'public' | 'private',
    tags: ['Security', 'SOP', 'Field Operations', 'RMU'],
    files: [
      { id: '1', name: 'SOP_RMU_Somalia_2024.pdf', size: '2.4 MB', type: 'PDF' },
      { id: '2', name: 'Security_Protocols_Annex_A.docx', size: '890 KB', type: 'DOCX' },
      { id: '3', name: 'Risk_Assessment_Template.xlsx', size: '156 KB', type: 'XLSX' }
    ],
    externalLinks: [
      'https://unsom.sharepoint.com/sites/security-protocols',
      'https://docs.google.com/forms/assessment-template'
    ],
    grantedAccess: ['Example Org', 'RMU Team', 'Field Coordinators']
  };

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
      }
    );
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="flex-1 flex flex-col">
        <div className="w-full px-16 pt-12 pb-16">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-subtle hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span className="text-sm font-medium uppercase tracking-wider">Back to Resources</span>
          </button>

          {/* Header with Actions */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-foreground mb-3 tracking-[-0.5px]">
                {resource.name}
              </h1>
              <div className="flex items-center gap-4 text-xs text-text-subtle">
                <span>{resource.lastUpdated}</span>
                <span>•</span>
                <span>Created by {resource.createdBy}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-6">
              <button
                onClick={() => {
                  onEdit();
                  toast.success('Opening edit mode...');
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <Edit size={16} strokeWidth={2} />
                <span className="font-medium text-sm">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-destructive-subtle bg-card text-destructive-text rounded-lg hover:bg-destructive-subtle transition-colors"
              >
                <Trash2 size={16} strokeWidth={2} />
                <span className="font-medium text-sm">Delete</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-8">
              <TagIcon size={16} className="text-text-subtle" strokeWidth={2} />
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-primary-subtle text-primary rounded text-xs font-bold tracking-wider uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-10">
            <h2 className="text-base font-semibold text-foreground mb-3">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Documents */}
          {resource.files.length > 0 && (
            <div className="mb-10">
              <h2 className="text-base font-semibold text-foreground mb-4">Documents ({resource.files.length})</h2>
              <div className="space-y-3">
                {resource.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between py-3 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded bg-primary-subtle flex items-center justify-center">
                        <FileText size={18} className="text-primary" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-0.5">{file.name}</p>
                        <p className="text-xs text-text-subtle">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-card transition-colors">
                        <Download size={16} className="text-muted-foreground" strokeWidth={2} />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-card transition-colors">
                        <ExternalLink size={16} className="text-muted-foreground" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          {resource.externalLinks.length > 0 && (
            <div className="mb-10">
              <h2 className="text-base font-semibold text-foreground mb-4">External Links ({resource.externalLinks.length})</h2>
              <div className="space-y-3">
                {resource.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-3 hover:bg-muted transition-colors group"
                  >
                    <ExternalLink size={16} className="text-text-subtle group-hover:text-primary transition-colors" strokeWidth={2} />
                    <span className="text-sm text-primary truncate flex-1">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Access */}
          <div className="mb-10">
            <h2 className="text-base font-semibold text-foreground mb-4">Privacy & Access</h2>
            <div className="py-3">
              <div className="flex items-center gap-3 mb-4">
                {resource.privacySetting === 'public' ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center">
                      <Globe size={18} className="text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Public</p>
                      <p className="text-xs text-text-subtle">Visible to all authenticated personnel</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-destructive-subtle flex items-center justify-center">
                      <Lock size={18} className="text-destructive-text" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Private</p>
                      <p className="text-xs text-text-subtle">Restricted to specific users and organizations</p>
                    </div>
                  </>
                )}
              </div>

              {resource.privacySetting === 'private' && resource.grantedAccess.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3">Granted Access ({resource.grantedAccess.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.grantedAccess.map((access, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-subtle text-primary rounded text-xs font-medium"
                      >
                        {access}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-lg shadow-2xl max-w-[440px] w-full">
            <div className="px-6 py-5 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Delete Resource?</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-muted-foreground leading-relaxed mb-1">
                Are you sure you want to delete this resource? This action cannot be undone.
              </p>
              <p className="text-sm font-medium text-foreground">
                "{resource.name}"
              </p>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-destructive text-white rounded-lg hover:bg-destructive-text transition-colors font-semibold text-sm"
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