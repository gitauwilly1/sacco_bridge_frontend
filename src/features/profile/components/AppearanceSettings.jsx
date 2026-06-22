import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Palette, SunMoon, Type, Accessibility, Contrast } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function AppearanceSettings() {
  const nextThemes = useTheme();
  
  // Theme state
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // Font size state
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('font-size') || 'medium';
  });

  // Reduce motion state
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem('reduce-motion') === 'true';
  });

  // High contrast state
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('high-contrast') === 'true';
  });

  // Effect to apply theme class
  useEffect(() => {
    const root = document.documentElement;
    
    // Fallback manual theme switching
    const applyTheme = (currentTheme) => {
      root.classList.remove('light', 'dark');
      
      let resolvedTheme = currentTheme;
      if (currentTheme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      root.classList.add(resolvedTheme);
      
      // Update next-themes if it is active
      if (nextThemes && typeof nextThemes.setTheme === 'function') {
        try {
          nextThemes.setTheme(currentTheme);
        } catch (e) {
          // Ignore
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Watch system theme change if system mode is selected
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme, nextThemes]);

  // Effect to apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('font-size', fontSize);
  }, [fontSize]);

  // Effect to apply reduce motion
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem('reduce-motion', reduceMotion ? 'true' : 'false');
  }, [reduceMotion]);

  // Effect to apply high contrast
  useEffect(() => {
    const body = document.body;
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    localStorage.setItem('high-contrast', highContrast ? 'true' : 'false');
  }, [highContrast]);

  return (
    <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-sand/30 bg-sand-light/10 p-6 flex flex-row items-center gap-3 space-y-0">
        <div className="h-10 w-10 rounded-xl bg-terracotta/10 flex items-center justify-center border border-terracotta/20">
          <Palette className="h-5 w-5 text-terracotta" />
        </div>
        <div>
          <CardTitle className="text-base text-slate font-bold">Appearance</CardTitle>
          <CardDescription className="text-xs text-gray-500">Customize how Sacco Bridge looks</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6 divide-y divide-sand/20 space-y-5 *:pt-5 first:*:pt-0">
        {/* Theme Settings */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75">
              <SunMoon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">Theme</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Choose light, dark, or system scheme</p>
            </div>
          </div>
          <select
            value={theme}
            onChange={(e) => setThemeState(e.target.value)}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer w-28"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Font Size Settings */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75">
              <Type className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">Font Size</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Adjust global reading text size</p>
            </div>
          </div>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer w-28"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75">
              <Accessibility className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">Reduce Motion</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Minimize animated transition effects</p>
            </div>
          </div>
          <Switch
            checked={reduceMotion}
            onCheckedChange={setReduceMotion}
            className="bg-sand data-[state=checked]:bg-terracotta border-0"
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75">
              <Contrast className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate">High Contrast</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Enhance visibility for easier reading</p>
            </div>
          </div>
          <Switch
            checked={highContrast}
            onCheckedChange={setHighContrast}
            className="bg-sand data-[state=checked]:bg-terracotta border-0"
          />
        </div>
      </CardContent>
    </Card>
  );
}
