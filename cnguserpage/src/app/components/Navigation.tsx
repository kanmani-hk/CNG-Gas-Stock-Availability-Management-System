import { useState } from 'react';
import { Menu, X, Home, Map, Info, Phone, Settings, User } from 'lucide-react';

interface NavigationProps {
  onMenuItemClick?: (item: string) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export function Navigation({ onMenuItemClick, onLogout, isAuthenticated = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'stations', label: 'Find Stations', icon: Map },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  const handleMenuClick = (itemId: string) => {
    setIsMobileMenuOpen(false);
    onMenuItemClick?.(itemId);
  };

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    onLogout?.();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/10"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>

          );
        })}

        {isAuthenticated && (
          <>
            <button
              onClick={() => handleMenuClick('settings')}
              className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/10"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button
              onClick={() => handleMenuClick('profile')}
              className="flex items-center gap-2 text-primary hover:text-primary-foreground transition-colors px-3 py-2 rounded-lg hover:bg-primary/20 border border-primary/30 glow-button"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>


          </>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-slate-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>


      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a1924] shadow-2xl z-50 border-t border-slate-800">
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full flex items-center gap-3 text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors px-6 py-3 text-left"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>

              );
            })}

            {isAuthenticated && (
              <>
                <div className="border-t border-slate-800 my-2"></div>
                <button
                  onClick={() => handleMenuClick('settings')}
                  className="w-full flex items-center gap-3 text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors px-6 py-3 text-left"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
                <button
                  onClick={() => handleMenuClick('profile')}
                  className="w-full flex items-center gap-3 text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors px-6 py-3 text-left"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>


              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}