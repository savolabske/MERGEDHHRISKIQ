import { Send, Sparkles, Wrench } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../ui/utils';

interface ReportCreationModeSelectorProps {
  onSelectManual: () => void;
  onSelectMasterPrompt: (prompt: string) => void;
}

export function ReportCreationModeSelector({
  onSelectManual,
  onSelectMasterPrompt,
}: ReportCreationModeSelectorProps) {
  const [mode, setMode] = useState<'manual' | 'master_prompt'>('master_prompt');
  const [masterPrompt, setMasterPrompt] = useState('');

  return (
    <div className="flex justify-center py-6 sm:py-10">
      <div className="max-w-2xl w-full rounded-2xl border border-border bg-card p-4 sm:p-7 shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-snug">
          How do you want to build your report?
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode('master_prompt')}
            className={cn(
              'rounded-xl border px-4 py-4 text-left transition-colors',
              mode === 'master_prompt'
                ? 'border-primary bg-primary-subtle/35'
                : 'border-border hover:bg-muted',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary">
                <Sparkles size={16} />
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Recommended
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">Let Humanity Hub create it</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Describe what you need, and Humanity Hub will build the report for you.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={cn(
              'rounded-xl border px-4 py-4 text-left transition-colors',
              mode === 'manual'
                ? 'border-primary bg-primary-subtle/35'
                : 'border-border hover:bg-muted',
            )}
          >
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary">
              <Wrench size={16} />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">Build it myself</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start with a template and configure sections step by step.
            </p>
          </button>
        </div>

        {mode === 'master_prompt' && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Describe what the report should cover <span className="text-destructive-text">*</span>
            </label>
            <div className="relative rounded-xl border border-border bg-white px-4 py-3.5 pr-14 focus-within:border-primary transition-colors">
              <textarea
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                placeholder="Be specific—who is this for, what should it help them decide, and over what period? Name the sections, metrics, and story you want told. Example: A monthly briefing for country directors covering incident trends by region, average response times, and resource gaps across East Africa."
                rows={5}
                style={{ boxShadow: 'none' }}
                className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-foreground outline-none focus:outline-none focus:ring-0 focus:shadow-none appearance-none placeholder:text-[#9aa3b2] placeholder:opacity-100"
              />
              <button
                type="button"
                onClick={() => onSelectMasterPrompt(masterPrompt)}
                disabled={!masterPrompt.trim()}
                className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Generate report from prompt"
                title="Generate report"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {mode === 'manual' ? (
            <button
              type="button"
              onClick={onSelectManual}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Start building
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
