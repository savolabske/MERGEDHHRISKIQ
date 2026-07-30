import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { DashboardPromptPrefs, DashboardSectionConfig } from '../data/dashboardCustomizeTypes';

const REGENERATE_MS = 1400;
const DISCARD_MESSAGE = 'You have unsaved prompt changes. Discard them and continue?';

type DiscardIntent<TSectionId extends string> =
  | { type: 'stop' }
  | { type: 'close' }
  | { type: 'switch'; sectionId: TSectionId };

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
  const [discardIntent, setDiscardIntent] = useState<DiscardIntent<TSectionId> | null>(null);

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

  const clearEditor = useCallback(() => {
    setEditingSection(null);
    setDraftPrompt('');
  }, []);

  const applyDiscardIntent = useCallback(
    (intent: DiscardIntent<TSectionId>) => {
      if (intent.type === 'stop') {
        clearEditor();
        setIsCustomizing(false);
        return;
      }
      if (intent.type === 'close') {
        clearEditor();
        return;
      }
      setEditingSection(intent.sectionId);
      setDraftPrompt(activePrompt(intent.sectionId));
    },
    [activePrompt, clearEditor],
  );

  const startCustomizing = useCallback(() => {
    setIsCustomizing(true);
  }, []);

  const stopCustomizing = useCallback(() => {
    if (editingSection && isDraftDirty) {
      setDiscardIntent({ type: 'stop' });
      return false;
    }
    clearEditor();
    setIsCustomizing(false);
    return true;
  }, [clearEditor, editingSection, isDraftDirty]);

  const openSectionEditor = useCallback(
    (sectionId: TSectionId) => {
      if (editingSection && editingSection !== sectionId && isDraftDirty) {
        setDiscardIntent({ type: 'switch', sectionId });
        return;
      }
      setEditingSection(sectionId);
      setDraftPrompt(activePrompt(sectionId));
    },
    [activePrompt, editingSection, isDraftDirty],
  );

  const closeSectionEditor = useCallback(() => {
    if (isDraftDirty) {
      setDiscardIntent({ type: 'close' });
      return false;
    }
    clearEditor();
    return true;
  }, [clearEditor, isDraftDirty]);

  const confirmDiscard = useCallback(() => {
    if (!discardIntent) return;
    applyDiscardIntent(discardIntent);
    setDiscardIntent(null);
  }, [applyDiscardIntent, discardIntent]);

  const cancelDiscard = useCallback(() => {
    setDiscardIntent(null);
  }, []);

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
    discardConfirmOpen: discardIntent !== null,
    discardConfirmDescription: DISCARD_MESSAGE,
    confirmDiscard,
    cancelDiscard,
  };
}
