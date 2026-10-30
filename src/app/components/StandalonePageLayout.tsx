import type { ReactNode } from 'react';

const unLogo = '/branding/un-humanity-hub-logo.png';

export type DocSectionDef = { id: string; title: string };

/**
 * Shared shell for the public pages opened in a new tab (Terms, Privacy, Changelog):
 * logo, page header, and a close link.
 */
export function StandalonePageLayout({
  title,
  description,
  meta,
  children,
}: {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <div className="mb-8 -ml-2">
          <img src={unLogo} alt="United Nations Humanity Hub" className="h-14 w-auto" />
        </div>

        <header className="mb-8">
          <p className="text-label mb-2 uppercase tracking-wide text-muted-foreground">
            Humanity Hub Somalia
          </p>
          <h1 className="text-page-title mb-2">{title}</h1>
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {meta && <p className="mt-2 text-xs text-text-subtle">{meta}</p>}
        </header>

        {children}

        <div className="mt-10 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => window.close()}
            className="text-sm font-semibold text-foreground underline transition-colors hover:text-primary"
          >
            Close this page
          </button>
        </div>
      </div>
    </div>
  );
}

function sectionHeading(sections: readonly DocSectionDef[], id: string) {
  const index = sections.findIndex((s) => s.id === id);
  return `${index + 1}. ${sections[index].title}`;
}

export function DocBody({ children }: { children: ReactNode }) {
  return (
    <main className="space-y-7 border-t border-border pt-8 text-sm leading-relaxed text-foreground">
      {children}
    </main>
  );
}

export function DocSection({
  sections,
  id,
  children,
}: {
  sections: readonly DocSectionDef[];
  id: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-2">
      <h2 className="text-base font-semibold">{sectionHeading(sections, id)}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
