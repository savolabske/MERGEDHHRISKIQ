import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Database,
  Bookmark,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Filter,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageScrollShell } from './PageScrollShell';
import { useProgressiveList } from '../hooks/useProgressiveList';
import { TableSkeleton } from './ui/table-skeleton';
import {
  type ApiCollection,
  type ApiDataset,
  type ApiSubscription,
  type CollectionProvider,
  type SyncSchedule,
  MOCK_API_COLLECTIONS,
  MOCK_API_DATASETS,
  MOCK_API_SUBSCRIPTIONS,
  formatApiDate,
  formatApiDateShort,
} from '../data/apiCollectionsMock';

type ActiveTab = 'all' | 'subscriptions';
type CollectionChipFilter = 'all' | 'hdx' | 'reliefweb' | 'acaps';

const COLLECTION_FILTER_CHIPS: { id: CollectionChipFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hdx', label: 'HDX' },
  { id: 'reliefweb', label: 'ReliefWeb' },
  { id: 'acaps', label: 'ACAPS' },
];

function matchesCollectionFilter(
  provider: CollectionProvider,
  collectionName: string,
  filter: CollectionChipFilter,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'hdx') return provider === 'hdx';
  if (filter === 'reliefweb') return collectionName.toLowerCase().includes('reliefweb');
  if (filter === 'acaps') return collectionName.toLowerCase().includes('acaps');
  return true;
}

function ProviderPill({ provider }: { provider: CollectionProvider }) {
  if (provider === 'hdx') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-sidebar-accent text-primary">
        HDX
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-secondary text-muted-foreground">
      Other
    </span>
  );
}

function StatusBadge({ status }: { status: ApiSubscription['status'] }) {
  switch (status) {
    case 'active':
      return (
        <div className="flex items-center gap-1.5 text-sm text-success-text">
          <CheckCircle2 size={16} />
          <span>Active</span>
        </div>
      );
    case 'syncing':
      return (
        <div className="flex items-center gap-1.5 text-sm text-warning">
          <Clock size={16} />
          <span>Syncing</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-1.5 text-sm text-destructive-text">
          <AlertCircle size={16} />
          <span>Error</span>
        </div>
      );
  }
}

export function Api() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [, setCollections] = useState<ApiCollection[]>(MOCK_API_COLLECTIONS);
  const [datasets, setDatasets] = useState<ApiDataset[]>(MOCK_API_DATASETS);
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>(MOCK_API_SUBSCRIPTIONS);

  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('All Orgs');
  const [collectionFilter, setCollectionFilter] = useState<CollectionChipFilter>('all');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribingDataset, setSubscribingDataset] = useState<ApiDataset | null>(null);
  const [subscribeDatasetId, setSubscribeDatasetId] = useState('');
  const [subscribeDatasetUrl, setSubscribeDatasetUrl] = useState('');
  const [subscribeSchedule, setSubscribeSchedule] = useState<SyncSchedule>('daily');
  const [editingSubscription, setEditingSubscription] = useState<ApiSubscription | null>(null);
  const [editSchedule, setEditSchedule] = useState<SyncSchedule>('daily');
  const [deletingSubscription, setDeletingSubscription] = useState<ApiSubscription | null>(null);

  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);

  const subscribedDatasetIds = useMemo(
    () => new Set(subscriptions.map((s) => s.datasetId)),
    [subscriptions],
  );

  const orgOptions = useMemo(() => {
    const source = activeTab === 'all' ? datasets : subscriptions;
    return ['All Orgs', ...Array.from(new Set(source.map((item) => item.org))).sort()];
  }, [activeTab, datasets, subscriptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (itemsPerPageDropdownRef.current && !itemsPerPageDropdownRef.current.contains(event.target as Node)) {
        setShowItemsPerPageDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, orgFilter, collectionFilter, statusFilter, itemsPerPage]);

  const filteredDatasets = datasets.filter((dataset) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      dataset.title.toLowerCase().includes(q) ||
      dataset.org.toLowerCase().includes(q) ||
      dataset.collectionName.toLowerCase().includes(q);
    const matchesOrg = orgFilter === 'All Orgs' || dataset.org === orgFilter;
    const matchesCollection = matchesCollectionFilter(
      dataset.provider,
      dataset.collectionName,
      collectionFilter,
    );
    return matchesSearch && matchesOrg && matchesCollection;
  });

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      sub.title.toLowerCase().includes(q) ||
      sub.org.toLowerCase().includes(q) ||
      sub.collectionName.toLowerCase().includes(q);
    const matchesOrg = orgFilter === 'All Orgs' || sub.org === orgFilter;
    const matchesCollection = matchesCollectionFilter(
      sub.provider,
      sub.collectionName,
      collectionFilter,
    );
    const matchesStatus =
      statusFilter === 'All Status' ||
      (statusFilter === 'Active' && sub.status === 'active') ||
      (statusFilter === 'Syncing' && sub.status === 'syncing') ||
      (statusFilter === 'Error' && sub.status === 'error');
    return matchesSearch && matchesOrg && matchesCollection && matchesStatus;
  });

  const activeList = activeTab === 'all' ? filteredDatasets : filteredSubscriptions;
  const totalPages = Math.ceil(activeList.length / itemsPerPage) || 1;
  const currentItems = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { visibleItems, isProgressivelyLoading } = useProgressiveList(currentItems, {
    minLoadingMs: 200,
    transitionKey: `${activeTab}-${currentPage}-${itemsPerPage}`,
  });
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleSyncCollections = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const loadingToast = toast.loading('Syncing collections...');

    setTimeout(() => {
      const now = new Date();
      setCollections((prev) =>
        prev.map((col) => ({ ...col, lastSyncedAt: formatApiDate(now) })),
      );
      setDatasets((prev) =>
        prev.map((ds, i) =>
          i < 2 ? { ...ds, updatedAt: formatApiDateShort(now) } : ds,
        ),
      );
      setIsSyncing(false);
      toast.dismiss(loadingToast);
      toast.success('Collections synced successfully');
    }, 2500);
  };

  const deriveDatasetId = (dataset: ApiDataset) =>
    dataset.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const getDatasetExternalUrl = (dataset: ApiDataset) => {
    if (dataset.externalUrl) return dataset.externalUrl;
    if (dataset.provider === 'hdx') {
      return `https://data.humdata.org/dataset/${deriveDatasetId(dataset)}`;
    }
    return null;
  };

  const openSubscribeModal = (dataset: ApiDataset | null = null) => {
    setShowSubscribeModal(true);
    setSubscribingDataset(dataset);
    setSubscribeDatasetId(dataset ? deriveDatasetId(dataset) : '');
    setSubscribeDatasetUrl(dataset?.externalUrl ?? '');
    setSubscribeSchedule('daily');
  };

  const handleHeaderSubscribe = () => {
    openSubscribeModal();
  };

  const handleSubscribe = () => {
    const enteredDatasetId = subscribeDatasetId.trim();
    const enteredUrl = subscribeDatasetUrl.trim();
    if (!subscribingDataset && !enteredDatasetId && !enteredUrl) return;

    const now = new Date();
    const derivedTitle =
      subscribingDataset?.title ??
      enteredDatasetId
        .split('-')
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');

    const datasetId =
      subscribingDataset?.id ?? `manual-${enteredDatasetId || Date.now().toString()}`;

    const newSub: ApiSubscription = {
      id: `sub-${Date.now()}`,
      datasetId,
      title: derivedTitle || 'HDX Dataset Subscription',
      org: subscribingDataset?.org ?? 'External Source',
      collectionName: subscribingDataset?.collectionName ?? 'HDX',
      provider: subscribingDataset?.provider ?? 'hdx',
      fileCount: subscribingDataset?.fileCount ?? 0,
      syncSchedule: subscribeSchedule,
      status: 'active',
      lastRefreshedAt: formatApiDate(now),
      subscribedAt: formatApiDateShort(now),
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    setShowSubscribeModal(false);
    setSubscribingDataset(null);
    setSubscribeDatasetId('');
    setSubscribeDatasetUrl('');
    toast.success('Dataset subscribed successfully');
  };

  const openEditModal = (sub: ApiSubscription) => {
    setEditingSubscription(sub);
    setEditSchedule(sub.syncSchedule);
  };

  const handleSaveEdit = () => {
    if (!editingSubscription) return;
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === editingSubscription.id ? { ...s, syncSchedule: editSchedule } : s,
      ),
    );
    setEditingSubscription(null);
    toast.success('Subscription updated successfully');
  };

  const handleRefresh = (sub: ApiSubscription) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: 'syncing' } : s)),
    );
    const loadingToast = toast.loading(`Refreshing ${sub.title}...`);

    setTimeout(() => {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? { ...s, status: 'active', lastRefreshedAt: formatApiDate(new Date()) }
            : s,
        ),
      );
      toast.dismiss(loadingToast);
      toast.success('Dataset refreshed successfully');
    }, 2000);
  };

  const handleConfirmDelete = () => {
    if (!deletingSubscription) return;
    setSubscriptions((prev) => prev.filter((s) => s.id !== deletingSubscription.id));
    toast.success('Subscription removed successfully');
    setDeletingSubscription(null);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const groupStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
      const groupEnd = Math.min(groupStart + 2, totalPages);
      if (groupStart > 1) pages.push('...');
      for (let i = groupStart; i <= groupEnd; i++) pages.push(i);
      if (groupEnd < totalPages) pages.push('...');
    }
    return pages;
  };

  const scheduleLabel = (schedule: SyncSchedule) => {
    switch (schedule) {
      case 'manual':
        return 'Manual';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
    }
  };

  return (
    <>
      <PageScrollShell innerClassName="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-page-title mb-1">API</h2>
            <p className="text-sm sm:text-sm text-muted-foreground">
              Browse external data collections and manage dataset subscriptions for Risk IQ.
            </p>
          </div>
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleHeaderSubscribe}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Subscribe
              </button>
              <button
                onClick={handleSyncCollections}
                disabled={isSyncing}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                Refresh All
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-4 sm:gap-8 border-b border-border overflow-x-auto pb-0 -mb-[1px]">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-1 pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Database size={18} strokeWidth={2} />
              <span>All</span>
              <span
                className={`px-2 py-0.5 rounded-md text-sm font-semibold ${
                  activeTab === 'all'
                    ? 'bg-sidebar-accent text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {datasets.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-2 px-1 pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'subscriptions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bookmark size={18} strokeWidth={2} />
              <span>My Subscriptions</span>
              <span
                className={`px-2 py-0.5 rounded-md text-sm font-semibold ${
                  activeTab === 'subscriptions'
                    ? 'bg-sidebar-accent text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {subscriptions.length}
              </span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="relative w-full sm:max-w-[360px] shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
              <input
                type="text"
                placeholder={
                  activeTab === 'all' ? 'Search datasets...' : 'Search subscriptions...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 text-muted-foreground shrink-0">
                <Filter size={18} />
                <span className="text-sm font-medium">Collection:</span>
              </div>
              {COLLECTION_FILTER_CHIPS.map(({ id, label }) => {
                const isActive = collectionFilter === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCollectionFilter(id)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="relative" ref={orgDropdownRef}>
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="w-full sm:w-auto px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {orgFilter}
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${showOrgDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              {showOrgDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 max-h-64 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-10">
                  {orgOptions.map((org) => (
                    <button
                      key={org}
                      onClick={() => {
                        setOrgFilter(org);
                        setShowOrgDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {org}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeTab === 'subscriptions' && (
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {statusFilter}
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`}
                  />
                </button>
                {showStatusDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                    {['All Status', 'Active', 'Syncing', 'Error'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {activeTab === 'all' ? (
            <>
              <div className="hidden lg:grid lg:grid-cols-12 lg:items-center gap-3 px-6 py-3 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <div className="lg:col-span-3">Dataset</div>
                <div className="lg:col-span-2">Org</div>
                <div className="lg:col-span-1">Files</div>
                <div className="lg:col-span-2">Updated</div>
                <div className="lg:col-span-1">Collection</div>
                <div className="lg:col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-border">
                {isProgressivelyLoading ? (
                  <TableSkeleton variant="grid" rows={itemsPerPage} columns={6} />
                ) : (
                  (visibleItems as ApiDataset[]).map((dataset) => {
                    const isSubscribed = subscribedDatasetIds.has(dataset.id);
                    const externalUrl = getDatasetExternalUrl(dataset);
                    return (
                      <div
                        key={dataset.id}
                        className="table-row-entity !min-h-0 grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-2 lg:gap-3 px-6 py-3"
                      >
                        <div className="lg:col-span-3">
                          <div className="table-header-label mb-1 lg:hidden">Dataset</div>
                          <div className="table-primary-text">{dataset.title}</div>
                        </div>
                        <div className="lg:col-span-2">
                          <div className="table-header-label mb-1 lg:hidden">Org</div>
                          <div className="table-metadata-text">{dataset.org}</div>
                        </div>
                        <div className="lg:col-span-1">
                          <div className="table-header-label mb-1 lg:hidden">Files</div>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-muted-foreground">
                            {dataset.fileCount}
                          </span>
                        </div>
                        <div className="lg:col-span-2">
                          <div className="table-header-label mb-1 lg:hidden">Updated</div>
                          <div className="table-metadata-text whitespace-nowrap">{dataset.updatedAt}</div>
                        </div>
                        <div className="lg:col-span-1 flex items-center">
                          <div className="table-header-label mb-1 lg:hidden">Collection</div>
                          <ProviderPill provider={dataset.provider} />
                        </div>
                        <div className="lg:col-span-3 flex items-center gap-2 lg:justify-end">
                          {isSubscribed ? (
                            <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary text-text-subtle cursor-not-allowed">
                              Subscribed
                            </span>
                          ) : (
                            <button
                              onClick={() => openSubscribeModal(dataset)}
                              className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Subscribe
                            </button>
                          )}
                          <a
                            href={externalUrl ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!externalUrl) e.preventDefault();
                            }}
                            className="h-8 w-8 border border-border bg-card hover:bg-muted rounded-full transition-colors inline-flex items-center justify-center"
                            title="Open in new page"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <div className="hidden lg:grid lg:grid-cols-12 lg:items-center gap-3 px-6 py-3 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <div className="lg:col-span-3">Dataset</div>
                <div className="lg:col-span-2">Org</div>
                <div className="lg:col-span-1">Files</div>
                <div className="lg:col-span-1">Collection</div>
                <div className="lg:col-span-2">Last refreshed</div>
                <div className="lg:col-span-1">Status</div>
                <div className="lg:col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-border">
                {isProgressivelyLoading ? (
                  <TableSkeleton variant="grid" rows={itemsPerPage} columns={6} />
                ) : (
                  (visibleItems as ApiSubscription[]).map((sub) => (
                    <div
                      key={sub.id}
                      className="table-row-entity !min-h-0 grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-2 lg:gap-3 px-6 py-3"
                    >
                      <div className="lg:col-span-3">
                        <div className="table-header-label mb-1 lg:hidden">Dataset</div>
                        <div className="table-primary-text">{sub.title}</div>
                        <div className="mt-1 lg:hidden">
                          <StatusBadge status={sub.status} />
                        </div>
                      </div>
                      <div className="lg:col-span-2">
                        <div className="table-header-label mb-1 lg:hidden">Org</div>
                        <div className="table-metadata-text">{sub.org}</div>
                      </div>
                      <div className="lg:col-span-1">
                        <div className="table-header-label mb-1 lg:hidden">Files</div>
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-muted-foreground">
                          {sub.fileCount}
                        </span>
                      </div>
                      <div className="lg:col-span-1 flex items-center">
                        <div className="table-header-label mb-1 lg:hidden">Collection</div>
                        <ProviderPill provider={sub.provider} />
                      </div>
                      <div className="lg:col-span-2 flex items-center">
                        <div className="table-header-label mb-1 lg:hidden">Last refreshed</div>
                        <div className="table-metadata-text whitespace-nowrap">{sub.lastRefreshedAt}</div>
                      </div>
                      <div className="lg:col-span-1 hidden lg:flex items-center">
                        <StatusBadge status={sub.status} />
                      </div>
                      <div className="lg:col-span-2 flex items-center gap-2 lg:justify-end">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="h-8 w-8 border border-border bg-card hover:bg-muted rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Edit subscription"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleRefresh(sub)}
                          disabled={sub.status === 'syncing'}
                          className="h-8 w-8 border border-border bg-card hover:bg-muted rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-60"
                          title="Refresh subscription"
                        >
                          <RefreshCw size={14} className={sub.status === 'syncing' ? 'animate-spin' : ''} />
                        </button>
                        <button
                          onClick={() => setDeletingSubscription(sub)}
                          className="h-8 w-8 border border-border bg-card hover:bg-destructive/10 text-destructive-text rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Delete subscription"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeList.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all' ? 'No datasets found' : 'No subscriptions found'}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm text-muted-foreground">Show</span>
                <div className="relative" ref={itemsPerPageDropdownRef}>
                  <button
                    onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                    className="px-3 py-1.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[70px] justify-between"
                  >
                    {itemsPerPage}
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showItemsPerPageDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showItemsPerPageDropdown && (
                    <div className="absolute bottom-full left-0 mb-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
                      {[5, 10, 25, 50, 100].map((count) => (
                        <button
                          key={count}
                          onClick={() => {
                            setItemsPerPage(count);
                            setCurrentPage(1);
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
                  {isProgressivelyLoading
                    ? 'Loading...'
                    : `${startIndex + 1}-${Math.min(endIndex, activeList.length)} of ${activeList.length}`}
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'text-border-muted cursor-not-allowed'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {getPageNumbers().map((page, idx) =>
                    typeof page === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-muted-foreground text-sm">
                        {page}
                      </span>
                    ),
                  )}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-1.5 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'text-border-muted cursor-not-allowed'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageScrollShell>

      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[620px] w-full">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Subscribe to Dataset</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Enter an HDX dataset ID or paste a URL</p>
              </div>
              <button
                onClick={() => {
                  setShowSubscribeModal(false);
                  setSubscribingDataset(null);
                  setSubscribeDatasetId('');
                  setSubscribeDatasetUrl('');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dataset ID</label>
                <input
                  value={subscribeDatasetId}
                  onChange={(e) => setSubscribeDatasetId(e.target.value)}
                  placeholder="e.g. somalia-displacement-data"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-medium">OR</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">HDX URL</label>
                <input
                  value={subscribeDatasetUrl}
                  onChange={(e) => setSubscribeDatasetUrl(e.target.value)}
                  placeholder="https://data.humdata.org/dataset/..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Refresh Schedule <span className="text-destructive-text">*</span>
                </label>
                <select
                  value={subscribeSchedule}
                  onChange={(e) => setSubscribeSchedule(e.target.value as SyncSchedule)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  <option value="manual">Manual</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Choose how often to check for updated data. Manual means you refresh manually when needed.
                </p>
              </div>
            </div>
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowSubscribeModal(false);
                  setSubscribingDataset(null);
                  setSubscribeDatasetId('');
                  setSubscribeDatasetUrl('');
                }}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={!subscribingDataset && !subscribeDatasetId.trim() && !subscribeDatasetUrl.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  !subscribingDataset && !subscribeDatasetId.trim() && !subscribeDatasetUrl.trim()
                    ? 'bg-muted text-text-subtle cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-hover text-white'
                }`}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSubscription && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[500px] w-full">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Edit Subscription</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Update sync schedule</p>
              </div>
              <button
                onClick={() => setEditingSubscription(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dataset</label>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
                  {editingSubscription.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sync schedule <span className="text-destructive-text">*</span>
                </label>
                <select
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value as SyncSchedule)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  <option value="manual">Manual</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Current: {scheduleLabel(editingSubscription.syncSchedule)}
                </p>
              </div>
            </div>
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingSubscription(null)}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingSubscription && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[500px] w-full p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Confirm Delete Subscription</h3>
            <p className="text-base text-muted-foreground mb-6">
              Are you sure you want to remove the subscription to &ldquo;{deletingSubscription.title}
              &rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingSubscription(null)}
                className="flex-1 px-5 py-3 bg-card hover:bg-muted text-muted-foreground border border-border rounded-lg text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-5 py-3 bg-destructive hover:bg-destructive-text text-white rounded-lg text-base font-medium transition-colors"
              >
                Delete Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
