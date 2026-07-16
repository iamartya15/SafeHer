import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ComingSoonCard = ({ title, description, icon: Icon, gradient }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5 transition-all flex flex-col justify-between h-full hover:shadow-2xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />
      
      <div className="relative z-10 space-y-5 flex-1">
        <div className="flex justify-between items-start">
          <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors shadow-lg`}>
            {Icon && <Icon className="w-7 h-7 text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300" />}
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white/70 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" /> Coming Soon
          </span>
        </div>
        
        <div className="pt-2">
          <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight group-hover:text-fuchsia-100 transition-colors">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ComingSoonCard;
