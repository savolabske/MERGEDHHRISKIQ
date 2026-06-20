import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'];
const ACCEPTED_MIME = ACCEPTED_EXTENSIONS.join(',');
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface ResourceFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  onUploadComplete: (files: File[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File): boolean {
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function ResourceFileUploadModal({
  isOpen,
  onClose,
  resourceTitle,
  onUploadComplete,
}: ResourceFileUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const resetState = useCallback(() => {
    setSelectedFiles([]);
    setIsDragging(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen, resetState]);

  const addFiles = (incoming: File[]) => {
    const valid: File[] = [];
    for (const file of incoming) {
      if (!isAcceptedFile(file)) {
        toast.error(`${file.name}: Unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name}: File exceeds 10MB limit`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = valid.filter((f) => !existingNames.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    onUploadComplete(selectedFiles);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden [&>button]:top-5 [&>button]:right-5">
        <DialogHeader className="px-6 pt-6 pb-0 text-left">
          <DialogTitle>Add files</DialogTitle>
          <DialogDescription>
            Upload files to {resourceTitle}. You can select multiple files at once.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary-subtle'
                : 'border-border hover:border-primary'
            }`}
          >
            <Upload size={28} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-text-subtle mt-1">
              PDF, DOC, DOCX, TXT, XLSX (max 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_MIME}
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg"
                >
                  <FileText size={18} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-text-subtle">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 hover:bg-destructive-subtle rounded-lg transition-colors shrink-0"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={16} className="text-muted-foreground hover:text-destructive-text" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedFiles.length === 0}
            onClick={handleUpload}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${
              selectedFiles.length > 0
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-muted text-text-subtle cursor-not-allowed'
            }`}
          >
            <Upload size={16} />
            Upload{selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
