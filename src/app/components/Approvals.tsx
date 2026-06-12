import { useState } from 'react';
import { Search, Check, X, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { PageScrollShell } from './PageScrollShell';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  submitted: string;
  waitingDays: number;
  avatar: string;
  avatarColor: string;
}

const mockPendingUsers: PendingUser[] = [
  {
    id: '1',
    name: 'Yusuf Abdirahman',
    email: 'y.abdirahman@unicef.org',
    organization: 'UNICEF',
    submitted: 'Mar 9, 2026',
    waitingDays: 2,
    avatar: 'YA',
    avatarColor: 'var(--warning-strong)'
  },
  {
    id: '2',
    name: 'Hawa Mohamed',
    email: 'h.mohamed@wfp.org',
    organization: 'WFP',
    submitted: 'Mar 8, 2026',
    waitingDays: 3,
    avatar: 'HM',
    avatarColor: '#0ea5e9'
  },
  {
    id: '3',
    name: 'John Kariuki',
    email: 'j.kariuki@unhcr.org',
    organization: 'UNHCR',
    submitted: 'Mar 7, 2026',
    waitingDays: 4,
    avatar: 'JK',
    avatarColor: 'var(--success)'
  },
  {
    id: '4',
    name: 'Liban Osman',
    email: 'l.osman@iom.org',
    organization: 'IOM',
    submitted: 'Mar 6, 2026',
    waitingDays: 5,
    avatar: 'LO',
    avatarColor: 'var(--chart-3)'
  }
];

export function Approvals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<PendingUser[]>(mockPendingUsers);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [userToDecline, setUserToDecline] = useState<PendingUser | null>(null);
  const [usersToDecline, setUsersToDecline] = useState<PendingUser[]>([]);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.submitted.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.waitingDays.toString().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleApprove = (user: PendingUser) => {
    setSelectedUser(user);
  };

  const handleBulkApprove = () => {
    if (selectedUserIds.length === 0) return;
    // For bulk approve, we'll open a simplified drawer to assign role/group to all selected users
    const firstSelectedUser = users.find(u => u.id === selectedUserIds[0]);
    if (firstSelectedUser) {
      setSelectedUser(firstSelectedUser);
    }
  };

  const handleDecline = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDecline(user);
      setUsersToDecline([user]);
      setShowDeclineConfirm(true);
    }
  };

  const handleBulkReject = () => {
    if (selectedUserIds.length === 0) return;
    const usersToDeclineList = users.filter(u => selectedUserIds.includes(u.id));
    setUsersToDecline(usersToDeclineList);
    setUserToDecline(null);
    setShowDeclineConfirm(true);
  };

  const confirmDecline = () => {
    if (usersToDecline.length > 0) {
      const declinedIds = usersToDecline.map(u => u.id);
      setUsers(users.filter(u => !declinedIds.includes(u.id)));
      
      if (usersToDecline.length === 1) {
        toast.error(`Declined ${usersToDecline[0].name}'s registration request`);
      } else {
        toast.error(`Declined ${usersToDecline.length} registration requests`);
      }
      
      setUserToDecline(null);
      setUsersToDecline([]);
      setShowDeclineConfirm(false);
      setSelectedUserIds([]);
    }
  };

  const cancelDecline = () => {
    setUserToDecline(null);
    setUsersToDecline([]);
    setShowDeclineConfirm(false);
  };

  const confirmApproval = () => {
    if (!selectedRole || !selectedGroup) {
      toast.error('Please assign both a role and a group to proceed');
      return;
    }
    
    // Check if we're doing bulk approval
    if (selectedUserIds.length > 1) {
      const approvedUsers = users.filter(u => selectedUserIds.includes(u.id));
      setUsers(users.filter(u => !selectedUserIds.includes(u.id)));
      toast.success(`Approved ${approvedUsers.length} users as ${selectedRole}`);
      setSelectedUserIds([]);
    } else {
      const user = selectedUser;
      setUsers(users.filter(u => u.id !== selectedUser?.id));
      toast.success(`Approved ${user?.name} as ${selectedRole}`);
    }
    
    setSelectedUser(null);
    setSelectedRole('');
    setSelectedGroup('');
  };

  return (
    <>
    <PageScrollShell innerClassName="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-page-title mb-1">Pending Approvals</h2>
              <p className="text-sm sm:text-sm text-muted-foreground">
                Review registration requests below
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                <input
                  type="text"
                  placeholder="Search pending approvals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Bulk Actions Bar */}
              {selectedUserIds.length > 0 && (
                <div className="px-4 sm:px-6 py-3 bg-surface-subtle border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground font-medium">
                    {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleBulkApprove}
                      className="px-3 py-1.5 bg-success hover:bg-success-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                    <button
                      onClick={handleBulkReject}
                      className="px-3 py-1.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Table Header - Desktop Only */}
              <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
                <div className="col-span-3 table-header-label flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border-muted text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  Applicant
                </div>
                <div className="col-span-2 table-header-label">
                  Organization
                </div>
                <div className="col-span-2 table-header-label">
                  Submitted
                </div>
                <div className="col-span-2 table-header-label">
                  Waiting
                </div>
                <div className="col-span-3 table-header-label text-right">
                  Actions
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="table-row-entity grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-4 sm:px-6 transition-colors">
                    {/* Mobile & Desktop Layout */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-border-muted text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="table-primary-text truncate">{user.name}</div>
                        <div className="table-supporting-text truncate">{user.email}</div>
                        {/* Mobile: Show org inline */}
                        <div className="text-sm text-muted-foreground mt-0.5 lg:hidden">{user.organization}</div>
                      </div>
                    </div>
                    {/* Desktop: Organization */}
                    <div className="hidden lg:flex lg:col-span-2 items-center">
                      <span className="table-value-text">{user.organization}</span>
                    </div>
                    {/* Desktop: Submitted */}
                    <div className="hidden lg:flex lg:col-span-2 items-center">
                      <span className="table-metadata-text">{user.submitted}</span>
                    </div>
                    {/* Mobile & Desktop: Waiting */}
                    <div className="lg:col-span-2 flex items-center">
                      <div className="flex items-center gap-1.5 text-warning">
                        <Clock size={16} />
                        <span className="table-status-text">{user.waitingDays} days ago</span>
                        {/* Mobile: Show submitted date */}
                        <span className="lg:hidden text-sm text-text-subtle ml-1">• {user.submitted}</span>
                      </div>
                    </div>
                    {/* Mobile & Desktop: Actions */}
                    <div className="lg:col-span-3 flex items-center justify-start lg:justify-end gap-2 mt-2 lg:mt-0">
                      <button
                        onClick={() => handleApprove(user)}
                        className="flex-1 lg:flex-none px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(user.id)}
                        className="flex-1 lg:flex-none px-3 py-1.5 bg-destructive-subtle hover:bg-destructive-subtle text-destructive-text rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X size={14} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-base text-muted-foreground">No pending approvals found</p>
                </div>
              )}
            </div>
    </PageScrollShell>

      {/* Approval Side Drawer */}
      {selectedUser && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-[1400]"
            onClick={() => setSelectedUser(null)}
          ></div>

          {/* Side Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-card z-[1410] shadow-2xl flex flex-col">
            {/* Drawer Header - Fixed */}
            <div className="p-6 border-b border-border flex items-start gap-4 flex-shrink-0">
              {selectedUserIds.length > 1 ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {selectedUserIds.length}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-foreground mb-1">Bulk Approval</h2>
                    <p className="text-sm text-muted-foreground">{selectedUserIds.length} users selected for approval</p>
                  </div>
                </>
              ) : (
                <>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{ backgroundColor: selectedUser.avatarColor }}
                  >
                    {selectedUser.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-foreground mb-1">{selectedUser.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedUser.email} · Submitted {selectedUser.submitted}</p>
                  </div>
                </>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="text-text-subtle hover:text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Bulk Approval Notice */}
              {selectedUserIds.length > 1 && (
                <div className="bg-primary-subtle border border-primary rounded-lg p-4">
                  <div className="text-sm text-primary font-medium mb-2">
                    Bulk Approval Mode
                  </div>
                  <div className="text-sm text-chart-2">
                    All {selectedUserIds.length} users will be assigned the same role and group.
                  </div>
                </div>
              )}

              {/* Selected Users List for Bulk Approval */}
              {selectedUserIds.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Selected Users</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {users
                      .filter(u => selectedUserIds.includes(u.id))
                      .map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: user.avatarColor }}
                          >
                            {user.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0">{user.organization}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-subtle text-warning-text text-sm font-medium rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning-text"></div>
                  Pending
                </div>
                <span className="px-3 py-1.5 bg-sidebar-accent text-primary text-sm font-medium rounded-full">
                  {selectedUser.organization}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-subtle text-warning-strong text-sm font-medium rounded-full">
                  <Clock size={14} />
                  {selectedUser.waitingDays} days ago
                </div>
              </div>

              {/* User Details - Two Column Layout */}
              {selectedUserIds.length <= 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div className="text-sm font-medium text-foreground text-right">{selectedUser.name}</div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="text-sm font-medium text-foreground text-right">{selectedUser.email}</div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <div className="text-sm text-muted-foreground">Organization</div>
                    <div className="text-sm font-medium text-foreground text-right">{selectedUser.organization}</div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <div className="text-sm text-muted-foreground">Submitted</div>
                    <div className="text-sm font-medium text-foreground text-right">{selectedUser.submitted}</div>
                  </div>
                </div>
              )}

              {/* Access Configuration */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Access Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-base text-foreground mb-2 block">
                      Assign Role <span className="text-destructive-text">*</span>
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-base text-text-subtle focus:outline-none focus:border-primary focus:text-foreground transition-colors bg-card"
                    >
                      <option value="">Select a role...</option>
                      <option value="Viewer">Viewer</option>
                      <option value="Contributor">Contributor</option>
                      <option value="Agency">Agency</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-base text-foreground mb-2 block">
                      Assign to Group <span className="text-destructive-text">*</span>
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-base text-text-subtle focus:outline-none focus:border-primary focus:text-foreground transition-colors bg-card"
                    >
                      <option value="">Select a group...</option>
                      <option value="UNICEF Somalia">UNICEF Somalia</option>
                      <option value="WFP Somalia">WFP Somalia</option>
                      <option value="UNHCR Somalia">UNHCR Somalia</option>
                      <option value="IOM Somalia">IOM Somalia</option>
                      <option value="FAO Somalia">FAO Somalia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer - Fixed at Bottom */}
            <div className="p-6 border-t border-border flex gap-3 flex-shrink-0 bg-card">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedRole('');
                  setSelectedGroup('');
                }}
                className="flex-1 px-5 py-3 bg-card hover:bg-muted text-muted-foreground border border-border rounded-lg text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                disabled={!selectedRole || !selectedGroup}
                className="flex-1 px-5 py-3 bg-success hover:bg-success disabled:bg-border-muted disabled:cursor-not-allowed text-white rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Confirm Approval
              </button>
            </div>
          </div>
        </>
      )}

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && usersToDecline.length > 0 && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-[1400]"
            onClick={cancelDecline}
          ></div>

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card z-[1410] shadow-2xl rounded-2xl p-6 w-[90%] max-w-[420px]">
            <h3 className="text-lg font-semibold text-foreground mb-3">Confirm Decline</h3>
            <p className="text-base text-muted-foreground mb-6">
              {usersToDecline.length === 1 
                ? `Are you sure you want to decline ${usersToDecline[0].name}'s registration request?`
                : `Are you sure you want to decline ${usersToDecline.length} registration requests?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDecline}
                className="flex-1 px-5 py-3 bg-card hover:bg-muted text-muted-foreground border border-border rounded-lg text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                className="flex-1 px-5 py-3 bg-destructive hover:bg-destructive-text text-white rounded-lg text-base font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
