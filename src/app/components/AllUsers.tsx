import { useState } from 'react';
import { Search, Filter, Download, Plus, ChevronDown, Edit2, Key, Clock, Ban } from 'lucide-react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleColor: string;
  group: string;
  status: 'Active' | 'Pending' | 'Blocked';
  lastLogin: string;
  avatar: string;
  avatarColor: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmed Yusuf',
    email: 'a.yusuf@unhcr.org',
    role: 'Agency',
    roleColor: 'var(--sidebar-accent)',
    group: 'UNHCR Somalia',
    status: 'Active',
    lastLogin: '2 days ago',
    avatar: 'AY',
    avatarColor: '#0ea5e9'
  },
  {
    id: '2',
    name: 'Amina Hassan',
    email: 'a.hassan@unicef.org',
    role: 'Agency',
    roleColor: 'var(--sidebar-accent)',
    group: 'UNICEF Somalia',
    status: 'Active',
    lastLogin: '2 min ago',
    avatar: 'AH',
    avatarColor: 'var(--warning-strong)'
  },
  {
    id: '3',
    name: 'Collins Otieno',
    email: 'c.otieno@un.org',
    role: 'Admin',
    roleColor: 'var(--destructive-subtle)',
    group: 'UN OCHA',
    status: 'Active',
    lastLogin: '30 min ago',
    avatar: 'CO',
    avatarColor: 'var(--chart-3)'
  },
  {
    id: '4',
    name: 'Daniel Kipchoge',
    email: 'd.kipchoge@fao.org',
    role: 'Contributor',
    roleColor: '#d1fae5',
    group: 'FAO Somalia',
    status: 'Active',
    lastLogin: '6 hrs ago',
    avatar: 'DK',
    avatarColor: 'var(--success)'
  },
  {
    id: '5',
    name: 'David Mutua',
    email: 'd.mutua@ocha.org',
    role: 'Viewer',
    roleColor: 'var(--secondary)',
    group: 'OCHA Field',
    status: 'Active',
    lastLogin: 'Yesterday',
    avatar: 'DM',
    avatarColor: 'var(--chart-3)'
  },
  {
    id: '6',
    name: 'Fatima Ali',
    email: 'f.ali@who.org',
    role: 'Contributor',
    roleColor: '#d1fae5',
    group: 'WHO Somalia',
    status: 'Active',
    lastLogin: '1 hr ago',
    avatar: 'FA',
    avatarColor: '#ec4899'
  },
  {
    id: '7',
    name: 'Grace Achieng',
    email: 'g.achieng@wfp.org',
    role: 'Contributor',
    roleColor: '#d1fae5',
    group: 'WFP Somalia',
    status: 'Active',
    lastLogin: '4 hrs ago',
    avatar: 'GA',
    avatarColor: 'var(--chart-3)'
  },
  {
    id: '8',
    name: 'Halima Abdi',
    email: 'h.abdi@unicef.org',
    role: 'Viewer',
    roleColor: 'var(--secondary)',
    group: 'UNICEF Somalia',
    status: 'Pending',
    lastLogin: 'Never',
    avatar: 'HA',
    avatarColor: 'var(--chart-3)'
  }
];

export function AllUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('All Users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const activeUsers = mockUsers.filter(u => u.status === 'Active').length;
  const pendingUsers = mockUsers.filter(u => u.status === 'Pending').length;
  const blockedUsers = mockUsers.filter(u => u.status === 'Blocked').length;

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastLogin.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'All Users' || 
      user.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  return (
    <div className="flex-1 bg-background p-6 lg:p-8 overflow-auto">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-page-title mb-1">All Users</h1>
            <p className="text-sm sm:text-sm text-muted-foreground">
              {mockUsers.length} users · {activeUsers} active · {pendingUsers} pending · {blockedUsers} blocked
            </p>
          </div>
          <button
            onClick={() => toast.success('Invite sent')}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-base font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Invite User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors bg-card cursor-pointer"
                >
                  <option>All Users</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Blocked</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" size={18} />
              </div>
              <button className="px-4 py-2.5 border border-border rounded-lg text-base font-medium hover:bg-muted transition-colors flex items-center gap-2">
                <Filter size={18} />
                Filter
              </button>
              <button
                onClick={() => toast.success('Export started')}
                className="px-4 py-2.5 border border-border rounded-lg text-base font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid min-h-10 grid-cols-[280px_180px_200px_150px_150px] items-center gap-6 px-6 py-3 bg-muted/70 border-b border-border">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={toggleAllUsers}
                className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring cursor-pointer"
              />
              <span className="table-header-label">User</span>
            </div>
            <div className="table-header-label">
              Role
            </div>
            <div className="table-header-label">
              Group
            </div>
            <div className="table-header-label">
              Status
            </div>
            <div className="table-header-label">
              Last login
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div key={user.id} className="table-row-entity grid grid-cols-[280px_180px_200px_150px_150px] items-center gap-6 px-6 cursor-pointer" onClick={() => setSelectedUser(user)}>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="table-primary-text truncate">{user.name}</div>
                    <div className="table-supporting-text truncate">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span 
                    className="px-3 py-1 rounded-full table-status-text"
                    style={{ backgroundColor: user.roleColor, color: user.role === 'Admin' ? 'var(--destructive-text)' : user.role === 'Agency' ? 'var(--primary)' : user.role === 'Contributor' ? 'var(--success-text)' : 'var(--muted-foreground)' }}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="table-value-text">{user.group}</span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      user.status === 'Active' ? 'bg-success' : 
                      user.status === 'Pending' ? 'bg-warning' : 
                      'bg-destructive'
                    }`}></div>
                    <span className={`table-status-text ${
                      user.status === 'Active' ? 'text-success' : 
                      user.status === 'Pending' ? 'text-warning' : 
                      'text-destructive'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="table-metadata-text">{user.lastLogin}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Side Drawer */}
      {selectedUser && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[1400]"
            onClick={() => setSelectedUser(null)}
          ></div>

          {/* Side Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-card z-[1410] shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-start gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ backgroundColor: selectedUser.avatarColor }}
              >
                {selectedUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground mb-1">{selectedUser.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedUser.email} · Last login {selectedUser.lastLogin}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-text-subtle hover:text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6">
              {/* Status & Role Badges */}
              <div className="flex gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success-subtle text-success-text text-sm font-medium rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0"></div>
                  {selectedUser.status}
                </div>
                <span 
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium"
                  style={{ backgroundColor: selectedUser.roleColor, color: selectedUser.role === 'Admin' ? 'var(--destructive-text)' : selectedUser.role === 'Agency' ? 'var(--primary)' : selectedUser.role === 'Contributor' ? 'var(--success-text)' : 'var(--muted-foreground)' }}
                >
                  {selectedUser.role}
                </span>
              </div>

              {/* User Details - Two Column Layout */}
              <div className="space-y-5">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <div className="text-sm text-muted-foreground">Full Name</div>
                  <div className="text-sm text-foreground font-medium text-right">{selectedUser.name}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-sm text-foreground font-medium text-right">{selectedUser.email}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <div className="text-sm text-muted-foreground">Organization</div>
                  <div className="text-sm text-foreground font-medium text-right">{selectedUser.group.split(' ')[0]}</div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <div className="text-sm text-muted-foreground">Role</div>
                  <div className="text-right">
                    <span 
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium"
                      style={{ backgroundColor: selectedUser.roleColor, color: selectedUser.role === 'Admin' ? 'var(--destructive-text)' : selectedUser.role === 'Agency' ? 'var(--primary)' : selectedUser.role === 'Contributor' ? 'var(--success-text)' : 'var(--muted-foreground)' }}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <div className="text-sm text-muted-foreground">User Group</div>
                  <div className="text-sm text-foreground font-medium text-right">{selectedUser.group}</div>
                </div>
                
              </div>

              {/* Actions Section */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Actions</h3>
                
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left">
                    <Edit2 size={18} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Edit Role & Group</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left">
                    <Key size={18} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Send Password Reset Link</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left">
                    <Clock size={18} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">View Activity</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive-subtle rounded-lg transition-colors text-left mt-2">
                    <Ban size={18} className="text-destructive-text" />
                    <span className="text-sm text-destructive-text">Block User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
