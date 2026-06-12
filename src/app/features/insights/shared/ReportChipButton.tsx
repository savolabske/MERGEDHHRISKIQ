import { cn } from '../../../components/ui/utils';

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
      className={cn(
        'rounded-full border bg-white px-2.5 py-1 text-left text-[10.5px] font-medium leading-snug !text-[10.5px] transition',
        className,
      )}
    >
      {label}
    </button>
  );
}
