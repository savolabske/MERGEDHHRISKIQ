import React from 'react';
import { Check, X } from 'lucide-react';

interface MultiSelectMenuProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

export function MultiSelectMenu({ title, options, selected, onToggle, onClear }: MultiSelectMenuProps) {
  return (
    <div className="absolute right-0 top-[44px] z-50 w-[280px] rounded-xl border border-[#e6e9ef] bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-[#eef1f6] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#6b7a8d]">{title}</span>
        {selected.length > 0 && (
          <button onClick={onClear} className="inline-flex items-center gap-1 text-[11px] text-[#1f6feb]">
            <X size={11} />
            Clear Filters
          </button>
        )}
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        {options.map((option, index) => {
          const checked = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-[12px] text-[#3a4a5c] hover:bg-[#f8f9fb] ${index !== options.length - 1 ? 'border-b border-[#eef1f6]' : ''}`}
            >
              <span>{option}</span>
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded border ${checked ? 'border-[#2a7fe0] bg-[#2a7fe0] text-white' : 'border-[#cdd5e0]'}`}>
                {checked ? <Check size={11} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
