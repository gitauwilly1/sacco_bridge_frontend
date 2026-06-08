export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-sand-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-heading font-semibold text-slate-700 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}