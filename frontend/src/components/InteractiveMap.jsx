import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons missing in build bundlers
const createPulseIcon = () => L.divIcon({
  className: 'custom-map-marker',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-6 h-6 rounded-full bg-blue-500/30 animate-ping"></div>
           <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shadow-md"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createIncidentIcon = (category) => {
  let color = 'bg-red-500';
  let border = 'border-red-300';
  
  if (['Poor Lighting', 'Road Issue'].includes(category)) {
    color = 'bg-orange-500';
    border = 'border-orange-300';
  } else if (category === 'Unsafe Area') {
    color = 'bg-yellow-500';
    border = 'border-yellow-300';
  }

  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             <div class="absolute w-8 h-8 rounded-full ${color}/20 animate-pulse-slow"></div>
             <div class="w-4.5 h-4.5 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold">
               ⚠️
             </div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createClickIcon = () => L.divIcon({
  className: 'custom-map-marker',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="w-4 h-4 rounded-full bg-fuchsia-600 border border-white shadow-lg"></div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export const InteractiveMap = ({
  center = [20.5937, 78.9629], // India default
  zoom = 5,
  incidents = [],
  userLocation = null,
  onMapClick = null,
  selectedLocation = null
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const clickMarkerRef = useRef(null);
  const incidentMarkersRef = useRef([]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true
    });

    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle clicks
    if (onMapClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onMapClick({ latitude: lat, longitude: lng });
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Sync User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const latlng = [userLocation.latitude, userLocation.longitude];
      
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(latlng);
      } else {
        userMarkerRef.current = L.marker(latlng, { icon: createPulseIcon() })
          .addTo(map)
          .bindPopup('Your Current Location');
      }

      // If map is still at default, pan/zoom to user
      if (map.getZoom() <= 5) {
        map.setView(latlng, 14);
      }
    }
  }, [userLocation]);

  // 3. Sync Click/Selected Location Marker (for incident reporting)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      const latlng = [selectedLocation.latitude, selectedLocation.longitude];

      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng(latlng);
      } else {
        clickMarkerRef.current = L.marker(latlng, { icon: createClickIcon() })
          .addTo(map)
          .bindPopup('Selected Location');
      }
      clickMarkerRef.current.openPopup();
      map.panTo(latlng);
    } else {
      if (clickMarkerRef.current) {
        clickMarkerRef.current.remove();
        clickMarkerRef.current = null;
      }
    }
  }, [selectedLocation]);

  // 4. Sync Incident Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    incidentMarkersRef.current.forEach(m => m.remove());
    incidentMarkersRef.current = [];

    // Add new markers
    incidents.forEach((report) => {
      if (
        report.location &&
        report.location.coordinates &&
        report.location.coordinates.length === 2
      ) {
        const [lng, lat] = report.location.coordinates;
        
        const popupContent = `
          <div style="color: #1e293b; padding: 4px; max-width: 200px;">
            <h5 style="margin: 0 0 4px 0; font-weight: bold; color: #7e22ce;">${report.category}</h5>
            <p style="margin: 0 0 6px 0; font-size: 11px;">${report.description}</p>
            ${report.image ? `<img src="${report.image}" style="width: 100%; border-radius: 4px; margin-bottom: 6px;" />` : ''}
            <span style="font-size: 10px; color: #64748b; display:block;">📍 ${report.address || 'Reported Location'}</span>
            <span style="font-size: 9px; color: #94a3b8; display:block; margin-top: 2px;">
              ${new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: createIncidentIcon(report.category) })
          .addTo(map)
          .bindPopup(popupContent);

        incidentMarkersRef.current.push(marker);
      }
    });
  }, [incidents]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-inner border border-white/5 bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" style={{ zIndex: 1 }} />
      {/* Zoom instructions for user overlay if reporting location */}
      {onMapClick && (
        <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-300 pointer-events-none z-[1000] font-medium">
          Click anywhere on the map to pin incident location
        </div>
      )}
    </div>
  );
};
export default InteractiveMap;
