import { useEffect, useRef } from 'react';

export function SomaliaMap() {
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

      // Create map
      const map = L.map(mapRef.current).setView([5.1521, 46.1996], 6);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add some markers
      const regions = [
        { name: 'Lower Shabelle', coords: [1.8638, 44.2341] as [number, number], color: 'var(--destructive-text)', level: 'Critical' },
        { name: 'Hiraan', coords: [4.4416, 45.3643] as [number, number], color: 'var(--warning-strong)', level: 'High' },
        { name: 'Bay', coords: [2.7919, 43.8445] as [number, number], color: 'var(--warning)', level: 'Medium' }
      ];

      regions.forEach(region => {
        const circle = L.circleMarker(region.coords, {
          color: region.color,
          fillColor: region.color,
          fillOpacity: 0.6,
          radius: 20,
          weight: 3
        }).addTo(map);

        circle.bindPopup(`
          <div style="padding: 8px;">
            <strong style="font-size: 14px; color: #1e293b;">${region.name}</strong>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 8px 0;">Risk escalation detected</p>
            <span style="background: ${region.color}; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold;">
              ${region.level.toUpperCase()}
            </span>
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
      <h4 className="text-sm font-bold text-foreground mb-6">Regional Risk Escalation Map</h4>
      
      <div className="h-[500px] rounded-xl overflow-hidden border border-border" ref={mapRef}></div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-text-subtle uppercase tracking-wide">Map Legend:</span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-xs text-muted-foreground font-medium">Critical escalation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning-strong"></div>
              <span className="text-xs text-muted-foreground font-medium">High escalation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-xs text-muted-foreground font-medium">Medium escalation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}