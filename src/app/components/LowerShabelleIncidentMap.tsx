import { useEffect, useRef } from 'react';

interface Incident {
  id: string;
  date: string;
  location: string;
  coords: [number, number];
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

const incidents: Incident[] = [
  {
    id: 'INC-001',
    date: 'Feb 3, 2026',
    location: 'Afgooye (KM50)',
    coords: [2.1385, 45.1217],
    type: 'Armed Clash',
    severity: 'high',
    description: 'Armed confrontation between AS and SNA forces',
    impact: 'Road closure 4 hours, 1 mission delayed'
  },
  {
    id: 'INC-002',
    date: 'Feb 5, 2026',
    location: 'Marka District',
    coords: [1.7152, 44.7719],
    type: 'IED Incident',
    severity: 'high',
    description: 'IED targeting military convoy',
    impact: '2 casualties, supply route disrupted'
  },
  {
    id: 'INC-003',
    date: 'Feb 8, 2026',
    location: 'Afgooye Corridor',
    coords: [2.1580, 45.1500],
    type: 'Checkpoint Activity',
    severity: 'medium',
    description: 'Illegal AS checkpoint established',
    impact: 'Vehicle searches, 3-hour delay for aid convoy'
  },
  {
    id: 'INC-004',
    date: 'Feb 11, 2026',
    location: 'Qoryooley',
    coords: [1.7760, 44.5330],
    type: 'Armed Clash',
    severity: 'high',
    description: 'Heavy fighting near town center',
    impact: 'Civilian displacement, access denied 24 hours'
  },
  {
    id: 'INC-005',
    date: 'Feb 14, 2026',
    location: 'Marka',
    coords: [1.7085, 44.7700],
    type: 'Movement Restriction',
    severity: 'medium',
    description: 'Road blockade by armed group',
    impact: '1 mission rerouted, 2-hour delay'
  },
  {
    id: 'INC-006',
    date: 'Feb 17, 2026',
    location: 'Afgooye (KM40)',
    coords: [2.1200, 45.1100],
    type: 'IED Incident',
    severity: 'high',
    description: 'Roadside IED detonation',
    impact: '1 vehicle damaged, staff unharmed'
  },
  {
    id: 'INC-007',
    date: 'Feb 19, 2026',
    location: 'Wanlaweyn',
    coords: [2.6167, 44.9000],
    type: 'Armed Clash',
    severity: 'medium',
    description: 'Clan-related violence',
    impact: 'Local staff unable to travel'
  },
  {
    id: 'INC-008',
    date: 'Feb 21, 2026',
    location: 'Marka District',
    coords: [1.7200, 44.7850],
    type: 'Checkpoint Activity',
    severity: 'medium',
    description: 'Taxation checkpoint on main road',
    impact: 'Commercial traffic delayed'
  },
  {
    id: 'INC-009',
    date: 'Feb 23, 2026',
    location: 'Afgooye',
    coords: [2.1420, 45.1230],
    type: 'Movement Restriction',
    severity: 'low',
    description: 'Temporary movement restrictions',
    impact: 'Minor delays, no mission impact'
  }
];

export function LowerShabelleIncidentMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Prevent double initialization
    if (mapInstanceRef.current) return;

    // Dynamically import leaflet
    import('leaflet').then((L) => {
      // Double check refs after async import
      if (!mapRef.current) return;
      if (mapInstanceRef.current) return;

      // Create map centered on Lower Shabelle
      const map = L.map(mapRef.current).setView([1.9, 44.8], 8);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add markers for each incident
      incidents.forEach(incident => {
        const color = incident.severity === 'high' ? 'var(--destructive-text)' : incident.severity === 'medium' ? 'var(--warning-strong)' : 'var(--warning)';
        
        const marker = L.circleMarker(incident.coords, {
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          radius: 10,
          weight: 2
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 8px; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
              <strong style="font-size: 13px; color: #1e293b;">${incident.location}</strong>
              <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold;">
                ${incident.severity.toUpperCase()}
              </span>
            </div>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0;">${incident.date}</p>
            <p style="font-size: 12px; color: #475569; margin: 6px 0; font-weight: 600;">${incident.type}</p>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0;">${incident.description}</p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #64748b; font-style: italic;">${incident.impact}</p>
            </div>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h4 className="text-sm font-bold text-foreground mb-6">Lower Shabelle Security Incidents (Last 30 Days)</h4>
      
      <div className="h-[500px] rounded-xl overflow-hidden border border-border" ref={mapRef}></div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-6">
          <span className="text-xs font-semibold text-text-subtle">Incident Severity:</span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-xs text-muted-foreground font-medium">High risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning-strong"></div>
              <span className="text-xs text-muted-foreground font-medium">Medium risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-xs text-muted-foreground font-medium">Low risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { incidents };
