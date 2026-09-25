import {
  ChatThinkingStatus,
  CHAT_THINKING_PHASES,
} from '../../../components/ui/ChatThinkingStatus';
import { cn } from '../../../components/ui/utils';

interface ReportThinkingIndicatorProps {
  className?: string;
  textClassName?: string;
  spinnerClassName?: string;
  /** Optional fixed message; otherwise rotates through contextual phases */
  message?: string;
  phases?: readonly string[];
  extendedKnowledge?: boolean;
  mode?: 'chat' | 'dashboard';
}

export function ReportThinkingIndicator({
  className,
  textClassName,
  spinnerClassName,
  message,
  phases,
  extendedKnowledge = false,
  mode = 'chat',
}: ReportThinkingIndicatorProps) {
  const resolvedPhases =
    phases ??
    (mode === 'dashboard'
      ? extendedKnowledge
        ? CHAT_THINKING_PHASES.reportDashboardExtended
        : CHAT_THINKING_PHASES.reportDashboard
      : CHAT_THINKING_PHASES.default);

  return (
    <ChatThinkingStatus
      message={message}
      phases={resolvedPhases}
      size="sm"
      className={cn(className)}
      textClassName={textClassName}
      spinnerClassName={spinnerClassName}
    />
  );
}
