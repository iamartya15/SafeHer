import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Users, UserMinus, UserCheck, Activity, AlertTriangle } from 'lucide-react';
import { MISSING_WOMEN_STATS } from '../data/verifiedData';

export const MissingDashboard = () => {
  const [activeTab, setActiveTab] = useState('statewise'); // 'statewise' or 'yearly'

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-20 max-w-7xl mx-auto space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="inline-flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm">
          <UserMinus className="w-4 h-4" /> Official Missing Persons Data
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Missing Women & Children</h1>
        <p className="text-slate-400 max-w-3xl text-lg leading-relaxed">
          Verified data sourced directly from the <span className="font-semibold text-slate-300">{MISSING_WOMEN_STATS.source}</span> ({MISSING_WOMEN_STATS.year}). This interactive dashboard visualizes the crisis to raise awareness, mobilize community resources, and track official recovery efforts.
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Missing Women', val: MISSING_WOMEN_STATS.totalMissingWomen, icon: Users, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { label: 'Total Missing Girls', val: MISSING_WOMEN_STATS.totalMissingGirls, icon: UserMinus, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
          { label: 'Recovered / Traced', val: MISSING_WOMEN_STATS.recovered, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { label: 'Overall Recovery Rate', val: MISSING_WOMEN_STATS.recoveryRate, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
        ].map((s, i) => (
          <div key={i} className={`glass-card rounded-2xl p-6 border ${s.border} shadow-xl flex items-center gap-5 relative overflow-hidden group hover:bg-white/5 transition-colors`}>
             <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                <s.icon className="w-7 h-7" />
             </div>
             <div>
                <h4 className={`text-2xl font-black tracking-tight ${s.color}`}>{s.val}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">{s.label}</p>
             </div>
             <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${s.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* Advanced Data Visualization Section */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
        
        <div className="border-b border-white/10 bg-slate-900/50 p-4 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
           <h3 className="text-2xl font-bold text-white flex items-center gap-3">
             <MapIcon className="w-6 h-6 text-fuchsia-400" /> National Overview
           </h3>
           <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
             <button 
               onClick={() => setActiveTab('statewise')}
               className={`px-6 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'statewise' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               State-wise Distribution
             </button>
             <button 
               onClick={() => setActiveTab('yearly')}
               className={`px-6 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'yearly' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'}`}
             >
               Yearly Trends
             </button>
           </div>
        </div>

        <div className="p-6 md:p-8 min-h-[400px]">
          {activeTab === 'statewise' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                 {MISSING_WOMEN_STATS.stateWise.map((st, i) => {
                    const missingPct = (st.missing / 50000) * 100;
                    const recoveryPct = (st.recovered / st.missing) * 100;
                    
                    return (
                      <div key={i} className="space-y-2 group">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-200">{st.state}</span>
                          <div className="text-right">
                             <span className="font-bold text-red-400">{st.missing.toLocaleString()}</span>
                             <span className="text-xs text-slate-500 ml-2">({Math.round(recoveryPct)}% recovered)</span>
                          </div>
                        </div>
                        <div className="relative w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                          {/* Missing Bar */}
                          <div className="absolute top-0 left-0 bg-red-500/80 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(missingPct, 100)}%` }} />
                          {/* Recovered Bar (Overlaps to show proportion of missing that are recovered) */}
                          <div className="absolute top-0 left-0 bg-green-500 h-full rounded-full transition-all duration-1000 delay-300" style={{ width: `${Math.min((missingPct * (recoveryPct/100)), 100)}%` }} />
                        </div>
                      </div>
                    )
                 })}
               </div>
               
               {/* Map Placeholder Graphic */}
               <div className="flex flex-col items-center justify-center text-center p-8 border border-white/5 bg-white/5 rounded-2xl h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')] opacity-10 bg-cover bg-center mix-blend-overlay" />
                  <MapIcon className="w-16 h-16 text-slate-500 mb-4 opacity-50" />
                  <h4 className="text-lg font-bold text-slate-300 mb-2">Interactive GIS Map</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Version 1.2 will introduce a fully interactive WebGL heatmap featuring district-level drill-downs and predictive cluster analysis.
                  </p>
               </div>
             </div>
          )}

          {activeTab === 'yearly' && (
             <div className="flex flex-col justify-end h-[350px] space-y-4">
               <div className="flex items-end justify-around h-full border-b border-slate-700 pb-4 relative">
                 {/* Y-axis guidelines */}
                 <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-t border-slate-500 w-full" />
                    <div className="border-t border-slate-500 w-full" />
                    <div className="border-t border-slate-500 w-full" />
                    <div className="border-t border-slate-500 w-full" />
                 </div>
                 
                 {MISSING_WOMEN_STATS.yearlyTrends.map((trend, i) => {
                    const heightPct = (trend.cases / 300000) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 relative group z-10 w-12 sm:w-16 h-full justify-end">
                        <span className="text-[10px] font-bold text-red-300 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 px-2 py-1 rounded whitespace-nowrap z-20">
                          {trend.cases.toLocaleString()}
                        </span>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="w-full bg-gradient-to-t from-red-900/50 to-red-500 rounded-t-sm border-t-2 border-red-400 group-hover:brightness-125 transition-all cursor-pointer relative"
                        >
                          <div className="absolute inset-0 bg-red-400 blur opacity-0 group-hover:opacity-40 transition-opacity" />
                        </motion.div>
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-400">{trend.year}</span>
                      </div>
                    )
                 })}
               </div>
               <p className="text-center text-xs text-slate-500">Note: 2020 recorded a dip primarily due to nationwide COVID-19 mobility restrictions.</p>
             </div>
          )}
        </div>
      </div>
      
      {/* Alert Banner */}
      <div className="glass-card rounded-2xl p-6 border border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-400 mb-1">Important Notice Regarding Missing Persons</h4>
          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            In India, there is <strong className="text-white">NO 24-HOUR WAITING PERIOD</strong> required to file a missing person report for women or children. If you suspect someone is missing or in danger, approach the nearest police station immediately and demand an FIR. If refused, invoke your right to a Zero FIR.
          </p>
        </div>
      </div>

    </div>
  );
};

export default MissingDashboard;
