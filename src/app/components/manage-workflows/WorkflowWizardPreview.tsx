import type { ManagedWorkflow } from '../../data/workflowAdminMock';
import {
  greenerDemoAreas,
  previewAreasFromSteps,
  sampleRecordsForWorkflow,
  statusFromDemoAreas,
} from '../../data/workflowProgrammeDemo';
import { ProgrammePortfolioCard } from '../custom-workflows/ProgrammePortfolioCard';
import { WizardStepHeader } from './WorkflowWizard';
import { cn } from '../ui/utils';

interface WorkflowWizardPreviewProps {
  workflow: ManagedWorkflow;
  preferLive: boolean;
  onPreferLiveChange: (live: boolean) => void;
}

export function WorkflowWizardPreview({
  workflow,
  preferLive,
  onPreferLiveChange,
}: WorkflowWizardPreviewProps) {
  const definition = workflow.definition!;
  const pipelineSteps = definition.steps ?? [];
  const areas = previewAreasFromSteps(pipelineSteps);
  const [primary, secondary] = sampleRecordsForWorkflow(workflow);
  const primaryTone = statusFromDemoAreas(areas);
  const secondaryAreas = greenerDemoAreas(areas);
  const secondaryTone = statusFromDemoAreas(secondaryAreas);

  const cards =
    areas.length === 0
      ? []
      : [
          {
            key: 'primary',
            record: primary,
            areas,
            ...primaryTone,
            lastReviewRelative: '2 days ago',
          },
          {
            key: 'secondary',
            record: secondary,
            areas: secondaryAreas,
            ...secondaryTone,
            lastReviewRelative: '5 days ago',
          },
        ];

  return (
    <div>
      <WizardStepHeader
        step={4}
        title="Preview and publish"
        description="This is exactly what editors and leadership will see. Publish when it’s ready."
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[#d4d4d8]" />
          <span className="h-2 w-2 rounded-full bg-[#d4d4d8]" />
          <span className="h-2 w-2 rounded-full bg-[#d4d4d8]" />
          <span className="ml-2 font-medium">Live preview — try it, this is real</span>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          {cards.length > 0 ? (
            cards.map((card) => (
              <ProgrammePortfolioCard
                key={card.key}
                status={card.status}
                title={card.record.title}
                metaLine={[
                  card.record.code,
                  card.record.iatiId,
                  card.record.geography,
                  card.record.budget,
                ].join(' · ')}
                score={card.score}
                trend={card.trend}
                trendPoints={card.trendPoints}
                summary={card.summary}
                areas={card.areas}
                lastReviewRelative={card.lastReviewRelative}
                docsChanged={card.docsChanged}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Add check steps in Design to preview programme cards with a full RAG area bar.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Status</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Draft is only visible to admins. Publishing makes it visible to everyone with access.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs text-muted-foreground">Draft</span>
          <button
            type="button"
            role="switch"
            aria-checked={preferLive}
            onClick={() => onPreferLiveChange(!preferLive)}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              preferLive ? 'bg-primary' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                preferLive && 'translate-x-5',
              )}
            />
          </button>
          <span className="font-mono text-xs text-muted-foreground">Live</span>
        </div>
      </div>
    </div>
  );
}
