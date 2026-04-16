import { Fuel, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useT } from '../i18n';

export interface CNGStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  stockLevel: number; // 0-100 percentage (internally); displayed as kg to users
  stockKg: number; // Actual kg value
  pricePerKg: number;
  operatingHours: string;
  lastUpdated: string;
  pumpStatus?: string;
  waitingTime?: number;
}

interface CNGStationCardProps {
  station: CNGStation;
  onSelect: (station: CNGStation) => void;
  isSelected: boolean;
}

export function CNGStationCard({ station, onSelect, isSelected }: CNGStationCardProps) {
  const t = useT();

  const getStockColor = (level: number) => {
    if (level >= 70) return 'bg-emerald-500';
    if (level >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };


  const getStockText = (level: number) => {
    if (level >= 70) return t('highStock');
    if (level >= 40) return t('mediumStock');
    return t('lowStock');
  };

  return (
    <div
      onClick={() => onSelect(station)}
      className={`glass-card p-5 cursor-pointer rounded-2xl transition-all duration-300 transform ${isSelected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-border bg-card'
        }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground">{station.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{station.address}</span>
          </div>
        </div>
        <Fuel className="w-6 h-6 text-primary flex-shrink-0 ml-2" />
      </div>


      {/* Stock Level */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground">{getStockText(station.stockLevel)}</span>
          <span className="text-sm font-semibold text-foreground">{Math.round(station.stockLevel * 10)} kg</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getStockColor(station.stockLevel)}`}
            style={{ width: `${station.stockLevel}%` }}
          />
        </div>
      </div>

      {/* Price and Hours */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-foreground">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>₹{station.pricePerKg}/kg</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>{station.operatingHours}</span>
        </div>
      </div>

      {/* Last Updated & Queue */}
      <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground border-t border-slate-700/50 pt-2">
        <span>Updated: {station.lastUpdated}</span>
        {station.pumpStatus && (
          <span className={`px-2 py-1 rounded-full font-bold uppercase tracking-tighter shadow-sm border ${
              station.pumpStatus === 'free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              station.pumpStatus === 'maintenance' ? 'bg-red-500/20 text-red-500 border-red-500/40 animate-pulse' :
              'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            {station.pumpStatus === 'maintenance' ? '🔧 Maintenance' : 
             station.pumpStatus === 'busy' ? `Busy (${station.waitingTime}m wait)` : 
             'Pump: FREE'}
          </span>
        )}
      </div>
      {station.stockLevel < 20 && (
          <div className="mt-2 text-xs text-rose-500 flex items-center gap-1 font-bold animate-pulse">
            <TrendingUp className="w-3 h-3" /> Low Stock Alert! Refill soon.
          </div>
      )}
    </div>
  );
}
