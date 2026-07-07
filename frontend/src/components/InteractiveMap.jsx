import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { formatShortDateTime } from '../utils/dateFormatter';

const createPulseIcon = () => L.divIcon({
  className: 'custom-map-marker',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-6 h-6 rounded-full bg-blue-500/30 animate-ping"></div>
           <div class="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shadow-md"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createClickIcon = () => L.divIcon({
  className: 'custom-map-marker',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="w-4 h-4 rounded-full bg-fuchsia-600 border border-white shadow-lg"></div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const createMapIcon = (type, category) => {
  let color = 'bg-slate-500';
  let border = 'border-slate-300';
  let iconText = '📍';
  let animate = false;

  switch (type) {
    case 'incident':
      color = 'bg-red-500'; border = 'border-red-300'; iconText = '⚠️'; animate = true;
      if (['Poor Lighting', 'Road Issue'].includes(category)) {
        color = 'bg-orange-500'; border = 'border-orange-300';
      } else if (category === 'Unsafe Area') {
        color = 'bg-yellow-500'; border = 'border-yellow-300';
      }
      break;
    case 'sos':
      color = 'bg-red-600'; border = 'border-red-400'; iconText = '🆘'; animate = true;
      break;
    case 'guardian':
      color = 'bg-green-500'; border = 'border-green-300'; iconText = '🛡️';
      break;
    case 'gdacs':
      color = 'bg-rose-600'; border = 'border-rose-400'; iconText = '🌍'; animate = true;
      break;
    case 'usgs':
      color = 'bg-amber-600'; border = 'border-amber-400'; iconText = '🫨';
      break;
    case 'firms':
      color = 'bg-orange-600'; border = 'border-orange-400'; iconText = '🔥'; animate = true;
      break;
    case 'weather':
      color = 'bg-sky-500'; border = 'border-sky-300'; iconText = '⛈️';
      break;
    case 'safe_place':
      if (category === 'police') { color = 'bg-blue-600'; border = 'border-blue-400'; iconText = '🚓'; }
      else if (category === 'hospital') { color = 'bg-teal-500'; border = 'border-teal-300'; iconText = '🏥'; }
      else if (category === 'pharmacy') { color = 'bg-emerald-500'; border = 'border-emerald-300'; iconText = '💊'; }
      else if (category === 'fire_station') { color = 'bg-red-500'; border = 'border-red-300'; iconText = '🚒'; }
      else if (category === 'fuel') { color = 'bg-slate-700'; border = 'border-slate-500'; iconText = '⛽'; }
      break;
    default:
      break;
  }

  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             ${animate ? `<div class="absolute w-8 h-8 rounded-full ${color}/30 animate-ping" style="animation-duration: 2s;"></div>` : ''}
             <div class="w-6 h-6 rounded-full ${color} border-2 ${border} shadow-lg flex items-center justify-center text-[12px] text-white font-bold">
               ${iconText}
             </div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export const InteractiveMap = ({
  center = [20.5937, 78.9629],
  zoom = 5,
  mapData = [],
  userLocation = null,
  onMapClick = null,
  selectedLocation = null,
  onBoundsChange = null
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const clickMarkerRef = useRef(null);
  const markerClusterGroupRef = useRef(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      maxZoom: 18
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    mapInstanceRef.current = map;

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      });
    }

    if (onBoundsChange) {
      map.on('moveend', () => {
        const bounds = map.getBounds();
        onBoundsChange(`${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`);
      });
      // trigger initial bounds
      setTimeout(() => {
        const bounds = map.getBounds();
        onBoundsChange(`${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`);
      }, 500);
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
      if (userMarkerRef.current) userMarkerRef.current.setLatLng(latlng);
      else userMarkerRef.current = L.marker(latlng, { icon: createPulseIcon() }).addTo(map).bindPopup('Your Current Location');
    }
  }, [userLocation]);

  // 3. Sync Click/Selected Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      const latlng = [selectedLocation.latitude, selectedLocation.longitude];
      if (clickMarkerRef.current) clickMarkerRef.current.setLatLng(latlng);
      else clickMarkerRef.current = L.marker(latlng, { icon: createClickIcon() }).addTo(map).bindPopup('Selected Location');
      clickMarkerRef.current.openPopup();
      map.panTo(latlng);
    } else {
      if (clickMarkerRef.current) {
        clickMarkerRef.current.remove();
        clickMarkerRef.current = null;
      }
    }
  }, [selectedLocation]);

  // 4. Sync Map Data (Incidents, GDACS, USGS, SafePlaces, etc)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerClusterGroupRef.current) map.removeLayer(markerClusterGroupRef.current);

    markerClusterGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        let sizeClass = 'w-8 h-8';
        if (count > 10) sizeClass = 'w-10 h-10';
        if (count > 50) sizeClass = 'w-12 h-12';
        return L.divIcon({
          html: `<div class="${sizeClass} rounded-full bg-purple-600/90 border-2 border-purple-300 shadow-lg flex items-center justify-center text-white font-bold text-xs ring-4 ring-purple-500/30 backdrop-blur-sm transition-all hover:scale-110">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(40, 40, true),
        });
      }
    });

    mapData.forEach((item) => {
      if (item.lat && item.lng) {
        const popupContent = `
          <div style="color: #1e293b; padding: 4px; max-width: 200px;">
            <h5 style="margin: 0 0 4px 0; font-weight: bold; color: #7e22ce; text-transform: capitalize;">
              ${item.title || item.category || item.type}
            </h5>
            <p style="margin: 0 0 6px 0; font-size: 11px;">${item.description || ''}</p>
            ${item.image ? `<img src="${item.image}" style="width: 100%; border-radius: 4px; margin-bottom: 6px;" />` : ''}
            ${item.address ? `<span style="font-size: 10px; color: #64748b; display:block;">📍 ${item.address}</span>` : ''}
            ${item.timestamp ? `<span style="font-size: 9px; color: #94a3b8; display:block; margin-top: 2px;">${formatShortDateTime(item.timestamp)}</span>` : ''}
          </div>
        `;
        const marker = L.marker([item.lat, item.lng], { icon: createMapIcon(item.type, item.category) })
          .bindPopup(popupContent);
        markerClusterGroupRef.current.addLayer(marker);
      }
    });

    map.addLayer(markerClusterGroupRef.current);
  }, [mapData]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-inner border border-white/5 bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" style={{ zIndex: 1 }} />
      {onMapClick && (
        <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-300 pointer-events-none z-[1000] font-medium">
          Click anywhere on the map to pin location
        </div>
      )}
    </div>
  );
};
export default InteractiveMap;
