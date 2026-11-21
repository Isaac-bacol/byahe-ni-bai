import React, { useState } from 'react';
import {
  Bike,
  Shield,
  Sun,
  Moon,
  Fuel,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Users,
  Compass,
  Zap,
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';
import { useAuth, ADMIN_SECURITY_PASSKEY } from '../../context/AuthContext';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';
import type { UserType, FuelType } from '../../types';
import { PHILIPPINE_VEHICLE_CATALOG } from '../../lib/vehicleCatalog';
import { Footer } from '../layout/Footer';

interface Props {
  onToggleSimulator?: () => void;
}

export const LandingPage: React.FC<Props> = ({ onToggleSimulator }) => {
  const { allUsers, login, registerUser, registerAdmin, isDarkMode, toggleTheme } = useAuth();

  // Active Main Portal Door: 'user' (Motorists & Drivers) vs 'admin' (Website Administrator)
  const [activePortal, setActivePortal] = useState<'user' | 'admin'>('user');

  // Sub-mode: 'signup' vs 'signin'
  const [userMode, setUserMode] = useState<'signup' | 'signin'>('signup');
  const [adminMode, setAdminMode] = useState<'signin' | 'signup'>('signin');

  // User Sign-Up State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userMuni, setUserMuni] = useState('Tagbilaran City');
  const [userDriverType, setUserDriverType] = useState<Exclude<UserType, 'admin'>>('motorist');
  const [vehicleCatalogId, setVehicleCatalogId] = useState<string>('honda-click125-v2');
  const [isCustomVehicle, setIsCustomVehicle] = useState(false);
  const [vehicleBrand, setVehicleBrand] = useState('Honda');
  const [vehicleModel, setVehicleModel] = useState('Click 125i');
  const [vehicleVersion, setVehicleVersion] = useState('V2 (Game Changer)');
  const [vehicleEfficiency, setVehicleEfficiency] = useState<number>(50.5);
  const [vehicleFuel, setVehicleFuel] = useState<FuelType>('Gasoline');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const handleDriverTypeChange = (type: Exclude<UserType, 'admin'>) => {
    setUserDriverType(type);
    setIsCustomVehicle(false);
    if (type === 'tricycle') {
      const trike = PHILIPPINE_VEHICLE_CATALOG.find(c => c.id === 'bajaj-re-v3') || PHILIPPINE_VEHICLE_CATALOG.find(c => c.vehicle_type === 'tricycle');
      if (trike) {
        setVehicleCatalogId(trike.id);
        setVehicleBrand(trike.brand);
        setVehicleModel(trike.model);
        setVehicleVersion(trike.version);
        setVehicleEfficiency(trike.fuel_efficiency_km_per_l);
        setVehicleFuel(trike.fuel_type);
      }
    } else if (type === 'habal_habal') {
      const habal = PHILIPPINE_VEHICLE_CATALOG.find(c => c.id === 'kawasaki-barako-v2') || PHILIPPINE_VEHICLE_CATALOG.find(c => c.vehicle_type === 'motorcycle');
      if (habal) {
        setVehicleCatalogId(habal.id);
        setVehicleBrand(habal.brand);
        setVehicleModel(habal.model);
        setVehicleVersion(habal.version);
        setVehicleEfficiency(habal.fuel_efficiency_km_per_l);
        setVehicleFuel(habal.fuel_type);
      }
    } else {
      const moto = PHILIPPINE_VEHICLE_CATALOG.find(c => c.id === 'honda-click125-v2') || PHILIPPINE_VEHICLE_CATALOG.find(c => c.vehicle_type === 'motorcycle');
      if (moto) {
        setVehicleCatalogId(moto.id);
        setVehicleBrand(moto.brand);
        setVehicleModel(moto.model);
        setVehicleVersion(moto.version);
        setVehicleEfficiency(moto.fuel_efficiency_km_per_l);
        setVehicleFuel(moto.fuel_type);
      }
    }
  };

  const handleSelectCatalogVehicle = (catId: string) => {
    if (catId === '__custom__') {
      setIsCustomVehicle(true);
      setVehicleCatalogId('__custom__');
    } else {
      setIsCustomVehicle(false);
      setVehicleCatalogId(catId);
      const match = PHILIPPINE_VEHICLE_CATALOG.find(c => c.id === catId);
      if (match) {
        setVehicleBrand(match.brand);
        setVehicleModel(match.model);
        setVehicleVersion(match.version);
        setVehicleEfficiency(match.fuel_efficiency_km_per_l);
        setVehicleFuel(match.fuel_type);
      }
    }
  };

  // User Sign-In State
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [userSignInEmail, setUserSignInEmail] = useState('');

  // Admin Sign-In State
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [adminSignInEmail, setAdminSignInEmail] = useState('');

  // Admin Sign-Up State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAgency, setAdminAgency] = useState('Platform Operations & Support');
  const [adminMuni, setAdminMuni] = useState('Tagbilaran City');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Filtered lists of existing users
  const driverUsers = allUsers.filter(u => u.role !== 'admin');
  const adminUsers = allUsers.filter(u => u.role === 'admin');

  // Handle User Registration
  const handleUserSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const finalBrand = vehicleBrand.trim() || (userDriverType === 'tricycle' ? 'Bajaj' : 'Honda');
    const finalModel =
      vehicleModel.trim() ||
      (userDriverType === 'tricycle'
        ? 'RE'
        : userDriverType === 'habal_habal'
        ? 'Barako II 175'
        : 'Click 125i');

    registerUser({
      name: userName,
      email: userEmail.trim() || `${userName.toLowerCase().replace(/\s+/g, '')}@bohol.ph`,
      phone_number: userPhone.trim() || '09xx-xxx-xxxx',
      user_type: userDriverType,
      municipality: userMuni,
      vehicle: {
        brand: finalBrand,
        model: finalModel,
        version: vehicleVersion,
        fuel_efficiency_km_per_l: Number(vehicleEfficiency),
        fuel_type: vehicleFuel,
        plate_number: vehiclePlate.trim(),
        vehicle_type: userDriverType === 'tricycle' ? 'tricycle' : 'motorcycle',
      },
    });
  };

  // Handle User Sign-In
  const handleUserSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDriverId) {
      login(selectedDriverId);
    } else if (userSignInEmail.trim()) {
      const query = userSignInEmail.trim().toLowerCase();
      const match = driverUsers.find(
        u =>
          u.email.toLowerCase() === query ||
          u.name.toLowerCase() === query ||
          u.name.toLowerCase().replace(/\s+/g, '') === query.replace(/\s+/g, '')
      );
      if (match) {
        login(match.id);
      } else {
        alert('No registered driver found with that email or nickname. Please check or create a new account.');
      }
    }
  };

  // Handle Admin Sign-In
  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAdminId) {
      login(selectedAdminId);
    } else if (adminSignInEmail.trim()) {
      const match = adminUsers.find(
        u => u.email.toLowerCase() === adminSignInEmail.trim().toLowerCase()
      );
      if (match) {
        login(match.id);
      } else {
        alert('No official administrator found with that email.');
      }
    } else if (adminUsers.length > 0) {
      login(adminUsers[0].id);
    }
  };

  // Handle Admin Registration
  const handleAdminSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminName.trim()) {
      setAdminError('Please enter your full name.');
      return;
    }

    const res = registerAdmin({
      name: adminName,
      email: adminEmail.trim() || `${adminName.toLowerCase().replace(/\s+/g, '')}@byahenibai.ph`,
      agency: adminAgency,
      municipality: adminMuni,
      passkey: adminPasskey,
    });

    if (!res.success) {
      setAdminError(res.error || 'Invalid Admin Passkey.');
    }
  };

  return (
    <div className="landing-page-root min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-blue-600/20 bg-slate-900 shrink-0 border border-slate-200/50 dark:border-slate-700/50">
              <img src="/logo.png?v=3" alt="Byahe ni Bai Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Byahe ni Bai
                </span>
                <span className="text-xs uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Bohol
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Vehicle Trip, Fuel & Income Management System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white cursor-pointer active:scale-90 hover:scale-105 transition-all"
            >
              <ThemeToggleIcon isDarkMode={isDarkMode} className="w-4 h-4" />
            </button>

            <a
              href="#portal-access"
              className="px-4 py-2 rounded-xl active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center space-x-1.5 bg-sign hover:bg-sign-dark"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6">
        {/* Background glow ornaments */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel-subtle border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Gidisenyo para sa Katawhan ug mga Drayber sa Bohol</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Subaya Imong <span className="text-brand-gradient font-black">Biyahe, Gasolina</span>, ug Kita sa Bohol
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The all-in-one transport companion for Bohol's <strong>Personal Motorists</strong>, <strong>Habal-Habal</strong>, and <strong>Tricycle TODA drivers</strong> — paired with powerful control tools for <strong>Platform Administrators</strong>.
          </p>

          {/* Quick value props */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl glass-panel-interactive shadow-xs">
              <div className="text-blue-600 dark:text-blue-400 mb-1.5 font-black text-xs flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5" /> 48 Municipalities
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Live Fuel Prices</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Petron, Shell, Caltex</p>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel-interactive shadow-xs">
              <div className="text-emerald-600 dark:text-emerald-400 mb-1.5 font-black text-xs flex items-center gap-1">
                <Bike className="w-3.5 h-3.5" /> Motorists & Drivers
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Trip & Fare Log</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Habal-Habal & TODA</p>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel-interactive shadow-xs">
              <div className="text-amber-600 dark:text-amber-400 mb-1.5 font-black text-xs flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Budget & Boundary
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Net Income Calc</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allowances & targets</p>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel-interactive shadow-xs">
              <div className="text-blue-600 dark:text-blue-400 mb-1.5 font-black text-xs flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Website Admin
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Admin Console</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control & Settings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Authentication Gateway Section */}
      <section id="portal-access" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pb-20">
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          {/* Main Door Portal Switcher Tabs */}
          <div className="grid grid-cols-2 p-2 glass-panel-subtle border-b border-white/20 dark:border-white/10">
            <button
              onClick={() => setActivePortal('user')}
              className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activePortal === 'user'
                  ? 'glass-btn bg-white/80 dark:bg-white/15 text-emerald-800 dark:text-emerald-300 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flaticon name="motorcycle" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>User Side (Motorist / Driver)</span>
            </button>

            <button
              onClick={() => setActivePortal('admin')}
              className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activePortal === 'admin'
                  ? 'glass-btn bg-white/80 dark:bg-white/15 text-blue-800 dark:text-blue-300 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Admin Side (Website Admin)</span>
            </button>
          </div>

          {/* PORTAL 1: USER SIDE (MOTORISTS & DRIVERS) */}
          {activePortal === 'user' && (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Motorist & Local Driver Portal</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      User Side
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sign in or create your personal motorist or commercial driver account
                  </p>
                </div>

                {/* Submode Switcher: Sign Up vs Sign In */}
                <div className="inline-flex p-1 rounded-xl glass-panel-subtle border border-white/20 dark:border-white/10 self-start">
                  <button
                    onClick={() => setUserMode('signup')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userMode === 'signup'
                        ? 'text-white shadow-xs bg-sign hover:bg-sign-dark'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => setUserMode('signin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userMode === 'signin'
                        ? 'text-white shadow-xs bg-sign hover:bg-sign-dark'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* USER SIGN UP FORM */}
              {userMode === 'signup' ? (
                <form onSubmit={handleUserSignUp} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        placeholder="e.g. Juan dela Cruz"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={e => setUserEmail(e.target.value)}
                        placeholder="juan.delacruz@email.com"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bohol Municipality <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        required
                        value={userMuni}
                        onChange={e => setUserMuni(e.target.value)}
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {BOHOL_MUNICIPALITIES.map(m => (
                          <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Contact / Mobile #
                      </label>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={e => setUserPhone(e.target.value)}
                        placeholder="0917-xxx-xxxx"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Driver Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Select Your Driver Category <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleDriverTypeChange('motorist')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          userDriverType === 'motorist'
                            ? 'glass-panel border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30'
                            : 'glass-panel-interactive border-white/20 dark:border-white/10'
                        }`}
                      >
                        <div className="text-xl mb-1">🏍️</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Personal Motorist</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Daily commute, errand trips, allowance & fuel tracker
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDriverTypeChange('habal_habal')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          userDriverType === 'habal_habal'
                            ? 'glass-panel border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                            : 'glass-panel-interactive border-white/20 dark:border-white/10'
                        }`}
                      >
                        <div className="text-xl mb-1">🛵</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Habal-Habal Driver</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Passenger fares, route logs, and daily net profit
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDriverTypeChange('tricycle')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          userDriverType === 'tricycle'
                            ? 'glass-panel border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30'
                            : 'glass-panel-interactive border-white/20 dark:border-white/10'
                        }`}
                      >
                        <div className="text-xl mb-1">🛺</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Tricycle TODA</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Boundary deduction, TODA fares, and net income
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Initial Vehicle Setup */}
                  <div className="p-4 rounded-2xl glass-panel-subtle border border-white/20 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Initial Vehicle in Your Garage</span>
                      </h3>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        Philippine Vehicle Catalog
                      </span>
                    </div>

                    {/* Catalog Model & Version Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Select Model & Version Generation <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        value={isCustomVehicle ? '__custom__' : vehicleCatalogId}
                        onChange={e => handleSelectCatalogVehicle(e.target.value)}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {PHILIPPINE_VEHICLE_CATALOG.filter(v =>
                          v.vehicle_type === (userDriverType === 'tricycle' ? 'tricycle' : 'motorcycle')
                        ).map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {cat.brand} {cat.model} • {cat.version} ({cat.fuel_efficiency_km_per_l} km/L • {cat.fuel_type})
                          </option>
                        ))}
                        <option value="__custom__" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⚙️ Other / Custom Vehicle</option>
                      </select>
                    </div>

                    {!isCustomVehicle ? (
                      <div className="p-2.5 rounded-xl glass-panel-subtle border border-emerald-500/30 flex items-center justify-between text-xs">
                        <div className="text-xs text-emerald-900 dark:text-emerald-300">
                          <span className="font-bold">{vehicleBrand} {vehicleModel}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 ml-1.5 font-medium">{vehicleVersion}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-xs">
                          {vehicleEfficiency} km/L ({vehicleFuel})
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Brand <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={vehicleBrand}
                            onChange={e => setVehicleBrand(e.target.value)}
                            placeholder="e.g. Honda, Yamaha"
                            className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Model <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={vehicleModel}
                            onChange={e => setVehicleModel(e.target.value)}
                            placeholder="e.g. Click 125i"
                            className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Efficiency (km/L)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={vehicleEfficiency}
                            onChange={e => setVehicleEfficiency(Number(e.target.value))}
                            className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Fuel Type <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <select
                          required
                          value={vehicleFuel}
                          onChange={e => setVehicleFuel(e.target.value as FuelType)}
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="Gasoline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Gasoline</option>
                          <option value="Regular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Regular</option>
                          <option value="Premium 95" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Premium 95</option>
                          <option value="Diesel" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Diesel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {userDriverType === 'tricycle' ? 'TODA Body / Plate #' : 'Plate / MV File No.'}
                        </label>
                        <input
                          type="text"
                          value={vehiclePlate}
                          onChange={e => setVehiclePlate(e.target.value)}
                          placeholder={userDriverType === 'tricycle' ? 'e.g. TODA-TAG-042' : 'e.g. 772-BOH'}
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl glass-panel-subtle border border-emerald-500/30 flex items-start space-x-2.5 text-xs text-emerald-900 dark:text-emerald-300">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Pagkahuman sa pagrehistro, pagadawaton ang <strong>Republic Act 10173 (Data Privacy Act)</strong> ug <strong>Terms of Service</strong> aron mapanalipdan ang inyong biyahe ug datos.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer bg-sign hover:bg-sign-dark"
                  >
                    <span>Create Driver Account & Enter Byahe ni Bai</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* USER SIGN IN FORM */
                <form onSubmit={handleUserSignIn} className="mt-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Choose from Registered Bohol Drivers:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {driverUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedDriverId(u.id);
                            setUserSignInEmail(u.email);
                          }}
                          className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                            selectedDriverId === u.id
                              ? 'glass-panel border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                              : 'glass-panel-interactive border-white/20 dark:border-white/10'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg shrink-0">
                            {u.user_type === 'habal_habal' ? '🛵' : u.user_type === 'tricycle' ? '🛺' : '🏍️'}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                              {u.user_type.replace('_', '-')} • {u.municipality}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="grow border-t border-white/20 dark:border-white/10" />
                    <span className="shrink-0 mx-4 text-xs text-slate-400 font-medium">Or enter your email</span>
                    <div className="grow border-t border-white/20 dark:border-white/10" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email or Nickname
                    </label>
                    <input
                      type="text"
                      value={userSignInEmail}
                      onChange={e => {
                        setUserSignInEmail(e.target.value);
                        setSelectedDriverId('');
                      }}
                      placeholder="user@gmail.com"
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer bg-sign hover:bg-sign-dark"
                  >
                    <span>Sign In to User Side</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* PORTAL 2: ADMIN SIDE (WEBSITE ADMINISTRATOR) */}
          {activePortal === 'admin' && (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-200/40 dark:border-blue-900/40">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Website Administrator</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                      Website Control
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Administrative control over website settings, driver accounts, fuel prices, and system data
                  </p>
                </div>

                {/* Submode Switcher: Admin Sign In vs Register Admin */}
                <div className="inline-flex p-1 rounded-xl glass-panel-subtle border border-white/20 dark:border-white/10 self-start">
                  <button
                    onClick={() => {
                      setAdminMode('signin');
                      setAdminError(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      adminMode === 'signin'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Admin Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAdminMode('signup');
                      setAdminError(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      adminMode === 'signup'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Register Admin
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="mt-4 p-3 rounded-xl glass-panel-subtle border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* ADMIN SIGN IN FORM */}
              {adminMode === 'signin' ? (
                <form onSubmit={handleAdminSignIn} className="mt-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Select Authorized Administrator:
                    </label>
                    <div className="space-y-2">
                      {adminUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedAdminId(u.id);
                            setAdminSignInEmail(u.email);
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                            selectedAdminId === u.id || (adminUsers.length === 1 && !selectedAdminId)
                              ? 'glass-panel border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30'
                              : 'glass-panel-interactive border-white/20 dark:border-white/10'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold shrink-0">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {u.email} • {u.municipality === 'Tagbilaran City' ? 'System Administrator' : (u.municipality || 'System Administrator')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel-subtle border border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 flex items-center space-x-2.5">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>
                      The Admin Side gives full control over website settings, registered driver accounts, fuel price benchmarks, and database synchronizations.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl active:scale-98 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer bg-sign hover:bg-sign-dark"
                  >
                    <span>Enter Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* ADMIN REGISTRATION FORM */
                <form onSubmit={handleAdminSignUp} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Administrator Full Name <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={e => setAdminName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Administrator Email
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={e => setAdminEmail(e.target.value)}
                        placeholder="admin@byahenibai.ph"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Base Location / City <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        required
                        value={adminMuni}
                        onChange={e => setAdminMuni(e.target.value)}
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {BOHOL_MUNICIPALITIES.map(m => (
                          <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={adminAgency}
                        onChange={e => setAdminAgency(e.target.value)}
                        placeholder="e.g. System Administrator, Webmaster, Support"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Security Passkey */}
                  <div className="p-4 rounded-2xl glass-panel-subtle border border-blue-500/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Master Security Passkey <span className="text-red-500 font-bold ml-0.5">*</span></span>
                      </label>
                      <span className="text-xs font-mono font-bold bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                        Key: {ADMIN_SECURITY_PASSKEY}
                      </span>
                    </div>
                    <input
                      type="password"
                      required
                      value={adminPasskey}
                      onChange={e => setAdminPasskey(e.target.value)}
                      placeholder={`Enter master passkey (${ADMIN_SECURITY_PASSKEY})`}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1.5">
                      This security passkey ensures only authorized administrators can create admin accounts and manage the website.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl glass-panel-subtle border border-blue-500/30 flex items-start space-x-2.5 text-xs text-blue-900 dark:text-blue-300">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      As an authorized administrator, you will also review and accept the <strong>Data Privacy Act (RA 10173)</strong> & <strong>Terms of Service</strong> governance compliance upon creation.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl active:scale-98 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer bg-sign hover:bg-sign-dark"
                  >
                    <span>Verify Passkey & Create Admin Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
