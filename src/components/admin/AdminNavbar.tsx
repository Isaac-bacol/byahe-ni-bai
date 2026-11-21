import React from 'react';
import { Shield, LogOut, RefreshCw, Eye, UserCog } from 'lucide-react';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface Props {
  onOpenSupabaseConfig?: () => void;
  onToggleSimulator?: () => void;
  onNavigate?: (tab: string) => void;
  onOpenEditProfile?: () => void;
}

export const AdminNavbar: React.FC<Props> = ({
  onOpenSupabaseConfig,
  onToggleSimulator,
  onNavigate,
  onOpenEditProfile,
}) => {
  const { currentUser, isDarkMode, toggleTheme, logout } = useAuth();
  const { supabaseConnected, isSyncing, syncWithSupabase } = useData();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-white/60 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Admin Badge */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-md shadow-blue-900/20 bg-slate-900 dark:bg-slate-950 shrink-0 border border-slate-200/60 dark:border-slate-800/80">
            <img src="/logo.png?v=3" alt="Byahe ni Bai" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                Byahe ni Bai
              </span>
              <span className="hidden lg:inline text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-400/30 backdrop-blur-xs">
                ADMIN CONSOLE v2.5.0
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium hidden sm:block whitespace-nowrap">
              Website Administration & System Control
            </p>
          </div>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Switch to User View button */}
          <button
            onClick={() => onNavigate?.('user_dashboard')}
            title="Open Public Bohol Motorist App"
            className="px-2.5 py-1.5 rounded-xl glass-btn text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden lg:inline">User Dashboard</span>
          </button>

          {/* Supabase Sync Button */}
          <button
            onClick={syncWithSupabase}
            disabled={isSyncing}
            title="Sync with Supabase"
            className="p-2 rounded-xl glass-btn text-slate-700 dark:text-slate-200 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline text-xs font-bold">Sync</span>
          </button>

          {/* Edit Profile button */}
          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              title="Edit Profile"
              className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer active:scale-90 hover:scale-105"
            >
              <UserCog className="w-4 h-4 text-blue-500" />
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer active:scale-90 hover:scale-105"
          >
            <ThemeToggleIcon isDarkMode={isDarkMode} className="w-4 h-4" />
          </button>

          {/* Admin User Badge */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-blue-400/30 glass-panel-subtle text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="truncate max-w-[120px]">{currentUser.name.split(' ')[0]}</span>
            <span className="text-xs opacity-75">({currentUser.municipality})</span>
          </div>

          <button
            onClick={logout}
            title="Sign Out from Admin Portal"
            className="px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-red-900/20 transition-all cursor-pointer active:scale-95 bg-sign hover:bg-sign-dark"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
