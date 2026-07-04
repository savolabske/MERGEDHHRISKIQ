import type { KpiIconKey } from '../../data/reportsAdminMock';
import { KPI_ICON_KEYS, KPI_ICON_MAP } from '../../data/reportsAdminMock';
import { cn } from '../ui/utils';

interface KpiIconPickerProps {
  value: KpiIconKey;
  onChange: (iconKey: KpiIconKey) => void;
}

export function KpiIconPicker({ value, onChange }: KpiIconPickerProps) {
  return (
    <div>
      <p className="label-caps mb-2">Icon</p>
      <div className="grid grid-cols-6 gap-2">
        {KPI_ICON_KEYS.map((key) => {
          const Icon = KPI_ICON_MAP[key];
          const isSelected = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                'flex size-10 items-center justify-center rounded-lg border transition-colors',
                isSelected
                  ? 'border-primary bg-primary-subtle text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted',
              )}
              title={key}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
