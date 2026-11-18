import React, { useState } from 'react';
import {
  ChevronDown,
  LogOut,
  Bell,
  Bike,
  Shield,
  UserCog,
  HelpCircle,
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';
import { useAuth } from '../../context/AuthContext';
import { APP_REVISION_LABEL, APP_BUILD_DATE } from '../../lib/version';

interface Props {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenSupabaseConfig?: () => void;
  onOpenWhatsNew?: () => void;
  onOpenEditProfile?: () => void;
  onOpenTutorial?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onNavigate,
  onOpenSupabaseConfig,
  onOpenWhatsNew,
  onOpenEditProfile,
  onOpenTutorial,
}) => {
  const { currentUser, userType, isDarkMode, toggleTheme, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!currentUser) return null;

  const getRoleBadge = () => {
    switch (userType) {
      case 'motorist':
        return {
          label: 'Motorist',
          color: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        };
      case 'habal_habal':
        return {
          label: 'Habal-Habal',
          color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'tricycle':
        return {
          label: 'Tricycle TODA',
          color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 glass-header transition-colors print:hidden">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Bohol Branding */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl overflow-hidden shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform bg-slate-900 shrink-0 border border-white/30 dark:border-white/10">
            <img src="/logo.png?v=3" alt="Byahe ni Bai Logo" className="w-full h-full object-cover" />
          </div>
          <div className="shrink-0">
            <div className="flex items-center space-x-1.5 whitespace-nowrap">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Byahe ni Bai
              </span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-lg bg-emerald-500/15 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap backdrop-blur-xs">
                Bohol
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden xl:block whitespace-nowrap">
              Trip, Fuel & Income Management
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-nav hidden lg:flex items-center space-x-1 text-xs font-bold text-slate-600 dark:text-slate-300 glass-panel-subtle p-1 rounded-2xl shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flaticon name="home" className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('trips')}
            className={`flex items-center px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'trips'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flaticon name="route" className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Trips</span>
          </button>
          <button
            onClick={() => onNavigate('vehicles')}
            className={`flex items-center px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vehicles'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flaticon name="motorcycle" className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Garage</span>
          </button>
          <button
            onClick={() => onNavigate('fuel')}
            className={`flex items-center px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fuel' || activeTab === 'compare'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flaticon name="fuel" className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Fuel<span className="hidden xl:inline"> & FuelWatch</span></span>
          </button>
          <button
            onClick={() => onNavigate('finances')}
            className={`flex items-center px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'finances'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flaticon name="wallet" className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Finances</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className={`flex items-center px-2.5 xl:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flaticon name="reports" className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Reports</span>
          </button>
        </nav>

        {/* Right Tools & Role Switcher */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 relative">
          {/* How to Use / Tutorial Button */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              aria-label="How to Use Byahe ni Bai"
              title="How to Use Byahe ni Bai"
              className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0 active:scale-90 hover:scale-105"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          )}

          {/* What's New & Advisories Button */}
          {onOpenWhatsNew && (
            <button
              onClick={onOpenWhatsNew}
              title="What's New & Upcoming Bohol Fuel Advisories"
              className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-700 dark:text-slate-200 transition-all cursor-pointer relative shrink-0 active:scale-90 hover:scale-105"
            >
              <Bell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>
          )}

          {/* Light / Dark Mode Toggle with micro-interaction */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shrink-0 active:scale-90 hover:scale-105"
          >
            <ThemeToggleIcon isDarkMode={isDarkMode} className="w-4 h-4" />
          </button>

          {/* User Profile Pill with Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`h-[34px] flex items-center space-x-1.5 px-2.5 sm:px-3 rounded-xl border font-bold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 backdrop-blur-md ${roleBadge?.color || 'bg-cyan-100/70 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800'}`}
              title={`${currentUser.name} (${roleBadge?.label || 'Driver'})`}
            >
              <Bike className="w-3.5 h-3.5 text-current shrink-0" />
              <span className="font-extrabold max-w-[90px] sm:max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] font-medium opacity-80 hidden xl:inline">({roleBadge?.label || 'Driver'})</span>
              <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-modal rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-xl">
                <div className="pb-2.5 mb-2.5 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-base border border-sky-500/30">
                      <Bike className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>{currentUser.municipality}</span>
                    <span className="capitalize font-bold text-sky-600 dark:text-sky-400">
                      {roleBadge?.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {onOpenEditProfile && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenEditProfile();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/40 hover:bg-cyan-500/20 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <UserCog className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Edit Profile</span>
                      </div>
                      <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 opacity-80">Edit</span>
                    </button>
                  )}

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/40 hover:bg-cyan-500/20 flex items-center space-x-2 cursor-pointer transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('vehicles');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 flex items-center space-x-2 cursor-pointer transition-colors"
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>My Garage Vehicles</span>
                  </button>

                  {onOpenTutorial && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenTutorial();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 flex items-center space-x-2 cursor-pointer transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>How to Use (Tutorial)</span>
                    </button>
                  )}

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

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-950/40 flex items-center space-x-2 cursor-pointer pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>

                  <div className="pt-2 text-[10px] text-center font-medium text-slate-400 dark:text-slate-500">
                    Byahe ni Bai {APP_REVISION_LABEL} • {APP_BUILD_DATE}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
