import React, { useState, useMemo, useEffect } from 'react';
import { Bike, Car, Plus, Trash2, Star, Gauge, Fuel, ArrowLeft, Search, Info, CheckCircle2, BookOpen, Sparkles, Filter, Edit3 } from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { useData } from '../../context/DataContext';
import type { FuelType, VehicleType, Vehicle } from '../../types';
import {
  PHILIPPINE_VEHICLE_CATALOG,
  getCatalogBrands,
  getCatalogModels,
  getCatalogVersions,
  type VehicleCatalogItem
} from '../../lib/vehicleCatalog';

interface Props {
  onBack?: () => void;
}

export const VehicleManager: React.FC<Props> = ({ onBack }) => {
  const { userVehicles, addVehicle, updateVehicle, deleteVehicle, setDefaultVehicle } = useData();

  // Tab state: 'garage' | 'catalog'
  const [activeTab, setActiveTab] = useState<'garage' | 'catalog'>('garage');

  // Catalog Guide Search & Filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<'all' | VehicleType>('all');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorcycle');

  // Cascading Selection State
  const [brand, setBrand] = useState('Honda');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandText, setCustomBrandText] = useState('');

  const [model, setModel] = useState('Click 125i');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState('');

  const [version, setVersion] = useState('');
  const [isCustomVersion, setIsCustomVersion] = useState(false);
  const [customVersionText, setCustomVersionText] = useState('');

  const [year, setYear] = useState<number>(2024);
  const [fuelType, setFuelType] = useState<FuelType>('Gasoline');
  const [plateNumber, setPlateNumber] = useState('');
  const [todaBodyNumber, setTodaBodyNumber] = useState('');
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(50.5);

  // Available brands for selected vehicleType
  const availableBrands = useMemo(() => {
    return getCatalogBrands(vehicleType);
  }, [vehicleType]);

  // Available models for selected brand & vehicleType
  const availableModels = useMemo(() => {
    if (isCustomBrand) return [];
    return getCatalogModels(brand, vehicleType);
  }, [brand, vehicleType, isCustomBrand]);

  // Available versions for selected brand, model & vehicleType
  const availableVersions = useMemo(() => {
    if (isCustomBrand || isCustomModel) return [];
    return getCatalogVersions(brand, model, vehicleType);
  }, [brand, model, vehicleType, isCustomBrand, isCustomModel]);

  // Active matched catalog item
  const activeCatalogItem = useMemo(() => {
    if (isCustomBrand || isCustomModel || isCustomVersion) return null;
    return availableVersions.find(v => v.version === version) || availableVersions[0] || null;
  }, [availableVersions, version, isCustomBrand, isCustomModel, isCustomVersion]);

  // Reset or initialize brand & model when vehicleType changes
  const handleVehicleTypeChange = (type: VehicleType) => {
    setVehicleType(type);
    setIsCustomBrand(false);
    setIsCustomModel(false);
    setIsCustomVersion(false);

    const brands = getCatalogBrands(type);
    const initialBrand = brands[0] || '';
    setBrand(initialBrand);

    const models = getCatalogModels(initialBrand, type);
    const initialModel = models[0] || '';
    setModel(initialModel);

    const versions = getCatalogVersions(initialBrand, initialModel, type);
    if (versions.length > 0) {
      setVersion(versions[0].version);
      setFuelEfficiency(versions[0].fuel_efficiency_km_per_l);
      setFuelType(versions[0].fuel_type);
    } else {
      setVersion('');
      setFuelEfficiency(type === 'tricycle' ? 28 : type === '4wheel' ? 14 : 45);
      setFuelType(type === 'tricycle' ? 'Regular' : 'Gasoline');
    }
  };

  // Handle brand selection
  const handleBrandChange = (newBrand: string) => {
    if (newBrand === '__custom__') {
      setIsCustomBrand(true);
      setIsCustomModel(true);
      setIsCustomVersion(true);
      setBrand('');
      setModel('');
      setVersion('');
    } else {
      setIsCustomBrand(false);
      setBrand(newBrand);
      setIsCustomModel(false);
      setIsCustomVersion(false);

      const models = getCatalogModels(newBrand, vehicleType);
      const initialModel = models[0] || '';
      setModel(initialModel);

      const versions = getCatalogVersions(newBrand, initialModel, vehicleType);
      if (versions.length > 0) {
        setVersion(versions[0].version);
        setFuelEfficiency(versions[0].fuel_efficiency_km_per_l);
        setFuelType(versions[0].fuel_type);
      }
    }
  };

  // Handle model selection
  const handleModelChange = (newModel: string) => {
    if (newModel === '__custom__') {
      setIsCustomModel(true);
      setIsCustomVersion(true);
      setModel('');
      setVersion('');
    } else {
      setIsCustomModel(false);
      setModel(newModel);
      setIsCustomVersion(false);

      const versions = getCatalogVersions(brand, newModel, vehicleType);
      if (versions.length > 0) {
        setVersion(versions[0].version);
        setFuelEfficiency(versions[0].fuel_efficiency_km_per_l);
        setFuelType(versions[0].fuel_type);
      }
    }
  };

  // Handle version selection
  const handleVersionChange = (newVersion: string) => {
    if (newVersion === '__custom__') {
      setIsCustomVersion(true);
      setVersion('');
    } else {
      setIsCustomVersion(false);
      setVersion(newVersion);
      const matched = availableVersions.find(v => v.version === newVersion);
      if (matched) {
        setFuelEfficiency(matched.fuel_efficiency_km_per_l);
        setFuelType(matched.fuel_type);
      }
    }
  };

  // Quick 1-tap "Add to Garage" from catalog
  const handleAddFromCatalog = (item: VehicleCatalogItem) => {
    setEditingVehicleId(null);
    setVehicleType(item.vehicle_type);
    setIsCustomBrand(false);
    setBrand(item.brand);
    setIsCustomModel(false);
    setModel(item.model);
    setIsCustomVersion(false);
    setVersion(item.version);
    setFuelEfficiency(item.fuel_efficiency_km_per_l);
    setFuelType(item.fuel_type);
    setPlateNumber('');
    setTodaBodyNumber('');
    setIsModalOpen(true);
  };

  const handleOpenNewVehicle = (type: VehicleType = 'motorcycle') => {
    setEditingVehicleId(null);
    handleVehicleTypeChange(type);
    setPlateNumber('');
    setTodaBodyNumber('');
    setCustomBrandText('');
    setCustomModelText('');
    setCustomVersionText('');
    setYear(new Date().getFullYear());
    setIsModalOpen(true);
  };

  const handleStartEditVehicle = (veh: Vehicle) => {
    setEditingVehicleId(veh.id);
    setVehicleType(veh.vehicle_type);

    const brands = getCatalogBrands(veh.vehicle_type);
    const hasBrand = brands.includes(veh.brand);
    if (hasBrand) {
      setIsCustomBrand(false);
      setBrand(veh.brand);
      setCustomBrandText('');

      const models = getCatalogModels(veh.brand, veh.vehicle_type);
      const hasModel = models.includes(veh.model);
      if (hasModel) {
        setIsCustomModel(false);
        setModel(veh.model);
        setCustomModelText('');

        const versions = getCatalogVersions(veh.brand, veh.model, veh.vehicle_type);
        const hasVersion = versions.some(v => v.version === veh.version);
        if (hasVersion && veh.version) {
          setIsCustomVersion(false);
          setVersion(veh.version);
          setCustomVersionText('');
        } else if (veh.version) {
          setIsCustomVersion(true);
          setVersion(veh.version);
          setCustomVersionText(veh.version);
        } else {
          setIsCustomVersion(false);
          setVersion(versions[0]?.version || '');
        }
      } else {
        setIsCustomModel(true);
        setModel(veh.model);
        setCustomModelText(veh.model);
        setIsCustomVersion(true);
        setVersion(veh.version || '');
        setCustomVersionText(veh.version || '');
      }
    } else {
      setIsCustomBrand(true);
      setBrand(veh.brand);
      setCustomBrandText(veh.brand);
      setIsCustomModel(true);
      setModel(veh.model);
      setCustomModelText(veh.model);
      setIsCustomVersion(true);
      setVersion(veh.version || '');
      setCustomVersionText(veh.version || '');
    }

    setYear(veh.year || 2024);
    setFuelType(veh.fuel_type || 'Gasoline');
    setPlateNumber(veh.plate_number || '');
    setTodaBodyNumber(veh.toda_body_number || '');
    setFuelEfficiency(veh.fuel_efficiency_km_per_l || 40);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalBrand = isCustomBrand ? customBrandText.trim() || 'Custom' : brand;
    const finalModel = isCustomModel ? customModelText.trim() || 'Custom Model' : model;
    const finalVersion = isCustomVersion ? customVersionText.trim() : version;

    if (editingVehicleId) {
      updateVehicle(editingVehicleId, {
        vehicle_type: vehicleType,
        brand: finalBrand,
        model: finalModel,
        version: finalVersion,
        year: Number(year),
        fuel_type: fuelType,
        plate_number: plateNumber.trim(),
        toda_body_number: todaBodyNumber.trim(),
        fuel_efficiency_km_per_l: Number(fuelEfficiency),
      });
    } else {
      addVehicle({
        vehicle_type: vehicleType,
        brand: finalBrand,
        model: finalModel,
        version: finalVersion,
        year: Number(year),
        fuel_type: fuelType,
        plate_number: plateNumber.trim(),
        toda_body_number: todaBodyNumber.trim(),
        fuel_efficiency_km_per_l: Number(fuelEfficiency),
        odometer_km: 0,
        is_default: userVehicles.length === 0,
      });
    }

    setEditingVehicleId(null);
    setPlateNumber('');
    setTodaBodyNumber('');
    setCustomBrandText('');
    setCustomModelText('');
    setCustomVersionText('');
    setIsModalOpen(false);
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'motorcycle':
        return <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />;
      case 'tricycle':
        return <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      case '4wheel':
        return <Car className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  // Filtered Catalog Items for Guide Tab
  const filteredCatalogItems = useMemo(() => {
    return PHILIPPINE_VEHICLE_CATALOG.filter(item => {
      const matchType = catalogTypeFilter === 'all' || item.vehicle_type === catalogTypeFilter;
      const matchBrand = catalogBrandFilter === 'all' || item.brand === catalogBrandFilter;
      const query = catalogSearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.brand.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.version.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchType && matchBrand && matchSearch;
    });
  }, [catalogTypeFilter, catalogBrandFilter, catalogSearch]);

  const allCatalogBrands = useMemo(() => {
    return Array.from(new Set(PHILIPPINE_VEHICLE_CATALOG.map(v => v.brand))).sort();
  }, []);

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header Bar */}
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
              <Flaticon name="motorcycle" className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Vehicle Garage & Catalog (Mga Sakyanan)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Philippine vehicle models, version generations (V1, V2, V3), and automatic fuel cost computation
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenNewVehicle('motorcycle')}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Flaticon name="add" className="w-4 h-4" />
          <span>REGISTER VEHICLE</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-2 glass-panel-subtle p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('garage')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'garage'
              ? 'glass-btn bg-white/80 dark:bg-white/15 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>My Garage ({userVehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'glass-btn bg-white/80 dark:bg-white/15 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catalog & Fuel Economy Guide ({PHILIPPINE_VEHICLE_CATALOG.length})</span>
        </button>
      </div>

      {/* TAB 1: MY GARAGE */}
      {activeTab === 'garage' && (
        <div className="space-y-4">
          {userVehicles.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-3xl">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No vehicles registered yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Add your motorcycle, tricycle, or private car from the Philippine catalog. Its rated km/L will automatically compute your fuel costs!
              </p>
              <button
                onClick={() => handleOpenNewVehicle('motorcycle')}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>Register First Vehicle</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userVehicles.map(veh => (
                <div
                  key={veh.id}
                  className={`relative rounded-3xl glass-panel-interactive p-5 transition-all shadow-xs ${
                    veh.is_default
                      ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-2xl glass-panel-subtle border border-white/60 dark:border-white/10 shrink-0">
                        {getVehicleIcon(veh.vehicle_type)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                            {veh.model ? `${veh.brand} ${veh.model}` : veh.brand}
                          </h3>
                          {veh.is_default && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              Primary
                            </span>
                          )}
                        </div>
                        {veh.version && (
                          <div className="mt-0.5">
                            <span className="inline-block px-2 py-0.5 rounded-md glass-panel-subtle border border-sky-400/30 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                              {veh.version}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                          {veh.year} • {veh.vehicle_type === '4wheel' ? '4-Wheel Car' : veh.vehicle_type}
                        </p>
                      </div>
                    </div>

                    {!veh.is_default && (
                      <button
                        onClick={() => setDefaultVehicle(veh.id)}
                        className="text-xs text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center space-x-1 cursor-pointer"
                        title="Set as Primary Vehicle"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Set Primary</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/40 dark:border-white/10 text-xs">
                    <div className="p-2.5 rounded-xl glass-panel-subtle text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-center gap-1">
                        <Fuel className="w-3 h-3 text-cyan-500" /> Fuel
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{veh.fuel_type}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-center">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center justify-center gap-1">
                        <Gauge className="w-3 h-3" /> Efficiency
                      </span>
                      <span className="font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block text-xs">
                        {veh.fuel_efficiency_km_per_l} km/L
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl glass-panel-subtle text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Plate / Body #</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block truncate">
                        {veh.plate_number || veh.toda_body_number || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Auto-computation hint tag & Actions */}
                  <div className="mt-2.5 px-3 py-1.5 rounded-xl glass-panel-subtle border border-white/40 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="hidden sm:inline">Automatic trip fuel cost calculation enabled</span>
                      <span className="sm:hidden">Auto fuel calculation</span>
                    </span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleStartEditVehicle(veh)}
                        className="text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Edit Vehicle Profile"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove vehicle ${veh.brand} ${veh.model}?`)) {
                            deleteVehicle(veh.id);
                          }
                        }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Remove Vehicle"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATALOG & FUEL ECONOMY GUIDE */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="p-4 rounded-3xl glass-panel shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search model, version (e.g. Click V2, NMAX V3, Sniper, Vios Gen 3, Barako)..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Vehicle Type Filter */}
              <div className="flex items-center gap-1 glass-panel-subtle p-1 rounded-xl shrink-0 overflow-x-auto">
                <button
                  onClick={() => setCatalogTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogTypeFilter === 'all'
                      ? 'glass-btn bg-white/80 dark:bg-white/15 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setCatalogTypeFilter('motorcycle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogTypeFilter === 'motorcycle'
                      ? 'glass-btn bg-white/80 dark:bg-white/15 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Motorcycle
                </button>
                <button
                  onClick={() => setCatalogTypeFilter('tricycle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogTypeFilter === 'tricycle'
                      ? 'glass-btn bg-white/80 dark:bg-white/15 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Tricycle
                </button>
                <button
                  onClick={() => setCatalogTypeFilter('4wheel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogTypeFilter === '4wheel'
                      ? 'glass-btn bg-white/80 dark:bg-white/15 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  4-Wheel
                </button>
              </div>

              {/* Brand Filter */}
              <select
                value={catalogBrandFilter}
                onChange={e => setCatalogBrandFilter(e.target.value)}
                className="glass-input px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 shrink-0 cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Brands</option>
                {allCatalogBrands.map(b => (
                  <option key={b} value={b} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>Showing <strong>{filteredCatalogItems.length}</strong> Philippine vehicle models & version generations</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Official DOE & benchmark test fuel ratings
              </span>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCatalogItems.map(item => (
              <div
                key={item.id}
                className="rounded-3xl glass-panel-interactive p-4 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full glass-panel-subtle border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300">
                        {item.brand} • {item.category}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        {item.model}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                          Fuel Economy
                        </span>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                          {item.fuel_efficiency_km_per_l} km/L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Version Generation Pill */}
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-[11px] font-bold text-sky-800 dark:text-sky-300 mb-2">
                    <span>{item.version}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 dark:border-white/10 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{item.fuel_type}</span> • <span>{item.years}</span>
                  </div>

                  <button
                    onClick={() => handleAddFromCatalog(item)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white text-[11px] font-bold shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Garage</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGISTER / EDIT VEHICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg glass-modal rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/20 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-emerald-500" />
                  <span>{editingVehicleId ? 'Edit Vehicle Profile' : 'Register Vehicle to Garage'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {editingVehicleId
                    ? 'Update your vehicle model, generation version, plate, and fuel economy'
                    : 'Select brand, model, and version to enable automatic fuel cost computation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Vehicle Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Vehicle Classification <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange('motorcycle')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      vehicleType === 'motorcycle'
                        ? 'glass-panel border-sky-500 bg-sky-500/15 text-sky-800 dark:text-sky-300 ring-2 ring-sky-500/30'
                        : 'glass-panel-subtle border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-sky-500" />
                    <span>Motorcycle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange('tricycle')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      vehicleType === 'tricycle'
                        ? 'glass-panel border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30'
                        : 'glass-panel-subtle border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-amber-500" />
                    <span>Tricycle (TODA)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVehicleTypeChange('4wheel')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      vehicleType === '4wheel'
                        ? 'glass-panel border-cyan-500 bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 ring-2 ring-cyan-500/30'
                        : 'glass-panel-subtle border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Car className="w-4 h-4 text-cyan-500" />
                    <span>4-Wheel Car</span>
                  </button>
                </div>
              </div>

              {/* Brand and Model Cascading Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    2. Brand <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  {!isCustomBrand ? (
                    <select
                      value={brand}
                      onChange={e => handleBrandChange(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {availableBrands.map(b => (
                        <option key={b} value={b} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {b}
                        </option>
                      ))}
                      <option value="__custom__" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">+ Other / Custom Brand</option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        placeholder="Enter Brand Name"
                        value={customBrandText}
                        onChange={e => setCustomBrandText(e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleBrandChange(availableBrands[0] || 'Honda')}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        ← Back to standard brands
                      </button>
                    </div>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    3. Model <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  {!isCustomModel ? (
                    <select
                      value={model}
                      onChange={e => handleModelChange(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {availableModels.map(m => (
                        <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {m}
                        </option>
                      ))}
                      <option value="__custom__" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">+ Other / Custom Model</option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        placeholder="Enter Model Name"
                        value={customModelText}
                        onChange={e => setCustomModelText(e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                      />
                      {!isCustomBrand && (
                        <button
                          type="button"
                          onClick={() => handleModelChange(availableModels[0] || '')}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          ← Back to catalog models
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Version & Generation Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  4. Version / Generation (V1, V2, V3...) <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                {!isCustomVersion && availableVersions.length > 0 ? (
                  <select
                    value={version}
                    onChange={e => handleVersionChange(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {availableVersions.map(v => (
                      <option key={v.id} value={v.version} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {v.version} — {v.fuel_efficiency_km_per_l} km/L ({v.fuel_type})
                      </option>
                    ))}
                    <option value="__custom__" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">+ Other / Custom Generation</option>
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="e.g. V1, V2 Game Changer, Carburetor, Custom Spec"
                      value={customVersionText}
                      onChange={e => setCustomVersionText(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                    />
                    {availableVersions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleVersionChange(availableVersions[0]?.version || '')}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        ← Back to known versions
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Catalog Item Card Preview */}
              {activeCatalogItem && (
                <div className="p-3 rounded-2xl glass-panel-subtle border border-emerald-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Benchmark Fuel Rating</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs">
                      {activeCatalogItem.fuel_efficiency_km_per_l} km/L
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    {activeCatalogItem.description} ({activeCatalogItem.years})
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mt-1">
                    ✓ Est. fuel expenses in your trips and calculator will automatically use this consumption.
                  </p>
                </div>
              )}

              {/* Year & Fuel Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fuel Type <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    required
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Gasoline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Gasoline</option>
                    <option value="Regular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Regular</option>
                    <option value="Premium 95" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Premium 95</option>
                    <option value="Diesel" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Diesel</option>
                    <option value="Electric" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Electric</option>
                  </select>
                </div>
              </div>

              {/* Plate / Toda Number & Fuel Efficiency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {vehicleType === 'tricycle' ? 'TODA Body / Plate #' : 'Plate / MV File No.'}
                  </label>
                  <input
                    type="text"
                    placeholder={vehicleType === 'tricycle' ? 'e.g. TODA-TAG-042' : 'e.g. 772-BOH'}
                    value={plateNumber}
                    onChange={e => setPlateNumber(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Efficiency (km/L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={fuelEfficiency}
                    onChange={e => setFuelEfficiency(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-white/20 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  {editingVehicleId ? 'Update Vehicle Profile' : 'Save to My Garage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
