import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { INITIAL_RESOURCES, type PlatformResource } from '../data/resourcesMock';
import { ResourcesList } from './resources/ResourcesList';
import { ResourceDetailView } from './resources/ResourceDetailView';
import { ResourceEditView } from './resources/ResourceEditView';
import { AddResourceForm } from './resources/AddResourceForm';

type HubView = 'list' | 'detail' | 'edit' | 'add';

export function PlatformResources() {
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

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6 pb-6">
          <div className="max-w-[1400px] mx-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}
