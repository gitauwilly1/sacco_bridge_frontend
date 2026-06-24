import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Compass, Home, ArrowLeft, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
      {/* Visual illustration containing compass and question icon */}
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-sand-light shadow-subtle ring-8 ring-sand-light/50">
        <Compass className="h-12 w-12 text-terracotta animate-breathe" />
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-white text-xs font-bold font-heading shadow-md border-2 border-white">
          ?
        </div>
      </div>

      {/* Text Area */}
      <h1 className="font-heading font-extrabold text-2xl text-slate mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed">
        The page you are looking for might have been moved, deleted, or doesn't exist. Let's get you back on track.
      </p>

      {/* Buttons container */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-xs sm:max-w-none">
        <Button
          onClick={() => navigate({ to: '/' })}
          className="w-full sm:w-auto bg-terracotta hover:bg-clay text-white font-semibold py-2.5 px-5 rounded-lg transition-all shadow-subtle cursor-pointer border-none flex items-center justify-center gap-2"
        >
          <Home className="h-4 w-4" />
          Dashboard Home
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full sm:w-auto border-sand-dark text-slate hover:bg-sand-light font-semibold py-2.5 px-5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>

      {/* Quick links to Help */}
      <div className="mt-12 pt-8 border-t border-sand/40 w-full max-w-sm flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
        <LifeBuoy className="h-4 w-4 text-terracotta/70" />
        <span>Still lost? Visit our</span>
        <button
          onClick={() => navigate({ to: '/help' })}
          className="text-terracotta hover:underline cursor-pointer font-semibold"
        >
          Help Center
        </button>
      </div>
    </div>
  );
}
