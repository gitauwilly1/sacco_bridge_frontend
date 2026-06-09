import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isPending,
}) {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-error-600 bg-error-50',
      buttonColor: 'bg-error-600 hover:bg-error-700',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-alert-600 bg-alert-50',
      buttonColor: 'bg-alert-600 hover:bg-alert-700',
    },
    success: {
      icon: AlertTriangle,
      iconColor: 'text-success-600 bg-success-50',
      buttonColor: 'bg-success-600 hover:bg-success-700',
    },
  };

  const { icon: Icon, iconColor, buttonColor } = variants[variant] || variants.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${iconColor}`}>
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-800">{title}</h3>
          {message && (
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-sand-50 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${buttonColor}`}
          >
            {isPending ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}