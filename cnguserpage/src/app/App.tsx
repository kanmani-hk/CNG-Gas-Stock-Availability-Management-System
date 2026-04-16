import React, { useEffect, useState } from 'react';
import { Fuel, MapPin } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { useAppSettings } from './hooks/useAppSettings';
import { useT } from './i18n';
import { api } from '../services/api';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { StationsPage } from './pages/StationsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ id: string; name: string; email: string; vehicle?: any } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [footerModal, setFooterModal] = useState<{ isOpen: boolean; title: string; type: 'terms' | 'privacy' | 'support' }>({
    isOpen: false,
    title: '',
    type: 'terms'
  });
  const appSettings = useAppSettings(); // Load and apply app settings globally
  const t = useT();

  // Live GPS tracking
  useEffect(() => {
    let watchId: number | null = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Error watching location:', error);
          setLocationError('Unable to get your location. Please enable location access.');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const refreshLocation = () => {
    // Manually trigger a one-time check if needed, but the watcher handles the rest
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  };

  // Apply saved app settings (theme/language) on startup
  useEffect(() => {
    try {
      const raw = localStorage.getItem('app_settings');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      const map: Record<string, string> = {
        english: 'en',
        hindi: 'hi',
        marathi: 'mr',
        gujarati: 'gu',
        tamil: 'ta',
      };
      document.documentElement.lang = map[s.language] || 'en';
    } catch (e) {
      // ignore
    }
  }, []);

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
  }, [currentPage]);

  // Restore current user from token on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('cng_auth_token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token is still valid and get user info (skip for offline tokens)
      if (!storedToken.startsWith('offline_')) {
        api.getMe(storedToken)
          .then((user) => {
            setIsAuthenticated(true);
            setUserInfo({ id: user._id, name: user.name, email: user.email, vehicle: user.vehicle });
            setCurrentPage('home');
          })
          .catch((err) => {
            console.error('Token validation failed:', err);
            // For offline tokens, keep user logged in
            if (storedToken.startsWith('offline_')) {
              const offlineEmail = localStorage.getItem('cng_offline_email');
              if (offlineEmail) {
                const users = JSON.parse(localStorage.getItem('cng_users') || '{}');
                const user = users[offlineEmail];
                if (user) {
                  setIsAuthenticated(true);
                  setUserInfo({ id: 'offline', name: user.name, email: user.email });
                  setCurrentPage('home');
                }
              }
            } else {
              localStorage.removeItem('cng_auth_token');
              setToken(null);
            }
          });
      } else {
        // Offline mode: restore from localStorage
        const offlineEmail = localStorage.getItem('cng_offline_email');
        if (offlineEmail) {
          const users = JSON.parse(localStorage.getItem('cng_users') || '{}');
          const user = users[offlineEmail];
          if (user) {
            setIsAuthenticated(true);
            setUserInfo({ id: 'offline', name: user.name, email: user.email });
            setCurrentPage('home');
          }
        }
      }
    }
  }, []);

  const handleLogin = async (email: string, password: string, captchaId?: string, captchaAnswer?: string) => {
    try {
      // Allow demo account without API call
      if (email === 'demo@example.com') {
        setIsAuthenticated(true);
        setUserInfo({ id: 'demo', name: 'Demo User', email });
        localStorage.setItem('cng_auth_token', 'offline_demo');
        localStorage.setItem('cng_offline_email', email);
        setCurrentPage('home');
        return;
      }

      const result = await api.login(email, password, captchaId, captchaAnswer);
      if (result.token) {
        localStorage.setItem('cng_auth_token', result.token);
        localStorage.setItem('cng_offline_email', email);
        setToken(result.token);
        setIsAuthenticated(true);
        setUserInfo({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          vehicle: result.user.vehicle,
        });
        setCurrentPage('home');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
      throw error;
    }
  };

  const handleRegister = async (name: string, email: string, password: string, phone?: string, vehicleName?: string, vehicleType?: string, vehicleNumber?: string, captchaId?: string, captchaAnswer?: string) => {
    try {
      const result = await api.register(name, email, password, phone, vehicleName, vehicleType, vehicleNumber, captchaId, captchaAnswer);
      if (result.token) {
        localStorage.setItem('cng_auth_token', result.token);
        localStorage.setItem('cng_offline_email', email);
        setToken(result.token);
        setIsAuthenticated(true);
        setUserInfo({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          vehicle: result.user.vehicle,
        });
        setCurrentPage('home');
      }
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem('cng_auth_token');
    setToken(null);
    setCurrentPage('login');
  };

  const handleMenuItemClick = (item: string) => {
    // Check if page requires authentication
    if (['profile', 'settings'].includes(item) && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(item);
  };

  // Show login/register pages if not authenticated
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateToRegister={() => setCurrentPage('register')}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'stations':
        return <StationsPage userInfo={userInfo} token={token} userLocation={userLocation} refreshLocation={refreshLocation} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return (
          <ProfilePage
            userInfo={userInfo}
            token={token}
            onLogout={handleLogout}
            onProfileUpdate={(updatedUser) => setUserInfo(prev => ({ ...prev, ...updatedUser }))}
          />
        );
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-background">
      {/* Header - Only show on non-stations pages */}
      {currentPage !== 'stations' && (
        <header className="bg-[#0a1924] border-b border-slate-800 text-white shadow-xl relative z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* put title in a flex-1 container so it sits centered between nav and left edge */}
              <div className="flex-1 flex justify-start">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-lg border border-teal-500/30">
                    <img src="/images/logo.png" alt="CNG Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-xl font-bold tracking-tight text-white hover:text-teal-400 transition-colors">CNG Finder</h1>
                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider text-left">Real-time Monitoring</p>
                  </div>
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="flex items-center gap-4">
                {userLocation && currentPage === 'home' && (
                  <div className="hidden sm:flex items-center gap-2 bg-[#040f16] border border-slate-700 text-teal-400 px-3 py-2 rounded-lg text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    <span>{t('locationEnabled')}</span>
                  </div>
                )}
                <Navigation
                  onMenuItemClick={handleMenuItemClick}
                  onLogout={handleLogout}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* For stations page, include header within the page */}
      {currentPage === 'stations' && (
        <header className="bg-[#0a1924] border-b border-slate-800 text-white shadow-xl relative z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-start">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-lg border border-teal-500/30">
                    <img src="/images/logo.png" alt="CNG Finder Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-xl font-bold tracking-tight text-white hover:text-teal-400 transition-colors">CNG Finder</h1>
                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider text-left">Real-time Monitoring</p>
                  </div>
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="flex items-center gap-4">
                {userLocation && (
                  <div className="hidden sm:flex items-center gap-2 bg-[#040f16] border border-slate-700 text-teal-400 px-3 py-2 rounded-lg text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    <span>{t('locationEnabled')}</span>
                  </div>
                )}
                <Navigation
                  onMenuItemClick={handleMenuItemClick}
                  onLogout={handleLogout}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1924] border-t border-slate-800 py-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="CNG Finder Logo" className="w-5 h-5 object-contain opacity-50" />
            <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">CNG Finder</span>
          </div>
          <p className="text-slate-600 text-[10px] font-medium">&copy; 2026 CNG Finder. Real-time stock & price monitoring.</p>
          <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold">
            <button
              onClick={() => setFooterModal({ isOpen: true, title: 'Terms of Service', type: 'terms' })}
              className="hover:text-teal-400 transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => setFooterModal({ isOpen: true, title: 'Privacy Policy', type: 'privacy' })}
              className="hover:text-teal-400 transition-colors"
            >
              Privacy
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
          <div className="relative bg-[#0a1924] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <img src="/images/logo.png" alt="CNG Finder Logo" className="w-6 h-6 object-contain" />
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

            <div className="p-8 overflow-y-auto text-slate-300 space-y-4">
              {footerModal.type === 'terms' && (
                <>
                  <p className="font-bold text-teal-400">1. Acceptance of Terms</p>
                  <p>By accessing CNG Finder, you agree to comply with our operational standards and booking protocols. We provide real-time fuel metrics for informational purposes.</p>
                  <p className="font-bold text-teal-400">2. Booking Rules</p>
                  <p>Slots booked are subject to station availability. Bunk administrators reserve the right to prioritize emergency services or manage flow based on actual stock levels.</p>
                  <p className="font-bold text-teal-400">3. Data Accuracy</p>
                  <p>While we strive for 100% accuracy, real-time stock levels are reported by stations and may have slight variances during peak replenishment cycles.</p>
                </>
              )}
              {footerModal.type === 'privacy' && (
                <>
                  <p className="font-bold text-teal-400">1. Data Collection</p>
                  <p>We securely collect vehicle numbers and driver emails specifically for the booking notification process. Location data is used only for distance calculations and is not stored permanently.</p>
                  <p className="font-bold text-teal-400">2. Real-time Processing</p>
                  <p>Your email is used to send automated status updates (Pending, Confirmed, Completed, Cancelled). We never share your contact details with external third-party advertisers.</p>
                  <p className="font-bold text-teal-400">3. Security</p>
                  <p>All platform communication is encrypted via SSL to ensure that your private information remains confidential within the CNG Ecosystem Network.</p>
                </>
              )}
              {footerModal.type === 'support' && (
                <>
                  <p className="font-bold text-teal-400">Technical Assistance</p>
                  <p>If you encounter issues with the live map or booking system, please contact our network operations center at <span className="text-white">support@cngfinder.com</span>.</p>
                  <p className="font-bold text-teal-400">Bunk Admin Support</p>
                  <p>Bunk owners requiring onboarding assistance or hardware integration for stock monitoring can reach our partner portal team through the profile dashboard.</p>
                  <div className="bg-teal-900/10 border border-teal-500/20 p-4 rounded-xl mt-6">
                    <p className="text-sm italic">Emergency? Please contact your local state fuel board or the nearest CNG replenishment center directly.</p>
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