import React, { useMemo } from 'react';
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Zap,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  Clock,
  Fuel
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { useFuelPriceFeed } from '../../lib/fuelPriceSync';

interface Props {
  onOpenWhatsNew?: () => void;
  onBack?: () => void;
}

export const PriceComparisonView: React.FC<Props> = ({ onOpenWhatsNew, onBack }) => {
  const { feed, advisories, isSyncing, refreshFeed } = useFuelPriceFeed();
  const weeklyAdvisory = advisories[0];

  const handleRefresh = () => {
    refreshFeed();
  };

  // Compute lowest price per primary fuel grade across brands
  const lowestRates = useMemo(() => {
    const minOf = (getter: (b: (typeof feed.brands)[number]) => number | null) => {
      const vals = feed.brands.map(getter).filter((v): v is number => v !== null);
      return vals.length > 0 ? Math.min(...vals) : null;
    };
    return {
      ron91: minOf(b => b.ron91),
      ron95: minOf(b => b.ron95),
      diesel: minOf(b => b.diesel),
      kerosene: minOf(b => b.kerosene),
    };
  }, [feed.brands]);

  const fuelCards = [
    {
      label: 'Gasoline (RON 91)',
      price: feed.gasoline.price,
      change: feed.gasoline.change,
      changeText: feed.gasoline.changeText,
      direction: feed.gasoline.direction,
      rangeText: feed.gasoline.rangeText || 'Philippine Pump Avg',
      url: 'https://www.fuelprice.ph/gasoline-price-philippines',
    },
    {
      label: 'Diesel',
      price: feed.diesel.price,
      change: feed.diesel.change,
      changeText: feed.diesel.changeText,
      direction: feed.diesel.direction,
      rangeText: feed.diesel.rangeText || 'Philippine Pump Avg',
      url: 'https://www.fuelprice.ph/diesel-price-philippines',
    },
    {
      label: 'Premium 95',
      price: feed.premium95.price,
      change: feed.premium95.change,
      changeText: feed.premium95.changeText,
      direction: feed.premium95.direction,
      rangeText: 'RON 95 National Avg',
      url: 'https://www.fuelprice.ph/gasoline-price-philippines',
    },
    {
      label: 'Kerosene',
      price: feed.kerosene.price,
      change: feed.kerosene.change,
      changeText: feed.kerosene.changeText,
      direction: feed.kerosene.direction,
      rangeText: feed.kerosene.rangeText || 'Philippine Pump Avg',
      url: 'https://www.fuelprice.ph/kerosene-price-philippines',
    },
  ];

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {onBack && (
        <div className="mb-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. WEEKLY FUELPRICE.PH ADVISORY CALLOUT                       */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel-subtle border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-500 text-white shrink-0 mt-0.5 shadow-sm shadow-red-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                {weeklyAdvisory?.badgeText || 'WEEKLY UPDATE'}
              </span>
              <span className="text-xs font-bold text-red-900 dark:text-red-300">
                fuelprice.ph • {feed.effectiveDateDisplay} ({feed.nextWeek.badge})
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
              {weeklyAdvisory?.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              {feed.nextWeek.headline}: {feed.nextWeek.details}
            </p>
          </div>
        </div>

        {onOpenWhatsNew && (
          <button
            onClick={onOpenWhatsNew}
            className="self-start sm:self-center shrink-0 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <span>View Full Advisory</span>
            <Zap className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. LIVE FUELPRICE.PH WEEKLY MONITOR & BRAND MATRIX            */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Flaticon name="fuel" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  FuelPrice PH Live Weekly Board
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 font-extrabold text-[10px] border border-cyan-200 dark:border-cyan-800">
                  www.fuelprice.ph
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-800 inline-flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{feed.isLiveSynced ? 'Live Synced' : 'Weekly Baseline'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Auto-synced weekly rates from fuelprice.ph • Effective {feed.effectiveDateDisplay} (Tuesday 6:00 AM)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              title="Refresh live rates from fuelprice.ph"
              className="px-3 py-2 rounded-xl glass-btn text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Rates'}</span>
            </button>

            <a
              href="https://www.fuelprice.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Open fuelprice.ph</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 4 Live Fuel Price Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {fuelCards.map((card) => {
            const isDown = card.direction === 'down';
            const isUp = card.direction === 'up';
            return (
              <a
                key={card.label}
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel-subtle glass-panel-interactive rounded-2xl p-3.5 flex flex-col justify-between space-y-2 border border-white/25 dark:border-white/10"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                    {card.label}
                  </span>
                  {isDown ? (
                    <TrendingDown className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isUp ? (
                    <TrendingUp className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <Fuel className="w-4 h-4 text-sky-500 shrink-0" />
                  )}
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    ₱{card.price.toFixed(2)}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/L</span>
                  </div>
                  <div
                    className={`text-[11px] font-bold mt-0.5 ${
                      isDown
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isUp
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {card.changeText}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-200/40 dark:border-slate-800/60 truncate">
                  {card.rangeText}
                </div>
              </a>
            );
          })}
        </div>

        {/* Next Week Forecast Strip */}
        <div className="p-3.5 sm:p-4 rounded-2xl glass-panel-subtle border border-sky-400/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-400/30">
                  {feed.nextWeek.badge}
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {feed.nextWeek.headline}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                {feed.nextWeek.details}
              </p>
            </div>
          </div>

          <a
            href="https://www.fuelprice.ph/fuel-price-next-week"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl glass-btn text-xs font-bold text-sky-700 dark:text-sky-300 self-start sm:self-center"
          >
            <span>Next Week Forecast</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. LIVE BRAND COMPARISON MATRIX (PETRON, SHELL, CALTEX, ETC.) */}
      {/* ------------------------------------------------------------- */}
      <div className="glass-panel rounded-3xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 glass-panel-subtle border-b border-white/20 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-black text-slate-900 dark:text-white text-sm">
              Average Pump Prices by Brand (₱/Liter)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
              Green = Lowest Rate
            </span>
            <a
              href="https://www.fuelprice.ph/trip-fuel-cost-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>fuelprice.ph Full Grid</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/70 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/40">
                <th className="py-3 px-4 font-extrabold">Brand</th>
                <th className="py-3 px-3 font-extrabold text-right">RON 91</th>
                <th className="py-3 px-3 font-extrabold text-right">RON 95</th>
                <th className="py-3 px-3 font-extrabold text-right">RON 97</th>
                <th className="py-3 px-3 font-extrabold text-right">RON 100</th>
                <th className="py-3 px-3 font-extrabold text-right">Diesel</th>
                <th className="py-3 px-3 font-extrabold text-right">Diesel Plus</th>
                <th className="py-3 px-4 font-extrabold text-right">Kerosene</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/50">
              {feed.brands.map((row) => {
                const renderCell = (val: number | null, lowest: number | null) => {
                  if (val === null) {
                    return <span className="text-[11px] italic text-slate-400 dark:text-slate-600">—</span>;
                  }
                  const isLowest = lowest !== null && Math.abs(val - lowest) < 0.005;
                  return (
                    <span
                      className={
                        isLowest
                          ? 'inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-500/30'
                          : 'font-semibold text-slate-700 dark:text-slate-200'
                      }
                    >
                      ₱{val.toFixed(2)}
                    </span>
                  );
                };

                return (
                  <tr
                    key={row.brand}
                    className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {row.brand}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">{renderCell(row.ron91, lowestRates.ron91)}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">{renderCell(row.ron95, lowestRates.ron95)}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">{renderCell(row.ron97, null)}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">{renderCell(row.ron100, null)}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">{renderCell(row.diesel, lowestRates.diesel)}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">{renderCell(row.dieselPlus, null)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">{renderCell(row.kerosene, lowestRates.kerosene)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer & Direct Category Links */}
        <div className="p-3.5 sm:px-5 glass-panel-subtle border-t border-white/20 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Live weekly pump averages synced from www.fuelprice.ph.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <a href="https://www.fuelprice.ph/gasoline-price-philippines" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">Gasoline</a>
            <span>•</span>
            <a href="https://www.fuelprice.ph/diesel-price-philippines" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">Diesel</a>
            <span>•</span>
            <a href="https://www.fuelprice.ph/kerosene-price-philippines" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">Kerosene</a>
            <span>•</span>
            <a href="https://www.fuelprice.ph/lpg-price-philippines" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">LPG</a>
          </div>
        </div>
      </div>
    </div>
  );
};
