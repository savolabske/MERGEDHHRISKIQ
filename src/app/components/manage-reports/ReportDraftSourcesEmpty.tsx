import { Paperclip } from 'lucide-react';

interface ReportDraftSourcesEmptyProps {
  onAttachSources: () => void;
}

export function ReportDraftSourcesEmpty({ onAttachSources }: ReportDraftSourcesEmptyProps) {
  return (
    <div className="flex justify-center py-10">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-warning-subtle flex items-center justify-center mx-auto mb-4">
          <Paperclip size={22} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          This report is saved as a draft
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          AI generates report sections from attached resources. Attach resources to this report to
          start building it.
        </p>
        <button
          type="button"
          onClick={onAttachSources}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Paperclip size={16} />
          Attach Resources
        </button>
      </div>
    </div>
  );
}
