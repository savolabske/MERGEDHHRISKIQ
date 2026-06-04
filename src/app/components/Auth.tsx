import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Check, ChevronDown, Clock } from 'lucide-react';
import AnimatedIntelligenceBackgroundLayer from '../../imports/AnimatedIntelligenceBackgroundLayer';
import logoImage from '../../assets/un-somalia-logo.png';
import { LoginPage } from './LoginPage';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AuthProps {
  onLogin: () => void;
}

// Organisation Dropdown Component
function OrganisationDropdown({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    'Other'
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[48px] px-4 bg-muted border border-border rounded-lg text-sm outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/10 transition-all flex items-center justify-between ${
          value ? 'text-foreground' : 'text-text-subtle'
        }`}
      >
        <span>{value || 'Select your organisation'}</span>
        <ChevronDown size={16} className={`text-text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg z-50 max-h-[280px] overflow-y-auto">
          {organisations.map((org) => (
            <button
              key={org}
              type="button"
              onClick={() => {
                onChange(org);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                org === value ? 'bg-primary-subtle text-primary font-semibold' : 'text-foreground'
              }`}
            >
              {org}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Pending Verification Screen
function PendingVerification({ email, onBackToLogin }: { email: string; onBackToLogin: () => void }) {
  return (
    <div className="min-h-screen w-full bg-card flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Pending Message */}
      <div className="flex-1 bg-card flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
        <div className="max-w-[460px] mx-auto w-full">
          {/* Logo */}
          <div className="mb-8 lg:mb-12">
            <div className="mb-6 lg:mb-8">
              <img 
                src={logoImage} 
                alt="United Nations Somalia" 
                className="w-44 h-auto mx-[-6px] my-[0px]"
              />
            </div>

            <h1 className="text-xl lg:text-2xl font-semibold text-foreground mb-2 tracking-tight">
              Risk IQ
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time Operational Risk Analysis
            </p>
          </div>

          {/* Pending Icon */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-warning-subtle rounded-2xl flex items-center justify-center mb-6">
              <Clock className="text-warning" size={32} strokeWidth={2} />
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-3">
              Account Pending Verification
            </h2>
            
            <div className="space-y-3 mb-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Thank you for registering with Risk IQ. Your account has been created successfully and is currently pending admin approval.
              </p>
              
              <div className="bg-muted border border-border rounded-xl p-4">
                <p className="text-sm text-secondary-foreground mb-2">
                  <span className="font-semibold text-foreground">Registered Email:</span>
                </p>
                <p className="text-sm font-medium text-primary">
                  {email}
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                You will receive an email notification once your account has been approved by an administrator. This typically takes 1-2 business days.
              </p>
            </div>

            {/* What happens next */}
            

            {/* Back to Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-[52px]"
              onClick={onBackToLogin}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Animated Background (same as login) */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-info-subtle via-info-subtle to-info-subtle">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMGRhc2hib2FyZCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcyMTg1ODE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20"></div>
        <div className="absolute inset-0 opacity-20">
          <AnimatedIntelligenceBackgroundLayer />
        </div>
        <div className="absolute top-8 left-8 z-10">
          <h3 className="text-xs font-bold text-secondary-foreground mb-1 uppercase tracking-wider">
            Risk iQ
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Intelligence-powered risk management<br />
            for humanitarian operations
          </p>
        </div>
        <div className="absolute bottom-8 right-8 z-10 text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h3 className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">
              TERRITORIAL SCAN ACTIVE
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            MOGADISHU OPERATIONAL HUB | V3.4.1
          </p>
        </div>
        <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-[35%] right-[45%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[40%] right-[25%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[25%] right-[60%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}

export function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'pending' | 'forgot' | 'reset-sent'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOrganisation, setSignupOrganisation] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = () => {
    toast.success('Welcome back! Logging you in...');
    onLogin();
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signupName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!signupEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!signupOrganisation) {
      toast.error('Please select your organisation');
      return;
    }
    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Success - show pending screen
    setRegisteredEmail(signupEmail);
    setMode('pending');
    toast.success('Registration submitted successfully');
  };

  const handleBackToLogin = () => {
    setMode('login');
    // Reset signup fields
    setSignupName('');
    setSignupEmail('');
    setSignupOrganisation('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    // Reset forgot password fields
    setForgotEmail('');
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Success - show reset sent screen
    setResetEmail(forgotEmail);
    setMode('reset-sent');
    toast.success('Password reset instructions sent');
  };

  if (mode === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateToSignUp={() => setMode('signup')}
        onNavigateToForgotPassword={() => setMode('forgot')}
      />
    );
  }

  // Show pending verification screen
  if (mode === 'pending') {
    return <PendingVerification email={registeredEmail} onBackToLogin={handleBackToLogin} />;
  }

  // Show reset sent confirmation screen
  if (mode === 'reset-sent') {
    return (
      <div className="min-h-screen w-full bg-card flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Reset Sent Message */}
        <div className="flex-1 bg-card flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
          <div className="max-w-[460px] mx-auto w-full">
            {/* Logo */}
            <div className="mb-8 lg:mb-10">
              <img 
                src={logoImage} 
                alt="United Nations Somalia" 
                className="w-44 h-auto mx-[-6px] my-[0px]"
              />
            </div>

            {/* Check Icon */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-success-subtle rounded-2xl flex items-center justify-center mb-6">
                <Check className="text-success" size={32} strokeWidth={2.5} />
              </div>

              <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-4">
                Check your email
              </h2>
              
              <div className="space-y-3 mb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We've sent password reset instructions to:
                </p>
                
                <div className="bg-muted border border-border rounded-xl p-4">
                  <p className="text-sm font-medium text-primary">
                    {resetEmail}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                </p>
              </div>

              {/* Back to Login */}
              <button
                onClick={handleBackToLogin}
                className="w-full h-[52px] bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-all flex items-center justify-center gap-2 mb-4"
              >
                Back to Login
                <ArrowRight size={18} strokeWidth={2} />
              </button>

              {/* Resend Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={() => toast.success('Reset email sent again')}
                    className="font-medium text-primary hover:text-primary-text transition-colors"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Animated Background */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-info-subtle via-info-subtle to-info-subtle">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ 
              backgroundImage: `url(https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMGRhc2hib2FyZCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcyMTg1ODE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20"></div>
          <div className="absolute inset-0 opacity-20">
            <AnimatedIntelligenceBackgroundLayer />
          </div>
          <div className="absolute top-8 left-8 z-10">
            <h3 className="text-xs font-bold text-secondary-foreground mb-1 uppercase tracking-wider">
              AREA ANALYSIS
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-powered risk detection across<br />
              Horn of Africa regional sectors
            </p>
          </div>
          <div className="absolute bottom-8 right-8 z-10 text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <h3 className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">
                TERRITORIAL SCAN ACTIVE
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              MOGADISHU OPERATIONAL HUB | V3.4.1
            </p>
          </div>
          <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-[35%] right-[45%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[40%] right-[25%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[25%] right-[60%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-card flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 bg-card flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
        {/* Logo */}
        <div className="mb-8 lg:mb-10 max-w-[460px] mx-auto w-full">
          <img 
            src={logoImage} 
            alt="United Nations Somalia" 
            className="w-44 h-auto mx-[-6px] my-[0px]"
          />
        </div>

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-5 max-w-[460px] mx-auto w-full">
            {/* Sign Up Title */}
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-8">
              Sign Up
            </h1>

            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                FULL NAME
              </label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="John Smith"
                className="w-full h-[48px] px-4 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/10 transition-all"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@undp.org"
                className="w-full h-[48px] px-4 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/10 transition-all"
                required
              />
            </div>

            {/* Organisation Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                ORGANISATION
              </label>
              <OrganisationDropdown 
                value={signupOrganisation}
                onChange={setSignupOrganisation}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] px-4 pr-12 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/10 transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-subtle mt-1.5">
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] px-4 pr-12 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-[52px] mt-6 gap-2">
              Create Account
              <ArrowRight size={18} strokeWidth={2} />
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-primary hover:text-primary-text transition-colors"
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 max-w-[460px] mx-auto w-full">
            {/* Reset Password Title */}
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-3">
              Reset Password
            </h1>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@undp.org"
                className="w-full h-[48px] px-4 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-text-subtle outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/10 transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-[52px] mt-6 gap-2">
              Send Reset Instructions
              <ArrowRight size={18} strokeWidth={2} />
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="font-medium text-primary hover:text-primary-text transition-colors"
                >
                  Back to login
                </button>
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Right Side - Animated Background */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-info-subtle via-info-subtle to-info-subtle">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMGRhc2hib2FyZCUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcyMTg1ODE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20"></div>

        {/* Animated Background Layer */}
        <div className="absolute inset-0 opacity-20">
          <AnimatedIntelligenceBackgroundLayer />
        </div>

        {/* Top Left Text */}
        <div className="absolute top-8 left-8 z-10">
          <h3 className="font-bold text-secondary-foreground mb-1 uppercase tracking-wider text-sm">
            Risk iQ
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Intelligence-powered risk management<br />
            for humanitarian operations
          </p>
        </div>

        {/* Bottom Right Text */}
        <div className="absolute bottom-8 right-8 z-10 text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h3 className="font-bold text-secondary-foreground uppercase tracking-wider text-sm">UN Somalia</h3>
          </div>
          <p className="text-xs text-muted-foreground">AI-Powered Risk Intelligence</p>
        </div>

        {/* Floating Dots */}
        <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-[35%] right-[45%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[40%] right-[25%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[25%] right-[60%] w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
}