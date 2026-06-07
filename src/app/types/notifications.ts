export type NotificationAction =
  | { type: 'open-chat'; threadId: string }
  | { type: 'open-invite'; threadId: string }
  | { type: 'join-shared-chat'; threadId: string }
  | { type: 'open-briefing'; threadId: string }
  | { type: 'navigate'; view: 'home' | 'riskIQ' };

export type NotificationKind =
  | 'chat-reply'
  | 'briefing'
  | 'workspace-sync'
  | 'chat-added'
  | 'invite'
  | 'shared-thread';

export type NotificationDayGroup = 'today' | 'yesterday' | 'earlier';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  time: string;
  dayGroup: NotificationDayGroup;
  unread: boolean;
  action: NotificationAction;
  actorName?: string;
  actorInitials?: string;
  actorColor?: string;
  ctaLabel?: string;
  useAlertAvatar?: boolean;
}
