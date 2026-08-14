import { Shield, Target, Users, Award, Heart, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUs = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" /> India's Dedicated Women Safety Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
          Empowering Safety Through <br />
          <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Technology & Community
          </span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          SafeHer AI is an advanced web and mobile safety ecosystem engineered to provide immediate 1-tap emergency assistance, live GPS tracking, verified government datasets, and proactive safe route planning across India.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            To eliminate delays in emergency situations by creating a seamless bridge between women in distress, their trusted guardians, and official national emergency services like 112, 1091, and 181.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Community Guardian Network</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Safety improves when communities stand together. SafeHer empowers users to set up active guardian circles who are instantly alerted with live GPS coordinates during an emergency.
          </p>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/10 space-y-6">
        <h3 className="text-xl font-bold text-white text-center">What Sets SafeHer AI Apart</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/5 space-y-2">
            <h4 className="font-bold text-fuchsia-400 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Guest SOS Mode
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              No login barriers. Instant 1-tap call to 112 and location sharing available to anyone in an immediate crisis.
            </p>
          </div>

          <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/5 space-y-2">
            <h4 className="font-bold text-purple-400 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Verified Govt Data
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real public crime statistics, missing persons trends, and official reports aggregated directly from NCRB, NCW, and MHA.
            </p>
          </div>

          <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/5 space-y-2">
            <h4 className="font-bold text-indigo-400 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Safe Places & Maps
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Find verified safe shelters, police help desks, hospitals, and well-lit transit hubs near your current location.
            </p>
          </div>
        </div>
      </div>

      {/* Official Data Source Disclaimer */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-purple-500/20 bg-purple-500/5 space-y-3 text-center">
        <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider">Independent Data Attribution Disclaimer</h4>
        <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SafeHer AI is an independent safety technology platform. All national statistics, crime reports, and helpline numbers displayed on this platform are referenced directly from public domain publications of the <strong>National Crime Records Bureau (NCRB)</strong>, <strong>National Commission for Women (NCW)</strong>, and the <strong>Ministry of Home Affairs (MHA)</strong>. Representation of these agencies does not imply direct government ownership.
        </p>
      </div>

    </div>
  );
};

export default AboutUs;
