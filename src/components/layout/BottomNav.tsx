import React from 'react';
import { Flaticon } from '../common/Flaticon';
import { useAuth } from '../../context/AuthContext';

interface Props {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAddTrip: () => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onNavigate, onOpenAddTrip }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="bottom-nav-bar lg:hidden fixed bottom-2.5 left-2.5 right-2.5 z-40 glass-dock rounded-3xl p-1 safe-area-bottom transition-all max-w-md mx-auto print:hidden">
      <div className="grid grid-cols-7 items-center justify-items-center w-full">
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flaticon name="home" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* 2. Trips */}
        <button
          onClick={() => onNavigate('trips')}
          className={`w-full flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'trips'
              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flaticon name="route" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium">Trips</span>
        </button>

        {/* 3. Garage */}
        <button
          onClick={() => onNavigate('vehicles')}
          className={`w-full flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'vehicles'
              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flaticon name="motorcycle" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium">Garage</span>
        </button>

        {/* 4. DEAD CENTER: Quick Add Trip Button */}
        <div className="w-full flex items-center justify-center">
          <button
            onClick={onOpenAddTrip}
            className="flex items-center justify-center -mt-6 bg-sign hover:bg-sign-dark active:scale-95 text-white w-12 h-12 rounded-full shadow-md shadow-black/20 transition-all cursor-pointer ring-4 ring-white/80 dark:ring-slate-900/80 backdrop-blur-md"
            title="Log New Trip"
          >
            <Flaticon name="add" className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 5. Fuel */}
        <button
          onClick={() => onNavigate('fuel')}
          className={`w-full flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'fuel' || activeTab === 'compare'
              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flaticon name="fuel" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium">Fuel</span>
        </button>

        {/* 6. Budget */}
        <button
          onClick={() => onNavigate('finances')}
          className={`w-full flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'finances'
              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flaticon name="wallet" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium">Budget</span>
        </button>

        {/* 7. Reports */}
        <button
          onClick={() => onNavigate('reports')}
          className={`w-full flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flaticon name="reports" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium">Reports</span>
        </button>
      </div>
    </div>
  );
};
