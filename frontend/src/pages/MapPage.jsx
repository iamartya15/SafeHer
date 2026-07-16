import { useState, useEffect, useRef, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import * as incidentService from '../services/incidentService';
import * as mapService from '../services/mapService';
import InteractiveMap from '../components/InteractiveMap';
import { } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export const MapPage = () => {
  const { latitude, longitude } = useGeolocation();

  const [layers, set] = useState({
    incidents: true,
    safePlaces: false
  });

  const [data, setData] = useState({
    incidents: [],
    safePlaces: []
  });

  
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
      const res = await incidentService.getIncidents(); // doesn't use AbortController yet in service, but we assume it's fast
      if (res.success) {
        setData(prev => ({
          ...prev,
          incidents: res.reports.map(r => ({
            id: r._id,
            type: 'incident',
            category: r.category,
            title: r.category,
            description: r.description,
            address: r.address,
            timestamp: r.createdAt,
            lat: r.location?.coordinates[1],
            lng: r.location?.coordinates[0]
          }))
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
          safePlaces: res.data.elements.map(e => ({
            id: e.id,
            type: 'safe_place',
            category: e.tags?.amenity,
            title: e.tags?.name || e.tags?.amenity,
            description: e.tags?.amenity,
            lat: e.lat || e.center?.lat,
            lng: e.lon || e.center?.lon
          }))
        }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error('Live data temporarily unavailable (Safe Places)', { id: 'sp-err' });
      }
    }
  }, [layers.safePlaces, bbox]);


  // Setup Intervals
  useEffect(() => {
    fetchIncidents();
    const incInt = setInterval(fetchIncidents, 15000);
    return () => clearInterval(incInt);
  }, [layers.incidents]);



  useEffect(() => {
    fetchSafePlaces();
    const spInt = setInterval(fetchSafePlaces, 1800000); // 30 mins
    return () => clearInterval(spInt);
  }, [layers.safePlaces, bbox]);



  const toggleLayer = (layer) => {
    set(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleBoundsChange = useCallback((newBbox) => {
    setBbox(newBbox);
  }, []);

  const mapData = [
    ...(layers.incidents ? data.incidents : []),
    ...(layers.safePlaces ? data.safePlaces : [])
  ];

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Real-time localized hazards mapped by community & global intelligence.</p>
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(layers).map((layer) => (
          <button
            key={layer}
            onClick={() => toggleLayer(layer)}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              layers[layer] 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-500'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            {layer === 'safePlaces' ? 'Safe Places (OSM)' : layer.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-grow rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-slate-900">
        <InteractiveMap
          userLocation={latitude && longitude ? { latitude, longitude } : null}
          mapData={mapData}
          zoom={5}
          onBoundsChange={handleBoundsChange}
        />
      </div>
    </div>
  );
};
export default MapPage;
