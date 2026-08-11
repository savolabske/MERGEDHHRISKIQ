import { useState } from 'react';
import { Plus, Settings2, MoreVertical } from 'lucide-react';
import type { ManagedWorkflow } from '../../data/workflowAdminMock';
import { PageScrollShell } from '../PageScrollShell';
import { Button } from '../ui/button';
import {
  ListPageHeader,
  ListPageSearch,
  listHeaderActionClass,
  listRowClass,
} from '../ui/list-page';
import { cn } from '../ui/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ManageWorkflowsListProps {
  workflows: ManagedWorkflow[];
  onConfigure: (id: string) => void;
}

export function ManageWorkflowsList({ workflows, onConfigure }: ManageWorkflowsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = workflows.filter(
    (w) =>
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const closeMenu = () => setOpenMenuId(null);

  return (
    <PageScrollShell innerClassName="space-y-6">
      <ListPageHeader
        title="Manage Workflows"
        subtitle="Configure audit programmes, linked documents, and access permissions for each workflow"
        action={
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(listHeaderActionClass, 'inline-block')}>
                  <Button
                    type="button"
                    disabled
                    className={cn(listHeaderActionClass, 'pointer-events-none')}
                  >
                    <Plus size={18} />
                    Create workflow
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                sideOffset={8}
                variant="muted"
                showArrow={false}
                className="rounded-lg px-3 py-1.5 text-sm"
              >
                Coming soon
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      />

      <ListPageSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search workflows..."
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
          <div className="col-span-5 table-header-label">Name</div>
          <div className="col-span-2 table-header-label">Status</div>
          <div className="col-span-2 table-header-label">Audits</div>
          <div className="col-span-1 table-header-label">Last updated</div>
          <div className="col-span-2 table-header-label text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((workflow, index) => (
            <div
              key={workflow.id}
              onClick={() => onConfigure(workflow.id)}
              className={cn(listRowClass, 'relative cursor-pointer')}
            >
              <div className="lg:col-span-5 min-w-0 pr-10 lg:pr-0">
                <p className="table-primary-text truncate">{workflow.name}</p>
                <p className="table-supporting-text truncate mt-0.5">
                  {workflow.description || 'No description'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 lg:hidden">
                  <StatusBadge status={workflow.status} />
                  <span className="table-metadata-text">{workflow.audits.length} audits</span>
                  <span className="table-metadata-text">{workflow.updatedAt}</span>
                </div>
              </div>

              <div className="hidden lg:flex lg:col-span-2 items-center">
                <StatusBadge status={workflow.status} />
              </div>

              <div className="hidden lg:flex lg:col-span-2 items-center">
                <span className="table-supporting-text">{workflow.audits.length} audits</span>
              </div>

              <div className="hidden lg:flex lg:col-span-1 items-center">
                <span className="table-supporting-text">{workflow.updatedAt}</span>
              </div>

              <div
                className="absolute top-3 right-3 lg:static lg:col-span-2 flex items-center lg:justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === workflow.id ? null : workflow.id);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    aria-label="Workflow actions"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === workflow.id && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10"
                        aria-label="Close menu"
                        onClick={closeMenu}
                      />
                      <div
                        className={cn(
                          'absolute right-0 z-20 w-44 bg-card border border-border rounded-lg shadow-lg py-1',
                          index === filtered.length - 1 ? 'bottom-full mb-1' : 'top-full mt-1',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onConfigure(workflow.id);
                            closeMenu();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          <Settings2 size={14} />
                          Configure
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No workflows found</p>
          </div>
        )}
      </div>
    </PageScrollShell>
  );
}

function StatusBadge({ status }: { status: ManagedWorkflow['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
        status === 'live'
          ? 'bg-success-subtle text-success-text'
          : 'bg-warning-subtle text-warning-text',
      )}
    >
      {status === 'live' ? 'Live' : 'Draft'}
    </span>
  );
}
