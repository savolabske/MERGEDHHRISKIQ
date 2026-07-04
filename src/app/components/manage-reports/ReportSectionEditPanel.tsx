import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { KpiIconKey, ReportChartType, ReportKpiTile, ReportSection } from '../../data/reportsAdminMock';
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
}

export function ReportSectionEditPanel({
  target,
  sections,
  kpiTiles,
  onClose,
  onSaveSection,
  onSaveKpiTile,
  onSaveForwardTile,
}: ReportSectionEditPanelProps) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chartType, setChartType] = useState<ReportChartType>('auto');
  const [iconKey, setIconKey] = useState<KpiIconKey>('home');

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
  }, [target, section, kpiTile, isSection, isKpi, isForwardTile]);

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

  const headerLabel = isKpi
    ? `HEADER TILE ${String(kpiIndex + 1).padStart(2, '0')} OF ${String(kpiTiles.length).padStart(2, '0')} · SKELETON`
    : isForwardTile
      ? `SECTION ${String(sectionIndex + 1).padStart(2, '0')} OF ${String(totalSections).padStart(2, '0')} — TILE`
      : `SECTION ${String(sectionIndex + 1).padStart(2, '0')} OF ${String(totalSections).padStart(2, '0')} — SKELETON`;

  const panelTitle = isKpi
    ? 'Edit tile'
    : isForwardTile
      ? 'Edit tile'
      : 'Edit section';

  return (
    <ReportBuilderSidePanel onClose={handleSave}>
      <div className="border-b border-border px-6 py-5 text-left relative shrink-0">
        <button
          type="button"
          onClick={handleSave}
          className="absolute right-4 top-4 size-8 hidden sm:flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X size={18} className="text-muted-foreground" />
        </button>
        <p className="label-caps text-muted-foreground pr-8">{headerLabel}</p>
        <h2 className="text-xl font-semibold text-foreground mt-1 pr-8">{panelTitle}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">
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
          <label className="label-caps mb-2 block">AI prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={persist}
            rows={isKpi || isForwardTile ? 4 : 6}
            className={textareaClass}
            placeholder={
              isKpi || isForwardTile
                ? 'e.g. Total committed across all tracked projects, with the project count as a caption.'
                : 'e.g. Rank donors by total disbursement, show top 10 with amounts...'
            }
          />
          <p className="text-xs text-muted-foreground mt-2">
            {isKpi || isForwardTile
              ? 'One number, one short caption. Keep it to a single fact.'
              : 'This is the instruction the AI uses to generate this section once sources are attached. Be specific about what to rank, filter, or compare.'}
          </p>
        </div>
      </div>

      <div className="border-t border-border px-6 py-4 flex gap-3 justify-end shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          Save
        </button>
      </div>
    </ReportBuilderSidePanel>
  );
}
