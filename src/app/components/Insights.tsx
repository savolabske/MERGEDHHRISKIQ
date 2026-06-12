export function Insights() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-sidebar-border px-4 sm:px-8 py-6 pt-6">
        <h2 className="text-page-title mb-1">Insights</h2>
        <p className="text-sm sm:text-sm text-muted-foreground">AI-generated insights and trend analysis across all data sources</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-[1200px]">
          {/* Insight Cards */}
          <div className="grid gap-4">
            {/* Insight 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-info transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warning-subtle rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌾</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-destructive text-white text-xs font-semibold rounded uppercase tracking-wide">Critical</span>
                    <span className="text-xs text-text-subtle">2 hours ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Food security deteriorating in Lower Shabelle</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    IPC analysis shows 23% increase in Phase 3+ households compared to last quarter. Flooding has disrupted agricultural cycles and supply routes.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Sources:</span>
                    <span>FSNAU · WFP · OCHA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-info transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sidebar-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-warning-strong text-white text-xs font-semibold rounded uppercase tracking-wide">High</span>
                    <span className="text-xs text-text-subtle">5 hours ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Cholera cases rising across three regions</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    764 new suspected cases reported this week in Banadir, Bay, and Lower Shabelle. WHO warns of potential outbreak without immediate intervention.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Sources:</span>
                    <span>WHO · Ministry of Health · UNICEF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-info transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-subtle rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚶</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-info text-white text-xs font-semibold rounded uppercase tracking-wide">Medium</span>
                    <span className="text-xs text-text-subtle">1 day ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">IDP movement patterns shifting toward urban centers</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    15,000 newly displaced individuals moved to Mogadishu and Baidoa this month, increasing pressure on already strained urban services.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Sources:</span>
                    <span>IOM · UNHCR · CCCM Cluster</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 4 */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-info transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-info-subtle rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💧</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-info text-white text-xs font-semibold rounded uppercase tracking-wide">Medium</span>
                    <span className="text-xs text-text-subtle">2 days ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Water access improving in drought-affected areas</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Recent WASH interventions have restored water access for 42,000 people in Galmudug. However, sustainability concerns remain due to infrastructure limitations.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Sources:</span>
                    <span>WASH Cluster · UNICEF · Concern Worldwide</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight 5 */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-info transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-chart-4/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-warning text-white text-xs font-semibold rounded uppercase tracking-wide">Low</span>
                    <span className="text-xs text-text-subtle">3 days ago</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Seasonal flooding forecasts predict above-average Gu rains</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Early warning systems indicate 65% probability of above-average rainfall during Gu season. Riverine areas should prepare for potential flooding events.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Sources:</span>
                    <span>FEWS NET · FAO-SWALIM · ICPAC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
