import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  Car,
  Bell,
  Sun,
  Moon,
  LogOut,
  ArrowUpRight,
  CheckCircle2,
  X,
  Repeat,
  ChevronRight,
  Calculator,
  Compass,
  DollarSign
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';
import { FuelCareTipsCard } from '../common/FuelCareTipsCard';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useFuelPriceFeed } from '../../lib/fuelPriceSync';
import type { Trip } from '../../types';

interface Props {
  onOpenAddTrip: () => void;
  onNavigate: (tab: string) => void;
  onOpenWhatsNew?: () => void;
  onOpenSupabaseConfig?: () => void;
}

export const DashboardView: React.FC<Props> = ({
  onOpenAddTrip,
  onNavigate,
  onOpenWhatsNew,
  onOpenSupabaseConfig,
}) => {
  const { currentUser, userType, isDarkMode, toggleTheme, logout } = useAuth();
  const { financialSummary, userTrips, fuelPrices, fuelStations, defaultVehicle, addTrip } = useData();
  const { feed } = useFuelPriceFeed();

  if (!currentUser) return null;

  // Interactive UI state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedFuelType, setSelectedFuelType] = useState<'Gasoline' | 'Diesel'>('Gasoline');
  const [driverStatus, setDriverStatus] = useState<'on_duty' | 'standby' | 'off_duty'>('on_duty');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Format currency
  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Live dates
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Dynamic filter for trips by interactive period
  const periodTrips = useMemo(() => {
    if (period === 'today') {
      return userTrips.filter(t => t.date && t.date.startsWith(todayStr));
    }
    if (period === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return userTrips.filter(t => new Date(t.date) >= oneWeekAgo);
    }
    if (period === 'month') {
      const currentMonthPrefix = todayStr.slice(0, 7);
      return userTrips.filter(t => t.date && t.date.startsWith(currentMonthPrefix));
    }
    return userTrips;
  }, [userTrips, period, todayStr]);

  // Aggregated dynamic stats for selected period
  const periodDistanceKm = Math.round(periodTrips.reduce((acc, t) => acc + (Number(t.distance_km) || 0), 0) * 10) / 10;
  const periodTripsCount = periodTrips.length;
  const periodFuelCost = periodTrips.reduce((acc, t) => acc + (Number(t.fuel_cost) || 0), 0);
  const periodFares = periodTrips.reduce((acc, t) => acc + (Number(t.fare) || 0), 0);
  const periodBoundary = periodTrips.reduce((acc, t) => acc + (Number(t.boundary_cost) || 0), 0);
  const periodOtherExp = periodTrips.reduce((acc, t) => acc + (Number(t.other_expenses) || 0), 0);
  const periodNetHabal = periodFares - (periodFuelCost + periodOtherExp);
  const periodNetTricycle = periodFares - (periodFuelCost + periodBoundary + periodOtherExp);

  // Recent 3 trips
  const recentTrips = userTrips.slice(0, 3);

  // Latest Tagbilaran / fuelprice.ph benchmark fuel prices
  const latestGasPrice = fuelPrices.find(p => p.fuel_type === 'Gasoline')?.price_per_liter || feed.gasoline.price;
  const latestDieselPrice = fuelPrices.find(p => p.fuel_type === 'Diesel')?.price_per_liter || feed.diesel.price;

  // Find lowest price station dynamically in Bohol
  const lowestStation = useMemo(() => {
    const stationOffsets: Record<string, number> = {
      'fs-1': -0.90, // Petron Tagbilaran North
      'fs-2': -1.45, // Shell CPG Avenue
      'fs-3': -1.95, // Caltex Dao Terminal (Lowest)
      'fs-4': +1.20, // Phoenix Panglao
      'fs-5': -0.50, // Seaoil Dauis
      'fs-6': -0.75, // Petron Tubigon
      'fs-7': +0.80, // Caltex Carmen
      'fs-8': +0.40, // Shell Jagna
      'fs-9': -1.10, // Cleanfuel Ubay
    };

    const benchmark = selectedFuelType === 'Gasoline' ? latestGasPrice : latestDieselPrice;

    if (!fuelStations || fuelStations.length === 0) {
      return {
        name: 'Caltex Dao Terminal',
        municipality: 'Tagbilaran City',
        price: benchmark - 1.95,
        savings: 1.95,
      };
    }

    let bestStation = fuelStations[0];
    let bestPrice = benchmark + (stationOffsets[bestStation.id] || 0);

    for (const station of fuelStations) {
      const price = benchmark + (stationOffsets[station.id] || 0);
      if (price < bestPrice) {
        bestPrice = price;
        bestStation = station;
      }
    }

    return {
      name: bestStation.name,
      municipality: bestStation.municipality,
      price: bestPrice,
      savings: Math.max(0, benchmark - bestPrice),
    };
  }, [fuelStations, selectedFuelType, latestGasPrice, latestDieselPrice]);

  // Motorist allowance usage percentage
  const allowancePercentUsed = Math.min(
    100,
    Math.round((financialSummary.allowanceUsed / (financialSummary.allowanceBudget || 1)) * 100)
  );

  // Quick 1-Tap Repeat Trip handler
  const handleRepeatTrip = (trip: Trip) => {
    addTrip({
      origin: trip.origin,
      destination: trip.destination,
      distance_km: trip.distance_km,
      duration: trip.duration,
      vehicle_id: trip.vehicle_id || defaultVehicle?.id,
      vehicle_name: trip.vehicle_name || (defaultVehicle ? `${defaultVehicle.brand} ${defaultVehicle.model}` : 'Vehicle'),
      purpose: trip.purpose,
      fuel_cost: trip.fuel_cost,
      fare: trip.fare,
      boundary_cost: trip.boundary_cost,
      other_expenses: trip.other_expenses,
      notes: `Biyahe usab gikan sa ${trip.origin}`,
      date: new Date().toISOString(),
    });
    setToastMessage(`✓ Biyahe gi-rekord: ${trip.origin} → ${trip.destination} (${formatPHP(trip.fuel_cost || trip.fare || 0)})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Cycle driver status
  const cycleDriverStatus = () => {
    if (driverStatus === 'on_duty') setDriverStatus('standby');
    else if (driverStatus === 'standby') setDriverStatus('off_duty');
    else setDriverStatus('on_duty');
  };

  // Dynamic Metric summary configuration adapting to period filter and role
  const getMetrics = () => {
    switch (userType) {
      case 'habal_habal':
        return {
          m1: {
            label: period === 'today' ? 'Net Today' : period === 'week' ? 'Week Net' : period === 'month' ? 'Month Net' : 'Total Net',
            value: formatPHP(periodNetHabal),
            pillText: 'Take-Home',
            pillClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-800/60',
            targetTab: 'finances',
          },
          m2: {
            label: 'Fares (Plete)',
            value: formatPHP(periodFares),
            pillText: `${periodTripsCount} rides`,
            pillClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300/40 dark:border-cyan-800/60',
            targetTab: 'finances',
          },
          m3: {
            label: 'Expenses',
            value: formatPHP(periodFuelCost + periodOtherExp),
            pillText: 'Fuel & Ops',
            pillClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300/40 dark:border-rose-800/60',
            targetTab: 'finances',
          },
        };
      case 'tricycle':
        return {
          m1: {
            label: period === 'today' ? 'Net Profit' : period === 'week' ? 'Week Profit' : period === 'month' ? 'Month Profit' : 'Total Profit',
            value: formatPHP(periodNetTricycle),
            pillText: 'Daily Take-Home',
            pillClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-800/60',
            targetTab: 'finances',
          },
          m2: {
            label: 'TODA Fares',
            value: formatPHP(periodFares),
            pillText: 'Gross Collections',
            pillClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300/40 dark:border-cyan-800/60',
            targetTab: 'finances',
          },
          m3: {
            label: 'Expenses',
            value: formatPHP(periodBoundary + periodFuelCost),
            pillText: `Boundary: ${formatPHP(periodBoundary)}`,
            pillClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300/40 dark:border-amber-800/60',
            targetTab: 'finances',
          },
        };
      case 'admin':
        return {
          m1: {
            label: 'Drivers',
            value: '4 Drivers',
            pillText: 'Bohol Active',
            pillClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-800/60',
            targetTab: 'dashboard',
          },
          m2: {
            label: 'Island Trips',
            value: `${periodTripsCount} Trips`,
            pillText: `${periodDistanceKm} km logged`,
            pillClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300/40 dark:border-cyan-800/60',
            targetTab: 'trips',
          },
          m3: {
            label: 'Benchmark',
            value: `₱${latestGasPrice.toFixed(2)}`,
            pillText: 'fuelprice.ph',
            pillClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300/40 dark:border-cyan-800/60',
            targetTab: 'compare',
          },
        };
      case 'motorist':
      default:
        return {
          m1: {
            label: period === 'today' ? 'Spent Today' : period === 'week' ? 'Week Spend' : 'Allowance',
            value: period === 'today' ? formatPHP(periodFuelCost) : period === 'week' ? formatPHP(periodFuelCost) : formatPHP(financialSummary.allowanceBudget),
            pillText: period === 'today' ? `${periodTripsCount} Trips Today` : period === 'week' ? `${periodDistanceKm} km` : `${formatPHP(financialSummary.allowanceRemaining)} Left`,
            pillClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-800/60',
            targetTab: 'finances',
          },
          m2: {
            label: period === 'today' ? 'Allowance' : period === 'month' ? 'Budget Used' : 'Efficiency',
            value: period === 'today' ? formatPHP(financialSummary.allowanceRemaining) : period === 'month' ? formatPHP(financialSummary.allowanceUsed) : (periodDistanceKm > 0 ? `₱${(periodFuelCost / periodDistanceKm).toFixed(1)}/km` : '₱0.0/km'),
            pillText: period === 'today' ? `${allowancePercentUsed}% Used` : period === 'month' ? `${allowancePercentUsed}% Consumed` : 'Fuel Rate',
            pillClass:
              allowancePercentUsed > 80
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300/40 dark:border-rose-800/60'
                : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300/40 dark:border-cyan-800/60',
            targetTab: 'finances',
          },
          m3: {
            label: 'Total Trips',
            value: `${periodTripsCount} Trips`,
            pillText: `${periodDistanceKm} km Total`,
            pillClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300/40 dark:border-cyan-800/60',
            targetTab: 'trips',
          },
        };
    }
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 md:pb-6">
      {/* Dynamic 1-Tap Toast Banner */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white p-1 cursor-pointer rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. App-Oriented Driver Header */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Logo squircle */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <img src="/logo.png?v=3" alt="Byahe ni Bai" className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight shrink-0 whitespace-nowrap">
                Kumusta, {currentUser.name.split(' ')[0]}!
              </h1>
              {/* Interactive Driver Status Toggle */}
              <button
                onClick={cycleDriverStatus}
                title="I-tap para usbon ang shift status (On Duty / Standby / Off Duty)"
                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition-transform active:scale-90 cursor-pointer shrink-0"
                style={{
                  backgroundColor: driverStatus === 'on_duty' ? 'rgba(16, 185, 129, 0.15)' : driverStatus === 'standby' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: driverStatus === 'on_duty' ? '#10b981' : driverStatus === 'standby' ? '#f59e0b' : '#94a3b8',
                  borderColor: driverStatus === 'on_duty' ? 'rgba(16, 185, 129, 0.3)' : driverStatus === 'standby' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(148, 163, 184, 0.3)',
                }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    driverStatus === 'on_duty' ? 'bg-emerald-500 animate-pulse' : driverStatus === 'standby' ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                />
                <span>
                  {driverStatus === 'on_duty' ? 'On Duty' : driverStatus === 'standby' ? 'Standby' : 'Off'}
                </span>
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              <span>{currentUser.municipality}</span> •{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                {userType === 'motorist' ? 'Motorist' : userType === 'habal_habal' ? 'Habal-Habal' : userType === 'tricycle' ? 'Tricycle' : 'Admin'}
              </span>
              {defaultVehicle ? (
                <span className="hidden sm:inline"> • {defaultVehicle.brand} {defaultVehicle.model}</span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Theme Toggle + Notification Bell + Profile Avatar Menu */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 relative">
          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-btn flex items-center justify-center text-slate-800 dark:text-slate-100 shadow-2xs transition-all active:scale-90 hover:scale-105 hover:text-slate-950 dark:hover:text-white cursor-pointer"
          >
            <ThemeToggleIcon isDarkMode={isDarkMode} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Right Notification Bell Button (with alert badge) */}
          <button
            onClick={onOpenWhatsNew}
            title="Bohol Fuel Alerts & Advisories"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-btn flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs relative transition-transform active:scale-95 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Profile Avatar / Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title={`${currentUser.name} (${userType})`}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white/30 active:scale-95 cursor-pointer"
            >
              <span>{currentUser.name.charAt(0)}</span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 glass-modal rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="pb-2 mb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.municipality} • <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">{(userType || 'motorist').replace('_', ' ')}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('vehicles');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 flex items-center space-x-2 cursor-pointer transition-colors"
                  >
                    <Car className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Garage Vehicles</span>
                  </button>

                  {/* Theme Mode Toggle inside menu */}
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <ThemeToggleIcon isDarkMode={isDarkMode} className="w-4 h-4" />
                      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {isDarkMode ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  {onOpenSupabaseConfig && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenSupabaseConfig();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 flex items-center space-x-2 cursor-pointer transition-colors"
                    >
                      <Flaticon name="reports" className="w-3.5 h-3.5 text-slate-500" />
                      <span>Supabase Cloud DB</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-950/40 flex items-center space-x-2 cursor-pointer pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Time Filter Tabs (Karon / Semana / Bulan) */}
      <div className="flex items-center justify-between gap-2 p-1 glass-panel rounded-2xl shadow-xs">
        <div className="grid grid-cols-4 w-full gap-1 text-[11px] font-extrabold">
          <button
            onClick={() => setPeriod('today')}
            className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer truncate text-center ${
              period === 'today'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black shadow-xs border-emerald-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            Karon (Today)
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer truncate text-center ${
              period === 'week'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black shadow-xs border-emerald-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            Semana (7D)
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer truncate text-center ${
              period === 'month'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black shadow-xs border-emerald-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            Bulan (Month)
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer truncate text-center ${
              period === 'all'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black shadow-xs border-emerald-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            Tanan (All)
          </button>
        </div>
      </div>

      {/* 3. Three Interactive Metric Cards (Clear UI Hierarchy: Hero Metric Focal Point vs Secondary Metrics) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Card 1: Primary Hero Metric */}
        <div
          onClick={() => onNavigate(metrics.m1.targetTab)}
          title={`Click to open ${metrics.m1.targetTab}`}
          className="rounded-2xl p-2.5 sm:p-3.5 cursor-pointer shadow-sm flex flex-col justify-between min-h-[102px] sm:min-h-[114px] group transition-all relative overflow-hidden glass-panel border border-emerald-500/50 dark:border-emerald-400/60 bg-linear-to-br from-emerald-500/15 via-teal-500/5 to-transparent hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider leading-tight">
              {metrics.m1.label}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white my-1 tracking-tight truncate">
            {metrics.m1.value}
          </div>
          <div>
            <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold border leading-tight truncate max-w-full backdrop-blur-xs ${metrics.m1.pillClass}`}>
              {metrics.m1.pillText}
            </span>
          </div>
        </div>

        {/* Card 2: Secondary Supporting Metric */}
        <div
          onClick={() => onNavigate(metrics.m2.targetTab)}
          title={`Click to open ${metrics.m2.targetTab}`}
          className="rounded-2xl glass-panel-interactive p-2.5 sm:p-3.5 hover:border-cyan-500/60 cursor-pointer shadow-xs flex flex-col justify-between min-h-[102px] sm:min-h-[114px] group transition-all"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
              {metrics.m2.label}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white my-1 tracking-tight truncate">
            {metrics.m2.value}
          </div>
          <div>
            <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold border leading-tight truncate max-w-full backdrop-blur-xs ${metrics.m2.pillClass}`}>
              {metrics.m2.pillText}
            </span>
          </div>
        </div>

        {/* Card 3: Tertiary Supporting Metric */}
        <div
          onClick={() => onNavigate(metrics.m3.targetTab)}
          title={`Click to open ${metrics.m3.targetTab}`}
          className="rounded-2xl glass-panel-interactive p-2.5 sm:p-3.5 hover:border-emerald-500/60 cursor-pointer shadow-xs flex flex-col justify-between min-h-[102px] sm:min-h-[114px] group transition-all"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
              {metrics.m3.label}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white my-1 tracking-tight truncate">
            {metrics.m3.value}
          </div>
          <div>
            <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold border leading-tight truncate max-w-full backdrop-blur-xs ${metrics.m3.pillClass}`}>
              {metrics.m3.pillText}
            </span>
          </div>
        </div>
      </div>

      {/* 4. One-Tap Quick Actions Bar (Visual Hierarchy: Primary CTA vs Supporting Utilities) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Action 1: Add Trip (PRIMARY CTA) */}
        <button
          onClick={onOpenAddTrip}
          className="flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 sm:py-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-900/25 hover:shadow-lg hover:from-cyan-500 hover:to-emerald-500 active:scale-95 cursor-pointer group border border-white/30 transition-all relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-black text-white mt-1.5 text-center leading-tight tracking-tight">
            Log Biyahe
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-cyan-100 opacity-90 leading-none mt-0.5">
            + Quick Add
          </span>
        </button>

        {/* Action 2: Fuel Calculator */}
        <button
          onClick={() => onNavigate('finances')}
          className="flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 sm:py-3.5 rounded-2xl glass-panel-interactive hover:border-cyan-500/50 shadow-xs active:scale-95 cursor-pointer group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-400/30 group-hover:scale-110 transition-transform shadow-2xs">
            <Calculator className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1.5 text-center leading-tight tracking-tight">
            Kalkula
          </span>
          <span className="text-[8px] sm:text-[9px] text-slate-400 leading-none mt-0.5">
            Cost & Fuel
          </span>
        </button>

        {/* Action 3: FuelPrice PH Station Price Comparison */}
        <button
          onClick={() => onNavigate('compare')}
          className="flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 sm:py-3.5 rounded-2xl glass-panel-interactive hover:border-amber-500/50 shadow-xs active:scale-95 cursor-pointer group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-400/30 group-hover:scale-110 transition-transform shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1.5 text-center leading-tight tracking-tight">
            FuelPrice
          </span>
          <span className="text-[8px] sm:text-[9px] text-slate-400 leading-none mt-0.5">
            Live Pumps
          </span>
        </button>

        {/* Action 4: Vehicles / Garage */}
        <button
          onClick={() => onNavigate('vehicles')}
          className="flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 sm:py-3.5 rounded-2xl glass-panel-interactive hover:border-indigo-500/50 shadow-xs active:scale-95 cursor-pointer group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-400/30 group-hover:scale-110 transition-transform shadow-2xs">
            <Flaticon name="motorcycle" className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1.5 text-center leading-tight tracking-tight">
            Garahe
          </span>
          <span className="text-[8px] sm:text-[9px] text-slate-400 leading-none mt-0.5">
            My Vehicles
          </span>
        </button>
      </div>

      {/* 5. Role-Specific Interactive Module */}
      {/* PERSONAL MOTORIST DASHBOARD MODULE */}
      {userType === 'motorist' && (
        <div className="rounded-2xl glass-panel p-3.5 sm:p-4.5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/40">
                <Flaticon name="wallet" className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Transportation Allowance</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Monthly Travel Budget</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('finances')}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Adjust Budget</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Numbers */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl glass-panel-subtle text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Allowance
              </span>
              <span className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate block">
                {formatPHP(financialSummary.allowanceBudget)}
              </span>
            </div>
            <div className="border-x border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                Used
              </span>
              <span className="text-sm sm:text-lg font-black text-rose-600 dark:text-rose-400 truncate block">
                {formatPHP(financialSummary.allowanceUsed)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Remaining
              </span>
              <span className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400 truncate block">
                {formatPHP(financialSummary.allowanceRemaining)}
              </span>
            </div>
          </div>

          {/* Allowance Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">
              <span>Budget Consumed</span>
              <span className={allowancePercentUsed > 85 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                {allowancePercentUsed}%
              </span>
            </div>
            <div className="w-full bg-slate-200/70 dark:bg-slate-800/70 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allowancePercentUsed > 85
                    ? 'bg-rose-500'
                    : allowancePercentUsed > 60
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                }`}
                style={{ width: `${allowancePercentUsed}%` }}
              />
            </div>
            {allowancePercentUsed > 85 && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Budget warning: You have used over 85% of your travel allowance!</span>
              </div>
            )}
          </div>

          {/* Distance & Trips statistics */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
            <div
              onClick={() => onNavigate('trips')}
              className="flex items-center space-x-2.5 p-2.5 rounded-xl glass-panel-subtle hover:border-cyan-400/60 cursor-pointer transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white shadow-2xs shrink-0">
                <Flaticon name="route" className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">Distance</span>
                <span className="text-xs sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {periodDistanceKm} km
                </span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('trips')}
              className="flex items-center space-x-2.5 p-2.5 rounded-xl glass-panel-subtle hover:border-emerald-400/60 cursor-pointer transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white shadow-2xs shrink-0">
                <Flaticon name="motorcycle" className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">Trips in Period</span>
                <span className="text-xs sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {periodTripsCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HABAL-HABAL DRIVER DASHBOARD MODULE */}
      {userType === 'habal_habal' && (
        <div className="rounded-2xl glass-panel p-3.5 sm:p-4.5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Habal-Habal Daily Shift</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Today's Operating Performance</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('finances')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>Finances</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Income & Expense Breakdown */}
          <div className="space-y-2 rounded-xl glass-panel-subtle p-3">
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
              <span className="text-slate-600 dark:text-slate-400">Total Fares (Plete)</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{formatPHP(periodFares)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
              <span className="text-slate-600 dark:text-slate-400">Fuel Expenses</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">- {formatPHP(periodFuelCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
              <span className="text-slate-600 dark:text-slate-400">Other Expenses</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">- {formatPHP(periodOtherExp)}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">Net Earnings</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Take-home profit</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatPHP(periodNetHabal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TRICYCLE DRIVER DASHBOARD MODULE */}
      {userType === 'tricycle' && (
        <div className="rounded-2xl glass-panel p-3.5 sm:p-4.5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tricycle TODA Shift</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Fares, Boundary & Expenses</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-800 font-mono backdrop-blur-xs">
              {defaultVehicle?.toda_body_number || 'TODA-042'}
            </span>
          </div>

          <div className="space-y-2 rounded-xl glass-panel-subtle p-3">
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
              <span className="text-slate-600 dark:text-slate-400">Fare Collection</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{formatPHP(periodFares)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
              <span className="text-slate-600 dark:text-slate-400">Fuel</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">- {formatPHP(periodFuelCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
              <span className="text-slate-600 dark:text-slate-400 font-semibold text-amber-900 dark:text-amber-400">Boundary (Operator Fee)</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">- {formatPHP(periodBoundary)}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">Net Earnings</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Take-home profit</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatPHP(periodNetTricycle)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Interactive Bohol FuelWatch PH Live Widget */}
      <div className="rounded-2xl glass-panel border border-emerald-500/35 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/5 p-4 flex flex-col gap-3 transition-colors shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Flaticon name="fuel" className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  Bohol FuelPrice PH Live
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Weekly pump price monitoring via fuelprice.ph
              </p>
            </div>
          </div>

          {/* Interactive Fuel Type Toggle */}
          <div className="flex items-center space-x-1 p-0.5 bg-emerald-100/70 dark:bg-emerald-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800 text-[10px] font-extrabold shrink-0 backdrop-blur-xs">
            <button
              onClick={() => setSelectedFuelType('Gasoline')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedFuelType === 'Gasoline'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700'
              }`}
            >
              ⛽ Gas (₱{latestGasPrice.toFixed(2)})
            </button>
            <button
              onClick={() => setSelectedFuelType('Diesel')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedFuelType === 'Diesel'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700'
              }`}
            >
              Diesel (₱{latestDieselPrice.toFixed(2)})
            </button>
          </div>
        </div>

        {/* Dynamic Lowest Station Callout */}
        {lowestStation && (
          <div className="flex items-center justify-between pt-2 border-t border-emerald-200/50 dark:border-emerald-800/40 text-xs">
            <div className="flex items-center space-x-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 truncate">
                <strong>Best Rate:</strong> {lowestStation.name} ({lowestStation.municipality}) at{' '}
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                  ₱{lowestStation.price.toFixed(2)}/L
                </span>
                {lowestStation.savings > 0 && (
                  <span className="ml-1 text-[10px] text-emerald-600 font-bold hidden sm:inline">
                    (Save ₱{lowestStation.savings.toFixed(2)}/L)
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => onNavigate('compare')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 ml-2 cursor-pointer flex items-center space-x-0.5"
            >
              <span>Compare All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 7. Interactive Recent Trips List with 1-Tap Repeat */}
      <div className="rounded-2xl glass-panel p-3.5 sm:p-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
              Recent Trips (Mga Biyahe)
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              {userTrips.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAddTrip}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => onNavigate('trips')}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>

        {recentTrips.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            <p>No trips logged yet.</p>
            <button
              onClick={onOpenAddTrip}
              className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-xs font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log First Trip</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrips.map(trip => {
              const isExpanded = expandedTripId === trip.id;

              return (
                <div
                  key={trip.id}
                  className="rounded-xl glass-panel-subtle transition-all overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">
                        <Flaticon name="route" className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {trip.origin} → {trip.destination}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {trip.distance_km} km • {trip.duration || '20 min'} • {trip.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2 flex items-center space-x-2">
                      <div>
                        {userType === 'motorist' ? (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                            - {formatPHP(trip.fuel_cost || 0)}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            + {formatPHP(trip.fare || 0)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(trip.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expandable Quick Details & 1-Tap Repeat Action */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-150">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p>
                          <strong>Vehicle:</strong> {trip.vehicle_name || defaultVehicle?.model || 'Motorcycle'}
                        </p>
                        {trip.notes && <p className="italic text-slate-400">"{trip.notes}"</p>}
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                        {/* 1-Tap Repeat Trip Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRepeatTrip(trip);
                          }}
                          title="I-rekord kini nga biyahe usab para sa adlaw karon"
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors border border-emerald-300/50 dark:border-emerald-700/50"
                        >
                          <Repeat className="w-3 h-3" />
                          <span>Biyahe Usab (Repeat)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Fuel Saving, Vehicle Optimization & Check-Up Tips */}
      <FuelCareTipsCard
        vehicle={defaultVehicle}
        onOpenGarage={() => onNavigate('vehicles')}
      />
    </div>
  );
};
