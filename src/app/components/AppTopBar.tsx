import { Bell, CircleHelp, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';

/** Matches icon controls across lists, modals, and admin screens (rounded-lg + muted hover). */
const topBarIconButtonClass =
  'inline-flex items-center justify-center size-10 shrink-0 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-muted data-[state=open]:text-foreground';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}

interface AppTopBarProps {
  onNavigateHome?: () => void;
  notificationCount?: number;
  notifications?: AppNotification[];
  showMobileMenuButton?: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  className?: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Shared chat update',
    description: 'Amina Hassan replied in your cholera trends thread.',
    time: '12 min ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Briefing ready',
    description: 'February operational risk summary is available in Risk IQ.',
    time: '2 hr ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Workspace sync',
    description: 'Humanitarian snapshot data refreshed overnight.',
    time: 'Yesterday',
    unread: false,
  },
];

export function AppTopBar({
  onNavigateHome,
  notificationCount = 0,
  notifications = DEFAULT_NOTIFICATIONS,
  showMobileMenuButton = true,
  isMobileMenuOpen = false,
  onMobileMenuToggle,
  className,
}: AppTopBarProps) {
  const badge =
    notificationCount > 0
      ? notificationCount > 9
        ? '9+'
        : String(notificationCount)
      : null;

  return (
    <header
      className={cn(
        'shrink-0 z-20 border-b border-border bg-card/95 px-4 sm:px-8 backdrop-blur supports-[backdrop-filter]:bg-card/80',
        className,
      )}
      role="banner"
    >
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
        {showMobileMenuButton && onMobileMenuToggle && (
          <button
            type="button"
            className={cn(topBarIconButtonClass, 'lg:hidden -ml-1')}
            onClick={onMobileMenuToggle}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        )}

        <button
          type="button"
          onClick={onNavigateHome}
          className="group min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-md px-0.5 -mx-0.5"
        >
          <span className="block truncate text-[15px] font-semibold tracking-tight text-foreground-emphasis group-hover:text-primary transition-colors">
            Humanity Hub
          </span>
        </button>
      </div>

        <div className="flex items-center gap-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                topBarIconButtonClass,
                'relative text-primary hover:text-primary-text hover:bg-muted',
              )}
              aria-label={
                badge
                  ? `Notifications, ${notificationCount} unread`
                  : 'Notifications, no unread items'
              }
            >
              <Bell size={22} strokeWidth={2} aria-hidden />
              {badge && (
                <span
                  className="pointer-events-none absolute -top-0.5 -right-0.5 flex min-w-[20px] h-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold leading-none text-destructive-foreground shadow-sm ring-2 ring-card"
                  aria-hidden
                >
                  {badge}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[min(100vw-2rem,320px)]">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex flex-col items-start gap-0.5 py-2.5 cursor-default focus:bg-muted"
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    {item.unread && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground leading-snug">{item.description}</span>
                  <span className="text-[11px] text-text-subtle mt-0.5">{item.time}</span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-primary font-medium justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={topBarIconButtonClass}
              aria-label="Help and support"
            >
              <CircleHelp size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Support
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Help center</DropdownMenuItem>
            <DropdownMenuItem>Contact field support</DropdownMenuItem>
            <DropdownMenuItem>Report a platform issue</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
