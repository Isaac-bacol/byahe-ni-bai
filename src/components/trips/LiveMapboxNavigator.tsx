import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import confetti from 'canvas-confetti';
import {
  X,
  Navigation,
  Compass,
  Gauge,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MapPin,
  Flag,
  CheckCircle2,
  Sparkles,
  RotateCw,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { Vehicle } from '../../types';

// Mapbox Public Access Token
export const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoiYXlzYWFrIiwiYSI6ImNtdnl5ajZ4NDAwaGoyeXB0ZjZhbWp2azMifQ.j0IsZDEvguXfH1diiTIkvg';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export interface LiveNavigatorProps {
  origin?: { lat: number; lng: number; name: string };
  destination?: { lat: number; lng: number; name: string };
  selectedVehicle?: Vehicle;
  fuelPricePerLiter?: number;
  onClose: () => void;
  onTripCompleted?: (summary: {
    origin: string;
    destination: string;
    distanceKm: number;
    duration: string;
    fuelCost: number;
    vehicleId?: string;
    vehicleName?: string;
  }) => void;
}

interface RouteStep {
  instruction: string;
  type: string;
  modifier?: string;
  distance: number;
  location: [number, number];
  name: string;
}

// Calculate bearing (heading) in degrees (0 - 360) from coordinate 1 to 2
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Calculate distance in meters using Haversine formula
function calculateMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const LiveMapboxNavigator: React.FC<LiveNavigatorProps> = ({
  origin,
  destination,
  selectedVehicle,
  fuelPricePerLiter = 63.85,
  onClose,
  onTripCompleted,
}) => {
  const { isDarkMode } = useAuth();
  const { fuelStations } = useData();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const vehicleMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const chevronElRef = useRef<HTMLDivElement | null>(null);
  const watchPositionIdRef = useRef<number | null>(null);
  const previousCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Live telemetry state
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [bearing, setBearing] = useState<number>(0);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: origin?.lat || 9.6582,
    lng: origin?.lng || 123.8475,
  });
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'active' | 'error'>('acquiring');
  const [gpsMessage, setGpsMessage] = useState<string>('Locking GPS satellites...');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);

  // Optional Route & Destination tracking
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [totalDistanceMeters, setTotalDistanceMeters] = useState<number>(0);
  const [distanceRemainingMeters, setDistanceRemainingMeters] = useState<number>(0);
  const [isArrived, setIsArrived] = useState<boolean>(false);

  // Desktop / stationary simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(2);
  const simIndexRef = useRef<number>(0);

  // Vehicle fuel metrics
  const kmPerLiter = selectedVehicle?.fuel_efficiency_km_per_l || 40;
  const distanceTraveledKm = Math.max(0, (totalDistanceMeters - distanceRemainingMeters) / 1000);
  const fuelBurnedPesos = Math.max(5, Math.round((distanceTraveledKm / kmPerLiter) * fuelPricePerLiter));

  // Voice speech synthesis
  const speakInstruction = useCallback(
    (text: string) => {
      if (isVoiceMuted || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech API restrictions fallback
      }
    },
    [isVoiceMuted]
  );

  // 1. Fetch directions route geometry if destination is provided
  useEffect(() => {
    if (!origin || !destination) return;

    let isMounted = true;
    async function fetchDirections() {
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin!.lng},${origin!.lat};${destination!.lng},${destination!.lat}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.routes || data.routes.length === 0) return;

        const route = data.routes[0];
        setRouteCoordinates(route.geometry.coordinates);
        setTotalDistanceMeters(route.distance);
        setDistanceRemainingMeters(route.distance);

        if (route.legs && route.legs[0]?.steps) {
          const parsedSteps = route.legs[0].steps.map((s: any) => ({
            instruction: s.maneuver.instruction,
            type: s.maneuver.type,
            modifier: s.maneuver.modifier,
            distance: s.distance,
            location: s.maneuver.location,
            name: s.name,
          }));
          setSteps(parsedSteps);
          if (parsedSteps.length > 0) {
            speakInstruction(parsedSteps[0].instruction);
          }
        }
      } catch (err) {
        console.warn('Mapbox directions fetch error:', err);
      }
    }

    fetchDirections();
    return () => {
      isMounted = false;
    };
  }, [origin, destination, speakInstruction]);

  // 2. Initialize 3D Mapbox Map with navigation-day-v1 style
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use Mapbox official navigation style as required
    const mapStyle = isDarkMode
      ? 'mapbox://styles/mapbox/navigation-night-v1'
      : 'mapbox://styles/mapbox/navigation-day-v1';

    const initialCenter: [number, number] = [
      origin?.lng || 123.8475,
      origin?.lat || 9.6582,
    ];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: initialCenter,
      zoom: 16,
      pitch: 58, // 3D Waze-style angled perspective
      bearing: 0,
      attributionControl: false, // Clean HUD with no default controls
    });

    mapRef.current = map;

    // Build Custom HTML 3D Vehicle Marker Element
    const markerWrapper = document.createElement('div');
    markerWrapper.style.cssText = `
      position: relative;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    `;

    // Outer pulsating radar wave
    const pulseRing = document.createElement('div');
    pulseRing.style.cssText = `
      position: absolute;
      inset: 0px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.28);
      animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
    `;
    markerWrapper.appendChild(pulseRing);

    // Inner vehicle arrow disc
    const chevronDisc = document.createElement('div');
    chevronDisc.style.cssText = `
      width: 42px;
      height: 42px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #0284c7 0%, #10b981 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #ffffff;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    chevronDisc.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#ffffff" fill-opacity="0.95"></polygon>
      </svg>
    `;
    markerWrapper.appendChild(chevronDisc);
    chevronElRef.current = chevronDisc;

    // Attach Marker to Map
    vehicleMarkerRef.current = new mapboxgl.Marker({
      element: markerWrapper,
      rotationAlignment: 'map',
      pitchAlignment: 'map',
    })
      .setLngLat(initialCenter)
      .addTo(map);

    // On style load, add route line if coordinates are available
    map.on('load', () => {
      map.addSource('route-line-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates.length > 0 ? routeCoordinates : [initialCenter],
          },
        },
      });

      // Outer glow line
      map.addLayer({
        id: 'route-line-casing',
        type: 'line',
        source: 'route-line-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0284c7',
          'line-width': 10,
          'line-opacity': 0.65,
        },
      });

      // Main navigation path
      map.addLayer({
        id: 'route-line-core',
        type: 'line',
        source: 'route-line-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#10b981',
          'line-width': 6,
          'line-opacity': 0.95,
        },
      });
    });

    // Cleanup on unmount
    return () => {
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.remove();
      }
      map.remove();
    };
  }, [isDarkMode]);

  // Update route line on map when routeCoordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || routeCoordinates.length === 0) return;

    const source = map.getSource('route-line-source') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        },
      });
    }
  }, [routeCoordinates]);

  // Elapsed trip timer
  useEffect(() => {
    if (isArrived) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isArrived]);

  // 3. Live Geolocation & Bearing Tracker via navigator.geolocation.watchPosition
  useEffect(() => {
    if (isSimulating || isArrived) {
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setGpsMessage('Geolocation not supported by this device/browser');
      return;
    }

    watchPositionIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, speed, heading } = pos.coords;
        setGpsStatus('active');
        setGpsMessage('GPS 3D Fix Active');

        // Convert speed from m/s to km/h
        const liveSpeedKmh = speed !== null && speed > 0 ? Math.round(speed * 3.6) : 0;
        setSpeedKmh(liveSpeedKmh);

        // Determine bearing (heading)
        let resolvedBearing = bearing;
        if (heading !== null && !isNaN(heading)) {
          resolvedBearing = heading;
        } else if (previousCoordsRef.current) {
          const calc = calculateBearing(
            previousCoordsRef.current.lat,
            previousCoordsRef.current.lng,
            latitude,
            longitude
          );
          if (!isNaN(calc)) resolvedBearing = calc;
        }

        previousCoordsRef.current = { lat: latitude, lng: longitude };
        setCurrentCoords({ lat: latitude, lng: longitude });
        setBearing(resolvedBearing);

        // Update HTML vehicle marker
        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLngLat([longitude, latitude]);
        }
        if (chevronElRef.current) {
          chevronElRef.current.style.transform = `rotate(${resolvedBearing}deg)`;
        }

        // Keep vehicle pointing forward in 3D perspective (pitch: 58)
        const map = mapRef.current;
        if (map) {
          map.easeTo({
            center: [longitude, latitude],
            bearing: resolvedBearing,
            pitch: 58,
            zoom: 16.5,
            duration: 450,
          });
        }

        // Proximity arrival check if destination is provided
        if (destination) {
          const distToDest = calculateMeters(latitude, longitude, destination.lat, destination.lng);
          setDistanceRemainingMeters(Math.round(distToDest));
          if (distToDest <= 35 && !isArrived) {
            handleArrival();
          }
        }
      },
      err => {
        console.warn('Geolocation watchPosition error:', err);
        setGpsStatus('error');
        setGpsMessage(err.message || 'GPS Signal Lost');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 8000,
      }
    );

    // Lifecycle cleanup
    return () => {
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
        watchPositionIdRef.current = null;
      }
    };
  }, [isSimulating, isArrived, bearing, destination]);

  // 4. Desktop Simulation Loop (for instant testing without needing to physically drive)
  useEffect(() => {
    if (!isSimulating || isArrived || routeCoordinates.length === 0) return;

    const interval = setInterval(() => {
      const totalPoints = routeCoordinates.length;
      let nextIndex = simIndexRef.current + simSpeedMultiplier;

      if (nextIndex >= totalPoints - 1) {
        nextIndex = totalPoints - 1;
        simIndexRef.current = nextIndex;
        handleArrival();
        return;
      }

      simIndexRef.current = nextIndex;

      const currentPt = routeCoordinates[nextIndex];
      const prevPt = routeCoordinates[Math.max(0, nextIndex - 1)];
      const nextPt = routeCoordinates[Math.min(totalPoints - 1, nextIndex + 1)];

      const [cLng, cLat] = currentPt;
      const headingDeg = calculateBearing(prevPt[1], prevPt[0], nextPt[1], nextPt[0]);

      setCurrentCoords({ lat: cLat, lng: cLng });
      setBearing(headingDeg);

      // Realistic speed fluctuation (40 - 55 km/h modulated by turns)
      const simulatedSpeed = Math.round((45 + Math.sin(nextIndex / 4) * 8) * (simSpeedMultiplier > 2 ? 1.3 : 1));
      setSpeedKmh(simulatedSpeed);

      const progress = nextIndex / (totalPoints - 1);
      const remaining = Math.max(0, totalDistanceMeters * (1 - progress));
      setDistanceRemainingMeters(Math.round(remaining));

      // Advance turn-by-turn maneuvers
      if (steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const stepLoc = steps[i].location;
          const distToStep = calculateMeters(cLat, cLng, stepLoc[1], stepLoc[0]);
          if (distToStep < 65 && i !== currentStepIndex) {
            setCurrentStepIndex(i);
            speakInstruction(steps[i].instruction);
            break;
          }
        }
      }

      // Update marker and map position
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLngLat([cLng, cLat]);
      }
      if (chevronElRef.current) {
        chevronElRef.current.style.transform = `rotate(${headingDeg}deg)`;
      }

      const map = mapRef.current;
      if (map) {
        map.easeTo({
          center: [cLng, cLat],
          bearing: headingDeg,
          pitch: 58,
          zoom: 16.5,
          duration: 380,
        });
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isSimulating, isArrived, routeCoordinates, totalDistanceMeters, steps, currentStepIndex, simSpeedMultiplier, speakInstruction]);

  // Handle arrival
  const handleArrival = useCallback(() => {
    setIsArrived(true);
    setSpeedKmh(0);
    setDistanceRemainingMeters(0);

    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
    });

    speakInstruction('You have arrived at your destination!');

    const map = mapRef.current;
    if (map) {
      map.easeTo({
        pitch: 20,
        zoom: 15,
        bearing: 0,
        duration: 1200,
      });
    }
  }, [speakInstruction]);

  // Recenter map camera on vehicle
  const handleRecenter = () => {
    const map = mapRef.current;
    if (map) {
      map.easeTo({
        center: [currentCoords.lng, currentCoords.lat],
        bearing: bearing,
        pitch: 58,
        zoom: 16.5,
        duration: 500,
      });
    }
  };

  // Save completed trip
  const handleSaveTrip = () => {
    const km = Math.max(0.5, Math.round((totalDistanceMeters / 1000) * 10) / 10);
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));

    if (onTripCompleted) {
      onTripCompleted({
        origin: origin?.name || 'Current Location',
        destination: destination?.name || 'Bohol Destination',
        distanceKm: km,
        duration: `${mins} min`,
        fuelCost: fuelBurnedPesos,
        vehicleId: selectedVehicle?.id,
        vehicleName: selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Vehicle',
      });
    } else {
      onClose();
    }
  };

  // Maneuver Icon
  const currentStep = steps[currentStepIndex] || {
    instruction: destination ? `Drive towards ${destination.name}` : 'Driving on Bohol Highway',
    type: 'depart',
  };

  const renderManeuverIcon = () => {
    const mod = currentStep.modifier;
    const type = currentStep.type;
    if (type === 'arrive') return <Flag className="w-8 h-8 text-rose-400" />;
    if (type === 'roundabout') return <RotateCw className="w-8 h-8 text-amber-400" />;
    if (mod?.includes('right')) return <CornerUpRight className="w-8 h-8 text-emerald-400" />;
    if (mod?.includes('left')) return <CornerUpLeft className="w-8 h-8 text-emerald-400" />;
    return <ArrowUp className="w-8 h-8 text-cyan-400" />;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden">
      {/* ========================================================= */}
      {/* 1. TOP TURN-BY-TURN HUD (WAZE / GOOGLE MAPS HEADER)       */}
      {/* ========================================================= */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 pointer-events-none">
        <div className="max-w-xl mx-auto flex flex-col gap-2 pointer-events-auto">
          <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
              {/* Maneuver Icon Squircle */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                {renderManeuverIcon()}
              </div>

              {/* Maneuver Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    {distanceRemainingMeters > 0 ? formatDistance(distanceRemainingMeters) : 'Live Route'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold">
                    Bohol GPS
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5 line-clamp-1">
                  {currentStep.instruction}
                </h2>
              </div>
            </div>

            {/* Top Right Controls (Voice Mute & Close) */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isVoiceMuted
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                }`}
                title={isVoiceMuted ? 'Unmute Voice Guidance' : 'Mute Voice Guidance'}
              >
                {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-300 border border-white/15 transition-all cursor-pointer"
                title="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAPBOX 3D WEBGL CONTAINER (pitch: 58, navigation-day)  */}
      {/* ========================================================= */}
      <div className="relative w-full h-full flex-1">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Controls Over Map */}
        <div className="absolute right-3 sm:right-4 top-28 z-20 flex flex-col space-y-2">
          {/* Recenter Camera Button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md cursor-pointer active:scale-90 transition-transform"
            title="Recenter Camera on Vehicle"
          >
            <Navigation className="w-5 h-5 text-emerald-400" />
          </button>

          {/* Compass Reset */}
          <button
            type="button"
            onClick={() => {
              if (mapRef.current) mapRef.current.resetNorthPitch();
            }}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md cursor-pointer active:scale-90 transition-transform"
            title="Reset North Orientation"
          >
            <Compass className="w-5 h-5 text-sky-400" />
          </button>
        </div>

        {/* GPS Status Indicator */}
        <div className="absolute left-3 sm:left-4 top-28 z-20">
          <div className="p-2 px-3 rounded-2xl bg-slate-900/90 border border-white/20 backdrop-blur-md text-xs shadow-xl flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                gpsStatus === 'active'
                  ? 'bg-emerald-500 animate-pulse'
                  : gpsStatus === 'acquiring'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span className="font-extrabold text-white text-[11px]">{gpsMessage}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. COCKPIT INSTRUMENTATION & SPEEDOMETER HUD              */}
      {/* ========================================================= */}
      <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-white/10 backdrop-blur-xl z-20">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="grid grid-cols-4 gap-2 items-center text-center">
            {/* Speedometer (m/s to km/h conversion) */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-400" />
                <span>Speed</span>
              </span>
              <div className="flex items-baseline space-x-0.5 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-white">{speedKmh}</span>
                <span className="text-[9px] font-bold text-slate-400">km/h</span>
              </div>
            </div>

            {/* Remaining Distance */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>Distance</span>
              </span>
              <span className="text-base sm:text-lg font-black text-sky-300 mt-0.5 truncate">
                {distanceRemainingMeters > 0 ? formatDistance(distanceRemainingMeters) : '--'}
              </span>
            </div>

            {/* Elapsed Time */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>Time</span>
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300 mt-0.5 truncate">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            {/* Live Fuel Cost */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Fuel</span>
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 truncate">
                ₱{fuelBurnedPesos}
              </span>
            </div>
          </div>

          {/* Drive & Simulation Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                  isSimulating
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                    : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
                }`}
                title="Toggle route simulation vs live GPS"
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Pause Sim' : 'Simulate'}</span>
              </button>

              {isSimulating && (
                <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10 text-[11px]">
                  {[1, 2, 5].map(spd => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSimSpeedMultiplier(spd)}
                      className={`px-2 py-1 rounded-lg font-black transition-colors cursor-pointer ${
                        simSpeedMultiplier === spd
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {destination && (
                <button
                  type="button"
                  onClick={handleArrival}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-900/40 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
                  title="Finish navigation and log trip"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Arrive</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Close Navigation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. ARRIVAL CELEBRATION MODAL                              */}
      {/* ========================================================= */}
      {isArrived && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Naabot na ka! (You have arrived!)</h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Destination reached: <span className="font-bold text-emerald-400">{destination?.name || 'Bohol Route'}</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Distance</span>
                <span className="text-base font-black text-sky-400">
                  {formatDistance(totalDistanceMeters)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Time</span>
                <span className="text-base font-black text-amber-400">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Fuel Cost</span>
                <span className="text-base font-black text-emerald-400">
                  ₱{fuelBurnedPesos}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Close without Saving
              </button>
              <button
                type="button"
                onClick={handleSaveTrip}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs font-black text-white shadow-lg shadow-emerald-900/50 transition-all cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Trip to Logbook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
