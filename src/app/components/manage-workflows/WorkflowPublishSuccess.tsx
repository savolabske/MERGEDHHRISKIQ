import { Check, ChevronRight } from 'lucide-react';
import { PageScrollShell } from '../PageScrollShell';
import { Button } from '../ui/button';

interface WorkflowPublishSuccessProps {
  name: string;
  onBackToList: () => void;
  onOpenWorkflow: () => void;
}

const HOW_ROWS = [
  {
    n: '1',
    title: 'Add a document.',
    body: 'A project manager uploads or links evidence — the same sources you set up on each step.',
  },
  {
    n: '2',
    title: 'The AI assesses automatically.',
    body: 'Every step’s prompt runs against the new evidence and the dashboard updates — nobody has to trigger it.',
  },
  {
    n: '3',
    title: 'Anyone can ask Workflow Copilot.',
    body: '“Why is this amber?” or “What’s blocking PSEA?” — answered from the live assessment, not a static report.',
  },
  {
    n: '4',
    title: 'Leadership reads the summary.',
    body: 'One click turns the current state into a decision-ready brief — that’s the point of Humanity Hub.',
  },
] as const;

export function WorkflowPublishSuccess({
  name,
  onBackToList,
  onOpenWorkflow,
}: WorkflowPublishSuccessProps) {
  return (
    <PageScrollShell innerClassName="py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
          <Check size={28} strokeWidth={2.5} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-foreground">{name} is live</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          It now appears in Custom Workflows for everyone with access. As teams add records and
          upload evidence, the AI starts assessing automatically.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card px-5 py-4 text-left">
          <p className="mb-3 text-sm font-semibold text-foreground">How teams use it from here</p>
          <div className="space-y-3">
            {HOW_ROWS.map((row) => (
              <div key={row.n} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {row.n}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <b className="font-semibold text-foreground">{row.title}</b> {row.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={onBackToList}>
            Back to Manage Workflows
          </Button>
          <Button type="button" onClick={onOpenWorkflow}>
            Open the workflow
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </PageScrollShell>
  );
}
