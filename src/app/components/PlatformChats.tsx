import { Chats } from './Chats';
import type { ChatHistoryItem } from '../types/chat';
import {
  isPlatformChatSource,
  PLATFORM_CHAT_SOURCE_OPTIONS,
  resolveChatSource,
} from './chats/chatSource';

interface PlatformChatsProps {
  chatHistory: ChatHistoryItem[];
  onChatSelect: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onBulkDeleteChats: (ids: string[]) => void;
  onNewChat: () => void;
}

export function PlatformChats({
  chatHistory,
  onChatSelect,
  onDeleteChat,
  onBulkDeleteChats,
  onNewChat,
}: PlatformChatsProps) {
  const platformChatHistory = chatHistory.filter((chat) =>
    isPlatformChatSource(resolveChatSource(chat)),
  );

  return (
    <Chats
      subtitle="All your conversations across Humanity Hub and Risk iQ"
      sourceFilterOptions={PLATFORM_CHAT_SOURCE_OPTIONS}
      chatHistory={platformChatHistory}
      onChatSelect={onChatSelect}
      onDeleteChat={onDeleteChat}
      onBulkDeleteChats={onBulkDeleteChats}
      onNewChat={onNewChat}
    />
  );
}
