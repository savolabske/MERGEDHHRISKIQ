import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  FileSearch,
  Users,
  ClipboardList,
  Sparkles,
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

type CatalogStatus = 'live' | 'design';

interface CatalogCard {
  id: string;
  title: string;
  description: string;
  status: CatalogStatus;
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
    status: 'live',
    icon: ShieldCheck,
    kind: 'static',
  },
  {
    id: 'somalia-joint-fund',
    title: 'Somalia Joint Fund Assurance',
    description:
      'Continuous assurance across SJF windows and projects, on the same evidence engine.',
    status: 'design',
    icon: FileSearch,
    kind: 'static',
  },
  {
    id: 'donor-reporting-readiness',
    title: 'Donor Reporting Readiness',
    description:
      'Pre-flight checks that a report pack is complete and consistent before it leaves the building.',
    status: 'design',
    icon: ClipboardList,
    kind: 'static',
  },
  {
    id: 'daily-fraud-deactivations',
    title: 'Contractor Fraud Deactivation Report',
    description:
      'Daily check of contractor deactivations for fraud — who, why, and the count.',
    status: 'design',
    icon: Users,
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
      status: 'live',
      icon: Sparkles,
      kind: 'ai',
      aiWorkflow: wf,
    }),
  );
  const aiTitles = new Set(publishedAi.map((c) => c.title.toLowerCase()));
  const staticFiltered = STATIC_WORKFLOWS.filter(
    (c) => c.status === 'live' || !aiTitles.has(c.title.toLowerCase()),
  );
  const catalog: CatalogCard[] = [
    ...staticFiltered.filter((c) => c.id === 'fcdo-compliance-review'),
    ...publishedAi,
    ...staticFiltered.filter((c) => c.id !== 'fcdo-compliance-review'),
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((workflow) => {
          const isLive = workflow.status === 'live';
          const Icon = workflow.icon;
          const open = () => {
            if (!isLive) return;
            if (workflow.kind === 'ai' && workflow.aiWorkflow) {
              setActiveAi(workflow.aiWorkflow);
            } else {
              setActiveWorkflowId(workflow.id);
            }
          };
          return (
            <article
              key={workflow.id}
              role={isLive ? 'button' : undefined}
              tabIndex={isLive ? 0 : undefined}
              onClick={isLive ? open : undefined}
              onKeyDown={
                isLive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open();
                      }
                    }
                  : undefined
              }
              className={cn(
                'group relative flex min-w-0 flex-col gap-4 text-left p-4 sm:p-5 bg-card border border-border rounded-xl',
                isLive
                  ? cn('cursor-pointer', interactiveSurfaceClass.white)
                  : 'cursor-default opacity-60',
              )}
              {...(isLive ? interactiveCardProps : {})}
            >
              {!isLive && (
                <span className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[10px] sm:text-metadata uppercase tracking-wide bg-muted px-2 py-1 sm:px-2.5 rounded-full">
                  Coming soon
                </span>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg',
                    isLive
                      ? 'bg-primary-subtle text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-text">
                    <span className="size-1.5 rounded-full bg-success" aria-hidden />
                    Live
                  </span>
                )}
              </div>

              <div className="space-y-2 min-w-0">
                <h3
                  className={cn(
                    'text-base font-bold text-foreground-emphasis transition-colors',
                    isLive && 'group-hover:text-primary',
                    !isLive && 'pr-24',
                  )}
                >
                  {workflow.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {workflow.description}
                </p>
              </div>

              {isLive && (
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
              )}
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-muted-foreground">No workflows found</p>
          </div>
        )}
      </div>
    </PageScrollShell>
  );
}
