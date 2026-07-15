import { useCallback, useMemo, useState } from 'react';
import type { ManagedReport, ReportSection } from '../../data/reportsAdminMock';
import { hasLinkedKnowledgeSources } from '../../data/reportsAdminMock';
import { ReportBuilderHeader } from './ReportBuilderHeader';
import { ReportDraftSourcesEmpty } from './ReportDraftSourcesEmpty';
import { ReportKpiTileGrid } from './ReportKpiTileGrid';
import { ReportSectionCard } from './ReportSectionCard';
import { ReportSectionInsert } from './ReportSectionInsert';
import { ReportSectionEditPanel, type SectionEditTarget } from './ReportSectionEditPanel';
import { ReportSettingsPanel } from './ReportSettingsPanel';
import { getReportBuilderTheme } from './reportBuilderTokens';
import { cn } from '../ui/utils';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface ReportBuilderProps {
  report: ManagedReport;
  savedSnapshot: string;
  onBack: () => void;
  onUpdate: (report: ManagedReport) => void;
  onPublish: (report: ManagedReport) => void;
  onCommit: (report: ManagedReport) => void;
  onAttachSources?: () => void;
}

export function ReportBuilder({
  report,
  savedSnapshot,
  onBack,
  onUpdate,
  onPublish,
  onCommit,
  onAttachSources,
}: ReportBuilderProps) {
  const [editTarget, setEditTarget] = useState<SectionEditTarget | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);

  const theme = getReportBuilderTheme(report.themeId);
  const isDirty = JSON.stringify(report) !== savedSnapshot;
  const panelOpen = Boolean(editTarget) || settingsOpen;
  const showTemplate = hasLinkedKnowledgeSources(report);

  const sortedSections = useMemo(
    () => [...report.sections].sort((a, b) => a.order - b.order),
    [report.sections],
  );

  const touch = useCallback(
    (updates: Partial<ManagedReport>, commit = false) => {
      const next = {
        ...report,
        ...updates,
        updatedAt: formatDate(new Date()),
      };
      onUpdate(next);
      if (commit) onCommit(next);
    },
    [report, onUpdate, onCommit],
  );

  const openSectionEdit = (target: SectionEditTarget) => {
    setSettingsOpen(false);
    setEditTarget(target);
    setSelectedHighlight(
      target.kind === 'section'
        ? target.sectionId
        : target.kind === 'kpi'
          ? target.tileId
          : target.tileId,
    );
  };

  const closeSectionEdit = () => {
    setEditTarget(null);
    setSelectedHighlight(null);
  };

  const openSettings = () => {
    setEditTarget(null);
    setSelectedHighlight(null);
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  const handleInsertSection = (afterIndex: number) => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      order: afterIndex + 1,
      title: 'New section',
      layout: 'split',
      chartType: 'auto',
      prompt: '',
    };
    const updated = sortedSections.map((s, i) => ({
      ...s,
      order: i <= afterIndex ? i : i + 1,
    }));
    updated.splice(afterIndex + 1, 0, newSection);
    touch({ sections: updated.map((s, i) => ({ ...s, order: i })) });
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const idx = sortedSections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedSections.length) return;
    const next = [...sortedSections];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    touch({ sections: next.map((s, i) => ({ ...s, order: i })) });
  };

  const handleDeleteSection = (sectionId: string) => {
    const next = sortedSections
      .filter((s) => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i }));
    touch({ sections: next });
  };

  return (
    <div className="h-full flex flex-col min-h-0" style={{ backgroundColor: theme.pageBg }}>
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div
            className={cn(
              'mx-auto px-4 sm:px-8 py-6 transition-[max-width] duration-300',
              panelOpen ? 'max-w-3xl' : 'max-w-5xl',
            )}
          >
            <div className="space-y-6">
              <ReportBuilderHeader
                report={report}
                isDirty={isDirty}
                hasKnowledgeSources={showTemplate}
                onBack={onBack}
                onTitleChange={(title) => touch({ title })}
                onDescriptionChange={(description) => touch({ description })}
                onOpenSettings={openSettings}
                onPublish={() => onPublish({ ...report, status: 'published' })}
              />

              {!showTemplate && onAttachSources ? (
                <ReportDraftSourcesEmpty onAttachSources={onAttachSources} />
              ) : (
                <>
              <ReportKpiTileGrid
                tiles={report.kpiTiles}
                theme={theme}
                selectedId={editTarget?.kind === 'kpi' ? editTarget.tileId : null}
                onTileClick={(tileId) => openSectionEdit({ kind: 'kpi', tileId })}
              />

              <div className="space-y-0">
                <ReportSectionInsert onInsert={() => handleInsertSection(-1)} />

                {sortedSections.map((section, index) => (
                  <div key={section.id}>
                    <ReportSectionCard
                      section={section}
                      index={index}
                      total={sortedSections.length}
                      theme={theme}
                      isSelected={
                        selectedHighlight === section.id ||
                        (editTarget?.kind === 'forward_tile' &&
                          editTarget.sectionId === section.id)
                      }
                      onClick={() => openSectionEdit({ kind: 'section', sectionId: section.id })}
                      onMoveUp={
                        index > 0 ? () => handleMoveSection(section.id, 'up') : undefined
                      }
                      onMoveDown={
                        index < sortedSections.length - 1
                          ? () => handleMoveSection(section.id, 'down')
                          : undefined
                      }
                      onDelete={() => handleDeleteSection(section.id)}
                      onTileClick={(tileId) =>
                        openSectionEdit({
                          kind: 'forward_tile',
                          sectionId: section.id,
                          tileId,
                        })
                      }
                    />
                    <ReportSectionInsert onInsert={() => handleInsertSection(index)} />
                  </div>
                ))}
              </div>
                </>
              )}
            </div>
          </div>
        </div>

        {editTarget && (
          <ReportSectionEditPanel
            target={editTarget}
            sections={sortedSections}
            kpiTiles={report.kpiTiles}
            onClose={closeSectionEdit}
            onSaveSection={(section) => {
              touch({
                sections: report.sections.map((s) =>
                  s.id === section.id ? section : s,
                ),
              });
            }}
            onSaveKpiTile={(tile) => {
              touch({
                kpiTiles: report.kpiTiles.map((t) => (t.id === tile.id ? tile : t)),
              });
            }}
            onSaveForwardTile={(sectionId, tile) => {
              touch({
                sections: report.sections.map((s) =>
                  s.id === sectionId
                    ? {
                        ...s,
                        tiles: (s.tiles ?? []).map((t) =>
                          t.id === tile.id ? tile : t,
                        ),
                      }
                    : s,
                ),
              });
            }}
          />
        )}

        {settingsOpen && !editTarget && (
          <ReportSettingsPanel
            report={report}
            onClose={closeSettings}
            onSave={(updates, options) => touch(updates, options?.commit)}
          />
        )}
      </div>
    </div>
  );
}
