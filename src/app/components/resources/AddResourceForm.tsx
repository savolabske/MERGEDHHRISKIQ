import { ArrowLeft, Plus, X, Upload, Link as LinkIcon, ChevronDown, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PlatformResource } from '../../data/resourcesMock';
import { MOCK_USER_GROUPS } from '../../data/resourcesMock';
import { inputClass, textareaClass } from './resourceShared';

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
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);

  const suggestedTags = ['SomaliaGBHA', 'EconomicOutlook', 'FoodSystem', 'HCT', 'WASH', 'coordination'];

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const addLink = () => {
    const url = linkInput.trim();
    if (url && !webLinks.includes(url)) {
      setWebLinks([...webLinks, url]);
      setLinkInput('');
    }
  };

  const addEmail = () => {
    const email = emailInput.trim();
    if (email && !individualUsers.includes(email)) {
      setIndividualUsers([...individualUsers, email]);
      setEmailInput('');
    }
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
      webLinks: webLinks.map((url, i) => ({
        id: `link-${i}`,
        url,
        addedAt: now,
      })),
      userGroups,
      individualUsers,
    });
    toast.success('Resource created successfully');
  };

  const availableGroups = MOCK_USER_GROUPS.filter((g) => !userGroups.includes(g));

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Resource Hub
      </button>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Add New Resource</h2>
        <p className="text-sm text-muted-foreground">
          Provide resource details and upload content to your workspace repository.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-8 max-w-3xl">
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
          <h3 className="text-sm font-semibold text-foreground mb-4">Web Links</h3>
          <div className="relative">
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
            className="mt-2 w-9 h-9 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
          </button>
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
              className="min-h-[44px] flex flex-wrap items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card cursor-text"
              onClick={() => setShowTagMenu(true)}
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
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                onFocus={() => setShowTagMenu(true)}
                placeholder={tags.length === 0 ? 'Select or add tags...' : ''}
                className="flex-1 min-w-[120px] border-0 p-0 text-sm focus:outline-none focus:ring-0 bg-transparent"
              />
              <ChevronDown size={16} className="text-text-subtle ml-auto shrink-0" />
            </div>
            {showTagMenu && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="Close tag menu"
                  onClick={() => setShowTagMenu(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 max-h-40 overflow-y-auto">
                  {suggestedTags
                    .filter((t) => !tags.includes(t))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          addTag(tag);
                          setShowTagMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                      >
                        {tag}
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
                  <span className="text-text-subtle">Select user groups...</span>
                  <ChevronDown size={16} />
                </button>
                {showGroupMenu && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1">
                    {availableGroups.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => {
                          setUserGroups([...userGroups, group]);
                          setShowGroupMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Users size={14} className="text-muted-foreground" />
                        {group}
                      </button>
                    ))}
                  </div>
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
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                    e.preventDefault();
                    addEmail();
                  }
                }}
                placeholder="Add users by email (type comma or space to add)..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end gap-3 max-w-3xl">
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
