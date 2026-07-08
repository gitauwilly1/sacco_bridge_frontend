import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '', debounceMs = 500, minLength = 2 }) {
  const [local, setLocal] = useState(value || '');
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    setLocal(value || '');
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const timer = setTimeout(() => {
      if (local.length === 0 || local.length >= minLength) {
        onChange(local);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [local, debounceMs, minLength, onChange]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 border-sand/40 text-sm rounded-xl h-9"
      />
      {local && (
        <button
          onClick={() => { setLocal(''); onChange(''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-slate"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
