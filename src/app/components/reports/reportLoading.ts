import type { IntelligenceLoadStep } from '../ui/intelligenceLoading';

export { INTELLIGENCE_LOAD_DURATION_MS as REPORT_LOAD_DURATION_MS } from '../ui/intelligenceLoading';

export const REPORT_LOAD_CONFIG: Record<
  string,
  { steps: readonly IntelligenceLoadStep[]; subtitle: string }
> = {
  security: {
    subtitle: 'Security Incidents · Somalia',
    steps: [
      { id: 'incidents', label: 'Gathering incident records' },
      { id: 'zones', label: 'Mapping operational zones' },
      { id: 'threats', label: 'Cross-referencing threat intelligence' },
      { id: 'report', label: 'Building security report' },
    ],
  },
  'aid-diversion': {
    subtitle: 'Aid Diversion · Somalia',
    steps: [
      { id: 'cases', label: 'Loading diversion allegations' },
      { id: 'chains', label: 'Analyzing procurement chains' },
      { id: 'partners', label: 'Reviewing partner assessments' },
      { id: 'report', label: 'Compiling aid diversion report' },
    ],
  },
  'climate-hazards': {
    subtitle: 'Climate Hazards · Somalia',
    steps: [
      { id: 'hazards', label: 'Syncing hazard indicators' },
      { id: 'events', label: 'Processing flood and drought data' },
      { id: 'displacement', label: 'Overlaying displacement trends' },
      { id: 'report', label: 'Generating climate report' },
    ],
  },
  'programmatic-risks': {
    subtitle: 'Programmatic Risks · Somalia',
    steps: [
      { id: 'aggregate', label: 'Aggregating programmatic risks' },
      { id: 'delivery', label: 'Reviewing delivery constraints' },
      { id: 'exposure', label: 'Scoring thematic exposures' },
      { id: 'report', label: 'Assembling programmatic report' },
    ],
  },
};
