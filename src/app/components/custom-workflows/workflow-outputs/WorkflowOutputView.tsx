import { useState } from 'react';
import { cn } from '../../ui/utils';
import type {
  ActionQueueData,
  AssuranceMatrixData,
  BriefingData,
  DecisionBoardData,
  ScorecardData,
  WorkflowOutputPayload,
} from '../../../data/workflowAiMock';

export type OutputSelection =
  | { kind: 'decision'; id: string; label: string }
  | { kind: 'dimension'; id: string; label: string }
  | { kind: 'section'; id: string; label: string }
  | { kind: 'area'; id: string; label: string }
  | { kind: 'action'; id: string; label: string }
  | null;

interface WorkflowOutputViewProps {
  payload: WorkflowOutputPayload;
  selection?: OutputSelection;
  onSelect?: (selection: OutputSelection) => void;
  onActionChange?: (items: ActionQueueData['items']) => void;
}

function RagPill({ rag }: { rag: 'G' | 'A' | 'R' }) {
  const styles =
    rag === 'G'
      ? 'bg-success-subtle text-success-text'
      : rag === 'A'
        ? 'bg-warning-subtle text-warning-text'
        : 'bg-destructive-subtle text-destructive-text';
  const label = rag === 'G' ? 'Green' : rag === 'A' ? 'Amber' : 'Red';
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold', styles)}>
      {label}
    </span>
  );
}

function DecisionBoardView({
  data,
  selection,
  onSelect,
}: {
  data: DecisionBoardData;
  selection?: OutputSelection;
  onSelect?: (s: OutputSelection) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{kpi.value}</p>
            {kpi.delta && (
              <p
                className={cn(
                  'mt-1 text-xs',
                  kpi.tone === 'good' && 'text-success-text',
                  kpi.tone === 'bad' && 'text-destructive-text',
                  kpi.tone === 'warn' && 'text-warning-text',
                  kpi.tone === 'neutral' && 'text-muted-foreground',
                )}
              >
                {kpi.delta}
              </p>
            )}
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Decisions needed</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{data.contextNotes}</p>
        <ul className="mt-4 space-y-2">
          {data.decisionsNeeded.map((item) => {
            const active = selection?.kind === 'decision' && selection.id === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() =>
                    onSelect?.(active ? null : { kind: 'decision', id: item.id, label: item.title })
                  }
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                    active ? 'border-primary bg-primary-subtle/40' : 'border-border bg-card hover:bg-muted/60',
                  )}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <p className="min-w-0 text-sm font-medium text-foreground text-balance">{item.title}</p>
                    <span
                      className={cn(
                        'shrink-0 self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                        item.urgency === 'high' && 'bg-destructive-subtle text-destructive-text',
                        item.urgency === 'medium' && 'bg-warning-subtle text-warning-text',
                        item.urgency === 'low' && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {item.urgency}
                    </span>
                  </div>
                  {active && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.context}</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ScorecardView({
  data,
  selection,
  onSelect,
}: {
  data: ScorecardData;
  selection?: OutputSelection;
  onSelect?: (s: OutputSelection) => void;
}) {
  const selected = data.dimensions.find(
    (d) => selection?.kind === 'dimension' && selection.id === d.id,
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <p className="text-xs text-muted-foreground">Overall score</p>
          <p className="text-3xl font-semibold text-foreground">{data.overallScore}</p>
        </div>
        <div className="pb-1">
          <RagPill rag={data.rag} />
        </div>
        <p className="pb-1 text-sm text-muted-foreground">Threshold {data.threshold}</p>
      </div>
      <div className="space-y-2">
        {data.dimensions.map((dim) => {
          const active = selection?.kind === 'dimension' && selection.id === dim.id;
          return (
            <button
              key={dim.id}
              type="button"
              onClick={() =>
                onSelect?.(active ? null : { kind: 'dimension', id: dim.id, label: dim.label })
              }
              className={cn(
                'flex w-full flex-col gap-2 rounded-xl border px-4 py-3 text-left transition-colors sm:flex-row sm:items-center sm:gap-3',
                active ? 'border-primary bg-primary-subtle/40' : 'border-border bg-card hover:bg-muted/60',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{dim.label}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, dim.score)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold tabular-nums">{dim.score}</span>
                <RagPill rag={dim.rag} />
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Driver: </span>
          {selected.driver}
        </div>
      )}
    </div>
  );
}

function BriefingView({
  data,
  selection,
  onSelect,
}: {
  data: BriefingData;
  selection?: OutputSelection;
  onSelect?: (s: OutputSelection) => void;
}) {
  return (
    <div className="space-y-3">
      {data.sections.map((section) => {
        const active = selection?.kind === 'section' && selection.id === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() =>
              onSelect?.(active ? null : { kind: 'section', id: section.id, label: section.heading })
            }
            className={cn(
              'w-full rounded-xl border px-4 py-4 text-left transition-colors',
              active ? 'border-primary bg-primary-subtle/40' : 'border-border bg-card hover:bg-muted/60',
            )}
          >
            <h3 className="text-sm font-semibold text-foreground">{section.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            {section.citations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {section.citations.map((c) => (
                  <span
                    key={c.label}
                    className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AssuranceMatrixView({
  data,
  selection,
  onSelect,
}: {
  data: AssuranceMatrixData;
  selection?: OutputSelection;
  onSelect?: (s: OutputSelection) => void;
}) {
  const areaId = selection?.kind === 'area' ? selection.id : data.areas[0]?.id;
  const checks = data.checksPreview.filter((c) => c.areaId === areaId);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {data.areas.map((area) => {
          const active = areaId === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelect?.({ kind: 'area', id: area.id, label: area.label })}
              className={cn(
                'rounded-xl border px-3 py-3 text-left transition-colors',
                active ? 'border-primary bg-primary-subtle/40' : 'border-border bg-card hover:bg-muted/60',
              )}
            >
              <p className="text-sm font-medium text-foreground">{area.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {area.clearCount}/{area.totalCount} clear
              </p>
              <p className="mt-2 text-[11px] font-semibold capitalize text-muted-foreground">
                {area.status.replace('_', ' ')}
              </p>
            </button>
          );
        })}
      </div>
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Checks
        </div>
        <ul className="divide-y divide-border">
          {checks.map((check) => (
            <li
              key={check.title}
              className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <span className="min-w-0 text-foreground break-words">{check.title}</span>
              <span className="shrink-0 text-xs capitalize text-muted-foreground">{check.status}</span>
            </li>
          ))}
          {checks.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground">No sample checks for this area.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ActionQueueView({
  data,
  selection,
  onSelect,
  onActionChange,
}: {
  data: ActionQueueData;
  selection?: OutputSelection;
  onSelect?: (s: OutputSelection) => void;
  onActionChange?: (items: ActionQueueData['items']) => void;
}) {
  const [items, setItems] = useState(data.items);

  const update = (next: ActionQueueData['items']) => {
    setItems(next);
    onActionChange?.(next);
  };

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const active = selection?.kind === 'action' && selection.id === item.id;
        return (
          <li
            key={item.id}
            className={cn(
              'rounded-xl border px-4 py-3 transition-colors',
              active ? 'border-primary bg-primary-subtle/40' : 'border-border bg-card',
              item.status === 'done' && 'opacity-60',
            )}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() =>
                onSelect?.(active ? null : { kind: 'action', id: item.id, label: item.title })
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  {item.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.owner} · {item.dueLabel}
              </p>
            </button>
            {item.status === 'open' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  onClick={() =>
                    update(items.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i)))
                  }
                >
                  Mark done
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  onClick={() => {
                    update(
                      items.map((i) => (i.id === item.id ? { ...i, status: 'escalated' } : i)),
                    );
                    onSelect?.({ kind: 'action', id: item.id, label: item.title });
                  }}
                >
                  Escalate
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function WorkflowOutputView({
  payload,
  selection,
  onSelect,
  onActionChange,
}: WorkflowOutputViewProps) {
  switch (payload.template) {
    case 'decision_board':
      return (
        <DecisionBoardView
          data={payload.data as DecisionBoardData}
          selection={selection}
          onSelect={onSelect}
        />
      );
    case 'scorecard':
      return (
        <ScorecardView
          data={payload.data as ScorecardData}
          selection={selection}
          onSelect={onSelect}
        />
      );
    case 'briefing':
      return (
        <BriefingView
          data={payload.data as BriefingData}
          selection={selection}
          onSelect={onSelect}
        />
      );
    case 'assurance_matrix':
      return (
        <AssuranceMatrixView
          data={payload.data as AssuranceMatrixData}
          selection={selection}
          onSelect={onSelect}
        />
      );
    case 'action_queue':
      return (
        <ActionQueueView
          data={payload.data as ActionQueueData}
          selection={selection}
          onSelect={onSelect}
          onActionChange={onActionChange}
        />
      );
  }
}
