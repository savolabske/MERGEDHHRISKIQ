const unLogo = '/branding/un-somalia-login-logo.png';

/** Query flag used by App to render this page without authentication. */
export const TERMS_PAGE_QUERY = 'page=terms';
export const TERMS_PAGE_HREF = `/?${TERMS_PAGE_QUERY}`;

export function isTermsPageRequest(search = window.location.search) {
  return new URLSearchParams(search).get('page') === 'terms';
}

export function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
        <div className="mb-8 -ml-2">
          <img src={unLogo} alt="United Nations Somalia" className="h-14 w-auto" />
        </div>

        <p className="text-label uppercase tracking-wide text-muted-foreground mb-2">
          Humanity Hub Somalia
        </p>
        <h1 className="text-page-title mb-2">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: September 2026
        </p>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">1. Acceptance of terms</h2>
            <p className="text-muted-foreground">
              By creating an account and using Humanity Hub Somalia, you agree to these Terms and
              Conditions. If you do not agree, do not register for or use the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">2. Purpose of the platform</h2>
            <p className="text-muted-foreground">
              Humanity Hub Somalia is a decision-support tool for humanitarian and development
              operations. Access is intended for authorised personnel of partner organisations and
              is subject to administrator approval.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">3. Account registration and access</h2>
            <p className="text-muted-foreground">
              You must provide accurate registration information. Accounts may be reviewed,
              approved, suspended, or revoked by administrators. You are responsible for
              safeguarding your credentials and for activity under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">4. Acceptable use</h2>
            <p className="text-muted-foreground">
              You agree to use the platform only for legitimate operational and analytical
              purposes, in line with applicable organisational policies and laws. You must not
              attempt unauthorised access, misuse sensitive information, or disrupt platform
              integrity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">5. Data and confidentiality</h2>
            <p className="text-muted-foreground">
              Content and insights available through the platform may be sensitive. Handle all
              information in accordance with your organisation&apos;s data protection, information
              security, and confidentiality requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">6. Updates</h2>
            <p className="text-muted-foreground">
              These terms may be updated from time to time. Continued use of the platform after
              updates constitutes acceptance of the revised terms. Replace this placeholder copy
              with the final legal text before production launch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">7. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, contact the Risk Management Unit at{' '}
              <a
                href="mailto:alerts.rmu@undp.org"
                className="font-medium text-primary underline hover:text-primary-hover"
              >
                alerts.rmu@undp.org
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => window.close()}
            className="text-sm font-semibold text-foreground underline hover:text-primary transition-colors"
          >
            Close this page
          </button>
        </div>
      </div>
    </div>
  );
}
