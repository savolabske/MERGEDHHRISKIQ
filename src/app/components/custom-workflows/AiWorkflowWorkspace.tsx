import { useMemo, useState } from 'react';
import { Map as MapIcon, Send, Table2, FileBarChart2 } from 'lucide-react';
import type { ManagedWorkflow } from '../../data/workflowAdminMock';
import {
  buildWorkflowOutputPayload,
  consumptionChatReply,
} from '../../data/workflowAiMock';
import {
  WorkflowOutputView,
  type OutputSelection,
} from './workflow-outputs/WorkflowOutputView';
import { PageScrollShell } from '../PageScrollShell';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { cn } from '../ui/utils';

interface AiWorkflowWorkspaceProps {
  workflow: ManagedWorkflow;
  onBack: () => void;
}

type RailTab = 'sources' | 'context' | 'ask';

export function AiWorkflowWorkspace({ workflow, onBack }: AiWorkflowWorkspaceProps) {
  const definition = workflow.definition;
  const [selection, setSelection] = useState<OutputSelection>(null);
  const [railTab, setRailTab] = useState<RailTab>('ask');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>(
    [],
  );

  const payload = useMemo(() => {
    if (!definition) return null;
    return buildWorkflowOutputPayload(definition, {
      title: workflow.name,
      subtitle: workflow.description,
      lastUpdated: workflow.updatedAt,
    });
  }, [definition, workflow.name, workflow.description, workflow.updatedAt]);

  if (!definition || !payload) {
    return (
      <PageScrollShell innerClassName="space-y-4">
        <PageBreadcrumb
          items={[
            { label: 'Custom Workflows', onClick: onBack },
            { label: workflow.name },
          ]}
        />
        <div className="rounded-xl border border-border bg-card px-5 py-8 text-center">
          <p className="text-sm font-medium text-foreground">This workflow can’t be opened</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The saved definition is missing or corrupt.
          </p>
        </div>
      </PageScrollShell>
    );
  }

  const showContext =
    payload.secondary.showMap ||
    payload.secondary.showDatatable ||
    payload.secondary.showReport ||
    payload.secondary.showApi;

  const tabs: { id: RailTab; label: string; hidden?: boolean }[] = [
    { id: 'sources', label: 'Sources' },
    { id: 'context', label: 'Context', hidden: !showContext },
    { id: 'ask', label: 'Ask' },
  ];

  const sendChat = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      {
        role: 'assistant',
        text: consumptionChatReply({
          template: payload.template,
          userText: trimmed,
          selectionLabel: selection?.label,
          recipeId: payload.recipeId,
        }),
      },
    ]);
    setChatInput('');
    setRailTab('ask');
  };

  return (
    <PageScrollShell innerClassName="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageBreadcrumb
            className="mb-2"
            items={[
              { label: 'Custom Workflows', onClick: onBack },
              { label: workflow.name },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{workflow.name}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-text">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated {workflow.updatedAt}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
          <WorkflowOutputView
            payload={payload}
            selection={selection}
            onSelect={(s) => {
              setSelection(s);
              if (s) setRailTab('ask');
            }}
          />
        </div>

        <aside className="flex min-h-[320px] flex-col rounded-2xl border border-border bg-card lg:min-h-[420px]">
          <div className="flex border-b border-border">
            {tabs
              .filter((t) => !t.hidden)
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRailTab(t.id)}
                  className={cn(
                    'flex-1 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide',
                    railTab === t.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {railTab === 'sources' && (
              <div className="space-y-2">
                {payload.linkedResources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sources linked for this workflow.
                  </p>
                ) : (
                  payload.linkedResources.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-border bg-background px-3 py-2.5"
                    >
                      <p className="text-sm font-medium text-foreground">{r.title}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {railTab === 'context' && (
              <div className="space-y-3">
                {payload.secondary.showMap && (
                  <div className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapIcon size={16} />
                      Map focus
                    </div>
                    <p className="text-sm text-muted-foreground">{payload.secondary.mapFocus}</p>
                  </div>
                )}
                {payload.secondary.showDatatable && (
                  <div className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Table2 size={16} />
                      Data table
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(payload.secondary.columns ?? []).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {payload.secondary.showReport && (
                  <div className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileBarChart2 size={16} />
                      Report
                    </div>
                    <p className="text-sm text-muted-foreground">{payload.secondary.reportTitle}</p>
                  </div>
                )}
                {payload.secondary.showApi && (
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">API dataset</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {payload.secondary.datasetLabel}
                    </p>
                  </div>
                )}
              </div>
            )}

            {railTab === 'ask' && (
              <div className="flex h-full min-h-[280px] flex-col">
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {payload.chatPrompt}
                    </p>
                  )}
                  {chatMessages.map((m, i) => (
                    <div
                      key={`${m.role}-${i}`}
                      className={cn(
                        'rounded-2xl px-3 py-2 text-sm leading-relaxed',
                        m.role === 'user'
                          ? 'ml-6 bg-primary text-white'
                          : 'mr-4 bg-muted text-foreground',
                      )}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['Why is this amber?', 'What should I do next?', 'Summarize sources'].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => sendChat(chip)}
                        className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium hover:bg-muted"
                      >
                        {chip}
                      </button>
                    ),
                  )}
                  {selection && (
                    <button
                      type="button"
                      onClick={() => sendChat(`Explain: ${selection.label}`)}
                      className="rounded-full border border-primary/30 bg-primary-subtle/40 px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      About selection
                    </button>
                  )}
                </div>
                <div className="relative mt-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendChat(chatInput);
                    }}
                    placeholder="Ask about these outputs…"
                    className="w-full rounded-xl border border-border bg-white py-2.5 pl-3 pr-10 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => sendChat(chatInput)}
                    disabled={!chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-primary disabled:opacity-40"
                    aria-label="Send"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </PageScrollShell>
  );
}
