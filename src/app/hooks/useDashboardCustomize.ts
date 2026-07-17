import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { DashboardPromptPrefs, DashboardSectionConfig } from '../data/dashboardCustomizeTypes';

const REGENERATE_MS = 1400;

function confirmDiscard(message: string): boolean {
  if (typeof window === 'undefined') return true;
  return window.confirm(message);
}

export interface DashboardCustomizeConfig<TSectionId extends string> {
  sections: DashboardSectionConfig[];
  changedEvent: string;
  loadPrompts: () => DashboardPromptPrefs;
  savePrompts: (prefs: DashboardPromptPrefs) => void;
  getDefaultPrompt: (sectionId: TSectionId) => string;
  promptDiffersFromDefault: (sectionId: TSectionId, prompt: string) => boolean;
  getSectionLabel: (sectionId: TSectionId) => string;
}

export function useDashboardCustomize<TSectionId extends string>(
  config: DashboardCustomizeConfig<TSectionId>,
) {
  const [savedPrompts, setSavedPrompts] = useState<DashboardPromptPrefs>(() => config.loadPrompts());
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [editingSection, setEditingSection] = useState<TSectionId | null>(null);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [regeneratingSections, setRegeneratingSections] = useState<Partial<Record<TSectionId, boolean>>>(
    {},
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sync = () => setSavedPrompts(config.loadPrompts());
    window.addEventListener(config.changedEvent, sync);
    return () => window.removeEventListener(config.changedEvent, sync);
  }, [config.changedEvent, config.loadPrompts]);

  const activePrompt = useCallback(
    (sectionId: TSectionId) =>
      (savedPrompts[sectionId] as string | undefined) ?? config.getDefaultPrompt(sectionId),
    [config, savedPrompts],
  );

  const isDraftDirty = useMemo(() => {
    if (!editingSection) return false;
    return draftPrompt.trim() !== activePrompt(editingSection).trim();
  }, [activePrompt, draftPrompt, editingSection]);

  const startCustomizing = useCallback(() => {
    setIsCustomizing(true);
  }, []);

  const stopCustomizing = useCallback(() => {
    if (editingSection && isDraftDirty) {
      const discard = confirmDiscard('Discard unsaved prompt changes?');
      if (!discard) return false;
    }
    setEditingSection(null);
    setDraftPrompt('');
    setIsCustomizing(false);
    return true;
  }, [editingSection, isDraftDirty]);

  const openSectionEditor = useCallback(
    (sectionId: TSectionId) => {
      if (editingSection && editingSection !== sectionId && isDraftDirty) {
        const discard = confirmDiscard('Discard unsaved prompt changes?');
        if (!discard) return;
      }
      setEditingSection(sectionId);
      setDraftPrompt(activePrompt(sectionId));
    },
    [activePrompt, editingSection, isDraftDirty],
  );

  const closeSectionEditor = useCallback(() => {
    if (isDraftDirty) {
      const discard = confirmDiscard('Discard unsaved prompt changes?');
      if (!discard) return false;
    }
    setEditingSection(null);
    setDraftPrompt('');
    return true;
  }, [isDraftDirty]);

  const resetDraftToDefault = useCallback(() => {
    if (!editingSection) return;
    setDraftPrompt(config.getDefaultPrompt(editingSection));
  }, [config, editingSection]);

  const saveSectionPrompt = useCallback(async () => {
    if (!editingSection) return;

    const trimmed = draftPrompt.trim();
    if (!trimmed) {
      toast.error('Prompt cannot be empty');
      return;
    }

    const nextPrefs: DashboardPromptPrefs = { ...savedPrompts };
    if (config.promptDiffersFromDefault(editingSection, trimmed)) {
      nextPrefs[editingSection] = trimmed;
    } else {
      delete nextPrefs[editingSection];
    }

    setIsSaving(true);
    setRegeneratingSections((current) => ({ ...current, [editingSection]: true }));

    await new Promise((resolve) => window.setTimeout(resolve, REGENERATE_MS));

    config.savePrompts(nextPrefs);
    setSavedPrompts(nextPrefs);
    setRegeneratingSections((current) => ({ ...current, [editingSection]: false }));
    setEditingSection(null);
    setDraftPrompt('');
    setIsSaving(false);

    toast.success(
      config.promptDiffersFromDefault(editingSection, trimmed)
        ? `${config.getSectionLabel(editingSection)} updated for your view`
        : `${config.getSectionLabel(editingSection)} reset to default`,
    );
  }, [config, draftPrompt, editingSection, savedPrompts]);

  const isSectionRegenerating = useCallback(
    (sectionId: TSectionId) => Boolean(regeneratingSections[sectionId]),
    [regeneratingSections],
  );

  return {
    sections: config.sections,
    savedPrompts,
    isCustomizing,
    editingSection,
    draftPrompt,
    isDraftDirty,
    isSaving,
    isPanelOpen: editingSection !== null,
    getDefaultPrompt: config.getDefaultPrompt,
    promptDiffersFromDefault: config.promptDiffersFromDefault,
    startCustomizing,
    stopCustomizing,
    openSectionEditor,
    closeSectionEditor,
    setDraftPrompt,
    resetDraftToDefault,
    saveSectionPrompt,
    isSectionRegenerating,
  };
}
