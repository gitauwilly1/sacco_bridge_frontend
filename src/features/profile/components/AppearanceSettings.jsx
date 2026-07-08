import { useEffect, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Palette, SunMoon, Type, Accessibility, Contrast } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  applyFontSize,
  applyHighContrast,
  applyReduceMotion,
  getStoredFontSize,
  getStoredHighContrast,
  getStoredReduceMotion,
} from '@/lib/appearance';

export default function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [fontSize, setFontSize] = useState(getStoredFontSize);
  const [reduceMotion, setReduceMotion] = useState(getStoredReduceMotion);
  const [highContrast, setHighContrast] = useState(getStoredHighContrast);

  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    applyReduceMotion(reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    applyHighContrast(highContrast);
  }, [highContrast]);

  const themeValue = mounted ? (theme || 'system') : 'system';

  return (
    <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden dark:bg-slate-900/95">
      <CardHeader className="border-b border-sand/30 bg-sand-light/10 p-6 flex flex-row items-center gap-3 space-y-0 dark:border-slate-700 dark:bg-slate-800/40">
        <div className="h-10 w-10 rounded-xl bg-terracotta/10 flex items-center justify-center border border-terracotta/20">
          <Palette className="h-5 w-5 text-terracotta" />
        </div>
        <div>
          <CardTitle className="text-base text-slate font-bold dark:text-slate-100">Appearance</CardTitle>
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
            Customize how Sacco Bridge looks and feels
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6 divide-y divide-sand/20 space-y-5 *:pt-5 first:*:pt-0 dark:divide-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75 dark:text-slate-300">
              <SunMoon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate dark:text-slate-100">Theme</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed dark:text-gray-400">
                {mounted && resolvedTheme
                  ? `Currently using ${resolvedTheme} mode`
                  : 'Choose light, dark, or match your system'}
              </p>
            </div>
          </div>
          <select
            value={themeValue}
            onChange={(e) => setTheme(e.target.value)}
            disabled={!mounted}
            className="text-xs border border-sand bg-white hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer w-28 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75 dark:text-slate-300">
              <Type className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate dark:text-slate-100">Font size</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed dark:text-gray-400">
                Adjust base reading size across the app
              </p>
            </div>
          </div>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="text-xs border border-sand bg-white hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer w-28 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-4 transition-all duration-300 ease-in-out">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75 dark:text-slate-300">
              <Accessibility className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate dark:text-slate-100">Reduce motion</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed dark:text-gray-400">
                Minimize animations for a calmer experience
              </p>
            </div>
          </div>
          <Switch
            checked={reduceMotion}
            onCheckedChange={setReduceMotion}
            className="bg-sand data-[state=checked]:bg-terracotta border-0 transition-transform duration-200 data-[state=checked]:translate-x-0.5"
          />
        </div>

        <div className="flex items-center justify-between gap-4 transition-all duration-300 ease-in-out">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate/75 dark:text-slate-300">
              <Contrast className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate dark:text-slate-100">High contrast</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed dark:text-gray-400">
                Boost contrast for easier reading
              </p>
            </div>
          </div>
          <Switch
            checked={highContrast}
            onCheckedChange={setHighContrast}
            className="bg-sand data-[state=checked]:bg-terracotta border-0 transition-transform duration-200 data-[state=checked]:translate-x-0.5"
          />
        </div>
      </CardContent>
    </Card>
  );
}
