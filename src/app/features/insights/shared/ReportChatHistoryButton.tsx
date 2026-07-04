import { History } from 'lucide-react';
import { cn } from '../../../components/ui/utils';

interface ReportChatHistoryButtonProps {
  onClick: () => void;
  className?: string;
}

export function ReportChatHistoryButton({ onClick, className }: ReportChatHistoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="View chat history"
      className={cn(
        'group inline-flex h-8 shrink-0 items-center gap-1.5 text-[0.75rem] font-medium text-[#6B7280] transition-colors hover:text-[#2463EB]',
        className,
      )}
    >
      <History size={14} className="text-[#6B7280] group-hover:text-[#2463EB]" />
      <span>History</span>
    </button>
  );
}
