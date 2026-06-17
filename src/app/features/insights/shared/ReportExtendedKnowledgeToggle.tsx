import { Shield } from 'lucide-react';
import { cn } from '../../../components/ui/utils';

export interface ReportExtendedKnowledgeTheme {
  borderClass: string;
  bgClass: string;
  titleClass: string;
  subtitleClass: string;
  iconClass: string;
  activeToggleClass: string;
  inactiveToggleClass: string;
}

export const AID_FLOW_EXTENDED_KNOWLEDGE_THEME: ReportExtendedKnowledgeTheme = {
  borderClass: 'border-[#e6e9ef]',
  bgClass: 'bg-[#f4f6fa]',
  titleClass: 'text-[#324559]',
  subtitleClass: 'text-[#6b7a8d]',
  iconClass: 'text-[#1f6feb]',
  activeToggleClass: 'bg-[#1f6feb]',
  inactiveToggleClass: 'bg-[#cfd6e0]',
};

export const MIGRATION_EXTENDED_KNOWLEDGE_THEME: ReportExtendedKnowledgeTheme = {
  borderClass: 'border-[#ece6df]',
  bgClass: 'bg-[#faf7f2]',
  titleClass: 'text-[#4a3f38]',
  subtitleClass: 'text-[#8a7d72]',
  iconClass: 'text-[#c2562a]',
  activeToggleClass: 'bg-[#c2562a]',
  inactiveToggleClass: 'bg-[#d9cfc4]',
};

export const SJF_EXTENDED_KNOWLEDGE_THEME: ReportExtendedKnowledgeTheme = {
  borderClass: 'border-[#e2e6ee]',
  bgClass: 'bg-[#f4f6fa]',
  titleClass: 'text-[#324559]',
  subtitleClass: 'text-[#6f8094]',
  iconClass: 'text-[#00689D]',
  activeToggleClass: 'bg-[#00689D]',
  inactiveToggleClass: 'bg-[#cfd6e0]',
};

interface ReportExtendedKnowledgeToggleProps {
  enabled: boolean;
  onToggle: () => void;
  theme: ReportExtendedKnowledgeTheme;
}

export function ReportExtendedKnowledgeToggle({
  enabled,
  onToggle,
  theme,
}: ReportExtendedKnowledgeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'mt-2.5 flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left',
        theme.borderClass,
        theme.bgClass,
      )}
    >
      <div>
        <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold', theme.titleClass)}>
          <Shield size={13} className={theme.iconClass} />
          Extended Knowledge
        </div>
        <div className={cn('text-[10px]', theme.subtitleClass)}>
          Compare across Aid Flow, Migration &amp; more
        </div>
      </div>
      <span
        className={cn(
          'relative h-[18px] w-8 shrink-0 rounded-full transition',
          enabled ? theme.activeToggleClass : theme.inactiveToggleClass,
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition',
            enabled ? 'left-4' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}
