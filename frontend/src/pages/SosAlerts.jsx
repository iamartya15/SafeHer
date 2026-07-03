import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import * as sosService from '../services/sosService';
import * as guardianService from '../services/guardianService';
import {
  ShieldAlert,
  Battery,
  MapPin,
  Clock,
  HeartHandshake,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvatarSrc } from '../utils/avatar';

export const SosAlerts = () => {
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();

  const [guardians, setGuardians] = useState([]);
  const [sosHistory, setSosHistory] = useState([]);
  const [activeSos, setActiveSos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const loadData = async () => {
    try {
      // 1. Get SOS History
      const resHistory = await sosService.getSOSHistory();
      if (resHistory.success) {
        setSosHistory(resHistory.history);
      }

      // 2. Get Active SOS status
      const resActive = await sosService.getActiveSOS();
      if (resActive.success && resActive.hasActiveSos) {
        setActiveSos(resActive.sos);
      } else {
        setActiveSos(null);
      }

      // 3. Get Guardians list to display who gets alerted
      const resGuard = await guardianService.getGuardians();
      if (resGuard.success) {
        setGuardians(resGuard.guardians.filter(g => g.status === 'approved'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerSOS = async () => {
    if (!latitude || !longitude) {
      toast.error('Location is required. Please check GPS settings.');
      return;
    }

    setTriggering(true);
    const toastId = toast.loading('Initiating emergency signals...');
    try {
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
        toast.success('SOS Alert Broadcasted successfully!', { id: toastId });
        setActiveSos(res.sos);
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to trigger SOS.', { id: toastId });
    } finally {
      setTriggering(false);
    }
  };

  const handleResolveSOS = async () => {
    if (!activeSos) return;
    const toastId = toast.loading('Declaring emergency resolved...');
    try {
      const res = await sosService.resolveSOS(activeSos._id);
      if (res.success) {
        toast.success('SOS deactivated. Guardians notified.', { id: toastId });
        setActiveSos(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve SOS status.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          SOS Emergency Station
        </h1>
        <p className="text-slate-400 text-xs mt-1">Instant, high-priority guardian notifications and safety log tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Large SOS Button Widget */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center py-10 glass-card rounded-3xl border border-white/5 relative overflow-hidden bg-slate-900/30">
          
          {/* Pulse Glow Effect */}
          {activeSos && (
            <div className="absolute inset-0 bg-red-600/5 animate-pulse-slow pointer-events-none" />
          )}

          {/* Alert Warning if no GPS */}
          {geoError && (
            <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{geoError} Enable GPS coordinates before triggering SOS.</span>
            </div>
          )}

          {/* SOS button */}
          <div className="relative">
            {activeSos ? (
              // Active SOS Button (Resets Alert)
              <button
                onClick={handleResolveSOS}
                disabled={geoLoading || triggering}
                className="w-48 h-48 rounded-full border-4 border-red-500 bg-red-950/20 text-red-400 font-extrabold text-2xl shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform z-10 relative cursor-pointer group"
              >
                <div className="sos-ring border-red-500" />
                <ShieldAlert className="w-10 h-10 animate-bounce" />
                <span className="text-sm uppercase tracking-wider block">RESOLVE</span>
              </button>
            ) : (
              // Inactive SOS Button (Triggers Alert)
              <button
                onClick={handleTriggerSOS}
                disabled={geoLoading || triggering}
                className="w-48 h-48 rounded-full border-4 border-red-600 bg-gradient-to-tr from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-extrabold text-3xl shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform z-10 relative cursor-pointer group"
              >
                <ShieldAlert className="w-10 h-10 group-hover:scale-110 transition-transform" />
                <span className="text-base uppercase tracking-widest block font-bold">SOS</span>
              </button>
            )}
          </div>

          <div className="mt-8 text-center space-y-2">
            <h3 className="text-lg font-bold text-white">
              {activeSos ? '🚨 EMERGENCY ACTIVE ALERTS' : 'Press SOS in case of danger'}
            </h3>
            <p className="text-slate-400 text-xs max-w-sm px-4">
              {activeSos 
                ? 'Your location was dispatched to active guardians. Keep this window open or click RESOLVE once safe.'
                : 'Clicking triggers immediate emails and in-app system alerts containing Google Maps routing link to your guardians.'
              }
            </p>
          </div>

          {/* Telemetry info */}
          <div className="mt-6 flex gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-purple-400" />
              {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'No GPS linked'}
            </span>
            <span className="flex items-center gap-1">
              <Battery className="w-4 h-4 text-emerald-400" />
              100% telemetry accuracy
            </span>
          </div>

        </div>

        {/* Right Columns: Guardians to Notify & History logs */}
        <div className="space-y-6">
          
          {/* Active Contacts / Guardians Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Guardians Being Contacted</h3>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-slate-500 text-xs py-4 text-center">Loading contacts...</div>
              ) : guardians.length === 0 ? (
                <div className="p-4 border border-dashed border-white/5 text-center text-xs text-slate-500 rounded-xl">
                  No verified contacts. Visit the Guardian dashboard to invite contacts.
                </div>
              ) : (
                guardians.map((guard) => (
                  <div key={guard._id} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center gap-3">
                    <img
                      src={getAvatarSrc(guard.guardianId?.avatar, guard.guardianId?.name)}
                      className="w-8 h-8 rounded-full object-cover border border-purple-500/20"
                      onError={(e) => { e.target.src = getAvatarSrc('', guard.guardianId?.name); }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{guard.guardianId?.name || guard.guardianEmail}</h4>
                      <span className="text-[9px] text-purple-400 uppercase font-semibold">{guard.relationship}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SOS Log History */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Emergency History Logs</h3>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {loading ? (
                <div className="text-slate-500 text-xs py-4 text-center">Loading logs...</div>
              ) : sosHistory.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-4">No logged entries.</div>
              ) : (
                sosHistory.map((log) => (
                  <div key={log._id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">SOS Triggered</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Battery: {log.batteryLevel}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold uppercase ${
                        log.status === 'active' ? 'text-red-400' : 'text-slate-500'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString()}
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
export default SosAlerts;
