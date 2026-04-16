import React from 'react';
import { Bell, MapPin, Globe, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useT } from '../i18n';

export function SettingsPage() {
  const t = useT();
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('app_settings');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore and use defaults
    }
    return {
      notifications: true,
      locationTracking: true,
      autoRefresh: true,
      darkMode: false,
      units: 'metric',
      language: 'english',
      stockAlerts: true,
      priceAlerts: false,
    };
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };


  // Apply appearance and language immediately when changed
  useEffect(() => {
    // Dark mode: toggle .dark on the root element (theme.css supports .dark)
    try {
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // server-side or restricted environment
    }

    // Language: set document language attribute
    try {
      const map: Record<string, string> = {
        english: 'en',
        hindi: 'hi',
        marathi: 'mr',
        gujarati: 'gu',
        tamil: 'ta',
      };
      const lang = map[settings.language as string] || 'en';
      document.documentElement.lang = lang;
    } catch (e) {
      // ignore
    }
  }, [settings.darkMode, settings.language]);

  // Persist settings whenever they change and dispatch event so all components re-read
  useEffect(() => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      // Dispatch custom event so other components know settings changed
      window.dispatchEvent(new CustomEvent('app-settings-changed', { detail: settings }));
      // show brief saved confirmation when settings are persisted
      setSaved(true);
      const _id = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(_id);
    } catch (e) {
      // ignore
    }
  }, [settings]);

  return (
    // use the CSS variable driven background so dark mode can override it
    // tailwind utilities such as `bg-gray-50` were hard‑coding a light colour
    // which made the page appear unchanged when .dark was toggled.
    <div className="min-h-screen bg-[#040f16] font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{t('settings')}</h1>
          <p className="text-slate-400">{t('customize')}</p>
        </div>

        {/* Notifications Section */}
        <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-teal-900/30 border border-teal-800/50 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
              <div>
                <h3 className="font-semibold text-slate-200">{t('enableNotifications')}</h3>
                <p className="text-sm text-slate-400 mt-1">Receive updates about nearby stations</p>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#040f16] ${
                  settings.notifications ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
              <div>
                <h3 className="font-semibold text-slate-200">{t('stockAlerts')}</h3>
                <p className="text-sm text-slate-400 mt-1">Get notified when stock is low</p>
              </div>
              <button
                onClick={() => handleToggle('stockAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#040f16] ${
                  settings.stockAlerts ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.stockAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-semibold text-slate-200">{t('priceAlerts')}</h3>
                <p className="text-sm text-slate-400 mt-1">Notify when prices change</p>
              </div>
              <button
                onClick={() => handleToggle('priceAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#040f16] ${
                  settings.priceAlerts ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.priceAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Location & Privacy */}
        <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-emerald-900/30 border border-emerald-800/50 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Location & Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
              <div>
                <h3 className="font-semibold text-slate-200">Location Tracking</h3>
                <p className="text-sm text-slate-400 mt-1">Allow access to your location</p>
              </div>
              <button
                onClick={() => handleToggle('locationTracking')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#040f16] ${
                  settings.locationTracking ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.locationTracking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-semibold text-slate-200">Auto Refresh Data</h3>
                <p className="text-sm text-slate-400 mt-1">Automatically update station information</p>
              </div>
              <button
                onClick={() => handleToggle('autoRefresh')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#040f16] ${
                  settings.autoRefresh ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance & Language */}
        <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-cyan-900/30 border border-cyan-800/50 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Appearance & Language</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
              <div>
                <h3 className="font-semibold text-slate-200">{t('darkMode')}</h3>
                <p className="text-sm text-slate-400 mt-1">Enable dark theme (always active in this styling)</p>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#040f16] ${
                  settings.darkMode ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                {t('language')}
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-colors appearance-none"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="marathi">Marathi</option>
                <option value="gujarati">Gujarati</option>
                <option value="tamil">Tamil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                {t('distanceUnits')}
              </label>
              <select
                value={settings.units}
                onChange={(e) => handleChange('units', e.target.value)}
                className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-colors appearance-none"
              >
                <option value="metric">Kilometers (km)</option>
                <option value="imperial">Miles (mi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-amber-900/30 border border-amber-800/50 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Data Management</h2>
          </div>

          <div className="space-y-3">
            <button className="w-full px-4 py-4 border border-slate-700 bg-[#040f16] shadow-sm rounded-lg text-left hover:bg-slate-800 hover:border-slate-500 transition-colors group">
              <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">Clear Cache</h3>
              <p className="text-sm text-slate-400 mt-1">Remove temporary data</p>
            </button>

            <button className="w-full px-4 py-4 border border-slate-700 bg-[#040f16] shadow-sm rounded-lg text-left hover:bg-slate-800 hover:border-slate-500 transition-colors group">
              <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">Export Data</h3>
              <p className="text-sm text-slate-400 mt-1">Download your saved stations</p>
            </button>
          </div>
        </div>

        {/* Settings Auto-Save Notice */}
        <div className="flex justify-end">
          <div className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-3 ${
            saved
              ? 'bg-teal-900/40 text-teal-400 border border-teal-800/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
          >
            {saved ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Settings Applied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75" />
                </svg>
                Auto-saving...
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
