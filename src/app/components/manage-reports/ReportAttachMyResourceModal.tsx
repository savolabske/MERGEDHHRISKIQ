import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { LinkableReportResource } from '../../data/reportResourceLink';
import { cn } from '../ui/utils';

interface ReportAttachMyResourceModalProps {
  open: boolean;
  reportTitle: string;
  resources: LinkableReportResource[];
  onClose: () => void;
  onSelect: (resourceId: string) => void;
  onCreateNew: () => void;
}

export function ReportAttachMyResourceModal({
  open,
  reportTitle,
  resources,
  onClose,
  onSelect,
  onCreateNew,
}: ReportAttachMyResourceModalProps) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter((r) => r.title.toLowerCase().includes(q));
  }, [query, resources]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    searchRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
      <div className="bg-card rounded-2xl max-w-[520px] w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="border-b border-border px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">Attach a resource</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Choose from My Resources you created to power{' '}
              <span className="font-medium text-foreground">{reportTitle}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search My Resources..."
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-border rounded-lg bg-card focus:outline-none focus:border-primary"
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                {query.trim()
                  ? 'No matching resources.'
                  : "You don't have any resources of your own yet. Create one in My Resources."}
              </p>
            ) : (
              filtered.map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => onSelect(resource.id)}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm border-b border-border last:border-b-0',
                    'hover:bg-muted transition-colors text-foreground',
                  )}
                >
                  <span className="block truncate font-medium">{resource.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-border px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCreateNew}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-subtle rounded-lg transition-colors"
          >
            Create in My Resources
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
