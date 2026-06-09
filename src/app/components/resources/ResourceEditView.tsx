import {
  ArrowLeft,
  Plus,
  X,
  Globe,
  ExternalLink,
  User,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { PlatformResource, ResourceUserGroup } from '../../data/resourcesMock';
import { INITIAL_RESOURCE_USER_GROUPS } from '../../data/resourcesMock';
import { Checkbox } from '../ui/checkbox';
import { inputClass } from './resourceShared';
import { ResourceDocumentsList } from './ResourceDocumentsList';
import { UserGroupModal } from './UserGroupModal';

interface ResourceEditViewProps {
  resource: PlatformResource;
  onBack: () => void;
  onCancel: () => void;
  onSave: (updated: PlatformResource) => void;
}

const SUGGESTED_TAGS = [
  'HCT',
  'WASH',
  'coordination',
  'security',
  'access',
  'incidents',
  'dtm',
  'nutrition',
  'protection',
];

export function ResourceEditView({ resource, onBack, onCancel, onSave }: ResourceEditViewProps) {
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);
  const [tags, setTags] = useState([...resource.tags]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [webLinks, setWebLinks] = useState([...resource.webLinks]);
  const [linkInput, setLinkInput] = useState('');
  const [userGroups, setUserGroups] = useState([...resource.userGroups]);
  const [individualUsers, setIndividualUsers] = useState([...resource.individualUsers]);
  const [emailInput, setEmailInput] = useState('');
  const [groups, setGroups] = useState<ResourceUserGroup[]>(INITIAL_RESOURCE_USER_GROUPS);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'edit'>('create');
  const [editingGroup, setEditingGroup] = useState<ResourceUserGroup | null>(null);
  const [files, setFiles] = useState([...resource.files]);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  const allTagOptions = Array.from(
    new Set([...SUGGESTED_TAGS, ...resource.tags, ...tags]),
  );

  const filteredTags = allTagOptions.filter((tag) => {
    const q = tagSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return tag.toLowerCase().includes(q);
  });

  const canCreateTag =
    tagSearchQuery.trim().length > 0 &&
    !allTagOptions.some((t) => t.toLowerCase() === tagSearchQuery.trim().toLowerCase()) &&
    !tags.some((t) => t.toLowerCase() === tagSearchQuery.trim().toLowerCase());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagsDropdownRef.current &&
        !tagsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagsDropdown(false);
      }
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(event.target as Node)
      ) {
        setShowGroupMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    setTags((prev) =>
      prev.some((x) => x.toLowerCase() === t.toLowerCase())
        ? prev.filter((x) => x.toLowerCase() !== t.toLowerCase())
        : [...prev, t],
    );
  };

  const createAndSelectTag = () => {
    const t = tagSearchQuery.trim();
    if (!t) return;
    if (!tags.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setTags([...tags, t]);
    }
    setTagSearchQuery('');
  };

  const addLink = () => {
    const url = linkInput.trim();
    if (url) {
      setWebLinks([
        ...webLinks,
        {
          id: Date.now().toString(),
          url,
          addedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        },
      ]);
      setLinkInput('');
    }
  };

  const addEmail = (raw?: string) => {
    const email = (raw ?? emailInput).trim().replace(/,+$/, '');
    if (email && !individualUsers.includes(email)) {
      setIndividualUsers((prev) => [...prev, email]);
    }
    setEmailInput('');
  };

  const handleEmailInputChange = (value: string) => {
    if (value.endsWith(',') || value.endsWith(' ')) {
      addEmail(value.slice(0, -1));
      return;
    }
    setEmailInput(value);
  };

  const toggleUserGroup = (groupName: string) => {
    setUserGroups((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName],
    );
  };

  const openCreateGroupModal = () => {
    setGroupModalMode('create');
    setEditingGroup(null);
    setGroupModalOpen(true);
    setShowGroupMenu(false);
  };

  const openEditGroupModal = (group: ResourceUserGroup) => {
    setGroupModalMode('edit');
    setEditingGroup(group);
    setGroupModalOpen(true);
    setShowGroupMenu(false);
  };

  const handleSaveGroup = (group: ResourceUserGroup) => {
    if (groupModalMode === 'create') {
      if (groups.some((g) => g.name.toLowerCase() === group.name.toLowerCase())) {
        toast.error('A group with this name already exists');
        return;
      }
      setGroups((prev) => [...prev, group]);
      setUserGroups((prev) => [...prev, group.name]);
      toast.success('Group created successfully');
    } else if (editingGroup) {
      const nameTaken = groups.some(
        (g) => g.id !== group.id && g.name.toLowerCase() === group.name.toLowerCase(),
      );
      if (nameTaken) {
        toast.error('A group with this name already exists');
        return;
      }
      setGroups((prev) => prev.map((g) => (g.id === group.id ? group : g)));
      if (editingGroup.name !== group.name) {
        setUserGroups((prev) =>
          prev.map((name) => (name === editingGroup.name ? group.name : name)),
        );
      }
      toast.success('Group updated successfully');
    }
    setGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (group: ResourceUserGroup) => {
    const confirmed = window.confirm(
      `Delete "${group.name}"? This group will be removed from your selection.`,
    );
    if (!confirmed) return;
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
    setUserGroups((prev) => prev.filter((name) => name !== group.name));
    toast.success('Group deleted');
  };

  const resolveWebLinks = () => {
    const pending = linkInput.trim();
    if (!pending || webLinks.some((link) => link.url === pending)) {
      return webLinks;
    }
    return [
      ...webLinks,
      {
        id: Date.now().toString(),
        url: pending,
        addedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
    ];
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Resource title is required');
      return;
    }
    onSave({
      ...resource,
      title: title.trim(),
      description: description.trim(),
      tags,
      files,
      webLinks: resolveWebLinks(),
      userGroups,
      individualUsers,
      lastModified: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
    toast.success('Resource saved successfully');
  };

  const canSave = title.trim().length > 0 && description.trim().length > 0;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Resources
      </button>

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          className="w-full text-2xl font-semibold text-foreground bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Description
            </h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the resource content and purpose"
              rows={4}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-base text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <ResourceDocumentsList files={files} editable onChange={setFiles} />

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Web Links
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                placeholder="https://example.com/document"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium shrink-0 transition-colors"
              >
                Add Link
              </button>
            </div>
            <div className="space-y-3">
              {webLinks.map((link) => (
                <div key={link.id} className="flex items-start justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline truncate"
                    >
                      <Globe size={14} />
                      {link.url}
                      <ExternalLink size={12} />
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">Added {link.addedAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWebLinks(webLinks.filter((l) => l.id !== link.id))}
                    className="text-muted-foreground hover:text-destructive-text p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                User Group
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Select existing groups to share this resource with
              </p>
              <div className="relative" ref={groupDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupMenu((v) => !v);
                    setShowTagsDropdown(false);
                  }}
                  className={`${inputClass} text-left flex items-center justify-between`}
                >
                  <span className={userGroups.length > 0 ? 'text-foreground' : 'text-text-subtle'}>
                    {userGroups.length > 0
                      ? `${userGroups.length} group${userGroups.length === 1 ? '' : 's'} selected`
                      : 'Select user groups...'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-text-subtle transition-transform ${showGroupMenu ? 'rotate-180' : ''}`}
                  />
                </button>
                {showGroupMenu && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="group flex items-center gap-1 px-4 py-2.5 hover:bg-muted"
                      >
                        <button
                          type="button"
                          onClick={() => toggleUserGroup(group.name)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <Checkbox
                            checked={userGroups.includes(group.name)}
                            className="pointer-events-none"
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{group.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {group.members.length} member
                              {group.members.length === 1 ? '' : 's'}
                            </p>
                          </div>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEditGroupModal(group)}
                            title="Edit group"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary-subtle"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group)}
                            title="Delete group"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive-text"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="mt-1 border-t border-border pt-1">
                      <button
                        type="button"
                        onClick={openCreateGroupModal}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-primary hover:bg-muted"
                      >
                        <Plus size={14} />
                        Create New Group
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {userGroups.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {userGroups.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1 rounded-md bg-primary-subtle px-2.5 py-1 text-xs text-primary"
                    >
                      {g}
                      <button
                        type="button"
                        onClick={() => setUserGroups(userGroups.filter((x) => x !== g))}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Individual Users
              </h3>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => handleEmailInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                    e.preventDefault();
                    addEmail();
                  }
                }}
                onBlur={() => {
                  if (emailInput.trim()) addEmail();
                }}
                placeholder="Add users by email (type comma or space to add)..."
                className={inputClass}
              />
              {individualUsers.length > 0 && (
                <div className="space-y-2 mt-3">
                  {individualUsers.map((email) => (
                    <div key={email} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm min-w-0">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User size={14} className="text-muted-foreground" />
                        </span>
                        <span className="truncate">{email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setIndividualUsers(individualUsers.filter((e) => e !== email))
                        }
                        className="text-muted-foreground hover:text-destructive-text shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Tags
              </h3>
              <div className="relative" ref={tagsDropdownRef}>
                <div
                  role="presentation"
                  className={`flex w-full cursor-text flex-wrap items-center gap-1.5 min-h-[42px] rounded-lg border bg-card px-2 py-1.5 transition-colors ${
                    showTagsDropdown ? 'border-primary' : 'border-border'
                  } focus-within:border-primary`}
                  onClick={() => {
                    setShowTagsDropdown(true);
                    setShowGroupMenu(false);
                    tagInputRef.current?.focus();
                  }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex max-w-[220px] items-center gap-0.5 rounded-xs bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-primary-text"
                    >
                      <span className="truncate">{tag}</span>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(tag);
                        }}
                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Remove ${tag}`}
                      >
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagSearchQuery}
                    onFocus={() => {
                      setShowTagsDropdown(true);
                      setShowGroupMenu(false);
                    }}
                    onChange={(e) => {
                      setTagSearchQuery(e.target.value);
                      if (!showTagsDropdown) setShowTagsDropdown(true);
                    }}
                    placeholder={tags.length === 0 ? 'Search or create tags...' : 'Add more tags...'}
                    className="min-w-[140px] flex-1 border-0 bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-text-subtle focus:outline-none focus:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canCreateTag) {
                        e.preventDefault();
                        createAndSelectTag();
                      }
                    }}
                  />
                </div>
                {showTagsDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                    <div className="max-h-52 overflow-y-auto">
                      {canCreateTag && (
                        <button
                          type="button"
                          onClick={createAndSelectTag}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-sidebar-border"
                        >
                          <div className="w-8 h-8 rounded-lg bg-info-subtle text-info flex items-center justify-center text-xl leading-none">
                            <Plus size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Create tag{' '}
                              <span className="text-primary">{tagSearchQuery.trim()}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">Press Enter to create</p>
                          </div>
                        </button>
                      )}
                      <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted border-b border-border">
                        Select from existing tags
                      </p>
                      {filteredTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              tags.some((t) => t.toLowerCase() === tag.toLowerCase())
                                ? 'bg-primary border-primary'
                                : 'border-border-muted'
                            }`}
                          >
                            {tags.some((t) => t.toLowerCase() === tag.toLowerCase()) && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <span className="text-foreground">{tag}</span>
                        </button>
                      ))}
                      {filteredTags.length === 0 && !canCreateTag && (
                        <p className="px-4 py-4 text-sm text-muted-foreground">No tags found.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Created
              </h3>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar size={18} className="text-muted-foreground" />
                {resource.createdAt}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Last Modified
              </h3>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock size={18} className="text-muted-foreground" />
                {resource.lastModified}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={`w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                canSave
                  ? 'bg-primary hover:bg-primary-hover text-white'
                  : 'bg-muted text-text-subtle cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-3 border border-border hover:bg-muted rounded-lg text-base font-medium text-muted-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <UserGroupModal
        open={groupModalOpen}
        mode={groupModalMode}
        initialGroup={editingGroup}
        onClose={() => {
          setGroupModalOpen(false);
          setEditingGroup(null);
        }}
        onSave={handleSaveGroup}
      />
    </div>
  );
}
