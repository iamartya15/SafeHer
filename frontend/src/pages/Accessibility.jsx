import { Eye, CheckCircle2, MessageSquare, Volume2, Shield } from 'lucide-react';

export const Accessibility = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto space-y-10">
      
      <div className="space-y-4 text-center border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5" /> Inclusive Product Design
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Accessibility Statement</h1>
        <p className="text-slate-400 text-sm">
          SafeHer AI is committed to providing an accessible, usable safety experience for all individuals regardless of ability.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> WCAG 2.1 Conformance Standards
          </h2>
          <p>
            We strive to adhere to the Web Content Accessibility Guidelines (WCAG 2.1 Level AA). Key accessibility measures built into SafeHer AI include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong>High-Contrast Aesthetics:</strong> Dark glassmorphism interface optimized for legibility under dim lighting conditions.</li>
            <li><strong>Screen Reader Accessibility:</strong> Semantic HTML5 tags, landmark regions, and descriptive `aria-label` attributes on all emergency action buttons.</li>
            <li><strong>Keyboard Navigation:</strong> Full focus ring styling and tab key navigation support across all routes and emergency modals.</li>
            <li><strong>Text Scaling:</strong> Fluid typography scale allowing up to 200% browser font zoom without breaking emergency workflows.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" /> Accessibility Feedback & Support
          </h2>
          <p>
            If you encounter any difficulty accessing content or triggering emergency actions, please notify our accessibility team immediately at <a href="mailto:support@safeher.ai" className="text-emerald-400 font-semibold hover:underline">support@safeher.ai</a>.
          </p>
        </section>

      </div>

    </div>
  );
};

export default Accessibility;
