import type { ElementType } from 'react';
import { IntelligenceLoadingScreen } from '../ui/IntelligenceLoadingScreen';
import { INTELLIGENCE_LOAD_DURATION_MS } from '../ui/intelligenceLoading';
import { REPORT_LOAD_CONFIG } from './reportLoading';

interface ReportLoadingScreenProps {
  reportId: string;
  reportTitle: string;
  centerIcon: ElementType<{ size?: number; className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;
  centerIconClassName: string;
}

export function ReportLoadingScreen({
  reportId,
  reportTitle,
  centerIcon,
  centerIconClassName,
}: ReportLoadingScreenProps) {
  const config = REPORT_LOAD_CONFIG[reportId] ?? {
    subtitle: `${reportTitle} · Somalia`,
    steps: [
      { id: 'data', label: 'Loading report data' },
      { id: 'charts', label: 'Preparing visualizations' },
      { id: 'narrative', label: 'Generating narrative sections' },
      { id: 'ready', label: 'Finalizing report' },
    ],
  };

  return (
    <IntelligenceLoadingScreen
      durationMs={INTELLIGENCE_LOAD_DURATION_MS}
      steps={config.steps}
      eyebrow="Report"
      subtitle={config.subtitle}
      ariaLabel={`Loading ${reportTitle}`}
      centerIcon={centerIcon}
      centerIconClassName={centerIconClassName}
    />
  );
}
