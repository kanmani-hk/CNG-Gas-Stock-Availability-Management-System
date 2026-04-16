import React from 'react';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Fuel, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string, captchaId?: string, captchaAnswer?: string) => void;
  onNavigateToRegister: () => void;
}

export function LoginPage({ onLogin, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState({ id: '', question: '' });

  // Forgot Password state
  const [showForgotScreen, setShowForgotScreen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const fetchCaptcha = async () => {
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiBase}/auth/captcha`);
      if (!response.ok) throw new Error('Captcha fetch failed');
      const data = await response.json();
      setCaptcha({ id: data.captchaId, question: data.question });
    } catch (err) {
      console.error('Failed to fetch captcha', err);
      setCaptcha({ id: '', question: 'Error loading security check' });
    }
  };


  React.useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaAnswer) {
      setError('Please answer the captcha');
      return;
    }

    setIsLoading(true);

    try {
      await onLogin(email, password, captcha.id, captchaAnswer);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      fetchCaptcha();
      setCaptchaAnswer('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const apiBase = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5004/api';
      const response = await fetch(`${apiBase}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail.toLowerCase(),
          captchaId: captcha.id,
          captchaAnswer: captchaAnswer
        }),
      });
      const data = await response.json();
      setMessage(data.message);
      setShowResetScreen(true);
    } catch (err) {
      setError('Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const apiBase = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.toLowerCase(),
          otp: resetOtp,
          newPassword
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Password reset successful! You can now login.');
        setShowForgotScreen(false);
        setShowResetScreen(false);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotScreen) {
    return (
      <div className="min-h-screen bg-[#040f16] flex items-center justify-center px-4 font-sans text-slate-300">
        <div className="max-w-md w-full bg-[#0a1924] border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
          
          <button onClick={() => setShowForgotScreen(false)} className="mb-6 flex items-center text-sm text-slate-400 hover:text-teal-400">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>

          {error && <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          {message && <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 p-3 rounded-lg mb-4 text-sm">{message}</div>}

          {!showResetScreen ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-slate-400 text-sm">Enter your email to receive a 6-digit reset code.</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                required
              />
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-3 text-left font-bold">
                  Security Verification
                </label>
                <div className="flex flex-col gap-3">
                  <div 
                    className="bg-[#040f16] rounded-lg p-1 flex items-center justify-center h-12 overflow-hidden shadow-inner"
                    dangerouslySetInnerHTML={{ __html: captcha.question }}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="flex-1 px-4 py-2 bg-[#040f16] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                      placeholder="Type symbols"
                      required
                    />
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      className="p-2 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                  </div>
                </div>
              </div>
                <button
                type="submit"
                disabled={isLoading}
                className="w-full glow-button py-3 rounded-lg font-bold transition-colors"
                >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="text"
                value={resetOtp}
                maxLength={6}
                onChange={(e) => setResetOtp(e.target.value)}
                placeholder="6-digit reset code"
                className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-center tracking-widest text-xl text-white focus:border-teal-500"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New strong password"
                className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:border-teal-500"
                required
              />
                <button
                type="submit"
                disabled={isLoading}
                className="w-full glow-button py-3 rounded-lg font-bold transition-colors"
                >
                {isLoading ? 'Resetting...' : 'Update Password'}
                </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-sans text-slate-300 relative overflow-hidden">
      {/* Background Image with Animation/Video-like effect */}
      <div 
        className="absolute inset-0 z-0 scale-105 animate-subtle-zoom"
        style={{
          backgroundImage: 'url("/images/bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) contrast(1.1)'
        }}
      ></div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#040f16] via-transparent to-[#040f16]/80 z-0"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Title area optimized to avoid duplication with header logo */}
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="CNG Finder Logo" className="w-16 h-16 mx-auto mb-4 object-contain animate-float" />
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">Welcome Back</h1>
          <p className="text-slate-400 font-medium">Sign in to access your CNG network</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#0a1924]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Captcha Field */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3 text-left font-bold">
                Security Verification
              </label>
              <div className="flex flex-col gap-3">
                <div 
                  className="bg-[#040f16] rounded-lg p-1 flex items-center justify-center h-12 overflow-hidden shadow-inner"
                  dangerouslySetInnerHTML={{ __html: captcha.question }}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#040f16] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                    placeholder="Type the symbols"
                    required
                  />
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="p-2 text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-500 bg-slate-800 border-slate-600 rounded focus:ring-teal-500 focus:ring-offset-slate-900"
                />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotScreen(true)}
                className="text-sm text-teal-400 hover:text-teal-300 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full glow-button py-3 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a1924] text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg hover:border-slate-500 hover:bg-slate-800 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-slate-300">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg hover:border-slate-500 hover:bg-slate-800 transition-all">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-slate-300">Facebook</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-teal-400 hover:text-teal-300 font-bold"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
