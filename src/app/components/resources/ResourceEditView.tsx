import {
  ArrowLeft,
  Plus,
  X,
  Globe,
  ExternalLink,
  Users,
  User,
  Calendar,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PlatformResource } from '../../data/resourcesMock';
import { MOCK_USER_GROUPS } from '../../data/resourcesMock';
import { OwnershipBadge, SectionLabel, TagPill, inputClass, textareaClass } from './resourceShared';
import { ResourceDocumentsList } from './ResourceDocumentsList';

interface ResourceEditViewProps {
  resource: PlatformResource;
  onBack: () => void;
  onCancel: () => void;
  onSave: (updated: PlatformResource) => void;
}

export function ResourceEditView({ resource, onBack, onCancel, onSave }: ResourceEditViewProps) {
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description);
  const [tags, setTags] = useState([...resource.tags]);
  const [tagInput, setTagInput] = useState('');
  const [webLinks, setWebLinks] = useState([...resource.webLinks]);
  const [linkInput, setLinkInput] = useState('');
  const [userGroups, setUserGroups] = useState([...resource.userGroups]);
  const [individualUsers, setIndividualUsers] = useState([...resource.individualUsers]);
  const [emailInput, setEmailInput] = useState('');
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [files, setFiles] = useState([...resource.files]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
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

  const addEmail = () => {
    const email = emailInput.trim();
    if (email && !individualUsers.includes(email)) {
      setIndividualUsers([...individualUsers, email]);
      setEmailInput('');
    }
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
      webLinks,
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

  const availableGroups = MOCK_USER_GROUPS.filter((g) => !userGroups.includes(g));

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Resources
      </button>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl sm:text-2xl font-semibold text-foreground bg-transparent border-0 p-0 focus:outline-none focus:ring-0 mb-3"
            />
            <OwnershipBadge ownership={resource.ownership} />
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <SectionLabel>Description</SectionLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={textareaClass}
            />
          </div>

          <ResourceDocumentsList files={files} editable onChange={setFiles} />

          <div className="bg-card rounded-xl border border-border p-6">
            <SectionLabel>Web Links</SectionLabel>
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

          <div className="bg-card rounded-xl border border-border p-6">
            <SectionLabel>Shared With</SectionLabel>
            <p className="text-sm text-muted-foreground mb-4">
              Groups and individuals who have access to this resource.
            </p>

            <div className="mb-4">
              <p className="text-sm font-medium text-foreground mb-2">User Groups</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGroupMenu((v) => !v)}
                  className={`${inputClass} text-left flex items-center justify-between`}
                >
                  <span className="text-text-subtle">Select user groups...</span>
                  <ChevronDown size={16} className="text-text-subtle" />
                </button>
                {showGroupMenu && availableGroups.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1">
                    {availableGroups.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => {
                          setUserGroups([...userGroups, group]);
                          setShowGroupMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {userGroups.map((group) => (
                  <span
                    key={group}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-subtle text-primary text-sm font-medium"
                  >
                    <Users size={14} />
                    {group}
                    <button
                      type="button"
                      onClick={() => setUserGroups(userGroups.filter((g) => g !== group))}
                      className="hover:text-primary-hover"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Individual Users</p>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addEmail();
                  }
                }}
                placeholder="Add users by email..."
                className={inputClass}
              />
              <div className="space-y-2 mt-3">
                {individualUsers.map((email) => (
                  <div key={email} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User size={14} className="text-muted-foreground" />
                      </span>
                      {email}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setIndividualUsers(individualUsers.filter((e) => e !== email))
                      }
                      className="text-muted-foreground hover:text-destructive-text"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-subtle transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <aside className="w-full xl:w-72 shrink-0 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag (type comma or space to add)..."
              className={inputClass}
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Created
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar size={16} className="text-muted-foreground" />
                {resource.createdAt}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Last Modified
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock size={16} className="text-muted-foreground" />
                {resource.lastModified}
              </div>
            </div>
          </div>

          <p className="text-xs text-text-subtle text-center">Editing mode active</p>
        </aside>
      </div>
    </div>
  );
}
