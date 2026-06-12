import { ArrowLeft } from 'lucide-react';
import { cn } from './utils';

interface BackLinkProps {
  onClick: () => void;
  className?: string;
}

export function BackLink({ onClick, className }: BackLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 text-[14px] leading-[22px] font-medium text-[#64748B] transition-colors hover:text-[#334155]',
        className,
      )}
    >
      <ArrowLeft size={16} strokeWidth={2} />
      <span>Back</span>
    </button>
  );
}
