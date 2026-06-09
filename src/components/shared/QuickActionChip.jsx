export default function QuickActionChip({ icon: Icon, label, onClick, active, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-terracotta-500 text-white shadow-terracotta'
          : 'bg-white text-slate-600 border border-sand-200 hover:border-terracotta-300 hover:bg-sand-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}