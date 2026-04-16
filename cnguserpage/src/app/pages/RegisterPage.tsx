import React from 'react';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Fuel, User, Phone, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (name: string, email: string, password: string, phone?: string, vehicleName?: string, vehicleType?: string, vehicleNumber?: string, captchaId?: string, captchaAnswer?: string) => any;
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onRegister, onNavigateToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleName: '',
    vehicleType: '',
    vehicleNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState({ id: '', question: '' });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (!captchaAnswer) {
      setError('Please answer the captcha');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    // Vehicle fields must be provided
    if (!formData.vehicleName || !formData.vehicleType || !formData.vehicleNumber) {
      setError('Please provide your vehicle name, type and vehicle number');
      return;
    }

    setIsLoading(true);

    try {
      const data = await onRegister(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.vehicleName,
        formData.vehicleType,
        formData.vehicleNumber,
        captcha.id,
        captchaAnswer
      );

      if (data && data.needsVerification) {
        setShowOtpScreen(true);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      fetchCaptcha();
      setCaptchaAnswer('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiBase}/auth/verify-otp`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Email verified successfully! You can now log in.');
        onNavigateToLogin();
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || 'http://localhost:5004/api';
      const response = await fetch(`${apiBase}/auth/resend-otp`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('A new OTP has been sent to your email.');
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Connection to server failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtpScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 font-sans text-slate-300 relative overflow-hidden">
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Verify Email</h1>
            <p className="text-teal-400 font-medium">Enter the 6-digit code sent to {formData.email}</p>
          </div>
          <div className="bg-[#0a1924]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>
            
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-4 text-center">Verification Code</label>
                <div className="flex justify-center mb-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full max-w-[280px] text-center text-4xl font-bold tracking-[1rem] py-4 bg-[#040f16] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-inner placeholder:text-slate-800 placeholder:tracking-normal"
                    placeholder="••••••"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">Enter the 6-digit code received via email</p>
              </div>
              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full glow-button py-3 rounded-lg font-bold disabled:bg-slate-700 disabled:text-slate-500 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                {verifyingOtp ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-teal-400 hover:text-teal-300 font-medium"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-300 text-center flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to registration
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans text-slate-300 relative overflow-hidden">
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
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">Create Account</h1>
          <p className="text-slate-400 font-medium">Join the premium CNG network</p>
        </div>

        {/* Register Form */}
        <div className="bg-[#0a1924]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name *
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Vehicle Information Section */}
            <div className="bg-[#040f16] border border-slate-700 p-4 rounded-xl mt-4 mb-2">
              <h3 className="font-semibold text-teal-400 mb-3 flex items-center gap-2">
                <Fuel className="w-5 h-5" />
                Vehicle Information *
              </h3>

              {/* Vehicle Name */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  name="vehicleName"
                  value={formData.vehicleName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0a1924] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                  placeholder="e.g., My Car"
                  required
                />
              </div>

              {/* Vehicle Type */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0a1924] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="CNG Car">CNG Car</option>
                  <option value="Auto-Rickshaw">Auto-Rickshaw</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vehicle Number/License Plate
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#0a1924] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                  placeholder="e.g., TN01AB1234"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password *
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? (
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
                  className="bg-white rounded-lg p-1 flex items-center justify-center h-12 overflow-hidden shadow-inner"
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

            {/* Terms and Conditions */}
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-1 text-teal-500 bg-slate-800 border-slate-600 rounded focus:ring-teal-500 focus:ring-offset-slate-900"
              />
              <span className="ml-2 text-sm text-slate-400">
                I agree to the{' '}
                <button type="button" className="text-teal-400 hover:text-teal-300 font-medium">
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button type="button" className="text-teal-400 hover:text-teal-300 font-medium">
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full glow-button py-3 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a1924] text-slate-500">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup Buttons */}
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

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-teal-400 hover:text-teal-300 font-bold"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
