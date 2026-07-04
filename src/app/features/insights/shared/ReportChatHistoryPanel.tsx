import { useState } from 'react';
import { ArrowLeft, Clock, MoreVertical, Pin, PinOff, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { cn } from '../../../components/ui/utils';
import {
  formatReportHistoryTimeAgo,
  type ReportChatHistoryItem,
} from './reportChatHistory';

interface ReportChatHistoryBackButtonProps {
  onClick: () => void;
  className?: string;
}

export function ReportChatHistoryBackButton({ onClick, className }: ReportChatHistoryBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group inline-flex h-8 shrink-0 items-center gap-1.5 text-[0.75rem] font-medium text-[#6B7280] transition-colors hover:text-[#2463EB]',
        className,
      )}
    >
      <ArrowLeft size={14} className="text-[#6B7280] group-hover:text-[#2463EB]" />
      <span>Back</span>
    </button>
  );
}

interface ReportChatHistoryPanelProps {
  items: ReportChatHistoryItem[];
  onSelect: (item: ReportChatHistoryItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  accentClassName?: string;
  emptyClassName?: string;
}

function HistoryItemMenu({
  item,
  onRequestDelete,
  onTogglePin,
}: {
  item: ReportChatHistoryItem;
  onRequestDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#6B7280]"
        aria-label="Chat history actions"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTogglePin(item.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.8125rem] text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            >
              {item.pinned ? <PinOff size={14} /> : <Pin size={14} />}
              {item.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRequestDelete(item.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.8125rem] text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ReportChatHistoryPanel({
  items,
  onSelect,
  onDelete,
  onTogglePin,
  accentClassName = 'hover:border-[#1D4ED8]',
  emptyClassName = 'text-[#6B7280]',
}: ReportChatHistoryPanelProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteTarget = deleteId ? items.find((item) => item.id === deleteId) : null;

  const confirmDelete = () => {
    if (!deleteId) return;
    onDelete(deleteId);
    setDeleteId(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-2 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F4F6]">
          <Clock size={22} className="text-[#9CA3AF]" />
        </div>
        <p className="mb-1 text-[0.8125rem] font-semibold text-[#1f2937]">No history yet</p>
        <p className={cn('text-[0.75rem] leading-relaxed', emptyClassName)}>
          Your conversations will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2.5">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'group relative rounded-xl border border-[#E5E7EB] p-3 transition-all hover:shadow-sm',
            item.pinned && 'border-[#BFDBFE] bg-[#F8FBFF]',
            accentClassName,
          )}
        >
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="mb-1 flex items-start gap-1.5">
                {item.pinned && (
                  <Pin size={12} className="mt-0.5 shrink-0 text-[#2463EB]" aria-hidden />
                )}
                <p className="line-clamp-2 text-[0.8125rem] font-medium text-[#1f2937] transition-colors group-hover:text-[#2463EB]">
                  {item.title}
                </p>
              </div>
              <p className="text-[0.6875rem] text-[#9CA3AF]">
                <Clock size={11} className="mr-1 inline" />
                {formatReportHistoryTimeAgo(item.timestamp)} · {item.messageCount} message
                {item.messageCount === 1 ? '' : 's'}
              </p>
            </button>

            <HistoryItemMenu
              item={item}
              onRequestDelete={setDeleteId}
              onTogglePin={onTogglePin}
            />
          </div>
        </div>
      ))}
      </div>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete chat from history?</AlertDialogTitle>
          <AlertDialogDescription>
            {deleteTarget
              ? `"${deleteTarget.title}" will be permanently removed from your chat history.`
              : 'This chat will be permanently removed from your chat history.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive hover:bg-destructive-text"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
