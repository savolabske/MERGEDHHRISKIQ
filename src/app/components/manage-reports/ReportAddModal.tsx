import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { LINKABLE_KNOWLEDGE_SOURCES } from '../../data/reportResourceLink';
import { inputClass, textareaClass } from '../resources/resourceShared';
import { cn } from '../ui/utils';
import { ReportUserGroupSelect } from './ReportUserGroupSelect';

interface ReportAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    description: string;
    userGroups: string[];
    resourceId?: string;
  }) => void;
}

export function ReportAddModal({ open, onClose, onCreate }: ReportAddModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  const [resourceQuery, setResourceQuery] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );

  const selectedResource = LINKABLE_KNOWLEDGE_SOURCES.find((r) => r.id === selectedResourceId);

  const filteredResources = useMemo(() => {
    const q = resourceQuery.trim().toLowerCase();
    if (!q) return [...LINKABLE_KNOWLEDGE_SOURCES];
    return LINKABLE_KNOWLEDGE_SOURCES.filter((r) => r.title.toLowerCase().includes(q));
  }, [resourceQuery]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUserGroups([]);
    setSelectedResourceId('');
    setResourceMenuOpen(false);
    setResourceQuery('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate({
      title,
      description,
      userGroups,
      resourceId: selectedResourceId || undefined,
    });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 280;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const openAbove = spaceBelow < menuHeight && rect.top > spaceBelow;
    setMenuStyle({
      top: openAbove ? rect.top - menuHeight - gap : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!resourceMenuOpen) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
    const frame = requestAnimationFrame(updateMenuPosition);
    return () => cancelAnimationFrame(frame);
  }, [resourceMenuOpen, filteredResources.length]);

  useEffect(() => {
    if (!resourceMenuOpen) return;
    searchRef.current?.focus();
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [resourceMenuOpen]);

  useEffect(() => {
    if (!resourceMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setResourceMenuOpen(false);
      setResourceQuery('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [resourceMenuOpen]);

  if (!open) return null;

  const resourceMenu =
    resourceMenuOpen && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[1500] bg-card border border-border rounded-lg shadow-lg overflow-hidden"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={resourceQuery}
                  onChange={(e) => setResourceQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-card focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredResources.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">No resources found.</p>
              ) : (
                filteredResources.map((resource) => {
                  const isSelected = selectedResourceId === resource.id;
                  return (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() => {
                        setSelectedResourceId(isSelected ? '' : resource.id);
                        setResourceMenuOpen(false);
                        setResourceQuery('');
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors',
                        isSelected
                          ? 'bg-primary-subtle/50 text-primary font-medium'
                          : 'text-foreground',
                      )}
                    >
                      {resource.title}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
      <div className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Add report</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create a new report shell with placeholder sections
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5 overflow-y-auto flex-1 min-h-0">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title <span className="text-destructive-text">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aid Flow Intelligence"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this report's purpose..."
              rows={3}
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Resources <span className="font-normal text-text-subtle">(optional)</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Link this report to existing resources, or add them after it&apos;s created.
            </p>
            <div className="relative">
              <div
                ref={triggerRef}
                role="button"
                tabIndex={0}
                onClick={() => setResourceMenuOpen((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setResourceMenuOpen((v) => !v);
                  }
                }}
                className={cn(
                  inputClass,
                  'cursor-pointer text-left flex items-center gap-2 min-h-[42px]',
                  resourceMenuOpen && 'border-primary ring-2 ring-ring/10',
                )}
                aria-expanded={resourceMenuOpen}
                aria-haspopup="listbox"
              >
                {selectedResource ? (
                  <span className="inline-flex max-w-full items-center gap-0.5 rounded-xs bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-primary-text">
                    <span className="truncate">{selectedResource.title}</span>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResourceId('');
                      }}
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Clear selected resource"
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                  </span>
                ) : (
                  <span className="text-text-subtle">Select a resource...</span>
                )}
                <ChevronDown
                  size={16}
                  className={cn(
                    'ml-auto shrink-0 text-text-subtle transition-transform',
                    resourceMenuOpen && 'rotate-180',
                  )}
                />
              </div>
              {resourceMenu}
            </div>
          </div>

          <ReportUserGroupSelect
            selected={userGroups}
            onChange={setUserGroups}
            placement="above"
          />
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create report
          </button>
        </div>
      </div>
    </div>
  );
}
