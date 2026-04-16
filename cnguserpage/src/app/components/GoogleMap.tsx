import { useEffect, useRef, useState } from 'react';
import { CNGStation } from './CNGStationCard';
// removed unused DirectionsPanel import
// import GoogleMaps from './google-maps';

declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options?: any);
        panTo(latlng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
        fitBounds(bounds: LatLngBounds, padding?: number): void;
        setCenter(latlng: LatLng | LatLngLiteral): void;
      }
      class Marker {
        constructor(options?: any);
        setMap(map: Map | null): void;
        addListener(eventName: string, handler: Function): void;
        getPosition(): LatLng | null;
      }
      class DirectionsRenderer {
        constructor(options?: any);
        setMap(map: Map | null): void;
        setDirections(directions: DirectionsResult): void;
      }
      class DirectionsService {
        route(request: DirectionsRequest, callback: Function): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
      }
      class LatLngBounds {
        extend(point: LatLng | LatLngLiteral): void;
        getCenter(): LatLng;
      }
      class InfoWindow {
        constructor(options?: any);
      }
      enum SymbolPath {
        CIRCLE = 0,
      }
      enum TravelMode {
        DRIVING = 'DRIVING',
      }
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
      interface DirectionsRequest {
        origin: string | LatLngLiteral;
        destination: string | LatLngLiteral;
        travelMode: string;
      }
      interface DirectionsResult {
        routes: any[];
      }
    }
  }
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  stations: CNGStation[];
  selectedStation: CNGStation | null;
  onStationSelect: (station: CNGStation) => void;
  showDirections?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  refreshLocation?: () => void;
}

export function GoogleMap({ stations, selectedStation, onStationSelect, showDirections, userLocation, refreshLocation }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps Script
  useEffect(() => {
    const apiKey = (import.meta as any).env.VITE_GOOGLE_MAP_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps. Please check your API key.');
    document.head.appendChild(script);

    // Hide Google Maps error overlay if it appears (invalid API key shows an overlay)
    const style = document.createElement('style');
    style.innerHTML = '.gm-err-container { display: none !important; }';
    document.head.appendChild(style);

    // Also observe and remove any gm-err-container nodes that might be added later
    const observer = new MutationObserver(() => {
      const nodes = document.querySelectorAll('.gm-err-container');
      nodes.forEach(n => n.parentElement?.removeChild(n));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (style.parentElement) style.parentElement.removeChild(style);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || googleMapRef.current) return;

    // If we have user location, center on it; otherwise on average of stations or fallback
    // Default: Coimbatore (Tamil Nadu) center if everything else fails
    let center = { lat: 11.0168, lng: 76.9558 };
    if (userLocation) {
      center = { lat: userLocation.lat, lng: userLocation.lng };
    } else if (stations && stations.length > 0) {
      const validStations = stations.filter(s => s.lat !== 0 && s.lng !== 0);
      if (validStations.length > 0) {
        const centerLat = validStations.reduce((sum, s) => sum + s.lat, 0) / validStations.length;
        const centerLng = validStations.reduce((sum, s) => sum + s.lng, 0) / validStations.length;
        center = { lat: centerLat, lng: centerLng };
      }
    }


    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      styles: [
        {
          "featureType": "all",
          "elementType": "geometry.fill",
          "stylers": [{ "weight": "2.00" }]
        }
      ]
    });


    // Add a placeholder for controls if needed
  }, [isLoaded, stations]);

  // Initial center on user location if available
  const initialCenterRef = useRef(false);
  useEffect(() => {
    if (isLoaded && googleMapRef.current && userLocation && !initialCenterRef.current && !selectedStation) {
      googleMapRef.current.panTo(userLocation);
      googleMapRef.current.setZoom(14);
      initialCenterRef.current = true;
    }
  }, [isLoaded, userLocation, selectedStation]);

  // Update Markers
  useEffect(() => {
    if (!googleMapRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // If no stations, nothing to place
    if (!stations || stations.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    // Create new markers
    stations.forEach(station => {
      const markerColor = station.stockLevel >= 70 ? 'green' :
        station.stockLevel >= 40 ? 'yellow' : 'red';

      const marker = new google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: googleMapRef.current,
        title: station.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: 'white',
          strokeWeight: 2,
        },
      });

      // Do not open info windows on marker click; only select station in sidebar
      marker.addListener('click', () => {
        onStationSelect(station);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: station.lat, lng: station.lng });
    });

    // Fit map to markers if no selectedStation and no directions showing
    if (markersRef.current.length > 0 && !selectedStation && !showDirections) {
      try {
        googleMapRef.current.fitBounds(bounds, 100);
      } catch (e) {
        // fallback: set center to bounds center
        const nb = bounds.getCenter();
        googleMapRef.current.setCenter(nb);
      }
    }
  }, [stations, isLoaded, onStationSelect, selectedStation, showDirections]);

  // Center on selected station
  useEffect(() => {
    if (!googleMapRef.current || !selectedStation) return;

    const lat = Number(selectedStation.lat);
    const lng = Number(selectedStation.lng);

    // Only pan if coordinates are valid
    if (lat !== 0 && lng !== 0) {
      googleMapRef.current.panTo({ lat, lng });
      if (!showDirections) {
        googleMapRef.current.setZoom(15);
      }
    }
  }, [selectedStation, showDirections]);


  // Show user location marker
  useEffect(() => {
    if (!googleMapRef.current || !isLoaded || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // Create user location marker
    userMarkerRef.current = new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: googleMapRef.current,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3,
      },
    });
  }, [userLocation, isLoaded]);

  // Show directions
  useEffect(() => {
    if (!googleMapRef.current || !isLoaded || !showDirections || !selectedStation || !userLocation) {
      // Clear directions if not showing
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      return;
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: googleMapRef.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: userLocation.lat, lng: userLocation.lng },
        destination: { lat: selectedStation.lat, lng: selectedStation.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current?.setDirections(result);
          // Automatically fit bounds to show the complete route
          if (googleMapRef.current && result.routes?.[0]?.bounds) {
            googleMapRef.current.fitBounds(result.routes[0].bounds);
          }
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [showDirections, selectedStation, userLocation, isLoaded]);

  // (Removed unused clear directions handler)

  // When directions are cleared (or selection cleared), ensure map shows all markers
  useEffect(() => {
    if (!googleMapRef.current || !isLoaded) return;
    if (!selectedStation && !showDirections && markersRef.current.length > 0) {
      const b = new google.maps.LatLngBounds();
      markersRef.current.forEach(m => b.extend(m.getPosition() as google.maps.LatLng));
      googleMapRef.current.fitBounds(b, 100);
    }
  }, [selectedStation, showDirections, isLoaded]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Map Loading Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold mb-2">📍 To enable Google Maps:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Visit <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable "Maps JavaScript API" and "Directions API"</li>
              <li>Create credentials and get your API key</li>
              <li>Replace the API key in <code className="bg-gray-200 px-1 rounded">GoogleMap.tsx</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-card rounded-lg shadow-lg border border-border p-4">
        <h4 className="font-semibold text-sm mb-3 text-foreground">Stock Levels</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-foreground">High (70%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-foreground">Medium (40-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-foreground">Low (&lt;40%)</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-foreground">Your Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Instructions Overlay */}
      {!selectedStation && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card px-6 py-3 rounded-lg shadow-lg border border-border">
          <p className="text-sm text-foreground">
            <span className="font-semibold">💡 Tip:</span> Click on markers or select from the list to view station details
          </p>
        </div>
      )}

      {/* Re-center / My Location Button */}
      {userLocation && (
        <button
          onClick={() => {
            refreshLocation?.();
            if (googleMapRef.current && userLocation) {
              googleMapRef.current.panTo(userLocation);
              googleMapRef.current.setZoom(14);
            }
          }}
          className="absolute bottom-24 right-4 glow-button p-4 rounded-full shadow-2xl border border-border transition-all group scale-110"
          title="Center on My Location"
        >
          <div className="w-4 h-4 rounded-full border-2 border-teal-400 relative">
            <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-teal-400"></div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-teal-400"></div>
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1 h-0.5 bg-teal-400"></div>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-0.5 bg-teal-400"></div>
          </div>
        </button>
      )}

      {/* Clear Directions removed per request */}
    </div>
  );
}