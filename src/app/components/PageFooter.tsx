import { PRIVACY_PAGE_HREF } from './PrivacyNoticePage';
import { TERMS_PAGE_HREF } from './TermsAndConditionsPage';
import { WHATS_NEW_PAGE_HREF } from './WhatsNewPage';

const FOOTER_LINKS = [
  { label: 'Privacy Notice', href: PRIVACY_PAGE_HREF },
  { label: 'Terms and Conditions', href: TERMS_PAGE_HREF },
  { label: 'Changelog', href: WHATS_NEW_PAGE_HREF },
];

export function PageFooter() {
  return (
    <footer className="mt-12 pb-12" aria-label="Page footer">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide text-text-subtle">
        <span>Humanity Hub 2026</span>
        {FOOTER_LINKS.map(({ label, href }) => (
          <span key={href} className="flex items-center gap-3">
            <span aria-hidden="true">·</span>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline transition-colors"
            >
              {label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
