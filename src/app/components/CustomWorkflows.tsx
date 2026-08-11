import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  FileSearch,
  Users,
  ClipboardList,
} from 'lucide-react';
import { PageScrollShell } from './PageScrollShell';
import { FcdoComplianceReview } from './custom-workflows/FcdoComplianceReview';
import {
  ListPageHeader,
  ListPageSearch,
} from './ui/list-page';
import {
  interactiveCardProps,
  interactiveSurfaceClass,
} from './ui/interaction';
import { cn } from './ui/utils';

type WorkflowStatus = 'live' | 'design';

interface CustomWorkflow {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
  icon: React.ElementType;
}

const WORKFLOWS: CustomWorkflow[] = [
  {
    id: 'fcdo-compliance-review',
    title: 'FCDO Compliance Review',
    description:
      'Checks every FCDO programme against the 72-point evidence framework across 9 areas.',
    status: 'live',
    icon: ShieldCheck,
  },
  {
    id: 'somalia-joint-fund',
    title: 'Somalia Joint Fund Assurance',
    description:
      'Continuous assurance across SJF windows and projects, on the same evidence engine.',
    status: 'design',
    icon: FileSearch,
  },
  {
    id: 'donor-reporting-readiness',
    title: 'Donor Reporting Readiness',
    description:
      'Pre-flight checks that a report pack is complete and consistent before it leaves the building.',
    status: 'design',
    icon: ClipboardList,
  },
  {
    id: 'partner-due-diligence',
    title: 'Partner Due Diligence',
    description:
      'Standing checks on implementing partners with automatic re-verification.',
    status: 'design',
    icon: Users,
  },
];

export function CustomWorkflows() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return WORKFLOWS;
    return WORKFLOWS.filter(
      (workflow) =>
        workflow.title.toLowerCase().includes(q) ||
        workflow.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

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
          return (
            <article
              key={workflow.id}
              role={isLive ? 'button' : undefined}
              tabIndex={isLive ? 0 : undefined}
              onClick={isLive ? () => setActiveWorkflowId(workflow.id) : undefined}
              onKeyDown={isLive ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveWorkflowId(workflow.id);
                }
              } : undefined}
              className={cn(
                'group relative flex flex-col gap-4 text-left p-5 bg-card border border-border rounded-xl',
                isLive
                  ? cn('cursor-pointer', interactiveSurfaceClass.white)
                  : 'cursor-default opacity-60',
              )}
              {...(isLive ? interactiveCardProps : {})}
            >
              {!isLive && (
                <span className="absolute top-5 right-5 text-metadata uppercase tracking-wide bg-muted px-2.5 py-1 rounded-full">
                  Coming soon
                </span>
              )}

              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex size-10 items-center justify-center rounded-lg',
                  isLive
                    ? 'bg-primary-subtle text-primary'
                    : 'bg-muted text-muted-foreground',
                )}>
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
                <h3 className={cn(
                  'text-base font-bold text-foreground-emphasis transition-colors',
                  isLive && 'group-hover:text-primary',
                  !isLive && 'pr-24',
                )}>
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
                    setActiveWorkflowId(workflow.id);
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
