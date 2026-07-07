import { useState, useEffect, useRef, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import * as incidentService from '../services/incidentService';
import * as mapService from '../services/mapService';
import InteractiveMap from '../components/InteractiveMap';
import { Layers, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export const MapPage = () => {
  const { latitude, longitude } = useGeolocation();

  const [layers, setLayers] = useState({
    incidents: true,
    gdacs: false,
    usgs: false,
    safePlaces: false,
    firms: false,
    weather: false
  });

  const [data, setData] = useState({
    incidents: [],
    gdacs: [],
    usgs: [],
    safePlaces: [],
    firms: [],
    weather: []
  });

  const [loading, setLoading] = useState(false);
  const [bbox, setBbox] = useState(''); // "south,west,north,east"

  const controllers = useRef({});

  const abortRequest = (key) => {
    if (controllers.current[key]) {
      controllers.current[key].abort();
    }
    controllers.current[key] = new AbortController();
    return controllers.current[key].signal;
  };

  const fetchIncidents = async () => {
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
  };

  const fetchGdacs = async () => {
    if (!layers.gdacs) return;
    const signal = abortRequest('gdacs');
    try {
      const res = await mapService.getGdacs(signal);
      if (res && res.data && res.data.features) {
        setData(prev => ({
          ...prev,
          gdacs: res.data.features.map(f => ({
            id: f.properties.eventid,
            type: 'gdacs',
            category: f.properties.eventtype,
            title: f.properties.eventname || f.properties.eventtype,
            description: f.properties.htmldescription || f.properties.description,
            address: f.properties.country,
            timestamp: f.properties.todate,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0]
          }))
        }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error('Live data temporarily unavailable (GDACS)', { id: 'gdacs-err' });
      }
    }
  };

  const fetchUsgs = async () => {
    if (!layers.usgs) return;
    const signal = abortRequest('usgs');
    try {
      const res = await mapService.getUsgs(signal);
      if (res && res.data && res.data.features) {
        setData(prev => ({
          ...prev,
          usgs: res.data.features.map(f => ({
            id: f.id,
            type: 'usgs',
            category: 'Earthquake',
            title: f.properties.title,
            description: `Magnitude: ${f.properties.mag}`,
            address: f.properties.place,
            timestamp: new Date(f.properties.time).toISOString(),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0]
          }))
        }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error('Live data temporarily unavailable (USGS)', { id: 'usgs-err' });
      }
    }
  };

  const fetchSafePlaces = async () => {
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
  };

  const fetchFirms = async () => {
    if (!layers.firms || !bbox) return;
    const signal = abortRequest('firms');
    try {
      const res = await mapService.getFirms(bbox, signal);
      if (res && res.success === false) {
         toast.error(res.message, { id: 'firms-key-err' });
         return;
      }
      if (res && res.data) {
        // Parse basic CSV from NASA
        const lines = res.data.split('\\n').slice(1);
        const firmsList = [];
        lines.forEach((l, i) => {
           const parts = l.split(',');
           if (parts.length >= 2) {
             firmsList.push({
               id: `firm-${i}`,
               type: 'firms',
               category: 'Wildfire',
               title: 'NASA FIRMS Hotspot',
               lat: parseFloat(parts[0]),
               lng: parseFloat(parts[1])
             });
           }
        });
        setData(prev => ({ ...prev, firms: firmsList }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error('Live data temporarily unavailable (NASA FIRMS)', { id: 'firms-err' });
      }
    }
  };

  const fetchWeather = async () => {
    if (!layers.weather || !latitude || !longitude) return;
    const signal = abortRequest('weather');
    try {
      const res = await mapService.getWeather(latitude, longitude, signal);
      if (res && res.success === false) {
         toast.error(res.message, { id: 'weather-key-err' });
         return;
      }
      if (res && res.data && res.data.weather) {
        setData(prev => ({
          ...prev,
          weather: [{
            id: 'weather-1',
            type: 'weather',
            category: res.data.weather[0].main,
            title: res.data.weather[0].main,
            description: res.data.weather[0].description,
            address: res.data.name,
            lat: res.data.coord.lat,
            lng: res.data.coord.lon
          }]
        }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error('Live data temporarily unavailable (Weather)', { id: 'weather-err' });
      }
    }
  };

  // Setup Intervals
  useEffect(() => {
    fetchIncidents();
    const incInt = setInterval(fetchIncidents, 15000);
    return () => clearInterval(incInt);
  }, [layers.incidents]);

  useEffect(() => {
    fetchGdacs();
    const gdacsInt = setInterval(fetchGdacs, 300000); // 5 mins
    return () => clearInterval(gdacsInt);
  }, [layers.gdacs]);

  useEffect(() => {
    fetchUsgs();
    const usgsInt = setInterval(fetchUsgs, 300000); // 5 mins
    return () => clearInterval(usgsInt);
  }, [layers.usgs]);

  useEffect(() => {
    fetchSafePlaces();
    const spInt = setInterval(fetchSafePlaces, 1800000); // 30 mins
    return () => clearInterval(spInt);
  }, [layers.safePlaces, bbox]);

  useEffect(() => {
    fetchFirms();
    const fInt = setInterval(fetchFirms, 600000); // 10 mins
    return () => clearInterval(fInt);
  }, [layers.firms, bbox]);

  useEffect(() => {
    fetchWeather();
    const wInt = setInterval(fetchWeather, 600000); // 10 mins
    return () => clearInterval(wInt);
  }, [layers.weather, latitude, longitude]);

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleBoundsChange = useCallback((newBbox) => {
    setBbox(newBbox);
  }, []);

  const mapData = [
    ...(layers.incidents ? data.incidents : []),
    ...(layers.gdacs ? data.gdacs : []),
    ...(layers.usgs ? data.usgs : []),
    ...(layers.safePlaces ? data.safePlaces : []),
    ...(layers.firms ? data.firms : []),
    ...(layers.weather ? data.weather : [])
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
          zoom={12}
          onBoundsChange={handleBoundsChange}
        />
      </div>
    </div>
  );
};
export default MapPage;
