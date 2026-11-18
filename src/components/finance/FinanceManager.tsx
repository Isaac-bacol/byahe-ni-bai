import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Check,
  PiggyBank,
  Car,
  Bike,
  ShieldCheck,
  PieChart,
  ArrowLeft
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { FuelCostCalculator } from './FuelCostCalculator';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface Props {
  onBack?: () => void;
}

export const FinanceManager: React.FC<Props> = ({ onBack }) => {
  const { userType } = useAuth();
  const { financialSummary, userAllowance, updateAllowance, userTrips, userFuelPurchases } = useData();

  const [isEditingAllowance, setIsEditingAllowance] = useState(false);
  const [newAllowanceAmount, setNewAllowanceAmount] = useState<number>(userAllowance?.amount || 3000);

  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSaveAllowance = () => {
    updateAllowance(Number(newAllowanceAmount));
    setIsEditingAllowance(false);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Flaticon name="wallet" className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Finance & Income System (Panalapi)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {userType === 'motorist' && 'Manage your transportation allowance, fuel spending, and remaining balance'}
              {userType === 'habal_habal' && 'Monitor passenger fare collections, operating expenses, and daily net earnings'}
              {userType === 'tricycle' && 'Track TODA daily fare collections, boundary to operator, and take-home income'}
              {userType === 'admin' && 'Island-wide transport economic monitoring & driver financial summary'}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. PERSONAL MOTORIST FINANCE SYSTEM                           */}
      {/* ------------------------------------------------------------- */}
      {userType === 'motorist' && (
        <div className="space-y-4">
          {/* Allowance Master Card */}
          <div className="rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-cyan-400/30 backdrop-blur-xl transition-colors relative overflow-hidden bg-white dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-400/30 shrink-0">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black tracking-tight text-slate-950 dark:text-white truncate">ALLOWANCE PROGRESS</h3>
                  <p className="text-[11px] text-slate-700 dark:text-sky-200 truncate font-bold">Remaining = Allowance − Expenses</p>
                </div>
              </div>

              {!isEditingAllowance ? (
                <button
                  onClick={() => {
                    setNewAllowanceAmount(userAllowance?.amount || 3000);
                    setIsEditingAllowance(true);
                  }}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-slate-900 dark:text-white hover:text-sky-700 dark:hover:text-sky-300 border border-slate-300 dark:border-white/20 shadow-xs cursor-pointer shrink-0 active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Adjust Budget</span>
                </button>
              ) : null}
            </div>

            {/* Editing Box */}
            {isEditingAllowance && (
              <div className="mb-4 p-3.5 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-300 dark:border-white/20 flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800 dark:text-sky-200">₱</span>
                <input
                  type="number"
                  min="0"
                  value={newAllowanceAmount}
                  onChange={e => setNewAllowanceAmount(Number(e.target.value))}
                  className="glass-input w-full px-3 py-1.5 text-sm font-bold text-slate-950 dark:text-white rounded-xl focus:outline-hidden"
                  placeholder="Enter allowance amount"
                />
                <button
                  onClick={handleSaveAllowance}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer flex items-center space-x-1 shrink-0 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditingAllowance(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-sky-200 dark:hover:text-white shrink-0 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Formula visualization Cards (Zero decimal places and responsive sizing to prevent overlap) */}
            <div className="grid grid-cols-3 gap-2 text-center my-4">
              <div className="p-2.5 sm:p-3 bg-sky-100/90 dark:bg-sky-950/60 rounded-2xl border border-sky-300 dark:border-sky-400/40 overflow-hidden shadow-2xs">
                <span className="text-[10px] text-sky-950 dark:text-sky-300 font-black uppercase block truncate">Allowance</span>
                <span className="text-sm sm:text-lg font-black text-slate-950 dark:text-white truncate block mt-0.5">{formatPHP(financialSummary.allowanceBudget)}</span>
              </div>

              <div className="p-2.5 sm:p-3 bg-rose-100/90 dark:bg-rose-950/60 rounded-2xl border border-rose-300 dark:border-rose-400/40 overflow-hidden shadow-2xs">
                <span className="text-[10px] text-rose-950 dark:text-rose-300 font-black uppercase block truncate">- Expenses</span>
                <span className="text-sm sm:text-lg font-black text-rose-700 dark:text-rose-400 truncate block mt-0.5">{formatPHP(financialSummary.allowanceUsed)}</span>
              </div>

              <div className="p-2.5 sm:p-3 bg-emerald-100/90 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 dark:border-emerald-400/50 overflow-hidden shadow-2xs">
                <span className="text-[10px] text-emerald-950 dark:text-emerald-300 font-black uppercase block truncate">= Remaining</span>
                <span className="text-sm sm:text-lg font-black text-emerald-800 dark:text-emerald-400 truncate block mt-0.5">{formatPHP(financialSummary.allowanceRemaining)}</span>
              </div>
            </div>

            {/* Visual Budget Meter */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-800 dark:text-slate-200 font-bold mb-1.5">
                <span>Budget Consumed</span>
                <span className="font-black text-slate-950 dark:text-white">
                  {Math.round((financialSummary.allowanceUsed / (financialSummary.allowanceBudget || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-300/60 dark:border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (financialSummary.allowanceUsed / (financialSummary.allowanceBudget || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="glass-panel rounded-3xl p-5 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <h4 className="text-xs font-black text-slate-950 dark:text-slate-100 uppercase tracking-wider">
              Monthly Transportation Spending Breakdown
            </h4>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              <div className="py-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Gasoline Purchases Logged
                </span>
                <span className="font-extrabold text-slate-950 dark:text-slate-100">
                  {formatPHP(userFuelPurchases.reduce((acc, f) => acc + f.total_cost, 0))}
                </span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Trip Fuel Cost Allocations
                </span>
                <span className="font-extrabold text-slate-950 dark:text-slate-100">
                  {formatPHP(userTrips.reduce((acc, t) => acc + (t.fuel_cost || 0), 0))}
                </span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-xs font-extrabold">
                <span className="text-slate-950 dark:text-slate-100">Total Month Transportation Drain</span>
                <span className="text-rose-700 dark:text-rose-400 font-black">{formatPHP(financialSummary.allowanceUsed)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. HABAL-HABAL FINANCE SYSTEM                                 */}
      {/* ------------------------------------------------------------- */}
      {userType === 'habal_habal' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-6 shadow-xl border border-emerald-200 dark:border-emerald-400/25 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/30 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">HABAL-HABAL EARNINGS ENGINE</h3>
                <p className="text-xs text-slate-600 dark:text-emerald-200 font-semibold">Formula: Net Earnings = Fares − Expenses</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center my-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-400/30">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold uppercase block">Fares (Plete)</span>
                <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white">{formatPHP(financialSummary.totalFares)}</span>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-400/30">
                <span className="text-[10px] text-rose-800 dark:text-rose-300 font-extrabold uppercase block">- Expenses</span>
                <span className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400">
                  {formatPHP(financialSummary.fuelExpenses + financialSummary.otherExpenses)}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-400/40">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold uppercase block">= Net Take-Home</span>
                <span className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-400">{formatPHP(financialSummary.netEarnings)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. TRICYCLE FINANCE SYSTEM                                    */}
      {/* ------------------------------------------------------------- */}
      {userType === 'tricycle' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-6 shadow-xl border border-amber-200 dark:border-amber-400/25 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">TRICYCLE TODA FINANCIALS</h3>
                <p className="text-xs text-slate-600 dark:text-amber-200 font-semibold">
                  Formula: Net Earnings = Fare − (Fuel + Boundary + Other Expenses)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center my-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-400/30">
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-extrabold uppercase block">Fares</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{formatPHP(financialSummary.tricycleFares)}</span>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-400/30">
                <span className="text-[10px] text-rose-800 dark:text-rose-300 font-extrabold uppercase block">Fuel</span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">{formatPHP(financialSummary.tricycleFuel)}</span>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-400/30">
                <span className="text-[10px] text-rose-800 dark:text-rose-300 font-extrabold uppercase block">Boundary</span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">{formatPHP(financialSummary.boundaryExpenses)}</span>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-400/40">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold uppercase block">= Take-Home</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{formatPHP(financialSummary.tricycleNetEarnings)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Cost Calculator (For all motorists & commercial drivers) */}
      <FuelCostCalculator />
    </div>
  );
};
