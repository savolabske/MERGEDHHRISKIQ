import { ReportUserGroupSelect } from '../manage-reports/ReportUserGroupSelect';
import { WizardStepHeader } from './WorkflowWizard';

interface WorkflowWizardAccessProps {
  admins: string[];
  editors: string[];
  viewers: string[];
  onChangeAdmins: (groups: string[]) => void;
  onChangeEditors: (groups: string[]) => void;
  onChangeViewers: (groups: string[]) => void;
  siblingWorkflowName?: string;
}

export function WorkflowWizardAccess({
  admins,
  editors,
  viewers,
  onChangeAdmins,
  onChangeEditors,
  onChangeViewers,
  siblingWorkflowName = 'FCDO Compliance Review',
}: WorkflowWizardAccessProps) {
  return (
    <div>
      <WizardStepHeader
        step={3}
        title="Who can access this"
        description="Each workflow’s access and data stand apart from every other workflow."
      />

      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Admins — manage the workflow</p>
          <ReportUserGroupSelect
            selected={admins}
            onChange={onChangeAdmins}
            showCount={false}
            helperText=""
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Editors — add records, upload evidence
          </p>
          <ReportUserGroupSelect
            selected={editors}
            onChange={onChangeEditors}
            showCount={false}
            helperText=""
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Viewers — read only</p>
          <ReportUserGroupSelect
            selected={viewers}
            onChange={onChangeViewers}
            showCount={false}
            helperText=""
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3.5">
          <p className="text-sm font-semibold text-foreground">Separate by design</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            This workflow’s records, documents and assessments are stored separately from{' '}
            {siblingWorkflowName} and every other workflow. Nothing here is visible there, and
            nothing there is visible here.
          </p>
        </div>
      </div>
    </div>
  );
}
