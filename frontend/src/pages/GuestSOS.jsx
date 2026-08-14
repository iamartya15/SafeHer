import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneCall, ShieldAlert, MapPin, Share2, Volume2, VolumeX, 
  Copy, Check, AlertTriangle, ExternalLink, ArrowLeft, Zap, Info 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/i18nContext';
import { EMERGENCY_DIRECTORY } from '../data/verifiedData';
import toast from 'react-hot-toast';

export const GuestSOS = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocError(true);
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);
    setLocError(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setLocLoading(false);
        toast.success(t('locationCopied') || 'GPS location updated');
      },
      (err) => {
        setLocLoading(false);
        setLocError(true);
        setLocation(null);
        toast.error('GPS access denied or unavailable. Fallback alert prepared.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getMapLink = () => {
    if (!location) return null;
    return `https://maps.google.com/?q=${location.lat},${location.lng}`;
  };

  const getEmergencyMessage = () => {
    const mapsUrl = getMapLink();
    if (mapsUrl) {
      return encodeURIComponent(
        `EMERGENCY ALERT! I need immediate help. My current GPS location is: ${mapsUrl}`
      );
    }
    return encodeURIComponent(
      `EMERGENCY ALERT! I need immediate help. (GPS location disabled/unavailable - please contact or trace my phone immediately)`
    );
  };

  const copyLocation = () => {
    const text = location 
      ? `EMERGENCY! My location: ${getMapLink()}`
      : `EMERGENCY ALERT! I need immediate help. Contact me immediately.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Alert text copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const toggleSiren = async () => {
    if (sirenActive) {
      stopSiren();
    } else {
      await startSiren();
    }
  };

  const startSiren = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();

      // Mobile Browser Check: Resume suspended AudioContext on user gesture
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      let high = false;
      const interval = setInterval(() => {
        if (!osc || ctx.state === 'closed') {
          clearInterval(interval);
          return;
        }
        try {
          osc.frequency.setValueAtTime(high ? 800 : 1200, ctx.currentTime);
          high = !high;
        } catch (e) {}
      }, 400);

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.8, ctx.currentTime);

      osc.start();
      audioCtxRef.current = ctx;
      oscRef.current = osc;
      setSirenActive(true);
      toast('Emergency Siren Activated!', { icon: '🚨' });
    } catch (e) {
      console.error('Audio siren error:', e);
      toast.error('Audio siren could not be initialized on this device.');
    }
  };

  const stopSiren = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch(e){}
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch(e){}
    }
    setSirenActive(false);
    toast('Siren Stopped', { icon: '🔇' });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-red-950/40 border border-red-500/30 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> No Signup Required
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">{t('guestSosTitle')}</h1>
          <p className="text-slate-300 text-sm">{t('guestSosSubtitle')}</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Primary Emergency 112 Trigger */}
      <div className="glass-card rounded-3xl p-8 border border-red-500/40 bg-gradient-to-br from-red-950/60 via-slate-900 to-red-950/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
        
        <div className="inline-block p-4 rounded-full bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Call National Emergency (112)</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            112 is India's single emergency response number for Police, Fire, and Ambulance services.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href="tel:112"
            className="btn-primary bg-red-600 hover:bg-red-500 border-red-500 text-white text-lg font-extrabold py-4 px-10 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-950/50 w-full sm:w-auto"
          >
            <PhoneCall className="w-6 h-6" /> Call 112 Now
          </a>

          <button
            onClick={toggleSiren}
            className={`py-4 px-8 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all w-full sm:w-auto ${
              sirenActive 
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse' 
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {sirenActive ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span>{sirenActive ? t('stopSiren') : t('sirenAlarm')}</span>
          </button>
        </div>
      </div>

      {/* GPS Location & Live Dispatch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GPS Card */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-fuchsia-400" /> Current GPS Location
            </h3>
            <button 
              onClick={fetchLocation} 
              disabled={locLoading}
              className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 underline disabled:opacity-50"
            >
              {locLoading ? t('locationFetching') : 'Refresh GPS'}
            </button>
          </div>

          {location ? (
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
                <span>Lat: {location.lat}</span>
                <span>Lng: {location.lng}</span>
                <span className="text-green-400 font-sans font-bold">±{location.accuracy}m</span>
              </div>
              <a 
                href={getMapLink()} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold"
              >
                View on Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">
                {locLoading ? t('locationFetching') : locError ? 'GPS access unavailable/blocked' : 'Click refresh to detect GPS position'}
              </p>
              {locError && (
                <p className="text-[10px] text-amber-400">
                  Fallback message prepared. WhatsApp & SMS sharing will send an emergency alert without coordinates.
                </p>
              )}
            </div>
          )}

          {/* Location Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={`https://wa.me/?text=${getEmergencyMessage()}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-center"
            >
              <Share2 className="w-4 h-4" /> WhatsApp Share
            </a>

            <a
              href={`sms:?body=${getEmergencyMessage()}`}
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-center"
            >
              <Share2 className="w-4 h-4" /> SMS Location
            </a>
          </div>

          <button
            onClick={copyLocation}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Alert Text!' : 'Copy Alert Text'}</span>
          </button>
        </div>

        {/* Rapid Helplines Grid */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-400" /> All Emergency Helplines
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {EMERGENCY_DIRECTORY.map((item, idx) => (
              <a
                key={idx}
                href={`tel:${item.number}`}
                className="bg-slate-950/60 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 p-3 rounded-2xl flex flex-col justify-center items-center text-center transition-all group"
              >
                <span className="text-xl font-extrabold text-red-400 group-hover:scale-105 transition-transform">{item.number}</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">{item.name}</span>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Safety Instructions Card */}
      <div className="glass-card rounded-3xl p-6 border border-amber-500/20 bg-amber-500/5 space-y-3">
        <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Immediate Safety Steps
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <li className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
            <strong>1. Stay in Public Light:</strong> Move towards well-lit public places, open stores, or security personnel if possible.
          </li>
          <li className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
            <strong>2. Broadcast GPS:</strong> Tap the WhatsApp or SMS buttons above to send your live Google Maps location link to friends.
          </li>
          <li className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
            <strong>3. Voice Command:</strong> Shout or activate the loud Emergency Siren above to attract immediate community attention.
          </li>
        </ul>
      </div>

    </div>
  );
};

export default GuestSOS;
