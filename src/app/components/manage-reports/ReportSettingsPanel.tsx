import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ManagedReport, ReportThemeId } from '../../data/reportsAdminMock';
import { REPORT_THEMES } from '../../data/reportsAdminMock';
import { resolveThemeId } from '../../data/reportThemeTokens';
import { ReportUserGroupSelect } from './ReportUserGroupSelect';
import { ReportBuilderSidePanel } from './ReportBuilderSidePanel';
import { cn } from '../ui/utils';

interface ReportSettingsPanelProps {
  report: ManagedReport;
  onClose: () => void;
  onSave: (updates: Partial<ManagedReport>, options?: { commit?: boolean }) => void;
}

export function ReportSettingsPanel({
  report,
  onClose,
  onSave,
}: ReportSettingsPanelProps) {
  const [themeId, setThemeId] = useState<ReportThemeId>(resolveThemeId(report.themeId));
  const [userGroups, setUserGroups] = useState<string[]>(report.userGroups);

  useEffect(() => {
    setThemeId(resolveThemeId(report.themeId));
    setUserGroups(report.userGroups);
  }, [report]);

  const handleClose = () => {
    onSave({ themeId, userGroups }, { commit: true });
    onClose();
  };

  const handleSave = () => {
    onSave({ themeId, userGroups }, { commit: true });
    onClose();
  };

  const handleThemeSelect = (id: ReportThemeId) => {
    setThemeId(id);
    onSave({ themeId: id });
  };

  return (
    <ReportBuilderSidePanel onClose={handleClose}>
      <div className="border-b border-border px-6 py-5 text-left relative shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 size-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X size={18} className="text-muted-foreground" />
        </button>
        <p className="label-caps text-muted-foreground">Report settings</p>
        <h2 className="text-xl font-semibold text-foreground mt-1 pr-8">{report.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-h-0">
        <div>
            <p className="label-caps mb-3">Theme</p>
            <div className="grid grid-cols-2 gap-3">
              {REPORT_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeSelect(theme.id)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-colors',
                    themeId === theme.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <div className="flex gap-1 mb-2 h-6">
                    <div
                      className="flex-1 rounded-md border border-black/5"
                      style={{ background: theme.bg }}
                    />
                    <div className="w-6 rounded-md" style={{ background: theme.accent }} />
                    <div
                      className="w-6 rounded-md"
                      style={{ background: theme.surface, border: '1px solid rgba(0,0,0,0.06)' }}
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground">{theme.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sets page background, card surfaces, KPI accents, chart palette, and section highlights.
            </p>
        </div>

        <ReportUserGroupSelect
          selected={userGroups}
          onChange={setUserGroups}
          placement="above"
        />
      </div>

      <div className="border-t border-border px-6 py-4 flex justify-end shrink-0">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          Save
        </button>
      </div>
    </ReportBuilderSidePanel>
  );
}
