import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, Undo2, X } from 'lucide-react';
import type { KpiIconKey, ReportChartType, ReportKpiTile, ReportSection } from '../../data/reportsAdminMock';
import {
  refineReportPrompt,
  regenerateKpiTileFromPrompt,
  regenerateSectionFromPrompt,
} from '../../data/reportsAdminMock';
import { inputClass, textareaClass } from '../resources/resourceShared';
import { ReportChartTypeSelect } from './ReportChartTypeSelect';
import { KpiIconPicker } from './KpiIconPicker';
import { ReportBuilderSidePanel } from './ReportBuilderSidePanel';

export type SectionEditTarget =
  | { kind: 'section'; sectionId: string }
  | { kind: 'kpi'; tileId: string }
  | { kind: 'forward_tile'; sectionId: string; tileId: string };

interface ReportSectionEditPanelProps {
  target: SectionEditTarget;
  sections: ReportSection[];
  kpiTiles: ReportKpiTile[];
  onClose: () => void;
  onSaveSection: (section: ReportSection) => void;
  onSaveKpiTile: (tile: ReportKpiTile) => void;
  onSaveForwardTile: (sectionId: string, tile: ReportKpiTile) => void;
  onRegenerateSection?: (section: ReportSection) => void;
  onRegenerateKpiTile?: (tile: ReportKpiTile) => void;
  onRegenerateForwardTile?: (sectionId: string, tile: ReportKpiTile) => void;
}

export function ReportSectionEditPanel({
  target,
  sections,
  kpiTiles,
  onClose,
  onSaveSection,
  onSaveKpiTile,
  onSaveForwardTile,
  onRegenerateSection,
  onRegenerateKpiTile,
  onRegenerateForwardTile,
}: ReportSectionEditPanelProps) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chartType, setChartType] = useState<ReportChartType>('auto');
  const [iconKey, setIconKey] = useState<KpiIconKey>('home');
  const [isRefining, setIsRefining] = useState(false);
  const [promptBeforeRefine, setPromptBeforeRefine] = useState<string | null>(null);
  const refineTimerRef = useRef<number | null>(null);

  const section =
    target.kind === 'section'
      ? sections.find((s) => s.id === target.sectionId)
      : target.kind === 'forward_tile'
        ? sections.find((s) => s.id === target.sectionId)
        : null;

  const kpiTile =
    target.kind === 'kpi'
      ? kpiTiles.find((t) => t.id === target.tileId)
      : target.kind === 'forward_tile' && section
        ? section.tiles?.find((t) => t.id === target.tileId)
        : null;

  const isKpi = target.kind === 'kpi';
  const isForwardTile = target.kind === 'forward_tile';
  const isSection = target.kind === 'section';

  const sectionIndex = section ? sections.findIndex((s) => s.id === section.id) : -1;
  const kpiIndex = isKpi ? kpiTiles.findIndex((t) => t.id === target.tileId) : -1;
  const totalSections = sections.length;

  const kpiGenerated = Boolean(kpiTile?.value?.trim());
  const sectionGenerated =
    Boolean(section?.body?.trim()) ||
    Boolean(section?.stat?.trim()) ||
    Boolean(section?.chartData?.length) ||
    Boolean(section?.tiles?.some((t) => t.value?.trim()));

  useEffect(() => {
    if (isSection && section) {
      setTitle(section.title);
      setPrompt(section.prompt);
      setChartType(section.chartType);
    } else if ((isKpi || isForwardTile) && kpiTile) {
      setTitle('');
      setPrompt(kpiTile.prompt);
      setIconKey(kpiTile.iconKey);
      setChartType('auto');
    }
    setIsRefining(false);
    setPromptBeforeRefine(null);
  }, [target, section, kpiTile, isSection, isKpi, isForwardTile]);

  useEffect(() => {
    return () => {
      if (refineTimerRef.current != null) window.clearTimeout(refineTimerRef.current);
    };
  }, []);

  const persist = () => {
    if (isSection && section) {
      onSaveSection({ ...section, title, prompt, chartType });
    } else if (isKpi && kpiTile) {
      onSaveKpiTile({ ...kpiTile, prompt, iconKey });
    } else if (isForwardTile && section && kpiTile) {
      onSaveForwardTile(section.id, { ...kpiTile, prompt, iconKey });
    }
  };

  const handleSave = () => {
    persist();
    onClose();
  };

  const handleRegenerate = () => {
    if (isSection && section) {
      const next = regenerateSectionFromPrompt({
        ...section,
        title,
        prompt,
        chartType,
      });
      (onRegenerateSection ?? onSaveSection)(next);
      onClose();
      return;
    }
    if (isKpi && kpiTile) {
      const next = regenerateKpiTileFromPrompt({ ...kpiTile, prompt, iconKey });
      (onRegenerateKpiTile ?? onSaveKpiTile)(next);
      onClose();
      return;
    }
    if (isForwardTile && section && kpiTile) {
      const next = regenerateKpiTileFromPrompt({ ...kpiTile, prompt, iconKey });
      if (onRegenerateForwardTile) onRegenerateForwardTile(section.id, next);
      else onSaveForwardTile(section.id, next);
      onClose();
    }
  };

  const handleSaveAction = () => {
    if (canRegenerate) {
      handleRegenerate();
      return;
    }
    handleSave();
  };

  const handleChartTypeChange = (next: ReportChartType) => {
    setChartType(next);
    if (isSection && section) {
      onSaveSection({ ...section, title, prompt, chartType: next });
    }
  };

  const handleIconChange = (next: KpiIconKey) => {
    setIconKey(next);
    if (isKpi && kpiTile) {
      onSaveKpiTile({ ...kpiTile, prompt, iconKey: next });
    } else if (isForwardTile && section && kpiTile) {
      onSaveForwardTile(section.id, { ...kpiTile, prompt, iconKey: next });
    }
  };

  const refineKind = isKpi ? 'kpi' : isForwardTile ? 'forward_tile' : 'section';
  const refinedPrompt = prompt.trim()
    ? refineReportPrompt({
        draft: prompt,
        kind: refineKind,
        title,
        chartType,
      })
    : '';
  const canRefinePrompt = Boolean(prompt.trim()) && refinedPrompt !== prompt;

  const handleRefinePrompt = () => {
    if (!canRefinePrompt || isRefining) return;
    if (refineTimerRef.current != null) window.clearTimeout(refineTimerRef.current);

    const draft = prompt;
    setIsRefining(true);

    refineTimerRef.current = window.setTimeout(() => {
      const nextPrompt = refineReportPrompt({
        draft,
        kind: refineKind,
        title,
        chartType,
      });
      if (nextPrompt !== draft) {
        setPromptBeforeRefine(draft);
        setPrompt(nextPrompt);
      } else {
        setPromptBeforeRefine(null);
      }
      setIsRefining(false);
      refineTimerRef.current = null;
    }, 450);
  };

  const handleUndoRefine = () => {
    if (promptBeforeRefine == null) return;
    if (refineTimerRef.current != null) {
      window.clearTimeout(refineTimerRef.current);
      refineTimerRef.current = null;
    }
    setPrompt(promptBeforeRefine);
    setPromptBeforeRefine(null);
    setIsRefining(false);
  };

  const canRegenerate = isSection
    ? sectionGenerated || Boolean(prompt.trim())
    : kpiGenerated || Boolean(prompt.trim());

  const headerLabel = isKpi
    ? `HEADER TILE ${String(kpiIndex + 1).padStart(2, '0')} OF ${String(kpiTiles.length).padStart(2, '0')}`
    : isForwardTile
      ? `SECTION ${String(sectionIndex + 1).padStart(2, '0')} OF ${String(totalSections).padStart(2, '0')} — TILE`
      : `SECTION ${String(sectionIndex + 1).padStart(2, '0')} OF ${String(totalSections).padStart(2, '0')}`;

  const panelTitle = isKpi || isForwardTile ? 'Tile prompt' : 'Section prompt';

  return (
    <ReportBuilderSidePanel onClose={handleSave}>
      <div className="border-b border-border px-4 sm:px-6 py-5 text-left relative shrink-0">
        <button
          type="button"
          onClick={handleSave}
          className="absolute right-4 top-4 size-8 hidden lg:flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X size={18} className="text-muted-foreground" />
        </button>
        <p className="label-caps text-muted-foreground pr-10">{headerLabel}</p>
        <h2 className="text-xl font-semibold text-foreground mt-1 pr-10">{panelTitle}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 min-h-0">
        {isSection && (
          <div>
            <label className="label-caps mb-2 block">Section title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={persist}
              className={inputClass}
              placeholder="Section title"
            />
          </div>
        )}

        {isSection && section?.layout === 'split' && (
          <ReportChartTypeSelect value={chartType} onChange={handleChartTypeChange} />
        )}

        {(isKpi || isForwardTile) && (
          <KpiIconPicker value={iconKey} onChange={handleIconChange} />
        )}

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="label-caps">AI prompt</label>
            <div className="flex items-center gap-3">
              {isRefining ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Refining…
                </span>
              ) : promptBeforeRefine != null ? (
                <button
                  type="button"
                  onClick={handleUndoRefine}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRefinePrompt}
                  disabled={!canRefinePrompt}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  <Sparkles size={14} />
                  Refine prompt
                </button>
              )}
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (promptBeforeRefine != null) setPromptBeforeRefine(null);
            }}
            onBlur={persist}
            rows={isKpi || isForwardTile ? 5 : 8}
            className={textareaClass}
            placeholder={
              isKpi || isForwardTile
                ? 'e.g. Total committed across all tracked projects, with the project count as a caption.'
                : 'e.g. Rank donors by total disbursement, show top 10 with amounts...'
            }
          />
        </div>
      </div>

      <div className="border-t border-border px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAction}
          className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center"
        >
          Save
        </button>
      </div>
    </ReportBuilderSidePanel>
  );
}
