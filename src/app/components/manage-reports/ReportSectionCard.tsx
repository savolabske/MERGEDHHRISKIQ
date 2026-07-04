import { Sparkles, ChevronUp, ChevronDown, X } from 'lucide-react';
import type { ReportSection } from '../../data/reportsAdminMock';
import { getChartTypeDisplayLabel } from '../../data/reportsAdminMock';
import { KPI_ICON_MAP } from '../../data/reportsAdminMock';
import type { ReportThemeTokens } from '../../data/reportThemeTokens';
import { cn } from '../ui/utils';
import { ChartSkeletonGraphic } from './reportSkeletonGraphics';

interface ReportSectionCardProps {
  section: ReportSection;
  index: number;
  total: number;
  theme: ReportThemeTokens;
  isSelected: boolean;
  onClick: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onTileClick?: (tileId: string) => void;
}

export function ReportSectionCard({
  section,
  index,
  total,
  theme,
  isSelected,
  onClick,
  onMoveUp,
  onMoveDown,
  onDelete,
  onTileClick,
}: ReportSectionCardProps) {
  const sectionNum = String(index + 1).padStart(2, '0');
  const totalNum = String(total).padStart(2, '0');
  const hasPrompt = Boolean(section.prompt.trim());
  const chartLabel = getChartTypeDisplayLabel(section.chartType);

  if (section.layout === 'tile_grid') {
    return (
      <div
        className={cn('rounded-2xl border p-6 transition-colors', isSelected && 'ring-2 ring-offset-2')}
        style={{
          backgroundColor: theme.forwardLookBg,
          borderColor: theme.forwardLookBorder,
          ...(isSelected ? { boxShadow: `0 0 0 2px ${theme.accent}` } : {}),
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="report-display-title text-lg font-semibold text-white truncate">{section.title}</h3>
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              Skeleton
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Edit section"
            >
              <Sparkles size={16} />
            </button>
            {onMoveUp && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-destructive/20 hover:text-red-400 transition-colors"
                title="Delete section"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(section.tiles ?? []).map((tile, tileIndex) => {
            const Icon = KPI_ICON_MAP[tile.iconKey];
            const tileHasPrompt = Boolean(tile.prompt.trim());
            const accent = theme.kpiAccents[tileIndex % 6];
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => onTileClick?.(tile.id)}
                className="flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors"
                style={{
                  backgroundColor: theme.forwardLookTileBg,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="flex size-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Icon size={14} style={{ color: accent }} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {tileHasPrompt ? 'Prompt set' : 'No prompt yet'}
                </p>
                <p className="text-sm font-semibold text-white">
                  {tileHasPrompt ? tile.prompt.slice(0, 36) : 'Click to define'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border text-left transition-colors overflow-hidden',
        isSelected && 'ring-2 ring-offset-1',
      )}
      style={{
        backgroundColor: theme.cardBg,
        borderColor: isSelected ? theme.accentBorder : theme.cardBorder,
        boxShadow: theme.isDark
          ? 'none'
          : '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div
          className="border-b lg:border-b-0 lg:border-r p-4"
          style={{
            borderColor: theme.cardBorder,
            backgroundColor: theme.cardBg,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
              {sectionNum} / {totalNum}
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: theme.textMuted }}
            >
              {chartLabel}
            </span>
          </div>
          <ChartSkeletonGraphic
            chartType={section.chartType}
            palette={theme.chartPalette}
            muted={theme.chartMuted}
          />
          <p
            className="text-[10px] font-medium uppercase tracking-wide mt-2 text-center"
            style={{ color: theme.textMuted }}
          >
            {chartLabel} · No data yet
          </p>
        </div>

        <div className="p-5 flex flex-col" style={{ backgroundColor: theme.cardBg }}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3
                className="text-base font-semibold truncate"
                style={{ color: theme.textPrimary }}
              >
                {section.title}
              </h3>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: theme.accentSubtle, color: theme.accent }}
              >
                Skeleton
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {onMoveUp && (
                <button type="button" onClick={onMoveUp} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors" title="Move up">
                  <ChevronUp size={14} />
                </button>
              )}
              {onMoveDown && (
                <button type="button" onClick={onMoveDown} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors" title="Move down">
                  <ChevronDown size={14} />
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={onDelete} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive-subtle hover:text-destructive-text transition-colors" title="Delete">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div
            className="inline-block w-fit max-w-full rounded-md px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              backgroundColor: theme.isDark ? `${theme.pageBg}66` : theme.pageBg,
              color: theme.textMuted,
            }}
          >
            {hasPrompt
              ? section.prompt
              : 'No prompt defined yet — click to edit this section.'}
          </div>
        </div>
      </div>
    </button>
  );
}
