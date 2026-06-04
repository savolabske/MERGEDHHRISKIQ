import {
  Plus,
  Search,
  Grid2X2,
  List,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PlatformResource, ResourceOwnership } from '../../data/resourcesMock';
import { OwnershipBadge, TagPill } from './resourceShared';

type FilterOption = 'all' | ResourceOwnership;

interface ResourcesListProps {
  resources: PlatformResource[];
  onAdd: () => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ResourcesList({
  resources,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
}: ResourcesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesFilter = filter === 'all' || r.ownership === filter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [resources, filter, searchQuery]);

  const filterLabel =
    filter === 'all'
      ? `All Resources (${filtered.length})`
      : filter === 'created_by_me'
        ? `Created by me (${filtered.length})`
        : `Shared with me (${filtered.length})`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">My Resources</h2>
          <p className="text-sm text-muted-foreground">
            Manage and discover operational documents, research, and technical links.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus size={18} />
          Add Resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            size={18}
          />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors min-w-[180px] justify-between"
          >
            <span>{filterLabel}</span>
            <ChevronDown size={16} className="text-text-subtle shrink-0" />
          </button>
          {showFilterMenu && (
            <div className="absolute z-20 mt-1 w-full min-w-[200px] bg-card border border-border rounded-lg shadow-lg py-1">
              {(
                [
                  ['all', 'All Resources'],
                  ['created_by_me', 'Created by me'],
                  ['shared_with_me', 'Shared with me'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFilter(value);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                    filter === value ? 'text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
            aria-label="Grid view"
          >
            <Grid2X2 size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/60 border-b border-border">
            <div className="col-span-7 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Name
            </div>
            <div className="col-span-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Last Modified
            </div>
            <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
              Actions
            </div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((resource) => (
              <div
                key={resource.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onSelect(resource.id)}
                  className="md:col-span-7 text-left min-w-0"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <OwnershipBadge ownership={resource.ownership} />
                    {resource.tags.map((tag) => (
                      <TagPill key={tag} tag={tag} />
                    ))}
                  </div>
                </button>

                <div className="md:col-span-3 flex items-center">
                  <span className="text-sm text-muted-foreground">{resource.lastModified}</span>
                </div>

                <div className="md:col-span-2 flex items-center justify-start md:justify-end relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === resource.id ? null : resource.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    aria-label="Resource actions"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === resource.id && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10"
                        aria-label="Close menu"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-card border border-border rounded-lg shadow-lg py-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(resource.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onEdit(resource.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(resource.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive-text hover:bg-destructive-subtle"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No resources found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => onSelect(resource.id)}
              className="text-left p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all group"
            >
              <h3 className="font-semibold text-sm text-foreground mb-2 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <OwnershipBadge ownership={resource.ownership} />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{resource.description}</p>
              <p className="text-xs text-text-subtle">{resource.lastModified}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm text-muted-foreground">No resources found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
