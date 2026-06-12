import {
  Plus,
  Search,
  Grid2X2,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlatformResource, ResourceOwnership } from '../../data/resourcesMock';
import { OwnershipBadge, TagPill } from './resourceShared';

type FilterOption = 'all' | ResourceOwnership;

const PAGE_SIZE_OPTIONS = [9, 12, 18, 24] as const;

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = filtered.slice(startIndex, startIndex + itemsPerPage);
  const showingStart = filtered.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(startIndex + itemsPerPage, filtered.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, itemsPerPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        itemsPerPageDropdownRef.current &&
        !itemsPerPageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowItemsPerPageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const groupStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
      const groupEnd = Math.min(groupStart + 2, totalPages);

      if (groupStart > 1) {
        pages.push('...');
      }

      for (let i = groupStart; i <= groupEnd; i++) {
        pages.push(i);
      }

      if (groupEnd < totalPages) {
        pages.push('...');
      }
    }

    return pages;
  };

  const filterLabel =
    filter === 'all'
      ? `All Resources (${filtered.length})`
      : filter === 'created_by_me'
        ? `Created by me (${filtered.length})`
        : `Shared with me (${filtered.length})`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-page-title mb-1">My Resources</h2>
          <p className="text-sm text-muted-foreground max-w-prose">
            Manage and discover operational documents, research, and technical links.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Plus size={18} />
          Add Resource
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative w-full">
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

        <div className="flex items-stretch gap-3">
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setShowFilterMenu((v) => !v)}
              className="flex w-full items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors justify-between min-w-0"
            >
              <span className="truncate">{filterLabel}</span>
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
      </div>

      {viewMode === 'list' ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden min-h-10 md:grid grid-cols-12 gap-4 px-4 sm:px-6 py-3 bg-muted/70 border-b border-border">
            <div className="col-span-7 table-header-label">
              Name
            </div>
            <div className="col-span-3 table-header-label">
              Last Modified
            </div>
            <div className="col-span-2 table-header-label text-right">
              Actions
            </div>
          </div>

          <div className="divide-y divide-border">
            {paginatedResources.map((resource) => (
              <div
                key={resource.id}
                className="table-row-entity relative px-4 sm:px-6 py-4 md:py-0 md:grid md:grid-cols-12 md:gap-4 md:items-center transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onSelect(resource.id)}
                  className="md:col-span-7 text-left min-w-0 w-full pr-12 md:pr-0"
                >
                  <h3 className="table-primary-text mb-2 break-words hover:text-primary-text transition-colors">
                    {resource.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <OwnershipBadge ownership={resource.ownership} />
                    {resource.tags.map((tag) => (
                      <TagPill key={tag} tag={tag} />
                    ))}
                  </div>
                </button>

                <div className="md:col-span-3 flex items-center mt-2 md:mt-0">
                  <span className="table-metadata-text">
                    <span className="table-header-label mr-2 md:hidden">Last Modified</span>
                    {resource.lastModified}
                  </span>
                </div>

                <div className="absolute top-4 right-4 sm:right-6 md:relative md:top-auto md:right-auto md:col-span-2 flex items-center justify-end">
                  <div className="relative">
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
          {paginatedResources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => onSelect(resource.id)}
              className="text-left p-5 bg-card border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all group"
            >
              <h3 className="table-primary-text mb-2 break-words group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <OwnershipBadge ownership={resource.ownership} />
              </div>
              <p className="table-supporting-text line-clamp-2 mb-3">{resource.description}</p>
              <p className="table-metadata-text">{resource.lastModified}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm text-muted-foreground">No resources found</p>
            </div>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-card rounded-xl border border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm text-muted-foreground">Show</span>
            <div className="relative" ref={itemsPerPageDropdownRef}>
              <button
                type="button"
                onClick={() => setShowItemsPerPageDropdown((v) => !v)}
                className="px-3 py-1.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[70px] justify-between"
              >
                {itemsPerPage}
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform ${showItemsPerPageDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              {showItemsPerPageDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
                  {PAGE_SIZE_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setItemsPerPage(count);
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

          <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <span className="text-sm text-muted-foreground text-center sm:text-left">
              {showingStart}-{showingEnd} of {filtered.length}
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              <button
                type="button"
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
              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-1.5 sm:px-2 text-sm text-text-subtle">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page as number)}
                    className={`min-w-[30px] h-[30px] sm:min-w-[32px] sm:h-[32px] px-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
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
  );
}
