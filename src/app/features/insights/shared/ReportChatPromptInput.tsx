import { ChevronDown, Send } from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { useReportChatPanel } from './ReportChatLayout';

export interface ReportChatPromptTheme {
  border: string;
  bg: string;
  focusBorder: string;
  focusRing: string;
  buttonBg: string;
  buttonHover: string;
  text: string;
  disclaimer: string;
}

export const AID_FLOW_CHAT_PROMPT_THEME: ReportChatPromptTheme = {
  border: 'border-[#e6e9ef]',
  bg: 'bg-[#f6f7f9]',
  focusBorder: 'focus-within:border-[#1f6feb]',
  focusRing: 'focus-within:ring-[#eaf1fe]',
  buttonBg: 'bg-[#1f6feb]',
  buttonHover: 'hover:bg-[#1550b3]',
  text: 'text-[#0d1b2a]',
  disclaimer: 'text-[#6b7a8d]',
};

export const MIGRATION_CHAT_PROMPT_THEME: ReportChatPromptTheme = {
  border: 'border-[#ece6df]',
  bg: 'bg-[#f7f4ef]',
  focusBorder: 'focus-within:border-[#c2562a]',
  focusRing: 'focus-within:ring-[#fbeee5]',
  buttonBg: 'bg-[#c2562a]',
  buttonHover: 'hover:bg-[#a3461f]',
  text: 'text-[#1a1410]',
  disclaimer: 'text-[#8a7d72]',
};

export const SJF_CHAT_PROMPT_THEME: ReportChatPromptTheme = {
  border: 'border-[#e2e6ee]',
  bg: 'bg-[#f4f6fa]',
  focusBorder: 'focus-within:border-[#00689D]',
  focusRing: 'focus-within:ring-[#E5F3FB]',
  buttonBg: 'bg-[#00689D]',
  buttonHover: 'hover:bg-[#19486A]',
  text: 'text-[#0b1a2c]',
  disclaimer: 'text-[#6f8094]',
};

interface ReportChatPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  theme: ReportChatPromptTheme;
}

export function ReportChatPromptInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder,
  theme,
}: ReportChatPromptInputProps) {
  const { variant, closeMobileChat } = useReportChatPanel();
  const showMinimize = variant === 'sheet';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <>
      <div className="flex items-end gap-2">
        {showMinimize && (
          <button
            type="button"
            onClick={closeMobileChat}
            aria-label="Minimize chat and show report"
            title="Show report"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface-hover hover:text-primary-text"
          >
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        )}
        <div
          data-composite-field
          className={cn(
            'flex min-w-0 flex-1 items-end gap-2 rounded-xl border px-3 py-2 focus-within:ring-2',
            theme.border,
            theme.bg,
            theme.focusBorder,
            theme.focusRing,
          )}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'focus-ring-container-control min-h-[36px] max-h-[90px] flex-1 resize-none bg-transparent text-[12.8px] outline-none disabled:opacity-50',
              theme.text,
            )}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white disabled:opacity-50',
              theme.buttonBg,
              theme.buttonHover,
            )}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
      <div className={cn('mt-2 text-center text-[10px]', theme.disclaimer)}>
        AI can make mistakes. Verify critical insights.
      </div>
    </>
  );
}
