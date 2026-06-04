import { useState } from 'react';
import { DollarSign, Users, Cloud, Search, Clock } from 'lucide-react';
import { AidFlowScrollytelling } from '../features/insights/aid-flow';
import { MigrationDataScrollytelling } from './MigrationDataScrollytelling';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  IconComponent: typeof DollarSign;
  iconBg: string;
  iconColor: string;
  available?: boolean;
}

type ActiveReport = 'aid-flow' | 'migration-data' | null;

const PLACEHOLDER_REPORTS: ReportCard[] = [
  {
    id: 'aid-flow',
    title: 'Aid Flow Intelligence',
    description:
      'Track donor contributions, sector allocation, and spending delivery across regions.',
    IconComponent: DollarSign,
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
    available: true,
  },
  {
    id: 'migration-displacement',
    title: 'Migration & Displacement Intelligence',
    description:
      'IDP tracking, cross-border movement patterns, and returnee statistics.',
    IconComponent: Users,
    iconBg: 'bg-chart-3/10',
    iconColor: 'text-chart-3',
    available: true,
  },
  {
    id: 'climate-hazards',
    title: 'Climate Hazards Intelligence',
    description:
      'Drought severity, flash flooding, cholera outbreaks, and seasonal hazard forecasting for operational planning.',
    IconComponent: Cloud,
    iconBg: 'bg-success-subtle',
    iconColor: 'text-success',
  },
];

interface ReportsProps {
  onReportOpen?: () => void;
  onReportClose?: () => void;
}

export function Reports({ onReportOpen, onReportClose }: ReportsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);

  const filteredReports = PLACEHOLDER_REPORTS.filter(
    (r) =>
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportClick = (reportId: string) => {
    if (reportId === 'aid-flow') {
      setActiveReport('aid-flow');
      onReportOpen?.();
    } else if (reportId === 'migration-displacement') {
      setActiveReport('migration-data');
      onReportOpen?.();
    }
  };

  const handleReportBack = () => {
    setActiveReport(null);
    onReportClose?.();
  };

  if (activeReport === 'aid-flow') {
    return (
      <div className="h-full min-h-0 overflow-y-auto overscroll-contain" data-report-scroll>
        <AidFlowScrollytelling onBack={handleReportBack} />
      </div>
    );
  }

  if (activeReport === 'migration-data') {
    return (
      <div className="h-full min-h-0 overflow-y-auto overscroll-contain" data-report-scroll>
        <MigrationDataScrollytelling onBack={handleReportBack} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-8 pb-10">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground-emphasis">
                  Risk Reports
                </h2>
                <Clock size={18} className="text-text-subtle" />
              </div>
              <p className="text-sm text-muted-foreground">Thematic Risk Dashboard</p>
            </div>

            <div className="flex items-center gap-3 mb-7">
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => {
                const Icon = report.IconComponent;
                return (
                  <div
                    key={report.id}
                    onClick={() => report.available && handleReportClick(report.id)}
                    className={`relative bg-card border border-border rounded-2xl p-6 flex flex-col ${
                      report.available
                        ? 'cursor-pointer hover:border-primary hover:shadow-lg transition-all group'
                        : 'opacity-90'
                    }`}
                  >
                    {!report.available && (
                      <span className="absolute top-5 right-5 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        Coming soon
                      </span>
                    )}

                    <div
                      className={`w-11 h-11 ${report.iconBg} rounded-xl flex items-center justify-center mb-5`}
                    >
                      <Icon size={22} className={report.iconColor} />
                    </div>

                    <h3
                      className={`text-base font-bold text-foreground-emphasis mb-2 ${
                        report.available ? 'pr-0 group-hover:text-primary transition-colors' : 'pr-24'
                      }`}
                    >
                      {report.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">
                  No reports match &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
