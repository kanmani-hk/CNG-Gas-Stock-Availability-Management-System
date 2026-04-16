import { useState, useEffect, FormEvent } from 'react';
import { Users } from 'lucide-react';
import { CustomerView } from './components/CustomerView';
import { BunkAdminView } from './components/BunkAdminView';
import { adminApi, Station } from './services/api';

interface BunkData {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  stockLevel: number;
  maxCapacity: number;
  lastUpdated: string;
  status: 'available' | 'low' | 'out-of-stock';
  price: number;
  operatingHours: string;
  pumpStatus?: string;
  waitingTime?: number;
  bookings?: any[];
  dailySales?: any[];
}


function updateStockStatus(stockLevel: number, maxCapacity: number): 'available' | 'low' | 'out-of-stock' {
  const percentage = (stockLevel / maxCapacity) * 100;
  if (percentage === 0) return 'out-of-stock';
  if (percentage < 30) return 'low';
  return 'available';
}

function mapStationToBunk(s: Station): BunkData {
  const maxCapacity = 1000;
  return {
    id: s._id,
    name: s.name,
    location: s.address,
    lat: s.lat || 0,
    lng: s.lng || 0,
    stockLevel: s.stockLevel,
    maxCapacity,
    lastUpdated: s.lastUpdated || 'Just now',
    status: updateStockStatus(s.stockLevel, maxCapacity),
    price: s.pricePerKg,
    operatingHours: s.operatingHours || '24/7',
    pumpStatus: s.pumpStatus || 'free',
    waitingTime: s.waitingTime || 0,
    bookings: s.bookings || [],
    dailySales: s.dailySales || [],
  };
}


export default function App() {
  const [view, setView] = useState<'customer' | 'admin'>('customer');
  const [allBunks, setAllBunks] = useState<BunkData[]>([]);
  const [myBunk, setMyBunk] = useState<BunkData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('');

  // Global scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const observerInterval = setInterval(() => {
      document.querySelectorAll('.animate-on-scroll:not(.is-observed)').forEach((el) => {
        el.classList.add('is-observed');
        observer.observe(el);
      });
    }, 500);

    return () => {
      clearInterval(observerInterval);
      observer.disconnect();
    };
  }, []);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [footerModal, setFooterModal] = useState<{ isOpen: boolean; title: string; type: 'guide' | 'support' }>({
    isOpen: false,
    title: '',
    type: 'guide'
  });

  // Auth mode
  const [isRegistering, setIsRegistering] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [pendingAdminName, setPendingAdminName] = useState('');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form — admin details
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Registration form — bunk details
  const [bunkName, setBunkName] = useState('');
  const [bunkAddress, setBunkAddress] = useState('');
  const [bunkLat, setBunkLat] = useState('');
  const [bunkLng, setBunkLng] = useState('');
  const [bunkPrice, setBunkPrice] = useState('');
  const [bunkHours, setBunkHours] = useState('24/7');

  const [regError, setRegError] = useState<string | null>(null);

  // OTP and Captcha
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [captcha, setCaptcha] = useState({ id: '', question: '' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isVerifyingLogin, setIsVerifyingLogin] = useState(false);

  // Forgot Password state
  const [showForgotScreen, setShowForgotScreen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchCaptcha = async () => {
    try {
      const data = await adminApi.getCaptcha();
      setCaptcha({ id: data.captchaId, question: data.question });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (view === 'admin' && !token) {
      fetchCaptcha();
    }
  }, [view, token]);

  // Restore token on mount
  useEffect(() => {
    const stored = localStorage.getItem('cng_admin_token');
    const storedName = localStorage.getItem('cng_admin_name');
    const storedEmail = localStorage.getItem('cng_admin_email');
    const storedPhone = localStorage.getItem('cng_admin_phone');
    if (stored) {
      setToken(stored);
      if (storedName) setAdminName(storedName);
      if (storedEmail) setAdminEmail(storedEmail);
      if (storedPhone) setAdminPhone(storedPhone);
    }
  }, []);

  // Load all stations for customer view
  useEffect(() => {
    async function loadAll(silent = false) {
      try {
        const stations = await adminApi.getAllStations();
        setAllBunks(stations.map(mapStationToBunk));
      } catch (err) {
        if (!silent) console.error('Failed to load stations', err);
      }
    }
    loadAll();
    const interval = setInterval(() => loadAll(true), 5000); // 5s silent update for customer view
    return () => clearInterval(interval);
  }, [token]);

  // Load admin's own station when logged in
  useEffect(() => {
    if (!token) {
      setMyBunk(null);
      return;
    }
    async function loadMyStation(silent = false) {
      try {
        const station = await adminApi.getMyStation(token!);
        setMyBunk(mapStationToBunk(station));
      } catch (err: any) {
        if (!silent) console.error('Failed to load my station', err);
        // If 401/403, the token is likely invalid — clear it so user sees login
        if (!silent && (err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('token'))) {
          handleLogout();
        } else if (!silent) {
          setMyBunk(null);
        }
      }
    }
    loadMyStation();
    const interval = setInterval(() => loadMyStation(true), 5000); // 5s automatic polling for real-time bookings
    return () => clearInterval(interval);
  }, [token]);

  // ─── Handlers ─────────────────────────────────────────────
  
  const handleProfileUpdate = async (data: { name?: string; phone?: string; newPassword?: string }) => {
    if (!token) return;
    const result = await adminApi.updateMyProfile(token, data);
    
    // Update local state if successful
    if (result.user) {
       setAdminName(result.user?.name || '');
      setAdminEmail(result.user?.email || '');
      setAdminPhone(result.user?.phone || '');
      localStorage.setItem('cng_admin_token', result.token);
      localStorage.setItem('cng_admin_name', result.user?.name || '');
      localStorage.setItem('cng_admin_email', result.user?.email || '');
      localStorage.setItem('cng_admin_phone', result.user?.phone || '');
    }
  };
  const handleUpdateStation = async (bunkId: string, updates: Partial<BunkData>) => {
    if (!token) return;
    try {
      const apiUpdates: any = { ...updates };
      if (updates.price) apiUpdates.pricePerKg = updates.price;
      if (updates.location) apiUpdates.address = updates.location;

      const updated = await adminApi.updateStation(token, bunkId, apiUpdates);
      setMyBunk(mapStationToBunk(updated));
      setAllBunks((prev) =>
        prev.map((b) => (b.id === bunkId ? mapStationToBunk(updated) : b))
      );
    } catch (err) {
      alert((err as Error).message || 'Failed to update station');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    if (!token || !myBunk) return;
    try {
      const updated = await adminApi.updateBookingStatus(token, myBunk.id, bookingId, status);
      setMyBunk(mapStationToBunk(updated));
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const handleAddDailySales = async (date: string, amount: number, stockSold: number) => {
    if (!token || !myBunk) return;
    try {
      const updated = await adminApi.addDailySales(token, myBunk.id, date, amount, stockSold);
      setMyBunk(mapStationToBunk(updated));
    } catch (err: any) {
      alert(err.message || 'Failed to save sales report');
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!captchaAnswer) {
      setLoginError('Please answer the security check');
      return;
    }

    setIsVerifyingLogin(true);
    try {
      const result = await adminApi.login(email.toLowerCase(), password, captcha.id, captchaAnswer);

      localStorage.setItem('cng_admin_token', result.token);
      localStorage.setItem('cng_admin_name', result.user?.name || '');
      localStorage.setItem('cng_admin_email', result.user?.email || '');
      localStorage.setItem('cng_admin_phone', result.user?.phone || '');
      setToken(result.token);
      setAdminName(result.user?.name || '');
      setAdminEmail(result.user?.email || '');
      setAdminPhone(result.user?.phone || '');
      if (result.station) setMyBunk(mapStationToBunk(result.station));
    } catch (err) {
      setLoginError((err as Error).message);
      fetchCaptcha();
    } finally {
      setIsVerifyingLogin(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError('Invalid email format');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(regPassword)) {
      setRegError('Password must have Uppercase, Lowercase, Number and Special char');
      return;
    }

    if (!bunkName || !bunkAddress || !bunkLat || !bunkLng || !bunkPrice) {
      setRegError('All bunk details are required');
      return;
    }

    try {
      const result = await adminApi.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        bunkName,
        bunkAddress,
        bunkLat: parseFloat(bunkLat),
        bunkLng: parseFloat(bunkLng),
        bunkPrice: parseFloat(bunkPrice),
        bunkOperatingHours: bunkHours,
        captchaId: captcha.id,
        captchaAnswer: captchaAnswer,
      });


      if (result.needsVerification) {
        setShowOtpScreen(true);
        return;
      }

      if (result.status === 'pending') {
        setPendingAdminName(regName);
        setPendingApproval(true);
        return;
      }

      if (result.token) {
        localStorage.setItem('cng_admin_token', result.token);
        localStorage.setItem('cng_admin_name', result.user?.name || '');
        localStorage.setItem('cng_admin_email', result.user?.email || '');
        localStorage.setItem('cng_admin_phone', result.user?.phone || '');
        setToken(result.token);
        setAdminName(result.user?.name || '');
        setAdminEmail(result.user?.email || '');
        setAdminPhone(result.user?.phone || '');
        if (result.station) setMyBunk(mapStationToBunk(result.station));
      }
    } catch (err) {
      setRegError((err as Error).message);
    }
  };
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (otp.length !== 6) {
      setRegError('Enter 6-digit OTP');
      return;
    }
    setVerifyingOtp(true);
    try {
      await adminApi.verifyOtp(regEmail, otp);
      alert('Email verified! Awaiting Super Admin approval.');
      setPendingAdminName(regName);
      setPendingApproval(true);
      setShowOtpScreen(false);
    } catch (err) {
      setRegError((err as Error).message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setRegError(null);
    try {
      await adminApi.resendOtp(regEmail);
      alert('A new OTP has been sent to your email.');
    } catch (err) {
      setRegError((err as Error).message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    localStorage.removeItem('cng_admin_token');
    localStorage.removeItem('cng_admin_name');
    localStorage.removeItem('cng_admin_email');
    localStorage.removeItem('cng_admin_phone');
    setMyBunk(null);
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);
    try {
      if (!captchaAnswer) {
        setForgotError('Please answer the security check');
        return;
      }
      const result = await adminApi.forgotPassword(forgotEmail, captcha.id, captchaAnswer);
      setForgotMessage(result.message);
      setShowResetScreen(true);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset code');
      fetchCaptcha();
    }

  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters');
      return;
    }
    try {
      await adminApi.resetPassword({
        email: forgotEmail,
        otp: resetOtp,
        newPassword
      });
      alert('Password reset successfully! You can now login.');
      setShowForgotScreen(false);
      setShowResetScreen(false);
    } catch (err) {
      setForgotError((err as Error).message);
    }
  };

  // ─── Render Admin Area ────────────────────────────────────

  const renderAdminArea = () => {
    if (!token) {
      // ─── OTP Verification Screen ───────────────────────
      if (showOtpScreen) {
        return (
          <div className="min-h-screen flex items-center justify-center font-sans tracking-tight relative">
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

            <form onSubmit={handleVerifyOtp} className="relative z-10 bg-[#0a1924]/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/10 p-8 w-full max-w-md text-center space-y-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>
              <div className="inline-flex items-center justify-center w-20 h-20 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-2 shadow-xl overflow-hidden">
                <img src="/images/logo.png" alt="CNG Finder Logo" className="w-12 h-12 object-contain animate-float" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Verify Your Email</h2>
              <p className="text-slate-300 font-medium">Enter the 6-digit code sent to {regEmail}</p>
              {regError && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 p-2 rounded-lg">{regError}</p>}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full max-w-[320px] bg-[#040f16] text-white border border-slate-700 text-center text-4xl font-bold tracking-[0.75rem] py-4 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-inner placeholder:text-slate-800 placeholder:tracking-normal"
                    placeholder="••••••"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500">6-digit numerical verification code</p>
              </div>
              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full glow-button py-3 rounded-lg font-bold disabled:bg-slate-700 disabled:text-slate-500 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="text-sm text-slate-500 hover:text-teal-400 transition-colors"
              >
                Back to registration
              </button>
            </form>
          </div>
        );
      }

      // ─── Pending Approval Screen ────────────────────────
      if (pendingApproval) {
        return (
          <div className="min-h-screen flex items-center justify-center font-sans tracking-tight relative">
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#040f16] via-transparent to-[#040f16]/80 z-0"></div>

            <div className="relative z-10 bg-[#0a1924]/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/10 p-8 w-full max-w-md text-center space-y-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>
              <div className="inline-flex items-center justify-center w-24 h-24 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl mb-4 shadow-xl overflow-hidden">
                <img src="/images/logo.png" alt="CNG Finder Logo" className="w-16 h-16 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                <p className="text-slate-400">
                  Hi <strong className="text-teal-400">{pendingAdminName}</strong>, your bunk registration has been verified.
                </p>
              </div>
              <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-bold text-amber-400">⏳ Awaiting Super Admin Approval</p>
                <p className="text-sm text-amber-200/80">
                  Your bunk details are being reviewed by the Super Admin. This process typically takes 24 hours.
                  Once approved, you can log in and start managing your station.
                </p>
              </div>
              <button
                onClick={() => { setPendingApproval(false); setIsRegistering(false); }}
                className="w-full glow-button py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                Go to Login
              </button>
            </div>
          </div>
        );
      }

      // ─── Registration Form ──────────────────────────────
      if (isRegistering) {
        return (
          <div className="min-h-screen flex items-center justify-center py-12 font-sans tracking-tight relative">
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#040f16] via-transparent to-[#040f16]/80 z-0"></div>

            <form
              onSubmit={handleRegister}
              className="relative z-10 bg-[#0a1924]/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/10 p-8 w-full max-w-2xl space-y-4"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>

              <div className="text-center mb-10 pt-4">
                <div className="inline-flex items-center justify-center w-20 h-20 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-4 shadow-xl overflow-hidden">
                  <img src="/images/logo.png" alt="CNG Finder Logo" className="w-12 h-12 object-contain animate-float" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                  Bunk Registration
                </h2>
                <p className="text-slate-400 font-medium mt-1">
                  Create your station operator account
                </p>
              </div>

              {regError && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 p-2 rounded-lg">{regError}</p>
              )}

              {/* Admin Details Section */}
              <div className="border-t border-slate-800/80 pt-4">
                <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2"><span className="text-teal-400">👤</span> Your Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="admin@example.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                    <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
                    <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="Min 6 characters" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password *</label>
                    <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="Re-enter password" required />
                  </div>
                </div>
              </div>

              {/* Bunk Details Section */}
              <div className="border-t border-slate-800/80 pt-4">
                <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2"><span className="text-teal-400">⛽</span> Your Bunk Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bunk Name *</label>
                    <input type="text" value={bunkName} onChange={(e) => setBunkName(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="e.g., Sri Murugan CNG Station" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bunk Address *</label>
                    <input type="text" value={bunkAddress} onChange={(e) => setBunkAddress(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="Full address with city, state, PIN" required />
                  </div>
                  <div className="col-span-2 flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                    <label className="block text-sm font-bold text-teal-400">Station Accuracy (GPS) *</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setBunkLat(pos.coords.latitude.toString());
                              setBunkLng(pos.coords.longitude.toString());
                              alert("Location captured from GPS!");
                            },
                            (err) => alert('Error getting location: ' + err.message)
                          );
                        } else {
                          alert('Geolocation not supported');
                        }
                      }}
                      className="text-[10px] uppercase tracking-widest text-teal-400 border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 rounded-lg hover:bg-teal-500/20 transition-all font-bold"
                    >
                      Get Exact Coordinates from GPS
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Latitude *</label>
                    <input type="number" step="any" value={bunkLat} onChange={(e) => setBunkLat(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="e.g., 11.0168" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Longitude *</label>
                    <input type="number" step="any" value={bunkLng} onChange={(e) => setBunkLng(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="e.g., 76.9558" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Price ₹/kg *</label>
                    <input type="number" step="0.25" value={bunkPrice} onChange={(e) => setBunkPrice(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="e.g., 75.00" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Operating Hours</label>
                    <input type="text" value={bunkHours} onChange={(e) => setBunkHours(e.target.value)}
                      className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors" placeholder="e.g., 24/7" />
                  </div>
                </div>
              </div>

              {/* Security Check Section */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="bg-teal-900/10 p-4 rounded-xl border border-teal-800/20">
                  <label className="block text-sm font-bold text-teal-400 mb-3 text-left">
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
                        className="flex-1 px-3 py-2 bg-[#040f16] text-white border border-teal-800/30 rounded-lg outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                        placeholder="Type the symbols"
                        required
                      />
                      <button
                        type="button"
                        onClick={fetchCaptcha}
                        className="p-2 text-teal-500 hover:bg-teal-500/10 rounded-lg transition-all"
                        title="Refresh Captcha"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit"
                className="w-full glow-button py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)] mt-4">
                Register & Create My Bunk
              </button>

              <p className="text-sm text-center text-slate-400">
                Already have an account?{' '}
                <button type="button" onClick={() => { setIsRegistering(false); setRegError(null); setCaptchaAnswer(''); fetchCaptcha(); }}
                  className="text-teal-400 hover:text-teal-300 transition-colors font-bold">
                  Login here
                </button>

              </p>
            </form>
          </div>
        );
      }

      // ─── Forgot Password Screen ───────────────────────
      if (showForgotScreen) {
        return (
          <div className="min-h-screen flex items-center justify-center font-sans tracking-tight relative font-sans">
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#040f16] via-transparent to-[#040f16]/80 z-0"></div>

            <div className="relative z-10 bg-[#0a1924]/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/10 p-8 w-full max-w-md space-y-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-4 shadow-xl overflow-hidden">
                  <img src="/images/logo.png" alt="CNG Finder Logo" className="w-12 h-12 object-contain animate-float" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Reset Password</h2>
              </div>

              {forgotError && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 p-3 rounded-lg">{forgotError}</p>}
              {forgotMessage && <p className="text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800/40 p-3 rounded-lg">{forgotMessage}</p>}

              {!showResetScreen ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <p className="text-slate-400 text-sm">Enter your email to receive a 6-digit reset code.</p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 text-white rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                  <div className="bg-teal-900/10 p-4 rounded-xl border border-teal-800/20">
                    <label className="block text-sm font-bold text-teal-400 mb-3 text-left">
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
                          className="flex-1 px-3 py-2 bg-[#040f16] text-white border border-teal-800/30 rounded-lg outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                          placeholder="Type symbols"
                          required
                        />
                        <button
                          type="button"
                          onClick={fetchCaptcha}
                          className="p-2 text-teal-500 hover:bg-teal-500/10 rounded-lg transition-all"
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
                    className="w-full glow-button py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                  >
                    Send Reset Code
                  </button>

                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <input
                    type="text"
                    value={resetOtp}
                    maxLength={6}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="6-digit reset code"
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 text-white rounded-lg text-center tracking-widest text-2xl focus:outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New strong password"
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 text-white rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full glow-button py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                  >
                    Update Password
                  </button>
                </form>
              )}

              <button
                onClick={() => { setShowForgotScreen(false); setShowResetScreen(false); }}
                className="w-full text-sm text-slate-400 hover:text-teal-400 transition-colors text-center"
              >
                Back to login
              </button>
            </div>
          </div>
        );
      }

      // ─── Login Form ─────────────────────────────────────
      return (
        <div className="min-h-screen flex items-center justify-center font-sans tracking-tight relative font-sans">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#040f16] via-transparent to-[#040f16]/80 z-0"></div>

          <form
            onSubmit={handleLogin}
            className="relative z-10 bg-[#0a1924]/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/10 p-8 w-full max-w-sm space-y-5"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 animate-gradient-x"></div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-4 shadow-xl overflow-hidden">
                <img src="/images/logo.png" alt="CNG Finder Logo" className="w-12 h-12 object-contain animate-float" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                Admin Access
              </h2>
              <p className="text-slate-400 font-medium mt-1">Sign in to manage your bunk</p>
            </div>
            {loginError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 p-3 rounded-lg">{loginError}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-teal-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#040f16] border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-teal-500 transition-colors" required />
            </div>

            <div className="bg-teal-900/20 p-4 rounded-xl border border-teal-800/40">
              <label className="block text-sm font-bold text-teal-400 mb-3 text-left">
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
                    className="flex-1 px-3 py-2 bg-[#040f16] text-white border border-teal-800/50 rounded-lg outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                    placeholder="Type the symbols"
                    required
                  />
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="p-2 text-teal-500 hover:bg-teal-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isVerifyingLogin}
              className="w-full glow-button py-3 rounded-lg font-bold disabled:bg-slate-700 disabled:text-slate-500 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              {isVerifyingLogin ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-right">
              <button type="button" onClick={() => { setShowForgotScreen(true); setLoginError(null); setCaptchaAnswer(''); fetchCaptcha(); }}
                  className="text-teal-400 hover:text-teal-300 transition-colors font-bold text-sm">
                  Forgot password?
                </button>

            </div>

            <div className="border-t border-slate-800 pt-4 mt-2">
              <div className="text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <button type="button" onClick={() => { setIsRegistering(true); setRegError(null); setCaptchaAnswer(''); fetchCaptcha(); }}
                  className="text-teal-400 hover:text-teal-300 transition-colors font-bold">
                  Register here
                </button>
              </p>
            </div>
            </div>
          </form>
        </div>
      );
    }

    // ─── Logged In — Show Admin's Own Bunk ────────────────
    return (
      <BunkAdminView
        bunk={myBunk}
        adminName={adminName}
        adminEmail={adminEmail}
        adminPhone={adminPhone}
        onUpdateStation={handleUpdateStation}
        onUpdateProfile={handleProfileUpdate}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onAddDailySales={handleAddDailySales}
        onLogout={handleLogout}
      />
    );
  };

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#040f16] font-sans tracking-tight flex flex-col overflow-x-auto">
      {/* Standard Header Branding */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-lg border border-teal-500/30 bg-[#0a1924]">
          <img src="/images/logo.png" alt="CNG Finder Logo" className="w-full h-full object-contain" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-white tracking-tight">CNG Finder</h1>
          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Real-time Monitoring</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-[#0a1924] border border-slate-800/80 rounded-xl shadow-2xl p-1">
        <button
          onClick={() => setView('customer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-bold text-sm ${view === 'customer'
            ? 'bg-teal-500 text-[#040f16]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          <Users size={18} />
          Customer
        </button>
        <button
          onClick={() => setView('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-bold text-sm ${view === 'admin'
            ? 'bg-teal-500 text-[#040f16]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          Bunk Admin
        </button>
      </div>

      {view === 'customer' ? (
        <CustomerView bunks={allBunks} />
      ) : (
        renderAdminArea()
      )}

      {/* Footer */}
      <footer className="bg-[#0a1924] border-t border-slate-800 py-6 px-6 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="CNG Finder Logo" className="w-6 h-6 object-contain opacity-70" />
            <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">CNG Finder</span>
          </div>
          <p className="text-slate-600 text-[10px] font-medium">&copy; 2026 CNG Finder. Real-time stock & price monitoring.</p>
          <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold">
            <button 
              onClick={() => setFooterModal({ isOpen: true, title: 'Admin Guide', type: 'guide' })}
              className="hover:text-teal-400 transition-colors"
            >
              Admin Guide
            </button>
            <button 
              onClick={() => setFooterModal({ isOpen: true, title: 'Network Support', type: 'support' })}
              className="hover:text-teal-400 transition-colors"
            >
              Support
            </button>
          </div>
        </div>
      </footer>

      {/* Footer Modals */}
      {footerModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFooterModal({ ...footerModal, isOpen: false })}></div>
          <div className="relative bg-[#0a1924] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                {footerModal.title}
              </h2>
              <button 
                onClick={() => setFooterModal({ ...footerModal, isOpen: false })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto text-slate-300 space-y-6">
              {footerModal.type === 'guide' && (
                <>
                  <div>
                    <p className="font-bold text-teal-400 mb-2">1. Stock Management</p>
                    <p>Update your stock levels in real-time under the "Station Info" tab. Our system automatically alerts users when your stock drops below 30% capacity.</p>
                  </div>
                  <div>
                    <p className="font-bold text-teal-400 mb-2">2. Booking Processing</p>
                    <p>Manage driver reservations in the "Bookings" tab. You can update statuses between Confirmed, Completed, or Cancelled. Automated emails are sent to drivers for every action you take.</p>
                  </div>
                  <div>
                    <p className="font-bold text-teal-400 mb-2">3. Daily Sales Logs</p>
                    <p>Record your daily transactions in the "Sales" tab to track revenue. This data is used only for your internal reporting and help in automated stock deduction calculations.</p>
                  </div>
                </>
              )}
              {footerModal.type === 'support' && (
                <>
                  <div>
                    <p className="font-bold text-teal-400 mb-2">Operator Support</p>
                    <p>For technical issues related to the Admin Dashboard or API connectivity, contact our enterprise support team at <span className="text-white">admin-ops@cngfinder.com</span>.</p>
                  </div>
                  <div>
                    <p className="font-bold text-teal-400 mb-2">Account Verification</p>
                    <p>New station registrations require Super Admin approval. If your status is "Pending Approval" for more than 24 hours, please reach out with your station ID.</p>
                  </div>
                  <div className="bg-teal-900/10 border border-teal-500/20 p-4 rounded-xl">
                    <p className="text-sm italic">Note: Never share your admin password or verification OTPs with anyone, including staff claiming to be from CNG Finder support.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}