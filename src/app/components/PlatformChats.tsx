import { Chats } from './Chats';
import type { ChatHistoryItem } from '../types/chat';

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
  return (
    <Chats
      subtitle="All your conversations across Humanity Hub, Risk iQ, and resources"
      chatHistory={chatHistory}
      onChatSelect={onChatSelect}
      onDeleteChat={onDeleteChat}
      onBulkDeleteChats={onBulkDeleteChats}
      onNewChat={onNewChat}
    />
  );
}
