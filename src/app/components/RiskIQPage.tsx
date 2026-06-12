import { useEffect, useRef } from 'react';
import {
  LayoutGrid,
  LayoutDashboard,
  MessagesSquare,
  Users,
  FolderKanban,
  Sparkles,
} from 'lucide-react';
import { Dashboard } from './Dashboard';
import { RiskMatrix } from './RiskMatrix';
import { RiskRegister } from './RiskRegister';
import { CollectiveRisk } from './CollectiveRisk';
import { Chats } from './Chats';
import type { RiskIqTab } from '../types/navigation';
import type { DashboardChatPayload } from '../utils/dashboardChatContext';
import { Button } from './ui/button';
import { useIsMobile } from './ui/use-mobile';
import { cn } from './ui/utils';

interface ChatHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  date: string;
  messages?: unknown[];
  sharedWith?: string[];
  shareMode?: 'outgoing' | 'incoming';
  createdBy?: string;
  createdByName?: string;
  unread?: boolean;
}

const TABS: {
  id: RiskIqTab;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'riskMatrix', label: 'Risk Matrix', shortLabel: 'Matrix', icon: LayoutGrid },
  { id: 'riskRegister', label: 'Internal Risks', shortLabel: 'Internal', icon: FolderKanban },
  { id: 'collectiveRisk', label: 'Collective Risks', shortLabel: 'Collective', icon: Users },
  { id: 'chats', label: 'Chats', shortLabel: 'Chats', icon: MessagesSquare },
];

interface RiskIQPageProps {
  activeTab: RiskIqTab;
  onTabChange: (tab: RiskIqTab) => void;
  onOpenChat: (payload: DashboardChatPayload) => void;
  onOpenBriefing?: () => void;
  onChatSelect?: (id: string) => void;
  onNewChat?: () => void;
  chatHistory?: ChatHistoryItem[];
  onDeleteChat?: (id: string) => void;
  onBulkDeleteChats?: (ids: string[]) => void;
  chatsUnreadCount?: number;
}

export function RiskIQPage({
  activeTab,
  onTabChange,
  onOpenChat,
  onOpenBriefing,
  onChatSelect,
  onNewChat,
  chatHistory,
  onDeleteChat,
  onBulkDeleteChats,
  chatsUnreadCount = 0,
}: RiskIQPageProps) {
  const isMobile = useIsMobile();
  const tabRefs = useRef<Partial<Record<RiskIqTab, HTMLButtonElement | null>>>({});
  const showMobileFab = Boolean(onNewChat && isMobile && activeTab !== 'chats');

  useEffect(() => {
    if (!isMobile) return;
    tabRefs.current[activeTab]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeTab, isMobile]);

  const renderTabs = (options: { mobilePadding?: boolean }) => (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0"
      aria-label="Risk IQ sections"
    >
      {TABS.map(({ id, label, shortLabel, icon: Icon }) => {
        const isActive = activeTab === id;
        const displayLabel = isMobile ? shortLabel : label;
        return (
          <button
            key={id}
            ref={(node) => {
              tabRefs.current[id] = node;
            }}
            type="button"
            onClick={() => onTabChange(id)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              options.mobilePadding ? 'px-3' : 'px-4',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            <Icon size={18} strokeWidth={1.8} />
            {displayLabel}
            {id === 'chats' && chatsUnreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-white text-xs font-semibold flex items-center justify-center">
                {chatsUnreadCount > 99 ? '99+' : chatsUnreadCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card">
        <div className="px-4 sm:px-8 pt-3 pb-0">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3 -mb-px md:flex">
              {renderTabs({ mobilePadding: isMobile })}
              {onNewChat && (
                <Button
                  type="button"
                  onClick={onNewChat}
                  className="hidden md:inline-flex shrink-0 gap-2 mb-2.5"
                >
                  <Sparkles size={18} strokeWidth={1.8} />
                  Chat with Risk iQ
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 min-h-0 overflow-hidden',
          showMobileFab && '[&_.overflow-y-auto]:pb-20',
        )}
      >
        {activeTab === 'dashboard' && (
          <Dashboard embedded onOpenChat={onOpenChat} onOpenBriefing={onOpenBriefing} />
        )}
        {activeTab === 'riskMatrix' && <RiskMatrix />}
        {activeTab === 'riskRegister' && <RiskRegister />}
        {activeTab === 'collectiveRisk' && <CollectiveRisk />}
        {activeTab === 'chats' && (
          <Chats
            embedded
            onChatSelect={onChatSelect}
            onDeleteChat={onDeleteChat}
            onBulkDeleteChats={onBulkDeleteChats}
            chatHistory={chatHistory}
            onNewChat={isMobile ? onNewChat : undefined}
          />
        )}
      </div>

      {showMobileFab && (
        <button
          type="button"
          onClick={onNewChat}
          aria-label="Start new Risk iQ chat"
          className="md:hidden fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30"
        >
          <Sparkles size={16} strokeWidth={1.8} />
          Ask Risk iQ
        </button>
      )}
    </div>
  );
}
