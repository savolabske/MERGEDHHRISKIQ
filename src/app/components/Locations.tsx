import { useState } from 'react';
import { Plus, X, Search, MapPin, Trash2, Edit, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6 pb-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Locations</h2>
                <p className="text-sm sm:text-sm text-muted-foreground">
                  Manage geographic locations for risk tracking and analysis
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus size={18} />
                Add Location
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-border rounded-lg text-base focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Locations Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-muted border-b border-border">
                <div className="col-span-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Location Name
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Level
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Latitude
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Longitude
                </div>
                <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Date Added
                </div>
                <div className="col-span-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                  Actions
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {filteredLocations.map((location) => (
                  <div key={location.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 hover:bg-muted transition-colors">
                    {/* Location Name */}
                    <div className="lg:col-span-3">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Location Name</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sidebar-accent rounded-lg flex items-center justify-center shrink-0">
                          <MapPin size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{location.name}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Level */}
                    <div className="lg:col-span-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Level</div>
                      <span className="inline-flex items-center px-2.5 py-1 bg-secondary text-muted-foreground text-sm font-medium rounded-md">
                        {location.level}
                      </span>
                    </div>

                    {/* Latitude */}
                    <div className="lg:col-span-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Latitude</div>
                      <span className="text-sm text-foreground font-mono">{location.latitude.toFixed(4)}°</span>
                    </div>

                    {/* Longitude */}
                    <div className="lg:col-span-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Longitude</div>
                      <span className="text-sm text-foreground font-mono">{location.longitude.toFixed(4)}°</span>
                    </div>

                    {/* Date Added */}
                    <div className="lg:col-span-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">Date Added</div>
                      <span className="text-sm text-muted-foreground">{location.dateAdded}</span>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex items-center gap-2 lg:justify-end">
                      <button 
                        onClick={() => handleDeleteLocation(location.id)}
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
                  <p className="text-base text-muted-foreground">No locations found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
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
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg text-sm text-left focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 bg-card flex items-center justify-between"
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
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
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
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
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
    </div>
  );
}