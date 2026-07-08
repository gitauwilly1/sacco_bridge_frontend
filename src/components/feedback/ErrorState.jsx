import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-16 text-center px-4 animate-fade-up">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
        <AlertCircle className="h-8 w-8 text-danger" />
      </div>
      <h3 className="font-heading font-semibold text-slate mb-1">{message}</h3>
      <p className="text-sm text-gray-400 mb-4">Please try again or contact support if this persists.</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="border-terracotta text-terracotta hover:bg-sand-light hover:border-terracotta"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4 animate-fade-up">
      {Icon && (
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-sand-light">
          <Icon className="h-10 w-10 text-terracotta opacity-50" />
        </div>
      )}
      <h3 className="font-heading font-semibold text-slate mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        typeof action === 'object' && action.label && action.onClick ? (
          <Button
            onClick={action.onClick}
            className="bg-terracotta hover:bg-clay text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-subtle border-none cursor-pointer"
          >
            {action.label}
          </Button>
        ) : (
          action
        )
      )}
    </div>
  );
}