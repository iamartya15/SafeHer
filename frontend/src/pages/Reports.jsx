import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ShieldCheck, ExternalLink } from 'lucide-react';
import { OFFICIAL_REPORTS } from '../data/verifiedData';

export const Reports = () => {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-20 max-w-7xl mx-auto space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-sm">
          <FileText className="w-4 h-4" /> Official Publications
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Women Safety Reports</h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Access and download verified whitepapers, annual crime reports, global estimations, and guidelines from official government and global organizations (NCRB, NCW, MHA, WHO, UN Women).
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {OFFICIAL_REPORTS.map((report, i) => (
          <div key={i} className="glass-card rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group flex flex-col h-full overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10">
            {/* Image Cover */}
            <div className="h-48 relative overflow-hidden">
               <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-20" />
               <img 
                 src={report.image} 
                 alt={report.title} 
                 loading="lazy"
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
               />
               <span className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 backdrop-blur-md text-[10px] font-bold text-slate-300 uppercase tracking-widest shadow-lg">
                 {report.year}
               </span>
               <div className="absolute bottom-4 left-4 z-30 w-10 h-10 rounded-xl bg-indigo-500/90 flex items-center justify-center text-white shadow-lg backdrop-blur-md">
                 <ShieldCheck className="w-5 h-5" />
               </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
               <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-indigo-400 transition-colors">{report.title}</h3>
               <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-4">{report.publisher}</p>
               <p className="text-sm text-slate-400 flex-1 leading-relaxed">{report.summary}</p>
               
               <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                 <a href={report.link} target="_blank" rel="noopener noreferrer" className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-bold">
                   <Download className="w-4 h-4" /> Download ({report.size})
                 </a>
                 <a href={report.link} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors" title="Read Online">
                   <ExternalLink className="w-4 h-4" />
                 </a>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
