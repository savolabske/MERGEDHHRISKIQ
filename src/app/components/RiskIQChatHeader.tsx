import { UserPlus } from 'lucide-react';
import { BackLink } from './ui/back-link';

interface RiskIQChatHeaderProps {
  onBack: () => void;
  onInvite?: () => void;
}

export function RiskIQChatHeader({ onBack, onInvite }: RiskIQChatHeaderProps) {
  return (
    <div className="sticky top-0 z-20 shrink-0">
      <div className="px-4 sm:px-8 lg:px-10 pt-6 pb-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
          <BackLink onClick={onBack} />
          {onInvite ? (
            <button
              type="button"
              onClick={onInvite}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground-emphasis text-sm font-medium transition-colors"
            >
              <UserPlus size={16} className="text-muted-foreground" />
              <span>Invite</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
