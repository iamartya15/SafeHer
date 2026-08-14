import { useState } from 'react';
import { ShieldAlert, PhoneCall, X, MapPin, Share2, Volume2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/i18nContext';
import toast from 'react-hot-toast';

export const FloatingSOSButton = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      openFallbackWhatsapp();
      return;
    }
    toast.loading('Fetching location...', { id: 'sos-loc' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        const text = encodeURIComponent(`EMERGENCY SOS! I need help. Location: ${url}`);
        toast.dismiss('sos-loc');
        window.open(`https://wa.me/?text=${text}`, '_blank');
      },
      (err) => {
        toast.dismiss('sos-loc');
        toast.error('Location access denied/unavailable. Sending fallback alert...');
        openFallbackWhatsapp();
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const openFallbackWhatsapp = () => {
    const text = encodeURIComponent(`EMERGENCY SOS! I need immediate help. Contact or trace my phone immediately.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Floating SOS Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Trigger Quick Emergency SOS"
          className="btn-primary bg-red-600 hover:bg-red-500 border-red-400 text-white font-black text-xs uppercase tracking-widest px-5 py-3.5 rounded-full shadow-2xl shadow-red-600/50 flex items-center gap-2 animate-pulse hover:scale-105 transition-all"
        >
          <ShieldAlert className="w-5 h-5 text-white" />
          <span className="hidden sm:inline">EMERGENCY</span> SOS
        </button>
      </div>

      {/* Emergency Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl p-6 md:p-8 max-w-lg w-full border border-red-500/40 bg-slate-900/95 space-y-6 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Emergency Assistance</h3>
                  <p className="text-xs text-slate-400">1-Tap instant emergency dispatch</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct 112 Call Button */}
            <a
              href="tel:112"
              className="btn-primary bg-red-600 hover:bg-red-500 border-red-400 text-white text-lg font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 w-full shadow-lg shadow-red-950/60"
            >
              <PhoneCall className="w-6 h-6" /> Call National Emergency 112
            </a>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareLocation}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-center"
              >
                <Share2 className="w-4 h-4" /> Share Location (WA)
              </button>

              <a
                href="tel:1091"
                className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-center"
              >
                <PhoneCall className="w-4 h-4" /> Call 1091 (Women)
              </a>
            </div>

            {/* Link to Full Guest SOS Mode */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-slate-400">Need full guest emergency suite?</span>
              <Link
                to="/guest-sos"
                onClick={() => setIsOpen(false)}
                className="text-fuchsia-400 font-bold hover:text-fuchsia-300 flex items-center gap-1 uppercase tracking-wider"
              >
                Guest SOS Mode <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSOSButton;
