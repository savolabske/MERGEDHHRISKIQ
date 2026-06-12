import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { motion } from 'motion/react';
import type { AdtSectionNarrative } from './adtSectionNarratives';
import { ADT_ACCENT } from './adtCategoryColors';
import { ChartScrollReveal, ScrollReveal, REPORT_FONT_STYLE } from './reportMotion';

function StoryBullet({ text, tone }: { text: string; tone: 'primary' | 'secondary' }) {
  return (
    <div className="flex gap-3 py-3 border-b border-sidebar-border last:border-0">
      <span
        className="w-2 h-2 rounded-full shrink-0 mt-2"
        style={{ background: tone === 'primary' ? ADT_ACCENT : 'var(--chart-3)' }}
      />
      <p className="text-sm text-secondary-foreground leading-relaxed">{text}</p>
    </div>
  );
}

export function AdtStorySection({
  narrative,
  children,
  note,
}: {
  narrative: AdtSectionNarrative;
  children: ReactNode;
  note?: string;
}) {
  const accentColor = ADT_ACCENT;

  return (
    <section className="space-y-5">
      <ScrollReveal className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-0.5 w-6 rounded-full" style={{ background: accentColor }} />
          <p
            className="text-xs font-bold uppercase tracking-[0.14em]"
            style={{ color: accentColor }}
          >
            {narrative.eyebrow}
          </p>
        </div>

        <h2
          className="report-display-title text-2xl sm:text-3xl font-semibold leading-[1.15] tracking-tight text-foreground-emphasis mb-3"
          style={REPORT_FONT_STYLE}
        >
          {narrative.headline}
          {narrative.headlineAccent && (
            <>
              <br />
              <span style={{ color: accentColor }}>{narrative.headlineAccent}</span>
            </>
          )}
        </h2>

        <p className="text-base text-muted-foreground leading-relaxed">{narrative.insight}</p>

        {narrative.bullets && narrative.bullets.length > 0 && (
          <div className="mt-4 bg-card rounded-xl border border-border px-4">
            {narrative.bullets.map((bullet, i) => (
              <StoryBullet
                key={i}
                text={bullet}
                tone={i % 2 === 0 ? 'primary' : 'secondary'}
              />
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
              className="mx-4 sm:mx-6 mb-4 sm:mb-6 px-4 py-3 rounded-xl border border-primary bg-primary-subtle"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex gap-2">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary leading-relaxed">
                  <span className="font-bold">RMU Note: </span>
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

export function AdtChartPanel({
  title,
  children,
  className = '',
  chartMinHeight = 200,
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
