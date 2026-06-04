import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Area,
  Legend,
} from 'recharts';
import {
  ADT_CATEGORIES,
  ADT_CATEGORY_CONFIG,
  ADT_ACCENT,
} from './adtCategoryColors';
import {
  ADT_KPIS,
  ADT_RMU_NOTES,
  q4_2025_byCategory,
  annualComparisonByCategory,
  top10Hotspots,
  perpetrators,
  adProfileComparison,
  mix2025,
  gatekeeperTrackingMonthly,
  gkIntensityQuarterly,
  gkResidualComparison,
  adtMapLocations,
  ADT_REPORT_CREATED,
} from './adtReportData';
import {
  ADT_SECTION_NARRATIVES,
  q4HotspotsLocations,
  q4CategoryMiniCharts,
} from './adtSectionNarratives';
import { AdtStorySection, AdtChartPanel } from './AdtStorySection';
import { ScrollReveal, REPORT_FONT_STYLE, CHART_ANIMATION, useInViewOnce } from './reportMotion';
import { motion } from 'motion/react';

interface AidDiversionReportProps {
  onBack: () => void;
}

const STACK_KEYS = [
  'economicExtortion',
  'improperInfluence',
  'preventionOfDelivery',
  'theftDamage',
  'unethicalBehaviour',
] as const;

function AdtRiskMap({
  locations,
}: {
  locations: Array<{ name: string; lat: number; lng: number; allegations: number; severity: string }>;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { ref: viewRef, inView } = useInViewOnce(0.1, '0px 0px -10% 0px');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'var(--destructive-text)';
      case 'high':
        return 'var(--primary)';
      default:
        return 'var(--warning)';
    }
  };

  useEffect(() => {
    if (!inView || !mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current).setView([2.5, 45.5], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      locations.forEach((loc) => {
        const circle = L.circle([loc.lat, loc.lng], {
          color: getSeverityColor(loc.severity),
          fillColor: getSeverityColor(loc.severity),
          fillOpacity: 0.35,
          radius: loc.allegations * 800,
          weight: 2,
        }).addTo(map);

        circle.bindPopup(`
          <div style="padding: 8px;">
            <p style="font-weight: bold; font-size: 13px; color: #1e293b; margin: 0 0 4px 0;">${loc.name}</p>
            <p style="font-size: 11px; color: #64748b; margin: 0;">${loc.allegations} allegations</p>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, inView]);

  return (
    <div ref={viewRef}>
      {!inView ? (
        <div className="h-[380px] rounded-xl overflow-hidden border border-border bg-muted animate-pulse" aria-hidden />
      ) : (
        <motion.div
          className="rounded-xl overflow-hidden border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div ref={mapRef} className="h-[380px]" />
        </motion.div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="text-xs font-bold text-text-subtle uppercase tracking-wide">Severity:</span>
        {[
          { label: 'Critical (30+)', color: 'var(--destructive-text)' },
          { label: 'High (20–29)', color: 'var(--primary)' },
          { label: 'Moderate (<20)', color: 'var(--warning)' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
};

export function AidDiversionReport({ onBack }: AidDiversionReportProps) {
  const q4ChartData = q4_2025_byCategory.map((d) => ({
    shortName: ADT_CATEGORY_CONFIG[d.category].shortLabel,
    value: d.value,
    fill: ADT_CATEGORY_CONFIG[d.category].color,
  }));

  const annualChartData = annualComparisonByCategory.map((d) => ({
    name: ADT_CATEGORY_CONFIG[d.category].shortLabel.split(' ')[0],
    y2024: d.y2024,
    y2025: d.y2025,
  }));

  const q4HotspotChartData = [...q4HotspotsLocations].reverse();

  const top10ChartData = [...top10Hotspots].reverse().map((h) => {
    const entry: Record<string, string | number> = { location: h.location };
    ADT_CATEGORIES.forEach((cat) => {
      entry[cat] = h[cat];
    });
    return entry;
  });

  const profileCategories = ADT_CATEGORIES.filter((c) => c !== 'finance');
  const q3Profile = adProfileComparison.q3;
  const q4Profile = adProfileComparison.q4;

  const profilePercentData = [
    {
      quarter: 'Q3 2025',
      ...Object.fromEntries(
        profileCategories.map((c) => {
          const val = (q3Profile as Record<string, number>)[c] ?? 0;
          return [c, q3Profile.total > 0 ? val / q3Profile.total : 0];
        })
      ),
    },
    {
      quarter: 'Q4 2025',
      ...Object.fromEntries(
        profileCategories.map((c) => {
          const val = (q4Profile as Record<string, number>)[c] ?? 0;
          return [c, q4Profile.total > 0 ? val / q4Profile.total : 0];
        })
      ),
    },
  ];

  const mixDonutData = mix2025.map((m) => ({
    name: ADT_CATEGORY_CONFIG[m.category].shortLabel,
    value: m.value,
    color: ADT_CATEGORY_CONFIG[m.category].color,
  }));

  const trackingData = gatekeeperTrackingMonthly.filter((d) => d.month.includes('-25'));

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden" style={REPORT_FONT_STYLE}>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6 pb-10">
          <div className="max-w-[1400px] mx-auto space-y-14">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to all reports</span>
            </button>

            {/* Cover hero */}
            <ScrollReveal y={16}>
              <div
                className="rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative"
                style={{ background: `linear-gradient(135deg, #2463eb 0%, #1e3a8a 55%, #1e293b 100%)` }}
              >
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
                    Report
                  </p>
                  <h1
                    className="text-3xl sm:text-4xl font-semibold leading-tight mb-2 tracking-tight"
                    style={REPORT_FONT_STYLE}
                  >
                    Aid Diversion Tracker
                  </h1>
                  <p className="text-sm text-white/80">Last sync {ADT_REPORT_CREATED}</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Category reference strip */}
            <ScrollReveal y={12} delay={0.05}>
            <div className="flex flex-wrap gap-2">
              {ADT_CATEGORIES.filter((c) => c !== 'finance').map((cat) => (
                <span
                  key={cat}
                  title={ADT_CATEGORY_CONFIG[cat].definition}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-secondary-foreground bg-card border border-border"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: ADT_CATEGORY_CONFIG[cat].color }}
                  />
                  {ADT_CATEGORY_CONFIG[cat].shortLabel}
                </span>
              ))}
            </div>
            </ScrollReveal>

            {/* §1 HIGHLIGHTS */}
            <AdtStorySection narrative={ADT_SECTION_NARRATIVES.highlights}>
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                <AdtChartPanel title="Q4 2025: Aid Diversion Allegations">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={q4ChartData} margin={{ top: 8, right: 8, left: -8, bottom: 48 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                        <XAxis
                          dataKey="shortName"
                          stroke="var(--text-subtle)"
                          fontSize={10}
                          angle={-30}
                          textAnchor="end"
                          height={56}
                          interval={0}
                        />
                        <YAxis stroke="var(--text-subtle)" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar {...CHART_ANIMATION} dataKey="value" radius={[4, 4, 0, 0]}>
                          {q4ChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </AdtChartPanel>

                <AdtChartPanel title="2024 vs 2025 — Annual Comparison">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={annualChartData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={11} />
                          <YAxis stroke="var(--text-subtle)" fontSize={11} />
                          <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(value: number, name: string) => [
                              value,
                              name === 'y2024' ? '2024' : '2025',
                            ]}
                          />
                          <Legend
                            formatter={(value) => (value === 'y2024' ? '2024' : '2025')}
                            wrapperStyle={{ fontSize: 12 }}
                          />
                          <Bar {...CHART_ANIMATION} dataKey="y2024" fill="var(--text-subtle)" radius={[4, 4, 0, 0]} />
                          <Bar {...CHART_ANIMATION} dataKey="y2025" fill={ADT_ACCENT} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AdtChartPanel>
              </div>
              <div className="px-5 pb-4">
                <p className="text-xs text-muted-foreground italic">{ADT_RMU_NOTES.categoryChange}</p>
              </div>
            </AdtStorySection>

            {/* §2 Q4 HOTSPOTS */}
            <AdtStorySection
              narrative={ADT_SECTION_NARRATIVES.q4Hotspots}
              note={ADT_RMU_NOTES.garasbaley}
            >
              <AdtChartPanel title="Q4 2025 Hotspots by Category">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={q4HotspotChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} />
                      <YAxis type="category" dataKey="location" stroke="var(--text-subtle)" fontSize={11} width={130} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                      {STACK_KEYS.map((key) => (
                        <Bar
                          {...CHART_ANIMATION}
                          key={key}
                          dataKey={key}
                          name={ADT_CATEGORY_CONFIG[key].shortLabel}
                          stackId="q4"
                          fill={ADT_CATEGORY_CONFIG[key].color}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AdtChartPanel>
            </AdtStorySection>

            {/* §3 TOP 10 (annual) */}
            <AdtStorySection
                narrative={ADT_SECTION_NARRATIVES.top10Hotspots}
                note={ADT_RMU_NOTES.garasbaley}
              >
                <AdtChartPanel title="2025 Top 10 Aid Diversion Hotspots">
                  <div className="h-[440px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={top10ChartData}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-subtle)" fontSize={11} />
                        <YAxis type="category" dataKey="location" stroke="var(--text-subtle)" fontSize={11} width={120} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                        {ADT_CATEGORIES.map((cat) => (
                          <Bar
                            {...CHART_ANIMATION}
                            key={cat}
                            dataKey={cat}
                            name={ADT_CATEGORY_CONFIG[cat].shortLabel}
                            stackId="top10"
                            fill={ADT_CATEGORY_CONFIG[cat].color}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </AdtChartPanel>
              </AdtStorySection>

            {/* §4 Q4 CATEGORY BREAKDOWN */}
            <AdtStorySection narrative={ADT_SECTION_NARRATIVES.categoryBreakdown}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
                {q4CategoryMiniCharts.map((chart) => (
                  <AdtChartPanel key={chart.title} title={chart.title}>
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chart.data}
                          layout="vertical"
                          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="location"
                            stroke="var(--text-subtle)"
                            fontSize={9}
                            width={100}
                            tickLine={false}
                          />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar
                            dataKey="value"
                            fill={ADT_CATEGORY_CONFIG[chart.category].color}
                            radius={[0, 3, 3, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AdtChartPanel>
                ))}
              </div>
            </AdtStorySection>

            {/* §5 PERPETRATORS */}
            <AdtStorySection
                narrative={ADT_SECTION_NARRATIVES.perpetrators}
                note={ADT_RMU_NOTES.gatekeeper}
              >
                <AdtChartPanel title="Perpetrators of AD Allegations">
                  <div className="h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={perpetrators} margin={{ top: 8, right: 8, left: -8, bottom: 64 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-subtle)"
                          fontSize={9}
                          angle={-40}
                          textAnchor="end"
                          height={72}
                          interval={0}
                        />
                        <YAxis stroke="var(--text-subtle)" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar {...CHART_ANIMATION} dataKey="count" fill="#1e6b8a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </AdtChartPanel>
              </AdtStorySection>

            {/* §6 Q3 VS Q4 PROFILE */}
            <AdtStorySection narrative={ADT_SECTION_NARRATIVES.adProfile}>
                <AdtChartPanel title="Q3 vs Q4 Aid Diversion Profile Comparison">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profilePercentData} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                        <XAxis dataKey="quarter" stroke="var(--text-subtle)" fontSize={11} />
                        <YAxis stroke="var(--text-subtle)" fontSize={11} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Share']}
                        />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {profileCategories.map((cat) => (
                          <Bar
                            {...CHART_ANIMATION}
                            key={cat}
                            dataKey={cat}
                            name={ADT_CATEGORY_CONFIG[cat].shortLabel}
                            stackId="profile"
                            fill={ADT_CATEGORY_CONFIG[cat].color}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-6 mt-3 px-1 text-xs text-muted-foreground">
                    <span>Q3 total: {adProfileComparison.q3.total}</span>
                    <span>Q4 total: {adProfileComparison.q4.total}*</span>
                  </div>
                </AdtChartPanel>
              </AdtStorySection>

            {/* §7 AID DIVERSION IN 2025 */}
            <AdtStorySection narrative={ADT_SECTION_NARRATIVES.mix2025}>
                <AdtChartPanel title="Category Share — 962 Total Allegations">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            {...CHART_ANIMATION}
                            data={mixDonutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={54}
                            outerRadius={80}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {mixDonutData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-foreground-emphasis">{ADT_KPIS.totalAllegations2025}</span>
                        <span className="text-xs text-text-subtle uppercase">total</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full">
                      {mixDonutData.map((item) => (
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
                </AdtChartPanel>
              </AdtStorySection>

            {/* §8 GATEKEEPER TRACKING */}
            <AdtStorySection narrative={ADT_SECTION_NARRATIVES.gatekeeperTracking}>
              <AdtChartPanel title="Gatekeeper AD & Case Assistance — II+EE vs MPCA Reach">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trackingData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" />
                      <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={10} interval="preserveStartEnd" />
                      <YAxis
                        yAxisId="left"
                        stroke="var(--primary)"
                        fontSize={11}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      />
                      <YAxis yAxisId="right" orientation="right" stroke={ADT_ACCENT} fontSize={11} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area
                        {...CHART_ANIMATION}
                        yAxisId="left"
                        type="monotone"
                        dataKey="mpcaReach"
                        name="MPCA People Reached"
                        fill="var(--sidebar-accent)"
                        stroke="var(--primary)"
                        strokeWidth={2}
                      />
                      <Line
                        {...CHART_ANIMATION}
                        yAxisId="right"
                        type="monotone"
                        dataKey="iiEeAllegations"
                        name="II + EE Allegations"
                        stroke={ADT_ACCENT}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {[
                    { year: '2024', ...gkResidualComparison.y2024 },
                    { year: '2025', ...gkResidualComparison.y2025 },
                  ].map((row) => (
                    <div key={row.year} className="rounded-xl bg-muted border border-border p-4">
                      <p className="text-xs font-bold text-text-subtle uppercase mb-1">{row.year} Residual</p>
                      <p className="text-sm text-muted-foreground">
                        Actual <span className="font-bold text-foreground-emphasis">{row.actual}</span>
                        {' · '}
                        Predicted <span className="font-bold text-foreground-emphasis">{row.predicted}</span>
                      </p>
                      <p className={`text-sm font-semibold mt-1 ${row.residual > 0 ? 'text-destructive-text' : 'text-success'}`}>
                        {row.residual > 0 ? '+' : ''}{row.residual} vs expected
                      </p>
                    </div>
                  ))}
                </div>
              </AdtChartPanel>
            </AdtStorySection>

            {/* §9 INTENSITY */}
            <AdtStorySection narrative={ADT_SECTION_NARRATIVES.intensity}>
                <AdtChartPanel title="Average GK AD Allegations per 10,000 MPCA People Reached">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gkIntensityQuarterly} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" vertical={false} />
                        <XAxis dataKey="quarter" stroke="var(--text-subtle)" fontSize={10} />
                        <YAxis stroke="var(--text-subtle)" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar {...CHART_ANIMATION} dataKey="intensity" name="GK AD per 10,000" fill={ADT_ACCENT} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </AdtChartPanel>
              </AdtStorySection>

            {/* §10 GEOGRAPHIC */}
            <AdtStorySection narrative={ADT_SECTION_NARRATIVES.geographic}>
              <AdtChartPanel>
                <AdtRiskMap locations={adtMapLocations} />
              </AdtChartPanel>
            </AdtStorySection>
          </div>
        </div>
      </div>
    </div>
  );
}
