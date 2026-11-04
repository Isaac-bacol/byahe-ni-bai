import React, { useState } from 'react';
import {
  Navigation,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  Users,
  Clock,
  Car,
  ArrowLeft
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { Trip } from '../../types';
import { BoholRouteMap } from '../map/BoholRouteMap';

interface Props {
  onOpenAddTrip: () => void;
  onBack?: () => void;
}

export const TripManager: React.FC<Props> = ({ onOpenAddTrip, onBack }) => {
  const { userType } = useAuth();
  const { userTrips, deleteTrip, fuelStations } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [activeTripForMap, setActiveTripForMap] = useState<Trip | null>(null);

  const filteredTrips = userTrips.filter(t => {
    const matchesSearch =
      t.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.vehicle_name && t.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPurpose = selectedPurpose === 'all' || t.purpose === selectedPurpose;

    return matchesSearch && matchesPurpose;
  });

  const formatPHP = (num: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-5 rounded-3xl shadow-xs transition-colors">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full glass-btn text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Flaticon name="route" className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Trip Management (Listahan sa Biyahe)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track and review your travel history across Bohol municipalities
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddTrip}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Flaticon name="add" className="w-4 h-4" />
          <span>ADD TRIP</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative sm:col-span-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search origin, destination, vehicle, or remarks..."
            className="glass-input w-full pl-9 pr-3 py-2.5 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedPurpose}
            onChange={e => setSelectedPurpose(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2.5 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Purposes</option>
            <option value="Commute / Work" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Commute / Work</option>
            <option value="Passenger Trip" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Passenger Trip</option>
            <option value="Passenger Drop-off (Pakyaw)" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Special Trip / Pakyaw</option>
            <option value="School" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">School</option>
            <option value="Personal Errand" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Personal Errand</option>
            <option value="Tour / Sightseeing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tour / Sightseeing</option>
          </select>
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="rounded-3xl glass-panel p-10 text-center transition-colors">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Flaticon name="route" className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Trips Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedPurpose !== 'all'
              ? 'Try changing your search keywords or filter.'
              : 'You have not recorded any trips yet. Click the "ADD TRIP" button to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map(trip => (
            <div
              key={trip.id}
              className="glass-panel-interactive rounded-2xl p-4 transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-white/40 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg glass-panel-subtle text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                    <Flaticon name="route" className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {trip.origin} <span className="text-emerald-600 dark:text-emerald-400 font-bold">→</span> {trip.destination}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(trip.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                  <span className="flex items-center space-x-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(trip.date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">
                    {trip.vehicle_name || 'Vehicle'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance & Time</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {trip.distance_km} km ({trip.duration || '20 min'})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Purpose</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{trip.purpose}</span>
                </div>

                <div>
                  {userType === 'motorist' ? (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel Cost</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {formatPHP(trip.fuel_cost || 0)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Fare / Net</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPHP(trip.fare || 0)} <span className="text-slate-400 font-normal">/ net: {formatPHP(trip.net_amount || 0)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {(trip.passenger_count || trip.boundary_cost || trip.notes) && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  {trip.passenger_count ? (
                    <span className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Users className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      <span>{trip.passenger_count} Passenger(s)</span>
                    </span>
                  ) : null}

                  {trip.boundary_cost ? (
                    <span className="inline-flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                      <Car className="w-3 h-3" />
                      <span>Boundary: {formatPHP(trip.boundary_cost)}</span>
                    </span>
                  ) : null}

                  {trip.notes && (
                    <span className="italic text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      "{trip.notes}"
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setActiveTripForMap(trip)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Bohol Route Map</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this trip record?')) {
                      deleteTrip(trip.id);
                    }
                  }}
                  className="inline-flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-700 cursor-pointer"
                  title="Delete Trip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTripForMap && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl glass-modal rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 space-y-3 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/20 dark:border-white/10">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {activeTripForMap.origin} → {activeTripForMap.destination}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Distance: {activeTripForMap.distance_km} km • Time: {activeTripForMap.duration || '25 min'}
                </p>
              </div>
              <button
                onClick={() => setActiveTripForMap(null)}
                className="px-3 py-1 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <BoholRouteMap
              originLat={activeTripForMap.origin_lat}
              originLng={activeTripForMap.origin_lng}
              originName={activeTripForMap.origin}
              destLat={activeTripForMap.destination_lat}
              destLng={activeTripForMap.destination_lng}
              destName={activeTripForMap.destination}
              distanceKm={activeTripForMap.distance_km}
              duration={activeTripForMap.duration}
              fuelStations={fuelStations}
              heightClass="h-72"
            />
          </div>
        </div>
      )}
    </div>
  );
};
