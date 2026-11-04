import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  ArrowUpDown,
  Navigation,
  Calculator,
  CheckCircle2,
  LocateFixed,
  MapPin,
  Info,
  Car,
  Play,
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LocationAutocomplete } from '../map/LocationAutocomplete';
import { BoholRouteMap } from '../map/BoholRouteMap';
import { LiveMapboxNavigator } from './LiveMapboxNavigator';
import {
  calculateBoholDistance,
  estimateTravelTime,
  findBoholCoordinates,
  isWithinBohol
} from '../../lib/boholData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiYXlzYWFrIiwiYSI6ImNtdnl5ajZ4NDAwaGoyeXB0ZjZhbWp2azMifQ.j0IsZDEvguXfH1diiTIkvg';

const POPULAR_BOHOL_DESTINATIONS = [
  { name: 'Bohol-Panglao International Airport (BIA)', lat: 9.5695, lng: 123.7745, icon: '✈️' },
  { name: 'Chocolate Hills Complex, Carmen', lat: 9.8315, lng: 124.1685, icon: '⛰️' },
  { name: 'Alona Beach, Panglao', lat: 9.5485, lng: 123.7725, icon: '🏖️' },
  { name: 'Tagbilaran City Sea Port', lat: 9.6582, lng: 123.8475, icon: '🛳️' },
  { name: 'Island City Mall (ICM), Tagbilaran', lat: 9.6515, lng: 123.8685, icon: '🛍️' },
  { name: 'Tubigon FastCat Port', lat: 9.9542, lng: 123.9575, icon: '⛴️' },
  { name: 'Loboc River Cruise Floating Restaurant', lat: 9.6415, lng: 124.0325, icon: '⛵' },
];

export const AddTripModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { userType } = useAuth();
  const { userVehicles, defaultVehicle, addTrip, fuelStations, fuelPrices } = useData();

  // Mode: 'live_navigation' (Waze/Google Maps) vs 'manual_entry'
  const [modalMode, setModalMode] = useState<'live_navigation' | 'manual_entry'>('live_navigation');
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [origin, setOrigin] = useState<string>('Tagbilaran City Sea Port');
  const [destination, setDestination] = useState<string>('Bohol-Panglao International Airport (BIA)');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 9.6582,
    lng: 123.8475,
  });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 9.5695,
    lng: 123.7745,
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [clickTarget, setClickTarget] = useState<'origin' | 'destination'>('destination');

  // Reverse geocode latitude and longitude using Mapbox Geocoding API
  const reverseGeocodeMapbox = async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place,neighborhood,locality`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const feat = data.features[0];
          const parts = feat.place_name.split(',');
          return parts.slice(0, 2).join(', ').trim();
        }
      }
    } catch (e) {
      console.warn('Mapbox reverse geocoding fallback:', e);
    }
    return `GPS Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  // Hardware GPS detection using Mapbox Geocoding and Bohol Bounds Validation
  const handleUseCurrentLocationForOrigin = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationFeedback('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationFeedback('Querying device GPS satellites...');

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const placeName = await reverseGeocodeMapbox(lat, lng);

        if (isWithinBohol(lat, lng)) {
          setOriginCoords({ lat, lng });
          setOrigin(placeName);
          setLocationFeedback(`Active GPS: ${placeName}`);
        } else {
          // If developer/user is outside Bohol (e.g. Cebu, Manila), keep Bohol road navigation intact
          setOriginCoords({ lat: 9.6582, lng: 123.8475 });
          setOrigin('Tagbilaran City Sea Port');
          setLocationFeedback(`Detected in ${placeName} (outside Bohol). Snapped to Tagbilaran Port.`);
        }
        setIsDetectingLocation(false);
      },
      err => {
        setIsDetectingLocation(false);
        setLocationFeedback(`GPS error: ${err.message}. Using default Tagbilaran Port.`);
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 10000 }
    );
  }, []);

  // Automatically attempt to detect user location on open
  useEffect(() => {
    if (isOpen && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (isWithinBohol(lat, lng)) {
            setOriginCoords({ lat, lng });
            const name = await reverseGeocodeMapbox(lat, lng);
            setOrigin(name);
          }
        },
        () => {
          // Keep default Tagbilaran Sea Port
        },
        { enableHighAccuracy: false, timeout: 4000 }
      );
    }
  }, [isOpen]);

  // Handle clicking directly on the Mapbox map to place pin
  const handleMapClick = async (lat: number, lng: number) => {
    const placeName = await reverseGeocodeMapbox(lat, lng);
    if (clickTarget === 'destination') {
      setDestCoords({ lat, lng });
      setDestination(placeName);
      setLocationFeedback(`Destination set from map: ${placeName}`);
    } else {
      setOriginCoords({ lat, lng });
      setOrigin(placeName);
      setLocationFeedback(`Origin set from map: ${placeName}`);
    }
  };

  const [distanceKm, setDistanceKm] = useState<number>(18.5);
  const [duration, setDuration] = useState<string>('32 min');
  const [vehicleId, setVehicleId] = useState<string>(defaultVehicle?.id || (userVehicles[0]?.id || ''));
  const [purpose, setPurpose] = useState<string>('Commute / Work');

  const [fuelCost, setFuelCost] = useState<number>(85);
  const [passengerCount, setPassengerCount] = useState<number>(userType === 'motorist' ? 0 : 1);
  const [fare, setFare] = useState<number>(userType === 'motorist' ? 0 : 250);
  const [boundaryCost, setBoundaryCost] = useState<number>(userType === 'tricycle' ? 100 : 0);
  const [otherExpenses, setOtherExpenses] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [showMapPreview, setShowMapPreview] = useState<boolean>(true);

  // Selected vehicle & matched live benchmark price
  const selectedVeh = useMemo(() => {
    return userVehicles.find(v => v.id === vehicleId) || defaultVehicle || userVehicles[0];
  }, [userVehicles, vehicleId, defaultVehicle]);

  const matchedFuelPrice = useMemo(() => {
    const fuel = selectedVeh?.fuel_type || 'Gasoline';
    const match = fuelPrices.find(p => p.fuel_type === fuel);
    return match?.price_per_liter || (fuel === 'Diesel' ? 58.9 : fuel === 'Premium 95' ? 66.5 : 63.85);
  }, [fuelPrices, selectedVeh]);

  useEffect(() => {
    if (originCoords && destCoords) {
      const calcDist = calculateBoholDistance(
        originCoords.lat,
        originCoords.lng,
        destCoords.lat,
        destCoords.lng
      );
      setDistanceKm(calcDist);

      const estTime = estimateTravelTime(calcDist, selectedVeh?.vehicle_type || 'motorcycle');
      setDuration(estTime);

      const efficiency = selectedVeh?.fuel_efficiency_km_per_l || (userType === 'tricycle' ? 28 : 40);
      const estFuelCost = Math.round((calcDist / efficiency) * matchedFuelPrice);
      setFuelCost(Math.max(15, estFuelCost));
    }
  }, [originCoords, destCoords, selectedVeh, matchedFuelPrice, userType]);

  const handleSwap = () => {
    const tempName = origin;
    const tempCoords = originCoords;
    setOrigin(destination);
    setOriginCoords(destCoords);
    setDestination(tempName);
    setDestCoords(tempCoords);
  };

  const handleOriginChange = (val: string, coords?: { lat: number; lng: number }) => {
    setOrigin(val);
    if (coords) {
      setOriginCoords(coords);
    } else {
      const found = findBoholCoordinates(val);
      if (found) setOriginCoords(found);
    }
  };

  const handleDestChange = (val: string, coords?: { lat: number; lng: number }) => {
    setDestination(val);
    if (coords) {
      setDestCoords(coords);
    } else {
      const found = findBoholCoordinates(val);
      if (found) setDestCoords(found);
    }
  };

  const netEarnings = fare - (fuelCost + boundaryCost + otherExpenses);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentVeh = userVehicles.find(v => v.id === vehicleId);
    const vehicleName = currentVeh ? `${currentVeh.brand} ${currentVeh.model}` : 'Vehicle';

    addTrip({
      date,
      origin,
      destination,
      origin_lat: originCoords?.lat,
      origin_lng: originCoords?.lng,
      destination_lat: destCoords?.lat,
      destination_lng: destCoords?.lng,
      distance_km: Number(distanceKm),
      duration,
      vehicle_id: vehicleId || defaultVehicle?.id,
      vehicle_name: vehicleName,
      purpose,
      fuel_cost: Number(fuelCost),
      passenger_count: Number(passengerCount),
      fare: Number(fare),
      boundary_cost: Number(boundaryCost),
      other_expenses: Number(otherExpenses),
      net_amount: netEarnings,
      notes,
    });

    onClose();
  };

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // FULL-SCREEN WAZE / GOOGLE MAPS LIVE NAVIGATION MODE
  // -------------------------------------------------------------
  if (isNavigating && originCoords && destCoords) {
    return (
      <LiveMapboxNavigator
        origin={{ lat: originCoords.lat, lng: originCoords.lng, name: origin }}
        destination={{ lat: destCoords.lat, lng: destCoords.lng, name: destination }}
        selectedVehicle={selectedVeh}
        fuelPricePerLiter={matchedFuelPrice}
        onClose={() => setIsNavigating(false)}
        onTripCompleted={summary => {
          addTrip({
            date: new Date().toISOString().slice(0, 16),
            origin: summary.origin,
            destination: summary.destination,
            origin_lat: originCoords.lat,
            origin_lng: originCoords.lng,
            destination_lat: destCoords.lat,
            destination_lng: destCoords.lng,
            distance_km: summary.distanceKm,
            duration: summary.duration,
            vehicle_id: summary.vehicleId || selectedVeh?.id,
            vehicle_name: summary.vehicleName || 'Vehicle',
            purpose: purpose || 'Commute / Work',
            fuel_cost: summary.fuelCost,
            passenger_count: Number(passengerCount),
            fare: Number(fare),
            boundary_cost: Number(boundaryCost),
            other_expenses: Number(otherExpenses),
            net_amount: fare - (summary.fuelCost + boundaryCost + otherExpenses),
            notes: `Live Navigation completed. ${notes}`.trim(),
          });
          setIsNavigating(false);
          onClose();
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // ROUTE PLANNER & SELECTION MODAL
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal relative w-full max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden my-0 sm:my-6 max-h-[94vh] flex flex-col border border-white/60 dark:border-white/15">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white shrink-0 border-b border-white/10 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-xs">
              <Navigation className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">Waze & Google Map Live Bohol Navigation</h3>
              <p className="text-[11px] text-sky-100 font-medium">Turn-by-turn road route, live speedometer & fuel tracker</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-white/40 dark:border-white/10 glass-panel-subtle px-4 sm:px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setModalMode('live_navigation')}
            className={`pb-2.5 px-3 text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
              modalMode === 'live_navigation'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>🚗 Live Navigation (Drive Mode)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('manual_entry')}
            className={`pb-2.5 px-3 text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 border-b-2 ${
              modalMode === 'manual_entry'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📝 Log Past Trip Manually</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Vehicle selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Vehicle Assigned
              </label>
              <select
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                {userVehicles.map(veh => (
                  <option
                    key={veh.id}
                    value={veh.id}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {veh.brand} {veh.model} {veh.version ? `(${veh.version})` : ''} • {veh.fuel_efficiency_km_per_l} km/L ({veh.fuel_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Trip Purpose
              </label>
              <select
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                <option value="Commute / Work">Commute / Work</option>
                <option value="School">School</option>
                <option value="Passenger Trip">Passenger Trip (Pasahero)</option>
                <option value="Special Trip / Pakyaw">Special Trip / Pakyaw</option>
                <option value="Personal Errand">Personal Errand / Palit</option>
                <option value="Delivery">Delivery / Hatud</option>
                <option value="Tour / Sightseeing">Tour / Sightseeing</option>
              </select>
            </div>
          </div>

          {/* Route Origin & Destination */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                  📍 Origin (Starting Location)
                </span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocationForOrigin}
                  disabled={isDetectingLocation}
                  className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  title="Detect my current location with device GPS"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use My Current GPS'}</span>
                </button>
              </div>

              {locationFeedback && (
                <div className="mb-2 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-400/30 text-[11px] font-medium text-sky-900 dark:text-sky-300 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                  <span className="truncate">{locationFeedback}</span>
                </div>
              )}

              <LocationAutocomplete
                label=""
                value={origin}
                onChange={handleOriginChange}
                required
              />

              <div className="flex justify-center -my-1 relative z-10">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sky-600 dark:text-sky-400 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                  title="Swap Origin & Destination"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                  🏁 Destination (End Location)
                </span>
              </div>

              <LocationAutocomplete
                label=""
                value={destination}
                onChange={handleDestChange}
                required
              />
            </div>

            {/* Popular Bohol Destination Quick Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Quick Destination Hubs:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BOHOL_DESTINATIONS.map(hub => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => {
                      setDestination(hub.name);
                      setDestCoords({ lat: hub.lat, lng: hub.lng });
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                      destination === hub.name
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    <span>{hub.icon}</span>
                    <span className="truncate max-w-[150px] sm:max-w-none">{hub.name.split(',')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Map Preview & Pinning */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Mapbox Bohol Road Route & Highway
                  </span>
                  <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setClickTarget('destination')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        clickTarget === 'destination'
                          ? 'bg-rose-500 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Map: Dest (B)
                    </button>
                    <button
                      type="button"
                      onClick={() => setClickTarget('origin')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        clickTarget === 'origin'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Map: Start (A)
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMapPreview(!showMapPreview)}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  {showMapPreview ? 'Hide Map' : 'Show Map'}
                </button>
              </div>

              {showMapPreview && (
                <BoholRouteMap
                  originLat={originCoords?.lat}
                  originLng={originCoords?.lng}
                  originName={origin}
                  destLat={destCoords?.lat}
                  destLng={destCoords?.lng}
                  destName={destination}
                  distanceKm={distanceKm}
                  duration={duration}
                  fuelStations={fuelStations}
                  heightClass="h-48 sm:h-56"
                  onMapClick={handleMapClick}
                />
              )}
            </div>

            {/* Trip Stats Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-sky-100/80 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-500/40">
                <span className="text-[10px] text-sky-900 dark:text-sky-300 font-black uppercase block">Distance</span>
                <span className="text-sm sm:text-base font-black text-sky-950 dark:text-white">{distanceKm} km</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40">
                <span className="text-[10px] text-amber-900 dark:text-amber-300 font-black uppercase block">Est. Time</span>
                <span className="text-sm sm:text-base font-black text-amber-950 dark:text-white">{duration}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40">
                <span className="text-[10px] text-emerald-900 dark:text-emerald-300 font-black uppercase block">Est. Fuel</span>
                <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-white">₱{fuelCost}</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* TAB 1: LIVE NAVIGATION (WAZE / GOOGLE MAP) ACTION */}
          {/* ----------------------------------------------------------- */}
          {modalMode === 'live_navigation' && (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setIsNavigating(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-900/30 flex items-center justify-center space-x-2.5 active:scale-98 transition-all cursor-pointer ring-4 ring-emerald-500/20"
              >
                <Play className="w-5 h-5 fill-current animate-pulse" />
                <span>START LIVE NAVIGATION (Drive Mode)</span>
              </button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                Launches full 3D Mapbox camera, GPS speedometer, live turn instructions & arrival detection.
              </p>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 2: MANUAL ENTRY FORM FOR PAST TRIPS                     */}
          {/* ----------------------------------------------------------- */}
          {modalMode === 'manual_entry' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Trip Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Calculator className="w-3.5 h-3.5 text-sky-600" />
                  <span>Trip Financials & Expenses</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fuel Expense (₱)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fuelCost}
                      onChange={e => setFuelCost(Number(e.target.value))}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  {userType !== 'motorist' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Passenger Fare Collected (₱)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={fare}
                          onChange={e => setFare(Number(e.target.value))}
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Passenger Count
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={passengerCount}
                          onChange={e => setPassengerCount(Number(e.target.value))}
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </>
                  )}

                  {userType === 'tricycle' && (
                    <div>
                      <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
                        Boundary Allocation (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={boundaryCost}
                        onChange={e => setBoundaryCost(Number(e.target.value))}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  )}

                  {userType !== 'motorist' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Other Expenses (Snacks, Parking) (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={otherExpenses}
                        onChange={e => setOtherExpenses(Number(e.target.value))}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  )}
                </div>

                {userType !== 'motorist' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Trip Amount:</span>
                    <span
                      className={`text-base font-extrabold ${
                        netEarnings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      ₱{netEarnings.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Heavy rain along Dauis highway, traffic near Dao..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Past Trip</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
