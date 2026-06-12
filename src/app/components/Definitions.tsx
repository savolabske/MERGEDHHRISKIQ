import { useState } from 'react';
import { Plus, X, Search, FileText, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { PageScrollShell } from './PageScrollShell';

interface Definition {
  id: string;
  shortForm: string;
  expandedForm: string;
  type: 'acronym' | 'context';
  dateAdded: string;
  usageCount: number;
}

const mockDefinitions: Definition[] = [
  {
    id: '1',
    shortForm: 'IPC',
    expandedForm: 'Integrated Food Security Phase Classification',
    type: 'acronym',
    dateAdded: 'Mar 1, 2026',
    usageCount: 342
  },
  {
    id: '2',
    shortForm: 'OCHA',
    expandedForm: 'United Nations Office for the Coordination of Humanitarian Affairs',
    type: 'acronym',
    dateAdded: 'Mar 1, 2026',
    usageCount: 287
  },
  {
    id: '3',
    shortForm: 'HRP',
    expandedForm: 'Humanitarian Response Plan',
    type: 'acronym',
    dateAdded: 'Feb 28, 2026',
    usageCount: 156
  },
  {
    id: '4',
    shortForm: 'FEWS NET',
    expandedForm: 'Famine Early Warning Systems Network',
    type: 'acronym',
    dateAdded: 'Feb 28, 2026',
    usageCount: 98
  },
  {
    id: '5',
    shortForm: 'NFI',
    expandedForm: 'Non-Food Items',
    type: 'acronym',
    dateAdded: 'Feb 25, 2026',
    usageCount: 76
  },
  {
    id: '6',
    shortForm: 'WASH',
    expandedForm: 'Water, Sanitation and Hygiene',
    type: 'acronym',
    dateAdded: 'Feb 25, 2026',
    usageCount: 124
  },
  {
    id: '8',
    shortForm: 'AMISOM',
    expandedForm: 'African Union Mission in Somalia',
    type: 'acronym',
    dateAdded: 'Feb 18, 2026',
    usageCount: 89
  }
];

export function Definitions() {
  const [definitions, setDefinitions] = useState<Definition[]>(mockDefinitions);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<Definition | null>(null);
  const [selectedDefinitions, setSelectedDefinitions] = useState<Set<string>>(new Set());
  
  // Form state
  const [shortForm, setShortForm] = useState('');
  const [expandedForm, setExpandedForm] = useState('');

  const filteredDefinitions = definitions.filter(def =>
    def.shortForm.toLowerCase().includes(searchQuery.toLowerCase()) ||
    def.expandedForm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDefinition = () => {
    if (!shortForm.trim() || !expandedForm.trim()) {
      toast.error('Please fill in both Name and Description');
      return;
    }

    const isContext = shortForm.includes('<') && shortForm.includes('>');
    
    const newDefinition: Definition = {
      id: Date.now().toString(),
      shortForm: shortForm.trim(),
      expandedForm: expandedForm.trim(),
      type: isContext ? 'context' : 'acronym',
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      usageCount: 0
    };

    setDefinitions([newDefinition, ...definitions]);
    toast.success('Definition added successfully');
    
    // Reset form
    setShortForm('');
    setExpandedForm('');
    setShowAddModal(false);
  };

  const handleEditDefinition = (definition: Definition) => {
    setEditingDefinition(definition);
    setShortForm(definition.shortForm);
    setExpandedForm(definition.expandedForm);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!shortForm.trim() || !expandedForm.trim() || !editingDefinition) {
      toast.error('Please fill in both Name and Description');
      return;
    }

    const isContext = shortForm.includes('<') && shortForm.includes('>');

    const updatedDefinitions = definitions.map(def =>
      def.id === editingDefinition.id
        ? {
            ...def,
            shortForm: shortForm.trim(),
            expandedForm: expandedForm.trim(),
            type: isContext ? 'context' : 'acronym' as 'acronym' | 'context'
          }
        : def
    );

    setDefinitions(updatedDefinitions);
    toast.success('Definition updated successfully');
    
    // Reset form
    setShortForm('');
    setExpandedForm('');
    setEditingDefinition(null);
    setShowEditModal(false);
  };

  const handleRemoveDefinition = (id: string) => {
    toast.promise(
      Promise.resolve().then(() => {
        setDefinitions(prev => prev.filter(d => d.id !== id));
      }),
      {
        loading: 'Removing definition...',
        success: 'Definition removed successfully.',
        error: 'We could not remove this definition. Please try again.',
      }
    );
  };

  const toggleSelectDefinition = (id: string) => {
    const newSelected = new Set(selectedDefinitions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDefinitions(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDefinitions.size === filteredDefinitions.length) {
      setSelectedDefinitions(new Set());
    } else {
      setSelectedDefinitions(new Set(filteredDefinitions.map(d => d.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedDefinitions.size;
    toast.promise(
      Promise.resolve().then(() => {
        setDefinitions(prev => prev.filter(d => !selectedDefinitions.has(d.id)));
        setSelectedDefinitions(new Set());
      }),
      {
        loading: `Deleting ${count} definition${count > 1 ? 's' : ''}...`,
        success: `${count} definition${count > 1 ? 's' : ''} deleted successfully.`,
        error: 'We could not delete the selected definitions. Please try again.',
      }
    );
  };

  return (
    <>
    <PageScrollShell innerClassName="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-page-title mb-1">Context Definitions</h2>
                <p className="text-sm sm:text-sm text-muted-foreground">
                  Manage acronyms and context replacements for AI chat
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus size={18} />
                Add Definition
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                <input
                  type="text"
                  placeholder="Search definitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Definitions Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Bulk Actions Bar */}
              {selectedDefinitions.size > 0 && (
                <div className="px-6 py-3 bg-surface-subtle border-b border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    {selectedDefinitions.size} definition{selectedDefinitions.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </button>
                </div>
              )}

              {/* Table Header */}
              <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
                <div className="col-span-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedDefinitions.size === filteredDefinitions.length && filteredDefinitions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                  />
                  <span className="table-header-label">Name</span>
                </div>
                <div className="col-span-7 table-header-label">
                  Description
                </div>
                <div className="col-span-2 table-header-label text-right">
                  Actions
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {filteredDefinitions.map((definition) => (
                  <div key={definition.id} className="table-row-narrative grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 transition-colors">
                    {/* Checkbox & Name */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDefinitions.has(definition.id)}
                        onChange={() => toggleSelectDefinition(definition.id)}
                        className="hidden lg:block w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                      />
                      <div>
                        <div className="table-header-label mb-1 lg:hidden">Name</div>
                        <span className="table-primary-text">
                          {definition.shortForm}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-7">
                      <div className="table-header-label mb-1 lg:hidden">Description</div>
                      <div className="table-value-text">
                        {definition.expandedForm}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2 flex items-center gap-2 lg:justify-end">
                      <button 
                        onClick={() => handleEditDefinition(definition)}
                        className="px-3 py-1.5 border border-border bg-card hover:bg-info-subtle hover:border-info-subtle hover:text-info rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        title="Edit definition"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRemoveDefinition(definition.id)}
                        className="px-3 py-1.5 border border-border bg-card hover:bg-destructive-subtle hover:border-destructive hover:text-destructive-text rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        title="Remove definition"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDefinitions.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No definitions found</p>
                </div>
              )}
            </div>
    </PageScrollShell>

      {/* Add Definition Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add Definition</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Create an acronym or context replacement</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-destructive-text">*</span>
                </label>
                <input
                  type="text"
                  value={shortForm}
                  onChange={(e) => setShortForm(e.target.value)}
                  placeholder="e.g. IPC, OCHA, HRP"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  The term, acronym, or tag the AI should recognize.
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-destructive-text">*</span>
                </label>
                <textarea
                  value={expandedForm}
                  onChange={(e) => setExpandedForm(e.target.value)}
                  placeholder="e.g. Integrated Food Security Phase Classification"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  This explanation will be used by the AI to interpret the term correctly.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDefinition}
                disabled={!shortForm.trim() || !expandedForm.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  shortForm.trim() && expandedForm.trim()
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-muted text-text-subtle cursor-not-allowed'
                }`}
              >
                Add Definition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Definition Modal */}
      {showEditModal && editingDefinition && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Edit Definition</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Update an acronym or context replacement</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-destructive-text">*</span>
                </label>
                <input
                  type="text"
                  value={shortForm}
                  onChange={(e) => setShortForm(e.target.value)}
                  placeholder="e.g. IPC, OCHA, HRP"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  The term, acronym, or tag the AI should recognize.
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-destructive-text">*</span>
                </label>
                <textarea
                  value={expandedForm}
                  onChange={(e) => setExpandedForm(e.target.value)}
                  placeholder="e.g. Integrated Food Security Phase Classification"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  This explanation will be used by the AI to interpret the term correctly.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!shortForm.trim() || !expandedForm.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  shortForm.trim() && expandedForm.trim()
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-muted text-text-subtle cursor-not-allowed'
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
