import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, Mail, Phone, MapPin, Landmark } from 'lucide-react';
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
      {/* Upper Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BridgeLogo size={28} />
            <span className="font-heading font-extrabold text-lg text-slate tracking-tight">
              Sacco<span className="text-terracotta">Bridge</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-gray-500 max-w-sm">
            The professional bilateral liquidity connection and settlement utility for Kenyan SACCO members. 
            Bridging cooperative finance with security and efficiency.
          </p>
          <div className="flex items-center gap-2.5 pt-2">
            <BadgePill icon={Landmark} label="SASRA Registered Guidelines" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 mb-4">
            Platform Features
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
            <li>
              <button 
                onClick={() => handleNav('/')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                Dashboard Overview
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('/chamas')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                Chama Management
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('/investments')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                SACCO Share Portfolios
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('/holdings')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                Holdings & Diversification
              </button>
            </li>
          </ul>
        </div>

        {/* Resources & Support */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 mb-4">
            Support & Settings
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
            <li>
              <button 
                onClick={() => handleNav('/help')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                Help Center (FAQ)
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('/settings')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                Appearance Settings
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('/security')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                Security & Accounts
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNav('/profile')}
                className="hover:text-terracotta transition-colors cursor-pointer text-left"
              >
                Verification Status
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 mb-4">
            Get In Touch
          </h4>
          <ul className="space-y-3 text-xs text-slate-500">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-terracotta flex-shrink-0 mt-0.5" />
              <span>Sacco Bridge HQ, Upper Hill, Nairobi, Kenya</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-terracotta flex-shrink-0" />
              <a href="mailto:support@saccobridge.co.ke" className="hover:text-terracotta transition-colors text-slate-700">
                support@saccobridge.co.ke
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-terracotta flex-shrink-0" />
              <a href="tel:+254700000000" className="hover:text-terracotta transition-colors text-slate-700">
                +254 700 000 000
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Middle Regulatory Banner */}
      <div className="border-t border-sand bg-sand-light/50 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-success/75" />
            <span>Escrow settlement finality secured via bilateral smart proxy ledgers.</span>
          </div>
          <div className="text-center md:text-right max-w-xl text-slate-400">
            Sacco Bridge is a technology utility platform. All share transfers, negotiations, and secondary market listings are conducted in adherence to SASRA (Sacco Societies Regulatory Authority) guidelines and individual SACCO bylaws.
          </div>
        </div>
      </div>

      {/* Lower Copyright Area */}
      <div className="border-t border-sand bg-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
          <div>
            &copy; {currentYear} Sacco Bridge. All rights reserved. Cooperative Finance Platform.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-terracotta transition-colors">Terms of Service</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-terracotta transition-colors">Privacy Policy</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-terracotta transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BadgePill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-sand-light border border-sand text-[10px] font-bold text-slate px-2.5 py-1 rounded-full">
      <Icon className="h-3.5 w-3.5 text-terracotta" />
      {label}
    </span>
  );
}
