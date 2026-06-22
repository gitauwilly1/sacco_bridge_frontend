import { Loader2 } from 'lucide-react';

/* ─── Branded SVG Logo Mark ────────────────────────────────────────── */
function SaccoMark({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bridge arch */}
      <path
        d="M4 28 Q20 8 36 28"
        stroke="#C67B5C"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bridge pillars */}
      <rect x="10" y="22" width="3" height="9" rx="1.5" fill="#C67B5C" opacity="0.7" />
      <rect x="27" y="22" width="3" height="9" rx="1.5" fill="#C67B5C" opacity="0.7" />
      {/* Deck */}
      <rect x="4" y="27" width="32" height="3" rx="1.5" fill="#8B4513" />
    </svg>
  );
}

/* ─── Full Page Loader ──────────────────────────────────────────────── */
export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        {/* Pulsing ring around logo */}
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-20 w-20 rounded-full bg-terracotta opacity-10 animate-ping" />
          <span className="absolute inline-flex h-16 w-16 rounded-full bg-terracotta opacity-10 animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-sand-light shadow-sm">
            <SaccoMark size={36} />
          </div>
        </div>
        <div className="text-center">
          <p className="font-heading font-semibold text-slate text-sm tracking-wide">Sacco Bridge</p>
          <p className="text-xs text-gray-400 mt-0.5">Loading your workspace…</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Spinner ───────────────────────────────────────────────── */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <Loader2 className={`animate-spin text-terracotta ${sizes[size]} ${className}`} />
  );
}

/* ─── Page-level Spinner ───────────────────────────────────────────── */
export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-12 w-12 rounded-full bg-terracotta opacity-10 animate-pulse" />
        <Spinner size="lg" />
      </div>
    </div>
  );
}

/* ─── Skeleton (shimmer) ───────────────────────────────────────────── */
export function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton-shimmer rounded-lg ${className}`} />
  );
}