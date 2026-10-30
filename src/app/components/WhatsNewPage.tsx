import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  formatReleaseDate,
  RELEASE_CATEGORY_LABELS,
  RELEASE_CATEGORY_ORDER,
  RELEASES,
  type Release,
  type ReleaseCategory,
} from '../data/releases';
import { markReleaseSeen } from '../hooks/useUnseenRelease';
import { StandalonePageLayout } from './StandalonePageLayout';
import { cn } from './ui/utils';

/** Query flag used by App to render this page without authentication. */
export const WHATS_NEW_PAGE_QUERY = 'page=whats-new';
export const WHATS_NEW_PAGE_HREF = `/?${WHATS_NEW_PAGE_QUERY}`;

export function isWhatsNewPageRequest(search = window.location.search) {
  return new URLSearchParams(search).get('page') === 'whats-new';
}

const CATEGORY_BADGE_CLASS: Record<ReleaseCategory, string> = {
  ai: 'bg-primary-subtle text-primary-text',
  data: 'bg-success-subtle text-success-text',
  features: 'bg-info-subtle text-info',
  fixes: 'bg-muted text-muted-foreground',
};

function ReleaseCard({ release, isLatest }: { release: Release; isLatest: boolean }) {
  const hasChanges = Boolean(release.changes);
  const [open, setOpen] = useState(isLatest && hasChanges);
  const bodyId = `release-${release.version}`;

  const header = (
    <>
      <span className="text-base font-semibold text-foreground">v{release.version}</span>
      {isLatest && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          Latest
        </span>
      )}
      {!open && release.summary && (
        <span className="truncate text-sm text-muted-foreground">{release.summary}</span>
      )}
      <span className="ml-auto shrink-0 text-sm text-text-subtle">
        {formatReleaseDate(release.date)}
      </span>
    </>
  );

  return (
    <section
      id={`v${release.version}`}
      className="scroll-mt-8 overflow-hidden rounded-xl border border-border bg-white"
    >
      {hasChanges ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex w-full items-center gap-3 px-6 py-5 text-left transition-colors hover:bg-surface-hover"
        >
          {header}
          <ChevronDown
            size={16}
            className={cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
      ) : (
        <div className="flex items-center gap-3 px-6 py-5">{header}</div>
      )}

      {open && release.changes && (
        <div id={bodyId} className="divide-y divide-border border-t border-border px-6">
          {RELEASE_CATEGORY_ORDER.filter((c) => release.changes?.[c]?.length).map((category) => (
            <div key={category} className="py-5">
              <span
                className={cn(
                  'mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                  CATEGORY_BADGE_CLASS[category],
                )}
              >
                {RELEASE_CATEGORY_LABELS[category]}
              </span>
              <ul className="space-y-2 text-sm leading-relaxed text-foreground">
                {release.changes![category]!.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function WhatsNewPage() {
  useEffect(() => {
    markReleaseSeen();
  }, []);

  return (
    <StandalonePageLayout
      title="Changelog"
      description="Every change to Humanity Hub, newest first. Changes to the AI and data sources are listed first because they can change answers."
    >
      <main className="space-y-4">
        {RELEASES.map((release, i) => (
          <ReleaseCard key={release.version} release={release} isLatest={i === 0} />
        ))}
      </main>
    </StandalonePageLayout>
  );
}
