import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, Mail, Phone, MapPin, Landmark, ChevronRight } from 'lucide-react';
import BridgeLogo from '../brand/BridgeLogo';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNav = (path) => {
    navigate({ to: path });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-slate border-t border-sand mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <BridgeLogo size={24} />
            <span className="font-heading font-extrabold text-base text-slate tracking-tight">
              Sacco<span className="text-terracotta">Bridge</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-gray-500 max-w-xs">
            Bridging cooperative finance with security and efficiency.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1 bg-sand-light border border-sand text-[10px] font-bold text-slate px-2.5 py-1 rounded-full">
              <Landmark className="h-3 w-3 text-terracotta" />
              SASRA Guidelines
            </span>
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate mb-3">Platform</h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-600">
            {[
              { label: 'Dashboard', path: '/' },
              { label: 'Chamas', path: '/chamas' },
              { label: 'Investments', path: '/investments' },
              { label: 'Activity', path: '/activity' },
            ].map(({ label, path }) => (
              <li key={path}>
                <button onClick={() => handleNav(path)} className="hover:text-terracotta transition-colors cursor-pointer text-left">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate mb-3">Support</h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-600">
            {[
              { label: 'Help Center', path: '/help' },
              { label: 'Profile', path: '/profile' },
              { label: 'Security', path: '/profile/security' },
              { label: 'Legal', path: '/legal/documents' },
            ].map(({ label, path }) => (
              <li key={path}>
                <button onClick={() => handleNav(path)} className="hover:text-terracotta transition-colors cursor-pointer text-left">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate mb-3">Contact</h4>
          <ul className="space-y-2.5 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-terracotta flex-shrink-0 mt-0.5" />
              <span>Upper Hill, Nairobi, Kenya</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-terracotta flex-shrink-0" />
              <a href="mailto:support@saccobridge.co.ke" className="hover:text-terracotta transition-colors text-slate-600">Email us</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-terracotta flex-shrink-0" />
              <a href="tel:+254700000000" className="hover:text-terracotta transition-colors text-slate-600">Call support</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Regulatory Banner */}
      <div className="border-t border-sand bg-sand-light/40 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ShieldCheck className="h-4 w-4 text-success/70" />
            <span className="font-medium">Escrow settlement finality via smart proxy ledgers.</span>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-slate-400 leading-relaxed">
            All share transfers conducted in adherence to SASRA guidelines and individual SACCO bylaws.
          </span>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-sand bg-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
          <span>&copy; {currentYear} Sacco Bridge. All rights reserved.</span>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button onClick={() => handleNav('/legal/documents')} className="hover:text-terracotta transition-colors cursor-pointer font-medium">
              Terms of Service
            </button>
            <span className="text-slate-300">&middot;</span>
            <button onClick={() => handleNav('/legal/documents')} className="hover:text-terracotta transition-colors cursor-pointer font-medium">
              Privacy Policy
            </button>
            <span className="text-slate-300">&middot;</span>
            <button onClick={() => handleNav('/help')} className="hover:text-terracotta transition-colors cursor-pointer font-medium">
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}