import { ShieldCheck, Lock, Server, Smartphone, Key, AlertCircle } from 'lucide-react';

export const Security = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto space-y-10">
      
      <div className="space-y-4 text-center border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Security Protocol
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Security Architecture</h1>
        <p className="text-slate-400 text-sm">
          How SafeHer AI protects location streams, guardian alerts, and emergency data pipelines.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" /> 1. Encryption Standards
          </h2>
          <p>
            All network communication between your device and SafeHer API servers is encrypted using <strong>TLS 1.3 with AES-256 GCM</strong> encryption. Sensitive user data and phone hashes stored in our database are encrypted at rest using industry-standard keys.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" /> 2. Emergency Signal Pathways
          </h2>
          <p>
            When an Emergency SOS is triggered:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-300">
            <li>GPS location coordinates are broadcasted via TLS encrypted WebSockets directly to authorized guardians.</li>
            <li>In low-connectivity environments, fallback SMS alert channels are utilized to ensure delivery reliability.</li>
            <li>No location data is ever sold or commercialized to third-party ad networks.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" /> 3. Responsible Vulnerability Disclosure
          </h2>
          <p>
            We welcome security researchers to audit our platform. If you discover a potential vulnerability, please report it privately to <a href="mailto:security@safeher.ai" className="text-cyan-400 font-semibold hover:underline">security@safeher.ai</a>.
          </p>
        </section>

      </div>

    </div>
  );
};

export default Security;
