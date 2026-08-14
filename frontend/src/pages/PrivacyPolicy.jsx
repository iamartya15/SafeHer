import { Shield, Lock, Eye, FileText, Database, RefreshCw, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
  const lastUpdated = "August 14, 2026";

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto space-y-10">
      
      {/* Page Header */}
      <div className="space-y-4 text-center border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" /> Official Data Governance
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-slate-400 text-sm">
          Last Updated: <span className="text-slate-200 font-semibold">{lastUpdated}</span>
        </p>
      </div>

      {/* Content Container */}
      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 space-y-8 text-slate-300 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-fuchsia-400" /> 1. Commitment to User Privacy
          </h2>
          <p>
            At <strong>SafeHer AI — India Women’s Safety Platform</strong>, your privacy and personal safety are our highest priorities. We design our systems to ensure your real-time location, emergency contact networks, and incident reports remain encrypted, protected, and strictly accessible only for emergency response purposes.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-fuchsia-400" /> 2. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <strong>Geolocation Data:</strong> Precise GPS coordinates are collected <em>only</em> when you trigger an emergency SOS, enable Safe Route navigation, or request Guest SOS location sharing.
            </li>
            <li>
              <strong>Account & Profile Information:</strong> Name, verified mobile phone number, email address, and chosen user/guardian role during registration.
            </li>
            <li>
              <strong>Guardian Contact Details:</strong> Phone numbers and names of designated emergency contacts who receive automatic SMS/WhatsApp location alerts.
            </li>
            <li>
              <strong>Community Reports & Logs:</strong> Incident descriptions, safety ratings, and missing person queries submitted to the platform.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-fuchsia-400" /> 3. Data Retention & Deletion
          </h2>
          <p>
            Emergency SOS location trails are retained in active logs for 30 days to assist law enforcement or emergency responders if requested. Users have the right to request immediate deletion of their personal profiles and history at any time through Account Settings or by emailing <a href="mailto:privacy@safeher.ai" className="text-fuchsia-400 font-semibold hover:underline">privacy@safeher.ai</a>.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-fuchsia-400" /> 4. Third-Party Integrations
          </h2>
          <p>
            We integrate with essential, verified third-party infrastructure providers to deliver mapping and messaging services:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Google Maps APIs (for safe route plotting and location coordinates visualization)</li>
            <li>Twilio / MSG91 (for automated emergency SMS alerts)</li>
            <li>Official Public Datasets (NCRB, NCW, and MHA records for national statistics)</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-fuchsia-400" /> 5. Contact Data Protection Officer
          </h2>
          <p>
            For privacy inquiries, data export requests, or security concerns, contact our privacy team at <a href="mailto:support@safeher.ai" className="text-fuchsia-400 font-semibold hover:underline">support@safeher.ai</a>.
          </p>
        </section>

      </div>

    </div>
  );
};

export default PrivacyPolicy;
