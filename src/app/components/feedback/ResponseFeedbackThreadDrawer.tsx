import { useEffect, useRef } from 'react';
import { Database, Globe, X } from 'lucide-react';
import { cn } from '../ui/utils';
import { iconButtonSmClass } from '../ui/interaction';
import type { ConversationSnapshotMessage, ResponseFeedback } from '../../data/responseFeedbackStore';
import { getFeedbackResponseContent } from '../../data/responseFeedbackStore';
import { getWebIntelligenceSummary } from '../../data/chatAiResponses';
import { renderResponseText } from './renderResponseText';

type ResponseFeedbackThreadDrawerProps = {
  feedback: ResponseFeedback | null;
  open: boolean;
  onClose: () => void;
};

function KnowledgeBaseSection({
  content,
  isRated,
}: {
  content: string;
  isRated?: boolean;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card',
        isRated ? 'border-primary/30' : 'border-border',
      )}
    >
      <div className="border-b border-border bg-muted px-4 py-3">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Knowledge Base</span>
        </div>
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed text-foreground">
        {renderResponseText(content)}
      </div>
    </div>
  );
}

function WebIntelligenceSection({
  content,
  isRated,
}: {
  content: string;
  isRated?: boolean;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card',
        isRated ? 'border-primary/30' : 'border-border',
      )}
    >
      <div className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Globe size={16} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Web Intelligence</span>
          <span className="text-xs font-normal text-text-subtle">Supplementary, unverified</span>
        </div>
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed text-foreground">
        {renderResponseText(content)}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: ConversationSnapshotMessage }) {
  return (
    <div className="ml-8 rounded-xl border border-border bg-card px-4 py-3">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {message.senderName || 'User'}
      </p>
      <div className="text-sm leading-relaxed text-foreground">
        {renderResponseText(message.content)}
      </div>
    </div>
  );
}

function enrichRatedMessage(
  message: ConversationSnapshotMessage,
  feedback: ResponseFeedback,
  isRated: boolean,
): ConversationSnapshotMessage {
  if (!isRated || message.role !== 'assistant') return message;

  return {
    ...message,
    content: feedback.responseContent || message.content,
    webIntelligenceSummary:
      message.webIntelligenceSummary ||
      feedback.webIntelligenceContent ||
      (feedback.userQueryPreview
        ? getWebIntelligenceSummary(feedback.userQueryPreview)
        : undefined),
  };
}

function AssistantMessage({
  message,
  isRated,
}: {
  message: ConversationSnapshotMessage;
  isRated: boolean;
}) {
  const webIntelligence = message.webIntelligenceSummary?.trim();

  return (
    <div className="mr-4 space-y-3">
      <KnowledgeBaseSection content={message.content} isRated={isRated} />
      {webIntelligence && (
        <WebIntelligenceSection content={webIntelligence} isRated={isRated} />
      )}
    </div>
  );
}

export function ResponseFeedbackThreadDrawer({
  feedback,
  open,
  onClose,
}: ResponseFeedbackThreadDrawerProps) {
  const ratedMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !feedback) return;
    const timer = window.setTimeout(() => {
      ratedMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [open, feedback?.id, feedback?.messageId]);

  if (!open || !feedback) return null;

  const snapshot = feedback.conversationSnapshot ?? [];
  const hasSnapshot = snapshot.length > 0;

  const fallbackAssistantMessage: ConversationSnapshotMessage = {
    id: feedback.messageId,
    role: 'assistant',
    content: getFeedbackResponseContent(feedback),
    senderName: 'Humanity Hub',
    webIntelligenceSummary: feedback.webIntelligenceContent,
  };

  const renderAssistantMessage = (
    message: ConversationSnapshotMessage,
    isRated: boolean,
  ) => {
    const displayMessage = enrichRatedMessage(message, feedback, isRated);
    return <AssistantMessage message={displayMessage} isRated={isRated} />;
  };

  return (
    <div className="fixed inset-0 z-[1600]">
      <div
        className="absolute inset-0 z-[1600] bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute top-0 right-0 z-[1610] flex h-full w-full flex-col border-l border-border bg-card shadow-2xl sm:w-[480px]">
        <div className="border-b border-border px-4 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-foreground">Conversation</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {feedback.threadTitle || 'Untitled thread'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {feedback.submittedBy} ·{' '}
                {new Date(feedback.submittedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(iconButtonSmClass, 'size-8 shrink-0 border border-transparent hover:border-border')}
              aria-label="Close conversation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {hasSnapshot ? (
            <div className="space-y-4">
              {snapshot.map((message) => {
                const isRated = message.id === feedback.messageId;
                return (
                  <div
                    key={message.id}
                    ref={isRated ? ratedMessageRef : undefined}
                  >
                    {message.role === 'user' ? (
                      <UserMessage message={message} />
                    ) : (
                      renderAssistantMessage(message, isRated)
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.userQueryPreview && (
                <UserMessage
                  message={{
                    id: `${feedback.messageId}-query`,
                    role: 'user',
                    content: feedback.userQueryPreview,
                    senderName: feedback.submittedBy,
                  }}
                />
              )}
              <div ref={ratedMessageRef}>
                {renderAssistantMessage(fallbackAssistantMessage, true)}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-3 sm:px-6">
          <p className="text-xs text-muted-foreground">
            Read-only snapshot captured when feedback was submitted.
          </p>
        </div>
      </div>
    </div>
  );
}
