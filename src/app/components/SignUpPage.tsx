import { useState, useRef, useEffect } from 'react';
import { User, Mail, Building2, Eye, EyeOff } from 'lucide-react';
import { AuthHeroPanel } from './AuthHeroPanel';

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

function OrganisationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
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
          className="w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12"
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

  const isValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    email.includes('@') &&
    organisation.length > 0 &&
    password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), email: email.trim(), organisation, password });
  };

  return (
    <div className="min-h-screen flex bg-white p-4">
      <AuthHeroPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 -ml-2">
            <img src={unLogo} alt="United Nations Somalia" className="h-14 w-auto" />
          </div>

          <h2 className="text-page-title mb-2">Create Account</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Your account will be reviewed by an administrator before you can access the platform.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label uppercase tracking-wide mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12"
                />
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-label uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12"
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-label uppercase tracking-wide mb-2">
                Organisation
              </label>
              <OrganisationField value={organisation} onChange={setOrganisation} />
            </div>

            <div>
              <label className="block text-label uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3.5 rounded-full text-sm font-semibold transition-colors ${
                isValid
                  ? 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Create Account
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              className="text-sm text-foreground font-semibold hover:text-primary transition-colors underline"
              onClick={onNavigateToSignIn}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
