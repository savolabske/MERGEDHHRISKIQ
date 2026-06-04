import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { appUsers, type AppUser } from '../utils/mockUsers';

type ShareThreadModalProps = {
  open: boolean;
  threadTitle: string;
  threadId?: string;
  initialSelectedUserIds: string[];
  onClose: () => void;
  onShare: (userIds: string[]) => void;
};

function SelectedChip({ user, onRemove }: { user: AppUser; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-muted bg-card">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: user.color }}
      >
        {user.initials}
      </div>
      <span className="text-sm font-medium text-foreground">{user.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="w-5 h-5 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
        aria-label={`Remove ${user.name}`}
      >
        <X size={12} className="text-muted-foreground" />
      </button>
    </div>
  );
}

export function ShareThreadModal({ open, threadTitle, threadId, initialSelectedUserIds, onClose, onShare }: ShareThreadModalProps) {
  const MAX_VISIBLE_SELECTED_CHIPS = 6;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(initialSelectedUserIds);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<'up' | 'down'>('down');
  const [isSelectedUsersViewerOpen, setIsSelectedUsersViewerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedUserIds(initialSelectedUserIds);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setIsSelectedUsersViewerOpen(false);
    // Slight delay for modal mount
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open, initialSelectedUserIds]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return appUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    if (!isDropdownOpen || searchQuery.trim().length === 0) {
      setCanScrollDown(false);
      return;
    }
    const el = dropdownListRef.current;
    if (!el) return;
    const hasMoreBelow = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    setCanScrollDown(hasMoreBelow);
  }, [isDropdownOpen, searchQuery, filteredUsers.length]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      // Close suggestions when clicking anywhere outside the search field + list (standard dropdown pattern).
      if (!isDropdownOpen || searchQuery.trim().length === 0) return;
      const container = searchContainerRef.current;
      if (container && !container.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isDropdownOpen, searchQuery]);

  const selectedUsers = useMemo(
    () => selectedUserIds.map((id) => appUsers.find((u) => u.id === id)).filter(Boolean) as AppUser[],
    [selectedUserIds]
  );
  const visibleSelectedUsers = useMemo(
    () => selectedUsers.slice(0, MAX_VISIBLE_SELECTED_CHIPS),
    [selectedUsers]
  );
  const hiddenSelectedUsersCount = Math.max(0, selectedUsers.length - visibleSelectedUsers.length);
  const hasExistingSharing = initialSelectedUserIds.length > 0;
  const isSelectionChanged = useMemo(() => {
    if (selectedUserIds.length !== initialSelectedUserIds.length) return true;
    const initialSet = new Set(initialSelectedUserIds);
    return selectedUserIds.some((id) => !initialSet.has(id));
  }, [selectedUserIds, initialSelectedUserIds]);

  useEffect(() => {
    if (!open || !isDropdownOpen || searchQuery.trim().length === 0) return;
    const container = searchContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const estimatedDropdownHeight = 260;
    const requiredBottomSpace = estimatedDropdownHeight + 12;
    const requiredTopSpace = estimatedDropdownHeight + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < requiredBottomSpace && spaceAbove > requiredTopSpace) {
      setDropdownDirection('up');
      return;
    }
    setDropdownDirection('down');
  }, [open, isDropdownOpen, searchQuery, filteredUsers.length]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    setSearchQuery('');
    setIsDropdownOpen(false);
    // Keep focus so user can add more quickly
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleShare = () => {
    if (selectedUserIds.length === 0 || !isSelectionChanged) return;
    onShare(selectedUserIds);
    const initialSet = new Set(initialSelectedUserIds);
    const addedCount = selectedUserIds.filter((id) => !initialSet.has(id)).length;
    if (addedCount > 0) {
      const inviteWord = addedCount === 1 ? 'invite' : 'invites';
      toast.success(`${addedCount} ${inviteWord} sent;`, {
        description: 'They will receive an in-app notification and email.',
      });
    } else {
      toast.success('Sharing updated.');
    }
    onClose();
  };

  const handleCopyThreadLink = async () => {
    if (!threadId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('thread', threadId);
    url.searchParams.set('invite', '1');
    if (threadTitle) {
      url.searchParams.set('title', threadTitle);
    }
    sessionStorage.setItem(
      'riskiq.demo.pendingInvite',
      JSON.stringify({ threadId, inviteMode: true, threadTitle: threadTitle || undefined })
    );
    await navigator.clipboard.writeText(url.toString());
    toast.success('Invite link copied.');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1600]">
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/30 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[720px] bg-card rounded-2xl shadow-2xl border border-border overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-foreground-emphasis leading-tight">Invite to chat</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add team members to collaborate
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-muted border border-transparent hover:border-border transition-colors flex items-center justify-center shrink-0"
              aria-label="Close"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Selected */}
            <div className="rounded-xl border border-border bg-warning-subtle px-4 py-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Selected users ({selectedUserIds.length})
              </div>
              {selectedUsers.length === 0 ? (
                <div className="text-sm text-text-subtle">No users selected</div>
              ) : (
                <div className="flex flex-wrap gap-2 items-center">
                  {visibleSelectedUsers.map((u) => (
                    <SelectedChip key={u.id} user={u} onRemove={() => toggleUser(u.id)} />
                  ))}
                  {hiddenSelectedUsersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsSelectedUsersViewerOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 rounded-full border border-border-muted bg-card text-sm font-medium text-primary hover:bg-primary-subtle transition-colors"
                    >
                      +{hiddenSelectedUsersCount} others
                    </button>
                  )}
                </div>
              )}
            </div>

            {!hasExistingSharing && selectedUserIds.length > 0 && (
              <p className="text-sm text-muted-foreground leading-snug">
                Inviting users converts this chat to a group.
              </p>
            )}

            {/* Search */}
            <div ref={searchContainerRef} className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(true)}
                placeholder="Search by name or email..."
                className="w-full h-[48px] pl-11 pr-11 bg-card border border-border rounded-xl text-sm text-foreground-emphasis placeholder:text-text-subtle outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}

              {/* Suggestions dropdown (only after typing) */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <div
                  className={`absolute left-0 right-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-10 ${
                    dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
                  }`}
                >
                  <div
                    ref={dropdownListRef}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const hasMoreBelow = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
                      setCanScrollDown(hasMoreBelow);
                    }}
                    className="max-h-[248px] overflow-y-auto divide-y divide-border"
                  >
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUser(u.id)}
                        className="w-full px-4 py-3 flex items-center justify-between gap-4 hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: u.color }}
                          >
                            {u.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground-emphasis truncate">{u.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-border-muted text-primary focus:ring-ring focus:ring-offset-0"
                        />
                      </button>
                    ))}

                    {filteredUsers.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-text-subtle">No matches</div>
                    )}
                  </div>
                  {canScrollDown && filteredUsers.length > 4 && (
                    <div className="relative h-8 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-t from-white to-white/0" />
                      <div className="absolute inset-x-0 bottom-1 text-center text-xs font-medium text-muted-foreground">
                        Scroll for more
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopyThreadLink}
              disabled={!threadId}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                threadId
                  ? 'border border-border bg-card hover:bg-muted text-foreground-emphasis'
                  : 'border border-border bg-muted text-text-subtle cursor-not-allowed'
              }`}
            >
              Copy invite link
            </button>
            <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground-emphasis text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={selectedUserIds.length === 0 || !isSelectionChanged}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                selectedUserIds.length === 0 || !isSelectionChanged
                  ? 'bg-muted text-text-subtle cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              {hasExistingSharing ? 'Update sharing' : 'Send invite'}
            </button>
            </div>
          </div>

          {/* Selected users full viewer */}
          {isSelectedUsersViewerOpen && (
            <div className="fixed inset-0 z-[1700]">
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 p-4"
                onClick={() => setIsSelectedUsersViewerOpen(false)}
              >
                <div
                  className="w-full max-w-[560px] bg-card rounded-2xl shadow-2xl border border-border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground-emphasis">Selected users</h4>
                      <p className="text-sm text-muted-foreground">{selectedUsers.length} total</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSelectedUsersViewerOpen(false)}
                      className="w-9 h-9 rounded-full hover:bg-muted border border-transparent hover:border-border transition-colors flex items-center justify-center"
                      aria-label="Close selected users viewer"
                    >
                      <X size={18} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((u) => (
                        <SelectedChip key={u.id} user={u} onRemove={() => toggleUser(u.id)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

