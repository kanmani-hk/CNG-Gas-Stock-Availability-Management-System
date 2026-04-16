import React from 'react';
import { Target, Eye, Users, Award, Zap, Heart } from 'lucide-react';

export function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology for real-time updates',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a network of stations and users',
    },
    {
      icon: Heart,
      title: 'Reliability',
      description: 'Providing accurate and trustworthy information',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering the best user experience',
    },
  ];

  const team = [
    { name: 'Sailesh', role: 'Founder & CEO', initials: 'SS' },
    { name: 'Divya', role: 'HR', initials: 'SD' },
    { name: 'Udhaya Kumar', role: 'Developer', initials: 'UK' },
    { name: 'Kanmani', role: 'Product Manager', initials: 'KM' },
  ];

  return (
    <div className="min-h-screen bg-[#040f16] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-sans tracking-tight text-white mb-4">About Us</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            We're on a mission to make finding and refueling at CNG stations seamless and efficient
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-8 hover:border-teal-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#040f16] border border-teal-800/50 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Our Mission</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              To provide real-time, accurate information about CNG station availability and help users make informed decisions about where to refuel. We aim to reduce wait times and improve the overall refueling experience for CNG vehicle owners.
            </p>
          </div>

          <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-8 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#040f16] border border-emerald-800/50 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Our Vision</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              To become the most trusted and comprehensive platform for CNG station information, expanding across cities and countries, while promoting the adoption of clean energy vehicles through improved infrastructure accessibility.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10 text-white">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-[#0a1924] rounded-xl shadow-xl border border-slate-800 p-6 text-center hover:border-teal-500/30 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)] transition-all">
                  <div className="w-14 h-14 bg-[#040f16] border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white tracking-tight">{value.title}</h3>
                  <p className="text-slate-400 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10 text-white">Meet Our Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 text-[#040f16] text-3xl font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)] group-hover:scale-105 transition-transform cursor-default">
                  {member.initials}
                </div>
                <h3 className="font-semibold text-lg tracking-tight text-white">{member.name}</h3>
                <p className="text-teal-400 text-sm font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h2 className="text-3xl tracking-tight font-bold mb-6 text-white relative z-10">Our Story</h2>
          <div className="space-y-4 text-slate-300 leading-relaxed relative z-10">
            <p>
              Founded in 2024, our platform was born out of a personal frustration with finding CNG stations that had adequate stock availability. Our founder experienced multiple occasions of driving to stations only to find long queues or insufficient gas supply.
            </p>
            <p>
              We realized that with modern technology and real-time data, we could solve this problem not just for ourselves, but for thousands of CNG vehicle owners. Today, we're proud to serve users across multiple cities, providing them with accurate, up-to-date information.
            </p>
            <p>
              Our commitment to innovation and user satisfaction drives us to continuously improve our platform, adding new features and expanding our coverage to help more people every day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
