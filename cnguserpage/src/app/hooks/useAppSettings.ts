import { useEffect, useState } from 'react';

export interface AppSettings {
  notifications: boolean;
  locationTracking: boolean;
  autoRefresh: boolean;
  darkMode: boolean;
  units: 'metric' | 'imperial';
  language: string;
  stockAlerts: boolean;
  priceAlerts: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  locationTracking: true,
  autoRefresh: true,
  darkMode: false,
  units: 'metric',
  language: 'english',
  stockAlerts: true,
  priceAlerts: false,
};

export function useAppSettings(): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings on mount and listen for changes
  useEffect(() => {
    const loadSettings = () => {
      try {
        const raw = localStorage.getItem('app_settings');
        if (raw) {
          const s = JSON.parse(raw);
          setSettings(s);
          applySettings(s);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };

    loadSettings();

    // Listen for settings changes from other components
    const handleSettingsChange = (e: Event) => {
      const evt = e as CustomEvent;
      if (evt.detail) {
        setSettings(evt.detail);
        applySettings(evt.detail);
      }
    };

    window.addEventListener('app-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('app-settings-changed', handleSettingsChange);
  }, []);

  return settings;
}

function applySettings(settings: AppSettings) {
  try {
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply language
    const langMap: Record<string, string> = {
      english: 'en',
      hindi: 'hi',
      marathi: 'mr',
      gujarati: 'gu',
      tamil: 'ta',
    };
    document.documentElement.lang = langMap[settings.language] || 'en';

    // Store units in sessionStorage so all components can access it
    sessionStorage.setItem('app_units', settings.units);
  } catch (e) {
    // ignore
  }
}
