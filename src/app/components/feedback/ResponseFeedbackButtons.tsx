import { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { CURRENT_USER } from '../../utils/mockUsers';
import {
  getFeedbackForMessage,
  removeResponseFeedback,
  saveResponseFeedback,
  stripMarkdownPreview,
  type ConversationSnapshotMessage,
  type FeedbackRating,
  type ResponseFeedback,
  RESPONSE_FEEDBACK_CHANGED_EVENT,
} from '../../data/responseFeedbackStore';
import { ResponseFeedbackModal } from './ResponseFeedbackModal';

type ResponseFeedbackButtonsProps = {
  messageId: string;
  responseContent: string;
  webIntelligenceContent?: string;
  threadId?: string;
  threadTitle?: string;
  userQueryPreview?: string;
  conversationSnapshot?: ConversationSnapshotMessage[];
  hidden?: boolean;
  className?: string;
};

export function ResponseFeedbackButtons({
  messageId,
  responseContent,
  webIntelligenceContent,
  threadId,
  threadTitle,
  userQueryPreview,
  conversationSnapshot,
  hidden = false,
  className,
}: ResponseFeedbackButtonsProps) {
  const [submittedFeedback, setSubmittedFeedback] = useState<ResponseFeedback | undefined>(() =>
    getFeedbackForMessage(messageId),
  );
  const [pendingRating, setPendingRating] = useState<FeedbackRating | null>(null);

  useEffect(() => {
    setSubmittedFeedback(getFeedbackForMessage(messageId));
  }, [messageId]);

  useEffect(() => {
    const handleChanged = () => {
      setSubmittedFeedback(getFeedbackForMessage(messageId));
    };

    window.addEventListener(RESPONSE_FEEDBACK_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(RESPONSE_FEEDBACK_CHANGED_EVENT, handleChanged);
  }, [messageId]);

  if (hidden) return null;

  const activeRating = submittedFeedback?.rating;
  const hasSubmitted = Boolean(activeRating);

  const openModal = (rating: FeedbackRating) => {
    setPendingRating(rating);
  };

  const closeModal = () => {
    setPendingRating(null);
  };

  const handleSubmit = (payload: { details?: string }) => {
    if (!pendingRating) return;

    const record = saveResponseFeedback({
      messageId,
      threadId,
      threadTitle,
      rating: pendingRating,
      details: payload.details,
      responsePreview: stripMarkdownPreview(responseContent),
      responseContent,
      webIntelligenceContent,
      userQueryPreview,
      conversationSnapshot,
      submittedBy: CURRENT_USER.name,
      submittedById: CURRENT_USER.id,
      source: 'chat',
    });

    setSubmittedFeedback(record);
    setPendingRating(null);
    toast.success('Thanks for your feedback');
  };

  const handleThumbClick = (rating: FeedbackRating) => {
    if (activeRating === rating) {
      if (removeResponseFeedback(messageId)) {
        setSubmittedFeedback(undefined);
        toast.success('Feedback removed');
      }
      return;
    }

    if (!hasSubmitted) {
      openModal(rating);
    }
  };

  const buttonClass = (rating: FeedbackRating) => {
    const isActive = activeRating === rating;

    return cn(
      'inline-flex items-center justify-center rounded-md p-1.5 transition-colors',
      isActive
        ? 'bg-primary/10 text-primary hover:bg-primary/15'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      hasSubmitted && !isActive && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground',
    );
  };

  const tooltipLabel = (rating: FeedbackRating) => {
    if (activeRating === rating) return 'Remove feedback';
    return rating === 'positive' ? 'Good response' : 'Bad response';
  };

  const ariaLabel = (rating: FeedbackRating) => {
    if (activeRating === rating) return 'Remove feedback';
    return rating === 'positive' ? 'Good response' : 'Bad response';
  };

  return (
    <>
      <div className={cn('flex items-center gap-0.5', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => handleThumbClick('positive')}
              disabled={hasSubmitted && activeRating !== 'positive'}
              className={buttonClass('positive')}
              aria-label={ariaLabel('positive')}
              aria-pressed={activeRating === 'positive'}
            >
              <ThumbsUp size={16} fill={activeRating === 'positive' ? 'currentColor' : 'none'} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            {tooltipLabel('positive')}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => handleThumbClick('negative')}
              disabled={hasSubmitted && activeRating !== 'negative'}
              className={buttonClass('negative')}
              aria-label={ariaLabel('negative')}
              aria-pressed={activeRating === 'negative'}
            >
              <ThumbsDown size={16} fill={activeRating === 'negative' ? 'currentColor' : 'none'} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            {tooltipLabel('negative')}
          </TooltipContent>
        </Tooltip>
      </div>

      <ResponseFeedbackModal
        open={pendingRating !== null}
        rating={pendingRating}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
