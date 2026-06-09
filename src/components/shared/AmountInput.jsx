import { useState } from 'react';

export default function AmountInput({
  value,
  onChange,
  presets = [],
  max,
  placeholder = '0',
  disabled,
  error,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      {presets.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value.toString())}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                value === preset.value.toString()
                  ? 'bg-terracotta-500 text-white'
                  : 'bg-sand-100 text-slate-600 hover:bg-sand-200'
              } disabled:opacity-50`}
            >
              {preset.label || preset.value.toLocaleString()}
            </button>
          ))}
        </div>
      )}

      <div className={`relative rounded-xl border-2 transition-all ${
        isFocused ? 'border-terracotta-500 ring-2 ring-terracotta-200' :
        error ? 'border-error-300' : 'border-sand-200'
      }`}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
          KSh
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          max={max}
          className="w-full pl-14 pr-4 py-3.5 bg-white rounded-xl text-2xl font-numbers font-bold text-slate-800 text-center placeholder-slate-300 focus:outline-none disabled:opacity-50"
          placeholder={placeholder}
        />
      </div>

      {max && (
        <p className="text-xs text-slate-400 mt-1 text-right">
          Max: KSh {parseInt(max).toLocaleString()}
        </p>
      )}

      {error && (
        <p className="text-error-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}