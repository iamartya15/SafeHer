import { motion } from 'framer-motion';

export const ComingSoonCard = ({ title, description, icon: Icon, gradient = 'from-purple-500/20 to-fuchsia-500/20' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col justify-between overflow-hidden relative group hover:border-purple-500/20"
    >
      {/* Glow Effect */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />

      <div className="space-y-4 relative z-10">
        {/* Icon & Badge */}
        <div className="flex items-center justify-between">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            {Icon && <Icon className="w-6 h-6 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 text-fuchsia-300 px-2 py-0.5 rounded-full shadow-inner animate-pulse-slow">
            Coming Soon
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed font-light">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end relative z-10">
        <span className="text-[11px] text-slate-500 font-medium tracking-wide">
          Roadmap Phase 2
        </span>
      </div>
    </motion.div>
  );
};
export default ComingSoonCard;
