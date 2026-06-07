import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ResourceUserGroup } from '../../data/resourcesMock';
import { inputClass } from './resourceShared';

interface UserGroupModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialGroup?: ResourceUserGroup | null;
  onClose: () => void;
  onSave: (group: ResourceUserGroup) => void;
}

export function UserGroupModal({
  open,
  mode,
  initialGroup,
  onClose,
  onSave,
}: UserGroupModalProps) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState('');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialGroup) {
      setName(initialGroup.name);
      setMembers([...initialGroup.members]);
    } else {
      setName('');
      setMembers([]);
    }
    setMemberInput('');
  }, [open, mode, initialGroup]);

  if (!open) return null;

  const addMember = () => {
    const email = memberInput.trim();
    if (email && !members.includes(email)) {
      setMembers([...members, email]);
      setMemberInput('');
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      id: initialGroup?.id ?? Date.now().toString(),
      name: trimmedName,
      members,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1500] p-4">
      <div className="bg-card rounded-2xl max-w-md w-full shadow-xl">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {mode === 'create' ? 'Create User Group' : 'Edit User Group'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'create'
              ? 'Create a group to easily share resources with the same team'
              : 'Update the group name or members'}
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team, Research Team"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Members</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMember();
                  }
                }}
                placeholder="Add member email..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={addMember}
                aria-label="Add member"
                className="w-11 h-11 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors shrink-0"
              >
                <Plus size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="mt-3 min-h-[120px] border border-border rounded-lg p-3">
              {members.length === 0 ? (
                <p className="text-sm text-text-subtle text-center py-8">No members added yet</p>
              ) : (
                <ul className="space-y-2">
                  {members.map((email) => (
                    <li
                      key={email}
                      className="flex items-center justify-between text-sm text-foreground"
                    >
                      <span className="truncate">{email}</span>
                      <button
                        type="button"
                        onClick={() => setMembers(members.filter((m) => m !== email))}
                        className="text-muted-foreground hover:text-foreground shrink-0 ml-2"
                        aria-label={`Remove ${email}`}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {mode === 'create' ? 'Create Group' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
