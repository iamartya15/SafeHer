import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import * as incidentService from '../services/incidentService';
import InteractiveMap from '../components/InteractiveMap';
import { MapPin, AlertCircle, RefreshCw, Layers, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const MapPage = () => {
  const { latitude, longitude, loading: geoLoading } = useGeolocation();

  const [incidents, setIncidents] = useState([]);
  const [gdacsEvents, setGdacsEvents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('7d'); // '24h', '7d', '30d', 'all'

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // 1. Fetch MongoDB incidents
      const res = await incidentService.getIncidents();
      let localIncidents = [];
      if (res.success) {
        localIncidents = res.reports;
        setIncidents(res.reports);
      }

      // 2. Fetch GDACS Global Disasters
      let globalEvents = [];
      try {
        const gdacsRes = await fetch('https://www.gdacs.org/datareport/resources/JRC/gdacs_geojson.json');
        if (gdacsRes.ok) {
          const data = await gdacsRes.json();
          if (data && data.features) {
            globalEvents = data.features.map(f => ({
              _id: f.properties.eventid || Math.random().toString(),
              isGDACS: true,
              category: f.properties.eventtype,
              description: f.properties.htmldescription || f.properties.description,
              address: f.properties.country || 'Global Region',
              createdAt: f.properties.todate || new Date().toISOString(),
              location: {
                type: 'Point',
                coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]]
              }
            }));
            setGdacsEvents(globalEvents);
          }
        }
      } catch (gdacsErr) {
        console.error('Failed to fetch GDACS data (CORS or network error):', gdacsErr);
      }

      applyFilters(localIncidents, globalEvents, selectedCategory, timeFilter);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load incident reports.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (local = incidents, global = gdacsEvents, cat = selectedCategory, time = timeFilter) => {
    let combined = [...local, ...global];

    // Time filter
    if (time !== 'all') {
      const now = new Date().getTime();
      const thresholds = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      const limit = thresholds[time];
      combined = combined.filter(inc => {
        const incTime = new Date(inc.createdAt).getTime();
        return (now - incTime) <= limit;
      });
    }

    // Category filter
    if (cat !== 'All') {
      if (cat === 'Global Disaster') {
        combined = combined.filter(inc => inc.isGDACS);
      } else {
        combined = combined.filter(inc => !inc.isGDACS && inc.category === cat);
      }
    }

    setFilteredIncidents(combined);
  };

  // Trigger filters when state changes
  useEffect(() => {
    applyFilters();
  }, [selectedCategory, timeFilter]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Removed old filter logic inside useEffect directly, now handled by applyFilters

  const categories = [
    'All',
    'Global Disaster',
    'Harassment',
    'Theft',
    'Stalking',
    'Poor Lighting',
    'Unsafe Area',
    'Road Issue'
  ];

  const timeOptions = [
    { id: '24h', label: 'Last 24h' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'all', label: 'All Time' }
  ];

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Safety Map Navigator
          </h1>
          <p className="text-slate-400 text-xs mt-1">Real-time localized hazards mapped by community reporters.</p>
        </div>

        <button
          onClick={fetchIncidents}
          disabled={loading}
          className="btn-secondary py-2 px-4 flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Reports</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Category filter bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-1 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {cat === 'Global Disaster' ? '🌍 ' : ''}{cat}
            </button>
          ))}
        </div>

        {/* Time filter */}
        <div className="flex gap-1 bg-slate-900/50 border border-slate-700/50 rounded-lg p-1 shrink-0">
          {timeOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setTimeFilter(opt.id)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors ${
                timeFilter === opt.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-grow rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative bg-slate-900">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-50 gap-3 text-slate-500 text-xs">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <span>Synchronizing incident coordinates...</span>
          </div>
        ) : filteredIncidents.length === 0 && selectedCategory !== 'All' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <Layers className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-bold text-white">No {selectedCategory} incidents</p>
            <p className="text-xs text-slate-500">Try selecting a different category filter.</p>
          </div>
        ) : null}

        <InteractiveMap
          userLocation={
            latitude && longitude ? { latitude, longitude } : null
          }
          incidents={filteredIncidents}
          zoom={14}
        />
      </div>
      
      {/* Footer warning */}
      <div className="flex items-center gap-2 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-[10px] text-slate-400 font-medium">
        <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
        <span>Use coordinates indicators responsibly. In case of immediate danger, head immediately to open businesses or call local police (100/112).</span>
      </div>

    </div>
  );
};
export default MapPage;
