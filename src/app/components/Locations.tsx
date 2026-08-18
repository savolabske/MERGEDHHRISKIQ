import { useState } from 'react';
import { Plus, X, MapPin, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PageScrollShell } from './PageScrollShell';
import { ConfirmDeleteDialog } from './ui/ConfirmDeleteDialog';
import { Button } from './ui/button';
import {
  ListPageHeader,
  ListPageSearch,
  listHeaderActionClass,
  listRowClass,
} from './ui/list-page';

interface Location {
  id: string;
  name: string;
  level: string;
  latitude: number;
  longitude: number;
  dateAdded: string;
}

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Mogadishu',
    level: 'City',
    latitude: 2.0469,
    longitude: 45.3182,
    dateAdded: 'Mar 1, 2026'
  },
  {
    id: '2',
    name: 'Baidoa',
    level: 'City',
    latitude: 3.1136,
    longitude: 43.6498,
    dateAdded: 'Mar 1, 2026'
  },
  {
    id: '3',
    name: 'Lower Shabelle',
    level: 'Region',
    latitude: 1.8766,
    longitude: 44.2349,
    dateAdded: 'Feb 28, 2026'
  },
  {
    id: '4',
    name: 'Kismayo',
    level: 'City',
    latitude: -0.3582,
    longitude: 42.5454,
    dateAdded: 'Feb 28, 2026'
  },
  {
    id: '5',
    name: 'Bay Region',
    level: 'Region',
    latitude: 3.0167,
    longitude: 43.7167,
    dateAdded: 'Feb 25, 2026'
  },
  {
    id: '6',
    name: 'Garowe',
    level: 'City',
    latitude: 8.4020,
    longitude: 48.4846,
    dateAdded: 'Feb 25, 2026'
  },
  {
    id: '7',
    name: 'Afgooye',
    level: 'District',
    latitude: 2.1389,
    longitude: 45.1214,
    dateAdded: 'Feb 20, 2026'
  },
  {
    id: '8',
    name: 'Middle Shabelle',
    level: 'Region',
    latitude: 2.5833,
    longitude: 45.5000,
    dateAdded: 'Feb 20, 2026'
  },
  {
    id: '9',
    name: 'Jowhar',
    level: 'City',
    latitude: 2.7697,
    longitude: 45.5031,
    dateAdded: 'Feb 18, 2026'
  },
  {
    id: '10',
    name: 'Galmudug State',
    level: 'State',
    latitude: 5.5333,
    longitude: 46.8333,
    dateAdded: 'Feb 15, 2026'
  }
];

const levels = ['City', 'District', 'Region', 'State', 'Country'];

export function Locations() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.latitude.toString().includes(searchQuery.toLowerCase()) ||
    loc.longitude.toString().includes(searchQuery.toLowerCase()) ||
    loc.dateAdded.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLocation = () => {
    if (!name.trim() || !level || !latitude.trim() || !longitude.trim()) return;

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) return;
    if (lat < -90 || lat > 90) return;
    if (lng < -180 || lng > 180) return;

    const newLocation: Location = {
      id: Date.now().toString(),
      name: name.trim(),
      level,
      latitude: lat,
      longitude: lng,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setLocations([newLocation, ...locations]);
    toast.success('Location added successfully');
    
    // Reset form
    setName('');
    setLevel('');
    setLatitude('');
    setLongitude('');
    setShowAddModal(false);
  };

  const handleDeleteLocation = (id: string) => {
    toast.promise(
      Promise.resolve().then(() => {
        setLocations(prev => prev.filter(loc => loc.id !== id));
      }),
      {
        loading: 'Deleting location...',
        success: 'Location deleted successfully.',
        error: 'We could not delete this location. Please try again.',
      }
    );
  };

  return (
    <>
    <PageScrollShell innerClassName="space-y-6">
            <ListPageHeader
              title="Locations"
              subtitle="Manage geographic locations for risk tracking and analysis"
              action={
                <Button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className={listHeaderActionClass}
                >
                  <Plus size={18} />
                  Add Location
                </Button>
              }
            />

            <ListPageSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search locations..."
            />

            {/* Locations Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
                <div className="col-span-3 table-header-label">
                  Location Name
                </div>
                <div className="col-span-2 table-header-label">
                  Level
                </div>
                <div className="col-span-2 table-header-label text-right">
                  Latitude
                </div>
                <div className="col-span-2 table-header-label text-right">
                  Longitude
                </div>
                <div className="col-span-2 table-header-label">
                  Date Added
                </div>
                <div className="col-span-1 table-header-label text-right">
                  Actions
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {filteredLocations.map((location) => (
                  <div key={location.id} className={`${listRowClass} relative`}>
                    {/* Mobile compact */}
                    <div className="lg:hidden flex items-start gap-3 pr-10">
                      <div className="w-9 h-9 bg-sidebar-accent rounded-lg flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="table-primary-text">{location.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <span className="table-status-text inline-flex items-center px-2 py-0.5 bg-secondary text-muted-foreground rounded-md">
                            {location.level}
                          </span>
                          <span className="table-metadata-text font-mono">
                            {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                          </span>
                          <span className="table-metadata-text">{location.dateAdded}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop columns */}
                    <div className="hidden lg:flex lg:col-span-3 items-center gap-3">
                      <div className="w-10 h-10 bg-sidebar-accent rounded-lg flex items-center justify-center shrink-0">
                        <MapPin size={20} className="text-primary" />
                      </div>
                      <h3 className="table-primary-text">{location.name}</h3>
                    </div>

                    <div className="hidden lg:flex lg:col-span-2 items-center">
                      <span className="table-status-text inline-flex items-center px-2.5 py-1 bg-secondary text-muted-foreground rounded-md">
                        {location.level}
                      </span>
                    </div>

                    <div className="hidden lg:flex lg:col-span-2 items-center lg:justify-end">
                      <span className="table-numeric-text font-mono">{location.latitude.toFixed(4)}°</span>
                    </div>

                    <div className="hidden lg:flex lg:col-span-2 items-center lg:justify-end">
                      <span className="table-numeric-text font-mono">{location.longitude.toFixed(4)}°</span>
                    </div>

                    <div className="hidden lg:flex lg:col-span-2 items-center">
                      <span className="table-metadata-text">{location.dateAdded}</span>
                    </div>

                    <div className="absolute top-3 right-3 lg:static lg:col-span-1 flex items-center lg:justify-end">
                      <button 
                        onClick={() => setDeleteId(location.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-destructive-subtle text-muted-foreground hover:text-destructive-text transition-colors"
                        title="Delete location"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLocations.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No locations found</p>
                </div>
              )}
            </div>
    </PageScrollShell>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Add Location</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Add a new geographic location for tracking</p>
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
                  Location Name <span className="text-destructive-text">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mogadishu, Bay Region, Afgooye District"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Level Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Level <span className="text-destructive-text">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg text-sm text-left focus:outline-none focus:border-primary bg-card flex items-center justify-between"
                >
                  <span className={level ? 'text-foreground' : 'text-text-subtle'}>{level || 'Select level...'}</span>
                  <ChevronDown size={16} className="text-text-subtle shrink-0" />
                </button>
                {showLevelDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {levels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          setLevel(lvl);
                          setShowLevelDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Latitude Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Latitude <span className="text-destructive-text">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 2.0469"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text-subtle mt-1.5">Range: -90 to 90</p>
                </div>

                {/* Longitude Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Longitude <span className="text-destructive-text">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 45.3182"
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text-subtle mt-1.5">Range: -180 to 180</p>
                </div>
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
                onClick={handleAddLocation}
                disabled={!name.trim() || !level || !latitude.trim() || !longitude.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  name.trim() && level && latitude.trim() && longitude.trim()
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'bg-muted text-text-subtle cursor-not-allowed'
                }`}
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          handleDeleteLocation(deleteId);
          setDeleteId(null);
        }}
        title="Are you sure you want to delete?"
        description={
          deleteId
            ? `"${locations.find((l) => l.id === deleteId)?.name ?? 'This location'}" will be permanently removed. This action cannot be undone.`
            : 'This location will be permanently removed. This action cannot be undone.'
        }
      />
    </>
  );
}
