import { cn } from '../../../components/ui/utils';
import { chipButtonClass } from '../../../components/ui/interaction';

interface ReportChipButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function ReportChipButton({ label, onClick, className }: ReportChipButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(chipButtonClass, '!text-[10.5px]', className)}
    >
      {label}
    </button>
  );
}
