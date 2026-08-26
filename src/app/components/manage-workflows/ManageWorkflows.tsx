import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createAiWorkflowDraft,
  formatWorkflowUpdatedAt,
  isAiWorkflow,
  loadManagedWorkflows,
  saveManagedWorkflows,
  workflowDefinitionComplete,
  type ManagedWorkflow,
  type WorkflowWizardStep,
} from '../../data/workflowAdminMock';
import {
  interpretWorkflowPrompt,
  WORKFLOW_GENERATION_STEPS,
} from '../../data/workflowAiMock';
import { ManageWorkflowsList } from './ManageWorkflowsList';
import { WorkflowConfig } from './WorkflowConfig';
import { WorkflowWizard } from './WorkflowWizard';
import { WorkflowWizardDescribe, type WorkflowDescribeValues } from './WorkflowWizardDescribe';
import { WorkflowPipeline } from './WorkflowPipeline';
import { WorkflowWizardAccess } from './WorkflowWizardAccess';
import { WorkflowWizardPreview } from './WorkflowWizardPreview';
import { WorkflowPublishSuccess } from './WorkflowPublishSuccess';

type View = 'list' | 'wizard' | 'config' | 'success';

const GEN_MS = WORKFLOW_GENERATION_STEPS.length * 280 + 900;

export function ManageWorkflows() {
  const [view, setView] = useState<View>('list');
  const [workflows, setWorkflows] = useState<ManagedWorkflow[]>(() => loadManagedWorkflows());
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationDone, setGenerationDone] = useState(false);
  const [preferLiveOnPublish, setPreferLiveOnPublish] = useState(true);
  const [publishedName, setPublishedName] = useState('');
  const generationTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (generationTimerRef.current) window.clearTimeout(generationTimerRef.current);
    };
  }, []);

  const clearGenerationTimer = () => {
    if (generationTimerRef.current) {
      window.clearTimeout(generationTimerRef.current);
      generationTimerRef.current = null;
    }
  };

  const patchActive = (patch: Partial<ManagedWorkflow>) => {
    if (!activeWorkflow) return;
    handleUpdate({
      ...activeWorkflow,
      ...patch,
      updatedAt: formatWorkflowUpdatedAt(),
    });
  };

  const startCreate = () => {
    const draft = createAiWorkflowDraft({
      name: '',
      description: '',
      masterPrompt: '',
      recordType: 'Project',
      ratingStyle: 'Red / Amber / Green',
      wizardStep: 1,
    });
    persistWorkflows((prev) => [draft, ...prev]);
    setActiveWorkflowId(draft.id);
    clearGenerationTimer();
    setGenerating(false);
    setGenerationDone(false);
    setPreferLiveOnPublish(true);
    setView('wizard');
  };

  const runGeneration = (workflow: ManagedWorkflow) => {
    const prompt = workflow.masterPrompt || workflow.description;
    const result = interpretWorkflowPrompt(prompt, workflow.recordType);
    const next: ManagedWorkflow = {
      ...workflow,
      name: workflow.name.trim() || result.meta.suggestedName,
      description: workflow.description.trim() || result.meta.suggestedDescription,
      recordType: workflow.recordType || result.meta.suggestedRecordType || 'Project',
      definition: result.definition,
      wizardStep: 2,
      updatedAt: formatWorkflowUpdatedAt(),
    };
    handleUpdate(next);
    clearGenerationTimer();
    setGenerating(true);
    setGenerationDone(false);
    generationTimerRef.current = window.setTimeout(() => {
      setGenerating(false);
      setGenerationDone(true);
      generationTimerRef.current = null;
    }, GEN_MS);
  };

  const goToStep = (step: WorkflowWizardStep) => {
    if (!activeWorkflow) return;
    if (step === 2 && !activeWorkflow.definition) {
      runGeneration({ ...activeWorkflow, wizardStep: 2 });
      return;
    }
    if (step === 2 && activeWorkflow.definition) {
      setGenerationDone(true);
      setGenerating(false);
    }
    patchActive({ wizardStep: step });
  };

  const handleContinue = () => {
    if (!activeWorkflow) return;
    const step = (activeWorkflow.wizardStep ?? 1) as WorkflowWizardStep;

    if (step === 1) {
      const name = activeWorkflow.name.trim();
      const description = activeWorkflow.description.trim();
      if (!name || !description) return;
      const withPrompt: ManagedWorkflow = {
        ...activeWorkflow,
        masterPrompt: description,
        wizardStep: 2,
      };
      runGeneration(withPrompt);
      return;
    }

    if (step === 2) {
      if (!generationDone || !activeWorkflow.definition) return;
      patchActive({ wizardStep: 3 });
      return;
    }

    if (step === 3) {
      patchActive({ wizardStep: 4 });
      return;
    }

    // step 4 publish
    if (!activeWorkflow.definition || !workflowDefinitionComplete(activeWorkflow.definition)) {
      setToast('Finish step prompts before publishing');
      return;
    }
    if (!preferLiveOnPublish) {
      patchActive({
        status: 'draft',
        publishedToCatalog: false,
        catalogUserGroups: activeWorkflow.accessViewers ?? [],
      });
      setToast('Saved as draft — flip to Live and publish when ready');
      setActiveWorkflowId(null);
      setView('list');
      return;
    }

    const name = activeWorkflow.name.trim() || 'Untitled workflow';
    handleUpdate({
      ...activeWorkflow,
      name,
      status: 'live',
      publishedToCatalog: true,
      catalogUserGroups: activeWorkflow.accessViewers ?? [],
      updatedAt: formatWorkflowUpdatedAt(),
    });
    setPublishedName(name);
    setView('success');
  };

  const handleBack = () => {
    if (!activeWorkflow) return;
    const step = (activeWorkflow.wizardStep ?? 1) as WorkflowWizardStep;
    if (step <= 1) return;
    patchActive({ wizardStep: (step - 1) as WorkflowWizardStep });
  };

  const handleRegenerate = () => {
    if (!activeWorkflow) return;
    setGenerationDone(false);
    runGeneration(activeWorkflow);
  };

  const leaveWizard = () => {
    clearGenerationTimer();
    setActiveWorkflowId(null);
    setGenerating(false);
    setGenerationDone(false);
    setView('list');
  };

  if (view === 'success') {
    return (
      <>
        <WorkflowPublishSuccess
          name={publishedName}
          onBackToList={leaveWizard}
          onOpenWorkflow={() => {
            leaveWizard();
            setToast(`“${publishedName}” is live in Custom Workflows`);
          }}
        />
        {toast ? <Toast message={toast} /> : null}
      </>
    );
  }

  if (view === 'wizard' && activeWorkflow && isAiWorkflow(activeWorkflow)) {
    const step = (activeWorkflow.wizardStep ?? 1) as WorkflowWizardStep;
    const describeValues: WorkflowDescribeValues = {
      name: activeWorkflow.name,
      recordType: activeWorkflow.recordType ?? 'Project',
      description: activeWorkflow.description,
      ratingStyle: activeWorkflow.ratingStyle ?? 'Red / Amber / Green',
    };

    const step1Blocked = !activeWorkflow.name.trim() || !activeWorkflow.description.trim();
    const step2Blocked = !generationDone || !activeWorkflow.definition;
    const step4Blocked =
      !activeWorkflow.definition || !workflowDefinitionComplete(activeWorkflow.definition);

    return (
      <>
        <WorkflowWizard
          step={step}
          workflowName={activeWorkflow.name}
          onBackToList={leaveWizard}
          onStepChange={goToStep}
          onCancel={leaveWizard}
          onBack={handleBack}
          onContinue={handleContinue}
          continueDisabled={
            step === 1 ? step1Blocked : step === 2 ? step2Blocked : step === 4 ? step4Blocked : false
          }
          continueDisabledReason={
            step === 1 && step1Blocked
              ? 'Add a name and description to continue'
              : step === 2 && step2Blocked
                ? 'Wait for the draft to finish'
                : step === 4 && step4Blocked
                  ? 'Finish prompts on every step first'
                  : undefined
          }
          publishMode={step === 4}
        >
          {step === 1 ? (
            <WorkflowWizardDescribe
              values={describeValues}
              onChange={(values) =>
                patchActive({
                  name: values.name,
                  recordType: values.recordType,
                  description: values.description,
                  masterPrompt: values.description,
                  ratingStyle: values.ratingStyle,
                })
              }
            />
          ) : null}

          {step === 2 && activeWorkflow.definition ? (
            <WorkflowPipeline
              definition={activeWorkflow.definition}
              generating={generating}
              generationDone={generationDone}
              recordType={activeWorkflow.recordType}
              onChange={(definition) => patchActive({ definition })}
              onRegenerate={handleRegenerate}
            />
          ) : null}

          {step === 2 && !activeWorkflow.definition ? (
            <WorkflowPipeline
              definition={{
                recipeId: 'fallback',
                outputTemplate: 'decision_board',
                steps: [],
              }}
              generating
              generationDone={false}
              recordType={activeWorkflow.recordType}
              onChange={() => undefined}
              onRegenerate={handleRegenerate}
            />
          ) : null}

          {step === 3 ? (
            <WorkflowWizardAccess
              admins={activeWorkflow.accessAdmins ?? []}
              editors={activeWorkflow.accessEditors ?? []}
              viewers={activeWorkflow.accessViewers ?? []}
              onChangeAdmins={(accessAdmins) => patchActive({ accessAdmins })}
              onChangeEditors={(accessEditors) => patchActive({ accessEditors })}
              onChangeViewers={(accessViewers) =>
                patchActive({ accessViewers, catalogUserGroups: accessViewers })
              }
            />
          ) : null}

          {step === 4 && activeWorkflow.definition ? (
            <WorkflowWizardPreview
              workflow={activeWorkflow}
              preferLive={preferLiveOnPublish}
              onPreferLiveChange={setPreferLiveOnPublish}
            />
          ) : null}
        </WorkflowWizard>
        {toast ? <Toast message={toast} /> : null}
      </>
    );
  }

  if (view === 'config' && activeWorkflow && !isAiWorkflow(activeWorkflow)) {
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
    <>
      <ManageWorkflowsList
        workflows={workflows}
        onCreate={startCreate}
        onConfigure={(id) => {
          const wf = workflows.find((w) => w.id === id);
          if (!wf) return;
          setActiveWorkflowId(id);
          if (isAiWorkflow(wf)) {
            setGenerating(false);
            const hasSteps = Boolean(wf.definition?.steps?.length);
            setGenerationDone(hasSteps);
            const nextStep: WorkflowWizardStep = !hasSteps
              ? 1
              : wf.wizardStep && wf.wizardStep >= 2
                ? wf.wizardStep
                : 2;
            handleUpdate({ ...wf, wizardStep: nextStep });
            setView('wizard');
          } else {
            setView('config');
          }
        }}
      />
      {toast ? <Toast message={toast} /> : null}
    </>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-foreground px-4 py-2.5 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
