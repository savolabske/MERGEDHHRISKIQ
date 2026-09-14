import { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
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
            aria-label={`Icon: ${selectedLabel}`}
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
              <CommandGroup className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:grid-cols-6 [&_[cmdk-group-items]]:gap-1 p-2">
                {KPI_ICON_OPTIONS.map((opt) => {
                  const selected = opt.key === value;
                  return (
                    <CommandItem
                      key={opt.key}
                      value={`${opt.label} ${opt.key}`}
                      aria-label={opt.label}
                      title={opt.label}
                      onSelect={() => {
                        onChange(opt.key);
                        setOpen(false);
                      }}
                      className={`aspect-square size-auto justify-center rounded-md p-0 ${
                        selected
                          ? 'bg-primary/10 text-primary data-[selected=true]:bg-primary/15 data-[selected=true]:text-primary'
                          : ''
                      }`}
                    >
                      <opt.Icon size={18} strokeWidth={1.75} />
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
