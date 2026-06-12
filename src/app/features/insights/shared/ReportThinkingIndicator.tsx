import { cn } from '../../../components/ui/utils';

interface ReportThinkingIndicatorProps {
  accentColor?: string;
  textClassName?: string;
  className?: string;
  message?: string;
}

export function ReportThinkingIndicator({
  accentColor = '#1f6feb',
  textClassName = 'text-[#6b7a8d]',
  className,
  message = 'Customizing the dashboard for your question…',
}: ReportThinkingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 rounded-xl px-3 py-2.5', className)}>
      <span className={cn('text-[12.5px]', textClassName)}>{message}</span>
      <span className="inline-flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="report-thinking-dot h-[7px] w-[7px] rounded-full"
            style={{ backgroundColor: accentColor, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </span>
    </div>
  );
}
