import React, { useRef, useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { AuthPageLayout } from './AuthPageLayout';
import { TERMS_PAGE_HREF } from './TermsAndConditionsPage';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  FieldError,
  fieldControlProps,
  requiredEmail,
  requiredField,
  useFormValidation,
} from './ui/form-validation';

const unLogo = '/branding/un-somalia-login-logo.png';

const authInputClass =
  'w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12';

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignUp, onNavigateToForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const { errors, validate } = useFormValidation(
    { email, password },
    {
      email: requiredEmail,
      password: requiredField('Password'),
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fieldsOk = validate(formRef.current);
    const nextTermsError = acceptedTerms
      ? undefined
      : 'You must agree to the terms and conditions';
    setTermsError(nextTermsError);
    if (!fieldsOk || nextTermsError) {
      if (fieldsOk && nextTermsError) {
        document.getElementById('login-terms')?.focus();
      }
      return;
    }
    onLogin();
  };

  return (
    <AuthPageLayout>
      <div className="mb-8 -ml-2">
        <img src={unLogo} alt="United Nations Somalia" className="h-14 w-auto" />
      </div>

      <h2 className="text-page-title mb-6">Sign In</h2>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-label mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              className={authInputClass}
              {...fieldControlProps('login-email', errors.email)}
            />
            <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle" />
          </div>
          <FieldError id="login-email" message={errors.email} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password" className="block text-label">
              Password
            </label>
            <button
              type="button"
              className="text-label font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
              onClick={onNavigateToForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={authInputClass}
              {...fieldControlProps('login-password', errors.password)}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                {showPassword ? 'Hide password' : 'Show password'}
              </TooltipContent>
            </Tooltip>
          </div>
          <FieldError id="login-password" message={errors.password} />
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              id="login-terms"
              role="checkbox"
              aria-checked={acceptedTerms}
              aria-invalid={Boolean(termsError) || undefined}
              aria-describedby={termsError ? 'login-terms-error' : undefined}
              onClick={() => {
                setAcceptedTerms((prev) => {
                  const next = !prev;
                  if (next) setTermsError(undefined);
                  return next;
                });
              }}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all focus:outline-none focus:ring-3 focus:ring-primary/20 ${
                termsError
                  ? 'border-destructive'
                  : 'border-border-muted'
              } ${
                acceptedTerms
                  ? 'bg-primary border-primary'
                  : 'bg-card hover:border-text-subtle'
              }`}
            >
              {acceptedTerms && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <p className="text-sm text-foreground leading-snug">
              <label htmlFor="login-terms" className="cursor-pointer">
                By signing in you agree to the{' '}
              </label>
              <a
                href={TERMS_PAGE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                Terms and Conditions
              </a>
            </p>
          </div>
          <FieldError id="login-terms" message={termsError} />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover active:bg-primary-active transition-colors"
        >
          Sign In
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
          onClick={onNavigateToSignUp}
        >
          Sign up
        </button>
      </p>
    </AuthPageLayout>
  );
}
