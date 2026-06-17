import { Search, Trash2, MoreVertical, Pin, ChevronLeft, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import { useProgressiveList } from '../hooks/useProgressiveList';
import { getUserById } from '../utils/mockUsers';
import { TableSkeleton } from './ui/table-skeleton';
import { PageScrollShell } from './PageScrollShell';
import { Button } from './ui/button';
import type { ChatHistoryItem } from '../types/chat';
import {
  ChatSourceBadge,
  ChatSourceIcon,
  chatSourceFilterLabel,
  chatSourceLabel,
  CHAT_SOURCE_OPTIONS,
  resolveChatSource,
  type ChatSourceFilter,
} from './chats/chatSource';

type ChatScopeFilter = 'all' | 'my' | 'shared-with-me';

const CHAT_SCOPE_OPTIONS: { id: ChatScopeFilter; label: string }[] = [
  { id: 'all', label: 'All chats' },
  { id: 'my', label: 'My chats' },
  { id: 'shared-with-me', label: 'Shared with me' },
];

function chatScopeLabel(filter: ChatScopeFilter): string {
  return CHAT_SCOPE_OPTIONS.find((o) => o.id === filter)?.label ?? 'All chats';
}

function matchesChatScopeFilter(chat: ChatHistoryItem, filter: ChatScopeFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'my':
      // Chats I started: private and outgoing shares; excludes only incoming (shared with me).
      return chat.shareMode !== 'incoming';
    case 'shared-with-me':
      return chat.shareMode === 'incoming';
    default:
      return true;
  }
}

function chatMatchesSearch(chat: ChatHistoryItem, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const parts = [
    chat.query,
    chat.date,
    chat.timestamp,
    chat.createdByName,
    getRelativeDayLabel(chat.date),
    chat.shareMode === 'incoming' ? 'shared with me' : '',
    chat.shareMode === 'outgoing' ? 'shared by me' : '',
    chatSourceLabel(resolveChatSource(chat)),
    chat.resourceTitle,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return parts.includes(q);
}

function matchesChatSourceFilter(chat: ChatHistoryItem, filter: ChatSourceFilter): boolean {
  if (filter === 'all') return true;
  return resolveChatSource(chat) === filter;
}

interface ChatsProps {
  embedded?: boolean;
  subtitle?: string;
  defaultSourceFilter?: ChatSourceFilter;
  onChatSelect?: (id: string) => void;
  onNewChat?: () => void;
  chatHistory?: ChatHistoryItem[];
  onDeleteChat?: (id: string) => void;
  onBulkDeleteChats?: (ids: string[]) => void;
}

function getRelativeDayLabel(dateValue: string): string {
  const normalized = dateValue.trim().toLowerCase();

  if (normalized === 'today') return 'Today';
  if (normalized === 'yesterday') return 'Yesterday';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const months = Math.floor(diffDays / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}

function AvatarStack({ userIds, compact = false }: { userIds: string[]; compact?: boolean }) {
  const allUsers = userIds.map(getUserById).filter(Boolean);
  const users = allUsers.slice(0, 3);
  const extraCount = Math.max(0, allUsers.length - users.length);

  if (users.length === 0) return null;

  return (
    <div className={`flex items-center ${compact ? '' : 'justify-end'} -space-x-2`}>
      {users.map((u) => (
        <div
          key={u!.id}
          className={`rounded-full border-2 border-white flex items-center justify-center text-white font-bold shadow-sm ${
            compact ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-xs'
          }`}
          style={{ backgroundColor: u!.color }}
          title={u!.name}
        >
          {u!.initials}
        </div>
      ))}
      {extraCount > 0 && (
        compact ? (
          <div className="w-6 h-6 rounded-full border-2 border-white bg-muted text-secondary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
            +{extraCount}
          </div>
        ) : (
          <span className="ml-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
            +{extraCount} others
          </span>
        )
      )}
    </div>
  );
}

export function Chats({
  embedded = false,
  subtitle = 'Review and revisit your previous Risk IQ chats',
  defaultSourceFilter = 'all',
  onChatSelect,
  onNewChat,
  chatHistory = [],
  onDeleteChat,
  onBulkDeleteChats,
}: ChatsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatScopeFilter, setChatScopeFilter] = useState<ChatScopeFilter>('all');
  const [chatSourceFilter, setChatSourceFilter] = useState<ChatSourceFilter>(defaultSourceFilter);
  const [showChatFilterDropdown, setShowChatFilterDropdown] = useState(false);
  const [showSourceFilterDropdown, setShowSourceFilterDropdown] = useState(false);

  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);
  const chatFilterDropdownRef = useRef<HTMLDivElement>(null);
  const sourceFilterDropdownRef = useRef<HTMLDivElement>(null);
  const hideSourceFilter = embedded && defaultSourceFilter !== 'all';

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (itemsPerPageDropdownRef.current && !itemsPerPageDropdownRef.current.contains(target)) {
        setShowItemsPerPageDropdown(false);
      }
      if (chatFilterDropdownRef.current && !chatFilterDropdownRef.current.contains(target)) {
        setShowChatFilterDropdown(false);
      }
      if (sourceFilterDropdownRef.current && !sourceFilterDropdownRef.current.contains(target)) {
        setShowSourceFilterDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, chatScopeFilter, chatSourceFilter]);

  useEffect(() => {
    setChatSourceFilter(defaultSourceFilter);
  }, [defaultSourceFilter]);

  // Sort chats: pinned first, then preserve original order deterministically.
  const sortedHistory = chatHistory
    .map((chat, originalIndex) => ({ chat, originalIndex }))
    .sort((a, b) => {
      const aIsPinned = pinnedChats.has(a.chat.id);
      const bIsPinned = pinnedChats.has(b.chat.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      if (a.chat.unread && !b.chat.unread) return -1;
      if (!a.chat.unread && b.chat.unread) return 1;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ chat }) => chat);

  const filteredChats = sortedHistory
    .filter((chat) => matchesChatScopeFilter(chat, chatScopeFilter))
    .filter((chat) => matchesChatSourceFilter(chat, chatSourceFilter))
    .filter((chat) => chatMatchesSearch(chat, searchQuery));

  // Pagination logic
  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredChats.slice(startIndex, endIndex);
  const { visibleItems: visiblePaginatedHistory, isProgressivelyLoading } = useProgressiveList(paginatedHistory, {
    minLoadingMs: 200,
    transitionKey: `${currentPage}-${itemsPerPage}-${chatScopeFilter}-${chatSourceFilter}-${searchQuery}`,
  });
  const showingStart = filteredChats.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, filteredChats.length);

  // Generate smart page numbers for pagination - Max 3 pages at a time
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show max 3 consecutive pages with ellipsis
      // Determine which group of 3 the current page belongs to
      const groupStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
      const groupEnd = Math.min(groupStart + 2, totalPages);
      
      // Add leading ellipsis if not in first group
      if (groupStart > 1) {
        pages.push('...');
      }
      
      // Add the 3 pages in current group
      for (let i = groupStart; i <= groupEnd; i++) {
        pages.push(i);
      }
      
      // Add trailing ellipsis if not in last group
      if (groupEnd < totalPages) {
        pages.push('...');
      }
    }
    
    return pages;
  };

  const togglePin = (id: string) => {
    setPinnedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast.success('Chat unpinned');
      } else {
        newSet.add(id);
        toast.success('Chat pinned');
      }
      return newSet;
    });
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    toast.promise(
      Promise.resolve().then(() => {
        onDeleteChat?.(id);
        setOpenMenuId(null);
        setSelectedChatIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setPinnedChats((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }),
      {
        loading: 'Deleting conversation...',
        success: 'Conversation deleted successfully.',
        error: 'We could not delete this conversation. Please try again.',
      }
    );
  };

  useEffect(() => {
    const validIds = new Set(chatHistory.map((c) => c.id));
    setSelectedChatIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [chatHistory]);

  const toggleSelectChat = (id: string) => {
    setSelectedChatIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = paginatedHistory.map((c) => c.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedChatIds.has(id));
    setSelectedChatIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const executeBulkDelete = () => {
    const ids = [...selectedChatIds];
    const count = ids.length;
    if (count === 0) return;
    toast.promise(
      Promise.resolve().then(() => {
        onBulkDeleteChats?.(ids);
        setSelectedChatIds(new Set());
        setPinnedChats((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        setShowBulkDeleteConfirm(false);
      }),
      {
        loading: `Deleting ${count} conversation${count > 1 ? 's' : ''}...`,
        success: `${count} conversation${count > 1 ? 's' : ''} deleted successfully.`,
        error: 'We could not delete the selected conversations. Please try again.',
      }
    );
  };

  return (
    <>
    <PageScrollShell
      paddingClassName={`px-4 sm:px-8 ${embedded ? 'pt-4 lg:pt-4' : 'pt-6'}`}
      innerClassName="space-y-6"
    >
            {!embedded && (
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h2 className="text-page-title mb-1">Chats</h2>
                  <p className="text-sm sm:text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                </div>
                {onNewChat && (
                  <Button
                    type="button"
                    onClick={onNewChat}
                    className="w-full sm:w-auto shrink-0 gap-2"
                  >
                    <Plus size={18} strokeWidth={2} />
                    New Chat
                  </Button>
                )}
              </div>
            )}

            {/* Search and scope filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-stretch">
              <div className="flex gap-3 items-stretch min-w-0 flex-1">
                <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" size={20} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
                />
                </div>
                {embedded && onNewChat && (
                  <button
                    type="button"
                    onClick={onNewChat}
                    className="sm:hidden shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    <Plus size={18} strokeWidth={2} />
                    New chat
                  </button>
                )}
              </div>
              <div className="relative shrink-0 w-full sm:w-auto" ref={chatFilterDropdownRef}>
                <button
                  type="button"
                  aria-expanded={showChatFilterDropdown}
                  aria-haspopup="listbox"
                  onClick={() => setShowChatFilterDropdown((open) => !open)}
                  className="w-full sm:w-auto min-w-0 sm:min-w-[180px] px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center justify-between gap-2"
                >
                  <span className="truncate">{chatScopeLabel(chatScopeFilter)}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground shrink-0 transition-transform ${showChatFilterDropdown ? 'rotate-180' : ''}`}
                  />
                </button>
                {showChatFilterDropdown && (
                  <div
                    className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 z-20 w-full sm:min-w-[220px] bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                    role="listbox"
                    aria-label="Filter chats by scope"
                  >
                    {CHAT_SCOPE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={chatScopeFilter === option.id}
                        onClick={() => {
                          setChatScopeFilter(option.id);
                          setShowChatFilterDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors ${
                          chatScopeFilter === option.id ? 'bg-secondary font-medium' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!hideSourceFilter && (
                <div className="relative shrink-0 w-full sm:w-auto" ref={sourceFilterDropdownRef}>
                  <button
                    type="button"
                    aria-expanded={showSourceFilterDropdown}
                    aria-haspopup="listbox"
                    onClick={() => setShowSourceFilterDropdown((open) => !open)}
                    className="w-full sm:w-auto min-w-0 sm:min-w-[180px] px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{chatSourceFilterLabel(chatSourceFilter)}</span>
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground shrink-0 transition-transform ${showSourceFilterDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showSourceFilterDropdown && (
                    <div
                      className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 z-20 w-full sm:min-w-[220px] bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                      role="listbox"
                      aria-label="Filter chats by source"
                    >
                      {CHAT_SOURCE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          role="option"
                          aria-selected={chatSourceFilter === option.id}
                          onClick={() => {
                            setChatSourceFilter(option.id);
                            setShowSourceFilterDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors ${
                            chatSourceFilter === option.id ? 'bg-secondary font-medium' : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-card rounded-xl border border-border">
              {/* Bulk Actions Bar */}
              {selectedChatIds.size > 0 && (
                <div className="px-6 py-3 bg-card border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-t-xl">
                  <span className="text-sm text-muted-foreground font-medium">
                    {selectedChatIds.size} conversation{selectedChatIds.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      className="px-3 py-1.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChatIds(new Set())}
                      className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Table Header - Desktop Only */}
              <div
                className={`hidden min-h-10 sm:grid grid-cols-[auto_1fr_140px_auto] items-center gap-4 px-4 sm:px-6 py-3 border-b border-border bg-muted/70 ${
                  selectedChatIds.size === 0 ? 'rounded-t-xl' : ''
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedHistory.length > 0 &&
                      paginatedHistory.every((c) => selectedChatIds.has(c.id))
                    }
                    onChange={toggleSelectAllOnPage}
                    className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                    aria-label="Select all on this page"
                  />
                </div>
                <div className="table-header-label">Topic</div>
                <div className="table-header-label text-right">Shared</div>
                <div className="w-8"></div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {paginatedHistory.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-text-subtle">
                      {chatHistory.length === 0
                        ? 'No chats yet. Start a conversation to see them here.'
                        : 'No chats match your search or filter.'}
                    </p>
                  </div>
                ) : isProgressivelyLoading ? (
                  <TableSkeleton variant="grid" rows={itemsPerPage} columns={4} />
                ) : (
                  visiblePaginatedHistory.map((chat) => {
                    const chatSource = resolveChatSource(chat);
                    return (
                    <div
                      key={chat.id}
                      className="table-row-entity relative sm:grid sm:grid-cols-[auto_1fr_140px_auto] sm:items-center gap-4 px-4 sm:px-6 transition-colors group"
                    >
                  <div className="flex gap-3 items-center sm:contents">
                    <label
                      className="flex items-center shrink-0 cursor-pointer sm:w-auto self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChatIds.has(chat.id)}
                        onChange={() => toggleSelectChat(chat.id)}
                        className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                        aria-label={`Select conversation: ${chat.query}`}
                      />
                    </label>
                  <button
                    type="button"
                    onClick={() => onChatSelect?.(chat.id)}
                    className="flex items-start gap-3 text-left w-full min-w-0 sm:w-auto"
                  >
                    <div className="flex items-center gap-3 flex-1 w-full min-w-0">
                      <ChatSourceIcon source={chatSource} />
                      <div className="flex-1 min-w-0 pr-12 sm:pr-0">
                        <div className="flex items-start gap-2 min-w-0">
                          <p className="table-primary-text group-hover:text-primary-text transition-colors min-w-0 flex-1 break-words">
                            {chat.query}
                          </p>
                          {chat.unread && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Unread updates" />
                          )}
                          {pinnedChats.has(chat.id) && (
                            <Pin size={14} className="text-primary shrink-0" fill="var(--primary)" />
                          )}
                        </div>
                        {/* Source pill, resource context, timestamp/meta below query */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {!(hideSourceFilter && chatSource === 'risk-iq') && (
                            <ChatSourceBadge source={chatSource} />
                          )}
                          {chatSource === 'resource' && chat.resourceTitle && (
                            <>
                              <span className="text-border-muted">•</span>
                              <span
                                className="text-xs text-muted-foreground truncate max-w-[240px] sm:max-w-[320px]"
                                title={chat.resourceTitle}
                              >
                                {chat.resourceTitle}
                              </span>
                            </>
                          )}
                          <span className="text-border-muted">•</span>
                          <p className="table-metadata-text">
                            Last message {getRelativeDayLabel(chat.date)} at {chat.timestamp}
                          </p>
                          {chat.shareMode && (chat.sharedWith?.length || 0) > 0 && (
                            <>
                              <span className="text-border-muted">•</span>
                              <span
                                className={`text-xs font-medium ${
                                  chat.shareMode === 'incoming' ? 'text-info' : 'text-primary'
                                }`}
                              >
                                {chat.shareMode === 'incoming' ? 'Shared with me' : 'Shared by me'}
                              </span>
                            </>
                          )}
                        </div>
                        {(chat.sharedWith?.length || 0) > 0 && (
                          <div className="sm:hidden mt-2 flex items-center gap-2">
                            <span className="text-xs font-medium text-text-subtle uppercase tracking-wide">Shared</span>
                            <AvatarStack userIds={chat.sharedWith || []} compact />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                  </div>
                  {/* Shared avatars (desktop) */}
                  <div className="hidden sm:flex items-center justify-end pr-2">
                    <AvatarStack userIds={chat.sharedWith || []} />
                  </div>
                  <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 flex items-center justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                        }}
                        className="p-2 hover:bg-card rounded-lg transition-colors"
                        title="More options"
                      >
                        <MoreVertical size={16} className="text-muted-foreground" />
                      </button>
                      {openMenuId === chat.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(chat.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <Pin size={16} className={pinnedChats.has(chat.id) ? "text-primary" : "text-muted-foreground"} />
                              <span>{pinnedChats.has(chat.id) ? 'Unpin chat' : 'Pin chat'}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(chat.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-destructive-text hover:bg-destructive-subtle transition-colors flex items-center gap-2"
                            >
                              <Trash2 size={16} className="text-destructive-text" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                    </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {filteredChats.length > 0 && totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left: Items per page */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <div className="relative" ref={itemsPerPageDropdownRef}>
                      <button
                        onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                        className="px-3 py-1.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[70px] justify-between"
                      >
                        {itemsPerPage}
                        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showItemsPerPageDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showItemsPerPageDropdown && (
                        <div className="absolute bottom-full left-0 mb-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
                          {[5, 10, 25, 50, 100].map((count) => (
                            <button
                              key={count}
                              onClick={() => {
                                setItemsPerPage(count);
                                setCurrentPage(1);
                                setShowItemsPerPageDropdown(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                itemsPerPage === count ? 'bg-secondary font-medium' : ''
                              }`}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground leading-none">per page</span>
                  </div>

                  {/* Right: Page navigation */}
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span className="text-sm text-muted-foreground text-center sm:text-left">
                      {isProgressivelyLoading
                        ? 'Loading...'
                        : `${showingStart}-${showingEnd} of ${filteredChats.length}`}
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-lg transition-colors ${
                          currentPage === 1
                            ? 'text-border-muted cursor-not-allowed'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-1.5 sm:px-2 text-sm sm:text-sm text-text-subtle">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(typeof page === 'number' ? page : currentPage)}
                            className={`min-w-[30px] h-[30px] sm:min-w-[32px] sm:h-[32px] px-2 rounded-lg text-sm sm:text-sm font-medium transition-colors ${
                              page === currentPage
                                ? 'bg-primary text-white'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-1.5 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? 'text-border-muted cursor-not-allowed'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
    </PageScrollShell>

      {showBulkDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4"
          onClick={() => setShowBulkDeleteConfirm(false)}
        >
          <div className="bg-card rounded-2xl max-w-[500px] w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-3">Delete chats</h3>
            <p className="text-base text-muted-foreground mb-6">
              Delete {selectedChatIds.size} conversation{selectedChatIds.size > 1 ? 's' : ''}? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 px-5 py-3 bg-card hover:bg-muted text-muted-foreground border border-border rounded-lg text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkDelete}
                className="flex-1 px-5 py-3 bg-destructive hover:bg-destructive-text text-white rounded-lg text-base font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
