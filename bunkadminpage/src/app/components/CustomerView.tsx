import React from 'react';
import { MapPin, Clock, TrendingUp, Navigation, AlertCircle, CheckCircle2, Info } from 'lucide-react';

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
  pumpStatus?: string;
  waitingTime?: number;
}

interface CustomerViewProps {
  bunks: BunkData[];
}

export function CustomerView({ bunks }: CustomerViewProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available': 
        return { 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/30', 
          text: 'text-emerald-400', 
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: 'Available' 
        };
      case 'low': 
        return { 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/30', 
          text: 'text-amber-400', 
          icon: <Info className="w-4 h-4" />,
          label: 'Low Stock' 
        };
      case 'out-of-stock': 
        return { 
          bg: 'bg-red-500/10', 
          border: 'border-red-500/30', 
          text: 'text-red-400', 
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Out of Stock' 
        };
      default: 
        return { 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/30', 
          text: 'text-slate-400', 
          icon: <Info className="w-4 h-4" />,
          label: 'Unknown' 
        };
    }
  };

  const getStockBarColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-gradient-to-r from-emerald-500 to-teal-400';
      case 'low': return 'bg-gradient-to-r from-amber-500 to-orange-400';
      case 'out-of-stock': return 'bg-gradient-to-r from-red-500 to-pink-500';
      default: return 'bg-slate-500';
    }
  };

  const availableBunksCount = bunks.filter(b => b.status === 'available').length;

  return (
    <div className="min-h-screen bg-[#040f16] font-sans tracking-tight text-slate-200">
      {/* Premium Header */}
      {/* Header removed to avoid duplication with the main app header */}
      <div className="mt-20"></div>

      {/* Hero / Notification Area */}
      {availableBunksCount > 0 && (
         <div className="max-w-6xl mx-auto px-6 mt-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-emerald-900/5">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-[#040f16]">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <h3 className="text-emerald-400 font-bold">CNG Available Now!</h3>
                    <p className="text-slate-400 text-sm">{availableBunksCount} stations currently reporting fuel available.</p>
                </div>
            </div>
         </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
           <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="text-teal-400" size={24} />
                Nearby Stations
              </h2>
              <p className="text-slate-500 font-medium">Showing based on your current region</p>
           </div>
           <div className="hidden md:flex gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Available
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div> Low
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Out
              </div>
           </div>
        </div>

        {/* Station Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {bunks.map((bunk) => {
            const stockPercentage = Math.min(100, Math.max(0, (bunk.stockLevel / bunk.maxCapacity) * 100));
            const config = getStatusConfig(bunk.status);

            return (
              <div
                key={bunk.id}
                className="group relative bg-[#0a1924] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-slate-800 hover:border-teal-500/30 overflow-hidden animate-on-scroll"
              >
                {/* Background Glow Effect on Hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-all duration-500 blur-2xl"></div>

                {/* Header Row */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${config.bg} ${config.border} ${config.text}`}>
                      {config.icon}
                      {config.label}
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300">
                      {bunk.name}
                    </h3>
                    <div className="flex items-start gap-2 text-slate-400 mt-2">
                      <MapPin size={18} className="text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium leading-relaxed">{bunk.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-3xl font-black text-white">₹{bunk.price}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">per kg</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-slate-800/50 relative z-10">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pump Status</p>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${bunk.pumpStatus === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                         <span className="text-sm font-bold text-white capitalize">{bunk.pumpStatus || 'Free'}</span>
                      </div>
                   </div>
                   {bunk.waitingTime !== undefined && bunk.waitingTime > 0 && (
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Waiting</p>
                        <div className="flex items-center gap-2">
                           <Clock size={14} className="text-teal-400" />
                           <span className="text-sm font-bold text-white">{bunk.waitingTime} mins</span>
                        </div>
                     </div>
                   )}
                </div>

                {/* Live Stock Visualizer */}
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                       <TrendingUp size={14} className="text-teal-500" />
                       Live Stock Inventory
                    </span>
                    <span className={`text-sm font-bold ${config.text}`}>
                      {bunk.stockLevel} kg remaining
                    </span>
                  </div>
                  <div className="w-full bg-[#040f16] border border-slate-800 rounded-2xl h-5 p-1 overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${getStockBarColor(bunk.status)} rounded-xl transition-all duration-1000 shadow-[0_0_15px_rgba(20,184,166,0.2)]`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase tracking-tighter pt-1">
                     <span>Empty</span>
                     <span>Full Capacity ({bunk.maxCapacity}kg)</span>
                  </div>
                </div>

                {/* Action Buttons Removed - Only View for Stock Updation */}


                {/* Footer Meta */}
                <div className="mt-6 text-center">
                   <span className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-2">
                     <Clock size={12} />
                     Last updated {bunk.lastUpdated}
                   </span>
                </div>
              </div>
            );
          })}
        </div>

        {bunks.length === 0 && (
          <div className="text-center py-24 bg-[#0a1924] rounded-3xl border border-slate-800 border-dashed">
            <img src="/images/logo.png" alt="No Stations" className="w-24 h-24 mx-auto mb-6 opacity-20 grayscale" />
            <h3 className="text-xl font-bold text-slate-400">No Stations Found</h3>
            <p className="text-slate-600 mt-2 font-medium">Try adjusting your filters or checking back later.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-800/50 mt-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
            <img src="/images/logo.png" alt="CNG Finder Logo" className="w-6 h-6 object-contain opacity-50" />
            <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">CNG Finder</span>
        </div>
        <p className="text-slate-600 text-xs font-medium">Prices and stock levels are updated directly by station administrators.</p>
      </footer>
    </div>
  );
}
