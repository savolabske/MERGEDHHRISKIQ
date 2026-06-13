import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { AuthHeroPanel } from './AuthHeroPanel';
import { cn } from './ui/utils';

const unLogo = '/branding/un-somalia-login-logo.png';
const SUPPORT_EMAIL = 'alerts.rmu@undp.org';

interface ForgotPasswordPageProps {
  onSubmit: (email: string) => void;
  onNavigateToSignIn: () => void;
}

export function ForgotPasswordPage({ onSubmit, onNavigateToSignIn }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const canSubmit = Boolean(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(email.trim());
  };

  return (
    <div className="min-h-screen flex bg-white p-4">
      <AuthHeroPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 -ml-2">
            <img src={unLogo} alt="United Nations Somalia" className="h-14 w-auto" />
          </div>

          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
            Back to Sign In
          </button>

          <h2 className="text-page-title mb-3">Reset Password</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12"
                  required
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'w-full py-3.5 rounded-full text-sm font-semibold transition-colors',
                canSubmit
                  ? 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              Send Reset Instructions
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-primary/20 bg-primary-subtle px-4 py-3 text-sm text-primary-text leading-relaxed">
            <span className="font-semibold">Note:</span> If you don&apos;t receive an email within a few minutes,
            check your spam folder or contact support.
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need help? Contact{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
