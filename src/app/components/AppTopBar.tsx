import { useState } from 'react';
import { Bell, CircleHelp, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { NotificationsPanel } from './NotificationsPanel';
import type { AppNotification } from '../types/notifications';
import { cn } from './ui/utils';

const HELP_CENTRE_EMAIL = 'alerts.rmu@undp.org';

const helpCentreItemClass =
  'cursor-pointer justify-center rounded-md bg-secondary px-3 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary/80 focus:text-secondary-foreground data-[highlighted]:bg-secondary/80 data-[highlighted]:text-secondary-foreground';

/** Matches icon controls across lists, modals, and admin screens (rounded-lg + muted hover). */
const topBarIconButtonClass =
  'inline-flex items-center justify-center size-10 shrink-0 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-muted data-[state=open]:text-foreground';

interface AppTopBarProps {
  onNavigateHome?: () => void;
  notifications?: AppNotification[];
  onNotificationClick?: (notification: AppNotification) => void;
  onMarkAllNotificationsRead?: () => void;
  showMobileMenuButton?: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  className?: string;
}

export function AppTopBar({
  onNavigateHome,
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsRead,
  showMobileMenuButton = true,
  isMobileMenuOpen = false,
  onMobileMenuToggle,
  className,
}: AppTopBarProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const unreadCount = notifications.filter((item) => item.unread).length;
  const badge =
    unreadCount > 0 ? (unreadCount > 9 ? '9+' : String(unreadCount)) : null;

  const handleNotificationClick = (notification: AppNotification) => {
    onNotificationClick?.(notification);
    setPanelOpen(false);
  };

  return (
    <>
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
                {isMobileMenuOpen ? (
                  <X size={20} strokeWidth={1.75} />
                ) : (
                  <Menu size={20} strokeWidth={1.75} />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateHome}
              className="group min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-md px-0.5 -mx-0.5"
            >
              <span className="block truncate text-[15px] font-semibold tracking-tight text-primary uppercase">
                HUMANITY HUB
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              className={cn(
                topBarIconButtonClass,
                'relative text-primary hover:text-primary-text hover:bg-muted',
                panelOpen && 'bg-muted text-foreground',
              )}
              aria-label={
                badge
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications, no unread items'
              }
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen(true)}
            >
              <span className="relative inline-flex shrink-0">
                <Bell
                  size={24}
                  strokeWidth={badge ? 2.25 : 2}
                  className={badge ? 'fill-white' : undefined}
                  aria-hidden
                />
                {badge && (
                  <span
                    className="pointer-events-none absolute -top-2 -right-1.5 flex size-5 items-center justify-center"
                    aria-hidden
                  >
                    <span className="absolute inset-0 scale-125 rounded-full bg-destructive/30 animate-pulse" />
                    <span className="relative flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold leading-none text-destructive-foreground shadow-[0_1px_3px_rgba(0,0,0,0.25)] ring-2 ring-card">
                      {badge}
                    </span>
                  </span>
                )}
              </span>
            </button>

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
                <DropdownMenuItem asChild className={helpCentreItemClass}>
                  <a href={`mailto:${HELP_CENTRE_EMAIL}`}>Help centre</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <NotificationsPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={() => onMarkAllNotificationsRead?.()}
      />
    </>
  );
}
