import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  RefreshCw, 
  Save, 
  Minus, 
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Clock,
  Navigation
} from 'lucide-react';

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

interface BunkAdminViewProps {
  bunk: BunkData | null;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  onUpdateStation: (bunkId: string, data: Partial<BunkData>) => void;
  onUpdateProfile: (data: { name?: string; email?: string; phone?: string; newPassword?: string }) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: string) => Promise<void>;
  onAddDailySales: (date: string, amount: number, stockSold: number) => Promise<void>;
  onLogout: () => void;
}

export function BunkAdminView({ 
  bunk, 
  adminName, 
  adminEmail, 
  adminPhone, 
  onUpdateStation, 
  onUpdateProfile, 
  onUpdateBookingStatus,
  onAddDailySales,
  onLogout 
}: BunkAdminViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Combined Edit State
  const [editData, setEditData] = useState({
    name: adminName,
    email: adminEmail,
    phone: adminPhone || '',
    newPassword: '',
    stationName: bunk?.name || '',
    stockLevel: bunk?.stockLevel || 0,
    price: bunk?.price || 0,
    address: bunk?.location || '',
    lat: bunk?.lat || 0,
    lng: bunk?.lng || 0,
    operatingHours: bunk?.operatingHours || '24/7',
    pumpStatus: bunk?.pumpStatus || 'free',
    waitingTime: bunk?.waitingTime || 0
  });

  const [salesDate, setSalesDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesAmount, setSalesAmount] = useState('');
  const [stockSold, setStockSold] = useState('');

  const [activeTab, setActiveTab] = useState<'station' | 'bookings' | 'sales'>('station');

  // Sync state if props change (e.g., after save)
  useEffect(() => {
    if (!isEditing) {
      setEditData({
         name: adminName,
         email: adminEmail,
         phone: adminPhone || '',
         newPassword: '',
         stationName: bunk?.name || '',
         stockLevel: bunk?.stockLevel || 0,
         price: bunk?.price || 0,
         address: bunk?.location || '',
         lat: bunk?.lat || 0,
         lng: bunk?.lng || 0,
         operatingHours: bunk?.operatingHours || '24/7',
         pumpStatus: bunk?.pumpStatus || 'free',
         waitingTime: bunk?.waitingTime || 0
      });
    }
  }, [bunk, adminName, adminEmail, adminPhone, isEditing]);

  if (!bunk) {
    return (
      <div className="min-h-screen bg-[#040f16] flex items-center justify-center text-white font-sans">
        <div className="text-center space-y-4">
          <Building2 size={48} className="mx-auto text-teal-400 opacity-50 mb-4" />
          <h2 className="text-2xl font-bold">No Station Assigned</h2>
          <p className="text-slate-400">Please contact the Super Admin to complete your setup.</p>
          <button onClick={onLogout} className="mt-4 text-teal-400 hover:text-teal-300 underline font-bold">Return to Login</button>
        </div>
      </div>
    );
  }

  const stockPercentage = Math.min(100, Math.max(0, (bunk.stockLevel / bunk.maxCapacity) * 100));
  
  const getStockColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-emerald-400';
      case 'low': return 'text-amber-400';
      case 'out-of-stock': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStockBgColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
      case 'low': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
      case 'out-of-stock': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      default: return 'bg-slate-500';
    }
  };

  const handleQuickUpdate = (amount: number) => {
    const newStock = Math.min(bunk.maxCapacity, Math.max(0, bunk.stockLevel + amount));
    onUpdateStation(bunk.id, { stockLevel: newStock });
  };

  const saveEdits = async () => {
    setIsUpdatingProfile(true);
    setProfileMessage(null);
    try {
      // 1. Update Profile Fields if changed
      const profileUpdates: any = {};
      if (editData.name !== adminName) profileUpdates.name = editData.name;
      if (editData.email !== adminEmail) profileUpdates.email = editData.email;
      if (editData.phone !== adminPhone) profileUpdates.phone = editData.phone;
      if (editData.newPassword) profileUpdates.newPassword = editData.newPassword;
      
      if (Object.keys(profileUpdates).length > 0) {
        await onUpdateProfile(profileUpdates);
      }

      // 2. Update Station Fields
      const stationUpdates: any = {
        stockLevel: editData.stockLevel,
        pricePerKg: editData.price,
        address: editData.address,
        operatingHours: editData.operatingHours,
        pumpStatus: editData.pumpStatus,
        waitingTime: editData.waitingTime
      };
      if (editData.stationName !== bunk.name) stationUpdates.name = editData.stationName;
      if (editData.lat !== bunk.lat) stationUpdates.lat = editData.lat;
      if (editData.lng !== bunk.lng) stationUpdates.lng = editData.lng;

      onUpdateStation(bunk.id, stationUpdates);

      setProfileMessage({ type: 'success', text: 'All details updated successfully!' });
      setIsEditing(false);
      
      // Clear password field just in case
      setEditData(prev => ({ ...prev, newPassword: '' }));
      
    } finally {
       setIsUpdatingProfile(false);
    }
  };

  const handleSaveSales = async () => {
    if (!salesAmount || !stockSold) {
        alert("Please enter both amount and stock sold.");
        return;
    }
    try {
        await onAddDailySales(salesDate, parseFloat(salesAmount), parseFloat(stockSold));
        alert(`Sales for ${salesDate} saved successfully!`);
        setSalesAmount('');
        setStockSold('');
    } catch (err: any) {
        alert(err.message || "Failed to save sales");
    }
  };

  return (
    <div className="min-h-screen bg-[#040f16] font-sans tracking-tight">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        
        {/* Profile Header (Matching User ProfilePage) */}
        <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-8 mb-6 animate-on-scroll">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-[#040f16] text-3xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {adminName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                {!isEditing ? (
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{adminName}</h1>
                ) : (
                  <input
                    className="text-3xl font-bold text-white mb-2 border-b border-slate-700 bg-transparent focus:outline-none focus:border-emerald-500 transition-colors"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                )}
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-2">
                     <User className="w-4 h-4 text-emerald-400" />
                     <span className="text-sm font-medium">Bunk Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {!isEditing ? (
                      <span className="text-sm font-medium">{bunk.location}</span>
                    ) : (
                      <span className="text-sm font-medium italic">Update address below</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (isEditing) {
                    setEditData({ ...editData, name: adminName }); // reset on cancel
                  }
                  setIsEditing(!isEditing);
                  setProfileMessage(null);
                }}
                className="px-4 py-2 bg-[#040f16] border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-emerald-500 transition-colors flex items-center gap-2 glow-button"
              >
                <Edit2 className="w-4 h-4 text-emerald-400" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
              <button
                onClick={onLogout}
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
          
          {profileMessage && (
             <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${profileMessage.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/40' : 'bg-red-900/20 text-red-400 border border-red-800/40'}`}>
               {profileMessage.text}
             </div>
          )}

          {/* Contact Information Row */}
          <div className="grid md:grid-cols-2 gap-4 animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
            <div className="flex items-center gap-3 p-4 bg-[#040f16] rounded-xl border border-slate-800">
              <div className="w-10 h-10 bg-emerald-900/30 border border-emerald-800/50 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400">Email Address</p>
                 {!isEditing ? (
                  <p className="font-semibold text-white">
                    {adminEmail}
                  </p>
                ) : (
                  <input
                    type="email"
                    className="font-medium text-white bg-transparent border-b-2 border-slate-700 focus:outline-none focus:border-emerald-500 w-full transition-colors"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#040f16] rounded-xl border border-slate-800">
              <div className="w-10 h-10 bg-emerald-900/30 border border-emerald-800/50 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400">Phone Number</p>
                {!isEditing ? (
                  <p className="font-semibold text-white">
                    {adminPhone || <span className="text-slate-500 italic font-normal">Not set - Click Edit to add</span>}
                  </p>
                ) : (
                  <input
                    type="tel"
                    className="font-medium text-white bg-transparent border-b-2 border-slate-700 focus:outline-none focus:border-emerald-500 w-full transition-colors"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-8 pt-8 border-t border-slate-800 flex gap-4 mb-6 text-sm animate-on-scroll overflow-x-auto overflow-y-hidden whitespace-nowrap pb-2 scrollbar-hide" style={{ transitionDelay: '0.2s' }}>
             <button onClick={() => setActiveTab('station')} className={`px-4 py-2 rounded-full font-bold transition-all shrink-0 ${activeTab === 'station' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Station & Stock</button>
             <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-full font-bold transition-all shrink-0 ${activeTab === 'bookings' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Driver Bookings</button>
             <button onClick={() => setActiveTab('sales')} className={`px-4 py-2 rounded-full font-bold transition-all shrink-0 ${activeTab === 'sales' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Daily Sales</button>
          </div>

          <div className="mt-4">
             {activeTab === 'station' && (
              <>
                 <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900/30 border border-emerald-800/50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  Station Information
                </h2>
                {!isEditing && (
                  <div className={`px-4 py-2 rounded-full text-sm font-bold bg-[#040f16] border ${getStockColor(bunk.status).replace('text-', 'border-')} ${getStockColor(bunk.status)}`}>
                    {bunk.status.toUpperCase().replace('-', ' ')}
                  </div>
                )}
             </div>

             <div className="bg-[#040f16] rounded-xl border border-slate-800 p-6">
                {!isEditing ? (
                  <>
                     <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">STATION NAME</p>
                          <p className="font-bold text-lg text-white">{bunk.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">OPERATING HOURS</p>
                          <p className="font-semibold text-white flex items-center gap-2">
                             <Clock className="w-4 h-4 text-emerald-400" />
                             {bunk.operatingHours}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">PRICE</p>
                          <div className="flex flex-col">
                            <p className="font-bold text-emerald-400 text-lg">₹{bunk.price}/kg</p>
                            <span className="text-[10px] text-slate-500 font-medium">Managed by Super Admin</span>
                          </div>
                        </div>
                     </div>
                     
                     {/* Stock Visualization */}
                     <div className="mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-300">Current Stock Level</span>
                        <span className={`text-lg font-bold ${getStockColor(bunk.status)}`}>
                          {bunk.stockLevel} / {bunk.maxCapacity} kg
                        </span>
                      </div>
                      <div className="w-full bg-[#0a1924] border border-slate-800 rounded-full h-5 overflow-hidden">
                        <div
                          className={`h-full ${getStockBgColor(bunk.status)} transition-all duration-500`}
                          style={{ width: `${stockPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800">
                      <h3 className="text-sm font-bold text-white mb-4">Quick Stock Adjustment</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <button
                          onClick={() => handleQuickUpdate(-100)}
                          className="bg-red-900/20 text-red-400 border border-red-800/40 px-4 py-3 rounded-lg hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
                        >
                          <Minus size={18} /> -100 kg
                        </button>
                        <button
                          onClick={() => handleQuickUpdate(-50)}
                          className="bg-red-900/20 text-red-400 border border-red-800/40 px-4 py-3 rounded-lg hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
                        >
                          <Minus size={18} /> -50 kg
                        </button>
                        <button
                          onClick={() => handleQuickUpdate(50)}
                          className="bg-emerald-900/20 text-emerald-400 border border-emerald-800/40 px-4 py-3 rounded-lg hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
                        >
                          <Plus size={18} /> +50 kg
                        </button>
                        <button
                          onClick={() => handleQuickUpdate(100)}
                          className="bg-emerald-900/20 text-emerald-400 border border-emerald-800/40 px-4 py-3 rounded-lg hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
                        >
                          <Plus size={18} /> +100 kg
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                   /* Edit Station Form */
                   <div className="space-y-6">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Station Name</label>
                            <input
                              className="w-full px-4 py-3 bg-[#0a1924] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-colors"
                              value={editData.stationName}
                              onChange={(e) => setEditData({ ...editData, stationName: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Operating Hours</label>
                            <input
                              className="w-full px-4 py-3 bg-[#0a1924] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-colors"
                              value={editData.operatingHours}
                              onChange={(e) => setEditData({ ...editData, operatingHours: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Pump Status</label>
                            <select
                              className="w-full px-4 py-3 bg-[#0a1924] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-colors"
                              value={editData.pumpStatus}
                              onChange={(e) => setEditData({ ...editData, pumpStatus: e.target.value })}
                            >
                                <option value="free">Free</option>
                                <option value="busy">Busy</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                          </div>
                          {editData.pumpStatus === 'busy' && (
                            <div>
                              <label className="block text-sm font-bold text-slate-300 mb-2">Waiting Time (mins)</label>
                              <input
                                type="number"
                                className="w-full px-4 py-3 bg-[#0a1924] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-colors"
                                value={editData.waitingTime}
                                onChange={(e) => setEditData({ ...editData, waitingTime: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Price (₹/kg) <span className="text-[10px] text-slate-500 font-normal ml-2">(Locked - Super Admin Only)</span></label>
                            <input
                              type="number" readOnly
                              className="w-full px-4 py-3 bg-[#0a1924] border border-slate-700/50 rounded-lg focus:outline-none text-slate-500 cursor-not-allowed transition-colors"
                              value={editData.price}
                            />
                          </div>
                           <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Current Stock Level (kg)</label>
                            <input
                              type="number" min="0" max={bunk.maxCapacity}
                              className="w-full px-4 py-3 bg-[#0a1924] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-colors"
                              value={editData.stockLevel}
                              onChange={(e) => setEditData({ ...editData, stockLevel: Math.min(bunk.maxCapacity, Math.max(0, parseInt(e.target.value) || 0)) })}
                            />
                          </div>
                       </div>
                       
                       <div>
                          <label className="block text-sm font-bold text-emerald-400 mb-2">Station Address</label>
                          <textarea
                            className="w-full px-4 py-3 bg-[#0a1924] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-colors"
                            rows={2}
                            value={editData.address}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          />
                       </div>

                       <div className="bg-emerald-900/10 border border-emerald-800/30 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">GPS Coordinates</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    setEditData({ ...editData, lat: pos.coords.latitude, lng: pos.coords.longitude });
                                  },
                                  () => alert('Please allow GPS access')
                                );
                              }
                            }}
                            className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/40 hover:bg-emerald-500/30 transition-all font-bold"
                          >
                            Use My Location
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">LATITUDE</label>
                            <input type="number" step="any" value={editData.lat} onChange={(e) => setEditData({ ...editData, lat: parseFloat(e.target.value) || 0 })} className="w-full bg-[#0a1924] border border-slate-800 text-sm text-white p-2 rounded focus:border-emerald-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">LONGITUDE</label>
                            <input type="number" step="any" value={editData.lng} onChange={(e) => setEditData({ ...editData, lng: parseFloat(e.target.value) || 0 })} className="w-full bg-[#0a1924] border border-slate-800 text-sm text-white p-2 rounded focus:border-emerald-500 outline-none" />
                          </div>
                        </div>
                      </div>

                   </div>
                )}
             </div>
              </>
             )}

             {activeTab === 'bookings' && (
                 <div className="bg-[#040f16] rounded-xl border border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        Driver Slot Bookings
                    </h2>
                    {bunk.bookings && bunk.bookings.length > 0 ? (
                        <div className="space-y-4">
                           {bunk.bookings.map((booking: any, idx) => (
                               <div key={idx} className="bg-[#0a1924] p-5 rounded-xl flex items-center justify-between border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                                   <div className="space-y-1">
                                       <p className="font-bold text-white text-lg flex items-center gap-2">
                                           {booking.driverName}
                                           <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">{booking.vehicleNumber}</span>
                                       </p>
                                       <div className="flex items-center gap-3 text-sm">
                                           <span className="text-emerald-400 font-semibold">{booking.timeSlot}</span>
                                           {booking.requestedGas && (
                                              <span className="text-teal-300 font-semibold bg-teal-900/30 px-2 py-0.5 rounded border border-teal-500/20">{booking.requestedGas} KG</span>
                                           )}
                                           <span className="text-slate-500 text-xs tracking-tighter">Ordered: {new Date(booking.createdAt).toLocaleTimeString()}</span>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                           booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                           booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                           'bg-slate-800 text-slate-400 border border-slate-700'
                                       }`}>{booking.status}</span>
                                       <select 
                                           className="bg-[#040f16] border border-slate-700 text-xs text-white p-1.5 rounded focus:border-emerald-500 outline-none"
                                           value={booking.status}
                                           onChange={(e) => onUpdateBookingStatus(booking._id, e.target.value)}
                                       >
                                           <option value="pending">Pending</option>
                                           <option value="confirmed">Confirm</option>
                                           <option value="completed">Complete</option>
                                           <option value="cancelled">Cancel</option>
                                       </select>
                                   </div>
                               </div>
                           ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-16 bg-[#0a1924] rounded-xl border border-slate-800/50">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No bookings right now.</p>
                        </div>
                    )}
                 </div>
             )}

             {activeTab === 'sales' && (
                 <div className="bg-[#040f16] rounded-xl border border-slate-800 p-6">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <img src="/images/logo.png" alt="CNG Finder Logo" className="w-6 h-6 object-contain" />
                        Daily Sales Report
                     </h2>
                     <div className="grid md:grid-cols-4 gap-4 mb-8 p-6 bg-[#0a1924] rounded-xl border border-slate-700/50 shadow-inner">
                         <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                            <input type="date" value={salesDate} onChange={(e) => setSalesDate(e.target.value)} className="w-full bg-[#040f16] text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none transition-colors" />
                         </div>
                         <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount (₹)</label>
                            <input type="number" placeholder="5000" value={salesAmount} onChange={(e) => setSalesAmount(e.target.value)} className="w-full bg-[#040f16] text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none transition-colors" />
                         </div>
                         <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock Sold (kg)</label>
                            <input type="number" placeholder="100" value={stockSold} onChange={(e) => setStockSold(e.target.value)} className="w-full bg-[#040f16] text-white p-3 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none transition-colors" />
                         </div>
                         <div className="flex items-end">
                            <button 
                                onClick={handleSaveSales}
                                className="w-full bg-emerald-500 text-[#040f16] py-3 rounded-lg font-bold hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                                Save Report
                            </button>
                         </div>
                     </div>
                     
                     <div className="space-y-3">
                         <h3 className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-4">Past 30 Days Records</h3>
                         {bunk.dailySales && bunk.dailySales.length > 0 ? (
                             bunk.dailySales.map((sale: any, idx: number) => (
                                <div key={idx} className="bg-[#0a1924] px-5 py-4 rounded-xl flex justify-between items-center text-sm border border-slate-800/50 hover:bg-[#0d1f2b] transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-300 border border-slate-700">{sale.date}</div>
                                        <span className="text-emerald-400 font-bold text-lg">₹ {sale.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="text-slate-400 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/30">{sale.stockSold} kg Sold</div>
                                </div>
                             ))
                         ) : (
                             <div className="text-center text-slate-500 py-16 bg-[#0a1924] rounded-xl border border-slate-800/50">
                                 <Plus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                 <p className="font-medium">No sales records found for this period.</p>
                             </div>
                         )}
                     </div>
                 </div>
             )}
          </div>
        </div>

        {/* Full Save Action Panel (Only visibly when editing) */}
        {isEditing && (
           <div className="bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-6 flex flex-col items-end gap-4">
              <div className="w-full mb-4 pb-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Account Settings</h3>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">New Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      className="w-full max-w-md px-4 py-3 bg-[#040f16] border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-colors"
                      value={editData.newPassword}
                      onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                    />
                  </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-[#040f16] text-slate-300 border border-slate-700 hover:text-white rounded-lg hover:border-slate-500 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdits}
                  disabled={isUpdatingProfile}
                  className="px-8 py-3 glow-button rounded-lg transition-colors flex items-center justify-center gap-2 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
                  style={{
                     background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                     boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)'
                  }}
                >
                  <Save size={18} /> {isUpdatingProfile ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
