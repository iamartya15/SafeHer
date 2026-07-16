import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Phone, ChevronRight, Search, Shield, Scale, Wifi, Map, Heart, X, ExternalLink } from 'lucide-react';
import { AWARENESS_MODULES } from '../data/verifiedData';

const ICONS = {
  Scale, Shield, Wifi, Map, Heart
};

export const Awareness = () => {
  const [activeModule, setActiveModule] = useState(AWARENESS_MODULES[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = AWARENESS_MODULES.map(mod => {
    if (!searchQuery) return mod;
    const filteredTopics = mod.topics.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...mod, topics: filteredTopics };
  }).filter(mod => mod.topics.length > 0 || mod.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const currentModuleData = filteredModules.find(m => m.id === activeModule) || filteredModules[0];

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-20 max-w-7xl mx-auto space-y-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-fuchsia-400 font-bold uppercase tracking-wider text-sm">
            <BookOpen className="w-4 h-4" /> Educational Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Awareness & Resources</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Knowledge is your first line of defense. Master your legal rights, learn situational awareness, and access verified support networks.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search topics (e.g., FIR, Cyber)..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-slate-900/50 border border-slate-700 text-sm text-white rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-fuchsia-500 transition-colors"
           />
           {searchQuery && (
             <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300">
               <X className="w-3 h-3" />
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="space-y-2 lg:col-span-1">
           {filteredModules.length === 0 ? (
             <p className="text-sm text-slate-500 italic p-4">No categories match your search.</p>
           ) : (
             filteredModules.map(mod => {
               const Icon = ICONS[mod.icon] || BookOpen;
               const isActive = activeModule === mod.id;
               return (
                 <button
                   key={mod.id}
                   onClick={() => setActiveModule(mod.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                     isActive 
                       ? 'bg-fuchsia-500/10 border border-fuchsia-500/30 shadow-inner' 
                       : 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10'
                   }`}
                 >
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${isActive ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                       <Icon className="w-4 h-4" />
                     </div>
                     <span className={`font-semibold text-sm ${isActive ? 'text-fuchsia-300' : 'text-slate-300'}`}>
                       {mod.title}
                     </span>
                   </div>
                   {isActive && <ChevronRight className="w-4 h-4 text-fuchsia-400" />}
                 </button>
               )
             })
           )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 min-h-[500px]">
          <AnimatePresence mode="wait">
            {currentModuleData ? (
              <motion.div
                key={currentModuleData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="pb-4 border-b border-white/10">
                   <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                     {React.createElement(ICONS[currentModuleData.icon] || BookOpen, { className: "w-6 h-6 text-fuchsia-400" })}
                     {currentModuleData.title}
                   </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentModuleData.topics.map((topic, i) => (
                    <div key={i} className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between h-full group">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">{topic.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">{topic.content}</p>
                      </div>
                      <button className="self-start text-xs font-bold uppercase tracking-widest text-fuchsia-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1.5">
                        {topic.actionLabel} <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                 <Search className="w-12 h-12 opacity-20" />
                 <p>No topics found matching your search.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Emergency CTA */}
      <div className="mt-12 glass-card rounded-3xl p-8 md:p-10 border border-red-500/20 bg-gradient-to-r from-red-950/40 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 flex-1">
           <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
               <Phone className="w-5 h-5 text-red-400" />
             </div>
             Need Immediate Assistance?
           </h3>
           <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
             If you are in immediate danger or facing abuse, do not wait. Trigger your SafeHer SOS immediately, or call the National Emergency Number. Help is available 24/7.
           </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
           <a href="tel:112" className="btn-primary bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 text-lg border-none shadow-lg shadow-red-900/50 flex justify-center">Dial 112</a>
        </div>
      </div>

    </div>
  );
};

export default Awareness;
