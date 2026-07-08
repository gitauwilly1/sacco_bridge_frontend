import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X, Cookie, Shield, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const COOKIE_CONSENT_KEY = 'sb_cookie_consent';

const DEFAULT_PREFERENCES = {
  essential: true,
  functional: false,
  analytics: false,
};

const COOKIE_CATEGORIES = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Required for authentication, security, and basic functionality. Cannot be disabled.',
    alwaysOn: true,
  },
  {
    id: 'functional',
    label: 'Functional',
    description: 'Remembers your preferences like language, theme, and sidebar state.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Helps us improve the platform with anonymous usage data.',
  },
];

function getConsent() {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function setConsent(preferences) {
  const data = { preferences, acceptedAt: new Date().toISOString() };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));
  return data;
}

export default function CookieConsentBanner() {
  const navigate = useNavigate();
  const [consent, setConsentState] = useState(getConsent);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);

  const handleAcceptAll = () => {
    const all = { essential: true, functional: true, analytics: true };
    setConsent(all);
    setConsentState(getConsent());
  };

  const handleAcceptEssential = () => {
    setConsent(DEFAULT_PREFERENCES);
    setConsentState(getConsent());
  };

  const handleSaveSettings = () => {
    setConsent(prefs);
    setConsentState(getConsent());
    setShowSettings(false);
  };

  const openSettings = () => {
    setPrefs(consent?.preferences || DEFAULT_PREFERENCES);
    setShowSettings(true);
  };

  if (consent) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
        <div className="mx-auto max-w-2xl bg-white border border-sand rounded-2xl shadow-xl p-4 md:p-5 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="hidden sm:flex h-9 w-9 rounded-xl bg-terracotta/10 items-center justify-center border border-terracotta/20 shrink-0">
              <Cookie className="h-4.5 w-4.5 text-terracotta" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate">Cookie Consent</h3>
                <button onClick={handleAcceptEssential} className="p-1 rounded-md text-gray-400 hover:text-slate hover:bg-sand-light transition-colors" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                We use essential cookies for authentication and security. Functional cookies remember your
                preferences. By clicking "Accept All", you consent to all cookies.{' '}
                <button
                  onClick={() => navigate({ to: '/legal/documents' })}
                  className="text-terracotta font-semibold underline underline-offset-2 hover:text-clay"
                >
                  Privacy Policy
                </button>
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Button
                  size="sm"
                  className="bg-terracotta hover:bg-clay text-white text-xs font-semibold h-9 rounded-xl px-4 shadow-sm"
                  onClick={handleAcceptAll}
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Accept All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sand text-slate text-xs font-semibold h-9 rounded-xl px-4"
                  onClick={openSettings}
                >
                  <Settings className="h-3.5 w-3.5 mr-1" /> Cookie Settings
                </Button>
                <button
                  onClick={handleAcceptEssential}
                  className="text-[11px] text-gray-400 font-medium underline underline-offset-2 hover:text-slate transition-colors"
                >
                  Only essential
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-terracotta" /> Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Choose which cookies to allow. Essential cookies are always enabled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {COOKIE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-sand-light/20 border border-sand/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate">{cat.label}</span>
                    {cat.alwaysOn && (
                      <span className="text-[10px] bg-terracotta/10 text-terracotta font-bold px-1.5 py-0.5 rounded-full">Required</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{cat.description}</p>
                </div>
                <Switch
                  checked={prefs[cat.id]}
                  disabled={cat.alwaysOn}
                  onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [cat.id]: checked }))}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              className="bg-terracotta hover:bg-clay text-white text-xs font-semibold h-10 rounded-xl flex-1"
              onClick={handleSaveSettings}
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Save Preferences
            </Button>
            <Button
              variant="outline"
              className="border-sand text-slate text-xs font-semibold h-10 rounded-xl"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
