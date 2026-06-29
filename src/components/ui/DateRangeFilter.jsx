import { Calendar } from 'lucide-react';

const periods = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'All' },
];

export default function DateRangeFilter({ value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-xl bg-sand-light/50 p-1 ${className}`}>
      <Calendar className="h-3.5 w-3.5 text-gray-400 ml-1.5" />
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            value === p.value
              ? 'bg-terracotta text-white shadow-sm'
              : 'text-slate hover:text-terracotta'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}