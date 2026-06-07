import { PageScrollShell } from './PageScrollShell';

export function AdminDashboard() {
  const groupUsage = [
    { name: "UNICEF", value: "63% (24/38)", width: "63%", color: "var(--chart-2)" },
    { name: "WFP", value: "81% (26/32)", width: "81%", color: "var(--success)" },
    { name: "UNHCR", value: "72% (21/29)", width: "72%", color: "#818cf8" },
    { name: "IOM", value: "45% (10/22)", width: "45%", color: "var(--warning-strong)" },
    { name: "UNDP", value: "42% (8/19)", width: "42%", color: "#65a30d" },
  ];

  const platformInsights = [
    {
      color: "var(--success)",
      text: "Search activity is up 34% this week, likely tied to emerging field monitoring needs.",
    },
    {
      color: "var(--chart-2)",
      text: "WFP and UNHCR account for 58% of all searches, while making up 28% of users.",
    },
    {
      color: "var(--warning)",
      text: "31 users have not logged in for more than 30 days, mostly from smaller organizations.",
    },
    {
      color: "var(--chart-3)",
      text: "3 new organizations requested access this month that were not previously on platform.",
    },
    {
      color: "#0ea5e9",
      text: "Document opens from search results increased by 22%, suggesting stronger relevance and faster discovery.",
    },
  ];

  return (
    <PageScrollShell>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              Admin Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitor platform usage, system health, and key signals across Humanity Hub.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">Total users</p>
                <p className="text-3xl leading-none font-semibold text-foreground-emphasis mt-2">214</p>
                <p className="text-sm text-success font-medium mt-2">+12 this month</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">Pending approvals</p>
                <p className="text-3xl leading-none font-semibold text-foreground-emphasis mt-2">7</p>
                <p className="text-sm text-warning-strong font-medium mt-2">Oldest: 6 days ago</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">Active this week</p>
                <p className="text-3xl leading-none font-semibold text-foreground-emphasis mt-2">89</p>
                <p className="text-sm text-muted-foreground font-medium mt-2">42% of all users</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">Searches today</p>
                <p className="text-3xl leading-none font-semibold text-foreground-emphasis mt-2">341</p>
                <p className="text-sm text-success font-medium mt-2">+18% vs yesterday</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground-emphasis">Usage by user groups</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Active this week vs total registered</p>
                  </div>
                  <div className="flex items-center bg-muted border border-border rounded-lg p-0.5">
                    <button className="px-3 py-1 text-xs text-muted-foreground rounded-md">Today</button>
                    <button className="px-3 py-1 text-xs text-primary bg-card border border-border rounded-md font-medium">
                      This week
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {groupUsage.map((group) => (
                    <div key={group.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-semibold text-foreground">{group.name}</span>
                        <span className="text-secondary-foreground font-semibold">{group.value}</span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: group.width, backgroundColor: group.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-5 text-sm text-info font-medium hover:text-info transition-colors">
                  View more
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-foreground-emphasis">AI platform Insights</h3>
                <div className="mt-3 divide-y divide-border">
                  {platformInsights.map((insight) => (
                    <div key={insight.text} className="flex items-start gap-3 py-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: insight.color }}
                      />
                      <p className="text-sm leading-[1.35] text-foreground">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-foreground-emphasis">System health</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground">Search service</p>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-success-subtle text-success-text">
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground">Data indexing</p>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-success-subtle text-success-text">
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground">Uploads pipeline</p>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-warning-subtle text-warning-text">
                      Degraded
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground">Auth and access</p>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-success-subtle text-success-text">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-foreground-emphasis">Search activity today</h3>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-border rounded-xl py-3 px-4 text-center">
                    <p className="text-sm text-muted-foreground">Total searches</p>
                    <p className="text-4xl leading-none font-semibold text-foreground-emphasis mt-1">341</p>
                  </div>
                  <div className="border border-border rounded-xl py-3 px-4 text-center">
                    <p className="text-sm text-muted-foreground">Avg per user</p>
                    <p className="text-4xl leading-none font-semibold text-foreground-emphasis mt-1">3.8</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground-emphasis mb-2">Top themes</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full border border-border bg-muted text-xs text-secondary-foreground">
                      food security
                    </span>
                    <span className="px-3 py-1 rounded-full border border-border bg-muted text-xs text-secondary-foreground">
                      displacement
                    </span>
                    <span className="px-3 py-1 rounded-full border border-border bg-muted text-xs text-secondary-foreground">
                      Mogadishu
                    </span>
                    <span className="px-3 py-1 rounded-full border border-border bg-muted text-xs text-secondary-foreground">
                      WASH
                    </span>
                    <span className="px-3 py-1 rounded-full border border-border bg-muted text-xs text-secondary-foreground">
                      protection
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground-emphasis">Top resources being accessed</h3>

              <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-x-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 py-2 border-b border-sidebar-border">
                    <span className="w-5 text-sm font-semibold text-text-subtle">1</span>
                    <span className="w-8 h-8 rounded-lg bg-destructive-subtle text-destructive-text text-xs font-semibold flex items-center justify-center">PDF</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground-emphasis truncate">Somalia Humanitarian Response Plan 2026</p>
                      <p className="text-xs text-muted-foreground">uploaded Mar 2026</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary-foreground whitespace-nowrap">218 views</span>
                  </div>

                  <div className="flex items-center gap-3 py-2 border-b border-sidebar-border">
                    <span className="w-5 text-sm font-semibold text-text-subtle">3</span>
                    <span className="w-8 h-8 rounded-lg bg-success-subtle text-success-text text-xs font-semibold flex items-center justify-center">XLS</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground-emphasis truncate">IDP Population Tracking Dataset - Banadir</p>
                      <p className="text-xs text-muted-foreground">uploaded Mar 2026</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary-foreground whitespace-nowrap">139 views</span>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <span className="w-5 text-sm font-semibold text-text-subtle">5</span>
                    <span className="w-8 h-8 rounded-lg bg-destructive-subtle text-destructive-text text-xs font-semibold flex items-center justify-center">PDF</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground-emphasis truncate">Health Cluster Bulletin - March 2026</p>
                      <p className="text-xs text-muted-foreground">uploaded Mar 2026</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary-foreground whitespace-nowrap">98 views</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 py-2 border-b border-sidebar-border">
                    <span className="w-5 text-sm font-semibold text-text-subtle">2</span>
                    <span className="w-8 h-8 rounded-lg bg-destructive-subtle text-destructive-text text-xs font-semibold flex items-center justify-center">PDF</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground-emphasis truncate">Food Security & Nutrition Assessment - Q1 2026</p>
                      <p className="text-xs text-muted-foreground">uploaded Feb 2026</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary-foreground whitespace-nowrap">174 views</span>
                  </div>

                  <div className="flex items-center gap-3 py-2 border-b border-sidebar-border">
                    <span className="w-5 text-sm font-semibold text-text-subtle">4</span>
                    <span className="w-8 h-8 rounded-lg bg-sidebar-accent text-primary text-xs font-semibold flex items-center justify-center">DOC</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground-emphasis truncate">Protection Risk Analysis - South Somalia</p>
                      <p className="text-xs text-muted-foreground">uploaded Jan 2026</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary-foreground whitespace-nowrap">112 views</span>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <span className="w-5 text-sm font-semibold text-text-subtle">6</span>
                    <span className="w-8 h-8 rounded-lg bg-success-subtle text-success-text text-xs font-semibold flex items-center justify-center">XLS</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground-emphasis truncate">Funding Tracker - Somalia 2026</p>
                      <p className="text-xs text-muted-foreground">uploaded Feb 2026</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary-foreground whitespace-nowrap">87 views</span>
                  </div>
                </div>
              </div>
            </div>
    </PageScrollShell>
  );
}
