import { cn } from './utils';

const sizeClasses = {
  sm: {
    button: 'size-8',
    icon: 14,
  },
  md: {
    button: 'size-9',
    icon: 16,
  },
  lg: {
    button: 'size-10',
    icon: 18,
  },
} as const;

interface ComposerSendButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  size?: keyof typeof sizeClasses;
  rounded?: 'full' | 'xl' | 'lg';
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

/** Paper-plane path used in the chat composer (screen 2). */
function SendPlaneIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M16.5 1.5L8.25 9.75M16.5 1.5L11.25 16.5L8.25 9.75M16.5 1.5L1.5 6.75L8.25 9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Shared composer send control — paper-plane icon with primary fill,
 * light-blue inactive state (primary @ reduced opacity), matching Hub home.
 */
export function ComposerSendButton({
  disabled = false,
  onClick,
  className,
  size = 'lg',
  rounded = 'xl',
  type = 'button',
  'aria-label': ariaLabel = 'Send message',
}: ComposerSendButtonProps) {
  const sizes = sizeClasses[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40',
        rounded === 'full' && 'rounded-full',
        rounded === 'xl' && 'rounded-xl',
        rounded === 'lg' && 'rounded-lg',
        sizes.button,
        className,
      )}
    >
      <SendPlaneIcon size={sizes.icon} />
    </button>
  );
}
