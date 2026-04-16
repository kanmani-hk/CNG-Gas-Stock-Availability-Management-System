import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useT } from '../i18n';
import { CNGStation } from './CNGStationCard';

interface BookingModalProps {
  station: CNGStation | null;
  onClose: () => void;
  onBook: (driverName: string, driverEmail: string, vehicleNumber: string, timeSlot: string, requestedGas: number) => Promise<void>;
}

export function BookingModal({ station, onClose, onBook }: BookingModalProps) {
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [requestedGas, setRequestedGas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!station) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(requestedGas) > station.stockKg) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onBook(driverName, driverEmail, vehicleNumber, timeSlot, Number(requestedGas));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a1924] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            Book Slot at {station.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Driver Name</label>
            <input
              type="text"
              required
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-[#040f16] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Enter driver name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Driver Email (for notifications)</label>
            <input
              type="email"
              required
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
              className="w-full bg-[#040f16] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Vehicle Number</label>
            <input
              type="text"
              required
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full bg-[#040f16] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="e.g. TN 38 AA 1234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Preferred Time Slot</label>
            <select
              required
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full bg-[#040f16] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Select a time slot</option>
              <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
              <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
              <option value="Evening (16:00 - 20:00)">Evening (16:00 - 20:00)</option>
              <option value="Night (20:00 - 00:00)">Night (20:00 - 00:00)</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-400 mb-1">Required Gas (in KG)</label>
              <span className="text-xs font-bold text-teal-400">Available: {station.stockKg} KG</span>
            </div>
            <input
              type="number"
              min="1"
              max={station.stockKg}
              required
              value={requestedGas}
              onChange={(e) => setRequestedGas(e.target.value)}
              className={`w-full bg-[#040f16] border ${Number(requestedGas) > station.stockKg ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:border-teal-500 focus:ring-teal-500'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 transition-colors`}
              placeholder="e.g. 10"
            />
            {Number(requestedGas) > station.stockKg && (
              <p className="text-red-400 text-xs mt-1 animate-in slide-in-from-top-1">
                Amount exceeds current stock availability ({station.stockKg} KG).
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Number(requestedGas) > station.stockKg}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 font-bold text-white rounded-xl shadow-lg shadow-teal-500/20 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
