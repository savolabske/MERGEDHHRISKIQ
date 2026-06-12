import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, PieChart, Pie, ComposedChart, Line, Area, LineChart,
} from 'recharts';
import {
  ReportShell, ReportBackButton, ReportHero, ReportStorySection, ReportChartPanel,
  ReportLegendPills, ReportRiskMap,
  REPORT_THEMES, TOOLTIP_STYLE, CHART_ANIMATION,
} from './reportShared';
import {
  PROGRAMMATIC_NARRATIVES, PROGRAMMATIC_NOTES, PROGRAMMATIC_RISK_TYPES, PROGRAMMATIC_KPIS,
  flagsByType, flagsQ4vsQ1, partnerRiskScores, cashTrackingMonthly,
  monitoringCoverage, monitoringGapByRegion, accountabilityQ3, accountabilityQ4,
  programmaticMapLocations, flagsMix2025, flagsHotspotsQ1, top10ProgrammaticHotspots,
  riskTypeMiniCharts, biometricCoverageTrend, flagsMonthly, frozenFundsBreakdown,
  PROGRAMMATIC_REPORT_CREATED,
} from './programmaticReportData';

const THEME = REPORT_THEMES.programmatic;
const STACK_KEYS = ['sanctions', 'ghost', 'capacity', 'cash', 'monitoring'] as const;
const STACK_LABELS: Record<string, string> = {
  sanctions: 'Sanctions', ghost: 'Ghost beneficiaries', capacity: 'Capacity',
  cash: 'Cash / KYC', monitoring: 'Monitoring',
};
const STACK_COLORS: Record<string, string> = {
  sanctions: 'var(--destructive-text)', ghost: 'var(--chart-3)', capacity: 'var(--warning-strong)', cash: 'var(--primary)', monitoring: 'var(--muted-foreground)',
};
const ACC_KEYS = ['sanctions', 'ghost', 'capacity', 'cash', 'monitoring'] as const;
const ACC_LABELS: Record<string, string> = {
  sanctions: 'Sanctions', ghost: 'Ghost beneficiaries', capacity: 'Capacity',
  cash: 'Cash / KYC', monitoring: 'Monitoring',
};
const ACC_COLORS: Record<string, string> = {
  sanctions: 'var(--destructive-text)', ghost: 'var(--chart-3)', capacity: 'var(--warning-strong)', cash: 'var(--primary)', monitoring: 'var(--muted-foreground)',
};

export function ProgrammaticRisksReport({ onBack }: { onBack: () => void }) {
  const trendData = flagsMonthly.slice(-3);
  const cashData = cashTrackingMonthly.slice(-3);

  const hotspotData = [...flagsHotspotsQ1].reverse();
  const top10Data = [...top10ProgrammaticHotspots].reverse();
  const accountabilityData = [
    { quarter: 'Q3 2025', ...accountabilityQ3 },
    { quarter: 'Q4 2025', ...accountabilityQ4 },
  ];

  return (
    <ReportShell>
      <ReportBackButton onBack={onBack} title="Programmatic Risks" />
      <ReportHero
        title="Programmatic Risks"
        createdAt={PROGRAMMATIC_REPORT_CREATED}
        theme={THEME}
      />
      <ReportLegendPills
        items={PROGRAMMATIC_RISK_TYPES.map((t) => ({
          label: t.label,
          color: t.color,
          title: t.definition,
        }))}
      />

      {/* §1 HIGHLIGHTS */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.highlights} theme={THEME}>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <ReportChartPanel title="Q1 2026: Flags by Type">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flagsByType} margin={{ top: 8, right: 8, left: -8, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                  <XAxis dataKey="type" stroke="var(--text-subtle)" fontSize={10} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="var(--text-subtle)" fontSize={11} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar {...CHART_ANIMATION} dataKey="value" radius={[4, 4, 0, 0]}>
                    {flagsByType.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>

          <ReportChartPanel title="Q4 2025 vs Q1 2026">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flagsQ4vsQ1} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={11} />
                  <YAxis stroke="var(--text-subtle)" fontSize={11} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend formatter={(v) => (v === 'q4' ? 'Q4 2025' : 'Q1 2026')} wrapperStyle={{ fontSize: 12 }} />
                  <Bar {...CHART_ANIMATION} dataKey="q4" fill="var(--text-subtle)" radius={[4, 4, 0, 0]} />
                  <Bar {...CHART_ANIMATION} dataKey="q1" fill={THEME.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ${PROGRAMMATIC_KPIS.disbursementsUnderReview}M under review · {PROGRAMMATIC_KPIS.partnersFlagged} partners flagged
            </p>
          </ReportChartPanel>
        </div>
      </ReportStorySection>

      {/* §2 RISK MIX */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.riskMix} theme={THEME} note={PROGRAMMATIC_NOTES.detection}>
        <ReportChartPanel title={`2025 Flag Mix — ${PROGRAMMATIC_KPIS.totalFlags2025} Total Flags`}>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flagsMix2025}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {flagsMix2025.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-kpi">{PROGRAMMATIC_KPIS.totalFlags2025}</span>
                <span className="text-xs text-text-subtle uppercase">flags</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full">
              {flagsMix2025.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                    <span className="text-sm text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground-emphasis shrink-0">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §3 HOTSPOTS */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.flagHotspots} theme={THEME}>
        <ReportChartPanel title="Q1 Hotspots — Stacked by Risk Type">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotspotData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis type="category" dataKey="location" stroke="var(--text-subtle)" fontSize={11} width={120} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                {STACK_KEYS.map((k) => (
                  <Bar {...CHART_ANIMATION} key={k} dataKey={k} name={STACK_LABELS[k]} stackId="f" fill={STACK_COLORS[k]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §4 TOP 10 */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.top10Hotspots} theme={THEME}>
          <ReportChartPanel title="2025 Top 10 Programmatic Risk Hotspots">
            <div className="h-[440px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} />
                  <YAxis type="category" dataKey="location" stroke="var(--text-subtle)" fontSize={11} width={120} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                  {STACK_KEYS.map((k) => (
                    <Bar {...CHART_ANIMATION} key={k} dataKey={k} name={STACK_LABELS[k]} stackId="top10" fill={STACK_COLORS[k]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>
        </ReportStorySection>

      {/* §5 RISK BREAKDOWN */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.riskBreakdown} theme={THEME}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {riskTypeMiniCharts.map((chart) => (
              <ReportChartPanel key={chart.title} title={chart.title}>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart.data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="location" stroke="var(--text-subtle)" fontSize={9} width={100} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar {...CHART_ANIMATION} dataKey="value" fill={chart.color} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ReportChartPanel>
            ))}
          </div>
        </ReportStorySection>

      {/* §6 PORTFOLIO TREND */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.seasonalComparison} theme={THEME} note={PROGRAMMATIC_NOTES.detection}>
        <ReportChartPanel title="Q1 Flag Trend">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis yAxisId="left" stroke={THEME.accent} fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--destructive-text)" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area {...CHART_ANIMATION} yAxisId="left" type="monotone" dataKey="flags" name="Total flags" fill="#ede9fe" stroke={THEME.accent} strokeWidth={2} />
                <Line {...CHART_ANIMATION} yAxisId="right" type="monotone" dataKey="critical" name="Critical" stroke="var(--destructive-text)" strokeWidth={2.5} dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §7 PARTNERS */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.partners} theme={THEME} note={PROGRAMMATIC_NOTES.screening}>
        <ReportChartPanel title="Partner Risk Scores">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...partnerRiskScores].reverse()} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} domain={[0, 100]} />
                <YAxis type="category" dataKey="partner" stroke="var(--text-subtle)" fontSize={10} width={120} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, 'Risk score']} />
                <Bar {...CHART_ANIMATION} dataKey="score" fill={THEME.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {PROGRAMMATIC_KPIS.enhancedDdPartners} partners under enhanced due diligence
          </p>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §8 CASH */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.cash} theme={THEME} note={PROGRAMMATIC_NOTES.cashModality}>
        <ReportChartPanel title="Cash Reach vs Accountability Flags">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis yAxisId="left" stroke="var(--primary)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" stroke={THEME.accent} fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area {...CHART_ANIMATION} yAxisId="left" type="monotone" dataKey="reach" name="Cash reach" fill="#ede9fe" stroke="var(--primary)" strokeWidth={2} />
                <Line {...CHART_ANIMATION} yAxisId="right" type="monotone" dataKey="flags" name="Flags" stroke={THEME.accent} strokeWidth={2.5} dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §9 BIOMETRIC */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.biometric} theme={THEME}>
        <ReportChartPanel title="Biometric Verification Coverage (%)">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={biometricCoverageTrend} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis stroke={THEME.accent} fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Coverage']} />
                <Line {...CHART_ANIMATION} type="monotone" dataKey="coverage" name="Coverage" stroke={THEME.accent} strokeWidth={2.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Target: 85% by Q2 · Duplication detection at {PROGRAMMATIC_KPIS.duplicationRate}% where biometrics active
          </p>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §10 MONITORING */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.monitoring} theme={THEME}>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <ReportChartPanel title="TPM Coverage">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie {...CHART_ANIMATION} data={monitoringCoverage} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270}>
                      {monitoringCoverage.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground-emphasis">77%</span>
                  <span className="text-xs text-text-subtle uppercase">monitored</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {monitoringCoverage.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {PROGRAMMATIC_KPIS.sitesWithoutTpm}% of sites without TPM coverage
            </p>
          </ReportChartPanel>
          <ReportChartPanel title="Monitoring Gap by Region (%)">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monitoringGapByRegion} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="region" stroke="var(--text-subtle)" fontSize={10} width={80} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Gap']} />
                  <Bar {...CHART_ANIMATION} dataKey="gap" fill={THEME.accent} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>
        </div>
      </ReportStorySection>

      {/* §11 ACCOUNTABILITY */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.accountability} theme={THEME}>
        <ReportChartPanel title="Q3 vs Q4 Accountability Finding Mix">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountabilityData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                <XAxis dataKey="quarter" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {ACC_KEYS.map((k) => (
                  <Bar {...CHART_ANIMATION} key={k} dataKey={k} name={ACC_LABELS[k]} stackId="a" fill={ACC_COLORS[k]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-3 px-6 pb-2 text-xs text-muted-foreground">
            <span>Q3 total: {accountabilityQ3.total}</span>
            <span>Q4 total: {accountabilityQ4.total}</span>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §12 FROZEN FUNDS */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.frozenFunds} theme={THEME}>
        <ReportChartPanel title="Disbursements Under Review ($M)">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frozenFundsBreakdown} margin={{ top: 8, right: 8, left: -8, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                <XAxis dataKey="reason" stroke="var(--text-subtle)" fontSize={9} angle={-25} textAnchor="end" height={56} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} tickFormatter={(v) => `$${v}M`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v}M`, 'Amount']} />
                <Bar {...CHART_ANIMATION} dataKey="amount" fill={THEME.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §13 GEOGRAPHIC */}
      <ReportStorySection narrative={PROGRAMMATIC_NARRATIVES.geographic} theme={THEME}>
        <ReportChartPanel>
          <ReportRiskMap
            locations={programmaticMapLocations}
            theme={THEME}
            valueLabel="flags"
            legend={[
              { label: 'Critical (5+)', color: 'var(--destructive-text)' },
              { label: 'High (3–4)', color: THEME.accent },
              { label: 'Moderate (<3)', color: 'var(--warning)' },
            ]}
          />
        </ReportChartPanel>
      </ReportStorySection>
    </ReportShell>
  );
}
