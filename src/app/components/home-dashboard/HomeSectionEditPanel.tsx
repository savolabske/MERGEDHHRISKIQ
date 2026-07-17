import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import type { DashboardSectionConfig } from '../../data/dashboardCustomizeTypes';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface DashboardSectionEditPanelProps {
  sections: DashboardSectionConfig[];
  sectionId: string;
  draftPrompt: string;
  isDirty: boolean;
  isSaving?: boolean;
  getDefaultPrompt: (sectionId: string) => string;
  promptDiffersFromDefault: (sectionId: string, prompt: string) => boolean;
  onDraftChange: (value: string) => void;
  onResetDraft: () => void;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function DashboardSectionEditPanel({
  sections,
  sectionId,
  draftPrompt,
  isDirty,
  isSaving = false,
  getDefaultPrompt,
  promptDiffersFromDefault,
  onDraftChange,
  onResetDraft,
  onCancel,
  onSave,
  onClose,
}: DashboardSectionEditPanelProps) {
  const section = sections.find((item) => item.id === sectionId);
  const sectionIndex = sections.findIndex((item) => item.id === sectionId);
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      const length = textareaRef.current?.value.length ?? 0;
      textareaRef.current?.setSelectionRange(length, length);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [sectionId]);

  if (!section) return null;

  const isUsingDefault = !promptDiffersFromDefault(sectionId, draftPrompt);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 right-0 z-[1350] flex w-full max-w-[420px] flex-col border-l border-border bg-card shadow-xl',
        'animate-in slide-in-from-right duration-300',
      )}
      aria-label={`Edit ${section.sidebarTitle}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 pr-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Section {sectionIndex + 1} of {sections.length} — {section.label}
          </p>
          <h2 className="text-lg font-semibold text-foreground mt-1">Edit section</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close edit panel"
        >
          <X size={18} strokeWidth={2.25} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <label htmlFor={textareaId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI prompt
        </label>
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={draftPrompt}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={5}
          className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/10 min-h-[112px] max-h-[200px]"
        />
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{section.promptHint}</p>

        {!isUsingDefault ? (
          <button
            type="button"
            onClick={onResetDraft}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Use default prompt
          </button>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">Using the default prompt.</p>
        )}
      </div>

      <div className="border-t border-border px-5 py-4 flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave} disabled={isSaving || !isDirty}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </aside>
  );
}

/** @deprecated Use DashboardSectionEditPanel */
export const HomeSectionEditPanel = DashboardSectionEditPanel;
