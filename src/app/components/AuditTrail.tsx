import { useState, useRef, useEffect } from 'react';
import { Search, Filter, Download, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgressiveList } from '../hooks/useProgressiveList';
import { toast } from 'sonner';
import { TableSkeleton } from './ui/table-skeleton';

interface AuditEvent {
  id: string;
  userName: string;
  userAvatar: string;
  userAvatarColor: string;
  action: string;
  actionDetail: string;
  dateTime: string;
  timeAgo: string;
  ipAddress: string;
}

const mockEvents: AuditEvent[] = [
  {
    id: '1',
    userName: 'Amina Hassan',
    userAvatar: 'AH',
    userAvatarColor: 'var(--warning-strong)',
    action: 'Signed in',
    actionDetail: 'Logged in via SSO (UNICEF directory)',
    dateTime: 'Mar 11, 2026 09:42 AM',
    timeAgo: '18 min ago',
    ipAddress: '197.232.12.45'
  },
  {
    id: '2',
    userName: 'James Njoroge',
    userAvatar: 'JN',
    userAvatarColor: 'var(--primary)',
    action: 'Accessed module',
    actionDetail: 'Opened Risk Matrix module',
    dateTime: 'Mar 11, 2026 09:38 AM',
    timeAgo: '22 min ago',
    ipAddress: '154.72.88.31'
  },
  {
    id: '3',
    userName: 'Lena Koch',
    userAvatar: 'LK',
    userAvatarColor: '#0ea5e9',
    action: 'Viewed risk details',
    actionDetail: 'Opened RSK-INT-003: Supply Chain Disruption',
    dateTime: 'Mar 11, 2026 09:30 AM',
    timeAgo: '30 min ago',
    ipAddress: '185.45.67.89'
  },
  {
    id: '4',
    userName: 'Sara Ramos',
    userAvatar: 'SR',
    userAvatarColor: 'var(--success)',
    action: 'User approved',
    actionDetail: 'Approved registration request',
    dateTime: 'Mar 11, 2026 09:15 AM',
    timeAgo: '45 min ago',
    ipAddress: '41.89.100.22'
  },
  {
    id: '5',
    userName: 'Collins Otieno',
    userAvatar: 'CO',
    userAvatarColor: 'var(--chart-3)',
    action: 'Accessed module',
    actionDetail: 'Opened Internal Risks module',
    dateTime: 'Mar 11, 2026 09:05 AM',
    timeAgo: '55 min ago',
    ipAddress: '41.89.100.22'
  },
  {
    id: '6',
    userName: 'Lena Koch',
    userAvatar: 'LK',
    userAvatarColor: '#0ea5e9',
    action: 'Resource uploaded',
    actionDetail: 'Uploaded "Somalia IPC Analysis Q1 2026.pdf"',
    dateTime: 'Mar 11, 2026 08:50 AM',
    timeAgo: '1 hr ago',
    ipAddress: '185.45.67.89'
  },
  {
    id: '7',
    userName: 'Amina Hassan',
    userAvatar: 'AH',
    userAvatarColor: 'var(--warning-strong)',
    action: 'Accessed section',
    actionDetail: 'Navigated to Users & Access > Pending Approvals',
    dateTime: 'Mar 11, 2026 08:45 AM',
    timeAgo: '1 hr ago',
    ipAddress: '197.232.12.45'
  },
  {
    id: '8',
    userName: 'Collins Otieno',
    userAvatar: 'CO',
    userAvatarColor: 'var(--chart-3)',
    action: 'Role changed',
    actionDetail: 'Changed role from Viewer to Contributor',
    dateTime: 'Mar 11, 2026 08:30 AM',
    timeAgo: '1 hr ago',
    ipAddress: '41.89.100.22'
  },
  {
    id: '9',
    userName: 'Sarah Mitchell',
    userAvatar: 'SM',
    userAvatarColor: 'var(--warning-strong)',
    action: 'Data exported',
    actionDetail: 'Exported All Users list as CSV (148 records)',
    dateTime: 'Mar 11, 2026 08:12 AM',
    timeAgo: '2 hrs ago',
    ipAddress: '62.24.134.55'
  },
  {
    id: '10',
    userName: 'James Njoroge',
    userAvatar: 'JN',
    userAvatarColor: 'var(--primary)',
    action: 'Accessed module',
    actionDetail: 'Opened Collective Risk module',
    dateTime: 'Mar 11, 2026 08:00 AM',
    timeAgo: '2 hrs ago',
    ipAddress: '154.72.88.31'
  },
  {
    id: '11',
    userName: 'Lena Koch',
    userAvatar: 'LK',
    userAvatarColor: '#0ea5e9',
    action: 'Accessed section',
    actionDetail: 'Navigated to Admin > Resources',
    dateTime: 'Mar 11, 2026 07:45 AM',
    timeAgo: '2 hrs ago',
    ipAddress: '185.45.67.89'
  },
  {
    id: '12',
    userName: 'Amina Hassan',
    userAvatar: 'AH',
    userAvatarColor: 'var(--warning-strong)',
    action: 'Used AI Search',
    actionDetail: 'Query: "What are the key security risks in Mogadishu?"',
    dateTime: 'Mar 11, 2026 07:30 AM',
    timeAgo: '2 hrs ago',
    ipAddress: '197.232.12.45'
  },
  {
    id: '13',
    userName: 'Sara Ramos',
    userAvatar: 'SR',
    userAvatarColor: 'var(--success)',
    action: 'User declined',
    actionDetail: 'Declined registration request (duplicate account)',
    dateTime: 'Mar 10, 2026 17:30 PM',
    timeAgo: 'Yesterday',
    ipAddress: '41.89.100.22'
  },
  {
    id: '14',
    userName: 'Collins Otieno',
    userAvatar: 'CO',
    userAvatarColor: 'var(--chart-3)',
    action: 'Accessed section',
    actionDetail: 'Navigated to Admin > Context Definitions',
    dateTime: 'Mar 10, 2026 17:00 PM',
    timeAgo: 'Yesterday',
    ipAddress: '41.89.100.22'
  },
  {
    id: '15',
    userName: 'James Njoroge',
    userAvatar: 'JN',
    userAvatarColor: 'var(--primary)',
    action: 'Failed login attempt',
    actionDetail: '3 failed password attempts — account temporarily locked',
    dateTime: 'Mar 10, 2026 16:45 PM',
    timeAgo: 'Yesterday',
    ipAddress: '154.72.88.31'
  },
  {
    id: '16',
    userName: 'Sarah Mitchell',
    userAvatar: 'SM',
    userAvatarColor: 'var(--warning-strong)',
    action: 'Viewed report',
    actionDetail: 'Generated and viewed Risk Assessment Report',
    dateTime: 'Mar 10, 2026 16:15 PM',
    timeAgo: 'Yesterday',
    ipAddress: '62.24.134.55'
  },
  {
    id: '17',
    userName: 'Lena Koch',
    userAvatar: 'LK',
    userAvatarColor: '#0ea5e9',
    action: 'Accessed module',
    actionDetail: 'Opened My Profile',
    dateTime: 'Mar 10, 2026 16:00 PM',
    timeAgo: 'Yesterday',
    ipAddress: '185.45.67.89'
  },
  {
    id: '18',
    userName: 'Collins Otieno',
    userAvatar: 'CO',
    userAvatarColor: 'var(--chart-3)',
    action: 'Group membership changed',
    actionDetail: 'Added to UN OCHA Field Operations group',
    dateTime: 'Mar 10, 2026 15:20 PM',
    timeAgo: 'Yesterday',
    ipAddress: '41.89.100.22'
  },
  {
    id: '19',
    userName: 'Amina Hassan',
    userAvatar: 'AH',
    userAvatarColor: 'var(--warning-strong)',
    action: 'Accessed section',
    actionDetail: 'Navigated to Admin > Roles & Permissions',
    dateTime: 'Mar 10, 2026 14:50 PM',
    timeAgo: 'Yesterday',
    ipAddress: '197.232.12.45'
  },
  {
    id: '20',
    userName: 'Sara Ramos',
    userAvatar: 'SR',
    userAvatarColor: 'var(--success)',
    action: 'Definition created',
    actionDetail: 'Added new context definition: "HRP"',
    dateTime: 'Mar 10, 2026 14:30 PM',
    timeAgo: 'Yesterday',
    ipAddress: '41.89.100.22'
  }
];

export function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setShowActionDropdown(false);
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

  // Get unique users and actions
  const uniqueUsers = Array.from(new Set(mockEvents.map(e => e.userName))).sort();
  const uniqueActions = Array.from(new Set(mockEvents.map(e => e.action))).sort();

  const filteredEvents = mockEvents.filter(event => {
    // Text search filter
    const matchesSearch = searchQuery === '' || 
      event.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.actionDetail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.dateTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.timeAgo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());

    // User filter
    const matchesUser = selectedUser === '' || event.userName === selectedUser;

    // Action filter
    const matchesAction = selectedAction === '' || event.action === selectedAction;

    // Date filter (simplified - just checking if dates are in the filter range)
    const matchesDate = true; // Simplified for demo - in production would parse dateTime

    return matchesSearch && matchesUser && matchesAction && matchesDate;
  });

  const activeFiltersCount = [selectedUser, selectedAction, dateFrom, dateTo].filter(f => f !== '').length;

  const clearFilters = () => {
    setSelectedUser('');
    setSelectedAction('');
    setDateFrom('');
    setDateTo('');
  };

  const getUserAvatar = (userName: string) => {
    const user = mockEvents.find(e => e.userName === userName);
    return user ? { avatar: user.userAvatar, color: user.userAvatarColor } : null;
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { visibleItems: visibleCurrentEvents, isProgressivelyLoading } = useProgressiveList(currentEvents, {
    minLoadingMs: 200,
    transitionKey: `${currentPage}-${itemsPerPage}`,
  });

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

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6 pb-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Audit Trail</h2>
                <p className="text-sm sm:text-sm text-muted-foreground">
                  {mockEvents.length} recorded events · Complete log of all system activity
                </p>
              </div>
              <button
                onClick={() => toast.success('Export started')}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
              >
                <Download size={18} />
                Export Log
              </button>
            </div>

            {/* Search Bar with Filter Button */}
            <div className="mb-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                  <input
                    type="text"
                    placeholder="Search audit trail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0 ${
                    showFilters || activeFiltersCount > 0
                      ? 'border-primary bg-primary-subtle text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Filter size={18} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-primary text-white rounded-full text-xs font-semibold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Controls - Conditionally Shown with Divider */}
              {showFilters && (
                <>
                  <div className="my-5 border-t border-border" />
                  <div className="flex flex-col lg:flex-row gap-3">
                    {/* User Filter */}
                    <div className="flex-1 relative" ref={userDropdownRef}>
                      <button
                        onClick={() => {
                          setShowUserDropdown(!showUserDropdown);
                          setShowActionDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-left hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <span className={selectedUser ? 'text-foreground font-medium' : 'text-text-subtle'}>
                          {selectedUser || 'All Users'}
                        </span>
                        <ChevronDown size={16} className={`text-text-subtle transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showUserDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[280px] overflow-y-auto z-10">
                          <button
                            onClick={() => {
                              setSelectedUser('');
                              setShowUserDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted transition-colors border-b border-border"
                          >
                            All Users
                          </button>
                          {uniqueUsers.map(user => {
                            const avatar = getUserAvatar(user);
                            return (
                              <button
                                key={user}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserDropdown(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-3"
                              >
                                {avatar && (
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                    style={{ backgroundColor: avatar.color }}
                                  >
                                    {avatar.avatar}
                                  </div>
                                )}
                                <span className="text-foreground">{user}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Type Filter */}
                    <div className="flex-1 relative" ref={actionDropdownRef}>
                      <button
                        onClick={() => {
                          setShowActionDropdown(!showActionDropdown);
                          setShowUserDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-left hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <span className={selectedAction ? 'text-foreground font-medium' : 'text-text-subtle'}>
                          {selectedAction || 'All Actions'}
                        </span>
                        <ChevronDown size={16} className={`text-text-subtle transition-transform ${showActionDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showActionDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[280px] overflow-y-auto z-10">
                          <button
                            onClick={() => {
                              setSelectedAction('');
                              setShowActionDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted transition-colors border-b border-border"
                          >
                            All Actions
                          </button>
                          {uniqueActions.map(action => (
                            <button
                              key={action}
                              onClick={() => {
                                setSelectedAction(action);
                                setShowActionDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Date From */}
                    <div className="flex-1">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="From date"
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      />
                    </div>

                    {/* Date To */}
                    <div className="flex-1">
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="To date"
                        className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                      />
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2.5 border border-border bg-card hover:bg-destructive-subtle hover:border-destructive hover:text-destructive-text rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
                      >
                        <X size={16} />
                        Clear ({activeFiltersCount})
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Events Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Table Header - Desktop Only */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-muted border-b border-border">
                <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </div>
                <div className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </div>
                <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </div>
                <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  IP Address
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {isProgressivelyLoading ? (
                  <TableSkeleton variant="grid" rows={itemsPerPage} columns={4} />
                ) : (
                  visibleCurrentEvents.map((event) => (
                  <div key={event.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-4 sm:px-6 py-4 hover:bg-muted transition-colors">
                    {/* User Info */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: event.userAvatarColor }}
                      >
                        {event.userAvatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">{event.userName}</div>
                        {/* Mobile: Show time ago inline */}
                        <div className="text-sm text-muted-foreground lg:hidden">{event.timeAgo}</div>
                      </div>
                    </div>
                    {/* Action */}
                    <div className="lg:col-span-4 flex flex-col justify-center">
                      <div className="text-sm font-medium text-foreground mb-0.5">{event.action}</div>
                      <div className="text-sm text-muted-foreground truncate">{event.actionDetail}</div>
                    </div>
                    {/* Date & Time - Desktop Only */}
                    <div className="hidden lg:flex lg:col-span-3 flex-col justify-center">
                      <div className="text-sm text-foreground mb-0.5">{event.dateTime}</div>
                      <div className="text-sm text-muted-foreground">{event.timeAgo}</div>
                    </div>
                    {/* IP Address */}
                    <div className="lg:col-span-2 flex items-center">
                      <span className="text-sm text-muted-foreground font-mono">{event.ipAddress}</span>
                      {/* Mobile: Show full date */}
                      <span className="text-sm text-text-subtle ml-auto lg:hidden">{event.dateTime}</span>
                    </div>
                  </div>
                  ))
                )}
              </div>

              {filteredEvents.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-base text-muted-foreground">No audit events found</p>
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
                      {isProgressivelyLoading ? 'Loading...' : `${startIndex + 1}-${Math.min(endIndex, filteredEvents.length)} of ${filteredEvents.length}`}
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                      {/* Previous Arrow */}
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
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

                      {/* Page Numbers */}
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-1.5 sm:px-2 text-sm sm:text-sm text-text-subtle">
                            ...
                          </span>
                        ) : (
                          <button 
                            key={page}
                            onClick={() => handlePageChange(typeof page === 'number' ? page : currentPage)}
                            className={`min-w-[30px] h-[30px] sm:min-w-[32px] sm:h-[32px] px-2 rounded-lg text-sm sm:text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-primary text-white'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}

                      {/* Next Arrow */}
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
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
          </div>
        </div>
      </div>
    </div>
  );
}