import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-error-500" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-slate-700 mb-1">
        Something went wrong
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-sand-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}