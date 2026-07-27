import { useCallback, useState } from 'react';
import { Settings, Eye, Loader2, Check } from 'lucide-react';
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
  hasKnowledgeSources?: boolean;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onOpenSettings: () => void;
  onPublish: () => void | Promise<void>;
}

export function ReportBuilderHeader({
  report,
  isDirty,
  hasKnowledgeSources = true,
  onBack,
  onTitleChange,
  onDescriptionChange,
  onOpenSettings,
  onPublish,
}: ReportBuilderHeaderProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const isPublishedClean = report.status === 'published' && !isDirty;
  const isPublishChanges = report.status === 'published' && isDirty;

  const handlePublishClick = useCallback(async () => {
    if (isPublishing || isPublishedClean) return;

    setIsPublishing(true);
    try {
      await Promise.resolve(onPublish());
      setJustPublished(true);
      window.setTimeout(() => setJustPublished(false), 1200);
    } finally {
      setIsPublishing(false);
    }
  }, [isPublishing, isPublishedClean, onPublish]);

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
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
              statusTone === 'success'
                ? 'bg-success-subtle text-success-text'
                : 'bg-warning-subtle text-warning-text',
              justPublished && 'ring-2 ring-success/30',
            )}
          >
            {statusLabel}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={!hasKnowledgeSources}
                  className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground opacity-60 cursor-not-allowed flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed enabled:opacity-100 enabled:cursor-pointer enabled:text-foreground enabled:hover:bg-muted"
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
            onClick={handlePublishClick}
            disabled={isPublishing || isPublishedClean}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 min-w-[7.5rem] justify-center',
              isPublishing
                ? 'bg-primary text-white cursor-wait opacity-90'
                : isPublishedClean || justPublished
                  ? 'bg-success-subtle text-success-text cursor-default'
                  : 'bg-primary hover:bg-primary-hover text-white',
              (isPublishing || isPublishedClean) && 'disabled:opacity-100',
            )}
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Publishing…
              </>
            ) : justPublished || isPublishedClean ? (
              <>
                <Check size={16} />
                Published
              </>
            ) : isPublishChanges ? (
              'Publish changes'
            ) : (
              'Publish'
            )}
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
