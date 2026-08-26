import { WORKFLOW_CREATE_SUGGESTIONS } from '../../data/workflowAiMock';
import { WizardStepHeader } from './WorkflowWizard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';

export interface WorkflowDescribeValues {
  name: string;
  recordType: string;
  description: string;
  ratingStyle: string;
}

interface WorkflowWizardDescribeProps {
  values: WorkflowDescribeValues;
  onChange: (values: WorkflowDescribeValues) => void;
}

const RATING_STYLE_OPTIONS = [
  'Red / Amber / Green',
  'Score only',
] as const;

const fieldLabelClass =
  'mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const fieldInputClass =
  'w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary';

export function WorkflowWizardDescribe({ values, onChange }: WorkflowWizardDescribeProps) {
  const applySuggestion = (s: (typeof WORKFLOW_CREATE_SUGGESTIONS)[number]) => {
    onChange({
      ...values,
      name: s.name,
      recordType: s.recordType,
      description: s.prompt,
    });
  };

  return (
    <div>
      <WizardStepHeader
        step={1}
        title="Describe the workflow"
        description="Write what it should do in plain language. The AI turns this into a visual workflow you can open, edit and rearrange."
      />

      <div className="space-y-5">
        <div>
          <label className={fieldLabelClass} htmlFor="wf-name">
            Workflow name
          </label>
          <input
            id="wf-name"
            type="text"
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            placeholder="e.g. IOM Project Compliance Monitor"
            className={fieldInputClass}
          />
        </div>

        <div>
          <label className={fieldLabelClass} htmlFor="wf-record">
            What are you assessing?
          </label>
          <input
            id="wf-record"
            type="text"
            value={values.recordType}
            onChange={(e) => onChange({ ...values, recordType: e.target.value })}
            placeholder="e.g. Project"
            className={fieldInputClass}
          />
        </div>

        <div>
          <label className={fieldLabelClass} htmlFor="wf-desc">
            Describe what this workflow should do
          </label>
          <textarea
            id="wf-desc"
            rows={6}
            value={values.description}
            onChange={(e) => onChange({ ...values, description: e.target.value })}
            placeholder="Track all active projects and give leadership a live view of compliance health…"
            className={cn(fieldInputClass, 'min-h-[118px] resize-y leading-relaxed')}
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {WORKFLOW_CREATE_SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => applySuggestion(s)}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                Try: {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={fieldLabelClass} htmlFor="wf-rating">
            Rating style
          </label>
          <Select
            value={values.ratingStyle}
            onValueChange={(ratingStyle) => onChange({ ...values, ratingStyle })}
          >
            <SelectTrigger
              id="wf-rating"
              className="h-auto w-full rounded-xl border-border bg-white px-3.5 py-2.5 text-sm text-foreground shadow-none focus:border-primary focus-visible:border-primary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_STYLE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
