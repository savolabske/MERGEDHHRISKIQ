import { X, Upload, Link as LinkIcon, Tag, Globe, Lock, Mail, Plus } from 'lucide-react';
import { useState } from 'react';

interface AddResourceModalProps {
  onClose: () => void;
  isOpen: boolean;
}

export function AddResourceModal({ onClose, isOpen }: AddResourceModalProps) {
  const [resourceName, setResourceName] = useState('');
  const [description, setDescription] = useState('');
  const [externalLinks, setExternalLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState('');
  const [tags, setTags] = useState<string[]>(['Security', 'SOP']);
  const [currentTag, setCurrentTag] = useState('');
  const [privacySetting, setPrivacySetting] = useState<'public' | 'private'>('public');
  const [grantAccessEmails, setGrantAccessEmails] = useState<string[]>(['Example Org']);
  const [currentEmail, setCurrentEmail] = useState('');

  if (!isOpen) return null;

  const handleAddLink = () => {
    if (currentLink.trim()) {
      setExternalLinks([...externalLinks, currentLink.trim()]);
      setCurrentLink('');
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddEmail = () => {
    if (currentEmail.trim() && !grantAccessEmails.includes(currentEmail.trim())) {
      setGrantAccessEmails([...grantAccessEmails, currentEmail.trim()]);
      setCurrentEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setGrantAccessEmails(grantAccessEmails.filter(email => email !== emailToRemove));
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log({
      resourceName,
      description,
      externalLinks,
      tags,
      privacySetting,
      grantAccessEmails: privacySetting === 'private' ? grantAccessEmails : []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1400] p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Add New Resource</h2>
            <p className="text-sm text-text-subtle">Create a new entry in the intelligence hub</p>
          </div>
          <button 
            onClick={onClose}
            className="text-text-subtle hover:text-foreground transition-colors"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 space-y-6">
          {/* Resource Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Resource Name
            </label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g. Standard Operating Procedures Q1 2024"
              className="w-full h-[48px] px-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-border-muted outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the purpose and scope of this resource..."
              rows={4}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-border-muted outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Documents Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Documents
            </label>
            <div className="border-2 border-dashed border-border-muted rounded-lg p-12 flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Upload size={20} className="text-muted-foreground" strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Click or drag to upload files
              </p>
              <p className="text-xs text-text-subtle">
                PDF, DOCX, XLSX (Max 50MB)
              </p>
            </div>
          </div>

          {/* External Links */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              External Links
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" strokeWidth={2} />
                <input
                  type="text"
                  value={currentLink}
                  onChange={(e) => setCurrentLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                  placeholder="Paste URL here..."
                  className="w-full h-[44px] pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-border-muted outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={handleAddLink}
                className="w-[44px] h-[44px] flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Plus size={16} className="text-muted-foreground" strokeWidth={2} />
              </button>
            </div>
            {externalLinks.length > 0 && (
              <div className="mt-3 space-y-2">
                {externalLinks.map((link, index) => (
                  <div key={index} className="text-sm text-primary truncate">
                    {link}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" strokeWidth={2} />
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add category tags..."
                className="w-full h-[44px] pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-border-muted outline-none focus:border-primary transition-colors"
              />
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-subtle text-primary rounded text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-hover transition-colors"
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Privacy Setting
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPrivacySetting('public')}
                className={`h-[48px] flex items-center justify-center gap-2 rounded-lg border-2 transition-all ${
                  privacySetting === 'public'
                    ? 'border-primary bg-primary-subtle text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Globe size={16} strokeWidth={2} />
                <span className="text-sm font-medium">Public</span>
              </button>
              <button
                onClick={() => setPrivacySetting('private')}
                className={`h-[48px] flex items-center justify-center gap-2 rounded-lg border-2 transition-all ${
                  privacySetting === 'private'
                    ? 'border-primary bg-primary-subtle text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Lock size={16} strokeWidth={2} />
                <span className="text-sm font-medium">Private</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-text-subtle">
              Public resources are visible to all authenticated personnel.
            </p>
          </div>

          {/* Grant Access (only show when Private is selected) */}
          {privacySetting === 'private' && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Grant Access
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" strokeWidth={2} />
                  <input
                    type="text"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                    placeholder="Enter email or organization..."
                    className="w-full h-[44px] pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-border-muted outline-none focus:border-primary transition-colors"
                  />
                </div>
                <button
                  onClick={handleAddEmail}
                  className="w-[44px] h-[44px] flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Plus size={16} className="text-muted-foreground" strokeWidth={2} />
                </button>
              </div>
              {grantAccessEmails.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {grantAccessEmails.map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-subtle text-primary rounded text-xs font-medium"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="hover:text-primary-hover transition-colors"
                      >
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-8 py-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold text-sm"
          >
            Create Resource
          </button>
        </div>
      </div>
    </div>
  );
}