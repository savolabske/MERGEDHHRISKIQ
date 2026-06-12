import React, { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { AuthHeroPanel } from './AuthHeroPanel';

const unLogo = '/branding/un-somalia-login-logo.png';

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignUp, onNavigateToForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex bg-white p-4">
      <AuthHeroPanel />

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 -ml-2">
            <img src={unLogo} alt="United Nations Somalia" className="h-14 w-auto" />
          </div>

          <h2 className="text-page-title mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg hover:border-border-muted focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-text-subtle pr-12"
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-label">
                  Password
                </label>
                <button
                  type="button"
                  className="text-label text-primary hover:text-primary-hover transition-colors"
                  onClick={onNavigateToForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border border-border-muted flex items-center justify-center flex-shrink-0 transition-all focus:outline-none focus:ring-3 focus:ring-primary/20 ${
                  rememberMe
                    ? 'bg-primary border-primary'
                    : 'bg-card hover:border-text-subtle'
                }`}
              >
                {rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-foreground">Remember me</span>
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
              className="text-sm text-foreground font-semibold hover:text-primary transition-colors underline"
              onClick={onNavigateToSignUp}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
