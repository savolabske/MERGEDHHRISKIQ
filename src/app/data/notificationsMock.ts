import { palette } from '../theme/palette';
import type { AppNotification } from '../types/notifications';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-chat-reply',
    kind: 'chat-reply',
    title: 'Shared chat update',
    description: 'Amina Hassan replied in your cholera trends thread.',
    time: '12 min ago',
    dayGroup: 'today',
    unread: true,
    action: { type: 'open-chat', threadId: '2' },
    actorName: 'Amina Hassan',
    actorInitials: 'AH',
    actorColor: palette.warning,
    ctaLabel: 'Open chat',
  },
  {
    id: 'notif-briefing',
    kind: 'briefing',
    title: 'Briefing ready',
    description: 'February operational risk summary is available in Risk IQ.',
    time: '2 hr ago',
    dayGroup: 'today',
    unread: true,
    action: { type: 'open-briefing', threadId: '4' },
    ctaLabel: 'View briefing',
  },
  {
    id: 'notif-chat-added',
    kind: 'chat-added',
    title: 'John Osman added you to chat',
    description: 'Security incidents in Lower Shabelle in the last 30 days',
    time: '8 minutes ago',
    dayGroup: 'today',
    unread: true,
    action: { type: 'join-shared-chat', threadId: '1' },
    actorName: 'John Osman',
    actorInitials: 'JO',
    actorColor: palette.info,
    ctaLabel: 'Join chat',
  },
  {
    id: 'notif-invite',
    kind: 'invite',
    title: 'Amina Hassan sent you an invite link',
    description: 'What are the cholera outbreak trends in Baidoa IDP camps?',
    time: '43 minutes ago',
    dayGroup: 'today',
    unread: true,
    action: { type: 'open-invite', threadId: '2' },
    actorName: 'Amina Hassan',
    actorInitials: 'AH',
    actorColor: palette.warning,
    ctaLabel: 'Preview invite',
  },
  {
    id: 'notif-shared-thread',
    kind: 'shared-thread',
    title: 'A thread has been shared with you',
    description: 'Show escalating security threats in South-Central Somalia',
    time: '2 hours ago',
    dayGroup: 'today',
    unread: true,
    action: { type: 'join-shared-chat', threadId: '18' },
    useAlertAvatar: true,
    ctaLabel: 'Open Shared Chat',
  },
  {
    id: 'notif-workspace-sync',
    kind: 'workspace-sync',
    title: 'Workspace sync',
    description: 'Humanitarian snapshot data refreshed overnight.',
    time: 'Yesterday',
    dayGroup: 'yesterday',
    unread: false,
    action: { type: 'navigate', view: 'home' },
  },
];

export function getDayGroupLabel(group: AppNotification['dayGroup']): string {
  if (group === 'today') return 'Today';
  if (group === 'yesterday') return 'Yesterday';
  return 'Earlier';
}
