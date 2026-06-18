import { Loader2 } from 'lucide-react';

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-terracotta" />
        <p className="mt-4 text-sm text-slate">Loading Sacco Bridge...</p>
      </div>
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <Loader2 className={`animate-spin text-terracotta ${sizes[size]} ${className}`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
  );
}