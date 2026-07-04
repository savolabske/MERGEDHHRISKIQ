import type { ReportKpiTile } from '../../data/reportsAdminMock';
import { KPI_ICON_MAP } from '../../data/reportsAdminMock';
import type { ReportThemeTokens } from '../../data/reportThemeTokens';
import { cn } from '../ui/utils';

interface ReportKpiTileGridProps {
  tiles: ReportKpiTile[];
  theme: ReportThemeTokens;
  selectedId: string | null;
  onTileClick: (tileId: string) => void;
}

export function ReportKpiTileGrid({
  tiles,
  theme,
  selectedId,
  onTileClick,
}: ReportKpiTileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {tiles.map((tile, index) => {
        const Icon = KPI_ICON_MAP[tile.iconKey];
        const hasPrompt = Boolean(tile.prompt.trim());
        const isSelected = selectedId === tile.id;
        const accent = theme.kpiAccents[index] ?? theme.accent;
        const iconBg = theme.kpiIconBgs[index] ?? theme.accentSubtle;
        const iconColor = theme.kpiIconColors[index] ?? theme.accent;

        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onTileClick(tile.id)}
            className={cn(
              'relative flex flex-col items-start gap-3 rounded-[14px] border p-4 text-left transition-colors min-h-[108px] hover:-translate-y-0.5 hover:shadow-md',
              isSelected && 'ring-2 ring-offset-1',
            )}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: isSelected ? theme.accentBorder : theme.cardBorder,
              ...(isSelected ? { boxShadow: `0 0 0 1px ${theme.accentBorder}` } : {}),
            }}
          >
            <span
              className="absolute right-3 top-3 size-2.5 rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden
            />
            <div
              className="flex size-[30px] items-center justify-center rounded-[9px]"
              style={{ backgroundColor: iconBg }}
            >
              <Icon size={14} style={{ color: iconColor }} />
            </div>
            <div className="w-full min-w-0 pr-4">
              <p
                className="text-[10.5px] font-semibold uppercase tracking-wide"
                style={{ color: theme.textMuted }}
              >
                {hasPrompt ? 'Prompt set' : 'No prompt yet'}
              </p>
              <p
                className="text-[15px] font-semibold mt-1 leading-snug"
                style={{ color: hasPrompt ? theme.textPrimary : theme.textMuted }}
              >
                {hasPrompt ? tile.prompt.slice(0, 48) : 'Click to define'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
