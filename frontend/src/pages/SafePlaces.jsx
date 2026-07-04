import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapPin, Compass, Shield, HeartPulse, Pill, Fuel, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Distance calculation using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const getCategoryDetails = (amenity) => {
  switch (amenity) {
    case 'police':
      return { label: 'Police Station', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    case 'hospital':
      return { label: 'Hospital/Clinic', icon: HeartPulse, color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    case 'pharmacy':
      return { label: 'Pharmacy', icon: Pill, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    case 'fuel':
      return { label: 'Petrol Pump', icon: Fuel, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    default:
      return { label: 'Safe Place', icon: MapPin, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
  }
};

export const SafePlaces = () => {
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, police, hospital, pharmacy, fuel

  const fetchNearbyPlaces = async (lat, lng) => {
    setLoading(true);
    try {
      const radius = 5000; // Search within 5km radius
      // Overpass QL Query for police, hospital, pharmacy, fuel amenities near lat/lng
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:${radius},${lat},${lng});
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="pharmacy"](around:${radius},${lat},${lng});
          node["amenity"="fuel"](around:${radius},${lat},${lng});
        );
        out body;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to retrieve OSM data');
      
      const data = await response.json();
      
      if (data && data.elements) {
        const formatted = data.elements.map((item) => {
          const distance = calculateDistance(lat, lng, item.lat, item.lon);
          const name = item.tags.name || `${getCategoryDetails(item.tags.amenity).label} (Unnamed)`;
          const address = item.tags['addr:street'] || item.tags['addr:full'] || 'Coordinates mapping available';
          
          return {
            id: item.id,
            name,
            address,
            amenity: item.tags.amenity,
            lat: item.lat,
            lng: item.lon,
            distance // in km
          };
        });

        // Sort by distance ascending
        formatted.sort((a, b) => a.distance - b.distance);
        setPlaces(formatted);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to locate nearby emergency shelters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyPlaces(latitude, longitude);
    }
  }, [latitude, longitude]);

  const filteredPlaces = activeFilter === 'all'
    ? places
    : places.filter((p) => p.amenity === activeFilter);

  const filters = [
    { id: 'all', label: 'All Places' },
    { id: 'police', label: 'Police Stations' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'pharmacy', label: 'Pharmacies' },
    { id: 'fuel', label: 'Petrol Pumps' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Nearby Safe Places
        </h1>
        <p className="text-slate-400 text-xs mt-1">Locate verified medical care, police shelters, and fuel stations in your vicinity.</p>
      </div>

      {/* Geolocation Status check */}
      {geoLoading ? (
        <div className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          <span>Querying GPS satellites to check coordinates...</span>
        </div>
      ) : geoError ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
          <span>{geoError} Location services are required to map nearby safe shelters.</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                  activeFilter === f.id
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Places grid layout */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 text-xs">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
              <span>Fetching Overpass shelter indexes...</span>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="empty-state">
              <MapPin className="w-8 h-8 text-slate-600" />
              <div>
                <p className="text-sm font-bold text-white">No places found</p>
                <p className="text-xs text-slate-500 mt-1">No {activeFilter !== 'all' ? activeFilter : ''} places found within a 5 km radius.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => {
                const details = getCategoryDetails(place.amenity);
                const Icon = details.icon;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${place.lat},${place.lng}&travelmode=walking`;

                return (
                  <div
                    key={place.id}
                    className="glass-card rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Badge / Category Header */}
                      <div className="flex justify-between items-start">
                        <div className={`p-2.5 rounded-lg border ${details.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-semibold">
                          <Compass className="w-3.5 h-3.5" />
                          {place.distance.toFixed(2)} km away
                        </span>
                      </div>

                      {/* Info details */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white leading-tight truncate">{place.name}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold uppercase">
                          {details.label}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          📍 {place.address}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-4 border-t border-white/5">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full btn-secondary py-2 flex items-center justify-center gap-1 text-xs hover:bg-purple-600 hover:text-white hover:border-purple-500/20 transition-all font-semibold"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Get Walking Directions</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default SafePlaces;
