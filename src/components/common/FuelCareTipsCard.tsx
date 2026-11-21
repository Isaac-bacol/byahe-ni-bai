import React, { useState, useEffect } from 'react';
import {
  Fuel,
  Gauge,
  Wrench,
  CheckCircle2,
  Circle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import type { Vehicle } from '../../types';

interface Props {
  vehicle?: Vehicle;
  initialTab?: 'save' | 'optimize' | 'checkup';
  onOpenGarage?: () => void;
}

interface TipItem {
  id: string;
  title: string;
  badge: string;
  description: string;
}

interface CheckupItem {
  id: string;
  title: string;
  interval: string;
  note: string;
}

const CHECKUP_STORAGE_KEY = 'byahe_maintenance_checks_v1';

const SAVE_GASOLINE_TIPS: TipItem[] = [
  {
    id: 'save-1',
    title: 'Steady 40–55 km/h Cruising',
    badge: 'Save ~15–20%',
    description:
      'Avoid sudden hard acceleration ("walay puga-puga") and aggressive braking. Smooth throttle control keeps RPMs in the optimal economy zone on Bohol highways.',
  },
  {
    id: 'save-2',
    title: 'Engine Off When Idle Over 30s',
    badge: 'Save Fuel',
    description:
      'Turn off the engine while waiting at terminal queues, long traffic stops, or loading passengers instead of burning fuel while stationary.',
  },
  {
    id: 'save-3',
    title: 'Refuel Early & Track Weekly Updates',
    badge: 'Smart Timing',
    description:
      'Top up during cooler morning hours and before Tuesday 6:00 AM price hikes when fuelprice.ph signals an upcoming increase.',
  },
  {
    id: 'save-4',
    title: 'Avoid Excess Cargo Weight',
    badge: 'Lower Load',
    description:
      'Unload unnecessary heavy tools or cargo from utility boxes/sidecars to reduce engine strain, especially on uphill routes (Bilar, Carmen, Jagna).',
  },
];

const OPTIMIZE_VEHICLE_TIPS: TipItem[] = [
  {
    id: 'opt-1',
    title: 'Maintain Proper Tire Pressure (PSI)',
    badge: '+3–5% km/L',
    description:
      'Soft tires create heavy rolling resistance and make your engine work harder. Check front & rear tire PSI weekly before starting trips.',
  },
  {
    id: 'opt-2',
    title: 'Clean Air Filter & Spark Plug',
    badge: 'Clean Burn',
    description:
      'Dusty barangay roads clog air filters fast, causing rich fuel mixtures and power loss. Clean or replace filters every 3,000–4,000 km.',
  },
  {
    id: 'opt-3',
    title: 'Service CVT Belt / Chain Tension',
    badge: 'Smooth Drive',
    description:
      'For scooters (Click, NMAX, Mio), clean CVT pulleys & check V-belt wear. For chain-drive motorcycles/tricycles, keep chains clean, oiled, and tensioned.',
  },
  {
    id: 'opt-4',
    title: 'Use Recommended Octane & Oil Grade',
    badge: 'Engine Health',
    description:
      'Stick to your manual’s recommended fuel (RON 91 fits most commuter bikes) and exact engine oil viscosity—over-thick oil hurts fuel economy.',
  },
];

const CHECKUP_SCHEDULE: CheckupItem[] = [
  {
    id: 'chk-oil',
    title: 'Engine Oil & Oil Filter / Strainer',
    interval: 'Every 1,500–2,000 km (or Monthly)',
    note: 'Fresh oil reduces internal engine friction and prevents overheating.',
  },
  {
    id: 'chk-tires',
    title: 'Tire Pressure, Tread & Valve Caps',
    interval: 'Weekly / Before Long Trips',
    note: 'Proper PSI improves braking safety, tire life, and km/L.',
  },
  {
    id: 'chk-brakes',
    title: 'Brake Pads/Shoes, Fluid & Signal Lights',
    interval: 'Every 2 Weeks',
    note: 'Verify brake responsiveness, horn, headlight, and tail/brake bulbs.',
  },
  {
    id: 'chk-air-spark',
    title: 'Air Filter, Spark Plug & Chain / CVT',
    interval: 'Every 3,000–5,000 km',
    note: 'Restores lost fuel efficiency and crisp throttle response.',
  },
  {
    id: 'chk-battery',
    title: 'Battery Voltage & Coolant Level',
    interval: 'Monthly / Every 5,000 km',
    note: 'Prevents starter failure and protects liquid-cooled engines.',
  },
];

export const FuelCareTipsCard: React.FC<Props> = ({
  vehicle,
  initialTab = 'save',
  onOpenGarage,
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'optimize' | 'checkup'>(initialTab);
  const [checkedMap, setCheckedMap] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(CHECKUP_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHECKUP_STORAGE_KEY, JSON.stringify(checkedMap));
    } catch {
      // Ignore storage write errors
    }
  }, [checkedMap]);

  const toggleCheck = (id: string) => {
    setCheckedMap(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = new Date().toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
        });
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setCheckedMap({});
  };

  const completedCount = CHECKUP_SCHEDULE.filter(item => Boolean(checkedMap[item.id])).length;

  return (
    <div className="rounded-3xl glass-panel p-4 sm:p-5 space-y-3.5 shadow-xs print:hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
              Fuel Saving, Vehicle Optimization & Check-Up Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {vehicle
                ? `Tailored care tips for ${vehicle.brand} ${vehicle.model} (${vehicle.fuel_efficiency_km_per_l} km/L)`
                : 'Practical eco-driving & preventive maintenance habits for Bohol roads'}
            </p>
          </div>
        </div>

        {onOpenGarage && (
          <button
            type="button"
            onClick={onOpenGarage}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
          >
            Manage Garage
          </button>
        )}
      </div>

      {/* 3-Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl glass-panel-subtle text-xs font-extrabold">
        <button
          type="button"
          onClick={() => setActiveTab('save')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'save'
              ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Fuel className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Save Gas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('optimize')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'optimize'
              ? 'glass-btn bg-blue-500/15 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Optimize</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checkup')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'checkup'
              ? 'glass-btn bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            Check-Up ({completedCount}/{CHECKUP_SCHEDULE.length})
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'save' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in duration-150">
          {SAVE_GASOLINE_TIPS.map((tip) => (
            <div
              key={tip.id}
              className="p-3 rounded-2xl glass-panel-subtle space-y-1 border border-white/30 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {tip.title}
                </h4>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {tip.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'optimize' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in duration-150">
          {OPTIMIZE_VEHICLE_TIPS.map((tip) => (
            <div
              key={tip.id}
              className="p-3 rounded-2xl glass-panel-subtle space-y-1 border border-white/30 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {tip.title}
                </h4>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  {tip.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'checkup' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
            <span>
              Tap each routine check-up item once inspected ({completedCount}/{CHECKUP_SCHEDULE.length} completed):
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={resetChecklist}
                className="inline-flex items-center space-x-1 font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {CHECKUP_SCHEDULE.map((item) => {
              const checkedDate = checkedMap[item.id];
              const isDone = Boolean(checkedDate);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isDone
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/35 border-emerald-500/35'
                      : 'glass-panel-subtle border-white/30 dark:border-white/10 hover:border-amber-400/50'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`text-xs font-extrabold ${
                          isDone
                            ? 'text-emerald-800 dark:text-emerald-200 line-through'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        {isDone ? `Checked ${checkedDate}` : item.interval}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {item.note}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
