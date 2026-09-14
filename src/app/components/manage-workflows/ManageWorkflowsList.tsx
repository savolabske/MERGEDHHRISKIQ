import { useState } from 'react';
import { Plus, Settings2, Trash2, EyeOff, Upload, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { ManagedWorkflow } from '../../data/workflowAdminMock';
import { PageFooter } from '../PageFooter';
import { ConfirmDeleteDialog } from '../ui/ConfirmDeleteDialog';
import { Button } from '../ui/button';
import {
  ListPageHeader,
  ListPageSearch,
  listHeaderActionClass,
  listRowClass,
} from '../ui/list-page';
import { cn } from '../ui/utils';
import { WorkflowAdviserLayout } from './WorkflowAdviserLayout';

function workflowMetaLabel(workflow: ManagedWorkflow): string {
  if (workflow.kind === 'ai') {
    const n = workflow.definition?.steps?.length ?? 0;
    return `${n} step${n === 1 ? '' : 's'}`;
  }
  return `${workflow.audits.length} audits`;
}

interface ManageWorkflowsListProps {
  workflows: ManagedWorkflow[];
  onConfigure: (id: string) => void;
  onCreate: () => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ManageWorkflowsList({
  workflows,
  onConfigure,
  onCreate,
  onPublish,
  onUnpublish,
  onDelete,
}: ManageWorkflowsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPlacement, setMenuPlacement] = useState<'above' | 'below'>('below');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unpublishId, setUnpublishId] = useState<string | null>(null);

  const filtered = workflows.filter(
    (w) =>
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const deleteTarget = deleteId ? workflows.find((w) => w.id === deleteId) : null;
  const unpublishTarget = unpublishId ? workflows.find((w) => w.id === unpublishId) : null;

  const confirmDelete = () => {
    if (!deleteId) return;
    onDelete(deleteId);
    setDeleteId(null);
    toast.success('Workflow deleted');
  };

  const confirmUnpublish = () => {
    if (!unpublishId) return;
    onUnpublish(unpublishId);
    setUnpublishId(null);
  };

  const closeMenu = () => setOpenMenuId(null);

  const getMenuItemCount = (_workflow: ManagedWorkflow) => {
    return 3; // Configure + Publish/Unpublish + Delete
  };

  const toggleMenu = (
    workflow: ManagedWorkflow,
    index: number,
    button: HTMLButtonElement,
  ) => {
    if (openMenuId === workflow.id) {
      closeMenu();
      return;
    }

    const isLastRow = index === filtered.length - 1;
    const menuHeight = getMenuItemCount(workflow) * 36 + 8;
    const { bottom } = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bottom;
    const openAbove = isLastRow || spaceBelow < menuHeight + 8;

    setMenuPlacement(openAbove ? 'above' : 'below');
    setOpenMenuId(workflow.id);
  };

  return (
    <>
      <WorkflowAdviserLayout mode="manage">
        <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-8">
          <ListPageHeader
            title="Manage Workflows"
            subtitle="Configure AI workflows, linked evidence, and access permissions"
            action={
              <Button type="button" onClick={onCreate} className={listHeaderActionClass}>
                <Plus size={18} />
                Create workflow
              </Button>
            }
          />

          <ListPageSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search workflows..."
          />

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
              <div className="col-span-5 table-header-label">Name</div>
              <div className="col-span-2 table-header-label">Status</div>
              <div className="col-span-2 table-header-label">Steps</div>
              <div className="col-span-1 table-header-label">Last updated</div>
              <div className="col-span-2 table-header-label text-right">Actions</div>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((workflow, index) => (
                <div
                  key={workflow.id}
                  onClick={() => onConfigure(workflow.id)}
                  className={cn(listRowClass, 'relative cursor-pointer')}
                >
                  <div className="lg:col-span-5 min-w-0 pr-10 lg:pr-0">
                    <p className="table-primary-text truncate">
                      {workflow.name.trim() || 'Untitled workflow'}
                    </p>
                    <p className="table-supporting-text truncate mt-0.5">
                      {workflow.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 lg:hidden">
                      <StatusBadge status={workflow.status} />
                      <span className="table-metadata-text">{workflowMetaLabel(workflow)}</span>
                      <span className="table-metadata-text">{workflow.updatedAt}</span>
                    </div>
                  </div>

                  <div className="hidden lg:flex lg:col-span-2 items-center">
                    <StatusBadge status={workflow.status} />
                  </div>

                  <div className="hidden lg:flex lg:col-span-2 items-center">
                    <span className="table-supporting-text">{workflowMetaLabel(workflow)}</span>
                  </div>

                  <div className="hidden lg:flex lg:col-span-1 items-center">
                    <span className="table-supporting-text">{workflow.updatedAt}</span>
                  </div>

                  <div
                    className="absolute top-3 right-3 lg:static lg:col-span-2 flex items-center lg:justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(workflow, index, e.currentTarget);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        aria-label="Workflow actions"
                        aria-expanded={openMenuId === workflow.id}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === workflow.id && (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-10"
                            aria-label="Close menu"
                            onClick={closeMenu}
                          />
                          <div
                            className={cn(
                              'absolute right-0 z-20 w-44 bg-card border border-border rounded-lg shadow-lg py-1',
                              menuPlacement === 'above'
                                ? 'bottom-full mb-1'
                                : 'top-full mt-1',
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onConfigure(workflow.id);
                                closeMenu();
                              }}
                              className="inline-flex w-full items-center gap-2 px-3 py-2 text-sm leading-none text-foreground hover:bg-muted"
                            >
                              <Settings2 size={14} className="shrink-0" />
                              <span>Configure</span>
                            </button>
                            {workflow.status === 'draft' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onPublish(workflow.id);
                                  closeMenu();
                                }}
                                className="inline-flex w-full items-center gap-2 px-3 py-2 text-sm leading-none text-foreground hover:bg-muted"
                              >
                                <Upload size={14} className="shrink-0" />
                                <span>Publish</span>
                              </button>
                            )}
                            {workflow.status === 'live' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setUnpublishId(workflow.id);
                                  closeMenu();
                                }}
                                className="inline-flex w-full items-center gap-2 px-3 py-2 text-sm leading-none text-foreground hover:bg-muted"
                              >
                                <EyeOff size={14} className="shrink-0" />
                                <span>Unpublish</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteId(workflow.id);
                                closeMenu();
                              }}
                              className="inline-flex w-full items-center gap-2 px-3 py-2 text-sm leading-none text-destructive-text hover:bg-destructive-subtle"
                            >
                              <Trash2 size={14} className="shrink-0" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No workflows found</p>
              </div>
            )}
          </div>

          <PageFooter />
        </div>
      </WorkflowAdviserLayout>

      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete workflow?"
        description={
          deleteTarget
            ? `"${deleteTarget.name.trim() || 'Untitled workflow'}" will be permanently removed. This cannot be undone.`
            : 'This workflow will be permanently removed.'
        }
        confirmLabel="Delete"
      />

      <ConfirmDeleteDialog
        open={Boolean(unpublishId)}
        onOpenChange={(open) => !open && setUnpublishId(null)}
        onConfirm={confirmUnpublish}
        title="Unpublish workflow?"
        description={
          unpublishTarget
            ? `"${unpublishTarget.name.trim() || 'Untitled workflow'}" will be hidden from Custom Workflows and moved to draft. You can publish it again later.`
            : 'This workflow will be hidden from Custom Workflows.'
        }
        confirmLabel="Unpublish"
      />
    </>
  );
}

function StatusBadge({ status }: { status: ManagedWorkflow['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
        status === 'live'
          ? 'bg-success-subtle text-success-text'
          : 'bg-warning-subtle text-warning-text',
      )}
    >
      {status === 'live' ? 'Live' : 'Draft'}
    </span>
  );
}
