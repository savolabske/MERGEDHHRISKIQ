import { useState, useRef, useEffect } from 'react';
import { User, Mail, Building2, Eye, EyeOff } from 'lucide-react';
import { AuthPageLayout } from './AuthPageLayout';
import { TERMS_PAGE_HREF } from './TermsAndConditionsPage';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  FieldError,
  fieldControlProps,
  requiredEmail,
  requiredField,
  requiredPassword,
  useFormValidation,
} from './ui/form-validation';

const unLogo = '/branding/un-somalia-login-logo.png';

const organisations = [
  'United Nations Somalia',
  'UNICEF Somalia',
  'WFP Somalia',
  'WHO Somalia',
  'UNHCR Somalia',
  'IOM Somalia',
  'FAO Somalia',
  'UNDP Somalia',
  'OCHA Somalia',
  'UNFPA Somalia',
  'UN Women Somalia',
  'International NGO',
  'Local NGO',
  'Government Agency',
  'Other',
];

interface SignUpPageProps {
  onSubmit: (data: {
    name: string;
    email: string;
    organisation: string;
    password: string;
  }) => void;
  onNavigateToSignIn: () => void;
}

const authInputClass =
  'w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12';

function OrganisationField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = organisations.filter((org) =>
    org.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(value);
          }}
          placeholder="Select or search organisation"
          className={authInputClass}
          {...fieldControlProps('signup-organisation', error)}
        />
        <Building2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg z-50 max-h-[220px] overflow-y-auto shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-subtle">No organisations found</p>
          ) : (
            filtered.map((org) => (
              <button
                key={org}
                type="button"
                onClick={() => {
                  onChange(org);
                  setSearch('');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  org === value ? 'bg-primary-subtle text-primary font-medium' : 'text-foreground'
                }`}
              >
                {org}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function SignUpPage({ onSubmit, onNavigateToSignIn }: SignUpPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const { errors, validate } = useFormValidation(
    { name, email, organisation, password },
    {
      name: requiredField('Full name'),
      email: requiredEmail,
      organisation: requiredField('Organisation'),
      password: requiredPassword,
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
        document.getElementById('signup-terms')?.focus();
      }
      return;
    }
    onSubmit({ name: name.trim(), email: email.trim(), organisation, password });
  };

  return (
    <AuthPageLayout>
          <div className="mb-8 -ml-2">
            <img src={unLogo} alt="United Nations Somalia" className="h-14 w-auto" />
          </div>

          <h2 className="text-page-title mb-2">Create Account</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Your account will be reviewed by an administrator before you can access the platform.
          </p>

          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="signup-name" className="block text-label uppercase tracking-wide mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  autoComplete="name"
                  className={authInputClass}
                  {...fieldControlProps('signup-name', errors.name)}
                />
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
              </div>
              <FieldError id="signup-name" message={errors.name} />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-label uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  autoComplete="email"
                  className={authInputClass}
                  {...fieldControlProps('signup-email', errors.email)}
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
              </div>
              <FieldError id="signup-email" message={errors.email} />
            </div>

            <div>
              <label htmlFor="signup-organisation" className="block text-label uppercase tracking-wide mb-2">
                Organisation
              </label>
              <OrganisationField value={organisation} onChange={setOrganisation} error={errors.organisation} />
              <FieldError id="signup-organisation" message={errors.organisation} />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-label uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  className={authInputClass}
                  {...fieldControlProps('signup-password', errors.password)}
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
              <FieldError id="signup-password" message={errors.password} />
            </div>

            <div>
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  id="signup-terms"
                  role="checkbox"
                  aria-checked={acceptedTerms}
                  aria-invalid={Boolean(termsError) || undefined}
                  aria-describedby={termsError ? 'signup-terms-error' : undefined}
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
                  <label htmlFor="signup-terms" className="cursor-pointer">
                    I agree to the{' '}
                  </label>
                  <a
                    href={TERMS_PAGE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
                  >
                    Terms and conditions
                  </a>
                </p>
              </div>
              <FieldError id="signup-terms" message={termsError} />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full text-sm font-semibold transition-colors bg-primary text-white hover:bg-primary-hover active:bg-primary-active"
            >
              Create Account
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
              onClick={onNavigateToSignIn}
            >
              Sign in
            </button>
          </p>
    </AuthPageLayout>
  );
}
