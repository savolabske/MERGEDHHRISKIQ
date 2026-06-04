import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';

/** Platform display font (Inter) — matches theme.css */
export const REPORT_FONT_STYLE = { fontFamily: 'var(--font-display)' } as const;

export const SCROLL_EASE = [0.22, 1, 0.36, 1] as const;

/** Recharts: bars/lines animate in when chart mounts on scroll */
export const CHART_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 900,
  animationEasing: 'ease-out' as const,
  animationBegin: 0,
};

export function useInViewOnce(threshold = 0.12, rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold, rootMargin]);

  return { ref, inView };
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px 0px -48px 0px', amount: 0.12 }}
      transition={{ duration: 0.55, delay, ease: SCROLL_EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Mount chart content when scrolled into view so Recharts plays enter animation */
export function ChartScrollReveal({
  children,
  minHeight = 200,
  className = '',
}: {
  children: ReactNode;
  minHeight?: number;
  className?: string;
}) {
  const { ref, inView } = useInViewOnce(0.08, '0px 0px -6% 0px');

  return (
    <div ref={ref} className={className}>
      {!inView && (
        <div
          className="rounded-xl bg-muted border border-sidebar-border animate-pulse"
          style={{ minHeight }}
          aria-hidden
        />
      )}
      {inView && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: SCROLL_EASE }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: SCROLL_EASE },
  },
};

export function StaggerRevealList({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={listContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px 0px', amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerRevealItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={listItem}>
      {children}
    </motion.div>
  );
}
