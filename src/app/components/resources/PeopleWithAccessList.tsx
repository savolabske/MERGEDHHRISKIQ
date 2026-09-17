import { Users, User, X } from 'lucide-react';
import {
  RESOURCE_ACCESS_ROLE_LABEL,
  RESOURCE_ACCESS_ROLES,
  type ResourceAccessRole,
  type ResourceGroupAccess,
  type ResourceUserAccess,
} from '../../data/resourcesMock';
import { chipRemoveClass } from '../ui/interaction';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

function RoleSelect({
  value,
  onChange,
  label,
}: {
  value: ResourceAccessRole;
  onChange: (role: ResourceAccessRole) => void;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as ResourceAccessRole)}>
      <SelectTrigger
        size="sm"
        aria-label={label}
        className="w-[7.5rem] shrink-0 gap-2 rounded-lg border-border bg-card px-3 text-xs font-medium shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="end"
        className="min-w-[7.5rem] rounded-lg border-border bg-card shadow-md"
      >
        {RESOURCE_ACCESS_ROLES.map((role) => (
          <SelectItem key={role} value={role} className="text-xs">
            {RESOURCE_ACCESS_ROLE_LABEL[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface PeopleWithAccessListProps {
  userGroups: ResourceGroupAccess[];
  individualUsers: ResourceUserAccess[];
  onChangeGroupRole: (name: string, role: ResourceAccessRole) => void;
  onRemoveGroup: (name: string) => void;
  onChangeUserRole: (email: string, role: ResourceAccessRole) => void;
  onRemoveUser: (email: string) => void;
}

export function PeopleWithAccessList({
  userGroups,
  individualUsers,
  onChangeGroupRole,
  onRemoveGroup,
  onChangeUserRole,
  onRemoveUser,
}: PeopleWithAccessListProps) {
  if (userGroups.length === 0 && individualUsers.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-1">People with access</p>
      <p className="text-xs text-muted-foreground mb-2">
        Set whether each person or group can view or edit this resource.
      </p>
      <ul className="rounded-lg border border-border divide-y divide-border overflow-hidden">
        {userGroups.map((group) => (
          <li
            key={`group-${group.name}`}
            className="flex items-center gap-2 px-3 py-2.5 bg-card"
          >
            <span className="w-8 h-8 rounded-full bg-success-subtle flex items-center justify-center shrink-0">
              <Users size={14} className="text-success-text" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{group.name}</p>
              <p className="text-xs text-muted-foreground">Group</p>
            </div>
            <RoleSelect
              value={group.role}
              onChange={(role) => onChangeGroupRole(group.name, role)}
              label={`Permission for ${group.name}`}
            />
            <button
              type="button"
              onClick={() => onRemoveGroup(group.name)}
              className={chipRemoveClass}
              aria-label={`Remove group ${group.name}`}
            >
              <X size={14} />
            </button>
          </li>
        ))}
        {individualUsers.map((user) => (
          <li
            key={`user-${user.email}`}
            className="flex items-center gap-2 px-3 py-2.5 bg-card"
          >
            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User size={14} className="text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Individual</p>
            </div>
            <RoleSelect
              value={user.role}
              onChange={(role) => onChangeUserRole(user.email, role)}
              label={`Permission for ${user.email}`}
            />
            <button
              type="button"
              onClick={() => onRemoveUser(user.email)}
              className={chipRemoveClass}
              aria-label={`Remove ${user.email}`}
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResourceAccessRoleBadge({ role }: { role: ResourceAccessRole }) {
  return (
    <span className="shrink-0 text-xs font-medium text-muted-foreground">
      {RESOURCE_ACCESS_ROLE_LABEL[role]}
    </span>
  );
}
