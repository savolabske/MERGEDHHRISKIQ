import { ChevronLeft } from 'lucide-react';

interface RiskIQChatHeaderProps {
  onBack: () => void;
  backLabel?: string;
}

export function RiskIQChatHeader({
  onBack,
  backLabel = 'Back to Dashboard',
}: RiskIQChatHeaderProps) {
  return (
    <div className="shrink-0 border-b border-border bg-card">
      <div className="px-4 sm:px-8 pt-4 pb-4">
        <div className="max-w-[1400px] mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-text transition-colors"
          >
            <ChevronLeft size={18} />
            <span>{backLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
