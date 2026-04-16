import React from 'react';
import { Map, TrendingUp, Shield, Clock, MapPin, Users } from 'lucide-react';
import { useT } from '../i18n';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const t = useT();
  const features = [
    {
      icon: Map,
      title: 'Find Nearby Stations',
      description: 'Locate CNG stations near you with real-time availability',
      color: 'bg-teal-900/50 text-teal-400',
    },
    {
      icon: TrendingUp,
      title: 'Live Stock Updates',
      description: 'Check real-time gas stock levels before you visit',
      color: 'bg-emerald-900/50 text-emerald-400',
    },
    {
      icon: Clock,
      title: 'Operating Hours',
      description: 'View station timings and plan your visit accordingly',
      color: 'bg-cyan-900/50 text-cyan-400',
    },
    {
      icon: Shield,
      title: 'Verified Information',
      description: 'Accurate and up-to-date station information',
      color: 'bg-sky-900/50 text-sky-400',
    },
  ];

  const stats = [
    { label: 'Live Stations', value: '500+', icon: MapPin },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Cities Covered', value: '50+', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-[#040f16] text-slate-300 font-sans">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 animate-on-scroll">
        <div className="flex flex-col items-center text-center mb-12">
          {/* Logo Area removed as per user request to avoid duplication with header */}


          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight">
            Find CNG Stations
          </h2>
          <h2 className="text-5xl md:text-6xl font-extrabold text-teal-400 mb-6 tracking-tight">
            Near You, Right Now
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl mb-10 text-center">
            Real-time CNG availability tracking for customers, bunk operators, and administrators — all in one platform.
          </p>

          {/* Inline Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm font-medium animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-teal-500" />
                  <span className="text-white">{stat.value}</span>
                  <span className="text-slate-500">{stat.label}</span>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <button
              onClick={() => onNavigate('stations')}
              className="glow-button px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-105 transition-transform"
            >
              Find Stations Now
            </button>
          </div>

          {/* Hero Video/Image Container */}
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-teal-900/50 shadow-2xl relative shadow-[0_0_50px_rgba(20,184,166,0.1)] animate-on-scroll" style={{ transitionDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#040f16] via-transparent to-transparent z-10 pointer-events-none"></div>
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/hero-cng.png"
              className="w-full h-full object-cover opacity-80"
            >
              <source src="https://videos.pexels.com/video-files/5267786/5267786-hd_1920_1080_30fps.mp4" type="video/mp4" />
              {/* Fallback image if video fails to load */}
              <img
                src="/hero-cng.png"
                alt="CNG Station"
                className="w-full h-full object-cover"
              />
            </video>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-20 border-t border-slate-800/50 mt-10 animate-on-scroll">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Us</h2>
            <div className="w-20 h-1 bg-teal-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-[#0a1924] border border-slate-800 rounded-2xl p-6 hover:border-teal-900 transition-colors group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
