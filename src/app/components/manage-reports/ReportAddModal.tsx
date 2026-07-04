import { X } from 'lucide-react';
import { useState } from 'react';
import { inputClass, textareaClass } from '../resources/resourceShared';
import { ReportUserGroupSelect } from './ReportUserGroupSelect';

interface ReportAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; description: string; userGroups: string[] }) => void;
}

export function ReportAddModal({ open, onClose, onCreate }: ReportAddModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userGroups, setUserGroups] = useState<string[]>([]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate({ title, description, userGroups });
    setTitle('');
    setDescription('');
    setUserGroups([]);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setUserGroups([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
      <div className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Add report</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create a new report shell with placeholder sections
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5 overflow-y-auto flex-1 min-h-0">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title <span className="text-destructive-text">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aid Flow Intelligence"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this report's purpose..."
              rows={3}
              className={textareaClass}
            />
          </div>

          <ReportUserGroupSelect
            selected={userGroups}
            onChange={setUserGroups}
            placement="above"
          />
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create report
          </button>
        </div>
      </div>
    </div>
  );
}
