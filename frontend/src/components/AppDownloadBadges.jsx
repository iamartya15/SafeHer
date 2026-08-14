import { Smartphone, Globe, Check, Zap, Download } from 'lucide-react';
import { useTranslation } from '../context/i18nContext';

export const AppDownloadBadges = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Download Banner */}
      <div className="glass-card rounded-3xl p-8 md:p-12 border border-fuchsia-500/30 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl" />
        
        <div className="space-y-4 max-w-xl text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold uppercase tracking-wider border border-fuchsia-500/30">
            <Smartphone className="w-3.5 h-3.5" /> Mobile & Web Ecosystem
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            {t('appDownloadTitle')}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {t('appDownloadSubtitle')}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            {/* Google Play Store Badge Link */}
            <a
              href="https://play.google.com/store/apps/details?id=live.safeher.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-white/20 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:scale-105 group"
            >
              <svg className="w-7 h-7 fill-current text-emerald-400" viewBox="0 0 24 24">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Get it on</div>
                <div className="text-base font-extrabold leading-tight">Google Play</div>
              </div>
            </a>

            {/* Direct Web Access button */}
            <a
              href="#guest-sos"
              className="btn-secondary py-3.5 px-6 text-xs font-bold flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-purple-400" /> Instant Web SOS
            </a>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="w-full lg:w-96 glass-card rounded-2xl p-6 border border-white/10 space-y-4 text-xs z-10 bg-slate-950/70">
          <h3 className="font-bold text-white text-sm border-b border-white/10 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-fuchsia-400" /> {t('webVsAppTitle')}
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-slate-300">
              <span>Instant Guest SOS (No Login)</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5"/> Web & App</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-t border-white/5 pt-2">
              <span>Live GPS WhatsApp Share</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5"/> Web & App</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-t border-white/5 pt-2">
              <span>Offline Shake-to-SOS (SMS)</span>
              <span className="font-bold text-fuchsia-400 flex items-center gap-1"><Smartphone className="w-3.5 h-3.5"/> Android Only</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-t border-white/5 pt-2">
              <span>Background Bluetooth Mesh</span>
              <span className="font-bold text-fuchsia-400 flex items-center gap-1"><Smartphone className="w-3.5 h-3.5"/> Android Only</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default AppDownloadBadges;
