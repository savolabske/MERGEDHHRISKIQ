import { Plus, Search, SlidersHorizontal, Grid2X2, List } from 'lucide-react';
import { useState } from 'react';
import { AddResourceModal } from './AddResourceModal';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
}

const resourceItems: ResourceItem[] = [
  {
    id: '1',
    title: 'Standard Operating Procedures - RMU Somalia',
    description: 'Standardized protocols for mission risk assessments and security protocols across Somalia field offices.',
    lastUpdated: 'Last updated Oct 12, 2023'
  },
  {
    id: '2',
    title: 'Quarterly Security Assessment Data Q3 2024',
    description: 'Consolidated security metrics and trend analysis for the current operational quarter.',
    lastUpdated: 'Last updated yesterday'
  },
  {
    id: '3',
    title: 'Mogadishu Field Office Intelligence Pack',
    description: 'Critical intel and contact lists for Mogadishu operations, including district-level maps.',
    lastUpdated: 'Last updated 3 days ago'
  },
  {
    id: '4',
    title: 'District Access Map Overlay - Baidoa',
    description: 'High-resolution geospatial data showing restricted and open corridors within the Baidoa district.',
    lastUpdated: 'Last updated Oct 06, 2023'
  },
  {
    id: '5',
    title: 'Annual Risk Mitigation Strategy 2024-2025',
    description: 'Long-term strategic objectives for systemic risk reduction across Somalia mission portfolio.',
    lastUpdated: 'Last updated Sep 28, 2023'
  }
];

interface ResourcesProps {
  onResourceClick?: (resourceId: string) => void;
}

export function Resources({ onResourceClick }: ResourcesProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-16 pt-12 pb-8">
        <h1 className="text-3xl font-semibold text-foreground">Resources</h1>
        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          onClick={() => setIsAddResourceModalOpen(true)}
        >
          <Plus size={16} strokeWidth={2} />
          <span className="font-semibold text-sm">Add Resource</span>
        </button>
      </div>

      {/* Search Bar with Filters */}
      <div className="px-16 pb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full h-[48px] pl-12 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 h-[48px] bg-card border border-border rounded-lg hover:bg-muted transition-colors">
            <SlidersHorizontal size={16} className="text-muted-foreground" strokeWidth={2} />
            <span className="text-sm font-medium text-muted-foreground">Filter</span>
          </button>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
                viewMode === 'grid' ? 'bg-primary' : 'hover:bg-secondary'
              }`}
            >
              <Grid2X2 size={16} className={viewMode === 'grid' ? 'text-white' : 'text-muted-foreground'} strokeWidth={2} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
                viewMode === 'list' ? 'bg-primary' : 'hover:bg-secondary'
              }`}
            >
              <List size={16} className={viewMode === 'list' ? 'text-white' : 'text-muted-foreground'} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Resources Content */}
      <div className="flex-1 px-16 pb-12 overflow-y-auto">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceItems.map((item) => (
              <button
                key={item.id}
                className="text-left p-6 border border-border rounded-xl hover:border-primary hover:bg-card hover:shadow-sm transition-all group"
                onClick={() => onResourceClick?.(item.id)}
              >
                <h3 className="font-semibold text-base text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {item.description}
                </p>
                <p className="text-xs text-text-subtle">{item.lastUpdated}</p>
              </button>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-border">
            {resourceItems.map((item) => (
              <button
                key={item.id}
                className="w-full text-left py-6 transition-all group"
                onClick={() => onResourceClick?.(item.id)}
              >
                <h3 className="font-semibold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-text-subtle">{item.lastUpdated}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isAddResourceModalOpen}
        onClose={() => setIsAddResourceModalOpen(false)}
      />
    </div>
  );
}