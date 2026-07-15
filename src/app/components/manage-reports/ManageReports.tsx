import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  createDefaultReportSkeleton,
  isBuiltinReport,
  loadManagedReports,
  saveManagedReports,
  type ManagedReport,
} from '../../data/reportsAdminMock';
import {
  clearManageReportsReturnContext,
  loadManageReportsReturnContext,
  saveReportResourceLinkContext,
} from '../../data/reportResourceLink';
import { ManageReportsList } from './ManageReportsList';
import { ReportAddModal } from './ReportAddModal';
import { ReportBuilder } from './ReportBuilder';

type View = 'list' | 'builder';

interface ManageReportsProps {
  onAttachSources?: (report: ManagedReport) => void;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ManageReports({ onAttachSources }: ManageReportsProps) {
  const [view, setView] = useState<View>('list');
  const [reports, setReports] = useState<ManagedReport[]>(() => loadManagedReports());
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedSnapshots, setSavedSnapshots] = useState<Record<string, string>>(() =>
    Object.fromEntries(loadManagedReports().map((r) => [r.id, JSON.stringify(r)])),
  );

  useEffect(() => {
    const returnCtx = loadManageReportsReturnContext();
    if (!returnCtx) return;
    clearManageReportsReturnContext();
    const freshReports = loadManagedReports();
    setReports(freshReports);
    setSavedSnapshots(
      Object.fromEntries(freshReports.map((r) => [r.id, JSON.stringify(r)])),
    );
    setActiveReportId(returnCtx.reportId);
    setView('builder');
    if (returnCtx.toastMessage) {
      toast.success(returnCtx.toastMessage);
    }
  }, []);

  const persistReports = useCallback((updater: ManagedReport[] | ((prev: ManagedReport[]) => ManagedReport[])) => {
    setReports((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveManagedReports(next);
      return next;
    });
  }, []);

  const commitSnapshot = useCallback((report: ManagedReport) => {
    setSavedSnapshots((prev) => ({
      ...prev,
      [report.id]: JSON.stringify(report),
    }));
  }, []);

  const activeReport = useMemo(
    () => reports.find((r) => r.id === activeReportId) ?? null,
    [reports, activeReportId],
  );

  const savedSnapshot = activeReportId ? savedSnapshots[activeReportId] ?? '' : '';

  const handleCreate = useCallback(
    (input: { title: string; description: string; userGroups: string[]; resourceId?: string }) => {
      const report = createDefaultReportSkeleton(input);
      persistReports((prev) => [report, ...prev]);
      setSavedSnapshots((prev) => ({ ...prev, [report.id]: JSON.stringify(report) }));
      setActiveReportId(report.id);
      setShowAddModal(false);
      setView('builder');
      toast.success(
        input.resourceId ? 'Report created and linked to resource' : 'Report created as draft',
      );
    },
    [persistReports],
  );

  const handleUpdate = useCallback(
    (updated: ManagedReport) => {
      persistReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    },
    [persistReports],
  );

  const handlePublish = useCallback(
    (updated: ManagedReport) => {
      const published = {
        ...updated,
        status: 'published' as const,
        updatedAt: formatDate(new Date()),
      };
      persistReports((prev) => prev.map((r) => (r.id === published.id ? published : r)));
      commitSnapshot(published);
      toast.success('Report published');
    },
    [commitSnapshot, persistReports],
  );

  const handlePublishFromList = useCallback(
    (id: string) => {
      let published: ManagedReport | null = null;
      persistReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          published = {
            ...r,
            status: 'published' as const,
            updatedAt: formatDate(new Date()),
          };
          return published;
        }),
      );
      if (published) {
        commitSnapshot(published);
        toast.success('Report published');
      }
    },
    [commitSnapshot, persistReports],
  );

  const handleUnpublish = useCallback(
    (id: string) => {
      persistReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: 'draft' as const, updatedAt: formatDate(new Date()) }
            : r,
        ),
      );
      toast.success('Report unpublished');
    },
    [persistReports],
  );

  const handleDelete = useCallback(
    (id: string) => {
      let blocked = false;
      persistReports((prev) => {
        const target = prev.find((r) => r.id === id);
        if (target && isBuiltinReport(target)) {
          blocked = true;
          return prev;
        }
        return prev.filter((r) => r.id !== id);
      });
      if (blocked) {
        toast.error('Built-in reports cannot be deleted');
        return;
      }
      setSavedSnapshots((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      if (activeReportId === id) {
        setActiveReportId(null);
        setView('list');
      }
    },
    [activeReportId, persistReports],
  );

  const openBuilder = (id: string) => {
    setActiveReportId(id);
    setView('builder');
  };

  const backToList = () => {
    if (activeReport) {
      setSavedSnapshots((prev) => ({
        ...prev,
        [activeReport.id]: JSON.stringify(activeReport),
      }));
    }
    setActiveReportId(null);
    setView('list');
  };

  const handleAttachSources = useCallback(
    (report: ManagedReport) => {
      saveReportResourceLinkContext({
        reportId: report.id,
        reportTitle: report.title,
        prefillTitle: report.title,
        prefillDescription: report.description,
      });
      onAttachSources?.(report);
    },
    [onAttachSources],
  );

  if (view === 'builder' && activeReport) {
    return (
      <ReportBuilder
        report={activeReport}
        savedSnapshot={savedSnapshot}
        onBack={backToList}
        onUpdate={handleUpdate}
        onPublish={handlePublish}
        onCommit={commitSnapshot}
        onAttachSources={() => handleAttachSources(activeReport)}
      />
    );
  }

  return (
    <>
      <ManageReportsList
        reports={reports}
        onAdd={() => setShowAddModal(true)}
        onEdit={openBuilder}
        onPublish={handlePublishFromList}
        onUnpublish={handleUnpublish}
        onDelete={handleDelete}
      />
      <ReportAddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreate}
      />
    </>
  );
}
