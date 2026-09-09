import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { PageScrollShell } from './PageScrollShell';
import {
  FcdoComplianceReview,
  WorkflowPortfolioReview,
} from './custom-workflows/FcdoComplianceReview';
import {
  ListPageHeader,
  ListPageSearch,
} from './ui/list-page';
import {
  interactiveCardProps,
  interactiveSurfaceClass,
} from './ui/interaction';
import { cn } from './ui/utils';
import {
  listPublishedAiWorkflows,
  loadManagedWorkflows,
  type ManagedWorkflow,
} from '../data/workflowAdminMock';
import { buildDemoProgrammeAuditsFromWorkflow } from '../data/workflowProgrammeDemo';

interface CatalogCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  kind: 'static' | 'ai';
  aiWorkflow?: ManagedWorkflow;
}

const STATIC_WORKFLOWS: CatalogCard[] = [
  {
    id: 'fcdo-compliance-review',
    title: 'FCDO Compliance Review',
    description:
      'Checks every FCDO programme against the 72-point evidence framework across 9 areas.',
    icon: ShieldCheck,
    kind: 'static',
  },
];

function PublishedAiWorkflowReview({
  workflow,
  onBack,
}: {
  workflow: ManagedWorkflow;
  onBack: () => void;
}) {
  const programmes = useMemo(
    () => buildDemoProgrammeAuditsFromWorkflow(workflow),
    [workflow],
  );

  return (
    <WorkflowPortfolioReview
      onBack={onBack}
      title={workflow.name}
      description={
        workflow.description?.trim() ||
        'Programme-level outcomes from the published workflow pipeline.'
      }
      programmes={programmes}
      syncBadge="Live"
    />
  );
}

export function CustomWorkflows() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [activeAi, setActiveAi] = useState<ManagedWorkflow | null>(null);

  const publishedAi = listPublishedAiWorkflows(loadManagedWorkflows()).map(
    (wf): CatalogCard => ({
      id: wf.id,
      title: wf.name,
      description: wf.description,
      icon: Sparkles,
      kind: 'ai',
      aiWorkflow: wf,
    }),
  );
  const catalog: CatalogCard[] = [...STATIC_WORKFLOWS, ...publishedAi];

  const q = searchQuery.trim().toLowerCase();
  const filtered = !q
    ? catalog
    : catalog.filter(
        (workflow) =>
          workflow.title.toLowerCase().includes(q) ||
          workflow.description.toLowerCase().includes(q),
      );

  if (activeAi) {
    return <PublishedAiWorkflowReview workflow={activeAi} onBack={() => setActiveAi(null)} />;
  }

  if (activeWorkflowId === 'fcdo-compliance-review') {
    return <FcdoComplianceReview onBack={() => setActiveWorkflowId(null)} />;
  }

  const isSearching = Boolean(q);
  const showEmpty = filtered.length === 0;

  return (
    <PageScrollShell innerClassName="space-y-6">
      <ListPageHeader
        title="Custom Workflows"
        subtitle="Turn a manual review into a live one. The AI does the reading and the reconciling — your team spends its time on decisions, not hunting through folders."
      />

      <ListPageSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search workflows..."
      />

      {showEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Workflow size={24} strokeWidth={1.75} />
          </div>
          {isSearching ? (
            <>
              <h3 className="text-base font-semibold text-foreground-emphasis">
                No matching workflows
              </h3>
              <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                Nothing matches “{searchQuery.trim()}”. Try another search, or ask an admin to
                create a workflow for your team.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-foreground-emphasis">
                No workflows yet
              </h3>
              <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                Ask an admin to create a workflow for your team. Once it’s published, it will
                show up here.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((workflow) => {
            const Icon = workflow.icon;
            const open = () => {
              if (workflow.kind === 'ai' && workflow.aiWorkflow) {
                setActiveAi(workflow.aiWorkflow);
              } else {
                setActiveWorkflowId(workflow.id);
              }
            };
            return (
              <article
                key={workflow.id}
                role="button"
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                  }
                }}
                className={cn(
                  'group relative flex min-w-0 flex-col gap-4 text-left p-4 sm:p-5 bg-card border border-border rounded-xl',
                  'cursor-pointer',
                  interactiveSurfaceClass.white,
                )}
                {...interactiveCardProps}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-text">
                    <span className="size-1.5 rounded-full bg-success" aria-hidden />
                    Live
                  </span>
                </div>

                <div className="space-y-2 min-w-0">
                  <h3 className="text-base font-bold text-foreground-emphasis transition-colors group-hover:text-primary">
                    {workflow.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {workflow.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-2"
                >
                  Open workflow
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </PageScrollShell>
  );
}
