import { useCallback, useState } from 'react';
import { Settings, Eye, Loader2, ChevronDown, EyeOff } from 'lucide-react';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import type { ManagedReport } from '../../data/reportsAdminMock';
import { cn } from '../ui/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ConfirmDeleteDialog } from '../ui/ConfirmDeleteDialog';

interface ReportBuilderHeaderProps {
  report: ManagedReport;
  isDirty: boolean;
  hasKnowledgeSources?: boolean;
  /** When true, only the breadcrumb stays visible (e.g. during prompt generation). */
  breadcrumbOnly?: boolean;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onOpenSettings: () => void;
  onPublish: () => void | Promise<void>;
  onUnpublish: () => void;
}

export function ReportBuilderHeader({
  report,
  isDirty,
  hasKnowledgeSources = true,
  breadcrumbOnly = false,
  onBack,
  onTitleChange,
  onDescriptionChange,
  onOpenSettings,
  onPublish,
  onUnpublish,
}: ReportBuilderHeaderProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  const isPublished = report.status === 'published';
  const canPublish = !isPublished || isDirty;
  const isPublishDisabled = isPublishing || !canPublish;

  const handlePublishClick = useCallback(async () => {
    if (isPublishDisabled) return;

    setIsPublishing(true);
    try {
      await Promise.resolve(onPublish());
    } finally {
      setIsPublishing(false);
    }
  }, [isPublishDisabled, onPublish]);

  const handleConfirmUnpublish = useCallback(() => {
    onUnpublish();
    setConfirmUnpublish(false);
  }, [onUnpublish]);

  const statusLabel = isDirty
    ? isPublished
      ? 'Published — unsaved changes'
      : 'Draft — unpublished changes'
    : isPublished
      ? 'Published'
      : 'Draft';

  const statusTone = isPublished && !isDirty ? 'success' : 'warning';

  return (
    <div className={breadcrumbOnly ? undefined : 'space-y-4'}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <PageBreadcrumb
          items={[
            { label: 'Reports', onClick: onBack },
            { label: report.title },
          ]}
        />
        {!breadcrumbOnly && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              Settings
            </button>

            {isPublished ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 inline-flex items-center gap-1.5 hover:opacity-90 max-w-full',
                      statusTone === 'success'
                        ? 'bg-success-subtle text-success-text'
                        : 'bg-warning-subtle text-warning-text',
                    )}
                  >
                    <span className="truncate">{statusLabel}</span>
                    <ChevronDown size={14} className="opacity-70 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setConfirmUnpublish(true)}
                  >
                    <EyeOff size={16} />
                    Unpublish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
                  'bg-warning-subtle text-warning-text',
                )}
              >
                {statusLabel}
              </span>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={!hasKnowledgeSources}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground opacity-60 cursor-not-allowed inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed enabled:opacity-100 enabled:cursor-pointer enabled:text-foreground enabled:hover:bg-muted"
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
              disabled={isPublishDisabled}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 min-w-[7.5rem] flex-1 sm:flex-none justify-center bg-primary text-white',
                isPublishing
                  ? 'cursor-wait opacity-90'
                  : canPublish
                    ? 'hover:bg-primary-hover'
                    : 'cursor-not-allowed opacity-50',
              )}
            >
              {isPublishing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Publishing…
                </>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        )}
      </div>

      {!breadcrumbOnly && (
        <>
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

          <ConfirmDeleteDialog
            open={confirmUnpublish}
            onOpenChange={setConfirmUnpublish}
            onConfirm={handleConfirmUnpublish}
            title="Unpublish report?"
            description={`"${report.title}" will be hidden from the Reports hub and moved to draft. You can publish it again later.`}
            confirmLabel="Unpublish"
          />
        </>
      )}
    </div>
  );
}
