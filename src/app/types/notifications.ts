export type NotificationAction =
  | { type: 'open-chat'; threadId: string }
  | { type: 'open-invite'; threadId: string }
  | { type: 'join-shared-chat'; threadId: string }
  | { type: 'open-briefing'; threadId: string }
  | {
      type: 'navigate';
      view:
        | 'home'
        | 'riskIQ'
        | 'resources'
        | 'resourcesHub'
        | 'reports'
        | 'customWorkflows'
        | 'approvals'
        | 'platformChats';
    };

export type NotificationKind =
  | 'chat-reply'
  | 'briefing'
  | 'workspace-sync'
  | 'doc-sync'
  | 'chat-added'
  | 'invite'
  | 'shared-thread'
  | 'resource-shared'
  | 'report-ready'
  | 'report-shared'
  | 'workflow-alert'
  | 'access-approved';

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
