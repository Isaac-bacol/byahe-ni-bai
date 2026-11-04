import React, { useState, useId, useTransition, useMemo } from 'react';
import {
  Bike,
  Sun,
  Moon,
  Fuel,
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
  Gauge,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Search,
  X,
  Check,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';
import { useAuth } from '../../context/AuthContext';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';
import type { UserType, FuelType } from '../../types';
import { PHILIPPINE_VEHICLE_CATALOG } from '../../lib/vehicleCatalog';
import { Footer } from '../layout/Footer';

interface DriverRegistrationForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  municipality: string;
  driverType: Exclude<UserType, 'admin'>;
  catalogId: string;
  isCustom: boolean;
  brand: string;
  model: string;
  version: string;
  efficiencyKmPerL: number;
  fuelType: FuelType;
  plateNumber: string;
}

const INITIAL_REGISTRATION_STATE: DriverRegistrationForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  municipality: 'Tagbilaran City',
  driverType: 'motorist',
  catalogId: 'honda-click125-v2',
  isCustom: false,
  brand: 'Honda',
  model: 'Click 125i',
  version: 'V2 (Game Changer)',
  efficiencyKmPerL: 50.5,
  fuelType: 'Gasoline',
  plateNumber: '',
};

export const UserLandingPage: React.FC = () => {
  const { allUsers, login, registerUser, isDarkMode, toggleTheme } = useAuth();
  const [, startTransition] = useTransition();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState<DriverRegistrationForm>(INITIAL_REGISTRATION_STATE);

  // Sign-in state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign-up password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vehicle catalog search query
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');

  const formId = useId();

  // Filter catalog vehicles based on search query and driver classification
  const filteredVehicles = useMemo(() => {
    const targetType = formData.driverType === 'tricycle' ? 'tricycle' : 'motorcycle';
    const baseList = PHILIPPINE_VEHICLE_CATALOG.filter(v => v.vehicle_type === targetType);
    if (!vehicleSearchQuery.trim()) return baseList;
    const q = vehicleSearchQuery.toLowerCase().trim();
    return baseList.filter(
      v =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.version.toLowerCase().includes(q) ||
        (v.displacement_cc && v.displacement_cc.toLowerCase().includes(q)) ||
        (v.category && v.category.toLowerCase().includes(q))
    );
  }, [formData.driverType, vehicleSearchQuery]);

  // Unified driver type switcher
  const handleDriverCategoryChange = (driverType: Exclude<UserType, 'admin'>) => {
    const defaultCatalogItem =
      driverType === 'tricycle'
        ? PHILIPPINE_VEHICLE_CATALOG.find(c => c.vehicle_type === 'tricycle')
        : PHILIPPINE_VEHICLE_CATALOG.find(c => c.vehicle_type === 'motorcycle');

    setFormData(prev => ({
      ...prev,
      driverType,
      isCustom: false,
      catalogId: defaultCatalogItem?.id ?? '__custom__',
      brand: defaultCatalogItem?.brand ?? 'Honda',
      model: defaultCatalogItem?.model ?? 'Click 125i',
      version: defaultCatalogItem?.version ?? 'V2',
      efficiencyKmPerL: defaultCatalogItem?.fuel_efficiency_km_per_l ?? 45,
      fuelType: defaultCatalogItem?.fuel_type ?? 'Gasoline',
    }));
  };

  const handleCatalogSelection = (catalogId: string) => {
    if (catalogId === '__custom__') {
      setFormData(prev => ({ ...prev, catalogId, isCustom: true }));
      return;
    }

    const matched = PHILIPPINE_VEHICLE_CATALOG.find(item => item.id === catalogId);
    if (!matched) return;

    setFormData(prev => ({
      ...prev,
      catalogId,
      isCustom: false,
      brand: matched.brand,
      model: matched.model,
      version: matched.version,
      efficiencyKmPerL: matched.fuel_efficiency_km_per_l,
      fuelType: matched.fuel_type,
    }));
  };

  const handleSignUpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('Please enter your full name.');
      return;
    }

    if (!formData.password) {
      alert('Password is required. Please create a password for your account.');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match. Please verify that both password fields are identical.');
      return;
    }

    const brand = formData.brand.trim() || (formData.driverType === 'tricycle' ? 'Bajaj' : 'Honda');
    const model =
      formData.model.trim() ||
      (formData.driverType === 'tricycle'
        ? 'RE 4S'
        : formData.driverType === 'habal_habal'
        ? 'Barako II 175'
        : 'Click 125i');

    registerUser({
      name: formData.fullName.trim(),
      email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@bohol.ph`,
      password: formData.password,
      phone_number: formData.phone.trim() || '09xx-xxx-xxxx',
      user_type: formData.driverType,
      municipality: formData.municipality,
      vehicle: {
        brand,
        model,
        version: formData.version,
        fuel_efficiency_km_per_l: Number(formData.efficiencyKmPerL),
        fuel_type: formData.fuelType,
        plate_number: formData.plateNumber.trim(),
        vehicle_type: formData.driverType === 'tricycle' ? 'tricycle' : 'motorcycle',
      },
    });
  };

  const handleSignInSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = signInIdentifier.trim().toLowerCase();
    if (!query) return;

    // Checks user credentials against user/admin registry by Email or Name/Nickname
    const match = allUsers.find(
      u =>
        u.email.toLowerCase() === query ||
        u.name.toLowerCase() === query ||
        u.name.toLowerCase().replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
        u.name.toLowerCase().split(' ')[0] === query
    );

    if (match) {
      if (match.password) {
        if (!signInPassword) {
          alert('Please enter your password to sign in.');
          return;
        }
        if (match.password !== signInPassword) {
          alert('Incorrect password. Please check your password and try again.');
          return;
        }
      }
      login(match.id);
    } else {
      alert('No account found with this email or nickname. Please check your credentials or register a new driver account.');
    }
  };

  // Live estimated Bohol trip burn calculation for the showcase badge
  const previewEstimatedTripKm = 24.5; // Average Tagbilaran - Tubigon / Loboc transit
  const previewLitersBurned = (previewEstimatedTripKm / (formData.efficiencyKmPerL || 45)).toFixed(2);
  const previewTripCost = (Number(previewLitersBurned) * 68.5).toFixed(0);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      {/* Semantic Top Header */}
      <header className="sticky top-0 z-50 glass-header border-b border-white/60 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm bg-slate-950 shrink-0 border border-slate-200/60 dark:border-white/15">
              <img src="/logo.png?v=2" alt="Byahe ni Bai Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Byahe ni Bai
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  Bohol
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Provincial Transport & Vehicle Fuel Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              type="button"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer active:scale-90 hover:scale-105"
            >
              <ThemeToggleIcon isDarkMode={isDarkMode} className="w-4 h-4" />
            </button>

            <a
              href="#auth-portal"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-sky-900/15 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>{authMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Studio Web Section: Asymmetric 2-Column Desktop Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Column 1: Contextual Hero & Dynamic Vehicle Spec Preview (5 Cols) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel-subtle border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Gidisenyo alang sa mga Drayber ug Katawhan sa Bohol</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Subaya Imong <span className="text-brand-gradient">Biyahe, Gasolina</span>, ug Kita sa Bohol
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Accurate fuel metrics for <strong>Personal Motorists</strong>, <strong>Habal-Habal</strong> riders, and <strong>Tricycle TODA</strong> operators across all 48 Bohol municipalities.
              </p>
            </div>

            {/* Interactive Live Spec Badge Card */}
            <div className="glass-panel p-5 rounded-3xl space-y-4 border border-slate-200/80 dark:border-white/10 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                    {formData.driverType === 'tricycle' ? (
                      <Bike className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Bike className="w-4 h-4 text-sky-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Profile</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white capitalize">
                      {formData.brand} {formData.model}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {formData.efficiencyKmPerL} km/L
                </span>
              </div>

              {/* Dynamic Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl glass-panel-subtle">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-amber-500" /> Fuel Burn (24 km trip)
                  </span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    ~{previewLitersBurned} <span className="text-xs font-semibold text-slate-400">Liters</span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl glass-panel-subtle">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" /> Est. Bohol Gasoline Cost
                  </span>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₱{previewTripCost} <span className="text-xs font-semibold text-slate-400">PHP</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-500" /> {formData.municipality} Benchmark
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formData.fuelType} Fuel System
                </span>
              </div>
            </div>

            {/* Feature Highlights List */}
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>48 Bohol Municipalities with live weekly fuel advisory adjustments</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Preset vehicle generations: Click 125/150, Barako, Bajaj RE, TMX, Aerox</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>TODA boundary deductions, driver allowances, and passenger fare logs</span>
              </li>
            </ul>
          </section>

          {/* Column 2: Authentic Web Form Console (7 Cols) */}
          <section id="auth-portal" className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10">
              
              {/* Tabs Switcher */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/70 dark:border-white/10">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {authMode === 'signup' ? 'Driver Registration' : 'Account Sign In'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {authMode === 'signup'
                      ? 'Register your motorcycle or tricycle to start calculating'
                      : 'Access your trip logs, garage, and financial records'}
                  </p>
                </div>

                <div className="inline-flex p-1 rounded-2xl glass-panel-subtle border border-slate-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => startTransition(() => setAuthMode('signin'))}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => startTransition(() => setAuthMode('signup'))}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* AUTH FORM: SIGN IN */}
              {authMode === 'signin' ? (
                <form onSubmit={handleSignInSubmit} className="space-y-5">
                  <div className="space-y-3.5">
                    <div>
                      <label htmlFor={`${formId}-signin-email`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email or Nickname
                      </label>
                      <input
                        id={`${formId}-signin-email`}
                        type="text"
                        required
                        value={signInIdentifier}
                        onChange={e => setSignInIdentifier(e.target.value)}
                        placeholder="user@gmail.com"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label htmlFor={`${formId}-signin-pass`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id={`${formId}-signin-pass`}
                          type={showSignInPassword ? 'text' : 'password'}
                          value={signInPassword}
                          onChange={e => setSignInPassword(e.target.value)}
                          placeholder="••••••••"
                          className="glass-input w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-medium focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                        >
                          {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* AUTH FORM: REGISTRATION */
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor={`${formId}-name`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={`${formId}-name`}
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="e.g. Juan dela Cruz"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm font-medium focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label htmlFor={`${formId}-email`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id={`${formId}-email`}
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="juan.delacruz@email.com"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm font-medium focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password (Required) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor={`${formId}-pass`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id={`${formId}-pass`}
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={formData.password}
                          onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Min. 6 characters"
                          className="glass-input w-full pl-3.5 pr-10 py-2 rounded-xl text-sm font-medium focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`${formId}-confirm-pass`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id={`${formId}-confirm-pass`}
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={formData.confirmPassword}
                          onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Re-enter password"
                          className="glass-input w-full pl-3.5 pr-10 py-2 rounded-xl text-sm font-medium focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor={`${formId}-muni`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bohol Municipality <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id={`${formId}-muni`}
                        required
                        value={formData.municipality}
                        onChange={e => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer focus:outline-hidden"
                      >
                        {BOHOL_MUNICIPALITIES.map(muni => (
                          <option key={muni} value={muni} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {muni}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`${formId}-phone`} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Contact / Mobile #
                      </label>
                      <input
                        id={`${formId}-phone`}
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="0917-xxx-xxxx"
                        className="glass-input w-full px-3.5 py-2 rounded-xl text-sm font-medium focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Driver Classification */}
                  <fieldset className="space-y-1.5 pt-1">
                    <legend className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Transport Classification <span className="text-rose-500">*</span>
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'motorist', label: 'Motorist', desc: 'Personal Commute' },
                        { type: 'habal_habal', label: 'Habal-Habal', desc: 'Commercial Rider' },
                        { type: 'tricycle', label: 'Tricycle', desc: 'TODA Operator' },
                      ].map(cat => {
                        const isSelected = formData.driverType === cat.type;
                        return (
                          <button
                            key={cat.type}
                            type="button"
                            onClick={() => handleDriverCategoryChange(cat.type as Exclude<UserType, 'admin'>)}
                            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30'
                                : 'glass-panel-subtle hover:border-slate-300 dark:hover:border-white/15'
                            }`}
                          >
                            <Bike className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                            <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                              {cat.label}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {cat.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Vehicle Specs Fieldset */}
                  <fieldset className="p-3.5 rounded-2xl glass-panel-subtle border border-slate-200/80 dark:border-white/10 space-y-3">
                    <legend className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                      Initial Garage Vehicle Configuration
                    </legend>

                    {/* Quick Search Bar for Vehicle Models */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor={`${formId}-vehicle-search`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Search Vehicle Model
                        </label>
                        {vehicleSearchQuery && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {filteredVehicles.length} {filteredVehicles.length === 1 ? 'model' : 'models'} found
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          id={`${formId}-vehicle-search`}
                          type="text"
                          value={vehicleSearchQuery}
                          onChange={e => setVehicleSearchQuery(e.target.value)}
                          placeholder="Type to search (e.g. Click, Raider, NMAX, Aerox, Wave, Barako)..."
                          className="glass-input w-full pl-8.5 pr-8 py-2 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-hidden"
                        />
                        {vehicleSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setVehicleSearchQuery('')}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Clear search"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Quick 1-Tap Result Cards if searching */}
                      {vehicleSearchQuery && filteredVehicles.length > 0 && (
                        <div className="max-h-44 overflow-y-auto space-y-1.5 p-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 scrollbar-thin">
                          {filteredVehicles.slice(0, 8).map(cat => {
                            const isSelected = formData.catalogId === cat.id && !formData.isCustom;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  handleCatalogSelection(cat.id);
                                }}
                                className={`w-full p-2 rounded-lg text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/40'
                                    : 'hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <div className="min-w-0 pr-2">
                                  <span className="font-extrabold truncate block">
                                    {cat.brand} {cat.model}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                                    {cat.version} ({cat.fuel_efficiency_km_per_l} km/L • {cat.fuel_type})
                                  </span>
                                </div>
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold shrink-0">Select</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {vehicleSearchQuery && filteredVehicles.length === 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 text-center">
                          <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium">
                            No matching models found for "{vehicleSearchQuery}".
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCatalogSelection('__custom__')}
                            className="mt-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 underline cursor-pointer"
                          >
                            Click here to configure a Custom / Unlisted Vehicle
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor={`${formId}-catalog`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Selected Model & Catalog Generation
                        </label>
                        {!formData.isCustom && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>{formData.efficiencyKmPerL} km/L</span>
                          </span>
                        )}
                      </div>

                      <select
                        id={`${formId}-catalog`}
                        value={formData.isCustom ? '__custom__' : formData.catalogId}
                        onChange={e => handleCatalogSelection(e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-hidden"
                      >
                        {filteredVehicles.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {cat.brand} {cat.model} • {cat.version} ({cat.fuel_efficiency_km_per_l} km/L • {cat.fuel_type})
                          </option>
                        ))}
                        <option value="__custom__" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          Custom / Unlisted Vehicle
                        </option>
                      </select>
                    </div>

                    {formData.isCustom && (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Brand</label>
                          <input
                            type="text"
                            required
                            value={formData.brand}
                            onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                            className="glass-input w-full px-2.5 py-1.5 rounded-xl text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">Model</label>
                          <input
                            type="text"
                            required
                            value={formData.model}
                            onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                            className="glass-input w-full px-2.5 py-1.5 rounded-xl text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">km/L</label>
                          <input
                            type="number"
                            step="0.5"
                            value={formData.efficiencyKmPerL}
                            onChange={e => setFormData(prev => ({ ...prev, efficiencyKmPerL: Number(e.target.value) }))}
                            className="glass-input w-full px-2.5 py-1.5 rounded-xl text-xs font-medium"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor={`${formId}-fuel`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Fuel Grade
                        </label>
                        <select
                          id={`${formId}-fuel`}
                          value={formData.fuelType}
                          onChange={e => setFormData(prev => ({ ...prev, fuelType: e.target.value as FuelType }))}
                          className="glass-input w-full px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer"
                        >
                          <option value="Gasoline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Gasoline</option>
                          <option value="Regular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Regular</option>
                          <option value="Premium 95" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Premium 95</option>
                          <option value="Diesel" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Diesel</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor={`${formId}-plate`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {formData.driverType === 'tricycle' ? 'TODA Body / Plate' : 'Plate / MV File'}
                        </label>
                        <input
                          id={`${formId}-plate`}
                          type="text"
                          value={formData.plateNumber}
                          onChange={e => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                          placeholder={formData.driverType === 'tricycle' ? 'TODA-TAG-042 (Optional)' : 'e.g. 772-BOH (Optional)'}
                          className="glass-input w-full px-3 py-1.5 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <div className="p-3 rounded-2xl glass-panel-subtle flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      Registration is protected under <strong>Republic Act 10173 (Data Privacy Act)</strong>. Your location logs and boundary metrics remain confidential.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Complete Driver Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Semantic Footer */}
      <Footer />
    </div>
  );
};

