import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, PieChart, Pie, LineChart, Line, ComposedChart, Area,
} from 'recharts';
import {
  ReportShell, ReportBackButton, ReportHero, ReportStorySection, ReportChartPanel,
  ReportLegendPills, ReportRiskMap,
  REPORT_THEMES, TOOLTIP_STYLE, CHART_ANIMATION,
} from './reportShared';
import {
  CLIMATE_NARRATIVES, CLIMATE_NOTES, CLIMATE_HAZARD_TYPES, CLIMATE_KPIS,
  hazardMix2025, ipcByDistrict, floodAffected, choleraWeekly, choleraCampMini,
  guForecast, hazardMonthly, climateMapLocations, hazardHotspotsQ1,
  top10ClimateHotspots, hazardTypeMiniCharts, hazardQ4vsQ1, livestockMortalityTrend,
  floodInfrastructure, anticipatoryActions, displacementTrend, CLIMATE_REPORT_CREATED,
} from './climateReportData';

const THEME = REPORT_THEMES.climate;
const STACK_KEYS = ['flood', 'drought', 'disease'] as const;
const STACK_LABELS: Record<string, string> = {
  flood: 'Flooding', drought: 'Drought', disease: 'Disease',
};
const STACK_COLORS: Record<string, string> = {
  flood: 'var(--primary)', drought: 'var(--warning-strong)', disease: 'var(--destructive-text)',
};

export function ClimateHazardsReport({ onBack }: { onBack: () => void }) {
  const trendData = hazardMonthly.slice(-3);
  const displacementData = displacementTrend.slice(-3);

  const hotspotData = [...hazardHotspotsQ1].reverse();
  const top10Data = [...top10ClimateHotspots].reverse();

  return (
    <ReportShell>
      <ReportBackButton onBack={onBack} />
      <ReportHero
        title="Climate Hazards"
        createdAt={CLIMATE_REPORT_CREATED}
        theme={THEME}
      />
      <ReportLegendPills
        items={CLIMATE_HAZARD_TYPES.map((t) => ({
          label: t.label,
          color: t.color,
          title: t.definition,
        }))}
      />

      {/* §1 HIGHLIGHTS */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.highlights} theme={THEME}>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <ReportChartPanel title="Q1 Hazard Events by Month">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                  <YAxis stroke="var(--text-subtle)" fontSize={11} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar {...CHART_ANIMATION} dataKey="flood" name="Flooding" fill="var(--primary)" stackId="h" />
                  <Bar {...CHART_ANIMATION} dataKey="drought" name="Drought" fill="var(--warning-strong)" stackId="h" />
                  <Bar {...CHART_ANIMATION} dataKey="disease" name="Disease" fill="var(--destructive-text)" stackId="h" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>

          <ReportChartPanel title="Q4 2025 vs Q1 2026">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hazardQ4vsQ1} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
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
              Flooding events +40% QoQ · {CLIMATE_KPIS.newlyDisplaced.toLocaleString()} newly displaced in Q1
            </p>
          </ReportChartPanel>
        </div>
      </ReportStorySection>

      {/* §2 HAZARD MIX */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.hazardMix} theme={THEME}>
        <ReportChartPanel title={`Q1 Hazard Mix — ${CLIMATE_KPIS.totalHazardEvents2025} Events (2025)`}>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie {...CHART_ANIMATION}
                    data={hazardMix2025}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {hazardMix2025.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground-emphasis">{CLIMATE_KPIS.totalHazardEvents2025}</span>
                <span className="text-xs text-text-subtle uppercase">events</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full">
              {hazardMix2025.map((item) => (
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
      <ReportStorySection narrative={CLIMATE_NARRATIVES.hazardHotspots} theme={THEME} note={CLIMATE_NOTES.choleraLinkage}>
        <ReportChartPanel title="Q1 Hotspots — Stacked by Hazard Type">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotspotData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis type="category" dataKey="location" stroke="var(--text-subtle)" fontSize={11} width={120} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                {STACK_KEYS.map((k) => (
                  <Bar {...CHART_ANIMATION} key={k} dataKey={k} name={STACK_LABELS[k]} stackId="h" fill={STACK_COLORS[k]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §4 TOP 10 */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.top10Hotspots} theme={THEME}>
          <ReportChartPanel title="2025 Top 10 Climate Hazard Hotspots">
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

      {/* §5 HAZARD BREAKDOWN */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.hazardBreakdown} theme={THEME}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {hazardTypeMiniCharts.map((chart) => (
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

      {/* §6 DISPLACEMENT TREND */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.seasonalComparison} theme={THEME}>
        <ReportChartPanel title="Displacement Trend — Monthly">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displacementData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis yAxisId="left" stroke="var(--primary)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" stroke={THEME.accent} fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area {...CHART_ANIMATION} yAxisId="left" type="monotone" dataKey="displaced" name="Newly displaced" fill="var(--sidebar-accent)" stroke="var(--primary)" strokeWidth={2} />
                <Line {...CHART_ANIMATION} yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative" stroke={THEME.accent} strokeWidth={2.5} dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §7 DROUGHT */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.drought} theme={THEME} note={CLIMATE_NOTES.ipc}>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <ReportChartPanel title="IPC Phase by District">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...ipcByDistrict].reverse()} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} />
                  <YAxis type="category" dataKey="district" stroke="var(--text-subtle)" fontSize={10} width={110} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: number, _n, p) => [`Phase ${(p.payload as { phase: number }).phase}`, 'IPC']}
                  />
                  <Bar {...CHART_ANIMATION} dataKey="value" fill="var(--warning-strong)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>
          <ReportChartPanel title="Livestock Mortality — Bakool (%)">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={livestockMortalityTrend} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                  <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                  <YAxis stroke="var(--warning-strong)" fontSize={11} domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Mortality']} />
                  <Line {...CHART_ANIMATION} type="monotone" dataKey="mortality" name="Mortality rate" stroke="var(--warning-strong)" strokeWidth={2.5} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Current: {CLIMATE_KPIS.livestockMortalityBakool}% mortality in pastoral areas
            </p>
          </ReportChartPanel>
        </div>
      </ReportStorySection>

      {/* §8 FLOODING */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.flooding} theme={THEME}>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <ReportChartPanel title="Flood-Affected Population by District">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={floodAffected} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                  <XAxis dataKey="district" stroke="var(--text-subtle)" fontSize={10} angle={-15} textAnchor="end" height={48} />
                  <YAxis stroke="var(--text-subtle)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar {...CHART_ANIMATION} dataKey="population" name="Affected" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>
          <ReportChartPanel title="Infrastructure Impact">
            <div className="grid grid-cols-2 gap-3">
              {floodInfrastructure.map((item) => (
                <div key={item.item} className="rounded-xl bg-muted border border-border p-4">
                  <p className="text-xl font-bold text-foreground-emphasis">{item.count}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{item.item}</p>
                </div>
              ))}
            </div>
          </ReportChartPanel>
        </div>
      </ReportStorySection>

      {/* §9 CHOLERA */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.cholera} theme={THEME} note={CLIMATE_NOTES.choleraLinkage}>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <ReportChartPanel title="Cholera Cases — Weekly Trend">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={choleraWeekly} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                  <XAxis dataKey="week" stroke="var(--text-subtle)" fontSize={11} />
                  <YAxis stroke="var(--text-subtle)" fontSize={11} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line {...CHART_ANIMATION} type="monotone" dataKey="baidoa" name="Baidoa" stroke={THEME.accent} strokeWidth={2.5} dot />
                  <Line {...CHART_ANIMATION} type="monotone" dataKey="other" name="Other sites" stroke="var(--text-subtle)" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>
          <ReportChartPanel title="Top Affected Camps">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={choleraCampMini} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="camp" stroke="var(--text-subtle)" fontSize={11} width={90} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar {...CHART_ANIMATION} dataKey="value" fill="var(--destructive-text)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartPanel>
        </div>
      </ReportStorySection>

      {/* §10 FORECAST */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.forecast} theme={THEME} note={CLIMATE_NOTES.forecast}>
        <ReportChartPanel title="Gu Season Rainfall Probability">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={guForecast} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={11} />
                <YAxis stroke="var(--text-subtle)" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Probability']} />
                <Bar {...CHART_ANIMATION} dataKey="probability" fill={THEME.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §11 ANTICIPATORY */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.anticipatory} theme={THEME}>
        <ReportChartPanel title="Anticipatory Action Status">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {anticipatoryActions.map((item) => (
              <div key={item.action} className="rounded-xl bg-success-subtle border border-success-subtle p-4">
                <p className="text-xl font-bold text-foreground-emphasis">
                  {item.value >= 1000 ? `${(item.value / 1000).toFixed(0)}K` : item.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{item.action}</p>
              </div>
            ))}
          </div>
        </ReportChartPanel>
      </ReportStorySection>

      {/* §12 GEOGRAPHIC */}
      <ReportStorySection narrative={CLIMATE_NARRATIVES.geographic} theme={THEME}>
        <ReportChartPanel>
          <ReportRiskMap
            locations={climateMapLocations}
            theme={THEME}
            valueLabel="hazard score"
            legend={[
              { label: 'Critical', color: 'var(--destructive-text)' },
              { label: 'High', color: THEME.accent },
              { label: 'Moderate', color: 'var(--warning)' },
            ]}
          />
        </ReportChartPanel>
      </ReportStorySection>
    </ReportShell>
  );
}
