import React, { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const unLogo = '/branding/un-somalia-login-logo.png';
const heroImage = '/branding/login-hero-somalia.png';

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
  const [activeSlide, setActiveSlide] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex bg-white p-4">
      {/* Left Panel — Hero Image */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden rounded-3xl">
        <ImageWithFallback
          src={heroImage}
          alt="Aerial view of Somalia coastline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1f3460]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-[#0a1628]/20" />

        <div className="relative z-10 flex flex-col justify-end p-12 pb-14 w-full">
          <h1 className="text-white text-[2.75rem] font-bold leading-[1.1] tracking-tight mb-4">
            HUMANITY HUB.<br />SOMALIA
          </h1>
          <p className="text-white/70 text-[1rem] leading-relaxed max-w-[400px] mb-8">
            A decision support tool built for humanitarian and development operations.
          </p>

          <div className="flex items-center gap-2 mb-10">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`rounded-full transition-all ${
                  activeSlide === i
                    ? 'w-8 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/40'
                }`}
              />
            ))}
          </div>

          <p className="text-[0.6875rem] text-[#4FA8DA] tracking-[0.25em] uppercase font-medium">
            Decision Support Intelligence
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 -ml-2">
            <img src={unLogo} alt="United Nations Somalia" className="h-14 w-auto" />
          </div>

          <h2 className="text-[1.75rem] font-bold text-[#1f2937] mb-8">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[0.6875rem] font-semibold text-[#374151] tracking-wider uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[0.9375rem] placeholder:text-[#9CA3AF] pr-12"
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[0.6875rem] font-semibold text-[#374151] tracking-wider uppercase">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[0.8125rem] text-primary hover:text-primary-hover font-medium transition-colors"
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
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[0.9375rem] placeholder:text-[#9CA3AF] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border border-[#D1D5DB] flex items-center justify-center flex-shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  rememberMe
                    ? 'bg-primary border-primary'
                    : 'bg-white hover:border-[#9CA3AF]'
                }`}
              >
                {rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-[0.875rem] text-[#374151]">Remember me</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white rounded-full text-[0.9375rem] font-semibold hover:bg-primary-hover active:bg-primary-active transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-6 text-[0.875rem] text-[#6B7280]">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-[0.875rem] text-[#1f2937] font-semibold hover:text-primary transition-colors underline"
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
