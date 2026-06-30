import { useState } from 'react';
import { Search, Plus, MoreVertical, ChevronLeft, Check, Shield, Users, Trash2, X, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageFooter } from './PageFooter';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: number;
  totalPermissions: number;
  users: number;
  created: string;
  color: string;
  isSystem: boolean;
}

interface Permission {
  module: string;
  section: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// Define which permissions each module supports
const modulePermissions: Record<string, {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  chat?: boolean; // special for New Chat
}> = {
  // MAIN
  'Home': { view: true },
  'Chats': { view: true, delete: true },
  'Resources': { view: true },
  'Maps': { view: true },
  'Reports': { view: true },
  // RISK IQ
  'Dashboard': { view: true },
  'New Chat': { chat: true },
  'Risk iQ Chats': { view: true, delete: true },
  'Risk Matrix': { view: true },
  'Internal Risks': { view: true, create: true, edit: true },
  'Collective Risks': { view: true },
  // ADMIN
  'Admin Dashboard': { view: true },
  'Approvals': { view: true, create: true }, // view + approve/reject as "create"
  'All Users': { view: true, create: true, edit: true },
  'User Groups': { view: true, create: true, edit: true },
  'Roles & Permissions': { view: true, create: true, edit: true },
  'Audit Trail': { view: true },
  'Locations': { view: true, create: true, edit: true },
  'Definitions': { view: true, create: true, edit: true, delete: true },
  'Admin Resources': { view: true, create: true, delete: true },
  'URL Sources': { view: true, create: true, delete: true },
};

function countModuleApplicablePermissions(module: string): number {
  const config = modulePermissions[module];
  if (!config) return 0;
  if (config.chat) return 1;
  return (['view', 'create', 'edit', 'delete'] as const).filter((p) => config[p]).length;
}

const TOTAL_PERMISSIONS = Object.keys(modulePermissions).reduce(
  (sum, module) => sum + countModuleApplicablePermissions(module),
  0,
);

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full unrestricted platform access with system config...',
    permissions: TOTAL_PERMISSIONS,
    totalPermissions: TOTAL_PERMISSIONS,
    users: 3,
    created: 'Jan 1, 2025',
    color: 'var(--destructive-subtle)',
    isSystem: true
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Complete user and content management with audit...',
    permissions: 31,
    totalPermissions: TOTAL_PERMISSIONS,
    users: 5,
    created: 'Jan 1, 2025',
    color: 'var(--destructive-subtle)',
    isSystem: true
  },
  {
    id: '3',
    name: 'Agency',
    description: 'Agency-level data access with document managem...',
    permissions: 12,
    totalPermissions: TOTAL_PERMISSIONS,
    users: 28,
    created: 'Jan 1, 2025',
    color: 'var(--sidebar-accent)',
    isSystem: true
  },
  {
    id: '4',
    name: 'Contributor',
    description: 'Can upload and edit resources with access to dashb...',
    permissions: 7,
    totalPermissions: TOTAL_PERMISSIONS,
    users: 42,
    created: 'Jan 1, 2025',
    color: '#d1fae5',
    isSystem: true
  },
  {
    id: '5',
    name: 'Viewer',
    description: 'Read-only access to dashboards, maps, and shared...',
    permissions: 5,
    totalPermissions: TOTAL_PERMISSIONS,
    users: 70,
    created: 'Jan 1, 2025',
    color: '#f3f4f6',
    isSystem: true
  }
];

type ModuleItem = { module: string; label?: string; disabled?: boolean };

const modules: { section: string; items: ModuleItem[] }[] = [
  {
    section: 'MAIN',
    items: [
      { module: 'Home' },
      { module: 'Chats' },
      { module: 'Resources' },
      { module: 'Maps' },
      { module: 'Reports' },
      { module: 'My Profile', disabled: true },
    ],
  },
  {
    section: 'RISK IQ',
    items: [
      { module: 'Dashboard' },
      { module: 'New Chat' },
      { module: 'Risk iQ Chats', label: 'Chats' },
      { module: 'Risk Matrix' },
      { module: 'Internal Risks' },
      { module: 'Collective Risks' },
    ],
  },
  {
    section: 'ADMIN',
    items: [
      { module: 'Admin Dashboard' },
      { module: 'Approvals' },
      { module: 'All Users' },
      { module: 'User Groups' },
      { module: 'Roles & Permissions' },
      { module: 'Audit Trail' },
      { module: 'Locations' },
      { module: 'Definitions' },
      { module: 'Admin Resources', label: 'Resources' },
      { module: 'URL Sources' },
      { module: 'API' },
    ],
  },
];

function getModuleLabel(item: ModuleItem): string {
  return item.label ?? item.module;
}

export function RolesPermissions() {
  const [roles] = useState<Role[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>('permissions');
  const [isEditing, setIsEditing] = useState(false);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.users.toString().includes(searchQuery.toLowerCase()) ||
    role.created.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProgressColor = (permissions: number, total: number) => {
    const percentage = (permissions / total) * 100;
    if (percentage >= 75) return 'var(--destructive-text)';
    if (percentage >= 25) return 'var(--primary)';
    if (percentage >= 15) return 'var(--success-text)';
    return 'var(--muted-foreground)';
  };

  const getProgressWidth = (permissions: number, total: number) => {
    return `${(permissions / total) * 100}%`;
  };

  const initializePermissions = () => {
    const perms: Permission[] = [];
    modules.forEach(section => {
      section.items.forEach(item => {
        perms.push({
          module: item.module,
          section: section.section,
          view: false,
          create: false,
          edit: false,
          delete: false
        });
      });
    });
    setPermissions(perms);
  };

  const handleCreateRole = () => {
    initializePermissions();
    setShowCreateRole(true);
  };

  const handleBackToRoles = () => {
    setShowCreateRole(false);
    setRoleName('');
    setRoleDescription('');
    setPermissions([]);
  };

  const isPermissionApplicable = (module: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
    const moduleConfig = modulePermissions[module];
    if (!moduleConfig) return false;
    
    // Special case for New Chat - it uses "chat" instead of standard permissions
    if (module === 'New Chat') {
      return permission === 'view'; // We'll use "view" column for "chat" permission
    }
    
    return moduleConfig[permission] === true;
  };

  const togglePermission = (module: string, field: 'view' | 'create' | 'edit' | 'delete') => {
    if (!isPermissionApplicable(module, field)) return;
    
    setPermissions(prev =>
      prev.map(p =>
        p.module === module ? { ...p, [field]: !p[field] } : p
      )
    );
  };

  const toggleModuleRow = (module: string) => {
    const modulePerms = permissions.find(p => p.module === module);
    if (!modulePerms) return;

    // Get applicable permissions for this module
    const applicablePerms = {
      view: isPermissionApplicable(module, 'view'),
      create: isPermissionApplicable(module, 'create'),
      edit: isPermissionApplicable(module, 'edit'),
      delete: isPermissionApplicable(module, 'delete')
    };

    // Check if all applicable permissions are checked
    const allChecked = 
      (!applicablePerms.view || modulePerms.view) &&
      (!applicablePerms.create || modulePerms.create) &&
      (!applicablePerms.edit || modulePerms.edit) &&
      (!applicablePerms.delete || modulePerms.delete);

    setPermissions(prev =>
      prev.map(p =>
        p.module === module
          ? {
              ...p,
              view: !allChecked && applicablePerms.view,
              create: !allChecked && applicablePerms.create,
              edit: !allChecked && applicablePerms.edit,
              delete: !allChecked && applicablePerms.delete
            }
          : p
      )
    );
  };

  const toggleColumnPermissions = (field: 'view' | 'create' | 'edit' | 'delete') => {
    const applicableModules = permissions.filter(p => isPermissionApplicable(p.module, field));
    const allChecked = applicableModules.every(p => p[field]);
    
    setPermissions(prev =>
      prev.map(p => {
        if (isPermissionApplicable(p.module, field)) {
          return { ...p, [field]: !allChecked };
        }
        return p;
      })
    );
  };

  const selectedCount = permissions.reduce((sum, p) => {
    return sum + (p.view ? 1 : 0) + (p.create ? 1 : 0) + (p.edit ? 1 : 0) + (p.delete ? 1 : 0);
  }, 0);

  if (showCreateRole) {
    return (
      <div className="h-full flex flex-col bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 pt-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
              {/* Back Button */}
              <button
                onClick={handleBackToRoles}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={16} />
                Back to Roles
              </button>

              {/* Header */}
              <div>
                <h2 className="text-page-title mb-1">Create New Role</h2>
                <p className="text-sm sm:text-sm text-muted-foreground">
                  Define a role name and configure module-level permissions
                </p>
              </div>

              {/* Role Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block table-header-label mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Field Coordinator"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block table-header-label mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="Brief description of this role's purpose"
                      className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Table */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="table-header-label">Module Permissions</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">{selectedCount}</span> of {TOTAL_PERMISSIONS} permissions selected
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/70">
                        <th className="text-left px-6 py-3 table-header-label w-[40%]">
                          Module
                        </th>
                        <th className="text-center px-3 py-3 table-header-label w-[12%]">
                          <button onClick={() => toggleColumnPermissions('view')} className="hover:text-primary transition-colors">
                            View
                          </button>
                        </th>
                        <th className="text-center px-3 py-3 table-header-label w-[12%]">
                          <button onClick={() => toggleColumnPermissions('create')} className="hover:text-primary transition-colors">
                            Create
                          </button>
                        </th>
                        <th className="text-center px-3 py-3 table-header-label w-[12%]">
                          <button onClick={() => toggleColumnPermissions('edit')} className="hover:text-primary transition-colors">
                            Edit
                          </button>
                        </th>
                        <th className="text-center px-3 py-3 table-header-label w-[12%]">
                          <button onClick={() => toggleColumnPermissions('delete')} className="hover:text-primary transition-colors">
                            Delete
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((section) => (
                        <>
                          {/* Section Header */}
                          <tr key={section.section}>
                            <td colSpan={5} className="px-6 py-2.5 bg-muted/70 border-t border-b border-border">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                <span className="table-header-label text-foreground">
                                  {section.section}
                                </span>
                              </div>
                            </td>
                          </tr>
                          {/* Section Items */}
                          {section.items.map((item) => {
                            const perm = permissions.find(p => p.module === item.module);
                            if (!perm) return null;

                            const viewApplicable = isPermissionApplicable(item.module, 'view');
                            const createApplicable = isPermissionApplicable(item.module, 'create');
                            const editApplicable = isPermissionApplicable(item.module, 'edit');
                            const deleteApplicable = isPermissionApplicable(item.module, 'delete');

                            return (
                              <tr key={item.module} className="border-b border-border hover:bg-surface-row-hover transition-colors">
                                <td className="px-6 py-2.5">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={perm.view && perm.create && perm.edit && perm.delete}
                                      onChange={() => toggleModuleRow(item.module)}
                                      disabled={item.disabled}
                                      className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <span className={`table-value-text ${item.disabled ? 'text-text-subtle' : ''}`}>
                                      {getModuleLabel(item)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  {viewApplicable ? (
                                    <input
                                      type="checkbox"
                                      checked={perm.view}
                                      onChange={() => togglePermission(item.module, 'view')}
                                      disabled={item.disabled}
                                      className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                  ) : (
                                    <span className="text-border-muted text-sm">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  {createApplicable ? (
                                    <input
                                      type="checkbox"
                                      checked={perm.create}
                                      onChange={() => togglePermission(item.module, 'create')}
                                      disabled={item.disabled}
                                      className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                  ) : (
                                    <span className="text-border-muted text-sm">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  {editApplicable ? (
                                    <input
                                      type="checkbox"
                                      checked={perm.edit}
                                      onChange={() => togglePermission(item.module, 'edit')}
                                      disabled={item.disabled}
                                      className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                  ) : (
                                    <span className="text-border-muted text-sm">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  {deleteApplicable ? (
                                    <input
                                      type="checkbox"
                                      checked={perm.delete}
                                      onChange={() => togglePermission(item.module, 'delete')}
                                      disabled={item.disabled}
                                      className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                  ) : (
                                    <span className="text-border-muted text-sm">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-border">
                  {modules.map((section) => (
                    <div key={section.section} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <span className="table-header-label text-foreground">
                          {section.section}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {section.items.map((item) => {
                          const perm = permissions.find(p => p.module === item.module);
                          if (!perm) return null;

                          return (
                            <div key={item.module} className="space-y-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={perm.view && perm.create && perm.edit && perm.delete}
                                  onChange={() => toggleModuleRow(item.module)}
                                  disabled={item.disabled}
                                  className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className={`text-sm font-medium ${item.disabled ? 'text-text-subtle' : 'text-foreground'}`}>
                                  {getModuleLabel(item)}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 ml-7">
                                {(['view', 'create', 'edit', 'delete'] as const).map((field) => {
                                  const isApplicable = isPermissionApplicable(item.module, field);
                                  return (
                                    <label key={field} className={`flex flex-col items-center gap-1 ${isApplicable ? 'cursor-pointer' : 'opacity-30'}`}>
                                      {isApplicable ? (
                                        <input
                                          type="checkbox"
                                          checked={perm[field]}
                                          onChange={() => togglePermission(item.module, field)}
                                          disabled={item.disabled}
                                          className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                        />
                                      ) : (
                                        <span className="w-4 h-4 text-border-muted text-xs flex items-center justify-center">—</span>
                                      )}
                                      <span className="text-xs text-muted-foreground capitalize">{field}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">{selectedCount}</span> permissions configured
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToRoles}
                      className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      disabled={!roleName.trim()}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        roleName.trim()
                          ? 'bg-primary hover:bg-primary-hover text-white'
                          : 'bg-muted text-text-subtle cursor-not-allowed'
                      }`}
                    >
                      <Check size={16} />
                      Create Role
                    </button>
                  </div>
                </div>
              </div>
              <PageFooter />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-page-title mb-1">Roles & Permissions</h2>
          <p className="text-sm sm:text-sm text-muted-foreground">
            {roles.length} roles defined · {TOTAL_PERMISSIONS} permissions across {modules.length} sections
          </p>
        </div>
        <button
          onClick={handleCreateRole}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
        <input
          type="text"
          placeholder="Search roles and permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Roles Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Table Header - Desktop */}
        <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
          <div className="col-span-4 table-header-label">
            Role
          </div>
          <div className="col-span-2 table-header-label">
            Users
          </div>
          <div className="col-span-3 table-header-label">
            Permissions
          </div>
          <div className="col-span-2 table-header-label">
            Created
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="table-row-standard grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 transition-colors cursor-pointer"
              onClick={() => setViewingRole(role)}
            >
              {/* Role Info */}
              <div className="lg:col-span-4">
                <div className="table-header-label mb-1 lg:hidden">Role</div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="table-primary-text">{role.name}</h3>
                      {role.isSystem && (
                        <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs font-medium rounded">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <p className="table-supporting-text mt-0.5 line-clamp-1" title={role.description}>{role.description}</p>
                  </div>
                </div>
              </div>

              {/* Users */}
              <div className="lg:col-span-2">
                <div className="table-header-label mb-1 lg:hidden">Users</div>
                <div className="flex items-center gap-2">
                  <Users className="text-text-subtle" size={16} />
                  <span className="table-numeric-text">{role.users}</span>
                </div>
              </div>

              {/* Permissions */}
              <div className="lg:col-span-3">
                <div className="table-header-label mb-1 lg:hidden">Permissions</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: getProgressWidth(role.permissions, role.totalPermissions),
                          backgroundColor: getProgressColor(role.permissions, role.totalPermissions)
                        }}
                      />
                    </div>
                  </div>
                  <span className="table-numeric-text">
                    {role.permissions}/{role.totalPermissions}
                  </span>
                </div>
              </div>

              {/* Created */}
              <div className="lg:col-span-2">
                <div className="table-header-label mb-1 lg:hidden">Created</div>
                <span className="table-metadata-text">{role.created}</span>
              </div>

              {/* Actions */}
              <div className="lg:col-span-1 flex items-center justify-end relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === role.id ? null : role.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                >
                  <MoreVertical size={18} className="text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === role.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-0 top-10 z-20 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          // Edit role functionality
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <Shield size={16} />
                        Edit Role
                      </button>
                      {!role.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            if (confirm(`Delete role "${role.name}"? This will affect ${role.users} user(s).`)) {
                              // Delete role functionality
                            }
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-destructive-text hover:bg-destructive-subtle transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete Role
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No roles found</p>
          </div>
        )}
      </div>

      {/* View Role Detail Modal */}
      {viewingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: viewingRole.color }}
                >
                  <Shield size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-foreground">{viewingRole.name}</h3>
                    {viewingRole.isSystem && (
                      <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs font-medium rounded">
                        SYSTEM
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Full unrestricted platform access with system configuration capabilities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewingRole(null);
                    setIsEditing(true);
                    setShowCreateRole(true);
                    toast.success('Opening edit mode...');
                  }}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => setViewingRole(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-primary" />
                  <span className="text-primary font-medium">{viewingRole.users} users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={16} className="text-destructive-text" />
                  <span className="text-destructive-text font-medium">{viewingRole.permissions}/{viewingRole.totalPermissions} permissions</span>
                </div>
                <div className="text-muted-foreground">{viewingRole.created}</div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-border">
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`px-1 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'permissions'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Permissions
                  {activeTab === 'permissions' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-1 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === 'users'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Users
                  <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground text-xs font-medium rounded">
                    0
                  </span>
                  {activeTab === 'users' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'permissions' && (
                <div className="space-y-4">
                  <h4 className="table-header-label">Module Permissions</h4>
                  
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/70 border-b border-border">
                          <th className="text-left px-4 py-3 table-header-label">Module</th>
                          <th className="text-center px-3 py-3 table-header-label">View</th>
                          <th className="text-center px-3 py-3 table-header-label">Create</th>
                          <th className="text-center px-3 py-3 table-header-label">Edit</th>
                          <th className="text-center px-3 py-3 table-header-label">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modules.map((section) => (
                          <>
                            {/* Section Header */}
                            <tr key={section.section}>
                              <td colSpan={5} className="px-4 py-2.5 bg-muted/70 border-y border-border">
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-4 bg-primary rounded-full" />
                                  <span className="table-header-label text-foreground">
                                    {section.section}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {/* Section Items */}
                            {section.items.map((item) => {
                              const viewApplicable = isPermissionApplicable(item.module, 'view');
                              const createApplicable = isPermissionApplicable(item.module, 'create');
                              const editApplicable = isPermissionApplicable(item.module, 'edit');
                              const deleteApplicable = isPermissionApplicable(item.module, 'delete');
                              
                              // For Super Admin, show all permissions as checked
                              const isChecked = viewingRole.id === '1';

                              return (
                                <tr key={item.module} className="border-b border-border last:border-b-0 hover:bg-surface-row-hover transition-colors">
                                  <td className="px-4 py-2.5 table-value-text">{getModuleLabel(item)}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    {viewApplicable ? (
                                      <Check size={18} className="mx-auto text-success-text" />
                                    ) : (
                                      <span className="text-border-muted">—</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    {createApplicable && isChecked ? (
                                      <Check size={18} className="mx-auto text-success-text" />
                                    ) : (
                                      <span className="text-border-muted">—</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    {editApplicable && isChecked ? (
                                      <Check size={18} className="mx-auto text-success-text" />
                                    ) : (
                                      <span className="text-border-muted">—</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    {deleteApplicable && isChecked ? (
                                      <Check size={18} className="mx-auto text-success-text" />
                                    ) : (
                                      <span className="text-border-muted">—</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No users assigned to this role yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
