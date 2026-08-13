import { useEffect, useMemo, useState } from 'react';
import { Edit, MoreVertical, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  createEmptyInterestDraft,
  formatInterestUpdatedAt,
  getActiveInterests,
  INTEREST_ICON_OPTIONS,
  loadManagedInterests,
  saveManagedInterests,
  type InterestIconKey,
  type ManagedInterest,
} from '../../data/interestsAdminMock';
import { PageScrollShell } from '../PageScrollShell';
import { ConfirmDeleteDialog } from '../ui/ConfirmDeleteDialog';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  ListPageHeader,
  ListPageSearch,
  listHeaderActionClass,
  listRowClass,
} from '../ui/list-page';
import { iconButtonClass, menuItemClass } from '../ui/interaction';
import { cn } from '../ui/utils';
import { INTEREST_ICONS } from '../onboarding/interestIcons';

type InterestFormState = {
  name: string;
  description: string;
  iconKey: InterestIconKey;
  accent: string;
  active: boolean;
  prompt: string;
};

function toFormState(interest?: ManagedInterest | null): InterestFormState {
  if (!interest) {
    return {
      name: '',
      description: '',
      iconKey: 'earlyWarning',
      accent: '#2463eb',
      active: true,
      prompt: '',
    };
  }
  return {
    name: interest.name,
    description: interest.description,
    iconKey: interest.iconKey,
    accent: interest.accent,
    active: interest.active,
    prompt: interest.prompt,
  };
}

export function ManageInterests() {
  const [interests, setInterests] = useState<ManagedInterest[]>(() => loadManagedInterests());
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InterestFormState>(toFormState());

  useEffect(() => {
    saveManagedInterests(interests);
  }, [interests]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return interests;
    return interests.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q),
    );
  }, [interests, searchQuery]);

  const activeCount = interests.filter((i) => i.active).length;
  const SelectedIcon = INTEREST_ICONS[form.iconKey];
  const selectedIconLabel =
    INTEREST_ICON_OPTIONS.find((opt) => opt.key === form.iconKey)?.label ?? 'Icon';

  const openCreate = () => {
    setEditingId(null);
    setForm(toFormState());
    setEditorOpen(true);
    setOpenMenuId(null);
  };

  const openEdit = (interest: ManagedInterest) => {
    setEditingId(interest.id);
    setForm(toFormState(interest));
    setEditorOpen(true);
    setOpenMenuId(null);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setForm(toFormState());
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Please enter an interest name');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please enter a short description');
      return;
    }
    if (!form.prompt.trim()) {
      toast.error('Please enter a backing prompt');
      return;
    }

    if (editingId) {
      setInterests((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                description: form.description.trim(),
                iconKey: form.iconKey,
                accent: form.accent,
                active: form.active,
                prompt: form.prompt.trim(),
                updatedAt: formatInterestUpdatedAt(),
              }
            : item,
        ),
      );
      toast.success('Interest updated');
    } else {
      const draft = createEmptyInterestDraft(interests.length + 1);
      const created: ManagedInterest = {
        ...draft,
        id: `interest-${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        iconKey: form.iconKey,
        accent: form.accent,
        active: form.active,
        prompt: form.prompt.trim(),
        updatedAt: formatInterestUpdatedAt(),
      };
      setInterests((prev) => [...prev, created]);
      toast.success('Interest added — it will appear in onboarding when active');
    }
    closeEditor();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const name = interests.find((i) => i.id === deleteId)?.name ?? 'Interest';
    setInterests((prev) => prev.filter((i) => i.id !== deleteId));
    setDeleteId(null);
    toast.success(`${name} removed`);
  };

  const toggleActive = (id: string) => {
    setInterests((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, active: !item.active, updatedAt: formatInterestUpdatedAt() }
          : item,
      ),
    );
    setOpenMenuId(null);
  };

  return (
    <>
      <PageScrollShell innerClassName="space-y-6">
        <ListPageHeader
          title="Manage Interests"
          subtitle={`${activeCount} active · Shown during onboarding to personalize Home`}
          action={
            <Button type="button" onClick={openCreate} className={listHeaderActionClass}>
              <Plus size={18} />
              Add interest
            </Button>
          }
        />

        <ListPageSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search interests or prompts..."
        />

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
            <div className="col-span-4 table-header-label">Interest</div>
            <div className="col-span-2 table-header-label">Status</div>
            <div className="col-span-4 table-header-label">Prompt</div>
            <div className="col-span-2 table-header-label text-right">Actions</div>
          </div>

          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No interests match your search.
              </div>
            ) : (
              filtered.map((interest) => {
                const Icon = INTEREST_ICONS[interest.iconKey];
                return (
                  <div
                    key={interest.id}
                    className={cn(listRowClass, 'relative cursor-pointer')}
                    onClick={() => openEdit(interest)}
                  >
                    <div className="lg:col-span-4 min-w-0 pr-10 lg:pr-0 flex items-start gap-3">
                      <span
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: interest.accent }}
                      >
                        <Icon size={16} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="table-primary-text truncate">{interest.name}</p>
                        <p className="table-supporting-text truncate mt-0.5">
                          {interest.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 lg:hidden">
                          <StatusBadge active={interest.active} />
                          <span className="table-metadata-text">{interest.updatedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex lg:col-span-2 items-center">
                      <StatusBadge active={interest.active} />
                    </div>

                    <div className="hidden lg:block lg:col-span-4 min-w-0">
                      <p className="table-value-text line-clamp-2 text-muted-foreground">
                        {interest.prompt}
                      </p>
                    </div>

                    <div
                      className="absolute right-3 top-3 lg:static lg:col-span-2 lg:flex lg:items-center lg:justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative">
                        <button
                          type="button"
                          className={iconButtonClass}
                          aria-label="Interest actions"
                          onClick={() =>
                            setOpenMenuId((prev) => (prev === interest.id ? null : interest.id))
                          }
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === interest.id && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
                            <button
                              type="button"
                              className={menuItemClass}
                              onClick={() => openEdit(interest)}
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className={menuItemClass}
                              onClick={() => toggleActive(interest.id)}
                            >
                              {interest.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              className={cn(menuItemClass, 'text-destructive-text')}
                              onClick={() => {
                                setDeleteId(interest.id);
                                setOpenMenuId(null);
                              }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Active interests appear in first-login onboarding. Each interest has one backing prompt that
          shapes Home when users select it.
          {getActiveInterests(interests).length === 0
            ? ' Activate at least one interest so new users can personalize.'
            : null}
        </p>
      </PageScrollShell>

      {editorOpen && (
        <div className="fixed inset-0 z-[1400] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close"
            onClick={closeEditor}
          />
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingId ? 'Edit interest' : 'Add interest'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pair a focus area with a prompt that shapes Home for users who select it.
                </p>
              </div>
              <button type="button" className={iconButtonClass} onClick={closeEditor} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Name <span className="text-destructive-text">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Food security & nutrition"
                    className="w-full rounded-lg border border-input bg-input-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Description <span className="text-destructive-text">*</span>
                  </label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short line shown on the onboarding card"
                    className="w-full rounded-lg border border-input bg-input-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Icon</label>
                  <Select
                    value={form.iconKey}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, iconKey: value as InterestIconKey }))
                    }
                  >
                    <SelectTrigger className="h-11 rounded-lg bg-input-background">
                      <SelectValue>
                        <span className="flex items-center gap-2.5">
                          <SelectedIcon size={16} strokeWidth={1.75} className="text-foreground" />
                          <span>{selectedIconLabel}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[1500]">
                      {INTEREST_ICON_OPTIONS.map((opt) => {
                        const Icon = INTEREST_ICONS[opt.key];
                        return (
                          <SelectItem key={opt.key} value={opt.key}>
                            <span className="flex items-center gap-2.5">
                              <Icon size={16} strokeWidth={1.75} />
                              <span>{opt.label}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.accent}
                      onChange={(e) => setForm((prev) => ({ ...prev, accent: e.target.value }))}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                    />
                    <input
                      value={form.accent}
                      onChange={(e) => setForm((prev) => ({ ...prev, accent: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-input-background px-3.5 py-2.5 text-sm font-mono focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <label className="sm:col-span-2 flex items-center gap-2.5 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20"
                  />
                  Active in onboarding
                </label>
              </div>

              <div className="border-t border-border pt-5">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Backing prompt <span className="text-destructive-text">*</span>
                </label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Used to shape Home when users select this interest.
                </p>
                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm((prev) => ({ ...prev, prompt: e.target.value }))}
                  rows={5}
                  placeholder="Describe what Home should emphasize for people who care about this interest…"
                  className="w-full resize-y rounded-lg border border-input bg-input-background px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button type="button" variant="outline" onClick={closeEditor}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                {editingId ? 'Save changes' : 'Add interest'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete interest?"
        description="Users who already selected it keep their current home prompts. New onboarding will no longer offer this interest."
        onConfirm={handleDelete}
      />
    </>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
        active ? 'bg-success-subtle text-success-text' : 'bg-muted text-muted-foreground',
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
