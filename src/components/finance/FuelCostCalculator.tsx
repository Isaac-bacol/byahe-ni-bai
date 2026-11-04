import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Info,
  TrendingDown,
  ArrowRightLeft,
  Coins,
  Car,
  Compass
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { estimateTravelTime } from '../../lib/boholData';
import { PHILIPPINE_VEHICLE_CATALOG } from '../../lib/vehicleCatalog';
import type { FuelType, VehicleType } from '../../types';

interface RoutePreset {
  name: string;
  distanceKm: number;
  description: string;
}

const BOHOL_ROUTE_PRESETS: RoutePreset[] = [
  { name: 'Tagbilaran ↔ Panglao', distanceKm: 18, description: 'Airport & Alona Beach corridor' },
  { name: 'Tagbilaran ↔ Baclayon', distanceKm: 7, description: 'Heritage town & coastal route' },
  { name: 'Tagbilaran ↔ Loboc', distanceKm: 24, description: 'River tourism & Interior highway' },
  { name: 'Tagbilaran ↔ Tubigon', distanceKm: 54, description: 'Commercial port & northwestern highway' },
  { name: 'Tagbilaran ↔ Carmen', distanceKm: 55, description: 'Chocolate Hills scenic route' },
  { name: 'Tagbilaran ↔ Jagna', distanceKm: 63, description: 'Mindanao ferry port & eastern coast' },
  { name: 'Tagbilaran ↔ Ubay', distanceKm: 124, description: 'Northeastern terminal cross-island' },
];

interface VehiclePreset {
  label: string;
  type: VehicleType;
  efficiency: number;
  iconName: 'motorcycle' | 'car';
}

const VEHICLE_PRESETS: VehiclePreset[] = [
  { label: 'Scooter / Motorcycle', type: 'motorcycle', efficiency: 45, iconName: 'motorcycle' },
  { label: 'Tricycle (TODA)', type: 'tricycle', efficiency: 28, iconName: 'motorcycle' },
  { label: 'Sedan / Hatchback', type: '4wheel', efficiency: 14, iconName: 'car' },
  { label: 'SUV / Van / Pickup', type: '4wheel', efficiency: 10, iconName: 'car' },
];

export const FuelCostCalculator: React.FC = () => {
  const { userType } = useAuth();
  const { userVehicles, defaultVehicle, fuelPrices, financialSummary } = useData();

  // Selection source: 'garage' | 'catalog' | 'custom'
  const [vehicleSelectionSource, setVehicleSelectionSource] = useState<'garage' | 'catalog' | 'custom'>(() => {
    return userVehicles.length > 0 ? 'garage' : 'catalog';
  });

  // Selected vehicle or custom
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    return defaultVehicle?.id || (userVehicles.length > 0 ? userVehicles[0].id : 'custom');
  });

  // Selected catalog item
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('honda-click125-v2');

  // Trip settings
  const [distanceKm, setDistanceKm] = useState<number>(18);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('Tagbilaran ↔ Panglao');

  // Fuel settings
  const [fuelType, setFuelType] = useState<FuelType>('Gasoline');
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(45);
  const [fuelPrice, setFuelPrice] = useState<number>(63.85);
  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);

  // Copy notification
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with selected vehicle when changed
  useEffect(() => {
    if (vehicleSelectionSource === 'garage' && selectedVehicleId !== 'custom') {
      const veh = userVehicles.find(v => v.id === selectedVehicleId);
      if (veh) {
        setFuelEfficiency(veh.fuel_efficiency_km_per_l || 40);
        if (veh.fuel_type) {
          setFuelType(veh.fuel_type);
        }
      }
    } else if (vehicleSelectionSource === 'catalog') {
      const cat = PHILIPPINE_VEHICLE_CATALOG.find(c => c.id === selectedCatalogId);
      if (cat) {
        setFuelEfficiency(cat.fuel_efficiency_km_per_l);
        setFuelType(cat.fuel_type);
      }
    }
  }, [vehicleSelectionSource, selectedVehicleId, selectedCatalogId, userVehicles]);

  // Live Bohol benchmark fuel price lookup
  const liveBenchmarkPrice = useMemo(() => {
    const matched = fuelPrices.find(p => p.fuel_type === fuelType);
    return matched?.price_per_liter || (fuelType === 'Diesel' ? 58.90 : fuelType === 'Premium 95' ? 66.50 : 63.85);
  }, [fuelPrices, fuelType]);

  // Update fuel price when fuel type changes (if not manually overridden)
  useEffect(() => {
    if (!isCustomPrice) {
      setFuelPrice(liveBenchmarkPrice);
    }
  }, [fuelType, liveBenchmarkPrice, isCustomPrice]);

  // Calculation values
  const effectiveDistance = useMemo(() => {
    return isRoundTrip ? distanceKm * 2 : distanceKm;
  }, [distanceKm, isRoundTrip]);

  const safeEfficiency = useMemo(() => {
    return Math.max(1, fuelEfficiency);
  }, [fuelEfficiency]);

  const litersNeeded = useMemo(() => {
    return effectiveDistance / safeEfficiency;
  }, [effectiveDistance, safeEfficiency]);

  const totalFuelCost = useMemo(() => {
    return litersNeeded * fuelPrice;
  }, [litersNeeded, fuelPrice]);

  const costPerKm = useMemo(() => {
    return fuelPrice / safeEfficiency;
  }, [fuelPrice, safeEfficiency]);

  const travelTimeEstimate = useMemo(() => {
    const selectedVeh = userVehicles.find(v => v.id === selectedVehicleId);
    const vType = selectedVeh?.vehicle_type || (fuelEfficiency < 18 ? '4wheel' : fuelEfficiency < 35 ? 'tricycle' : 'motorcycle');
    return estimateTravelTime(effectiveDistance, vType);
  }, [effectiveDistance, selectedVehicleId, userVehicles, fuelEfficiency]);

  // Format PHP
  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(val);
  };

  // Reset to default settings
  const handleReset = () => {
    setDistanceKm(18);
    setIsRoundTrip(false);
    setActivePreset('Tagbilaran ↔ Panglao');
    setSelectedVehicleId(defaultVehicle?.id || (userVehicles[0]?.id ?? 'custom'));
    setFuelType('Gasoline');
    setIsCustomPrice(false);
    setFuelPrice(63.85);
    setFuelEfficiency(45);
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    const summary = `Byahe ni Bai - Fuel Cost Estimate (Bohol)
• Route Distance: ${effectiveDistance} km ${isRoundTrip ? '(Round-Trip)' : '(One-Way)'}
• Fuel Needed: ${litersNeeded.toFixed(2)} Liters (${fuelType} @ ₱${fuelPrice.toFixed(2)}/L)
• Fuel Efficiency: ${fuelEfficiency} km/L
• Total Fuel Cost: ${formatPHP(totalFuelCost)}
• Cost per km: ${formatPHP(costPerKm)}/km
• Estimated Travel Time: ~${travelTimeEstimate}
Calculated via Byahe ni Bai (FuelWatch PH Benchmark)`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden transition-colors">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-linear-to-r from-[#0a192f]/90 via-[#0d2a4a]/85 to-[#0a3832]/90 text-white relative overflow-hidden backdrop-blur-md border-b border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-60 h-60 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-start space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-tr from-cyan-600 to-emerald-500 p-2 sm:p-2.5 text-white flex items-center justify-center shadow-md shadow-emerald-900/30 shrink-0 mt-0.5">
              <Flaticon name="calculator" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-1.5">
                <h3 className="text-base sm:text-xl font-black tracking-tight text-white">Fuel Cost Calculator</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 backdrop-blur-xs">
                  Tantiya sa Gasolina
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-snug">
                Calculate expected fuel consumption, trip expenses, and budget impact with live Bohol benchmarks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer border border-white/15 shrink-0 backdrop-blur-xs"
              title="Copy estimate breakdown to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer border border-white/15 shrink-0 backdrop-blur-xs"
              title="Reset all fields to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Top Section: Quick Route Presets */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Popular Bohol Route Presets:</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Tap for instant distance</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {BOHOL_ROUTE_PRESETS.map(preset => {
              const isSelected = activePreset === preset.name && distanceKm === preset.distanceKm;
              return (
                <button
                  key={preset.name}
                  onClick={() => {
                    setDistanceKm(preset.distanceKm);
                    setActivePreset(preset.name);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-linear-to-r from-cyan-600 to-emerald-600 text-white shadow-md'
                      : 'glass-btn text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={preset.description}
                >
                  <span>{preset.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400'}`}>
                    {preset.distanceKm} km
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Grid: Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Distance & Trip Type */}
          <div className="p-4 rounded-2xl glass-panel-subtle space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Flaticon name="route" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Trip Distance</span>
              </label>

              {/* Round Trip Toggle */}
              <button
                type="button"
                onClick={() => setIsRoundTrip(!isRoundTrip)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  isRoundTrip
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'glass-btn text-slate-700 dark:text-slate-300'
                }`}
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>{isRoundTrip ? 'Round-Trip (2×)' : 'One-Way (1×)'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  step="0.5"
                  value={distanceKm || ''}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setDistanceKm(val);
                    setActivePreset('');
                  }}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white"
                />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">km</span>
              </div>

              <input
                type="range"
                min="1"
                max="150"
                step="1"
                value={Math.min(150, distanceKm)}
                onChange={e => {
                  setDistanceKm(Number(e.target.value));
                  setActivePreset('');
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 km</span>
                <span>Total Calculated: <strong className="text-emerald-600 dark:text-emerald-400">{effectiveDistance} km</strong></span>
                <span>150 km</span>
              </div>
            </div>
          </div>

          {/* Card 2: Vehicle & Fuel Efficiency */}
          <div className="p-4 rounded-2xl glass-panel-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Flaticon name="motorcycle" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Vehicle & Model</span>
              </label>

              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {vehicleSelectionSource === 'garage' ? 'From Garage' : vehicleSelectionSource === 'catalog' ? 'Catalog Model' : 'Custom'}
              </span>
            </div>

            {/* Source Switcher */}
            <div className="flex rounded-xl glass-panel-subtle p-1 text-[10px] font-bold">
              {userVehicles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVehicleSelectionSource('garage')}
                  className={`flex-1 py-1 px-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    vehicleSelectionSource === 'garage'
                      ? 'glass-btn bg-white/70 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  My Garage
                </button>
              )}
              <button
                type="button"
                onClick={() => setVehicleSelectionSource('catalog')}
                className={`flex-1 py-1 px-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  vehicleSelectionSource === 'catalog'
                    ? 'glass-btn bg-white/70 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Catalog Models
              </button>
              <button
                type="button"
                onClick={() => setVehicleSelectionSource('custom')}
                className={`flex-1 py-1 px-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  vehicleSelectionSource === 'custom'
                    ? 'glass-btn bg-white/70 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Custom
              </button>
            </div>

            {/* If Garage */}
            {vehicleSelectionSource === 'garage' && userVehicles.length > 0 && (
              <div>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="glass-input w-full px-3 py-1.5 text-xs font-bold rounded-xl text-slate-800 dark:text-slate-200"
                >
                  {userVehicles.map(veh => (
                    <option key={veh.id} value={veh.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {veh.brand} {veh.model} {veh.version ? `(${veh.version})` : ''} — {veh.fuel_efficiency_km_per_l} km/L
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Catalog */}
            {vehicleSelectionSource === 'catalog' && (
              <div className="space-y-1.5">
                <select
                  value={selectedCatalogId}
                  onChange={e => setSelectedCatalogId(e.target.value)}
                  className="glass-input w-full px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-800 dark:text-slate-200"
                >
                  {PHILIPPINE_VEHICLE_CATALOG.map(c => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c.brand} {c.model} • {c.version} ({c.fuel_efficiency_km_per_l} km/L)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Efficiency Input & Presets */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="3"
                  max="120"
                  step="0.5"
                  value={fuelEfficiency || ''}
                  onChange={e => {
                    setFuelEfficiency(Number(e.target.value));
                    setVehicleSelectionSource('custom');
                  }}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white"
                />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">km/L</span>
              </div>

              {/* Vehicle Presets Chips */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {VEHICLE_PRESETS.map(vp => (
                  <button
                    key={vp.label}
                    type="button"
                    onClick={() => {
                      setFuelEfficiency(vp.efficiency);
                      setVehicleSelectionSource('custom');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold text-left transition-colors cursor-pointer border ${
                      fuelEfficiency === vp.efficiency && vehicleSelectionSource === 'custom'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200/60 dark:border-slate-700/60 glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="truncate">{vp.label}</div>
                    <div className="text-[9px] text-slate-400">{vp.efficiency} km/L</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Fuel Type & Live Price */}
          <div className="p-4 rounded-2xl glass-panel-subtle space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Flaticon name="fuel" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Fuel Type & Price</span>
              </label>

              {isCustomPrice ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomPrice(false);
                    setFuelPrice(liveBenchmarkPrice);
                  }}
                  className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Reset to Bohol Feed
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">FuelWatch PH</span>
              )}
            </div>

            {/* Fuel Type Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 glass-panel-subtle rounded-xl">
              {(['Gasoline', 'Diesel', 'Premium 95'] as FuelType[]).map(ft => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => {
                    setFuelType(ft);
                    setIsCustomPrice(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                    fuelType === ft
                      ? 'glass-btn bg-white/70 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {ft === 'Premium 95' ? 'Premium' : ft}
                </button>
              ))}
            </div>

            {/* Price per liter input */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="relative w-full">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₱</span>
                  <input
                    type="number"
                    min="30"
                    max="150"
                    step="0.05"
                    value={fuelPrice || ''}
                    onChange={e => {
                      setFuelPrice(Number(e.target.value));
                      setIsCustomPrice(true);
                    }}
                    className="glass-input w-full pl-7 pr-3 py-2 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white"
                  />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">/ Liter</span>
              </div>

              <p className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>Bohol Benchmark: <strong>₱{liveBenchmarkPrice.toFixed(2)}/L</strong></span>
                {isCustomPrice && <span className="text-amber-500 font-bold">Custom Pump Price</span>}
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Results Banner: Reactive Outputs                              */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 sm:p-6 rounded-3xl glass-panel bg-linear-to-br from-emerald-500/10 via-cyan-500/10 to-teal-500/10 border border-emerald-400/30 backdrop-blur-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* 1. Estimated Total Cost */}
            <div className="p-3 sm:p-4 rounded-2xl glass-panel-subtle border border-emerald-400/30 shadow-xs overflow-hidden">
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
                Estimated Fuel Cost
              </span>
              <div className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 truncate">
                {formatPHP(totalFuelCost)}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                Total peso spend
              </span>
            </div>

            {/* 2. Fuel Volume (Liters) */}
            <div className="p-3 sm:p-4 rounded-2xl glass-panel-subtle border border-slate-200/50 dark:border-slate-800/60 shadow-xs overflow-hidden">
              <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block truncate">
                Fuel Needed
              </span>
              <div className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 truncate">
                {litersNeeded.toFixed(2)} <span className="text-xs sm:text-sm font-bold text-slate-400">L</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                at {fuelEfficiency} km/L
              </span>
            </div>

            {/* 3. Cost Per Kilometer */}
            <div className="p-3 sm:p-4 rounded-2xl glass-panel-subtle border border-slate-200/50 dark:border-slate-800/60 shadow-xs overflow-hidden">
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block truncate">
                Cost Per Km
              </span>
              <div className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 truncate">
                ₱{costPerKm.toFixed(2)}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                Vehicle operating rate
              </span>
            </div>

            {/* 4. Travel Duration */}
            <div className="p-3 sm:p-4 rounded-2xl glass-panel-subtle border border-slate-200/50 dark:border-slate-800/60 shadow-xs overflow-hidden">
              <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block truncate">
                Travel Time
              </span>
              <div className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 truncate">
                ~{travelTimeEstimate}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                Bohol road conditions
              </span>
            </div>
          </div>

          {/* Contextual Financial Impact by User Role */}
          <div className="mt-3.5 pt-3.5 border-t border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
            {userType === 'motorist' && (
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-200 min-w-0">
                <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Allowance Impact:</strong> This trip will use{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {Math.round((totalFuelCost / (financialSummary.allowanceBudget || 1)) * 100)}%
                  </strong>{' '}
                  of your allowance. Projected balance after trip:{' '}
                  <strong>{formatPHP(Math.max(0, financialSummary.allowanceRemaining - totalFuelCost))}</strong>.
                </p>
              </div>
            )}

            {(userType === 'habal_habal' || userType === 'tricycle') && (
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-200 min-w-0">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Fare Guidance:</strong> Break-even fuel is{' '}
                  <strong className="text-rose-600 dark:text-rose-400">{formatPHP(totalFuelCost)}</strong>. Suggested minimum fare:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">{formatPHP(Math.round(totalFuelCost * 1.5))}</strong>.
                </p>
              </div>
            )}

            {userType === 'admin' && (
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  <strong>Island Fuel Economic Ratio:</strong> Gasoline benchmark at ₱{liveBenchmarkPrice.toFixed(2)}/L yielding ₱{costPerKm.toFixed(2)}/km operating base.
                </span>
              </div>
            )}

            <div className="text-[11px] text-slate-400 italic shrink-0 self-start md:self-auto">
              Formula: (Distance ÷ km/L) × Price
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

