import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  loadPlatformResources,
  savePlatformResources,
  type PlatformResource,
} from '../data/resourcesMock';
import type { ReportResourceLinkContext } from '../data/reportResourceLink';
import { ResourcesList } from './resources/ResourcesList';
import { ResourceDetailView } from './resources/ResourceDetailView';
import { ResourceEditView } from './resources/ResourceEditView';
import { AddResourceForm } from './resources/AddResourceForm';
import { PageScrollShell } from './PageScrollShell';

type HubView = 'list' | 'detail' | 'edit' | 'add';

interface PlatformResourcesProps {
  onChatWithResource?: (resourceId: string) => void;
  focusedResourceId?: string | null;
  reportLinkContext?: ReportResourceLinkContext | null;
  onReportLinkComplete?: (resourceId: string) => void;
  onReportLinkBack?: () => void;
}

export function PlatformResources({
  onChatWithResource,
  focusedResourceId,
  reportLinkContext = null,
  onReportLinkComplete,
  onReportLinkBack,
}: PlatformResourcesProps) {
  const [resources, setResources] = useState<PlatformResource[]>(() => loadPlatformResources());
  const [view, setView] = useState<HubView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedResource = resources.find((r) => r.id === selectedId) ?? null;
  const isLinkingReport = Boolean(reportLinkContext);

  const persist = useCallback((next: PlatformResource[]) => {
    setResources(next);
    savePlatformResources(next);
  }, []);

  const goToList = useCallback(() => {
    if (isLinkingReport && onReportLinkBack) {
      onReportLinkBack();
      return;
    }
    setView('list');
    setSelectedId(null);
  }, [isLinkingReport, onReportLinkBack]);

  const handleSelect = (id: string) => {
    if (isLinkingReport && onReportLinkComplete) {
      onReportLinkComplete(id);
      return;
    }
    setSelectedId(id);
    setView('detail');
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setView('edit');
  };

  const handleDelete = (id: string) => {
    persist(resources.filter((r) => r.id !== id));
    setView('list');
    setSelectedId(null);
  };

  const handleSave = (updated: PlatformResource) => {
    persist(resources.map((r) => (r.id === updated.id ? updated : r)));
    setView('detail');
  };

  const handleAdd = (resource: PlatformResource) => {
    const next = [resource, ...resources];
    persist(next);
    if (isLinkingReport && onReportLinkComplete) {
      onReportLinkComplete(resource.id);
      return;
    }
    setSelectedId(resource.id);
    setView('detail');
  };

  useEffect(() => {
    if (reportLinkContext) {
      setView('add');
      setSelectedId(null);
    }
  }, [reportLinkContext]);

  useEffect(() => {
    if (!focusedResourceId) return;
    const resourceExists = resources.some((resource) => resource.id === focusedResourceId);
    if (!resourceExists) return;
    setSelectedId(focusedResourceId);
    setView('detail');
  }, [focusedResourceId, resources]);

  return (
    <PageScrollShell>
            {view === 'list' && (
              <ResourcesList
                resources={resources}
                onAdd={() => setView('add')}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onChatWithResource={onChatWithResource}
                onDelete={(id) => {
                  toast.promise(
                    Promise.resolve().then(() => handleDelete(id)),
                    {
                      loading: 'Deleting resource...',
                      success: 'Resource deleted.',
                      error: 'Could not delete resource.',
                    },
                  );
                }}
              />
            )}

            {view === 'detail' && selectedResource && (
              <ResourceDetailView
                resource={selectedResource}
                onBack={goToList}
                onEdit={() => setView('edit')}
                onDelete={() => handleDelete(selectedResource.id)}
                onChatWithResource={
                  onChatWithResource
                    ? () => onChatWithResource(selectedResource.id)
                    : undefined
                }
                onFilesChange={(files) =>
                  handleSave({
                    ...selectedResource,
                    files,
                    lastModified: new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                    status: {
                      state: 'completed',
                      updatedAt: new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }),
                    },
                  })
                }
              />
            )}

            {view === 'edit' && selectedResource && (
              <ResourceEditView
                resource={selectedResource}
                onBack={goToList}
                onCancel={() => setView('detail')}
                onSave={handleSave}
              />
            )}

            {view === 'add' && (
              <AddResourceForm
                onBack={goToList}
                onCancel={goToList}
                onSubmit={handleAdd}
                reportLinkContext={reportLinkContext}
              />
            )}
    </PageScrollShell>
  );
}
