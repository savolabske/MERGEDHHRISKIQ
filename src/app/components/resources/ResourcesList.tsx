import {
  Plus,
  Grid2X2,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  MessagesSquare,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlatformResource, ResourceOwnership } from '../../data/resourcesMock';
import { Button } from '../ui/button';
import { ConfirmDeleteDialog } from '../ui/ConfirmDeleteDialog';
import {
  ListPageHeader,
  ListPageToolbar,
  listHeaderActionClass,
} from '../ui/list-page';
import {
  iconButtonSmClass,
  interactiveCardProps,
  interactiveSurfaceClass,
  listFilterTriggerClass,
  menuItemClass,
  paginationControlClass,
} from '../ui/interaction';
import { cn } from '../ui/utils';
import {
  OwnershipBadge,
  PlatformResourceStatusCell,
  PlatformResourceStatusCompact,
  TagPill,
} from './resourceShared';

type FilterOption = 'all' | ResourceOwnership;
type StatusFilterOption = 'all' | 'uploading' | 'completed';

const PAGE_SIZE_OPTIONS = [9, 12, 18, 24] as const;

interface ResourcesListProps {
  resources: PlatformResource[];
  onAdd: () => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChatWithResource?: (id: string) => void;
}

function ResourceActionsMenu({
  resourceId,
  isOpen,
  onToggle,
  onClose,
  onSelect,
  onEdit,
  onDelete,
  onChatWithResource,
}: {
  resourceId: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChatWithResource?: (id: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(iconButtonSmClass, 'size-9')}
        aria-label="Resource actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close menu"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 z-20 w-48 bg-card border border-border rounded-lg shadow-lg py-1"
          >
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(resourceId);
                onClose();
              }}
              className={cn(menuItemClass, 'flex items-center gap-2 px-3 text-foreground')}
            >
              <Eye size={14} />
              View
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resourceId);
                onClose();
              }}
              className={cn(menuItemClass, 'flex items-center gap-2 px-3 text-foreground')}
            >
              <Pencil size={14} />
              Edit
            </button>
            {onChatWithResource && (
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onChatWithResource(resourceId);
                  onClose();
                }}
                className={cn(menuItemClass, 'flex items-center gap-2 px-3 text-foreground')}
              >
                <MessagesSquare size={14} />
                Chat with resource
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resourceId);
                onClose();
              }}
              className={cn(
                menuItemClass,
                'flex items-center gap-2 px-3 text-destructive-text hover:bg-destructive-subtle',
              )}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ResourcesList({
  resources,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
  onChatWithResource,
}: ResourcesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showStatusFilterMenu, setShowStatusFilterMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const statusFilterMenuRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesFilter = filter === 'all' || r.ownership === filter;
      const resourceStatus = r.status?.state ?? 'completed';
      const matchesStatusFilter = statusFilter === 'all' || resourceStatus === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      return matchesFilter && matchesStatusFilter && matchesSearch;
    });
  }, [resources, filter, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = filtered.slice(startIndex, startIndex + itemsPerPage);
  const showingStart = filtered.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(startIndex + itemsPerPage, filtered.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, statusFilter, itemsPerPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterMenuRef.current && !filterMenuRef.current.contains(target)) {
        setShowFilterMenu(false);
      }
      if (statusFilterMenuRef.current && !statusFilterMenuRef.current.contains(target)) {
        setShowStatusFilterMenu(false);
      }
      if (itemsPerPageDropdownRef.current && !itemsPerPageDropdownRef.current.contains(target)) {
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

  const statusFilterLabel =
    statusFilter === 'all'
      ? `All Status (${filtered.length})`
      : statusFilter === 'uploading'
        ? `Uploading (${filtered.length})`
        : `Completed (${filtered.length})`;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="My Resources"
        subtitle="Manage and discover operational documents, research, and technical links."
        action={
          <Button type="button" onClick={onAdd} className={listHeaderActionClass}>
            <Plus size={18} />
            Add Resource
          </Button>
        }
      />

      <ListPageToolbar
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search resources...',
        }}
        trailing={
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                iconButtonSmClass,
                'size-9',
                viewMode === 'list' && 'bg-primary text-white hover:bg-primary-hover hover:text-white',
              )}
              aria-label="List view"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                iconButtonSmClass,
                'size-9',
                viewMode === 'grid' && 'bg-primary text-white hover:bg-primary-hover hover:text-white',
              )}
              aria-label="Grid view"
            >
              <Grid2X2 size={16} />
            </button>
          </div>
        }
        filterCount={2}
        filters={
          <>
            <div className="relative min-w-0 sm:min-w-[180px] sm:w-auto" ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowStatusFilterMenu(false);
                  setShowFilterMenu((v) => !v);
                }}
                className={cn(listFilterTriggerClass, 'w-full justify-between py-2.5')}
                aria-expanded={showFilterMenu}
              >
                <span className="truncate">{filterLabel}</span>
                <ChevronDown
                  size={16}
                  className={`text-text-subtle shrink-0 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`}
                />
              </button>
              {showFilterMenu && (
                <div className="absolute left-0 sm:right-0 sm:left-auto z-20 mt-1 w-full sm:w-48 bg-card border border-border rounded-lg shadow-lg py-1">
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
                      className={cn(
                        menuItemClass,
                        filter === value ? 'text-primary font-medium' : 'text-foreground',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative min-w-0 sm:min-w-[160px] sm:w-auto" ref={statusFilterMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowFilterMenu(false);
                  setShowStatusFilterMenu((v) => !v);
                }}
                className={cn(listFilterTriggerClass, 'w-full justify-between py-2.5')}
                aria-expanded={showStatusFilterMenu}
              >
                <span className="truncate">{statusFilterLabel}</span>
                <ChevronDown
                  size={16}
                  className={`text-text-subtle shrink-0 transition-transform ${showStatusFilterMenu ? 'rotate-180' : ''}`}
                />
              </button>
              {showStatusFilterMenu && (
                <div className="absolute left-0 sm:right-0 sm:left-auto z-20 mt-1 w-full sm:w-44 bg-card border border-border rounded-lg shadow-lg py-1">
                  {(
                    [
                      ['all', 'All Status'],
                      ['uploading', 'Uploading'],
                      ['completed', 'Completed'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(value);
                        setShowStatusFilterMenu(false);
                      }}
                      className={cn(
                        menuItemClass,
                        statusFilter === value ? 'text-primary font-medium' : 'text-foreground',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        }
      />

      {viewMode === 'list' ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="hidden min-h-10 md:grid grid-cols-12 gap-4 px-4 sm:px-6 py-3 bg-muted/70 border-b border-border">
            <div className="col-span-5 table-header-label">
              Name
            </div>
            <div className="col-span-3 table-header-label">
              Status
            </div>
            <div className="col-span-2 table-header-label">
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
                  className="md:col-span-5 text-left min-w-0 w-full pr-12 md:pr-0"
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
                  <div className="w-full">
                    <span className="table-header-label mr-2 md:hidden">Status</span>
                    <PlatformResourceStatusCell
                      status={resource.status}
                      fallbackDate={resource.lastModified}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center mt-2 md:mt-0">
                  <span className="table-metadata-text">
                    <span className="table-header-label mr-2 md:hidden">Last Modified</span>
                    {resource.lastModified}
                  </span>
                </div>

                <div className="absolute top-4 right-4 sm:right-6 md:relative md:top-auto md:right-auto md:col-span-2 flex items-center justify-end">
                  <ResourceActionsMenu
                    resourceId={resource.id}
                    isOpen={openMenuId === resource.id}
                    onToggle={() =>
                      setOpenMenuId(openMenuId === resource.id ? null : resource.id)
                    }
                    onClose={() => setOpenMenuId(null)}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={(id) => setDeleteId(id)}
                    onChatWithResource={onChatWithResource}
                  />
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
            <div
              key={resource.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(resource.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(resource.id);
                }
              }}
              className={cn(
                'group relative text-left p-5 bg-card border border-border rounded-xl cursor-pointer',
                interactiveSurfaceClass.white,
              )}
              {...interactiveCardProps}
            >
              <div className="absolute top-3 right-3 z-10">
                <ResourceActionsMenu
                  resourceId={resource.id}
                  isOpen={openMenuId === resource.id}
                  onToggle={() =>
                    setOpenMenuId(openMenuId === resource.id ? null : resource.id)
                  }
                  onClose={() => setOpenMenuId(null)}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={(id) => setDeleteId(id)}
                  onChatWithResource={onChatWithResource}
                />
              </div>
              <h3 className="table-primary-text mb-2 pr-10 break-words group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <OwnershipBadge ownership={resource.ownership} />
                <PlatformResourceStatusCompact
                  status={resource.status}
                  fallbackDate={resource.lastModified}
                />
              </div>
              <p className="table-supporting-text line-clamp-2 mb-3">{resource.description}</p>
              <p className="table-metadata-text">{resource.lastModified}</p>
            </div>
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
                className={cn(listFilterTriggerClass, 'min-w-[70px] justify-between px-3 py-1.5')}
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
                      className={cn(
                        menuItemClass,
                        'px-3',
                        itemsPerPage === count && 'bg-secondary font-medium',
                      )}
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
                className={paginationControlClass}
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
                    className={cn(
                      paginationControlClass,
                      'min-w-[30px] h-[30px] sm:min-w-[32px] sm:h-[32px] px-2 text-sm font-medium',
                      currentPage === page && 'bg-primary text-white hover:bg-primary-hover hover:text-white',
                    )}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={paginationControlClass}
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          onDelete(deleteId);
          setDeleteId(null);
        }}
        title="Are you sure you want to delete?"
        description={
          deleteId
            ? `"${resources.find((r) => r.id === deleteId)?.title ?? 'This resource'}" will be permanently removed. This action cannot be undone.`
            : 'This resource will be permanently removed. This action cannot be undone.'
        }
      />
    </div>
  );
}
