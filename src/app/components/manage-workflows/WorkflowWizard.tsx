import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import type { ReactNode } from 'react';
import type { WorkflowWizardStep } from '../../data/workflowAdminMock';
import { PageFooter } from '../PageFooter';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { WorkflowAdviserLayout } from './WorkflowAdviserLayout';

const STEP_LABELS = [
  'Describe',
  'Design',
  'Access',
  'Preview',
] as const;

interface WorkflowWizardProps {
  step: WorkflowWizardStep;
  workflowName?: string;
  onBackToList: () => void;
  onStepChange: (step: WorkflowWizardStep) => void;
  onCancel: () => void;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueDisabledReason?: string;
  publishMode?: boolean;
  children: ReactNode;
}

export function WorkflowWizard({
  step,
  workflowName,
  onBackToList,
  onStepChange,
  onCancel,
  onBack,
  onContinue,
  continueLabel,
  continueDisabled,
  continueDisabledReason,
  publishMode,
  children,
}: WorkflowWizardProps) {
  const nextLabel =
    continueLabel ??
    (step === 1 ? 'Design the workflow' : step === 4 ? 'Publish workflow' : 'Continue');

  return (
    <WorkflowAdviserLayout mode="wizard" workflowName={workflowName} step={step}>
      <div className="mx-auto w-full max-w-2xl space-y-6 pb-8">
        <PageBreadcrumb
          items={[
            { label: 'Manage Workflows', onClick: onBackToList },
            { label: workflowName?.trim() || 'New workflow' },
          ]}
        />

        <nav aria-label="Workflow create steps" className="mb-2 flex items-center justify-start gap-0">
          {([1, 2, 3, 4] as WorkflowWizardStep[]).map((n, i) => {
            const isActive = n === step;
            const isPast = n < step;
            const label = STEP_LABELS[i];

            return (
              <div key={n} className="flex items-center">
                {isActive ? (
                  <button
                    type="button"
                    aria-current="step"
                    aria-label={`Step ${n}: ${label}`}
                    className="flex h-9 items-center gap-2 rounded-full bg-primary pl-1.5 pr-3.5 text-white shadow-sm"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
                      {n}
                    </span>
                    <span className="text-sm font-semibold tracking-tight">{label}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => isPast && onStepChange(n)}
                    disabled={!isPast}
                    title={label}
                    aria-label={`Step ${n}: ${label}`}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      isPast
                        ? 'cursor-pointer bg-primary/15 text-primary hover:bg-primary/25'
                        : 'cursor-not-allowed bg-muted text-muted-foreground',
                    )}
                  >
                    {n}
                  </button>
                )}
                {i < 3 && (
                  <div
                    className={cn(
                      'mx-2 h-px w-6 sm:w-10',
                      n < step ? 'bg-primary/40' : 'bg-border',
                    )}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </nav>

        {children}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={step === 1 ? onCancel : onBack}
          >
            <ChevronLeft size={16} />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex flex-col items-end gap-1">
            {continueDisabled && continueDisabledReason ? (
              <p className="text-xs text-muted-foreground">{continueDisabledReason}</p>
            ) : null}
            <Button type="button" disabled={continueDisabled} onClick={onContinue}>
              {publishMode ? <Rocket size={16} /> : null}
              {nextLabel}
              {!publishMode ? <ChevronRight size={16} /> : null}
            </Button>
          </div>
        </div>

        <PageFooter />
      </div>
    </WorkflowAdviserLayout>
  );
}

export function WizardStepHeader({
  step,
  title,
  description,
}: {
  step: WorkflowWizardStep;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Step {step} of 4
      </p>
      <h2 className="mt-1.5 text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
