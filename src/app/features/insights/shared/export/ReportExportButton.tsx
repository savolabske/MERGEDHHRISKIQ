import { ChevronDown, Download, FileDown, Presentation } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { cn } from '../../../../components/ui/utils';
import type { ReportExportFormat } from './types';

interface ReportExportButtonProps {
  onExport: (format: ReportExportFormat) => void;
  disabled?: boolean;
  className?: string;
}

export function ReportExportButton({ onExport, disabled, className }: ReportExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12.5px] font-medium text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <Download size={14} className="shrink-0" />
          Export
          <ChevronDown size={13} className="shrink-0 opacity-90" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem
          onSelect={() => onExport('pdf')}
          className="cursor-pointer gap-2"
        >
          <FileDown size={15} />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onExport('pptx')}
          className="cursor-pointer gap-2"
        >
          <Presentation size={15} />
          Export as PowerPoint (.pptx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
