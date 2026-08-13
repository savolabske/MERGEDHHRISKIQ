import type { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** Short title, e.g. "Delete resource?" */
  title?: string;
  /** Body copy explaining what will be deleted. */
  description?: ReactNode;
  /** Confirm button label. Defaults to "Delete". */
  confirmLabel?: string;
  /** Override confirm button classes. Defaults to destructive. */
  confirmClassName?: string;
}

/**
 * Shared "Are you sure you want to delete?" prompt for destructive actions.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Are you sure you want to delete?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  confirmClassName,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground text-sm space-y-2">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={confirmClassName ?? 'bg-destructive hover:bg-destructive-text'}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
