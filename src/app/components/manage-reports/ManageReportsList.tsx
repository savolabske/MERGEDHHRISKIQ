import { useState } from 'react';
import { Plus, Search, MoreVertical, Pencil, Trash2, EyeOff, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { ManagedReport } from '../../data/reportsAdminMock';
import { isBuiltinReport } from '../../data/reportsAdminMock';
import { PageScrollShell } from '../PageScrollShell';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
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

  const getMenuItemCount = (report: ManagedReport) => {
    let count = 2; // Edit + Publish or Unpublish
    if (!isBuiltinReport(report)) count += 1;
    return count;
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-page-title mb-1">Manage Reports</h2>
            <p className="text-sm text-muted-foreground">
              Create and configure AI-backed report layouts
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus size={18} />
            Add report
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            size={20}
          />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
          />
        </div>

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
                className="table-row-narrative relative grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 transition-colors cursor-pointer"
              >
                <div className="lg:col-span-5 min-w-0 pr-12 lg:pr-0">
                  <div className="table-header-label mb-1 lg:hidden">Name</div>
                  <p className="table-primary-text truncate">{report.title}</p>
                  <p className="table-supporting-text truncate mt-0.5">
                    {report.description || 'No description'}
                  </p>
                </div>

                <div className="lg:col-span-2 flex items-center">
                  <div className="table-header-label mb-1 lg:hidden w-full">Status</div>
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

                <div className="lg:col-span-3 flex items-center">
                  <div className="table-header-label mb-1 lg:hidden w-full">Last updated</div>
                  <span className="table-supporting-text">{report.updatedAt}</span>
                </div>

                <div
                  className="absolute top-4 right-4 lg:relative lg:top-auto lg:right-auto lg:col-span-2 flex items-center lg:justify-end"
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
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          {report.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => {
                                onPublish(report.id);
                                closeMenu();
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              <Upload size={14} />
                              Publish
                            </button>
                          )}
                          {report.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => {
                                setUnpublishId(report.id);
                                closeMenu();
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              <EyeOff size={14} />
                              Unpublish
                            </button>
                          )}
                          {!isBuiltinReport(report) && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteId(report.id);
                                closeMenu();
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive-text hover:bg-destructive-subtle"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          )}
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

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete report?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.`
                : 'This report will be permanently removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive-text"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(unpublishId)}
        onOpenChange={(open) => !open && setUnpublishId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish report?</AlertDialogTitle>
            <AlertDialogDescription>
              {unpublishTarget
                ? `"${unpublishTarget.title}" will be hidden from the Reports hub and moved to draft. You can publish it again later.`
                : 'This report will be hidden from the Reports hub.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnpublish}>Unpublish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
