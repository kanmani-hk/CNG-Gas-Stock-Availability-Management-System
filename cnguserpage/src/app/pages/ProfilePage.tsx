import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Star,
  Fuel,
  Navigation,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import React from 'react';

// Helper to safely parse and format dates
const formatJoinDate = (dateInput: any): string => {
  if (!dateInput) return new Date().toLocaleDateString();
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString();
    }
    return date.toLocaleDateString();
  } catch {
    return new Date().toLocaleDateString();
  }
};

export function ProfilePage({ 
  userInfo, 
  token, 
  onLogout, 
  onProfileUpdate 
}: { 
  userInfo: { id: string; name: string; email: string; vehicle?: any } | null, 
  token: string | null, 
  onLogout?: () => void,
  onProfileUpdate?: (updatedUser: any) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => ({
    name: userInfo?.name ?? 'Guest User',
    email: userInfo?.email ?? 'not-set@example.com',
    phone: '',
    location: 'Coimbatore, Tamil Nadu',
    joinDate: new Date().toLocaleDateString(),
    vehicle: {
      name: '',
      type: '',
      number: '',
    },
  }));
  const [loading, setLoading] = useState(false);

  const [editData, setEditData] = useState({
    name: profile.name,
    phone: profile.phone,
    location: profile.location,
    vehicleName: profile.vehicle.name,
    vehicleType: profile.vehicle.type,
    vehicleNumber: profile.vehicle.number,
  });

  // Fetch user profile from API on mount
  useEffect(() => {
    if (token && userInfo?.id) {
      setLoading(true);
      if (userInfo.id === 'demo') {
        // Demo user: get from localStorage
        const offlineEmail = localStorage.getItem('cng_offline_email');
        if (offlineEmail) {
          const usersJson = localStorage.getItem('cng_users');
          const users = usersJson ? JSON.parse(usersJson) : {};
          const user = users[offlineEmail];
          if (user) {
            setProfile({
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              location: user.location || 'Coimbatore, Tamil Nadu',
              joinDate: formatJoinDate(user.joinDate),
              vehicle: user.vehicle || { name: '', type: '', number: '' },
            });
            setEditData({
              name: user.name,
              phone: user.phone || '',
              location: user.location || 'Coimbatore, Tamil Nadu',
              vehicleName: user.vehicle?.name || '',
              vehicleType: user.vehicle?.type || '',
              vehicleNumber: user.vehicle?.number || '',
            });
          }
        }
        setLoading(false);
      } else {
        // Real user: fetch from API
        api.getProfile(token)
          .then((user) => {
            setProfile({
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              location: user.location || 'Coimbatore, Tamil Nadu',
              joinDate: formatJoinDate(user.joinDate),
              vehicle: user.vehicle || { name: '', type: '', number: '' },
            });
            setEditData({
              name: user.name,
              phone: user.phone || '',
              location: user.location || 'Coimbatore, Tamil Nadu',
              vehicleName: user.vehicle?.name || '',
              vehicleType: user.vehicle?.type || '',
              vehicleNumber: user.vehicle?.number || '',
            });
          })
          .catch((err) => console.error('Failed to fetch profile:', err))
          .finally(() => setLoading(false));
      }
    }
  }, [token, userInfo?.id]);

  const stats = [
    {
      icon: Navigation,
      label: "Trips",
      value: "127",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Star,
      label: "Favorites",
      value: "8",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Fuel,
      label: "Stations Visited",
      value: "24",
      color: "bg-green-100 text-green-600",
    },
  ];

  const recentActivity = [
    {
      station: "Green Gas CNG Station",
      date: "2 days ago",
      action: "Visited",
    },
    {
      station: "Fast Fuel CNG Pump",
      date: "5 days ago",
      action: "Added to Favorites",
    },
    {
      station: "Express CNG Center",
      date: "1 week ago",
      action: "Visited",
    },
    {
      station: "City CNG Station",
      date: "2 weeks ago",
      action: "Visited",
    },
  ];

  const favorites = [
    {
      name: "Green Gas CNG Station",
      address: "Downtown Area",
      stock: 85,
    },
    {
      name: "City CNG Station",
      address: "Central Plaza",
      stock: 92,
    },
    {
      name: "Metro Gas CNG Point",
      address: "North Zone",
      stock: 58,
    },
  ];

  return (
    <div className="min-h-screen bg-[#040f16] font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-[#040f16] text-3xl font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                {profile.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                {!isEditing ? (
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{profile.name}</h1>
                ) : (
                  <input
                    className="text-3xl font-bold text-white mb-2 border-b border-slate-700 bg-transparent focus:outline-none focus:border-teal-500 transition-colors"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                )}
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span className="text-sm font-medium">
                      Joined {profile.joinDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    {!isEditing ? (
                      <span className="text-sm font-medium">{profile.location}</span>
                    ) : (
                      <input
                        className="text-sm border-b border-slate-700 bg-transparent focus:outline-none focus:border-teal-500 transition-colors"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-[#040f16] border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-teal-500 transition-colors flex items-center gap-2 glow-button"
              >
                <Edit2 className="w-4 h-4 text-teal-400" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('cng_current_user');
                  } catch (e) {}
                  onLogout?.();
                }}
                className="px-4 py-2 border border-red-900/50 bg-red-900/10 rounded-lg hover:bg-red-900/20 text-red-400 flex items-center gap-2 transition-colors glow-button"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M7 16v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-[#040f16] rounded-xl border border-slate-800">
              <div className="w-10 h-10 bg-teal-900/30 border border-teal-800/50 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="font-semibold text-white">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#040f16] rounded-xl border border-slate-800">
              <div className="w-10 h-10 bg-emerald-900/30 border border-emerald-800/50 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Phone</p>
                {!isEditing ? (
                  <p className="font-semibold text-white">
                    {profile.phone || <span className="text-slate-500 italic font-normal">Not set - Click Edit to add</span>}
                  </p>
                ) : (
                  <input
                    className="font-medium text-white bg-transparent border-b-2 border-slate-700 focus:outline-none focus:border-emerald-500 w-full transition-colors"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#040f16] rounded-xl border border-slate-800">
              <div className="w-10 h-10 bg-cyan-900/30 border border-cyan-800/50 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  Member Status
                </p>
                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                  Premium
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information Display */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-teal-900/30 border border-teal-800/50 flex items-center justify-center overflow-hidden">
                <Fuel className="w-5 h-5 text-teal-400" />
              </div>
              Vehicle Information
            </h2>
            <div className="bg-[#040f16] rounded-xl border border-slate-800 p-6">
              {profile.vehicle?.name || profile.vehicle?.type || profile.vehicle?.number ? (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0a1924] rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Vehicle Name</p>
                    <p className="font-semibold text-white">
                      {profile.vehicle?.name || <span className="text-slate-500 italic font-normal">Not set</span>}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a1924] rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Vehicle Type</p>
                    <p className="font-semibold text-white">
                      {profile.vehicle?.type || <span className="text-slate-500 italic font-normal">Not set</span>}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0a1924] rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">License Plate</p>
                    <p className="font-semibold text-white">
                      {profile.vehicle?.number || <span className="text-slate-500 italic font-normal">Not set</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">
                  No vehicle information added yet. Click Edit Profile to add your vehicle details.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Section */}
        {isEditing && (
          <div className="max-w-2xl mx-auto bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6 mb-6">
            {/* Basic Information Edit */}
            <div className="mb-6">
              <h3 className="text-lg font-bold tracking-tight text-white mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white placeholder:text-slate-600 transition-colors"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-slate-600 transition-colors"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder:text-slate-600 transition-colors"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="Enter your location"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information Edit Section */}
            <div className="mb-6 pb-6 border-b border-slate-800">
              <h3 className="text-lg font-bold tracking-tight text-white mb-4 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-teal-400" />
                Vehicle Information
              </h3>
              <div className="space-y-4">
                {/* Vehicle Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Vehicle Name
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white placeholder:text-slate-600 transition-colors"
                    value={editData.vehicleName}
                    onChange={(e) => setEditData({ ...editData, vehicleName: e.target.value })}
                    placeholder="e.g., My Car"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white transition-colors appearance-none"
                    value={editData.vehicleType}
                    onChange={(e) => setEditData({ ...editData, vehicleType: e.target.value })}
                  >
                    <option value="" className="text-slate-500">Select Vehicle Type</option>
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
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Vehicle Number/License Plate
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white placeholder:text-slate-600 transition-colors"
                    value={editData.vehicleNumber}
                    onChange={(e) => setEditData({ ...editData, vehicleNumber: e.target.value })}
                    placeholder="e.g., TN01AB1234"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  // Cancel edits
                  setEditData({ name: profile.name, phone: profile.phone, location: profile.location, vehicleName: profile.vehicle.name, vehicleType: profile.vehicle.type, vehicleNumber: profile.vehicle.number });
                  setIsEditing(false);
                }}
                className="px-5 py-2.5 bg-[#040f16] border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save edits to database via API
                  if (token && userInfo?.id && userInfo.id !== 'demo') {
                    setLoading(true);
                    api.updateProfile(token, {
                      name: editData.name,
                      phone: editData.phone,
                      location: editData.location,
                      vehicleName: editData.vehicleName,
                      vehicleType: editData.vehicleType,
                      vehicleNumber: editData.vehicleNumber,
                    })
                      .then(() => {
                         const updatedProfile = { 
                           ...profile, 
                           name: editData.name, 
                           phone: editData.phone, 
                           location: editData.location, 
                           vehicle: { 
                             name: editData.vehicleName, 
                             type: editData.vehicleType, 
                             number: editData.vehicleNumber 
                           } 
                         };
                        setProfile(updatedProfile);
                        onProfileUpdate?.({
                          name: editData.name,
                          vehicle: updatedProfile.vehicle
                        });
                        setIsEditing(false);
                      })
                      .catch((err) => {
                        console.error('Failed to update profile:', err);
                        alert('Failed to update profile');
                      })
                      .finally(() => setLoading(false));
                  } else {
                    // Local save for demo user
                    const updated = { ...profile, name: editData.name, phone: editData.phone, location: editData.location, vehicle: { name: editData.vehicleName, type: editData.vehicleType, number: editData.vehicleNumber } };
                    setProfile(updated);
                    setIsEditing(false);
                  }
                }}
                className="px-8 py-2.5 glow-button rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            // Overriding the default stats colors to align with our neon theme
            const statColor = stat.label === 'Trips' 
              ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
              : stat.label === 'Favorites'
                ? 'bg-amber-900/30 text-amber-500 border border-amber-800/50'
                : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50';

            return (
              <div
                key={index}
                className="bg-[#0a1924] rounded-xl shadow-xl border border-slate-800 p-6 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-semibold uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 ${statColor} rounded-full flex items-center justify-center`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold tracking-tight text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors -mx-2 px-2 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-slate-200">
                      {activity.station}
                    </h3>
                    <p className="text-sm font-medium text-teal-400/80">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    {activity.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Stations */}
          <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold tracking-tight text-white mb-4">
              Favorite Stations
            </h2>
            <div className="space-y-4">
              {favorites.map((station, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#040f16] rounded-xl border border-slate-800 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-200">
                        {station.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {station.address}
                      </p>
                    </div>
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#0a1924] border border-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        style={{ width: `${station.stock}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      {station.stock}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}