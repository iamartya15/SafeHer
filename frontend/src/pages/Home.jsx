import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, ChevronRight, Zap, Newspaper, TrendingUp, PhoneCall, 
  ArrowRight, ExternalLink, ShieldCheck, Heart, User, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../context/i18nContext';
import { getLatestNews } from '../services/newsService';
import { OFFICIAL_STATISTICS, SUCCESS_STORIES, EMERGENCY_DIRECTORY } from '../data/verifiedData';
import ComingSoonCard from '../components/ComingSoonCard';
import HowItWorks from '../components/HowItWorks';
import AppDownloadBadges from '../components/AppDownloadBadges';
import { Route, Gauge, Flame, Footprints } from 'lucide-react';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t, language } = useTranslation();
  
  // News State
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsCategory, setNewsCategory] = useState('all');
  const [newsPage, setNewsPage] = useState(1);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [isLiveNewsApi, setIsLiveNewsApi] = useState(false);

  const fetchNews = async (cat, page) => {
    setNewsLoading(true);
    const res = await getLatestNews(cat, page, 6);
    if (page === 1) {
       setNews(res.articles);
    } else {
       setNews(prev => {
         const existingKeys = new Set(prev.map(p => p.url || p.id || p.title));
         const newUnique = res.articles.filter(d => !existingKeys.has(d.url || d.id || d.title));
         return [...prev, ...newUnique];
       });
    }
    setIsLiveNewsApi(res.isLiveApi);
    setHasMoreNews(res.hasMore);
    setNewsLoading(false);
  };

  useEffect(() => {
    fetchNews(newsCategory, 1);
    setNewsPage(1);
  }, [newsCategory]);

  const loadMoreNews = () => {
    if (newsLoading || !hasMoreNews) return;
    const nextPage = newsPage + 1;
    setNewsPage(nextPage);
    fetchNews(newsCategory, nextPage);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-purple-600/10 rounded-full blur-3xl -z-10" />
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-4xl z-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-fuchsia-400" /> {t('navBrandTagline')}
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            {t('heroTitleLine1')} <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {t('heroTitleLine2')}
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/guest-sos" className="btn-primary bg-red-600 hover:bg-red-500 border-red-400 text-white font-extrabold flex items-center gap-2 group py-3.5 px-8 text-base shadow-xl shadow-red-950/40">
              <PhoneCall className="w-5 h-5" />
              <span>{t('btnGuestSosNow')}</span>
            </Link>

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-secondary py-3.5 px-8 text-base font-bold flex items-center gap-2">
                <span>{t('btnDashboard')}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/register" className="btn-secondary py-3.5 px-8 text-base font-bold flex items-center gap-2">
                <span>{t('btnGetStarted')}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* 2. PLATFORM STATS VS GOVERNMENT STATS */}
      <section className="pb-16 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            SafeHer Web Platform Operational Metrics
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: '24 / 7', label: 'Guest Emergency Access', desc: 'Instant 112 & SMS dispatch' },
            { value: '100%', label: 'Public Directory Coverage', desc: 'Verified 8+ national helplines' },
            { value: '< 2 sec', label: 'GPS Location Acquisition', desc: 'Browser Geolocation API' },
            { value: 'Verified', label: 'Government Data Aggregation', desc: 'NCRB, NCW & MHA records' }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </h3>
              <p className="text-xs font-bold text-white mt-1.5">{stat.label}</p>
              <p className="text-[10px] text-slate-400 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <HowItWorks />

      {/* 4. APP DOWNLOAD SECTION */}
      <AppDownloadBadges />

      {/* 5. COMMUNITY EXAMPLES & TESTIMONIALS */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12 relative">
         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10" />
         
         <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-xs">
              <Heart className="w-4 h-4" /> Community Scenarios
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">How Women Use SafeHer</h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Representative community safety workflows demonstrating Guest SOS, Safe Places map, and emergency hotline features.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUCCESS_STORIES.map((story, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col justify-between h-full relative group">
                 <div className="absolute top-0 right-8 w-12 h-1 bg-indigo-500/50 rounded-b-md group-hover:bg-indigo-400 transition-colors" />
                 <p className="text-sm text-slate-300 italic leading-relaxed mb-6 flex-1 relative z-10">"{story.story}"</p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                     <User className="w-5 h-5 text-indigo-400" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-white">{story.name}</p>
                     <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{story.location} • {story.type}</p>
                   </div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 6. LATEST NEWS & GOVERNMENT ADVISORIES */}
      <section id="news" className="py-20 px-4 md:px-8 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-fuchsia-400 font-bold uppercase tracking-wider text-xs">
                <Newspaper className="w-4 h-4" /> {isLiveNewsApi ? 'Live Updates (GNews API)' : 'Curated Verified Advisories'}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Women's Safety News</h2>
              <p className="text-xs text-slate-400">
                Last updated: <span className="text-slate-200 font-medium">{new Date().toLocaleDateString()}</span>
              </p>
            </div>
            
            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
               {['all', 'Government', 'Safety', 'Cyber'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setNewsCategory(cat)}
                   className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 ${newsCategory === cat ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                 >
                   {cat === 'all' ? 'Latest' : cat}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, i) => (
              <a key={article.id || i} href={article.url} target="_blank" rel="noreferrer" className="group glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-fuchsia-500/10">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute bottom-4 left-4 z-20 bg-slate-900/80 text-fuchsia-300 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg">
                    {article.source}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex justify-between">
                    <span>{article.category || 'News'}</span>
                    <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Verified'}</span>
                  </span>
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-fuchsia-400 transition-colors leading-tight">{article.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1 leading-relaxed">{article.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors uppercase tracking-widest">
                    Read Article <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
            
            {newsLoading && [1, 2, 3].map(i => (
              <div key={`skel-${i}`} className="animate-pulse glass-card rounded-3xl h-[400px] border border-white/5" />
            ))}
          </div>
          
          {news.length > 0 && (
            <div className="text-center pt-4">
               {hasMoreNews ? (
                 <button onClick={loadMoreNews} disabled={newsLoading} className="btn-secondary py-3 px-8 text-sm disabled:opacity-50 transition-opacity">
                   {newsLoading ? 'Loading Articles...' : 'Load More Articles'}
                 </button>
               ) : (
                 <p className="text-sm font-medium text-slate-500">No more articles available</p>
               )}
            </div>
          )}
        </div>
      </section>

      {/* 7. OFFICIAL GOVERNMENT STATISTICS */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-xs">
            <TrendingUp className="w-4 h-4" /> Official Public Data
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">National Crimes & Recovery Statistics</h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Source: <span className="font-semibold text-slate-300">{OFFICIAL_STATISTICS.source}</span> (Last Updated: {OFFICIAL_STATISTICS.lastUpdated})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OFFICIAL_STATISTICS.stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-3xl font-black text-white tracking-tight">{stat.value}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center pt-4">
           <Link to="/missing-women" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
             View Public Missing Women Dashboard <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </section>

      {/* 8. EMERGENCY GUIDANCE & DIRECTORY */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-red-950/20 to-transparent border-y border-red-500/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-xs">
                <PhoneCall className="w-4 h-4" /> Immediate Assistance
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">{t('emergencyTitle')}</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">{t('emergencySubtitle')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {EMERGENCY_DIRECTORY.map((em, i) => (
                <a key={i} href={`tel:${em.number}`} className="glass-card rounded-xl p-4 border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 flex flex-col items-center justify-center text-center transition-all group">
                  <span className="text-2xl font-black text-red-400 group-hover:scale-110 transition-transform">{em.number}</span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">{em.name}</span>
                </a>
              ))}
            </div>

            <Link to="/awareness" className="btn-secondary w-full text-center text-sm py-3 block font-bold">Explore Legal Rights & FIR Guidance</Link>
          </div>

          <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-6">
                <ShieldCheck className="w-10 h-10 text-green-400" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">Immediate Zero FIR Protection</h3>
             <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-8">
               Did you know a Zero FIR can be filed at ANY police station in India regardless of jurisdiction? Learn your legal rights under Indian law.
             </p>
             <Link to="/awareness" className="text-sm font-bold uppercase tracking-widest text-green-400 hover:text-green-300 flex items-center gap-2">
               Learn Legal Rights <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* 9. UPCOMING FEATURES ROADMAP (v2.0) */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            Engineering Roadmap
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Coming Soon in v2.0</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The features below represent hardware and deep AI integrations currently under development for version 2.0 release.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[220px]">
          {[
            { title: 'AI Route Predictor', desc: 'Analyzes routes using historical incidents, lighting, and community reports.', icon: Route, gradient: 'from-purple-500/20 to-indigo-500/20' },
            { title: 'Safety Score Engine', desc: 'Dynamic score calculation utilizing real-time crowd density and weather.', icon: Gauge, gradient: 'from-fuchsia-500/20 to-rose-500/20' },
            { title: 'Interactive Heatmap', desc: 'WebGL heatmap generated from thousands of verified local reports.', icon: Flame, gradient: 'from-orange-500/20 to-red-500/20' },
            { title: 'Safe Walk Mode', desc: 'Automatic safety check-ins with intelligent SOS warnings on missed checks.', icon: Footprints, gradient: 'from-emerald-500/20 to-teal-500/20' },
            { title: 'Voice SOS', desc: 'Trigger emergency alerts instantly using secure voice biometrics.', icon: Zap, gradient: 'from-cyan-500/20 to-blue-500/20' },
            { title: 'Smart Wearable Integration', desc: 'Seamlessly sync with smartwatches for discreet 1-tap SOS triggers.', icon: Heart, gradient: 'from-pink-500/20 to-rose-500/20' },
            { title: 'Offline Emergency Mode', desc: 'Send encrypted SOS alerts via SMS/Bluetooth mesh when data fails.', icon: Shield, gradient: 'from-green-500/20 to-emerald-500/20' },
            { title: 'Family Tracking', desc: 'Share secure, live encrypted location trails with verified family members.', icon: User, gradient: 'from-violet-500/20 to-purple-500/20' }
          ].map((feat, i) => (
            <ComingSoonCard key={i} {...feat} />
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
