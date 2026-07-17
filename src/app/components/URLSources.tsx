import { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, RefreshCw, Trash2, ChevronLeft, ChevronRight, ChevronDown, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { PageScrollShell } from './PageScrollShell';
import { useProgressiveList } from '../hooks/useProgressiveList';
import { TableSkeleton } from './ui/table-skeleton';

type CrawlSchedule = 'manual' | 'daily' | 'weekly';

interface URLSource {
  id: string;
  url: string;
  maxDepth: number;
  maxPages: number;
  crawlMethod: string;
  knowledgeBase: string;
  crawlSchedule: CrawlSchedule;
  status: 'active' | 'pending' | 'error';
  lastCrawled: string;
  pagesIndexed: number;
  dateAdded: string;
}

const CRAWL_METHOD_LABELS: Record<string, string> = {
  auto: 'Auto (fallback chain)',
  api: 'API (structured data)',
  headless: 'Headless browser (JavaScript-heavy sites)',
  rss: 'RSS/Atom feed',
};

const KNOWLEDGE_BASE_LABELS: Record<string, string> = {
  'web-sources': 'Web Sources',
  'verified-intel': 'Verified Intelligence',
  'reports-archive': 'Reports Archive',
};

function crawlMethodToValue(label: string): string {
  const entry = Object.entries(CRAWL_METHOD_LABELS).find(([, v]) => v === label);
  return entry?.[0] ?? 'auto';
}

function knowledgeBaseToValue(label: string): string {
  const entry = Object.entries(KNOWLEDGE_BASE_LABELS).find(([, v]) => v === label);
  return entry?.[0] ?? 'web-sources';
}

function scheduleLabel(schedule: CrawlSchedule): string {
  switch (schedule) {
    case 'manual':
      return 'Manual';
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
  }
}

function formatCrawlTimestamp(): string {
  const now = new Date();
  return (
    now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  );
}

const mockSources: URLSource[] = [
  {
    id: '1',
    url: 'https://reliefweb.int/country/som',
    maxDepth: 3,
    maxPages: 100,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 8:30 AM',
    pagesIndexed: 87,
    dateAdded: 'Mar 1, 2026'
  },
  {
    id: '2',
    url: 'https://www.unocha.org/somalia',
    maxDepth: 2,
    maxPages: 50,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 7:15 AM',
    pagesIndexed: 42,
    dateAdded: 'Feb 28, 2026'
  },
  {
    id: '3',
    url: 'https://fews.net/east-africa/somalia',
    maxDepth: 3,
    maxPages: 75,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'weekly',
    status: 'pending',
    lastCrawled: 'Pending first crawl',
    pagesIndexed: 0,
    dateAdded: 'Mar 12, 2026'
  },
  {
    id: '4',
    url: 'https://acleddata.com/dashboard/#/dashboard',
    maxDepth: 2,
    maxPages: 50,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'error',
    lastCrawled: 'Mar 11, 2026 10:20 PM',
    pagesIndexed: 0,
    dateAdded: 'Mar 10, 2026'
  },
  {
    id: '5',
    url: 'https://www.who.int/emergencies/situations/somalia',
    maxDepth: 2,
    maxPages: 50,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'weekly',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 6:45 AM',
    pagesIndexed: 38,
    dateAdded: 'Feb 25, 2026'
  },
  {
    id: '6',
    url: 'https://www.unicef.org/somalia',
    maxDepth: 3,
    maxPages: 80,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 5:20 AM',
    pagesIndexed: 65,
    dateAdded: 'Feb 24, 2026'
  },
  {
    id: '7',
    url: 'https://www.wfp.org/countries/somalia',
    maxDepth: 2,
    maxPages: 60,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 4:10 AM',
    pagesIndexed: 52,
    dateAdded: 'Feb 23, 2026'
  },
  {
    id: '8',
    url: 'https://www.unhcr.org/somalia.html',
    maxDepth: 3,
    maxPages: 70,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'manual',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 3:30 AM',
    pagesIndexed: 58,
    dateAdded: 'Feb 22, 2026'
  },
  {
    id: '9',
    url: 'https://www.ipcinfo.org/ipc-country-analysis/somalia',
    maxDepth: 2,
    maxPages: 40,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'weekly',
    status: 'pending',
    lastCrawled: 'Pending first crawl',
    pagesIndexed: 0,
    dateAdded: 'Mar 11, 2026'
  },
  {
    id: '10',
    url: 'https://www.humanitarianresponse.info/en/operations/somalia',
    maxDepth: 3,
    maxPages: 90,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 2:15 AM',
    pagesIndexed: 73,
    dateAdded: 'Feb 20, 2026'
  },
  {
    id: '11',
    url: 'https://dtm.iom.int/somalia',
    maxDepth: 2,
    maxPages: 45,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'active',
    lastCrawled: 'Mar 12, 2026 1:00 AM',
    pagesIndexed: 35,
    dateAdded: 'Feb 19, 2026'
  },
  {
    id: '12',
    url: 'https://www.icrc.org/en/where-we-work/africa/somalia',
    maxDepth: 2,
    maxPages: 50,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'manual',
    status: 'error',
    lastCrawled: 'Mar 11, 2026 11:45 PM',
    pagesIndexed: 0,
    dateAdded: 'Feb 18, 2026'
  },
  {
    id: '13',
    url: 'https://www.msf.org/somalia',
    maxDepth: 3,
    maxPages: 60,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'weekly',
    status: 'active',
    lastCrawled: 'Mar 11, 2026 11:00 PM',
    pagesIndexed: 48,
    dateAdded: 'Feb 17, 2026'
  },
  {
    id: '14',
    url: 'https://www.nrc.no/countries/east-africa-and-yemen/somalia',
    maxDepth: 2,
    maxPages: 40,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'daily',
    status: 'active',
    lastCrawled: 'Mar 11, 2026 10:15 PM',
    pagesIndexed: 32,
    dateAdded: 'Feb 16, 2026'
  },
  {
    id: '15',
    url: 'https://www.savethechildren.org/somalia',
    maxDepth: 3,
    maxPages: 55,
    crawlMethod: 'Auto (fallback chain)',
    knowledgeBase: 'Web Sources',
    crawlSchedule: 'manual',
    status: 'pending',
    lastCrawled: 'Pending first crawl',
    pagesIndexed: 0,
    dateAdded: 'Feb 15, 2026'
  }
];

export function URLSources() {
  const [sources, setSources] = useState<URLSource[]>(mockSources);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<URLSource | null>(null);
  const [isDrawerEditing, setIsDrawerEditing] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<URLSource | null>(null);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Add form state
  const [url, setUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState('3');
  const [maxPages, setMaxPages] = useState('50');
  const [crawlMethod, setCrawlMethod] = useState('auto');
  const [knowledgeBase, setKnowledgeBase] = useState('web-sources');
  const [crawlSchedule, setCrawlSchedule] = useState<CrawlSchedule>('daily');

  // Drawer edit form state
  const [editUrl, setEditUrl] = useState('');
  const [editMaxDepth, setEditMaxDepth] = useState('3');
  const [editMaxPages, setEditMaxPages] = useState('50');
  const [editCrawlMethod, setEditCrawlMethod] = useState('auto');
  const [editKnowledgeBase, setEditKnowledgeBase] = useState('web-sources');
  const [editCrawlSchedule, setEditCrawlSchedule] = useState<CrawlSchedule>('daily');

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (itemsPerPageDropdownRef.current && !itemsPerPageDropdownRef.current.contains(event.target as Node)) {
        setShowItemsPerPageDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredSources = sources.filter(source => {
    const matchesSearch =
      source.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.lastCrawled.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.maxDepth.toString().includes(searchQuery.toLowerCase()) ||
      source.maxPages.toString().includes(searchQuery.toLowerCase()) ||
      source.pagesIndexed.toString().includes(searchQuery.toLowerCase()) ||
      source.crawlMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.knowledgeBase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.crawlSchedule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.dateAdded.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || 
      (statusFilter === 'Active' && source.status === 'active') ||
      (statusFilter === 'Pending' && source.status === 'pending') ||
      (statusFilter === 'Error' && source.status === 'error');
    return matchesSearch && matchesStatus;
  });

  const resetAddForm = () => {
    setUrl('');
    setMaxDepth('3');
    setMaxPages('50');
    setCrawlMethod('auto');
    setKnowledgeBase('web-sources');
    setCrawlSchedule('daily');
  };

  const populateDrawerEditForm = (source: URLSource) => {
    setEditUrl(source.url);
    setEditMaxDepth(String(source.maxDepth));
    setEditMaxPages(String(source.maxPages));
    setEditCrawlMethod(crawlMethodToValue(source.crawlMethod));
    setEditKnowledgeBase(knowledgeBaseToValue(source.knowledgeBase));
    setEditCrawlSchedule(source.crawlSchedule);
  };

  const openDetailDrawer = (source: URLSource) => {
    setSelectedSource(source);
    setIsDrawerEditing(false);
    populateDrawerEditForm(source);
  };

  const closeDetailDrawer = () => {
    setSelectedSource(null);
    setIsDrawerEditing(false);
  };

  const startDrawerEdit = () => {
    if (!selectedSource) return;
    populateDrawerEditForm(selectedSource);
    setIsDrawerEditing(true);
  };

  const cancelDrawerEdit = () => {
    if (!selectedSource) return;
    populateDrawerEditForm(selectedSource);
    setIsDrawerEditing(false);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetAddForm();
  };

  const handleAddSource = () => {
    if (!url.trim()) return;

    const sourceId = Date.now().toString();
    const newSource: URLSource = {
      id: sourceId,
      url: url.trim(),
      maxDepth: parseInt(maxDepth),
      maxPages: parseInt(maxPages),
      crawlMethod: CRAWL_METHOD_LABELS[crawlMethod] ?? crawlMethod,
      knowledgeBase: KNOWLEDGE_BASE_LABELS[knowledgeBase] ?? knowledgeBase,
      crawlSchedule,
      status: 'pending',
      lastCrawled: 'Crawling in progress...',
      pagesIndexed: 0,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setSources([newSource, ...sources]);
    closeAddModal();

    toast.loading('Crawling URL source...', { duration: 3000 });

    setTimeout(() => {
      setSources(prevSources => 
        prevSources.map(s => 
          s.id === sourceId 
            ? { 
                ...s, 
                status: 'active' as const, 
                lastCrawled: formatCrawlTimestamp(),
                pagesIndexed: Math.floor(Math.random() * parseInt(maxPages)) + 10
              }
            : s
        )
      );
      toast.success('URL source crawled successfully!');
    }, 3000);
  };

  const handleSaveDrawerEdit = () => {
    if (!selectedSource || !editUrl.trim()) return;

    const updated: URLSource = {
      ...selectedSource,
      url: editUrl.trim(),
      maxDepth: parseInt(editMaxDepth) || selectedSource.maxDepth,
      maxPages: parseInt(editMaxPages) || selectedSource.maxPages,
      crawlMethod: CRAWL_METHOD_LABELS[editCrawlMethod] ?? editCrawlMethod,
      knowledgeBase: KNOWLEDGE_BASE_LABELS[editKnowledgeBase] ?? editKnowledgeBase,
      crawlSchedule: editCrawlSchedule,
    };

    setSources(prev => prev.map(s => (s.id === selectedSource.id ? updated : s)));
    setSelectedSource(updated);
    setIsDrawerEditing(false);
    toast.success('URL source updated successfully.');
  };

  const handleRecrawl = (id: string) => {
    toast.loading('Recrawling URL source...', { duration: 2500 });

    setSources(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: 'pending' as const, lastCrawled: 'Crawling in progress...' }
          : s
      )
    );

    if (selectedSource?.id === id) {
      setSelectedSource(prev =>
        prev ? { ...prev, status: 'pending', lastCrawled: 'Crawling in progress...' } : prev
      );
    }

    setTimeout(() => {
      const timestamp = formatCrawlTimestamp();
      setSources(prev =>
        prev.map(s =>
          s.id === id
            ? {
                ...s,
                status: 'active' as const,
                lastCrawled: timestamp,
                pagesIndexed: Math.floor(Math.random() * s.maxPages) + 10,
              }
            : s
        )
      );
      setSelectedSource(prev =>
        prev && prev.id === id
          ? {
              ...prev,
              status: 'active',
              lastCrawled: timestamp,
              pagesIndexed: Math.floor(Math.random() * prev.maxPages) + 10,
            }
          : prev
      );
      toast.success('URL source recrawled successfully!');
    }, 2500);
  };

  const handleRemoveSource = (id: string) => {
    toast.promise(
      Promise.resolve().then(() => {
        setSources(prev => prev.filter(s => s.id !== id));
        if (selectedSource?.id === id) {
          closeDetailDrawer();
        }
        setSelectedSources(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }),
      {
        loading: 'Removing URL source...',
        success: 'URL source removed successfully.',
        error: 'We could not remove this URL source. Please try again.',
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!sourceToDelete) return;
    handleRemoveSource(sourceToDelete.id);
    setSourceToDelete(null);
  };

  const toggleSelectSource = (id: string) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSources(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedSources.size === currentSources.length) {
      setSelectedSources(new Set());
    } else {
      setSelectedSources(new Set(currentSources.map(s => s.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedSources.size;
    toast.promise(
      Promise.resolve().then(() => {
        setSources(sources.filter(s => !selectedSources.has(s.id)));
        setSelectedSources(new Set());
      }),
      {
        loading: `Deleting ${count} URL source${count > 1 ? 's' : ''}...`,
        success: `${count} URL source${count > 1 ? 's' : ''} deleted successfully.`,
        error: 'We could not delete the selected URL sources. Please try again.',
      }
    );
  };

  const getTableStatusBadge = (status: URLSource['status']) => {
    const label = status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Error';
    const dotColor =
      status === 'active'
        ? 'bg-success'
        : status === 'pending'
          ? 'bg-warning-text'
          : 'bg-destructive-text';
    const textColor =
      status === 'active'
        ? 'text-success-text'
        : status === 'pending'
          ? 'text-warning-text'
          : 'text-destructive-text';

    return (
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className={`table-status-text ${textColor}`}>{label}</span>
      </div>
    );
  };

  const getDrawerStatusBadge = (status: URLSource['status']) => {
    const label = status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Error';
    const styles =
      status === 'active'
        ? { pill: 'bg-success-subtle text-success-text', dot: 'bg-success' }
        : status === 'pending'
          ? { pill: 'bg-warning-subtle text-warning-text', dot: 'bg-warning-text' }
          : { pill: 'bg-destructive-subtle text-destructive-text', dot: 'bg-destructive-text' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${styles.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        {label}
      </span>
    );
  };

  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  const currentSources = filteredSources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { visibleItems: visibleCurrentSources, isProgressivelyLoading } = useProgressiveList(currentSources, {
    minLoadingMs: 200,
    transitionKey: `${currentPage}-${itemsPerPage}`,
  });
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Generate smart page numbers for pagination - Max 3 pages at a time
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show max 3 consecutive pages with ellipsis
      // Determine which group of 3 the current page belongs to
      const groupStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
      const groupEnd = Math.min(groupStart + 2, totalPages);
      
      // Add leading ellipsis if not in first group
      if (groupStart > 1) {
        pages.push('...');
      }
      
      // Add the 3 pages in current group
      for (let i = groupStart; i <= groupEnd; i++) {
        pages.push(i);
      }
      
      // Add trailing ellipsis if not in last group
      if (groupEnd < totalPages) {
        pages.push('...');
      }
    }
    
    return pages;
  };

  return (
    <>
    <PageScrollShell innerClassName="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-page-title mb-1">URL Sources</h2>
                <p className="text-sm sm:text-sm text-muted-foreground">
                  Manage web crawling sources for real-time intelligence gathering
                </p>
              </div>
              <button 
                onClick={() => {
                  resetAddForm();
                  setShowAddModal(true);
                }}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus size={18} />
                Add Source
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                  <input
                    type="text"
                    placeholder="Search URL sources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative" ref={statusDropdownRef}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {statusFilter}
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                      {['All Status', 'Active', 'Pending', 'Error'].map((status) => (
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

                {/* Items Per Page Dropdown */}
                <div className="relative" ref={itemsPerPageDropdownRef}>
                  <button
                    onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                    className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {itemsPerPage} per page
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showItemsPerPageDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showItemsPerPageDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                      {[10, 20, 50, 100].map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            setItemsPerPage(num);
                            setShowItemsPerPageDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {num} per page
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sources Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Bulk Actions Bar */}
              {selectedSources.size > 0 && (
                <div className="px-6 py-3 bg-surface-subtle border-b border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    {selectedSources.size} source{selectedSources.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </button>
                </div>
              )}

              {/* Table Header */}
              <div className="hidden min-h-10 lg:grid grid-cols-12 items-center gap-4 px-6 py-3 bg-muted/70 border-b border-border">
                <div className="col-span-5 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSources.size === currentSources.length && currentSources.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                  />
                  <span className="table-header-label">URL</span>
                </div>
                <div className="col-span-2 table-header-label">
                  Status
                </div>
                <div className="col-span-2 table-header-label">
                  Last Crawled
                </div>
                <div className="col-span-3 table-header-label text-right">
                  Actions
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {isProgressivelyLoading ? (
                  <TableSkeleton variant="grid" rows={itemsPerPage} columns={4} />
                ) : (
                  visibleCurrentSources.map((source) => (
                  <div
                    key={source.id}
                    className="table-row-entity grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 cursor-pointer"
                    onClick={() => openDetailDrawer(source)}
                  >
                    {/* Checkbox & URL */}
                    <div className="lg:col-span-5 flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSources.has(source.id)}
                        onChange={() => toggleSelectSource(source.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden lg:block w-4 h-4 mt-1 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="table-header-label mb-1 lg:hidden">URL</div>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="table-primary-text text-foreground hover:text-primary hover:underline break-all transition-colors"
                        >
                          {source.url}
                        </a>
                        <div className="table-metadata-text mt-1">
                          Depth: {source.maxDepth} · Max pages: {source.maxPages} · {scheduleLabel(source.crawlSchedule)}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                      <div className="table-header-label mb-1 lg:hidden">Status</div>
                      {getTableStatusBadge(source.status)}
                    </div>

                    {/* Last Crawled */}
                    <div className="lg:col-span-2">
                      <div className="table-header-label mb-1 lg:hidden">Last Crawled</div>
                      <div className="table-metadata-text whitespace-nowrap">{source.lastCrawled}</div>
                    </div>

                    {/* Actions */}
                    <div
                      className="lg:col-span-3 flex items-center gap-1 lg:justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openDetailDrawer(source)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                        title="View details"
                      >
                        <Eye size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleRecrawl(source.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                        title="Recrawl now"
                      >
                        <RefreshCw size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setSourceToDelete(source)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-destructive-subtle transition-colors"
                        title="Delete source"
                      >
                        <Trash2 size={16} className="text-destructive-text" />
                      </button>
                    </div>
                  </div>
                  ))
                )}
              </div>

              {filteredSources.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No URL sources found</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left: Items per page */}
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

                  {/* Right: Page navigation */}
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span className="text-sm text-muted-foreground text-center sm:text-left">
                      {isProgressivelyLoading ? 'Loading...' : `${startIndex + 1}-${Math.min(endIndex, filteredSources.length)} of ${filteredSources.length}`}
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-1.5 sm:px-2 text-sm sm:text-sm text-text-subtle">
                            ...
                          </span>
                        ) : (
                          <button 
                            key={page}
                            onClick={() => setCurrentPage(typeof page === 'number' ? page : currentPage)}
                            className={`min-w-[30px] h-[30px] sm:min-w-[32px] sm:h-[32px] px-2 rounded-lg text-sm sm:text-sm font-medium transition-colors ${
                              page === currentPage 
                                ? 'bg-primary text-white' 
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
    </PageScrollShell>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add URL Source</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configure a new website to crawl for intelligence
                </p>
              </div>
              <button 
                onClick={closeAddModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-5">
              {/* URL Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL <span className="text-destructive-text">*</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                />
              </div>

              {/* Max Depth and Max Pages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Max Depth Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Depth
                  </label>
                  <input
                    type="number"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(e.target.value)}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                  />
                </div>

                {/* Max Pages Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Pages
                  </label>
                  <input
                    type="number"
                    value={maxPages}
                    onChange={(e) => setMaxPages(e.target.value)}
                    min="1"
                    max="1000"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                  />
                </div>
              </div>

              {/* Crawl Method Dropdown */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Crawl Method
                </label>
                <div className="relative">
                  <select
                    value={crawlMethod}
                    onChange={(e) => setCrawlMethod(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 bg-card appearance-none cursor-pointer pr-10"
                  >
                    <option value="auto">Auto (fallback chain)</option>
                    <option value="api">API (structured data)</option>
                    <option value="headless">Headless browser (JavaScript-heavy sites)</option>
                    <option value="rss">RSS/Atom feed</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Target Knowledge Base Dropdown */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Knowledge Base
                </label>
                <div className="relative">
                  <select
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 bg-card appearance-none cursor-pointer pr-10"
                  >
                    <option value="web-sources">Web Sources</option>
                    <option value="verified-intel">Verified Intelligence</option>
                    <option value="reports-archive">Reports Archive</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Crawl Schedule */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Crawl Schedule
                </label>
                <div className="relative">
                  <select
                    value={crawlSchedule}
                    onChange={(e) => setCrawlSchedule(e.target.value as CrawlSchedule)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 bg-card appearance-none cursor-pointer pr-10"
                  >
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Choose how often to crawl this source. Manual means you recrawl when needed.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeAddModal}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSource}
                disabled={!url.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  url.trim()
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-muted text-text-subtle cursor-not-allowed'
                }`}
              >
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedSource && (
        <div
          className="fixed inset-0 bg-black/30 z-[1400] flex justify-end"
          onClick={closeDetailDrawer}
        >
          <div
            className="bg-card w-full max-w-md h-full overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border shrink-0">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {isDrawerEditing ? (
                    <>
                      <h2 className="text-base font-semibold text-foreground mb-1">Edit configuration</h2>
                      <p className="text-sm text-muted-foreground break-all">{selectedSource.url}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-base font-semibold text-foreground mb-1 break-all leading-snug">
                        <a
                          href={selectedSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {selectedSource.url}
                        </a>
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Last crawled {selectedSource.lastCrawled}
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={closeDetailDrawer}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {!isDrawerEditing && (
                <div className="flex items-center gap-2 mt-4">
                  {getDrawerStatusBadge(selectedSource.status)}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-secondary text-muted-foreground">
                    {scheduleLabel(selectedSource.crawlSchedule)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {isDrawerEditing ? (
                <div className="px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      URL <span className="text-destructive-text">*</span>
                    </label>
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Max Depth</label>
                      <input
                        type="number"
                        value={editMaxDepth}
                        onChange={(e) => setEditMaxDepth(e.target.value)}
                        min="1"
                        max="10"
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Max Pages</label>
                      <input
                        type="number"
                        value={editMaxPages}
                        onChange={(e) => setEditMaxPages(e.target.value)}
                        min="1"
                        max="1000"
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Crawl Method</label>
                    <select
                      value={editCrawlMethod}
                      onChange={(e) => setEditCrawlMethod(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 bg-card"
                    >
                      <option value="auto">Auto (fallback chain)</option>
                      <option value="api">API (structured data)</option>
                      <option value="headless">Headless browser (JavaScript-heavy sites)</option>
                      <option value="rss">RSS/Atom feed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Target Knowledge Base</label>
                    <select
                      value={editKnowledgeBase}
                      onChange={(e) => setEditKnowledgeBase(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 bg-card"
                    >
                      <option value="web-sources">Web Sources</option>
                      <option value="verified-intel">Verified Intelligence</option>
                      <option value="reports-archive">Reports Archive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Crawl Schedule</label>
                    <select
                      value={editCrawlSchedule}
                      onChange={(e) => setEditCrawlSchedule(e.target.value as CrawlSchedule)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 bg-card"
                    >
                      <option value="manual">Manual</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Choose how often to crawl this source. Manual means you recrawl when needed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-6 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-subtle">Max Depth</span>
                    <span className="text-sm font-medium text-foreground">{selectedSource.maxDepth}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-subtle">Max Pages</span>
                    <span className="text-sm font-medium text-foreground">{selectedSource.maxPages}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-subtle">Crawl Method</span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[55%]">
                      {selectedSource.crawlMethod}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-subtle">Knowledge Base</span>
                    <span className="text-sm font-medium text-foreground text-right">
                      {selectedSource.knowledgeBase}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-subtle">Pages Indexed</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedSource.pagesIndexed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-text-subtle">Date Added</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedSource.dateAdded}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isDrawerEditing ? (
              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 shrink-0 bg-card">
                <button
                  onClick={cancelDrawerEdit}
                  className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDrawerEdit}
                  disabled={!editUrl.trim()}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    editUrl.trim()
                      ? 'bg-primary hover:bg-primary-hover text-white'
                      : 'bg-muted text-text-subtle cursor-not-allowed'
                  }`}
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 border-t border-border shrink-0">
                <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={startDrawerEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <Edit size={18} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Edit Configuration</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {sourceToDelete && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4"
          onClick={() => setSourceToDelete(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[500px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Remove URL source?</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-muted-foreground mb-2">
                Are you sure you want to remove this URL source? This action cannot be undone.
              </p>
              <p className="text-sm font-medium text-foreground break-all">{sourceToDelete.url}</p>
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSourceToDelete(null)}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors"
              >
                Remove source
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
