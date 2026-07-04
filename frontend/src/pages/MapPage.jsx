import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import * as incidentService from '../services/incidentService';
import InteractiveMap from '../components/InteractiveMap';
import { MapPin, AlertCircle, RefreshCw, Layers, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const MapPage = () => {
  const { latitude, longitude, loading: geoLoading } = useGeolocation();

  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentService.getIncidents();
      if (res.success) {
        setIncidents(res.reports);
        setFilteredIncidents(res.reports);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load incident reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Filter logic
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredIncidents(incidents);
    } else {
      setFilteredIncidents(
        incidents.filter((inc) => inc.category === selectedCategory)
      );
    }
  }, [selectedCategory, incidents]);

  const categories = [
    'All',
    'Harassment',
    'Theft',
    'Stalking',
    'Poor Lighting',
    'Unsafe Area',
    'Road Issue'
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

      {/* Category filter bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
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
