import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Fuel,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  Database,
  MapPin,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  TrendingUp,
  ArrowUpRight,
  Globe,
  Activity,
  AlertTriangle,
  X,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { FuelType } from '../../types';
import { PriceComparisonView } from '../fuel/PriceComparisonView';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { allUsers, currentUser } = useAuth();
  const {
    fuelPrices,
    trips,
    fuelPurchases,
    addOrUpdateFuelPrice,
    resetDataToDemo,
    supabaseConnected,
    isSyncing,
    syncWithSupabase,
  } = useData();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'fuelwatch' | 'prices' | 'system'>('users');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'motorist' | 'habal_habal' | 'tricycle' | 'admin'>('all');

  // Fuel Price Benchmark State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceFuelType, setPriceFuelType] = useState<FuelType>('Gasoline');
  const [priceValue, setPriceValue] = useState<number>(63.85);
  const [calibrateFeedback, setCalibrateFeedback] = useState<string | null>(null);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesRole = roleFilter === 'all' || u.user_type === roleFilter;
      const term = userSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.municipality.toLowerCase().includes(term) ||
        u.user_type.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [allUsers, roleFilter, userSearchTerm]);

  const motoristCount = allUsers.filter(u => u.user_type === 'motorist').length;
  const habalCount = allUsers.filter(u => u.user_type === 'habal_habal').length;
  const tricycleCount = allUsers.filter(u => u.user_type === 'tricycle').length;
  const adminCount = allUsers.filter(u => u.user_type === 'admin').length;

  const handleOpenUpdateModal = (
    fuel: FuelType = 'Gasoline',
    currentPrice: number = 63.85
  ) => {
    setPriceFuelType(fuel);
    setPriceValue(currentPrice);
    setIsPriceModalOpen(true);
  };

  const handleAutoCalibrateAllFromFuelWatch = () => {
    const defaults: { fuel_type: FuelType; price_per_liter: number }[] = [
      { fuel_type: 'Gasoline', price_per_liter: 63.85 },
      { fuel_type: 'Diesel', price_per_liter: 58.90 },
      { fuel_type: 'Premium 95', price_per_liter: 66.50 },
      { fuel_type: 'Regular', price_per_liter: 62.40 },
    ];

    defaults.forEach(d => {
      addOrUpdateFuelPrice({
        municipality: 'Province of Bohol',
        station_name: 'FuelWatch PH Live Feed',
        fuel_type: d.fuel_type,
        price_per_liter: d.price_per_liter,
      });
    });

    setCalibrateFeedback('Official Bohol benchmarks synced to FuelWatch PH live rates!');
    setTimeout(() => setCalibrateFeedback(null), 4000);
  };

  const handleApplyTuesdayHike = () => {
    const hikes: { [key in FuelType]?: number } = {
      Gasoline: 1.80,
      Diesel: 2.20,
      'Premium 95': 1.85,
      Regular: 1.60,
    };

    const targetFuels: FuelType[] = ['Gasoline', 'Diesel', 'Premium 95', 'Regular'];
    targetFuels.forEach(ft => {
      const existing = fuelPrices.find(p => p.fuel_type === ft);
      const base = existing ? existing.price_per_liter : (ft === 'Gasoline' ? 63.85 : ft === 'Diesel' ? 58.90 : ft === 'Premium 95' ? 66.50 : 62.40);
      const increase = hikes[ft] || 0;
      addOrUpdateFuelPrice({
        municipality: 'Province of Bohol',
        station_name: 'FuelWatch PH (Post-Tuesday Advisory)',
        fuel_type: ft,
        price_per_liter: Math.round((base + increase) * 100) / 100,
      });
    });

    setCalibrateFeedback('Applied upcoming Tuesday projected hike (+₱1.80 Gas, +₱2.20 Diesel)!');
    setTimeout(() => setCalibrateFeedback(null), 4000);
  };

  const handleQuickAdjust = (fuel: FuelType, delta: number) => {
    const existing = fuelPrices.find(p => p.fuel_type === fuel);
    const base = existing ? existing.price_per_liter : (fuel === 'Gasoline' ? 63.85 : fuel === 'Diesel' ? 58.90 : fuel === 'Premium 95' ? 66.50 : 62.40);
    const newPrice = Math.round((base + delta) * 100) / 100;
    addOrUpdateFuelPrice({
      municipality: 'Province of Bohol',
      station_name: 'FuelWatch PH Live Feed',
      fuel_type: fuel,
      price_per_liter: newPrice,
    });
    setCalibrateFeedback(`Adjusted ${fuel} benchmark to ₱${newPrice.toFixed(2)}/L`);
    setTimeout(() => setCalibrateFeedback(null), 3000);
  };

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    addOrUpdateFuelPrice({
      municipality: 'Province of Bohol',
      station_name: 'FuelWatch PH Live Feed',
      fuel_type: priceFuelType,
      price_per_liter: Number(priceValue),
    });
    setIsPriceModalOpen(false);
    setCalibrateFeedback(`Successfully updated ${priceFuelType} benchmark to ₱${Number(priceValue).toFixed(2)}/L`);
    setTimeout(() => setCalibrateFeedback(null), 3000);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* 1. Header Hero Crest with Visual Hierarchy */}
      <div className="rounded-3xl p-6 shadow-2xl border border-cyan-500/30 backdrop-blur-xl bg-gradient-to-r from-[#071324] via-[#0b223d] to-[#062420] text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/40 shadow-inner backdrop-blur-xs">
              <ShieldAlert className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Byahe ni Bai Admin Console
                </h1>
                <span className="bg-cyan-500/25 text-cyan-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-cyan-400/30 backdrop-blur-xs">
                  Website Control
                </span>
              </div>
              <p className="text-xs text-cyan-200/90 mt-1 max-w-xl leading-relaxed">
                Centralized website governance for Bohol drivers, FuelWatch PH pump rates, provincial benchmarks, and database health.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={syncWithSupabase}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 border border-white/15 backdrop-blur-xs shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Global Key Stats Cards Grid - Clear Hierarchical Metric Hierarchy */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stat 1: Registered Users */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                Driver Accounts
              </span>
              <Users className="w-4 h-4 text-cyan-300/80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {allUsers.length}
            </div>
            <span className="text-[10px] text-cyan-200/70 mt-1">
              {motoristCount} Motorists • {habalCount + tricycleCount} Commercial
            </span>
          </div>

          {/* Stat 2: FuelWatch Live Stream */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                FuelWatch PH
              </span>
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Bohol</span>
            </div>
            <span className="text-[10px] text-cyan-200/70 mt-1">
              Crowdsourced Pump Feed
            </span>
          </div>

          {/* Stat 3: Total Island Trips */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                Trips Recorded
              </span>
              <Activity className="w-4 h-4 text-cyan-300/80" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {trips.length}
            </div>
            <span className="text-[10px] text-cyan-200/70 mt-1">
              Across 48 Municipalities
            </span>
          </div>

          {/* Stat 4: Gasoline Benchmark */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                Gas Benchmark
              </span>
              <Fuel className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              ₱{fuelPrices.find(p => p.fuel_type === 'Gasoline')?.price_per_liter.toFixed(2) || '63.85'}
            </div>
            <span className="text-[10px] text-cyan-200/70 mt-1">
              Ref: fuelwatchph.com
            </span>
          </div>
        </div>
      </div>

      {/* 2. Structured Admin Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl glass-panel-subtle text-xs font-bold shadow-xs">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
            activeAdminTab === 'users'
              ? 'bg-white dark:bg-cyan-500/20 text-cyan-950 dark:text-cyan-200 shadow-sm border border-cyan-500/30 dark:border-cyan-400/40 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('fuelwatch')}
          className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
            activeAdminTab === 'fuelwatch'
              ? 'bg-white dark:bg-cyan-500/20 text-cyan-950 dark:text-cyan-200 shadow-sm border border-cyan-500/30 dark:border-cyan-400/40 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>FuelWatch PH Live</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('prices')}
          className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
            activeAdminTab === 'prices'
              ? 'bg-white dark:bg-cyan-500/20 text-cyan-950 dark:text-cyan-200 shadow-sm border border-cyan-500/30 dark:border-cyan-400/40 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Price Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('system')}
          className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
            activeAdminTab === 'system'
              ? 'bg-white dark:bg-cyan-500/20 text-cyan-950 dark:text-cyan-200 shadow-sm border border-cyan-500/30 dark:border-cyan-400/40 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>System Health</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: USERS DIRECTORY (ENHANCED HIERARCHY & SEARCH/FILTER)    */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'users' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          {/* Header & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Registered Bohol Motorists & Drivers</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Central user database with verified driver designations, vehicle roles, and Bohol municipalities
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                {filteredUsers.length} of {allUsers.length} Accounts
              </span>
            </div>
          </div>

          {/* Quick Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({allUsers.length})
            </button>
            <button
              onClick={() => setRoleFilter('motorist')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                roleFilter === 'motorist'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-sky-600'
              }`}
            >
              Motorists ({motoristCount})
            </button>
            <button
              onClick={() => setRoleFilter('habal_habal')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                roleFilter === 'habal_habal'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              Habal-Habal ({habalCount})
            </button>
            <button
              onClick={() => setRoleFilter('tricycle')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                roleFilter === 'tricycle'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              Tricycles ({tricycleCount})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-purple-600'
              }`}
            >
              Admins ({adminCount})
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={e => setUserSearchTerm(e.target.value)}
              placeholder="Search by driver name, email, or Bohol municipality..."
              className="glass-input w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {userSearchTerm && (
              <button
                onClick={() => setUserSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Structured User Cards Grid */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 rounded-2xl glass-panel-subtle border border-slate-200/50 dark:border-slate-800/60">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No users match "{userSearchTerm}"
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Try searching for another name, role, or Bohol town.
              </p>
              <button
                onClick={() => { setUserSearchTerm(''); setRoleFilter('all'); }}
                className="mt-3 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-cyan-600 dark:text-cyan-400 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  className="rounded-2xl glass-panel-subtle p-4 border border-slate-200/70 dark:border-slate-800/80 hover:border-cyan-500/40 transition-all shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatar_url}
                          alt={u.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                        />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5 shadow-2xs" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {u.name}
                          </h3>
                          {u.role === 'admin' && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                        u.user_type === 'motorist'
                          ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-400/30'
                          : u.user_type === 'habal_habal'
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30'
                          : u.user_type === 'tricycle'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/30'
                          : 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-400/30'
                      }`}
                    >
                      {u.user_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {u.municipality}, Bohol
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] font-mono shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Verified Driver</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: FUELWATCH PH (LIVE BOHOL PUMP PRICES)                   */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'fuelwatch' && (
        <PriceComparisonView />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: FUEL PRICE BENCHMARK MANAGER                            */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'prices' && (
        <div className="space-y-4">
          {/* FuelWatch PH Official Live Bohol Feed Banner */}
          <div className="glass-panel p-5 rounded-3xl bg-linear-to-r from-amber-500/15 via-amber-500/10 to-orange-500/10 border border-amber-400/30 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 text-amber-900 dark:text-amber-300 font-black text-sm">
                  <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Bohol Provincial Fuel Benchmarks</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                  FuelWatch PH Bohol Feed
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Official benchmark prices for Bohol's 48 municipalities, referenced from live crowdsourced station rates on <strong>FuelWatch PH (fuelwatchph.com)</strong>. Calibrating benchmarks here automatically updates trip calculators, TODA boundary accounting, and driver fill-up estimators.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveAdminTab('fuelwatch')}
                className="px-3.5 py-2 rounded-xl bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Live Bohol Monitor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="https://fuelwatchph.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl glass-btn text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1 transition-colors"
              >
                <span>fuelwatchph.com</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Toast feedback banner */}
          {calibrateFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200 backdrop-blur-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{calibrateFeedback}</span>
            </div>
          )}

          {/* Quick Benchmark Controls Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel-subtle shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                1-Click Benchmark Calibration
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Synchronize with live crowdsourced Bohol averages or preview Tuesday price adjustments
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAutoCalibrateAllFromFuelWatch}
                className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-amber-500/25 cursor-pointer transition-colors backdrop-blur-xs"
                title="Sync benchmarks with FuelWatch PH Bohol crowdsourced averages"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Sync with FuelWatch PH</span>
              </button>

              <button
                type="button"
                onClick={handleApplyTuesdayHike}
                className="px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-red-500/25 cursor-pointer transition-colors backdrop-blur-xs"
                title="Apply upcoming Tuesday projected price hike (+₱1.80 Gas, +₱2.20 Diesel)"
              >
                <TrendingUp className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Apply Tuesday Hike</span>
              </button>

              <button
                onClick={() => handleOpenUpdateModal('Gasoline', 63.85)}
                className="px-3.5 py-1.5 rounded-xl bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Benchmark</span>
              </button>
            </div>
          </div>

          {/* Benchmark Cards Grid with Elevated Hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                type: 'Gasoline' as FuelType,
                defaultPrice: 63.85,
                grade: 'Unleaded (91/95 RON)',
                tuesdayHike: '+₱1.80 / L projected Tue',
                accentColor: 'border-emerald-500/30',
              },
              {
                type: 'Diesel' as FuelType,
                defaultPrice: 58.90,
                grade: 'Euro 4 / Euro 5',
                tuesdayHike: '+₱2.20 / L projected Tue',
                accentColor: 'border-cyan-500/30',
              },
              {
                type: 'Premium 95' as FuelType,
                defaultPrice: 66.50,
                grade: 'High Octane 95+',
                tuesdayHike: '+₱1.85 / L projected Tue',
                accentColor: 'border-amber-500/30',
              },
              {
                type: 'Regular' as FuelType,
                defaultPrice: 62.40,
                grade: 'Regular 91 RON',
                tuesdayHike: '+₱1.60 / L projected Tue',
                accentColor: 'border-sky-500/30',
              },
            ].map(item => {
              const current = fuelPrices.find(p => p.fuel_type === item.type);
              const price = current ? current.price_per_liter : item.defaultPrice;

              return (
                <div
                  key={item.type}
                  className={`rounded-3xl glass-panel-subtle p-5 shadow-xs flex flex-col justify-between space-y-3.5 border ${item.accentColor} hover:border-amber-400/50 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{item.type}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.grade}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                      FuelWatch Ref
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ₱{price.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/ Liter</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span>{item.tuesdayHike}</span>
                    </div>
                  </div>

                  {/* Quick Adjust buttons */}
                  <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item.type, -0.50)}
                        className="px-2 py-1 rounded-lg glass-btn text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer hover:border-amber-400"
                        title="Decrease by ₱0.50"
                      >
                        -0.50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(item.type, 0.50)}
                        className="px-2 py-1 rounded-lg glass-btn text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer hover:border-amber-400"
                        title="Increase by ₱0.50"
                      >
                        +0.50
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenUpdateModal(item.type, price)}
                      className="px-3 py-1 rounded-lg bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Calibrate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official Benchmark Summary Table */}
          <div className="glass-panel rounded-3xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Official Bohol Fuel Price Benchmarks</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Synchronized against FuelWatch PH Bohol crowdsourced monitor
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Scope: All 48 Municipalities
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Fuel Type</th>
                    <th className="py-2.5 px-3">Provincial Benchmark</th>
                    <th className="py-2.5 px-3">Reference Source</th>
                    <th className="py-2.5 px-3">Upcoming Trend</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/60">
                  {[
                    { type: 'Gasoline' as FuelType, trend: '+₱1.80 Tue' },
                    { type: 'Diesel' as FuelType, trend: '+₱2.20 Tue' },
                    { type: 'Premium 95' as FuelType, trend: '+₱1.85 Tue' },
                    { type: 'Regular' as FuelType, trend: '+₱1.60 Tue' },
                  ].map(f => {
                    const rec = fuelPrices.find(p => p.fuel_type === f.type);
                    const price = rec?.price_per_liter || (f.type === 'Gasoline' ? 63.85 : f.type === 'Diesel' ? 58.90 : f.type === 'Premium 95' ? 66.50 : 62.40);
                    return (
                      <tr key={f.type} className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                          {f.type}
                        </td>
                        <td className="py-3 px-3 font-black text-amber-600 dark:text-amber-400 text-sm">
                          ₱{price.toFixed(2)} / L
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                            FuelWatch PH (Bohol Live)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-red-600 dark:text-red-400 font-semibold text-[11px]">
                          {f.trend}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateModal(f.type, price)}
                            className="px-2.5 py-1 rounded-lg glass-btn text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer hover:border-amber-400"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: SYSTEM HEALTH & TELEMETRY (ENHANCED HIERARCHY)          */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'system' && (
        <div className="space-y-4">
          {/* Primary Connection Status Hero Banner */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl border backdrop-blur-xs ${
                  supabaseConnected
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}>
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Database Status & Telemetry</span>
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      supabaseConnected
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 border-amber-400/40 text-amber-700 dark:text-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${supabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span>{supabaseConnected ? 'Live Postgres' : 'Offline Cache'}</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {supabaseConnected
                      ? 'Connected to Supabase PostgreSQL cloud database. Data syncs across all devices in real-time.'
                      : 'Operating in local browser storage mode. Configure Supabase in settings to enable cloud sync.'}
                  </p>
                </div>
              </div>

              <button
                onClick={syncWithSupabase}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl glass-panel-subtle text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Total Users</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{allUsers.length}</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 block mt-0.5">Accounts</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-panel-subtle text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Trips Logged</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{trips.length}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Island-wide</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-panel-subtle text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Fuel Receipts</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{fuelPurchases.length}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">Purchases</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-panel-subtle text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Gas Stations</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">9 Active</span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 block mt-0.5">Bohol Feed</span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Maintenance & Reset */}
          <div className="rounded-3xl p-5 sm:p-6 border border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20 backdrop-blur-md space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-2xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-sm shadow-rose-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-700 dark:text-rose-400">
                    Danger Zone: Reset Demo Records
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                    Restores all Bohol motorist and driver sample accounts, recent trips, and benchmark fuel prices to their default state. This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all Bohol demo data back to default state? This will clear custom trips and restore initial accounts.')) {
                    resetDataToDemo();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-center shrink-0"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Calibrate Fuel Price Benchmark
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                  Ref: FuelWatch PH
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sets the official reference benchmark for all 48 Bohol municipalities
              </p>
            </div>

            {/* FuelWatch PH Quick-Fill Helper Box */}
            <div className="p-3.5 rounded-2xl glass-panel-subtle space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-300">
                  FuelWatch PH Bohol Averages:
                </span>
                <a
                  href="https://fuelwatchph.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center space-x-0.5"
                >
                  <span>Verify on fuelwatchph.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => { setPriceFuelType('Gasoline'); setPriceValue(63.85); }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer text-left ${
                    priceFuelType === 'Gasoline' && priceValue === 63.85
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'glass-panel-subtle text-slate-700 dark:text-slate-200 hover:border-amber-500'
                  }`}
                >
                  Gasoline: <strong>₱63.85</strong>
                </button>
                <button
                  type="button"
                  onClick={() => { setPriceFuelType('Diesel'); setPriceValue(58.90); }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer text-left ${
                    priceFuelType === 'Diesel' && priceValue === 58.90
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'glass-panel-subtle text-slate-700 dark:text-slate-200 hover:border-amber-500'
                  }`}
                >
                  Diesel: <strong>₱58.90</strong>
                </button>
                <button
                  type="button"
                  onClick={() => { setPriceFuelType('Premium 95'); setPriceValue(66.50); }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer text-left ${
                    priceFuelType === 'Premium 95' && priceValue === 66.50
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'glass-panel-subtle text-slate-700 dark:text-slate-200 hover:border-amber-500'
                  }`}
                >
                  Prem 95: <strong>₱66.50</strong>
                </button>
                <button
                  type="button"
                  onClick={() => { setPriceFuelType('Regular'); setPriceValue(62.40); }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer text-left ${
                    priceFuelType === 'Regular' && priceValue === 62.40
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'glass-panel-subtle text-slate-700 dark:text-slate-200 hover:border-amber-500'
                  }`}
                >
                  Regular: <strong>₱62.40</strong>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Fuel Type</label>
                <select
                  value={priceFuelType}
                  onChange={e => {
                    const val = e.target.value as FuelType;
                    setPriceFuelType(val);
                    const def = fuelPrices.find(p => p.fuel_type === val)?.price_per_liter || (val === 'Gasoline' ? 63.85 : val === 'Diesel' ? 58.90 : val === 'Premium 95' ? 66.50 : 62.40);
                    setPriceValue(def);
                  }}
                  className="glass-input w-full px-3 py-2 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="Gasoline" className="bg-white dark:bg-slate-900">Gasoline (Unleaded)</option>
                  <option value="Diesel" className="bg-white dark:bg-slate-900">Diesel</option>
                  <option value="Premium 95" className="bg-white dark:bg-slate-900">Premium 95</option>
                  <option value="Regular" className="bg-white dark:bg-slate-900">Regular</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Benchmark Price per Liter (₱)
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={priceValue}
                  onChange={e => setPriceValue(Number(e.target.value))}
                  className="glass-input w-full px-3 py-2 rounded-xl font-bold text-base text-amber-900 dark:text-amber-300"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl glass-btn text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold cursor-pointer transition-all shadow-xs"
                >
                  Save Benchmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
