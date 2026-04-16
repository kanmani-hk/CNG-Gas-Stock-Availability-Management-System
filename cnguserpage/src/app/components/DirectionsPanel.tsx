import { Navigation, Clock, MapPin } from 'lucide-react';
import { CNGStation } from './CNGStationCard';
import { useT } from '../i18n';

interface DirectionsPanelProps {
  station: CNGStation;
  userLocation: { lat: number; lng: number } | null;
  onGetDirections: () => void;
  onClose: () => void;
  onClearDirections?: () => void;
  isShowingDirections: boolean;
  onRefreshLocation?: () => void;
  onBookSlot?: () => void;
}

export function DirectionsPanel({
  station,
  userLocation,
  onGetDirections,
  onClose,
  onClearDirections,
  isShowingDirections,
  onRefreshLocation,
  onBookSlot
}: DirectionsPanelProps) {
  const t = useT();

  // Get distance units from settings (default to metric)
  const units = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('app_units') || 'metric' : 'metric';
  const isMetric = units === 'metric';

  // Calculate approximate distance (in km) using Haversine formula
  const calculateDistance = () => {
    if (!userLocation) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (station.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (station.lng - userLocation.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(station.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = R * c;
    // Convert to miles if imperial
    if (!isMetric) {
      return (km * 0.621371).toFixed(1);
    }
    return km.toFixed(1);
  };

  const distance = calculateDistance();
  const estimatedTime = distance ? Math.ceil(parseFloat(distance) / 40 * 60) : null; // Assuming 40 km/h average
  const distanceUnit = isMetric ? 'km' : 'mi';

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0a1924] rounded-xl shadow-2xl border border-slate-800 p-5 max-w-md w-full mx-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 text-white tracking-tight">{station.name}</h3>
          <div className="flex items-start text-sm text-slate-400">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-primary" />
            <span className="line-clamp-2">{station.address}</span>
          </div>

        </div>
        <button
          onClick={onClose}
          className="ml-2 bg-[#040f16] p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-primary">{Math.round(station.stockLevel * 10)} kg</div>
          <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Stock</div>
        </div>
        {distance && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-primary">{distance} {distanceUnit}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Dist</div>
          </div>
        )}
        {estimatedTime && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-primary">{estimatedTime} min</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Time</div>
          </div>
        )}
        <div className={`bg-primary/10 border border-primary/20 rounded-lg p-3 text-center ${station.pumpStatus === 'busy' ? '!border-rose-500/50 !bg-rose-500/10 text-rose-400' : 'text-emerald-400 !border-emerald-500/50 !bg-emerald-500/10'}`}>
            <div className="text-xl font-bold">{station.pumpStatus === 'busy' ? station.waitingTime : 'Free'}</div>
            <div className="text-xs mt-1 uppercase tracking-wider font-semibold">Queue</div>
        </div>
      </div>


      <div className="flex flex-col gap-3">
        {/* Navigation Action */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const dest = `${station.name}, ${station.address}`;
              let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;
              if (userLocation) {
                url += `&origin=${userLocation.lat},${userLocation.lng}`;
              }
              const width = 800;
              const height = 600;
              const left = (window.innerWidth / 2) - (width / 2);
              const top = (window.innerHeight / 2) - (height / 2);
              
              window.open(url, "GoogleMapsDirections", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
              onClose(); // Hide the panel and clear selection after launching map popup
            }}
            className="flex-1 glow-button py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] text-white group transition-all"
          >
            <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Get Directions</span>
          </a>
          <button
            onClick={onBookSlot}
            className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold border border-teal-500/50 text-teal-400 hover:bg-teal-500/10 transition-colors"
          >
             <span>Book Slot</span>
          </button>
        </div>
      </div>




      {!userLocation && (
        <p className="text-xs text-amber-500/80 mt-3 text-center flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" /> Enable location access for active routing
        </p>
      )}
    </div>
  );
}
