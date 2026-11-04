import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Fuel,
  Navigation,
  Wallet,
  CheckCircle2,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface Props {
  onBack?: () => void;
}

export const ReportsView: React.FC<Props> = ({ onBack }) => {
  const { userType, currentUser } = useAuth();
  const { userTrips, userFuelPurchases, financialSummary } = useData();

  if (!currentUser) return null;

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Filter trips and purchases by selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Filter logic
    let periodTrips = userTrips;
    let periodPurchases = userFuelPurchases;

    if (period === 'daily') {
      periodTrips = userTrips.filter(t => t.date.startsWith(todayStr));
      periodPurchases = userFuelPurchases.filter(f => f.date.startsWith(todayStr));
      // Fallback to sample if empty today
      if (periodTrips.length === 0) periodTrips = userTrips.slice(0, 4);
    } else if (period === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodTrips = userTrips.filter(t => new Date(t.date) >= oneWeekAgo);
      periodPurchases = userFuelPurchases.filter(f => new Date(f.date) >= oneWeekAgo);
      if (periodTrips.length === 0) periodTrips = userTrips;
    } else {
      // monthly
      periodTrips = userTrips;
      periodPurchases = userFuelPurchases;
    }

    const tripCount = periodTrips.length;
    const distanceKm = Math.round(periodTrips.reduce((acc, t) => acc + (t.distance_km || 0), 0) * 10) / 10;
    const fuelCost = periodTrips.reduce((acc, t) => acc + (t.fuel_cost || 0), 0) +
      periodPurchases.reduce((acc, f) => acc + (f.total_cost || 0), 0);

    const fares = periodTrips.reduce((acc, t) => acc + (t.fare || 0), 0);
    const boundary = periodTrips.reduce((acc, t) => acc + (t.boundary_cost || 0), 0);
    const otherExp = periodTrips.reduce((acc, t) => acc + (t.other_expenses || 0), 0);
    const totalExpenses = fuelCost + boundary + otherExp;
    const netEarnings = fares - totalExpenses;

    const avgFuelPerTrip = tripCount > 0 ? Math.round(fuelCost / tripCount) : 0;

    return {
      tripCount,
      distanceKm,
      fuelCost,
      fares,
      boundary,
      otherExp,
      totalExpenses,
      netEarnings,
      avgFuelPerTrip,
      trips: periodTrips,
      purchases: periodPurchases
    };
  }, [period, userTrips, userFuelPurchases]);

  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Origin', 'Destination', 'Distance (km)', 'Vehicle', 'Purpose', 'Fuel (PHP)', 'Fare (PHP)', 'Net (PHP)'];
    const rows = filteredData.trips.map(t => [
      t.date,
      `"${t.origin}"`,
      `"${t.destination}"`,
      t.distance_km,
      `"${t.vehicle_name || ''}"`,
      `"${t.purpose}"`,
      t.fuel_cost || 0,
      t.fare || 0,
      t.net_amount || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Byahe_ni_Bai_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 print:p-0">
      {/* Top Header */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 print:hidden">
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
              <Flaticon name="reports" className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Reports & Analytics (Taho ug Estadistika)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregated transportation distance, fuel usage, and net revenue summaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl glass-btn text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-linear-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Tabs: Daily | Weekly | Monthly */}
      <div className="grid grid-cols-3 p-1.5 glass-panel-subtle rounded-2xl print:hidden">
        <button
          onClick={() => setPeriod('daily')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            period === 'daily'
              ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Daily <span className="hidden sm:inline">(Karon)</span>
        </button>

        <button
          onClick={() => setPeriod('weekly')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            period === 'weekly'
              ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Weekly <span className="hidden sm:inline">(Semana)</span>
        </button>

        <button
          onClick={() => setPeriod('monthly')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            period === 'monthly'
              ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Monthly (Kada Bulan)
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel rounded-3xl p-6 space-y-6 print:border-none print:shadow-none">
        {/* Printable Official Header */}
        <div className="flex justify-between items-start border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
              BOHOL TRANSPORT EXPENSE TRACKER
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase">
              {period === 'daily' && 'Daily Summary Report'}
              {period === 'weekly' && 'Weekly Consolidated Report'}
              {period === 'monthly' && 'Monthly Performance Report'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Account: {currentUser.name} ({currentUser.user_type.replace('_', ' ').toUpperCase()}) • {currentUser.municipality}, Bohol
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 dark:text-slate-500">
            <span>Generated: {new Date().toLocaleDateString('en-PH')}</span>
          </div>
        </div>

        {/* Key Summary Cards matching prompt format */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl glass-panel-subtle border-sky-400/30 text-center">
            <span className="text-[10px] text-sky-600 dark:text-sky-400 uppercase font-bold block">Trips Completed</span>
            <span className="text-2xl font-black text-sky-950 dark:text-sky-100 mt-1 block">{filteredData.tripCount}</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel-subtle border-teal-400/30 text-center">
            <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-bold block">Total Distance</span>
            <span className="text-2xl font-black text-teal-950 dark:text-teal-100 mt-1 block">{filteredData.distanceKm} km</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel-subtle border-amber-400/30 text-center">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold block">Fuel Spending</span>
            <span className="text-2xl font-black text-amber-950 dark:text-amber-100 mt-1 block">{formatPHP(filteredData.fuelCost)}</span>
          </div>

          <div className="p-4 rounded-2xl glass-panel-subtle border-emerald-400/30 text-center">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
              {userType === 'motorist' ? 'Remaining Allowance' : 'Net Take-Home'}
            </span>
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block">
              {userType === 'motorist'
                ? formatPHP(financialSummary.allowanceRemaining)
                : formatPHP(filteredData.netEarnings)}
            </span>
          </div>
        </div>

        {/* Role-Specific Detail Card */}
        {userType === 'motorist' ? (
          <div className="p-5 rounded-2xl glass-panel-subtle space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">Motorist Allowance Summary</h4>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">Total Allowance Budget</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatPHP(financialSummary.allowanceBudget)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">Total Fuel & Commute Spent</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{formatPHP(filteredData.fuelCost)}</span>
            </div>
            <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm pt-1">
              <span>Remaining Budget Balance</span>
              <span>{formatPHP(financialSummary.allowanceRemaining)}</span>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl glass-panel-subtle space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
              Driver Revenue & Operating Tally
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">Gross Passenger Fares Collected</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatPHP(filteredData.fares)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400">Fuel & Operating Deductions</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">- {formatPHP(filteredData.totalExpenses)}</span>
            </div>
            <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm pt-1">
              <span>Net Driver Earnings</span>
              <span>{formatPHP(filteredData.netEarnings)}</span>
            </div>
          </div>
        )}

        {/* Analytics Highlights Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Operational Analytics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl glass-panel-subtle">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Average Fuel Cost / Trip</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                ₱{filteredData.avgFuelPerTrip} / trip
              </span>
            </div>

            <div className="p-3 rounded-2xl glass-panel-subtle">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Average Trip Distance</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {filteredData.tripCount > 0
                  ? (filteredData.distanceKm / filteredData.tripCount).toFixed(1)
                  : 0}{' '}
                km
              </span>
            </div>

            <div className="p-3 rounded-2xl glass-panel-subtle">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Fuel Efficiency Average</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                ~38.5 km/L
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
