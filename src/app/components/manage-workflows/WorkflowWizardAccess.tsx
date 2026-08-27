import { ReportUserGroupSelect } from '../manage-reports/ReportUserGroupSelect';
import { WizardStepHeader } from './WorkflowWizard';

interface WorkflowWizardAccessProps {
  admins: string[];
  editors: string[];
  viewers: string[];
  onChangeAdmins: (groups: string[]) => void;
  onChangeEditors: (groups: string[]) => void;
  onChangeViewers: (groups: string[]) => void;
}

export function WorkflowWizardAccess({
  admins,
  editors,
  viewers,
  onChangeAdmins,
  onChangeEditors,
  onChangeViewers,
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
      </div>
    </div>
  );
}
