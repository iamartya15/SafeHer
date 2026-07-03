import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, MapPin, HeartHandshake, Bot, Heart, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-purple-600/10 rounded-full blur-3xl -z-10" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-300 text-xs font-semibold uppercase tracking-wider shadow-inner animate-pulse-slow">
            <Zap className="w-3.5 h-3.5" /> Next-Gen AI Safety Companion
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Empowering Women Safety Through <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Predictive AI Intelligence
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            SafeHer AI is an advanced, startup-ready safety network integrating real-time incident mapping, instant guardian alerts, local safe zone routers, and an interactive Gemini-powered AI companion.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2 group text-sm py-3 px-6">
                <span>Access Dashboard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center gap-2 group text-sm py-3 px-6">
                  <span>Get Started Free</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="btn-secondary text-sm py-3 px-6">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Safety Statistics */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: '10k+', label: 'Active Users' },
            { value: '99.9%', label: 'Uptime Delivery' },
            { value: '50ms', label: 'SOS Alert Dispatch' },
            { value: '24/7', label: 'AI Guard Active' }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center border border-white/5 shadow-lg">
              <h3 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">{stat.value}</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-white">State-of-the-Art Protection</h2>
          <p className="text-sm text-slate-400">Polished, enterprise-grade architecture serving critical emergency utilities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Instant SOS Trigger',
              desc: 'One-click alert that archives hardware status, GPS telemetry, and browser data, triggering immediate emails and notifications to guardians.',
              icon: Shield,
              glow: 'hover:shadow-red-500/5'
            },
            {
              title: 'Interactive Safety Map',
              desc: 'OpenStreetMap integration powered by Leaflet. Plot community reports and toggle categories such as Stalking, Harassment, or Poor Lighting.',
              icon: MapPin,
              glow: 'hover:shadow-purple-500/5'
            },
            {
              title: 'Guardian Command Center',
              desc: 'Dual-dashboard links allowing emergency contacts to manage monitored users, view user positions, accept guardian requests, and track alerts.',
              icon: HeartHandshake,
              glow: 'hover:shadow-fuchsia-500/5'
            },
            {
              title: 'AI Companion Assistant',
              desc: 'Direct connection with Google Gemini models. Get immediate guidance on how to navigate insecure paths, stalking scenarios, or walk alone.',
              icon: Bot,
              glow: 'hover:shadow-blue-500/5'
            }
          ].map((feat, i) => {
            return (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className={`glass-card rounded-2xl p-6 border border-white/5 shadow-xl transition-all duration-300 ${feat.glow} flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl inline-block">
                      <feat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Mission Statement */}
      <section className="py-16 px-4 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center"><Heart className="w-8 h-8 text-fuchsia-500 fill-fuchsia-500/10" /></div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Our Mission</h2>
          <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto italic font-light">
            "To bridge the gap between technology and safety by delivering state-of-the-art location markers and smart AI companions that give women absolute security and control when traveling alone."
          </p>
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">The SafeHer AI Team</p>
        </div>
      </section>

      {/* 5. Testimonial Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">What Our Community Says</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "The Gemini AI companion is incredibly smart. I felt someone was following me, and it instantly guided me to a well-lit pharmacy nearby.",
              author: "Priya S.",
              role: "College Student"
            },
            {
              quote: "The SOS system works. I tested it with my parents and they received the Google Maps location link within seconds in their inbox.",
              author: "Anjali M.",
              role: "Software Engineer"
            },
            {
              quote: "As a guardian, the dashboard makes it simple to approve requests, check trip status, and view alert history on a clean dark UI.",
              author: "Rajesh K.",
              role: "Father / Guardian"
            }
          ].map((testi, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic font-light">"{testi.quote}"</p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  {testi.author[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{testi.author}</h4>
                  <span className="text-[10px] text-slate-500">{testi.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Call To Action (CTA) */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto text-center relative">
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-r from-purple-950/20 to-fuchsia-950/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-fuchsia-500/5 blur-3xl -z-10" />
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Join SafeHer AI Today</h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Equip yourself or your loved ones with the advanced tools needed for proactive safety and instant emergency communication.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link to="/register" className="btn-primary w-full sm:w-auto text-sm py-3 px-8">
                Create Account
              </Link>
              <Link to="/coming-soon" className="btn-secondary w-full sm:w-auto text-sm py-3 px-8">
                View Feature Roadmap
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
