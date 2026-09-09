import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { KpiIconKey } from '../../data/reportsAdminMock';
import {
  getKpiIcon,
  getKpiIconLabel,
  KPI_ICON_OPTIONS,
} from '../../data/reportsAdminMock';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface KpiIconPickerProps {
  value: KpiIconKey;
  onChange: (iconKey: KpiIconKey) => void;
}

export function KpiIconPicker({ value, onChange }: KpiIconPickerProps) {
  const [open, setOpen] = useState(false);
  const SelectedIcon = getKpiIcon(value);
  const selectedLabel = getKpiIconLabel(value);

  return (
    <div>
      <p className="label-caps mb-2">Icon</p>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-input-background px-3.5 text-sm transition-colors hover:border-primary/40 focus:border-primary focus:outline-none"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <SelectedIcon size={16} strokeWidth={1.75} className="shrink-0 text-foreground" />
              <span className="truncate">{selectedLabel}</span>
            </span>
            <ChevronsUpDown size={16} className="shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[1600] w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput placeholder="Search icons..." />
            <CommandList className="max-h-64">
              <CommandEmpty>No icons match that search.</CommandEmpty>
              <CommandGroup>
                {KPI_ICON_OPTIONS.map((opt) => {
                  const selected = opt.key === value;
                  return (
                    <CommandItem
                      key={opt.key}
                      value={`${opt.label} ${opt.key}`}
                      onSelect={() => {
                        onChange(opt.key);
                        setOpen(false);
                      }}
                    >
                      <opt.Icon size={16} strokeWidth={1.75} />
                      <span className="flex-1">{opt.label}</span>
                      <Check
                        size={14}
                        className={selected ? 'opacity-100' : 'opacity-0'}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
