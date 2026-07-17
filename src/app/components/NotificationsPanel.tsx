import {
  AlertTriangle,
  Bell,
  FileCheck2,
  FileText,
  MessageSquare,
  RefreshCw,
  Share2,
  X,
} from 'lucide-react';
import type {
  AppNotification,
  NotificationDayGroup,
  NotificationKind,
} from '../types/notifications';
import { getDayGroupLabel } from '../data/notificationsMock';
import { Sheet, SheetClose, SheetContent, SheetTitle } from './ui/sheet';
import { cn } from './ui/utils';

const DAY_GROUP_ORDER: NotificationDayGroup[] = ['today', 'yesterday', 'earlier'];

const KIND_FOOTER_ICON: Record<
  NotificationKind,
  typeof Share2
> = {
  'chat-reply': MessageSquare,
  'chat-added': MessageSquare,
  invite: Share2,
  'shared-thread': AlertTriangle,
  briefing: FileText,
  'doc-sync': FileCheck2,
  'workspace-sync': RefreshCw,
};

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: AppNotification[];
  onNotificationClick: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
}

function NotificationAvatar({ notification }: { notification: AppNotification }) {
  if (notification.useAlertAvatar) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive-subtle text-destructive-text">
        <AlertTriangle size={18} strokeWidth={1.75} aria-hidden />
      </div>
    );
  }

  if (notification.kind === 'doc-sync' || notification.kind === 'workspace-sync') {
    const Icon = notification.kind === 'doc-sync' ? FileCheck2 : RefreshCw;
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <Icon size={18} strokeWidth={1.75} aria-hidden />
      </div>
    );
  }

  const initials = notification.actorInitials ?? 'RI';
  const color = notification.actorColor ?? 'var(--primary)';

  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: AppNotification;
  onClick: () => void;
}) {
  const FooterIcon = KIND_FOOTER_ICON[notification.kind];
  const footerIcon = (
    <FooterIcon size={14} strokeWidth={1.75} className="text-muted-foreground" aria-hidden />
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        notification.ctaLabel
          ? `${notification.title}. ${notification.ctaLabel}`
          : notification.title
      }
      className={cn(
        'group w-full cursor-pointer text-left px-5 py-4 transition-colors',
        'hover:bg-muted/40 active:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30',
      )}
    >
      <div className="flex gap-3">
        <span className="mt-3.5 flex w-2 shrink-0 justify-center">
          {notification.unread && (
            <span
              className="size-2 rounded-full bg-primary"
              aria-hidden
            />
          )}
        </span>
        <NotificationAvatar notification={notification} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-snug">{notification.title}</p>
          <p className="mt-1 text-sm text-muted-foreground leading-snug">{notification.description}</p>
          {notification.ctaLabel && (
            <p className="mt-2 text-sm font-medium text-primary">
              {notification.ctaLabel}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {footerIcon}
            <span>{notification.time}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function NotificationsPanel({
  open,
  onOpenChange,
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((item) => item.unread).length;
  const grouped = DAY_GROUP_ORDER.map((group) => ({
    group,
    items: notifications.filter((item) => item.dayGroup === group),
  })).filter((section) => section.items.length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[420px] [&>button.absolute]:hidden"
      >
        <SheetTitle className="sr-only">Notifications</SheetTitle>

        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <Bell size={18} strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
              >
                Mark all read
              </button>
            )}
            <SheetClose
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <X size={20} strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex-1 overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
              <p className="mt-1 text-sm text-muted-foreground">No new notifications right now.</p>
            </div>
          ) : (
            grouped.map((section) => (
              <section key={section.group}>
                <div className="bg-muted/60 px-5 py-2">
                  <h3 className="text-xs font-semibold text-muted-foreground">
                    {getDayGroupLabel(section.group)}
                  </h3>
                </div>
                <div className="h-px bg-border" />
                {section.items.map((notification, index) => (
                  <div key={notification.id}>
                    <NotificationRow
                      notification={notification}
                      onClick={() => onNotificationClick(notification)}
                    />
                    {index < section.items.length - 1 && <div className="h-px bg-border" />}
                  </div>
                ))}
              </section>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
