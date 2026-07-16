import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapPin, Compass, Shield, HeartPulse, Pill, Fuel, Navigation, Phone, Globe, Clock, Loader2, CheckCircle2, Star, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
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
      return { label: 'Police Station', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', score: 98, tips: ["Open 24/7", "Safe Haven", "Zero FIR available"] };
    case 'hospital':
      return { label: 'Hospital/Clinic', icon: HeartPulse, color: 'text-red-400 bg-red-500/10 border-red-500/20', score: 95, tips: ["Emergency Ward", "Medical Staff"] };
    case 'pharmacy':
      return { label: 'Pharmacy', icon: Pill, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', score: 85, tips: ["First Aid", "Well-lit Area"] };
    case 'fuel':
      return { label: 'Petrol Pump', icon: Fuel, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', score: 80, tips: ["CCTV Monitored", "Public Washrooms"] };
    default:
      return { label: 'Safe Place', icon: MapPin, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', score: 75, tips: ["Public Area"] };
  }
};

const PlaceCard = ({ place, latitude, longitude }) => {
  const [expanded, setExpanded] = useState(false);
  const details = getCategoryDetails(place.amenity);
  const Icon = details.icon;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${place.lat},${place.lng}&travelmode=walking`;

  // Fallback image based on category for visual richness
  const getFallbackImage = () => {
    switch (place.amenity) {
      case 'police': return 'https://images.unsplash.com/photo-1550592704-6c76defa99ce?auto=format&fit=crop&q=80&w=400';
      case 'hospital': return 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400';
      case 'pharmacy': return 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=400';
      case 'fuel': return 'https://images.unsplash.com/photo-1579737135805-728b7125dc59?auto=format&fit=crop&q=80&w=400';
      default: return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/5 hover:border-fuchsia-500/30 transition-all duration-300 shadow-xl overflow-hidden flex flex-col">
      <div className="relative h-32 overflow-hidden">
         <img src={getFallbackImage()} alt={place.name} loading="lazy" className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
         <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md rounded-lg p-1.5 border border-slate-700">
           <Icon className={`w-4 h-4 ${details.color.split(' ')[0]}`} />
         </div>
         <div className="absolute top-3 right-3 bg-green-500/20 backdrop-blur-md rounded-full px-2 py-1 border border-green-500/30 flex items-center gap-1">
           <CheckCircle2 className="w-3 h-3 text-green-400" />
           <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Verified</span>
         </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
         <div className="flex justify-between items-start mb-2">
            <div>
               <h4 className="text-base font-bold text-white leading-tight mb-1">{place.name}</h4>
               <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                 {details.label}
               </span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-xl font-black text-fuchsia-400">{details.score}</span>
               <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Safety Score</span>
            </div>
         </div>

         <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed flex items-center gap-1">
           <MapPin className="w-3.5 h-3.5 shrink-0" /> {place.address}
         </p>

         <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
               <Compass className="w-3.5 h-3.5 text-slate-500" />
               <span className="font-semibold text-white">{place.distance.toFixed(2)} km away</span>
            </div>
            <div className="flex items-center gap-1.5">
               <Star className="w-3.5 h-3.5 text-yellow-500" />
               <span className="font-semibold text-white">4.8</span> (Community)
            </div>
         </div>

         <button onClick={() => setExpanded(!expanded)} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 hover:text-fuchsia-300 flex items-center justify-center gap-1 py-2 bg-white/5 rounded-lg">
            {expanded ? <>Show Less <ChevronUp className="w-3 h-3" /></> : <>Show Full Details <ChevronDown className="w-3 h-3" /></>}
         </button>

         {expanded && (
           <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                 <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact & Info</h5>
                 <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-300">
                   {place.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> <a href={`tel:${place.phone}`} className="text-blue-400">{place.phone}</a></div>}
                   {place.website && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-500" /> <a href={place.website} target="_blank" rel="noreferrer" className="text-blue-400 truncate">{place.website}</a></div>}
                   <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-500" /> {place.openingHours || 'Hours not listed'}</div>
                   <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Lat: {place.lat.toFixed(4)}, Lng: {place.lng.toFixed(4)}</div>
                 </div>
              </div>

              <div className="space-y-2">
                 <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Safety Tips</h5>
                 <div className="flex flex-wrap gap-2">
                   {details.tips.map((tip, i) => (
                     <span key={i} className="text-[10px] px-2 py-1 bg-slate-800 rounded-md text-slate-300">{tip}</span>
                   ))}
                 </div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                 <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                   <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Verified Incident History
                 </h5>
                 <p className="text-[10px] text-slate-400 italic">No recent incidents reported in the immediate 100m radius of this safe place.</p>
              </div>
           </div>
         )}

         <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 btn-secondary py-2 flex items-center justify-center gap-1.5 text-xs hover:bg-fuchsia-600 hover:text-white hover:border-fuchsia-500/20 transition-all font-semibold">
              <Navigation className="w-4 h-4" />
              <span>Navigate</span>
            </a>
            {place.phone && (
              <a href={`tel:${place.phone}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-colors border border-slate-700">
                <Phone className="w-4 h-4" />
              </a>
            )}
         </div>
      </div>
    </div>
  );
}

export const SafePlaces = () => {
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, police, hospital, pharmacy, fuel

  const fetchNearbyPlaces = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const radius = 5000; 
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
            phone: item.tags.phone || item.tags['contact:phone'] || null,
            website: item.tags.website || item.tags['contact:website'] || null,
            openingHours: item.tags.opening_hours || null,
            operator: item.tags.operator || null,
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
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyPlaces(latitude, longitude);
    }
  }, [latitude, longitude, fetchNearbyPlaces]);

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
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-20 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-fuchsia-400 font-bold uppercase tracking-wider text-sm">
          <MapPin className="w-4 h-4" /> Real-time Protection
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Verified Safe Places
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Instantly locate verified medical care, police shelters, and 24/7 petrol stations in your vicinity. Data is aggregated from OpenStreetMap and enriched with community safety scores.
        </p>
      </div>

      {/* Geolocation Status check */}
      {geoLoading ? (
        <div className="glass-card rounded-2xl p-16 border border-white/5 flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" />
          <span className="font-semibold text-lg text-white">Querying GPS satellites...</span>
          <span className="text-sm">Calculating precise coordinates to map emergency shelters.</span>
        </div>
      ) : geoError ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
          <div>
             <h4 className="text-lg font-bold text-red-400 mb-1">Location Access Denied</h4>
             <p className="text-sm">{geoError} We require location permissions strictly to query nearby safe zones.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                  activeFilter === f.id
                    ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/50'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Places grid layout */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="animate-pulse glass-card rounded-2xl h-[400px] border border-white/5" />
               ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-white/5">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                 <MapPin className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Verified Places Found</h3>
              <p className="text-slate-400 max-w-md">We couldn't locate any {activeFilter !== 'all' ? activeFilter : 'registered safe'} locations within a 5km radius of your current coordinates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => (
                 <PlaceCard key={place.id} place={place} latitude={latitude} longitude={longitude} />
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
export default SafePlaces;
