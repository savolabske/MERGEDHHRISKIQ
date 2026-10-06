import { CircleAlert, RotateCcw } from 'lucide-react';
import { cn } from './utils';

export const CHAT_REQUEST_ERROR_MESSAGE =
  'There was an error generating your response. Please try again.';

export const CHAT_REQUEST_ERROR_TITLE = 'There was an error generating your response.';

export const CHAT_REQUEST_ERROR_DETAIL = 'Please try again.';

export const CHAT_KNOWLEDGE_BASE_ERROR_MESSAGE = CHAT_REQUEST_ERROR_MESSAGE;

export const CHAT_KNOWLEDGE_BASE_ONLY_ERROR_MESSAGE = CHAT_REQUEST_ERROR_MESSAGE;

export const CHAT_KNOWLEDGE_BASE_RETRY_LABEL = 'Try again';

interface ChatRequestErrorProps {
  onRetry: () => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
  /** Optional override. Shown with `detail` on the same line when both are set. */
  title?: string;
  detail?: string;
  /** Full message. Defaults to the shared error copy. */
  message?: string;
  retryLabel?: string;
}

export function ChatRequestError({
  onRetry,
  disabled = false,
  className,
  compact = false,
  title,
  detail,
  message = CHAT_REQUEST_ERROR_MESSAGE,
  retryLabel = CHAT_KNOWLEDGE_BASE_RETRY_LABEL,
}: ChatRequestErrorProps) {
  const text = (title ? (detail ? `${title} ${detail}` : title) : message).replace(/\s*\n\s*/g, ' ');

  return (
    <div
      role="alert"
      className={cn(
        'flex max-w-3xl items-center justify-between rounded-xl border border-[#f3d4d4] bg-[#fff6f6]',
        compact ? 'gap-3 px-3 py-3' : 'gap-4 px-4 py-3.5',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <CircleAlert
          className={cn('mt-0.5 shrink-0 text-destructive-text', compact ? 'size-3.5' : 'size-4')}
          strokeWidth={2}
          aria-hidden
        />
        <p
          className={cn(
            'min-w-0 font-medium text-destructive-text',
            compact ? 'text-[13px] leading-snug' : 'text-sm leading-snug',
          )}
        >
          {text}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={disabled}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 self-center rounded-full border border-[#e7c4c4] bg-white font-medium text-destructive-text transition-colors',
          'hover:bg-[#fffafa] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25',
          'disabled:pointer-events-none disabled:opacity-50',
          compact ? 'px-2.5 py-1 text-[12px]' : 'px-3 py-1.5 text-sm',
        )}
      >
        <RotateCcw className="size-3.5" aria-hidden />
        {retryLabel}
      </button>
    </div>
  );
}
