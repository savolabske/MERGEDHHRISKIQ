import { BackLink } from './ui/back-link';

interface RiskIQChatHeaderProps {
  onBack: () => void;
}

export function RiskIQChatHeader({ onBack }: RiskIQChatHeaderProps) {
  return (
    <div className="shrink-0 border-b border-border bg-card">
      <div className="px-4 sm:px-8 pt-6 pb-4">
        <div className="max-w-[1400px] mx-auto">
          <BackLink onClick={onBack} />
        </div>
      </div>
    </div>
  );
}
