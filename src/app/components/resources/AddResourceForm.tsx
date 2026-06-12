import {
  Plus,
  X,
  Upload,
  Link as LinkIcon,
  ChevronDown,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { PlatformResource, ResourceUserGroup } from '../../data/resourcesMock';
import { INITIAL_RESOURCE_USER_GROUPS } from '../../data/resourcesMock';
import { Checkbox } from '../ui/checkbox';
import { inputClass, textareaClass } from './resourceShared';
import { UserGroupModal } from './UserGroupModal';
import { PageBreadcrumb } from '../ui/page-breadcrumb';

interface AddResourceFormProps {
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (resource: PlatformResource) => void;
}

export function AddResourceForm({ onBack, onCancel, onSubmit }: AddResourceFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [webLinks, setWebLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [individualUsers, setIndividualUsers] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [groups, setGroups] = useState<ResourceUserGroup[]>(INITIAL_RESOURCE_USER_GROUPS);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'edit'>('create');
  const [editingGroup, setEditingGroup] = useState<ResourceUserGroup | null>(null);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const [suggestedTags, setSuggestedTags] = useState([
    'SomaliaGBHA',
    'EconomicOutlook',
    'FoodSystem',
    'HCT',
    'WASH',
    'coordination',
  ]);

  const tagQuery = tagInput.trim();
  const filteredTagSuggestions = suggestedTags.filter((t) =>
    t.toLowerCase().includes(tagQuery.toLowerCase()),
  );
  const canCreateTag =
    tagQuery.length > 0 &&
    !suggestedTags.some((t) => t.toLowerCase() === tagQuery.toLowerCase()) &&
    !tags.some((t) => t.toLowerCase() === tagQuery.toLowerCase());

  const toggleTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || tags.includes(t)) {
      setTagInput('');
      return;
    }
    setTags([...tags, t]);
    if (!suggestedTags.some((s) => s.toLowerCase() === t.toLowerCase())) {
      setSuggestedTags((prev) => [...prev, t]);
    }
    setTagInput('');
  };

  const addLink = () => {
    const url = linkInput.trim();
    if (url && !webLinks.includes(url)) {
      setWebLinks([...webLinks, url]);
      setLinkInput('');
    }
  };

  const resolveWebLinks = () => {
    const links = [...webLinks];
    const pending = linkInput.trim();
    if (pending && !links.includes(pending)) {
      links.push(pending);
    }
    return links;
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

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Resource title is required');
      return;
    }
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    onSubmit({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      ownership: 'created_by_me',
      tags,
      lastModified: now,
      createdAt: now,
      files: [],
      webLinks: resolveWebLinks().map((url, i) => ({
        id: `link-${i}`,
        url,
        addedAt: now,
      })),
      userGroups,
      individualUsers,
    });
    toast.success('Resource created successfully');
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: 'Resources', onClick: onBack },
          { label: 'Add New Resource' },
        ]}
      />

      <div>
        <h2 className="text-page-title mb-1">Add New Resource</h2>
        <p className="text-sm text-muted-foreground">
          Provide resource details and upload content to your workspace repository.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-4">Resource Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Resource Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Somalia Economic Outlook 2024"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the document's content..."
                rows={4}
                className={textareaClass}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground mb-4">Documents</h3>
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-primary-subtle flex items-center justify-center mb-3">
              <Upload size={22} className="text-primary" />
            </div>
            <p className="text-sm text-foreground">
              <span className="text-primary font-medium">Click to Upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">Max file size: 25 MB</p>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground mb-1">Web Links</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Use + or Enter to add multiple links. A link left in the field is saved when you submit.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <LinkIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
              />
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                placeholder="https://example.com/document"
                className={`${inputClass} pl-10`}
              />
            </div>
            <button
              type="button"
              onClick={addLink}
              aria-label="Add link"
              className="w-11 h-11 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shrink-0"
            >
              <Plus size={18} />
            </button>
          </div>
          {webLinks.length > 0 && (
            <ul className="mt-3 space-y-1">
              {webLinks.map((link) => (
                <li key={link} className="flex items-center justify-between text-sm text-primary">
                  <span className="truncate">{link}</span>
                  <button type="button" onClick={() => setWebLinks(webLinks.filter((l) => l !== link))}>
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="text-sm font-medium text-foreground mb-2">Tags</h3>
          <div className="relative">
            <div
              data-composite-field
              className="min-h-[44px] flex flex-wrap items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card cursor-text focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/10"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-subtle text-primary text-xs font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagMenu(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                onFocus={() => setShowTagMenu(true)}
                placeholder={tags.length === 0 ? 'Type to search or add tags...' : ''}
                className="focus-ring-container-control flex-1 min-w-[120px] border-0 p-0 text-sm focus:outline-none focus:ring-0 bg-transparent"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTagMenu((v) => !v);
                  tagInputRef.current?.focus();
                }}
                className="ml-auto shrink-0 text-text-subtle hover:text-foreground transition-colors"
                aria-label="Toggle tag list"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            {showTagMenu && (filteredTagSuggestions.length > 0 || canCreateTag) && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="Close tag menu"
                  onClick={() => setShowTagMenu(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 max-h-40 overflow-y-auto">
                  {canCreateTag && (
                    <button
                      type="button"
                      onClick={() => addTag(tagQuery)}
                      className="w-full px-4 py-3 text-left hover:bg-muted flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
                        <Plus size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground flex items-center gap-2 flex-wrap">
                          Create tag
                          <span className="px-2 py-0.5 rounded-md bg-primary-subtle text-primary text-xs font-medium">
                            {tagQuery}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Press Enter to create</p>
                      </div>
                    </button>
                  )}
                  {filteredTagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2.5"
                    >
                      <Checkbox
                        checked={tags.includes(tag)}
                        className="pointer-events-none"
                        aria-hidden
                      />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground mb-1">Access Control</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This resource will be private. Select user groups or add individual users below.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">User Groups</p>
              <p className="text-xs text-muted-foreground mb-2">
                Select existing groups to share this resource with
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGroupMenu((v) => !v)}
                  className={`${inputClass} text-left flex items-center justify-between`}
                >
                  <span className={userGroups.length > 0 ? 'text-foreground' : 'text-text-subtle'}>
                    {userGroups.length > 0
                      ? `${userGroups.length} group${userGroups.length === 1 ? '' : 's'} selected`
                      : 'Select user groups...'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showGroupMenu ? 'rotate-180' : ''}`}
                  />
                </button>
                {showGroupMenu && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10"
                      aria-label="Close group menu"
                      onClick={() => setShowGroupMenu(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="group flex items-center gap-1 px-4 py-2.5 hover:bg-muted"
                        >
                          <button
                            type="button"
                            onClick={() => toggleUserGroup(group.name)}
                            className="flex flex-1 items-center gap-2.5 text-left min-w-0"
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
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openEditGroupModal(group)}
                              title="Edit group"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-primary hover:bg-primary-subtle transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGroup(group)}
                              title="Delete group"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive-text transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          type="button"
                          onClick={openCreateGroupModal}
                          className="w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-muted flex items-center gap-2 font-medium"
                        >
                          <Plus size={14} />
                          Create New Group
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {userGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {userGroups.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-subtle text-primary text-xs"
                    >
                      {g}
                      <button type="button" onClick={() => setUserGroups(userGroups.filter((x) => x !== g))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Individual Users</p>
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {individualUsers.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-subtle text-primary text-xs font-medium"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() =>
                          setIndividualUsers(individualUsers.filter((e) => e !== email))
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
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

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Upload size={16} />
          Add Resource
        </button>
      </div>
    </div>
  );
}
