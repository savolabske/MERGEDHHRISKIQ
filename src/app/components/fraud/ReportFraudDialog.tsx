import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { FieldError, fieldControlProps } from '../ui/form-validation';
import { textareaClass } from '../resources/resourceShared';
import { CURRENT_USER } from '../../utils/mockUsers';
import { saveFraudReport } from '../../data/fraudReportStore';

type ReportFraudDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReportFraudDialog({ open, onOpenChange }: ReportFraudDialogProps) {
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string>();

  const reset = () => {
    setDescription('');
    setAnonymous(false);
    setDescriptionError(undefined);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = description.trim();
    if (trimmed.length < 20) {
      setDescriptionError('Describe what happened in a sentence or two so the team can follow up.');
      return;
    }

    saveFraudReport({
      description: trimmed,
      anonymous,
      submittedBy: CURRENT_USER.name,
      submittedById: CURRENT_USER.id,
    });
    toast.success('Fraud report sent for review');
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Report fraud</DialogTitle>
            <DialogDescription>
              Describe what you noticed. Compliance reviews every report filed from Risk IQ.
            </DialogDescription>
          </DialogHeader>

          <div>
            <label htmlFor="fraud-description" className="mb-2 block text-sm font-medium text-foreground">
              What happened <span className="text-destructive-text">*</span>
            </label>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                if (descriptionError) setDescriptionError(undefined);
              }}
              placeholder="What did you see, who was involved, and when? Include amounts if you have them."
              rows={5}
              className={textareaClass}
              {...fieldControlProps('fraud-description', descriptionError)}
            />
            <FieldError id="fraud-description" message={descriptionError} />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">Submit anonymously</span>
              <span className="block text-sm text-muted-foreground">
                Your name stays hidden on this report.
              </span>
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
