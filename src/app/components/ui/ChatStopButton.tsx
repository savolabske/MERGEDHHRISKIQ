import { CornerDownLeft } from 'lucide-react';
import { cn } from './utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const sizeClasses = {
  sm: {
    button: 'size-8',
    square: 'h-2.5 w-2.5',
  },
  md: {
    button: 'size-10',
    square: 'h-3 w-3',
  },
} as const;

interface ChatStopButtonProps {
  onClick: () => void;
  className?: string;
  size?: keyof typeof sizeClasses;
}

export function ChatStopButton({
  onClick,
  className,
  size = 'md',
}: ChatStopButtonProps) {
  const sizes = sizeClasses[size];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label="Stop answering"
          className={cn(
            'rounded-full bg-foreground hover:bg-foreground/90 flex items-center justify-center transition-colors cursor-pointer',
            sizes.button,
            className,
          )}
        >
          <span
            className={cn('block rounded-[2px] bg-background', sizes.square)}
            aria-hidden
          />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        showArrow={false}
        className="flex items-center gap-2 rounded-lg border-0 bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md"
      >
        Stop answering
        <CornerDownLeft size={12} strokeWidth={2.25} className="opacity-80" aria-hidden />
      </TooltipContent>
    </Tooltip>
  );
}
