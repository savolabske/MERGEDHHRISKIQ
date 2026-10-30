import { useState } from 'react';
import { Bell, CircleHelp, Menu, Sparkles, X } from 'lucide-react';
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
import { brandHomeButtonClass, iconButtonClass } from './ui/interaction';
import { WHATS_NEW_PAGE_HREF } from './WhatsNewPage';
import { APP_VERSION } from '../data/releases';
import { useUnseenRelease } from '../hooks/useUnseenRelease';

const HELP_CENTRE_EMAIL = 'alerts.rmu@undp.org';

const helpMenuItemClass =
  'cursor-pointer gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground';

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
  const [hasUnseenRelease, markReleaseSeen] = useUnseenRelease();
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
                className={cn(iconButtonClass, 'lg:hidden -ml-1')}
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
              className={brandHomeButtonClass}
            >
              <span className="block truncate text-sm font-semibold tracking-tight text-primary uppercase">
                HUMANITY HUB
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              className={cn(
                iconButtonClass,
                'relative text-muted-foreground hover:text-foreground hover:bg-muted',
                panelOpen && 'bg-muted text-foreground',
                badge && 'text-primary',
              )}
              aria-label={
                badge
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications, no unread items'
              }
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen(true)}
            >
              <span className="relative inline-flex shrink-0 items-center justify-center">
                <Bell size={22} strokeWidth={1.75} aria-hidden />
                {badge && (
                  <span
                    className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-semibold leading-none text-destructive-foreground ring-2 ring-card tabular-nums"
                    aria-hidden
                  >
                    {badge}
                  </span>
                )}
              </span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(iconButtonClass, 'relative')}
                  aria-label={
                    hasUnseenRelease ? 'Help and support, new release available' : 'Help and support'
                  }
                >
                  <CircleHelp size={20} strokeWidth={1.75} aria-hidden />
                  {hasUnseenRelease && (
                    <span
                      className="pointer-events-none absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-card"
                      aria-hidden
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-1.5">
                <DropdownMenuItem asChild className={helpMenuItemClass}>
                  <a href={`mailto:${HELP_CENTRE_EMAIL}`}>
                    <CircleHelp size={16} strokeWidth={1.75} aria-hidden />
                    Help centre
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={helpMenuItemClass}>
                  <a
                    href={WHATS_NEW_PAGE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={markReleaseSeen}
                  >
                    <Sparkles size={16} strokeWidth={1.75} aria-hidden />
                    Changelog
                    {hasUnseenRelease && (
                      <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary-text">
                        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                        New
                      </span>
                    )}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-3 py-1.5 text-xs font-normal text-text-subtle">
                  Version {APP_VERSION}
                </DropdownMenuLabel>
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
