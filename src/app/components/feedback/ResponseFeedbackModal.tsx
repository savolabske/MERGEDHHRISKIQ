import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { FeedbackRating } from '../../data/responseFeedbackStore';

type ResponseFeedbackModalProps = {
  open: boolean;
  rating: FeedbackRating | null;
  onClose: () => void;
  onSubmit: (payload: { details?: string }) => void;
};

export function ResponseFeedbackModal({
  open,
  rating,
  onClose,
  onSubmit,
}: ResponseFeedbackModalProps) {
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (!open) return;
    setDetails('');
  }, [open, rating]);

  const isPositive = rating === 'positive';

  const handleSubmit = () => {
    onSubmit({
      details: details.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isPositive ? 'Give positive feedback' : 'Give negative feedback'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Please provide details: (optional)
            </label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={
                isPositive
                  ? 'What was satisfying about this response?'
                  : 'What was unsatisfying about this response?'
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-text-subtle focus:border-primary focus:outline-none"
            />
          </div>

          <p className="text-xs italic text-muted-foreground">
            Submitting this report will include this response and conversation context to help
            improve Humanity hub.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
