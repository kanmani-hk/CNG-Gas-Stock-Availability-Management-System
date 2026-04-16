import React, { useEffect } from 'react';
import { useState } from 'react';
import { Search, Filter, MapPin, RefreshCw } from 'lucide-react';

import { CNGStationCard, CNGStation } from '../components/CNGStationCard';
import { GoogleMap } from '../components/GoogleMap';
import { DirectionsPanel } from '../components/DirectionsPanel';
import { BookingModal } from '../components/BookingModal';
import { useT } from '../i18n';

// Mock data for CNG stations across Tamil Nadu (Madurai, Salem, Coimbatore, Thanjavur regions)
const initialStations: CNGStation[] = [];

interface StationsPageProps {
  userInfo?: { id: string; name: string; email: string; vehicle?: any } | null;
  token?: string | null;
  userLocation: { lat: number; lng: number } | null;
  refreshLocation: () => void;
}

export function StationsPage({ userInfo, token, userLocation, refreshLocation }: StationsPageProps) {
  const t = useT();
  const [stations, setStations] = useState<CNGStation[]>(initialStations);
  const [selectedStation, setSelectedStation] = useState<CNGStation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showDirections, setShowDirections] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [stationToBook, setStationToBook] = useState<CNGStation | null>(null);

  // Notification
  const [notifications, setNotifications] = useState<string[]>([]);
  // Store previous stations to detect stock changes and booking confirmations
  const [prevStations, setPrevStations] = useState<any[]>([]);

  // Load stations: live data from bunkadmin API with 30s polling
  const loadStations = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const { api } = await import('../../services/api');
      const apiStations = await api.getAllStations();
      if (apiStations && apiStations.length > 0) {
        const transformed = apiStations.map((apiStation: any) => {
          const MAX_CAPACITY_KG = 1000;
          const lat = Number(apiStation.lat);
          const lng = Number(apiStation.lng);

          return {
            id: apiStation._id || apiStation.id,
            name: apiStation.name,
            address: apiStation.address,
            lat: isNaN(lat) ? 0 : lat,
            lng: isNaN(lng) ? 0 : lng,
            stockLevel: Math.min(100, Math.max(0, Math.round((apiStation.stockLevel / MAX_CAPACITY_KG) * 100))),
            stockKg: apiStation.stockLevel,
            pricePerKg: apiStation.pricePerKg,
            operatingHours: apiStation.operatingHours || '24/7',
            lastUpdated: apiStation.lastUpdated || 'Just now',
            pumpStatus: apiStation.pumpStatus || 'free',
            waitingTime: apiStation.waitingTime || 0,
            bookings: apiStation.bookings || [],
          };
        });
          
          // Check for notifications
          if (prevStations.length > 0) {
            const newNotifications: string[] = [];
            
            transformed.forEach((st: any) => {
               const prevSt = prevStations.find(p => p.id === st.id);
               
               // 1. Stock available alert
               if (prevSt && prevSt.stockLevel < 20 && st.stockLevel >= 20) {
                   newNotifications.push(`CNG is now available at ${st.name}!`);
               }

               // 2. Booking confirmation alert
               if (userInfo?.vehicle?.number) {
                  const currentBookings = st.bookings || [];
                  const prevBookings = prevSt?.bookings || [];
                  
                  currentBookings.forEach((booking: any) => {
                    if (booking.vehicleNumber === userInfo.vehicle.number) {
                      const prevBooking = prevBookings.find((pb: any) => pb._id === booking._id || pb.id === booking.id);
                      if (booking.status === 'confirmed' && (!prevBooking || prevBooking.status !== 'confirmed')) {
                        newNotifications.push(`Booking at ${st.name} confirmed for your vehicle ${booking.vehicleNumber}!`);
                      }
                      if (booking.status === 'completed' && (!prevBooking || prevBooking.status !== 'completed')) {
                        newNotifications.push(`Booking at ${st.name} completed. Thank you!`);
                      }
                    }
                  });
               }
            });
            
            if (newNotifications.length > 0) {
                setNotifications(prev => [...prev, ...newNotifications]);
                setTimeout(() => setNotifications(prev => {
                  const remaining = [...prev];
                  remaining.splice(0, newNotifications.length);
                  return remaining;
                }), 6000);
            }
          }
          
          setPrevStations(transformed);
          setStations(transformed);
        }
      } catch (err) {
        console.warn('BunkAdmin API unavailable', err);
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    };

  useEffect(() => {
    loadStations();
    const interval = setInterval(() => loadStations(true), 5000); // 5s silent polling
    return () => clearInterval(interval);
  }, []);


  const handleBookSlot = async (driverName: string, driverEmail: string, vehicleNumber: string, timeSlot: string, requestedGas: number) => {
    try {
      if (!stationToBook || !token) {
        if (!token) alert("You must be logged in to book a slot.");
        return;
      }
      setIsRefreshing(true);
      const { api } = await import('../../services/api');
      await api.bookSlot(token, stationToBook.id, { driverName, driverEmail, vehicleNumber, timeSlot, requestedGas });
      
      setShowBookingModal(false);
      setStationToBook(null);
      setNotifications(prev => [...prev, `Slot confirmed! Sent to Bunk & Super Admin.`]);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 5000);
      loadStations(true);
    } catch (err: any) {
      console.error("Critical booking failure:", err);
      alert(`Critical error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGetDirections = () => {
    // This now only triggers internal map routing. 
    // The external link is handled separately in the DirectionsPanel UI.
    setShowDirections(true);
  };

  // Select station (any stock level should be selectable)
  const handleSelectStation = (station: CNGStation) => {
    setSelectedStation(station);
    setShowDirections(false);
  };

  const handleCloseDirections = () => {
    setShowDirections(false);
    setSelectedStation(null);
  };



  const handleClearDirections = () => {
    setShowDirections(false);
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterStock === 'high') matchesFilter = station.stockLevel >= 70;
    if (filterStock === 'medium') matchesFilter = station.stockLevel >= 40 && station.stockLevel < 70;
    if (filterStock === 'low') matchesFilter = station.stockLevel < 40;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col bg-[#040f16] text-slate-300 font-sans relative">
      {/* Notifications overlay */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
         {notifications.map((msg, idx) => (
             <div key={idx} className="bg-teal-500/90 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-right backdrop-blur-sm border border-teal-400">
                <RefreshCw className="w-4 h-4" />
                <span className="font-semibold">{msg}</span>
             </div>
         ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#0a1924] border-b border-slate-800 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadStations()}
            disabled={isRefreshing}
            className={`p-2 bg-[#040f16] border border-slate-700 rounded-lg text-primary hover:bg-slate-800 transition-all shadow-md group ${isRefreshing ? 'opacity-50' : ''}`}
            title="Refresh Stations"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>


          {/* Filter Dropdown */}

          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors pointer-events-none" />
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value as any)}
              className="pl-10 pr-8 py-2 bg-[#040f16] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-all"
            >

              <option value="all">{t('allStations')}</option>
              <option value="high">{t('highStock')}</option>
              <option value="medium">{t('mediumStock')}</option>
              <option value="low">{t('lowStock')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Station List */}
        <aside className={`w-full md:w-96 bg-[#0a1924] border-r border-slate-800 overflow-y-auto transition-all duration-300 ${selectedStation ? 'hidden md:block' : 'block'}`}>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-white">
                {t('availableStations')} ({filteredStations.length})
              </h2>
            </div>

            <div className="space-y-3">
              {filteredStations.map(station => (
                <div key={station.id} className="relative">
                  <CNGStationCard
                    station={station}
                    onSelect={handleSelectStation}
                    isSelected={selectedStation?.id === station.id}
                  />
                </div>
              ))}

              {filteredStations.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No stations found</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Area - Map */}
        <main className={`flex-1 bg-[#040f16] relative transition-all duration-300 w-full ${selectedStation ? 'block' : 'hidden md:block'}`}>


          <GoogleMap
            stations={filteredStations}
            selectedStation={selectedStation}
            onStationSelect={handleSelectStation}
            showDirections={showDirections}
            userLocation={userLocation}
            refreshLocation={refreshLocation}
          />


          {selectedStation && (
            <DirectionsPanel
              station={selectedStation}
              userLocation={userLocation}
              onGetDirections={handleGetDirections}
              onClose={() => {
                handleCloseDirections();
              }}
              onClearDirections={handleClearDirections}
              isShowingDirections={showDirections}
              onBookSlot={() => {
                setStationToBook(selectedStation);
                setShowBookingModal(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
           station={stationToBook}
           onClose={() => {
              setShowBookingModal(false);
              setStationToBook(null);
           }}
           onBook={handleBookSlot}
        />
      )}
    </div>
  );
}
