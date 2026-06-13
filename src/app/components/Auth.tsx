import { useState } from 'react';
import { ArrowRight, Check, Clock } from 'lucide-react';
import AnimatedIntelligenceBackgroundLayer from '../../imports/AnimatedIntelligenceBackgroundLayer';
import logoImage from '../../assets/un-somalia-logo.png';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface AuthProps {
  onLogin: () => void;
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
          <h3 className="text-xs font-bold text-secondary-foreground mb-1">
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
            <h3 className="text-xs font-bold text-secondary-foreground">
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

  const [registeredEmail, setRegisteredEmail] = useState('');

  // Forgot password fields
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = () => {
    toast.success('Welcome back! Logging you in...');
    onLogin();
  };

  const handleSignupSubmit = (data: {
    name: string;
    email: string;
    organisation: string;
    password: string;
  }) => {
    setRegisteredEmail(data.email);
    setMode('pending');
    toast.success('Registration submitted successfully');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  const handleForgotPasswordSubmit = (email: string) => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setResetEmail(email);
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

  if (mode === 'signup') {
    return (
      <SignUpPage
        onSubmit={handleSignupSubmit}
        onNavigateToSignIn={() => setMode('login')}
      />
    );
  }

  // Show pending verification screen
  if (mode === 'pending') {
    return <PendingVerification email={registeredEmail} onBackToLogin={handleBackToLogin} />;
  }

  // Forgot password — matches login/sign-up layout
  if (mode === 'forgot') {
    return (
      <ForgotPasswordPage
        onSubmit={handleForgotPasswordSubmit}
        onNavigateToSignIn={handleBackToLogin}
      />
    );
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
            <h3 className="text-xs font-bold text-secondary-foreground mb-1">
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
              <h3 className="text-xs font-bold text-secondary-foreground">
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

  return null;
}