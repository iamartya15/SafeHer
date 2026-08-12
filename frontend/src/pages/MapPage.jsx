import { useState, useEffect, useRef, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import * as incidentService from '../services/incidentService';
import * as mapService from '../services/mapService';
import InteractiveMap from '../components/InteractiveMap';
import {
  AlertTriangle,
  MapPin,
  X,
  Navigation,
  Clock,
  Shield,
  HeartPulse,
  Pill,
  Fuel,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/dateFormatter';
import axios from 'axios';

export const MapPage = () => {
  const { latitude, longitude } = useGeolocation();

  const [layers, setLayers] = useState({
    incidents: true,
    safePlaces: true
  });

  const [activeCategory, setActiveCategory] = useState('all');

  const [data, setData] = useState({
    incidents: [],
    safePlaces: []
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [bbox, setBbox] = useState(''); // "south,west,north,east"

  const controllers = useRef({});

  const abortRequest = (key) => {
    if (controllers.current[key]) {
      controllers.current[key].abort();
    }
    controllers.current[key] = new AbortController();
    return controllers.current[key].signal;
  };

  const fetchIncidents = useCallback(async () => {
    if (!layers.incidents) return;
    try {
      const res = await incidentService.getIncidents();
      if (res.success) {
        const reportsList = res.reports || res.data || [];
        setData(prev => ({
          ...prev,
          incidents: reportsList.map(r => ({
            id: r._id,
            type: 'incident',
            category: r.category || 'Harassment',
            title: `${r.category || 'Safety Hazard'} Reported`,
            description: r.description || 'No detailed description provided.',
            address: r.address || 'Unknown Address',
            image: r.image || null,
            timestamp: r.createdAt,
            isVerified: r.isVerified ?? true,
            lat: r.location?.coordinates ? r.location.coordinates[1] : (r.latitude || null),
            lng: r.location?.coordinates ? r.location.coordinates[0] : (r.longitude || null)
          })).filter(item => item.lat && item.lng)
        }));
      }
    } catch (err) {
      toast.error('Live data temporarily unavailable (Incidents)', { id: 'incidents-err' });
    }
  }, [layers.incidents]);

  const fetchSafePlaces = useCallback(async () => {
    if (!layers.safePlaces || !bbox) return;
    const signal = abortRequest('safePlaces');
    try {
      const res = await mapService.getSafePlaces(bbox, signal);
      if (res && res.data && res.data.elements) {
        setData(prev => ({
          ...prev,
          safePlaces: res.data.elements.map(e => {
            const rawAmenity = e.tags?.amenity || e.tags?.healthcare || 'police';
            const itemLat = e.lat || e.center?.lat;
            const itemLng = e.lon || e.center?.lon;
            return {
              id: e.id,
              type: 'safe_place',
              category: rawAmenity,
              title: e.tags?.name || `${rawAmenity.toUpperCase()} Shelter`,
              description: `Verified ${rawAmenity} safety shelter available 24/7.`,
              address: e.tags?.['addr:street'] || e.tags?.['addr:full'] || 'OpenStreetMap Verified Zone',
              phone: e.tags?.phone || e.tags?.['contact:phone'] || null,
              lat: itemLat,
              lng: itemLng
            };
          }).filter(item => item.lat && item.lng)
        }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error('Live data temporarily unavailable (Safe Places)', { id: 'sp-err' });
      }
    }
  }, [layers.safePlaces, bbox]);

  useEffect(() => {
    fetchIncidents();
    const incInt = setInterval(fetchIncidents, 15000);
    return () => clearInterval(incInt);
  }, [fetchIncidents]);

  useEffect(() => {
    fetchSafePlaces();
    const spInt = setInterval(fetchSafePlaces, 1800000);
    return () => clearInterval(spInt);
  }, [fetchSafePlaces]);

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleBoundsChange = useCallback((newBbox) => {
    setBbox(newBbox);
  }, []);

  const allFilteredData = [
    ...(layers.incidents ? data.incidents : []),
    ...(layers.safePlaces ? data.safePlaces : [])
  ].filter(item => {
    if (activeCategory === 'all') return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  const getCategoryIcon = (category, type) => {
    if (type === 'safe_place') {
      if (category === 'police') return <Shield className="w-5 h-5 text-blue-400" />;
      if (['hospital', 'clinic', 'doctors'].includes(category)) return <HeartPulse className="w-5 h-5 text-red-400" />;
      if (category === 'pharmacy') return <Pill className="w-5 h-5 text-emerald-400" />;
      if (category === 'fuel') return <Fuel className="w-5 h-5 text-amber-400" />;
      if (category === 'fire_station') return <Flame className="w-5 h-5 text-orange-400" />;
    }
    return <AlertTriangle className="w-5 h-5 text-rose-400" />;
  };

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-100px)] max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-8 h-8 text-fuchsia-500" />
            Safety Intelligence & Hazard Map
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Click any marker or incident report to inspect full problem details, location, and evidence.
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
              layers.incidents
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            ⚠️ Incidents ({data.incidents.length})
          </button>

          <button
            onClick={() => toggleLayer('safePlaces')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
              layers.safePlaces
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            🛡️ Safe Shelters ({data.safePlaces.length})
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {[
          { id: 'all', label: 'All Hazards & Places' },
          { id: 'harassment', label: 'Harassment' },
          { id: 'theft', label: 'Theft' },
          { id: 'stalking', label: 'Stalking' },
          { id: 'poor lighting', label: 'Poor Lighting' },
          { id: 'unsafe area', label: 'Unsafe Area' },
          { id: 'road issue', label: 'Road Issue' },
          { id: 'police', label: 'Police Stations' },
          { id: 'hospital', label: 'Hospitals' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all border ${
              activeCategory === cat.id
                ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Map & Report Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        
        {/* Left/Center Interactive Map */}
        <div className="lg:col-span-2 relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
          <InteractiveMap
            userLocation={latitude && longitude ? { latitude, longitude } : null}
            mapData={allFilteredData}
            center={latitude && longitude ? [latitude, longitude] : [20.5937, 78.9629]}
            zoom={latitude && longitude ? 13 : 5}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={(item) => setSelectedItem(item)}
            selectedItem={selectedItem}
          />
        </div>

        {/* Right Side: Live Incident & Hazard Inspector Feed */}
        <div className="glass-card rounded-2xl border border-white/10 p-4 flex flex-col h-[500px] md:h-[600px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-fuchsia-400" /> Active Safety Reports ({allFilteredData.length})
            </h3>
            <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 font-bold px-2 py-0.5 rounded border border-fuchsia-500/30">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {allFilteredData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <AlertTriangle className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No reports found for this filter.</p>
                <p className="text-xs mt-1">Try selecting "All Hazards & Places" or pan the map.</p>
              </div>
            ) : (
              allFilteredData.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedItem?.id === item.id
                      ? 'bg-fuchsia-600/20 border-fuchsia-500/50 shadow-lg shadow-fuchsia-900/30 ring-1 ring-fuchsia-500/40'
                      : 'bg-slate-950/40 border-white/5 hover:bg-white/5 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(item.category, item.type)}
                      <h4 className="text-sm font-bold text-white capitalize leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                    <span className="truncate max-w-[180px]">📍 {item.address}</span>
                    {item.timestamp && (
                      <span className="shrink-0 text-slate-500 font-mono text-[10px]">
                        {formatDate(item.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Detailed Incident / Report Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl">
                  {getCategoryIcon(selectedItem.category, selectedItem.type)}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                    {selectedItem.category || selectedItem.type}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1 capitalize leading-tight">
                    {selectedItem.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs text-slate-300">
              
              {/* Problem Description */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1.5">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Reported Problem Details
                </h5>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {selectedItem.description}
                </p>
              </div>

              {/* Attached Evidence Image if available */}
              {selectedItem.image && (
                <div className="space-y-1.5">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attached Evidence Photo</h5>
                  <div className="rounded-2xl overflow-hidden border border-white/10 max-h-56">
                    <img
                      src={selectedItem.image}
                      alt="Incident Evidence"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Location & Time Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Location Address</span>
                  <p className="text-xs text-white font-medium truncate">📍 {selectedItem.address}</p>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Reported Time</span>
                  <p className="text-xs text-white font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {selectedItem.timestamp ? formatDate(selectedItem.timestamp) : 'Recent Report'}
                  </p>
                </div>
              </div>

              {/* Status Verification Badge */}
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-xs">Community Safety Status</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  Verified Active
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-2 border-t border-white/10 flex gap-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MapPage;
