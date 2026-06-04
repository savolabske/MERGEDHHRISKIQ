import { useState, useRef, useEffect } from 'react';
import { Users, UserCog, Shield, Plus, Search, Filter, Download, Check, X, Calendar, MoreVertical, ChevronLeft, ChevronRight, Edit, Key, Activity, Ban, HelpCircle, UserPlus, Trash2, ChevronDown } from 'lucide-react';
import { RolesPermissions } from './RolesPermissions';
import { toast } from 'sonner';
import { useProgressiveList } from '../hooks/useProgressiveList';
import { TableSkeleton } from './ui/table-skeleton';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Agency' | 'Admin' | 'Contributor' | 'Viewer';
  group: string;
  status: 'Active' | 'Pending' | 'Blocked';
  lastLogin: string;
  initials: string;
  color: string;
}

interface UserGroup {
  id: string;
  name: string;
  initials: string;
  color: string;
  userCount: number;
  dateCreated: string;
}

// Close itemsPerPage dropdown on outside click (need to define here before component uses it)
const useItemsPerPageDropdown = (dropdownRef: React.RefObject<HTMLDivElement>, setShowDropdown: (show: boolean) => void) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, setShowDropdown]);
};

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmed Yusuf',
    email: 'a.yusuf@unhcr.org',
    role: 'Agency',
    group: 'UNHCR Somalia',
    status: 'Active',
    lastLogin: '2 days ago',
    initials: 'AY',
    color: '#0ea5e9'
  },
  {
    id: '2',
    name: 'Amina Hassan',
    email: 'a.hassan@unicef.org',
    role: 'Agency',
    group: 'UNICEF Somalia',
    status: 'Active',
    lastLogin: '2 min ago',
    initials: 'AH',
    color: 'var(--warning-strong)'
  },
  {
    id: '3',
    name: 'Collins Otieno',
    email: 'c.otieno@un.org',
    role: 'Admin',
    group: 'UN OCHA',
    status: 'Active',
    lastLogin: '30 min ago',
    initials: 'CO',
    color: 'var(--chart-3)'
  },
  {
    id: '4',
    name: 'Daniel Kipchoge',
    email: 'd.kipchoge@fao.org',
    role: 'Contributor',
    group: 'FAO Somalia',
    status: 'Active',
    lastLogin: '6 hrs ago',
    initials: 'DK',
    color: 'var(--success)'
  },
  {
    id: '5',
    name: 'David Mutua',
    email: 'd.mutua@ocha.org',
    role: 'Viewer',
    group: 'OCHA Field',
    status: 'Active',
    lastLogin: 'Yesterday',
    initials: 'DM',
    color: 'var(--chart-3)'
  },
  {
    id: '6',
    name: 'Fatima Ali',
    email: 'f.ali@who.org',
    role: 'Contributor',
    group: 'WHO Somalia',
    status: 'Active',
    lastLogin: '1 hr ago',
    initials: 'FA',
    color: '#ec4899'
  },
  {
    id: '7',
    name: 'Grace Achieng',
    email: 'g.achieng@wfp.org',
    role: 'Contributor',
    group: 'WFP Somalia',
    status: 'Active',
    lastLogin: '4 hrs ago',
    initials: 'GA',
    color: 'var(--chart-3)'
  },
  {
    id: '8',
    name: 'Halima Abdi',
    email: 'h.abdi@unicef.org',
    role: 'Viewer',
    group: 'UNICEF Somalia',
    status: 'Pending',
    lastLogin: 'Never',
    initials: 'HA',
    color: 'var(--chart-3)'
  },
  {
    id: '9',
    name: 'Ibrahim Mohamed',
    email: 'i.mohamed@unhcr.org',
    role: 'Agency',
    group: 'UNHCR Somalia',
    status: 'Active',
    lastLogin: '5 hrs ago',
    initials: 'IM',
    color: '#0ea5e9'
  },
  {
    id: '10',
    name: 'James Kamau',
    email: 'j.kamau@fao.org',
    role: 'Contributor',
    group: 'FAO Somalia',
    status: 'Blocked',
    lastLogin: '2 weeks ago',
    initials: 'JK',
    color: 'var(--success)'
  },
  {
    id: '11',
    name: 'Khadija Hussein',
    email: 'k.hussein@wfp.org',
    role: 'Agency',
    group: 'WFP Somalia',
    status: 'Active',
    lastLogin: '3 days ago',
    initials: 'KH',
    color: 'var(--chart-3)'
  },
  {
    id: '12',
    name: 'Lucy Wanjiru',
    email: 'l.wanjiru@who.org',
    role: 'Viewer',
    group: 'WHO Somalia',
    status: 'Active',
    lastLogin: '1 day ago',
    initials: 'LW',
    color: '#ec4899'
  }
];

const mockUserGroups: UserGroup[] = [
  {
    id: '1',
    name: 'UNHCR Somalia',
    initials: 'US',
    color: '#0ea5e9',
    userCount: 3,
    dateCreated: '2023-01-15'
  },
  {
    id: '2',
    name: 'UNICEF Somalia',
    initials: 'US',
    color: 'var(--warning-strong)',
    userCount: 2,
    dateCreated: '2023-02-20'
  },
  {
    id: '3',
    name: 'UN OCHA',
    initials: 'UO',
    color: 'var(--chart-3)',
    userCount: 1,
    dateCreated: '2023-03-10'
  },
  {
    id: '4',
    name: 'FAO Somalia',
    initials: 'FS',
    color: 'var(--success)',
    userCount: 2,
    dateCreated: '2023-04-05'
  },
  {
    id: '5',
    name: 'OCHA Field',
    initials: 'OF',
    color: 'var(--chart-3)',
    userCount: 1,
    dateCreated: '2023-05-25'
  },
  {
    id: '6',
    name: 'WHO Somalia',
    initials: 'WS',
    color: '#ec4899',
    userCount: 2,
    dateCreated: '2023-06-15'
  },
  {
    id: '7',
    name: 'WFP Somalia',
    initials: 'WS',
    color: 'var(--chart-3)',
    userCount: 2,
    dateCreated: '2023-07-20'
  }
];

export function UsersAccess() {
  const [activeTab, setActiveTab] = useState<'allUsers' | 'userGroups' | 'rolesPermissions'>('allUsers');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [userGroups, setUserGroups] = useState<UserGroup[]>(mockUserGroups);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('All Users');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [showGroupDrawer, setShowGroupDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);
  
  // Use the hook for closing dropdown
  useItemsPerPageDropdown(itemsPerPageDropdownRef, setShowItemsPerPageDropdown);
  
  // Bulk action states
  const [showBulkBlockConfirm, setShowBulkBlockConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkGroupModal, setShowBulkGroupModal] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [bulkSelectedGroup, setBulkSelectedGroup] = useState('');
  const [bulkSelectedRole, setBulkSelectedRole] = useState('');

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const pendingUsers = users.filter(u => u.status === 'Pending').length;
  const blockedUsers = users.filter(u => u.status === 'Blocked').length;
  const totalMembers = userGroups.reduce((sum, group) => sum + group.userCount, 0);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastLogin.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'All Users' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const filteredGroups = userGroups.filter(group =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    group.userCount.toString().includes(groupSearchQuery.toLowerCase()) ||
    formatDate(group.dateCreated).toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  // Pagination for All Users
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { visibleItems: visibleCurrentUsers, isProgressivelyLoading } = useProgressiveList(currentUsers, {
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

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    // Generate initials from group name
    const words = newGroupName.trim().split(' ');
    const initials = words.length > 1 
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : words[0].substring(0, 2).toUpperCase();

    // Random color
    const colors = ['#0ea5e9', 'var(--warning-strong)', 'var(--chart-3)', 'var(--success)', 'var(--chart-3)', '#ec4899', 'var(--chart-3)', 'var(--warning)'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newGroup: UserGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      initials,
      color: randomColor,
      userCount: selectedUsersForGroup.length,
      dateCreated: new Date().toISOString().split('T')[0]
    };

    // Update users to assign them to the new group
    if (selectedUsersForGroup.length > 0) {
      setUsers(users.map(user => 
        selectedUsersForGroup.includes(user.id) 
          ? { ...user, group: newGroupName.trim() }
          : user
      ));
    }

    setUserGroups([...userGroups, newGroup]);
    setNewGroupName('');
    setSelectedUsersForGroup([]);
    setShowAddGroupModal(false);
    toast.success(`Group added successfully with ${selectedUsersForGroup.length} user${selectedUsersForGroup.length !== 1 ? 's' : ''}!`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const toggleAllGroups = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleBulkDeleteGroups = () => {
    const groupNames = selectedGroups.map(id => userGroups.find(g => g.id === id)?.name).join(', ');
    const confirmed = confirm(`Are you sure you want to delete ${selectedGroups.length} group(s)?\n\n${groupNames}`);
    if (confirmed) {
      const count = selectedGroups.length;
      toast.promise(
        Promise.resolve().then(() => {
          setUserGroups(prev => prev.filter(g => !selectedGroups.includes(g.id)));
          setSelectedGroups([]);
        }),
        {
          loading: `Deleting ${count} group${count > 1 ? 's' : ''}...`,
          success: `${count} group${count > 1 ? 's' : ''} deleted successfully.`,
          error: 'We could not delete the selected groups. Please try again.',
        }
      );
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Agency':
        return 'bg-sidebar-accent text-primary';
      case 'Admin':
        return 'bg-destructive-subtle text-destructive-text';
      case 'Contributor':
        return 'bg-success-subtle text-success-text';
      case 'Viewer':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-success-text';
      case 'Pending':
        return 'text-warning-text';
      case 'Blocked':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  // Bulk action handlers
  const handleBulkBlock = () => {
    if (selectedUsers.length === 0) return;
    setShowBulkBlockConfirm(true);
  };

  const confirmBulkBlock = () => {
    setUsers(users.map(u => 
      selectedUsers.includes(u.id) ? { ...u, status: 'Blocked' as 'Blocked' } : u
    ));
    toast.success(`Blocked ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
    setSelectedUsers([]);
    setShowBulkBlockConfirm(false);
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    const count = selectedUsers.length;
    toast.promise(
      Promise.resolve().then(() => {
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
        setShowBulkDeleteConfirm(false);
      }),
      {
        loading: `Deleting ${count} user${count > 1 ? 's' : ''}...`,
        success: `${count} user${count > 1 ? 's' : ''} deleted successfully.`,
        error: 'We could not delete the selected users. Please try again.',
      }
    );
  };

  const handleBulkAssignGroup = () => {
    if (selectedUsers.length === 0) return;
    setShowBulkGroupModal(true);
  };

  const confirmBulkAssignGroup = () => {
    if (!bulkSelectedGroup) {
      toast.error('Please select a group');
      return;
    }
    setUsers(users.map(u => 
      selectedUsers.includes(u.id) ? { ...u, group: bulkSelectedGroup } : u
    ));
    toast.success(`Assigned ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} to ${bulkSelectedGroup}`);
    setSelectedUsers([]);
    setBulkSelectedGroup('');
    setShowBulkGroupModal(false);
  };

  const handleBulkAssignRole = () => {
    if (selectedUsers.length === 0) return;
    setShowBulkRoleModal(true);
  };

  const confirmBulkAssignRole = () => {
    if (!bulkSelectedRole) {
      toast.error('Please select a role');
      return;
    }
    setUsers(users.map(u => 
      selectedUsers.includes(u.id) ? { ...u, role: bulkSelectedRole as 'Agency' | 'Admin' | 'Contributor' | 'Viewer' } : u
    ));
    toast.success(`Assigned ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} to ${bulkSelectedRole} role`);
    setSelectedUsers([]);
    setBulkSelectedRole('');
    setShowBulkRoleModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6 pb-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Users & Access</h1>
              <p className="text-sm sm:text-sm text-muted-foreground">
                Manage platform users, groups, roles, and access permissions.
              </p>
            </div>

            {/* Tabs with Badge Counts and Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex gap-4 sm:gap-8 border-b border-border overflow-x-auto pb-0 -mb-[1px]">
                <button
                  onClick={() => setActiveTab('allUsers')}
                  className={`flex items-center gap-2 px-1 pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'allUsers'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users size={18} strokeWidth={2} />
                  <span>All Users</span>
                  <span className={`px-2 py-0.5 rounded-md text-sm font-semibold ${
                    activeTab === 'allUsers' 
                      ? 'bg-sidebar-accent text-primary' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {users.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('userGroups')}
                  className={`flex items-center gap-2 px-1 pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'userGroups'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserCog size={18} strokeWidth={2} />
                  <span>Groups</span>
                  <span className={`px-2 py-0.5 rounded-md text-sm font-semibold ${
                    activeTab === 'userGroups' 
                      ? 'bg-sidebar-accent text-primary' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {userGroups.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('rolesPermissions')}
                  className={`flex items-center gap-2 px-1 pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'rolesPermissions'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shield size={18} strokeWidth={2} />
                  <span>Roles & Permissions</span>
                  <span className={`px-2 py-0.5 rounded-md text-sm font-semibold ${
                    activeTab === 'rolesPermissions' 
                      ? 'bg-sidebar-accent text-primary' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    5
                  </span>
                </button>
              </div>

              {/* Action Button - Changes based on active tab */}
              {activeTab === 'allUsers' && (
                <button 
                  className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus size={18} />
                  Invite User
                </button>
              )}
              {activeTab === 'userGroups' && (
                <button 
                  onClick={() => setShowAddGroupModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus size={18} />
                  Add Group
                </button>
              )}
            </div>

            {/* ALL USERS TAB */}
            {activeTab === 'allUsers' && (
              <>
                {/* Search and Filters */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    {/* Role Filter Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                        className="px-4 py-2 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        {roleFilter}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {showRoleDropdown && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                          {['All Users', 'Agency', 'Admin', 'Contributor', 'Viewer'].map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                setRoleFilter(role);
                                setShowRoleDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Filter Dropdown */}
                    <button className="px-4 py-2 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      All Status
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {/* Bulk Actions Bar */}
                  {selectedUsers.length > 0 && (
                    <div className="px-6 py-3 bg-surface-subtle border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground font-medium">
                        {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            toast.success(`Exporting ${selectedUsers.length} user(s)...`);
                          }}
                          className="px-3 py-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Download size={14} />
                          Export
                        </button>
                        <button
                          onClick={handleBulkBlock}
                          className="px-3 py-1.5 bg-warning hover:bg-warning-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Ban size={14} />
                          Block
                        </button>
                        <button
                          onClick={handleBulkAssignGroup}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <UserCog size={14} />
                          Assign Group
                        </button>
                        <button
                          onClick={handleBulkAssignRole}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Shield size={14} />
                          Assign Role
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="px-3 py-1.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleAllUsers}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</span>
                    </div>
                    <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Role
                    </div>
                    <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Group
                    </div>
                    <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </div>
                    <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Last Login
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-border">
                    {isProgressivelyLoading ? (
                      <TableSkeleton variant="users" rows={itemsPerPage} />
                    ) : (
                      visibleCurrentUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 hover:bg-muted transition-colors items-center cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDrawer(true);
                        }}
                      >
                        {/* Checkbox & User Info */}
                        <div className="lg:col-span-4 flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleUserSelection(user.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden lg:block w-4 h-4 rounded border-border text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">User</div>
                              <h3 className="text-sm font-medium text-foreground truncate">{user.name}</h3>
                              <p className="text-sm text-primary truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="lg:col-span-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Role</div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>

                        {/* Group */}
                        <div className="lg:col-span-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Group</div>
                          <span className="text-sm text-foreground">{user.group}</span>
                        </div>

                        {/* Status */}
                        <div className="lg:col-span-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Status</div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${
                              user.status === 'Active' ? 'bg-success' : 
                              user.status === 'Pending' ? 'bg-warning-text' : 
                              'bg-muted-foreground'
                            }`} />
                            <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </div>
                        </div>

                        {/* Last Login */}
                        <div className="lg:col-span-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Last Login</div>
                          <span className={`text-sm ${
                            user.lastLogin === 'Never' ? 'text-muted-foreground' :
                            user.lastLogin.includes('min') || user.lastLogin.includes('hr') ? 'text-primary' :
                            'text-muted-foreground'
                          }`}>
                            {user.lastLogin}
                          </span>
                        </div>
                      </div>
                      ))
                    )}
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-base text-muted-foreground">No users found</p>
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
                          {isProgressivelyLoading
                            ? 'Loading...'
                            : `${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} of ${filteredUsers.length}`}
                        </span>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
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
              </>
            )}

            {/* USER GROUPS TAB */}
            {activeTab === 'userGroups' && (
              <>
                {/* Search Bar */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
                    <input
                      type="text"
                      placeholder="Search user groups..."
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Groups Table */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {/* Bulk Actions Bar */}
                  {selectedGroups.length > 0 && (
                    <div className="px-6 py-3 bg-surface-subtle border-b border-border flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">
                        {selectedGroups.length} group{selectedGroups.length > 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={handleBulkDeleteGroups}
                        className="px-3 py-1.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Delete Selected
                      </button>
                    </div>
                  )}

                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-muted border-b border-border">
                    <div className="col-span-5 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                        onChange={toggleAllGroups}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Group Name</span>
                    </div>
                    <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Users
                    </div>
                    <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date Created
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-border">
                    {filteredGroups.map((group) => (
                      <div 
                        key={group.id} 
                        className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowGroupDrawer(true);
                        }}
                      >
                        {/* Group Name */}
                        <div className="lg:col-span-5 flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleGroupSelection(group.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden lg:block w-4 h-4 rounded border-border text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Group Name</div>
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                                style={{ backgroundColor: group.color }}
                              >
                                {group.initials}
                              </div>
                              <h3 className="text-sm font-medium text-foreground">{group.name}</h3>
                            </div>
                          </div>
                        </div>

                        {/* Users */}
                        <div className="lg:col-span-3">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Users</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users size={16} className="text-text-subtle" />
                            <span>{group.userCount}</span>
                          </div>
                        </div>

                        {/* Date Created */}
                        <div className="lg:col-span-3">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Date Created</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} className="text-text-subtle" />
                            <span>{formatDate(group.dateCreated)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-1 flex items-center justify-end">
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                          >
                            <MoreVertical size={18} className="text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredGroups.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-base text-muted-foreground">No groups found</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ROLES & PERMISSIONS TAB */}
            {activeTab === 'rolesPermissions' && (
              <RolesPermissions />
            )}
          </div>
        </div>
      </div>

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-card z-10">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add User Group</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Create a new user group and add members</p>
              </div>
              <button 
                onClick={() => {
                  setShowAddGroupModal(false);
                  setNewGroupName('');
                  setSelectedUsersForGroup([]);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-5">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Group Name <span className="text-destructive-text">*</span>
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. UNHCR Somalia, WFP Field Team"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                />
              </div>

              {/* Add Users Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Add Users (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select users to add to this group
                </p>
                
                {/* Users List */}
                <div className="border border-border rounded-lg max-h-[300px] overflow-y-auto">
                  {users.map((user, index) => {
                    const isSelected = selectedUsersForGroup.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors cursor-pointer ${
                          index !== users.length - 1 ? 'border-b border-border' : ''
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedUsersForGroup(selectedUsersForGroup.filter(id => id !== user.id));
                          } else {
                            setSelectedUsersForGroup([...selectedUsersForGroup, user.id]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                            style={{ backgroundColor: user.color }}
                          >
                            {user.initials}
                          </div>
                          
                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Current Group Badge */}
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {user.group}
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div className="ml-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-border-muted text-primary focus:ring-ring focus:ring-offset-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Count */}
                {selectedUsersForGroup.length > 0 && (
                  <p className="text-xs text-primary mt-2 font-medium">
                    {selectedUsersForGroup.length} user{selectedUsersForGroup.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3 sticky bottom-0 bg-card">
              <button
                onClick={() => {
                  setShowAddGroupModal(false);
                  setNewGroupName('');
                  setSelectedUsersForGroup([]);
                }}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroup}
                disabled={!newGroupName.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  newGroupName.trim()
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-muted text-text-subtle cursor-not-allowed'
                }`}
              >
                Add Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Drawer */}
      {showUserDrawer && selectedUser && (
        <div className="fixed inset-0 bg-black/30 z-[1400] flex justify-end" onClick={() => setShowUserDrawer(false)}>
          <div 
            className="bg-card w-full max-w-md h-full overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border">
              <div className="flex items-start gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
                  style={{ backgroundColor: selectedUser.color }}
                >
                  {selectedUser.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground mb-1">{selectedUser.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email} · Last login {selectedUser.lastLogin}
                  </p>
                </div>
                <button 
                  onClick={() => setShowUserDrawer(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 mt-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                  selectedUser.status === 'Active' ? 'bg-success-subtle text-success-text' :
                  selectedUser.status === 'Pending' ? 'bg-warning-subtle text-warning-text' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    selectedUser.status === 'Active' ? 'bg-success' :
                    selectedUser.status === 'Pending' ? 'bg-warning-text' :
                    'bg-muted-foreground'
                  }`} />
                  {selectedUser.status}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="px-6 py-6 space-y-5">
              {/* Full Name */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-subtle">Full Name</span>
                <span className="text-base font-medium text-foreground">{selectedUser.name}</span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-subtle">Email</span>
                <span className="text-base font-medium text-primary">{selectedUser.email}</span>
              </div>

              {/* Organization */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-subtle">Organization</span>
                <span className="text-base font-medium text-foreground">{selectedUser.group}</span>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-subtle">Role</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>

              {/* User Group */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-subtle">User Group</span>
                <span className="text-base font-medium text-foreground">{selectedUser.group}</span>
              </div>
            </div>

            {/* Actions Section */}
            <div className="px-6 py-4 border-t border-border">
              <h3 className="text-xs font-bold text-text-subtle uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-2">
                {/* Edit Role & Group */}
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left">
                  <Edit size={18} className="text-muted-foreground" />
                  <span className="text-base text-foreground">Edit Role & Group</span>
                </button>

                {/* Send Password Reset Link */}
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left">
                  <Key size={18} className="text-muted-foreground" />
                  <span className="text-base text-foreground">Send Password Reset Link</span>
                </button>

                {/* View Activity */}
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left">
                  <Activity size={18} className="text-muted-foreground" />
                  <span className="text-base text-foreground">View Activity</span>
                </button>

                {/* Block User */}
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive-subtle rounded-lg transition-colors text-left">
                  <Ban size={18} className="text-destructive-text" />
                  <span className="text-base text-destructive-text">Block User</span>
                </button>
              </div>
            </div>

            {/* Help Button */}
            <div className="fixed bottom-6 right-6">
              <button className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                <HelpCircle size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Drawer */}
      {showGroupDrawer && selectedGroup && (
        <div className="fixed inset-0 bg-black/30 z-[1400] flex justify-end" onClick={() => setShowGroupDrawer(false)}>
          <div 
            className="bg-card w-full max-w-md h-full overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                    style={{ backgroundColor: selectedGroup.color }}
                  >
                    {selectedGroup.initials}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">{selectedGroup.name}</h2>
                    <p className="text-sm text-muted-foreground">Created {formatDate(selectedGroup.dateCreated)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGroupDrawer(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Info Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sidebar-accent text-primary rounded-md text-sm font-medium">
                  <Users size={14} />
                  {selectedGroup.userCount} members
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-sm font-medium">
                  <Calendar size={14} />
                  {formatDate(selectedGroup.dateCreated)}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-sm font-medium">
                  ID: GRP-{selectedGroup.id.padStart(3, '0')}
                </span>
              </div>
            </div>

            {/* Members Section */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">Members</h3>
                <button className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
                  <UserPlus size={16} />
                  Add Member
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {users
                  .filter(u => u.group === selectedGroup.name)
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate">{member.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{member.email}</span>
                            <span>·</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card transition-colors shrink-0">
                        <UserCog size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Group Details */}
            <div className="px-6 py-6 border-b border-border">
              <h3 className="text-base font-semibold text-foreground mb-4">Group Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-subtle">Group Name</span>
                  <span className="text-base font-medium text-foreground">{selectedGroup.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-subtle">Created</span>
                  <span className="text-base font-medium text-foreground">{formatDate(selectedGroup.dateCreated)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-subtle">Members</span>
                  <span className="text-base font-medium text-foreground">{selectedGroup.userCount} users</span>
                </div>
              </div>
            </div>

            {/* Help Button */}
            <div className="fixed bottom-6 right-6">
              <button className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                <HelpCircle size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Actions - Positioned at Bottom */}
            <div className="px-6 py-6 space-y-3 mt-auto">
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 border border-border bg-card hover:bg-muted rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2">
                  <Edit size={18} className="text-muted-foreground" />
                  Edit
                </button>
                <button className="px-4 py-3 border border-destructive-subtle bg-card hover:bg-destructive-subtle rounded-lg text-base font-medium text-destructive-text transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Block Confirmation Modal */}
      {showBulkBlockConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[500px] w-full p-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Confirm Block Users</h3>
            <p className="text-base text-muted-foreground mb-6">
              Are you sure you want to block {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}? They will lose access to the platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkBlockConfirm(false)}
                className="flex-1 px-5 py-3 bg-card hover:bg-muted text-muted-foreground border border-border rounded-lg text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkBlock}
                className="flex-1 px-5 py-3 bg-warning hover:bg-warning-text text-white rounded-lg text-base font-medium transition-colors"
              >
                Block Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[500px] w-full p-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Confirm Delete Users</h3>
            <p className="text-base text-muted-foreground mb-6">
              Are you sure you want to permanently delete {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 px-5 py-3 bg-card hover:bg-muted text-muted-foreground border border-border rounded-lg text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="flex-1 px-5 py-3 bg-destructive hover:bg-destructive-text text-white rounded-lg text-base font-medium transition-colors"
              >
                Delete Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Group Modal */}
      {showBulkGroupModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[500px] w-full">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">Assign Group</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Assign {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} to a group
              </p>
            </div>
            <div className="px-6 py-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Group <span className="text-destructive-text">*</span>
              </label>
              <select
                value={bulkSelectedGroup}
                onChange={(e) => setBulkSelectedGroup(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select a group...</option>
                {userGroups.map((group) => (
                  <option key={group.id} value={group.name}>{group.name}</option>
                ))}
              </select>
            </div>
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkGroupModal(false);
                  setBulkSelectedGroup('');
                }}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkAssignGroup}
                disabled={!bulkSelectedGroup}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  bulkSelectedGroup
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-muted text-text-subtle cursor-not-allowed'
                }`}
              >
                Assign Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Role Modal */}
      {showBulkRoleModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[500px] w-full">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">Assign Role</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Assign {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} to a role
              </p>
            </div>
            <div className="px-6 py-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Role <span className="text-destructive-text">*</span>
              </label>
              <select
                value={bulkSelectedRole}
                onChange={(e) => setBulkSelectedRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select a role...</option>
                <option value="Viewer">Viewer</option>
                <option value="Contributor">Contributor</option>
                <option value="Agency">Agency</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkRoleModal(false);
                  setBulkSelectedRole('');
                }}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkAssignRole}
                disabled={!bulkSelectedRole}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  bulkSelectedRole
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-muted text-text-subtle cursor-not-allowed'
                }`}
              >
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}