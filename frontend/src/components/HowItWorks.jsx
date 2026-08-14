import { UserPlus, Shield, PhoneCall, MapPinCheck } from 'lucide-react';
import { useTranslation } from '../context/i18nContext';

export const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: UserPlus,
      title: t('step1Title') || "1. Quick Guest or Account Setup",
      desc: t('step1Desc') || "Access immediate guest emergency tools instantly, or create an account to save custom guardians and preferences.",
      badge: "Step 01",
      color: "from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/30 text-fuchsia-400"
    },
    {
      icon: Shield,
      title: t('step2Title') || "2. Add Trusted Guardians",
      desc: t('step2Desc') || "Connect trusted family members and friends who receive instant SMS/WhatsApp alerts when SOS is triggered.",
      badge: "Step 02",
      color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400"
    },
    {
      icon: PhoneCall,
      title: t('step3Title') || "3. 1-Tap Emergency SOS",
      desc: t('step3Desc') || "Trigger emergency SOS with one tap. Broadcast your live GPS trail and auto-dial national emergency 112.",
      badge: "Step 03",
      color: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400"
    },
    {
      icon: MapPinCheck,
      title: t('step4Title') || "4. Navigate Safe Routes",
      desc: t('step4Desc') || "Use real-time community reports, street lighting data, and safe place directories to navigate with peace of mind.",
      badge: "Step 04",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400"
    }
  ];

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-bold uppercase tracking-wider">
          Simple & Proactive
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white">{t('howItWorksTitle')}</h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          {t('howItWorksSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between relative group hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} border flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
