import { Chats } from './Chats';

interface PlatformChatHistoryItem {
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

interface PlatformChatsProps {
  chatHistory: PlatformChatHistoryItem[];
  onChatSelect: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onBulkDeleteChats: (ids: string[]) => void;
}

export function PlatformChats({
  chatHistory,
  onChatSelect,
  onDeleteChat,
  onBulkDeleteChats,
}: PlatformChatsProps) {
  return (
    <Chats
      subtitle="Review and revisit your previous AI Search chats"
      chatHistory={chatHistory}
      onChatSelect={onChatSelect}
      onDeleteChat={onDeleteChat}
      onBulkDeleteChats={onBulkDeleteChats}
    />
  );
}
