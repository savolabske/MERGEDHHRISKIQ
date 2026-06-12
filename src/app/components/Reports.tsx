import { useEffect, useState } from 'react';
import { DollarSign, Users, Search, Clock, Landmark } from 'lucide-react';
import { AidFlowScrollytelling } from '../features/insights/aid-flow';
import { MigrationDataScrollytelling } from './MigrationDataScrollytelling';
import { SomaliaJointFundScrollytelling } from './SomaliaJointFundScrollytelling';
import { PageScrollShell } from './PageScrollShell';
import { ReportDetailShell } from '../features/insights/shared/ReportDetailShell';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  IconComponent: typeof DollarSign;
  iconBg: string;
  iconColor: string;
  available?: boolean;
}

export type ActiveReport = 'aid-flow' | 'migration-data' | 'somalia-joint-fund' | null;

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
    id: 'somalia-joint-fund',
    title: 'Somalia Joint Fund Intelligence',
    description:
      'Track the SJF portfolio, donor base, thematic windows, programmes, and H1 2025 results.',
    IconComponent: Landmark,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-700',
    available: true,
  },
];

interface ReportsProps {
  initialReport?: ActiveReport;
  onInitialReportConsumed?: () => void;
  onReportOpen?: () => void;
  onReportClose?: () => void;
}

export function Reports({
  initialReport = null,
  onInitialReportConsumed,
  onReportOpen,
  onReportClose,
}: ReportsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);

  useEffect(() => {
    if (!initialReport) return;
    setActiveReport(initialReport);
    onReportOpen?.();
    onInitialReportConsumed?.();
  }, [initialReport, onReportOpen, onInitialReportConsumed]);

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
    } else if (reportId === 'somalia-joint-fund') {
      setActiveReport('somalia-joint-fund');
      onReportOpen?.();
    }
  };

  const handleReportBack = () => {
    setActiveReport(null);
    onReportClose?.();
  };

  if (activeReport === 'aid-flow') {
    return (
      <ReportDetailShell>
        <AidFlowScrollytelling onBack={handleReportBack} />
      </ReportDetailShell>
    );
  }

  if (activeReport === 'migration-data') {
    return (
      <ReportDetailShell>
        <MigrationDataScrollytelling onBack={handleReportBack} />
      </ReportDetailShell>
    );
  }

  if (activeReport === 'somalia-joint-fund') {
    return (
      <ReportDetailShell>
        <SomaliaJointFundScrollytelling onBack={handleReportBack} />
      </ReportDetailShell>
    );
  }

  return (
    <PageScrollShell paddingClassName="px-4 sm:px-8 pt-8" maxWidth="1280">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-page-title">
                  Reports
                </h2>
                <Clock size={18} className="text-text-subtle" />
              </div>
              <p className="text-sm text-muted-foreground">Thematic dashboards</p>
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
                      <span className="absolute top-5 right-5 text-metadata uppercase tracking-wide bg-muted px-2.5 py-1 rounded-full">
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
    </PageScrollShell>
  );
}
