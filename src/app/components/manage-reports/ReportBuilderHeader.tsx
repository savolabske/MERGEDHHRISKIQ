import { Settings, Eye } from 'lucide-react';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import type { ManagedReport } from '../../data/reportsAdminMock';
import { cn } from '../ui/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface ReportBuilderHeaderProps {
  report: ManagedReport;
  isDirty: boolean;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onOpenSettings: () => void;
  onPublish: () => void;
}

export function ReportBuilderHeader({
  report,
  isDirty,
  onBack,
  onTitleChange,
  onDescriptionChange,
  onOpenSettings,
  onPublish,
}: ReportBuilderHeaderProps) {
  const statusLabel = isDirty
    ? report.status === 'published'
      ? 'Published — unsaved changes'
      : 'Draft — unpublished changes'
    : report.status === 'published'
      ? 'Published'
      : 'Draft';

  const statusTone =
    report.status === 'published' && !isDirty
      ? 'success'
      : report.status === 'published' && isDirty
        ? 'warning'
        : 'warning';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageBreadcrumb
          items={[
            { label: 'Reports', onClick: onBack },
            { label: report.title },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Settings size={16} />
            Settings
          </button>
          <span
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium',
              statusTone === 'success'
                ? 'bg-success-subtle text-success-text'
                : 'bg-warning-subtle text-warning-text',
            )}
          >
            {statusLabel}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled
                  className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground opacity-60 cursor-not-allowed flex items-center gap-2"
                >
                  <Eye size={16} />
                  Preview
                </button>
              </TooltipTrigger>
              <TooltipContent>Available once sources are attached</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            type="button"
            onClick={onPublish}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="text"
          value={report.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-page-title bg-transparent border-none outline-none focus:ring-0 p-0"
          placeholder="Untitled report"
        />
        <input
          type="text"
          value={report.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none focus:ring-0 p-0"
          placeholder="Describe this report's purpose."
        />
      </div>
    </div>
  );
}
