import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ComposedChart, Line, Area, PieChart, Pie, LineChart,
} from 'recharts';
import {
  ReportShell, ReportBackButton, ReportHero, ReportStorySection, ReportChartPanel,
  ReportLegendPills, ReportRiskMap,
  REPORT_THEMES, TOOLTIP_STYLE, CHART_ANIMATION,
} from './reportShared';
import {
  SECURITY_NARRATIVES, SECURITY_NOTES, SECURITY_THREAT_TYPES, SECURITY_KPIS,
  q1IncidentsByType, securityAnnualComparison, securityHotspots, securityActors,
  securityTrendMonthly, securityMapLocations, top10SecurityHotspots,
  threatTypeMiniCharts, securityMix2025, iedCorridorWeekly, kidnappingByRegion,
  SECURITY_REPORT_CREATED,
} from './securityReportData';

const THEME = REPORT_THEMES.security;
const STACK_KEYS = ['ied', 'armedAssault', 'checkpoint', 'kidnapping', 'crime'] as const;
const STACK_LABELS: Record<string, string> = {
  ied: 'IED', armedAssault: 'Armed assault', checkpoint: 'Checkpoint',
  kidnapping: 'Kidnapping', crime: 'Crime',
};
const STACK_COLORS: Record<string, string> = {
  ied: 'var(--destructive-text)', armedAssault: 'var(--warning-strong)', checkpoint: 'var(--chart-3)',
  kidnapping: 'var(--primary)', crime: 'var(--muted-foreground)',
};

export function SecurityIncidentsReport({ onBack }: { onBack: () => void }) {
  const hotspotData = [...securityHotspots].reverse();
  const top10Data = [...top10SecurityHotspots].reverse();
  const profileData = [
    { quarter: 'Q4 2025', ied: 35, armedAssault: 25, checkpoint: 20, kidnapping: 10, crime: 10 },
    { quarter: 'Q1 2026', ied: 35, armedAssault: 22, checkpoint: 17, kidnapping: 13, crime: 13 },
  ];

  return (
    <ReportShell>
      <ReportBackButton onBack={onBack} title="Security Incidents" />
      <ReportHero
        title="Security Incidents"
        createdAt={SECURITY_REPORT_CREATED}
        theme={THEME}
      />
      <ReportLegendPills
        items={SECURITY_THREAT_TYPES.map((t) => ({
          label: t.label,
          color: t.color,
          title: t.definition,
        }))}
      />

      {/* §1 HIGHLIGHTS */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.highlights} theme={THEME}>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <ReportChartPanel title="Q1 2026: Incidents by Type">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={q1IncidentsByType} margin={{ top: 8, right: 8, left: -8, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                  <XAxis dataKey="type" stroke="var(--text-subtle)" fontSize={10} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="var(--text-subtle)" fontSize={11} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar {...CHART_ANIMATION} dataKey="value" radius={[4, 4, 0, 0]}>
                    {q1IncidentsByType.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>

          <ReportChartPanel title="Q4 2025 vs Q1 2026">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={securityAnnualComparison} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
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
              +{SECURITY_KPIS.yoyChangePercent}% vs prior period · {SECURITY_KPIS.criticalCount} critical
            </p>
          </ReportChartPanel>
        </div>
      </ReportStorySection>

      {/* §2 HOTSPOTS */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.hotspots} theme={THEME} note={SECURITY_NOTES.iedDetection}>
        <ReportChartPanel title="Top Locations — Stacked by Threat Type">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotspotData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis type="category" dataKey="location" stroke="var(--text-subtle)" fontSize={11} width={120} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                {STACK_KEYS.map((k) => (
                  <Bar {...CHART_ANIMATION} key={k} dataKey={k} name={STACK_LABELS[k]} stackId="a" fill={STACK_COLORS[k]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §3 TOP 10 (annual) */}
      <ReportStorySection
          narrative={SECURITY_NARRATIVES.top10Hotspots}
          theme={THEME}
          note={SECURITY_NOTES.amisomDrawdown}
        >
          <ReportChartPanel title="2025 Top 10 Security Hotspots">
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

      {/* §4 THREAT TYPE BREAKDOWN */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.threatBreakdown} theme={THEME}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {threatTypeMiniCharts.map((chart) => (
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

      {/* §5 THREAT PROFILE */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.threatProfile} theme={THEME}>
        <ReportChartPanel title="Q4 vs Q1 Threat Mix (%)">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profileData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                <XAxis dataKey="quarter" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {STACK_KEYS.map((k) => (
                  <Bar {...CHART_ANIMATION} key={k} dataKey={k} name={STACK_LABELS[k]} stackId="p" fill={STACK_COLORS[k]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §6 THREAT MIX DONUT */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.threatMix} theme={THEME}>
          <ReportChartPanel title={`Category Share — ${SECURITY_KPIS.totalIncidents2025} Total Incidents`}>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie {...CHART_ANIMATION}
                      data={securityMix2025}
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {securityMix2025.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-kpi">{SECURITY_KPIS.totalIncidents2025}</span>
                  <span className="text-xs text-text-subtle uppercase">total</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full">
                {securityMix2025.map((item) => (
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

      {/* §7 IED CORRIDOR */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.iedCorridor} theme={THEME} note={SECURITY_NOTES.iedDetection}>
        <ReportChartPanel title="Afgooye Corridor — IED Discoveries & Detonations">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={iedCorridorWeekly} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                <XAxis dataKey="week" stroke="var(--text-subtle)" fontSize={10} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line {...CHART_ANIMATION} type="monotone" dataKey="discoveries" name="Discoveries" stroke={THEME.accent} strokeWidth={2.5} dot />
                <Line {...CHART_ANIMATION} type="monotone" dataKey="detonations" name="Detonations" stroke="var(--muted-foreground)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §8 KIDNAPPING WATCH */}
      <ReportStorySection
        narrative={SECURITY_NARRATIVES.kidnappingWatch}
        theme={THEME}
        note={SECURITY_NOTES.kidnappingIntel}
      >
        <ReportChartPanel title="Kidnapping Incidents by Region — 2025">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kidnappingByRegion} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                <XAxis dataKey="region" stroke="var(--text-subtle)" fontSize={10} angle={-15} textAnchor="end" height={48} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar {...CHART_ANIMATION} dataKey="incidents" radius={[4, 4, 0, 0]}>
                  {kidnappingByRegion.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §9 ACTORS */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.actors} theme={THEME}>
        <ReportChartPanel title="Actors & Attribution">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={securityActors} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar {...CHART_ANIMATION} dataKey="count" fill={THEME.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §10 ESCALATION */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.escalation} theme={THEME}>
        <ReportChartPanel title="6-Month Incident Trend">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={securityTrendMonthly} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis yAxisId="left" stroke={THEME.accent} fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 25]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area {...CHART_ANIMATION} yAxisId="left" type="monotone" dataKey="incidents" name="Total incidents" fill="var(--destructive-subtle)" stroke={THEME.accent} strokeWidth={2} />
                <Line {...CHART_ANIMATION} yAxisId="right" type="monotone" dataKey="criticalPct" name="Critical share (%)" stroke="var(--muted-foreground)" strokeWidth={2.5} dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Critical incidents now represent {SECURITY_KPIS.criticalSharePercent}% of the total
          </p>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §11 GEOGRAPHIC */}
      <ReportStorySection narrative={SECURITY_NARRATIVES.geographic} theme={THEME}>
        <ReportChartPanel>
          <ReportRiskMap
            locations={securityMapLocations}
            theme={THEME}
            valueLabel="incidents"
            legend={[
              { label: 'Critical (6+)', color: 'var(--destructive-text)' },
              { label: 'High (4–5)', color: THEME.accent },
              { label: 'Moderate (<4)', color: 'var(--warning)' },
            ]}
          />
        </ReportChartPanel>
      </ReportStorySection>
    </ReportShell>
  );
}
