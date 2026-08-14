import { FileText, AlertTriangle, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

export const TermsOfService = () => {
  const lastUpdated = "August 14, 2026";

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto space-y-10">
      
      {/* Page Header */}
      <div className="space-y-4 text-center border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" /> Legal Terms
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-slate-400 text-sm">
          Last Updated: <span className="text-slate-200 font-semibold">{lastUpdated}</span>
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <div className="glass-card rounded-3xl p-6 border border-red-500/30 bg-red-500/10 space-y-3">
        <h3 className="text-base font-bold text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> CRITICAL EMERGENCY DISCLAIMER
        </h3>
        <p className="text-xs text-slate-200 leading-relaxed">
          SafeHer AI is an auxiliary technology tool designed to facilitate rapid location sharing and community safety intelligence. <strong>SafeHer IS NOT a substitute for official law enforcement or emergency medical response.</strong> In life-threatening emergencies, always dial <strong>112</strong> directly from your phone.
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-400" /> 1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong>SafeHer AI — India Women’s Safety Platform</strong> (web or mobile application), you agree to be bound by these Terms of Service. If you do not agree to these terms, you should discontinue platform usage immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" /> 2. Account & Guardian Responsibilities
          </h2>
          <p>
            When adding emergency contacts/guardians, you confirm that you have obtained their prior consent to receive emergency SMS and location tracking links during an active SOS trigger. Users are responsible for maintaining accurate phone numbers for their designated guardians.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" /> 3. Acceptable Use Policy
          </h2>
          <p>
            Users agree NOT to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Trigger false SOS alerts maliciously or test emergency systems excessively without cause.</li>
            <li>Submit fraudulent missing persons or incident reports.</li>
            <li>Attempt to reverse-engineer, exploit, or disrupt platform infrastructure.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" /> 4. Limitation of Liability
          </h2>
          <p>
            SafeHer AI, its founders, developers, and partners shall not be held liable for delayed cellular SMS delivery, third-party network outages, or hardware GPS inaccuracies beyond our technical control during emergency scenarios.
          </p>
        </section>

      </div>

    </div>
  );
};

export default TermsOfService;
