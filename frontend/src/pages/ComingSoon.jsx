import ComingSoonCard from '../components/ComingSoonCard';
import {
  Route,
  Gauge,
  Flame,
  Footprints,
  Radio,
  Activity,
  LineChart,
  Brain,
  Users,
  Lightbulb,
  GitFork,
  BellRing,
  Mic,
  Watch,
  WifiOff
} from 'lucide-react';

export const ComingSoon = () => {
  const roadmaps = [
    {
      title: 'AI Route Safety Prediction',
      description: 'AI will analyze multiple travel routes using historical incidents, crowd activity, lighting conditions, and community reports to recommend the safest route.',
      icon: Route,
      gradient: 'from-purple-500/20 to-indigo-500/20',
      eta: 'Q3 2026'
    },
    {
      title: 'AI Safety Score Engine',
      description: 'Future AI-powered safety score calculations utilizing historical crime registries, community reports, time parameters, weather, lighting indexes, and crowd densities.',
      icon: Gauge,
      gradient: 'from-fuchsia-500/20 to-rose-500/20',
      eta: 'Q4 2026'
    },
    {
      title: 'Safety Heatmap',
      description: 'Interactive graphical heatmap overlays generated from thousands of verified local community reports and historical alarms.',
      icon: Flame,
      gradient: 'from-orange-500/20 to-red-500/20',
      eta: 'Q1 2027'
    },
    {
      title: 'Safe Walk Mode',
      description: 'Automatic safety check-ins triggered every 30 seconds with intelligent SOS warnings in case checks are missed.',
      icon: Footprints,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      eta: 'Q3 2026'
    },
    {
      title: 'Live Guardian Tracking',
      description: 'Encrypted, high-fidelity real-time location sharing with emergency guardians during active trips.',
      icon: Radio,
      gradient: 'from-pink-500/20 to-rose-500/20'
    },
    {
      title: 'Real-time Socket Notifications',
      description: 'Instant, bidirectional alert dispatches across all connected devices using Socket.IO networks.',
      icon: Activity,
      gradient: 'from-violet-500/20 to-purple-500/20'
    },
    {
      title: 'Advanced Analytics Dashboard',
      description: 'AI-driven spatial analytics plotting crime trends, safety improvements, and local neighborhood metrics.',
      icon: LineChart,
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'Predictive Crime Detection',
      description: 'Machine Learning algorithms tracking unsafe neighborhood coordinates to predict hot zones before incidents occur.',
      icon: Brain,
      gradient: 'from-purple-500/20 to-fuchsia-500/20'
    },
    {
      title: 'Crowd Density Detection',
      description: 'Estimate surrounding crowd levels using satellite data and neural network calculations.',
      icon: Users,
      gradient: 'from-teal-500/20 to-green-500/20'
    },
    {
      title: 'Lighting Condition Analysis',
      description: 'Evaluate street light coverage and shadows using computer vision algorithms to rate road lighting safety.',
      icon: Lightbulb,
      gradient: 'from-amber-500/20 to-yellow-500/20'
    },
    {
      title: 'Smart Route Comparison',
      description: 'Compare multiple potential walking/driving routes side-by-side using consolidated AI safety ratings.',
      icon: GitFork,
      gradient: 'from-indigo-500/20 to-blue-500/20'
    },
    {
      title: 'Push Notifications',
      description: 'Instant system push notifications arriving on desktop browsers and mobile lock screens.',
      icon: BellRing,
      gradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      title: 'Voice Activated SOS',
      description: 'Trigger emergency SOS alerts hands-free using custom programmed vocal triggers and distress phrases.',
      icon: Mic,
      gradient: 'from-red-500/20 to-rose-500/20'
    },
    {
      title: 'Wearable Device Integration',
      description: 'Connect smartwatches and smart bands to trigger SOS alarms with a tap on the wrist.',
      icon: Watch,
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      title: 'Offline Emergency Mode',
      description: 'Emergency safety access and local alerts sharing without active mobile data networks.',
      icon: WifiOff,
      gradient: 'from-slate-500/20 to-slate-700/20'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          SafeHer AI Roadmap
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Explore the upcoming premium safety modules planned for implementation in Phase 2.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps.map((r, index) => (
          <ComingSoonCard
            key={index}
            title={r.title}
            description={r.description}
            icon={r.icon}
            gradient={r.gradient}
            eta={r.eta}
          />
        ))}
      </div>

    </div>
  );
};
export default ComingSoon;
