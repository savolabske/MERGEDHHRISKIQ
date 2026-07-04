import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ReportChartType } from '../../data/reportsAdminMock';
import { REPORT_CHART_TYPES } from '../../data/reportsAdminMock';
import { cn } from '../ui/utils';
import { inputClass } from '../resources/resourceShared';

interface ReportChartTypeSelectProps {
  value: ReportChartType;
  onChange: (value: ReportChartType) => void;
}

export function ReportChartTypeSelect({ value, onChange }: ReportChartTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = REPORT_CHART_TYPES.find((c) => c.value === value) ?? REPORT_CHART_TYPES[0];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const pick = (next: ReportChartType) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <p className="label-caps mb-2">Chart type</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          inputClass,
          'flex items-center justify-between gap-2 text-left cursor-pointer',
          open && 'border-primary ring-2 ring-ring/10',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 min-w-0">
          <SelectedIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-card shadow-lg py-1 max-h-64 overflow-y-auto"
        >
          {REPORT_CHART_TYPES.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => pick(option.value)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors',
                  isSelected ? 'bg-primary-subtle text-primary' : 'hover:bg-muted',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
