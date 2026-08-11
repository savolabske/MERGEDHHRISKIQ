import { useCallback, useState } from 'react';
import {
  loadManagedWorkflows,
  saveManagedWorkflows,
  type ManagedWorkflow,
} from '../../data/workflowAdminMock';
import { ManageWorkflowsList } from './ManageWorkflowsList';
import { WorkflowConfig } from './WorkflowConfig';

type View = 'list' | 'config';

export function ManageWorkflows() {
  const [view, setView] = useState<View>('list');
  const [workflows, setWorkflows] = useState<ManagedWorkflow[]>(() => loadManagedWorkflows());
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  const persistWorkflows = useCallback(
    (updater: ManagedWorkflow[] | ((prev: ManagedWorkflow[]) => ManagedWorkflow[])) => {
      setWorkflows((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveManagedWorkflows(next);
        return next;
      });
    },
    [],
  );

  const handleUpdate = useCallback(
    (updated: ManagedWorkflow) => {
      persistWorkflows((prev) => prev.map((wf) => (wf.id === updated.id ? updated : wf)));
    },
    [persistWorkflows],
  );

  const activeWorkflow = workflows.find((wf) => wf.id === activeWorkflowId) ?? null;

  if (view === 'config' && activeWorkflow) {
    return (
      <WorkflowConfig
        workflow={activeWorkflow}
        onBack={() => {
          setActiveWorkflowId(null);
          setView('list');
        }}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <ManageWorkflowsList
      workflows={workflows}
      onConfigure={(id) => {
        setActiveWorkflowId(id);
        setView('config');
      }}
    />
  );
}
