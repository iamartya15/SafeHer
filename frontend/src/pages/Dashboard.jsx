import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import * as sosService from '../services/sosService';
import * as incidentService from '../services/incidentService';
import {
  ShieldAlert,
  MapPin,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Activity,
  Battery,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvatarSrc } from '../utils/avatar';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, error: geoError, loading: geoLoading, refresh: refreshGeo } = useGeolocation();

  const [sosHistory, setSosHistory] = useState([]);
  const [activeSos, setActiveSos] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = async () => {
    try {
      const sosData = await sosService.getSOSHistory();
      if (sosData.success && mountedRef.current) {
        setSosHistory(sosData.history.slice(0, 5));
      }

      const activeSosData = await sosService.getActiveSOS();
      if (activeSosData.success && activeSosData.hasActiveSos && mountedRef.current) {
        setActiveSos(activeSosData.sos);
      } else if (mountedRef.current) {
        setActiveSos(null);
      }

      const incidentData = await incidentService.getIncidents();
      if (incidentData.success && mountedRef.current) {
        setIncidents(incidentData.reports.slice(0, 5));
      }
    } catch (err) {
      if (mountedRef.current) console.error('Failed to load dashboard statistics:', err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerSOS = async () => {
    if (!latitude || !longitude) {
      toast.error('Location is required to trigger SOS. Please enable GPS permissions.');
      return;
    }

    const loadToast = toast.loading('Sending emergency SOS alerts...');
    try {
      // Grab battery level if browser supports battery API
      let batteryLevel = 100;
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        batteryLevel = Math.round(battery.level * 100);
      }

      const res = await sosService.triggerSOS({
        latitude,
        longitude,
        batteryLevel,
        browserInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`
        }
      });

      if (res.success) {
        toast.success('SOS Alert Dispatched! Guardians notified.', { id: loadToast });
        setActiveSos(res.sos);
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to trigger SOS alert.', { id: loadToast });
    }
  };

  const handleResolveSOS = async () => {
    if (!activeSos) return;
    const loadToast = toast.loading('Resolving SOS Alert...');
    try {
      const res = await sosService.resolveSOS(activeSos._id);
      if (res.success) {
        toast.success('Emergency resolved successfully.', { id: loadToast });
        setActiveSos(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve SOS.', { id: loadToast });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header / Welcome Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Your personal safety shield is fully active.</p>
        </div>
        
        {/* Active SOS Panel */}
        {activeSos ? (
          <button
            onClick={handleResolveSOS}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-500 bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 shadow-lg shadow-red-500/10 animate-pulse text-sm"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Active SOS: Click to Resolve</span>
          </button>
        ) : (
          <button
            onClick={handleTriggerSOS}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-all text-sm group"
          >
            <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>TRIGGER SOS EMERGENCY</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Left side columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Location & Safety Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GPS Telemetry Card */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">GPS Telemetry</span>
                  <h3 className="text-lg font-bold text-white">Current Location</h3>
                </div>
                <button
                  onClick={refreshGeo}
                  disabled={geoLoading}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${geoLoading ? 'animate-spin text-purple-500' : ''}`} />
                </button>
              </div>

              <div className="mt-4 space-y-2 bg-slate-950/40 p-3 rounded-lg border border-white/5 text-xs text-slate-300">
                {geoLoading ? (
                  <div className="flex items-center justify-center py-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Loading Coordinates...
                  </div>
                ) : geoError ? (
                  <span className="text-red-400 block">{geoError}</span>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Latitude</span>
                      <code className="text-white font-mono">{latitude?.toFixed(6) || 'N/A'}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Longitude</span>
                      <code className="text-white font-mono">{longitude?.toFixed(6) || 'N/A'}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accuracy</span>
                      <span className="text-emerald-400">~15 meters</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <Link
                  to="/map"
                  className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Open Maps Navigation</span>
                </Link>
              </div>
            </div>

            {/* Safety Overview Status Widget */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Shield Status</span>
                <h3 className="text-lg font-bold text-white">Safety Overview</h3>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">SafeHer Active Shield</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Guardians linked and Gemini safety advisor models primed to generate guides.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Reports Nearby</span>
                  <span className="text-sm font-bold text-white">{incidents.length}</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Active Alerts</span>
                  <span className="text-sm font-bold text-emerald-400">0 Alerts</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Actions Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={handleTriggerSOS}
                className="p-4 rounded-xl bg-red-950/20 border border-red-500/10 hover:border-red-500/30 flex flex-col items-center justify-center text-center gap-2 group transition-colors"
              >
                <div className="p-2.5 bg-red-500/10 rounded-lg text-red-400 group-hover:scale-105 transition-transform"><ShieldAlert className="w-5 h-5" /></div>
                <span className="text-[11px] font-bold text-slate-200">SOS Alert</span>
              </button>

              <Link
                to="/report-incident"
                className="p-4 rounded-xl bg-purple-950/10 border border-purple-500/10 hover:border-purple-500/30 flex flex-col items-center justify-center text-center gap-2 group transition-colors"
              >
                <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-105 transition-transform"><PlusCircle className="w-5 h-5" /></div>
                <span className="text-[11px] font-bold text-slate-200">Report Incident</span>
              </Link>

              <Link
                to="/nearby"
                className="p-4 rounded-xl bg-blue-950/10 border border-blue-500/10 hover:border-blue-500/30 flex flex-col items-center justify-center text-center gap-2 group transition-colors"
              >
                <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-105 transition-transform"><MapPin className="w-5 h-5" /></div>
                <span className="text-[11px] font-bold text-slate-200">Safe Places</span>
              </Link>

              <Link
                to="/ai"
                className="p-4 rounded-xl bg-fuchsia-950/10 border border-fuchsia-500/10 hover:border-fuchsia-500/30 flex flex-col items-center justify-center text-center gap-2 group transition-colors"
              >
                <div className="p-2.5 bg-fuchsia-500/10 rounded-lg text-fuchsia-400 group-hover:scale-105 transition-transform"><HelpCircle className="w-5 h-5" /></div>
                <span className="text-[11px] font-bold text-slate-200">AI Safety Bot</span>
              </Link>
            </div>
          </div>

          {/* Recent Reports Map Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Recent SafeHer Community Reports</h3>
              <Link to="/map" className="text-xs text-purple-400 hover:underline flex items-center gap-1">
                <span>View Full Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-1.5" /> Loading incident reports...
                </div>
              ) : incidents.length === 0 ? (
                <div className="empty-state">
                  <div className="p-3 bg-slate-800 rounded-full"><AlertTriangle className="w-6 h-6 text-slate-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-white">No community reports yet</p>
                    <p className="text-xs text-slate-500 mt-1">Be the first to report a safety concern in your area.</p>
                  </div>
                  <Link to="/report-incident" className="btn-primary text-xs py-2 px-4">Report an Incident</Link>
                </div>
              ) : (
                incidents.map((rep) => (
                  <div
                    key={rep._id}
                    className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">
                        ⚠️
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{rep.category}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{rep.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-300 font-mono block">📍 {rep.address}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* 3. Right side column - Profiles / SOS / Stats */}
        <div className="space-y-6">
          
          {/* Profile Summary Widget */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <img
                src={getAvatarSrc(user?.avatar, user?.name)}
                alt={user?.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                onError={(e) => {
                  e.target.src = getAvatarSrc('', user?.name);
                }}
              />
              <div className="absolute bottom-0 right-0 p-1.5 bg-purple-600 rounded-full text-white border-2 border-slate-900">
                <Compass className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <div className="mt-3 inline-flex px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                {user?.role === 'user' ? 'Ward / Monitored User' : user?.role === 'guardian' ? 'Active Guardian' : 'Admin'}
              </div>
            </div>
            
            <div className="pt-2 flex justify-between items-center text-xs border-t border-white/5">
              <span className="text-slate-500">Phone Status</span>
              <span className="text-white font-mono">{user?.phone || 'Not configured'}</span>
            </div>
            <Link to="/profile" className="w-full btn-secondary text-xs py-2 block">
              Edit profile
            </Link>
          </div>

          {/* SOS Log History */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Your SOS History</h3>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Loading history...
                </div>
              ) : sosHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="p-3 bg-slate-800 rounded-full"><ShieldAlert className="w-5 h-5 text-slate-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-white">No SOS history</p>
                    <p className="text-xs text-slate-500 mt-1">You haven't triggered any emergency alerts.</p>
                  </div>
                </div>
              ) : (
                sosHistory.map((log) => (
                  <div
                    key={log._id}
                    className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white block">SOS Alert Triggered</span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                          <Battery className="w-3 h-3 text-emerald-400" />
                          <span>{log.batteryLevel}% battery</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        log.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/30 text-slate-400'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-1">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Dashboard;
