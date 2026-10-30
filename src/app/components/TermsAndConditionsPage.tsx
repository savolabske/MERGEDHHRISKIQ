import { PRIVACY_PAGE_HREF } from './PrivacyNoticePage';
import { DocBody, DocSection, StandalonePageLayout } from './StandalonePageLayout';

/** Query flag used by App to render this page without authentication. */
export const TERMS_PAGE_QUERY = 'page=terms';
export const TERMS_PAGE_HREF = `/?${TERMS_PAGE_QUERY}`;

export function isTermsPageRequest(search = window.location.search) {
  return new URLSearchParams(search).get('page') === 'terms';
}

const SECTIONS = [
  { id: 'acceptance', title: 'Acceptance of terms' },
  { id: 'purpose', title: 'Purpose of the platform' },
  { id: 'accounts', title: 'Account registration and access' },
  { id: 'acceptable-use', title: 'Acceptable use' },
  { id: 'data', title: 'Data and confidentiality' },
  { id: 'updates', title: 'Updates' },
  { id: 'contact', title: 'Contact' },
] as const;

export function TermsAndConditionsPage() {
  return (
    <StandalonePageLayout
      title="Terms and Conditions"
      description={
        <>
          The rules for using Humanity Hub. How we handle your questions and documents is covered
          in the{' '}
          <a
            href={PRIVACY_PAGE_HREF}
            className="font-medium text-primary underline hover:text-primary-hover"
          >
            Privacy Notice
          </a>
          .
        </>
      }
      meta="Last updated September 2026"
    >
      <DocBody>
        <DocSection sections={SECTIONS} id="acceptance">
          <p>
            By creating an account and using Humanity Hub Somalia, you agree to these Terms and
            Conditions. If you do not agree, do not register for or use the platform.
          </p>
        </DocSection>

        <DocSection sections={SECTIONS} id="purpose">
          <p>
            Humanity Hub Somalia is a decision-support tool for humanitarian and development
            operations. Access is intended for authorised personnel of partner organisations and is
            subject to administrator approval.
          </p>
        </DocSection>

        <DocSection sections={SECTIONS} id="accounts">
          <p>
            You must provide accurate registration information. Accounts may be reviewed, approved,
            suspended, or revoked by administrators. You are responsible for safeguarding your
            credentials and for activity under your account.
          </p>
        </DocSection>

        <DocSection sections={SECTIONS} id="acceptable-use">
          <p>
            You agree to use the platform only for legitimate operational and analytical purposes,
            in line with applicable organisational policies and laws. You must not attempt
            unauthorised access, misuse sensitive information, or disrupt platform integrity.
          </p>
        </DocSection>

        <DocSection sections={SECTIONS} id="data">
          <p>
            Content and insights available through the platform may be sensitive. Handle all
            information in accordance with your organisation&apos;s data protection, information
            security, and confidentiality requirements.
          </p>
        </DocSection>

        <DocSection sections={SECTIONS} id="updates">
          <p>
            These terms may be updated from time to time. Continued use of the platform after
            updates constitutes acceptance of the revised terms. Replace this placeholder copy with
            the final legal text before production launch.
          </p>
        </DocSection>

        <DocSection sections={SECTIONS} id="contact">
          <p>
            For questions about these terms, contact the Risk Management Unit at{' '}
            <a
              href="mailto:alerts.rmu@undp.org"
              className="font-medium text-primary underline hover:text-primary-hover"
            >
              alerts.rmu@undp.org
            </a>
            .
          </p>
        </DocSection>
      </DocBody>
    </StandalonePageLayout>
  );
}
