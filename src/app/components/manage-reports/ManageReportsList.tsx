import { useState } from 'react';
import { Plus, Pencil, Trash2, EyeOff, Upload, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { ManagedReport } from '../../data/reportsAdminMock';
import { PageScrollShell } from '../PageScrollShell';
import { ConfirmDeleteDialog } from '../ui/ConfirmDeleteDialog';
import { Button } from '../ui/button';
import {
  ListPageHeader,
  ListPageSearch,
  listHeaderActionClass,
  listRowClass,
} from '../ui/list-page';
import { cn } from '../ui/utils';

interface ManageReportsListProps {
  reports: ManagedReport[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ManageReportsList({
  reports,
  onAdd,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: ManageReportsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPlacement, setMenuPlacement] = useState<'above' | 'below'>('below');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unpublishId, setUnpublishId] = useState<string | null>(null);

  const filtered = reports.filter(
    (r) =>
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const deleteTarget = deleteId ? reports.find((r) => r.id === deleteId) : null;
  const unpublishTarget = unpublishId ? reports.find((r) => r.id === unpublishId) : null;

  const confirmDelete = () => {
    if (!deleteId) return;
    onDelete(deleteId);
    setDeleteId(null);
    toast.success('Report deleted');
  };

  const confirmUnpublish = () => {
    if (!unpublishId) return;
    onUnpublish(unpublishId);
    setUnpublishId(null);
  };

  const closeMenu = () => setOpenMenuId(null);

  const getMenuItemCount = (_report: ManagedReport) => {
    return 3; // Edit + Publish/Unpublish + Delete
  };

  const toggleMenu = (
    report: ManagedReport,
    index: number,
    button: HTMLButtonElement,
  ) => {
    if (openMenuId === report.id) {
      closeMenu();
      return;
    }

    const isLastRow = index === filtered.length - 1;
    const menuHeight = getMenuItemCount(report) * 36 + 8;
    const { bottom, top } = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bottom;
    const openAbove = isLastRow || spaceBelow < menuHeight + 8;

    setMenuPlacement(openAbove ? 'above' : 'below');
    setOpenMenuId(report.id);
  };

  return (
    <>
      <PageScrollShell innerClassName="space-y-6">
        <ListPageHeader
          title="Manage Reports"
          subtitle="Create and configure AI-backed report layouts"
          action={
            <Button type="button" onClick={onAdd} className={listHeaderActionClass}>
              <Plus size={18} />
              Add report
            </Button>
          }
        />

        <ListPageSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search reports..."
        />

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
            <div className="col-span-5 table-header-label">Name</div>
            <div className="col-span-2 table-header-label">Status</div>
            <div className="col-span-3 table-header-label">Last updated</div>
            <div className="col-span-2 table-header-label text-right">Actions</div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((report, index) => (
              <div
                key={report.id}
                onClick={() => onEdit(report.id)}
                className={cn(listRowClass, 'relative cursor-pointer')}
              >
                <div className="lg:col-span-5 min-w-0 pr-10 lg:pr-0">
                  <p className="table-primary-text truncate">{report.title}</p>
                  <p className="table-supporting-text truncate mt-0.5">
                    {report.description || 'No description'}
                  </p>
                  {/* Mobile meta: status + date on one line */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 lg:hidden">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                        report.status === 'published'
                          ? 'bg-success-subtle text-success-text'
                          : 'bg-warning-subtle text-warning-text',
                      )}
                    >
                      {report.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="table-metadata-text">{report.updatedAt}</span>
                  </div>
                </div>

                <div className="hidden lg:flex lg:col-span-2 items-center">
                  <span
                    className={cn(
                      'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                      report.status === 'published'
                        ? 'bg-success-subtle text-success-text'
                        : 'bg-warning-subtle text-warning-text',
                    )}
                  >
                    {report.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="hidden lg:flex lg:col-span-3 items-center">
                  <span className="table-supporting-text">{report.updatedAt}</span>
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
                        toggleMenu(report, index, e.currentTarget);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      aria-label="Report actions"
                      aria-expanded={openMenuId === report.id}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === report.id && (
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
                              onEdit(report.id);
                              closeMenu();
                            }}
                            className="inline-flex w-full items-center gap-2 px-3 py-2 text-sm leading-none text-foreground hover:bg-muted"
                          >
                            <Pencil size={14} className="shrink-0" />
                            <span>Edit</span>
                          </button>
                          {report.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => {
                                onPublish(report.id);
                                closeMenu();
                              }}
                              className="inline-flex w-full items-center gap-2 px-3 py-2 text-sm leading-none text-foreground hover:bg-muted"
                            >
                              <Upload size={14} className="shrink-0" />
                              <span>Publish</span>
                            </button>
                          )}
                          {report.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => {
                                setUnpublishId(report.id);
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
                              setDeleteId(report.id);
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
              <p className="text-sm text-muted-foreground">No reports found</p>
            </div>
          )}
        </div>
      </PageScrollShell>

      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete report?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.`
            : 'This report will be permanently removed.'
        }
        confirmLabel="Delete"
      />

      <ConfirmDeleteDialog
        open={Boolean(unpublishId)}
        onOpenChange={(open) => !open && setUnpublishId(null)}
        onConfirm={confirmUnpublish}
        title="Unpublish report?"
        description={
          unpublishTarget
            ? `"${unpublishTarget.title}" will be hidden from the Reports hub and moved to draft. You can publish it again later.`
            : 'This report will be hidden from the Reports hub.'
        }
        confirmLabel="Unpublish"
      />
    </>
  );
}
