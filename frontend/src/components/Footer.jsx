import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Intro */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              <Shield className="w-5 h-5 text-fuchsia-500 fill-fuchsia-500/10" />
              <span>SafeHer AI</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm">
              Empowering women safety through next-generation predictive intelligence, automated guardian notification structures, and instantaneous emergency SOS channels.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/map" className="hover:text-purple-400 transition-colors">Incident Map</Link></li>
              <li><Link to="/nearby" className="hover:text-purple-400 transition-colors">Nearby Safe Places</Link></li>
              <li><Link to="/sos" className="hover:text-purple-400 transition-colors">SOS Alert Channel</Link></li>
              <li><Link to="/ai" className="hover:text-purple-400 transition-colors">AI Safety Companion</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Emergency Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500" />
                <span>National Emergency: 112 / 100</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-500" />
                <span>support@safeher.ai</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Base */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {currentYear} SafeHer AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-fuchsia-500 fill-fuchsia-500" /> for a safer community.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
