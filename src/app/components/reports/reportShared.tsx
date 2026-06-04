import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Info } from 'lucide-react';
import {
  ChartScrollReveal,
  ScrollReveal,
  REPORT_FONT_STYLE,
  useInViewOnce,
} from './reportMotion';

export { CHART_ANIMATION } from './reportMotion';

export interface SectionNarrative {
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  insight: string;
  bullets?: string[];
  footnote?: string;
}

export interface ReportTheme {
  accent: string;
  accentBg: string;
  accentMuted: string;
  heroGradient: string;
  noteBorder: string;
  noteBg: string;
  noteIcon: string;
  noteText: string;
}

export const REPORT_THEMES = {
  security: {
    accent: 'var(--destructive-text)',
    accentBg: 'var(--destructive-subtle)',
    accentMuted: '#f87171',
    heroGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 55%, #1e293b 100%)',
    noteBorder: '#fca5a5',
    noteBg: 'var(--destructive-subtle)',
    noteIcon: 'var(--destructive-text)',
    noteText: '#991b1b',
  },
  aidDiversion: {
    accent: 'var(--primary)',
    accentBg: 'var(--primary-subtle)',
    accentMuted: 'var(--chart-3)',
    heroGradient: 'linear-gradient(135deg, #2463eb 0%, #1e3a8a 55%, #1e293b 100%)',
    noteBorder: '#93c5fd',
    noteBg: 'var(--primary-subtle)',
    noteIcon: 'var(--primary)',
    noteText: 'var(--primary)',
  },
  climate: {
    accent: 'var(--success)',
    accentBg: '#f0fdf4',
    accentMuted: '#34d399',
    heroGradient: 'linear-gradient(135deg, #10b981 0%, #065f46 55%, #1e293b 100%)',
    noteBorder: '#6ee7b7',
    noteBg: '#f0fdf4',
    noteIcon: 'var(--success)',
    noteText: '#065f46',
  },
  programmatic: {
    accent: 'var(--chart-3)',
    accentBg: '#faf5ff',
    accentMuted: '#a78bfa',
    heroGradient: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 55%, #1e293b 100%)',
    noteBorder: '#c4b5fd',
    noteBg: '#faf5ff',
    noteIcon: 'var(--chart-3)',
    noteText: '#5b21b6',
  },
} satisfies Record<string, ReportTheme>;

export const TOOLTIP_STYLE = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '12px',
};

function StoryBullet({ text, theme }: { text: string; theme: ReportTheme }) {
  return (
    <div className="flex gap-3 py-3 border-b border-sidebar-border last:border-0">
      <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: theme.accent }} />
      <p className="text-sm text-secondary-foreground leading-relaxed">{text}</p>
    </div>
  );
}

export function ReportStorySection({
  narrative,
  theme,
  children,
  note,
}: {
  narrative: SectionNarrative;
  theme: ReportTheme;
  children: ReactNode;
  note?: string;
}) {
  return (
    <section className="space-y-5">
      <ScrollReveal className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-0.5 w-6 rounded-full" style={{ background: theme.accent }} />
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: theme.accent }}>
            {narrative.eyebrow}
          </p>
        </div>
        <h2
          className="text-2xl sm:text-3xl font-semibold leading-[1.15] tracking-tight text-foreground-emphasis mb-3"
          style={REPORT_FONT_STYLE}
        >
          {narrative.headline}
          {narrative.headlineAccent && (
            <>
              <br />
              <span style={{ color: theme.accent }}>{narrative.headlineAccent}</span>
            </>
          )}
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">{narrative.insight}</p>
        {narrative.bullets && narrative.bullets.length > 0 && (
          <div className="mt-4 bg-card rounded-xl border border-border px-4">
            {narrative.bullets.map((bullet, i) => (
              <StoryBullet key={i} text={bullet} theme={theme} />
            ))}
          </div>
        )}
        {narrative.footnote && (
          <p className="mt-3 text-xs text-text-subtle italic">{narrative.footnote}</p>
        )}
      </ScrollReveal>
      <ScrollReveal delay={0.08} y={20}>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {children}
          {note && (
            <motion.div
              className="mx-4 sm:mx-6 mb-4 sm:mb-6 px-4 py-3 rounded-xl border"
              style={{ borderColor: theme.noteBorder, background: theme.noteBg }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex gap-2">
                <Info size={14} className="shrink-0 mt-0.5" style={{ color: theme.noteIcon }} />
                <p className="text-xs leading-relaxed" style={{ color: theme.noteText }}>
                  <span className="font-bold">Note: </span>
                  {note}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}

export function ReportChartPanel({
  title,
  children,
  className = '',
  chartMinHeight = 260,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  chartMinHeight?: number;
}) {
  return (
    <div className={className}>
      {title && (
        <div className="px-5 sm:px-6 py-3 border-b border-sidebar-border">
          <p className="text-xs font-bold text-text-subtle uppercase tracking-wide">{title}</p>
        </div>
      )}
      <div className="p-4 sm:p-6">
        <ChartScrollReveal minHeight={chartMinHeight}>{children}</ChartScrollReveal>
      </div>
    </div>
  );
}

export function ReportHero({
  title,
  createdAt,
  theme,
}: {
  title: string;
  createdAt: string;
  theme: ReportTheme;
}) {
  return (
    <ScrollReveal y={16}>
      <div
        className="rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative"
        style={{ background: theme.heroGradient }}
      >
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Report</p>
          <h1
            className="text-3xl sm:text-4xl font-semibold leading-tight mb-2 tracking-tight"
            style={REPORT_FONT_STYLE}
          >
            {title}
          </h1>
          <p className="text-sm text-white/80">Last sync {createdAt}</p>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function ReportBackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft size={16} />
      <span>Back to all reports</span>
    </button>
  );
}

export function ReportLegendPills({
  items,
}: {
  items: Array<{ label: string; color: string; title?: string }>;
}) {
  return (
    <ScrollReveal y={12} delay={0.05}>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <motion.span
            key={item.label}
            title={item.title}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-secondary-foreground bg-card border border-border"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 + i * 0.04 }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
            {item.label}
          </motion.span>
        ))}
      </div>
    </ScrollReveal>
  );
}

export function ReportRiskMap({
  locations,
  theme,
  valueLabel = 'incidents',
  legend,
}: {
  locations: Array<{ name: string; lat: number; lng: number; count: number; severity: string }>;
  theme: ReportTheme;
  valueLabel?: string;
  legend?: Array<{ label: string; color: string }>;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { ref: viewRef, inView } = useInViewOnce(0.1, '0px 0px -10% 0px');

  const getColor = (severity: string) => {
    if (severity === 'critical') return 'var(--destructive-text)';
    if (severity === 'high') return theme.accent;
    return 'var(--warning)';
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
        L.circle([loc.lat, loc.lng], {
          color: getColor(loc.severity),
          fillColor: getColor(loc.severity),
          fillOpacity: 0.35,
          radius: loc.count * 800,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<div style="padding:8px"><p style="font-weight:bold;font-size:13px;margin:0 0 4px">${loc.name}</p><p style="font-size:11px;color:#64748b;margin:0">${loc.count} ${valueLabel}</p></div>`
          );
      });
      mapInstanceRef.current = map;
    });
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, theme.accent, valueLabel, inView]);

  return (
    <div ref={viewRef}>
      {!inView ? (
        <div
          className="h-[380px] rounded-xl overflow-hidden border border-border bg-muted animate-pulse"
          aria-hidden
        />
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
      {legend && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold text-text-subtle uppercase tracking-wide">Legend:</span>
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden" style={REPORT_FONT_STYLE}>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6 pb-10">
          <div className="max-w-[1400px] mx-auto space-y-14">{children}</div>
        </div>
      </div>
    </div>
  );
}
