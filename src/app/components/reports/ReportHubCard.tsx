import { forwardRef, type ReactNode, type Ref } from 'react';
import { ChevronLeft, ChevronRight, EyeOff, GripVertical } from 'lucide-react';
import { cn } from '../ui/utils';
import type { ReportHubCardData } from './reportHubTypes';

export type ReportHubCardMode = 'browse' | 'edit';

interface ReportHubCardProps {
  report: ReportHubCardData;
  mode: ReportHubCardMode;
  onOpen?: () => void;
  onHide?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  dragHandleRef?: Ref<HTMLButtonElement>;
  className?: string;
}

export const ReportHubCard = forwardRef<HTMLDivElement, ReportHubCardProps>(function ReportHubCard(
  {
    report,
    mode,
    onOpen,
    onHide,
    onMoveLeft,
    onMoveRight,
    canMoveLeft = false,
    canMoveRight = false,
    isDragging = false,
    isDropTarget = false,
    dragHandleRef,
    className,
  },
  ref,
) {
  const Icon = report.IconComponent;
  const isEdit = mode === 'edit';

  return (
    <div
      ref={ref}
      onClick={!isEdit && report.available ? onOpen : undefined}
      className={cn(
        'relative bg-card rounded-2xl p-6 flex flex-col transition-all',
        isEdit
          ? 'border-2 border-dashed border-primary/40 shadow-sm cursor-default'
          : cn(
              'border border-border',
              report.available
                ? 'cursor-pointer hover:border-primary hover:shadow-lg group'
                : 'opacity-90',
            ),
        isDragging && 'opacity-50 scale-[0.98]',
        isDropTarget && 'ring-2 ring-primary ring-offset-2',
        className,
      )}
    >
      {isEdit && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <button
            ref={dragHandleRef}
            type="button"
            aria-label={`Drag to reorder ${report.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={18} />
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft?.();
              }}
              disabled={!canMoveLeft}
              aria-label={`Move ${report.title} left`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none sm:hidden"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveRight?.();
              }}
              disabled={!canMoveRight}
              aria-label={`Move ${report.title} right`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none sm:hidden"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onHide?.();
              }}
              aria-label={`Hide ${report.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <EyeOff size={17} />
            </button>
          </div>
        </div>
      )}

      {!report.available && !isEdit && (
        <span className="absolute top-5 right-5 text-metadata uppercase tracking-wide bg-muted px-2.5 py-1 rounded-full">
          Coming soon
        </span>
      )}

      <div className={cn(isEdit && 'mt-8')}>
        <div
          className={`w-11 h-11 ${report.iconBg} rounded-xl flex items-center justify-center mb-5`}
        >
          <Icon size={22} className={report.iconColor} />
        </div>

        <h3
          className={cn(
            'text-base font-bold text-foreground-emphasis mb-2',
            !isEdit && report.available && 'group-hover:text-primary transition-colors',
            !isEdit && !report.available && 'pr-24',
          )}
        >
          {report.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
      </div>

      {isEdit && (
        <div className="mt-4 hidden sm:flex items-center gap-1 border-t border-border/60 pt-3">
          <MoveButton
            label="Move left"
            disabled={!canMoveLeft}
            onClick={onMoveLeft}
          >
            <ChevronLeft size={16} />
          </MoveButton>
          <MoveButton
            label="Move right"
            disabled={!canMoveRight}
            onClick={onMoveRight}
          >
            <ChevronRight size={16} />
          </MoveButton>
        </div>
      )}
    </div>
  );
});

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </button>
  );
}
