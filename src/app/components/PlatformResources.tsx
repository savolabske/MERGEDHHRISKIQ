import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { INITIAL_RESOURCES, type PlatformResource } from '../data/resourcesMock';
import { ResourcesList } from './resources/ResourcesList';
import { ResourceDetailView } from './resources/ResourceDetailView';
import { ResourceEditView } from './resources/ResourceEditView';
import { AddResourceForm } from './resources/AddResourceForm';
import { PageScrollShell } from './PageScrollShell';

type HubView = 'list' | 'detail' | 'edit' | 'add';

interface PlatformResourcesProps {
  onChatWithResource?: (resourceId: string) => void;
  focusedResourceId?: string | null;
}

export function PlatformResources({ onChatWithResource, focusedResourceId }: PlatformResourcesProps) {
  const [resources, setResources] = useState<PlatformResource[]>(INITIAL_RESOURCES);
  const [view, setView] = useState<HubView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedResource = resources.find((r) => r.id === selectedId) ?? null;

  const goToList = useCallback(() => {
    setView('list');
    setSelectedId(null);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setView('edit');
  };

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    goToList();
  };

  const handleSave = (updated: PlatformResource) => {
    setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setView('detail');
  };

  const handleAdd = (resource: PlatformResource) => {
    setResources((prev) => [resource, ...prev]);
    setSelectedId(resource.id);
    setView('detail');
  };

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
              />
            )}
    </PageScrollShell>
  );
}
