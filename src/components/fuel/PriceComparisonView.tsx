import React, { useState } from 'react';
import {
  ExternalLink,
  TrendingUp,
  Zap,
  Info,
  RotateCcw,
  Sparkles,
  MapPin,
  ShieldCheck,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';

interface Props {
  onOpenWhatsNew?: () => void;
  onBack?: () => void;
}

export const PriceComparisonView: React.FC<Props> = ({ onOpenWhatsNew, onBack }) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const boholKeywords = [
    'Tagbilaran City',
    'Tubigon',
    'Panglao',
    'Dauis',
    'Ubay',
    'Carmen',
    'Jagna',
    'Talibon'
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
      {/* 1. UPCOMING TUESDAY PRICE HIKE CALLOUT                         */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel-subtle border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-500 text-white shrink-0 mt-0.5 shadow-sm shadow-red-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                ALERT
              </span>
              <span className="text-xs font-bold text-red-900 dark:text-red-300">
                Upcoming Tuesday Fuel Price Hike Advisory
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
              Bohol Fuel Prices Expected to Rise Next Tuesday (~+₱1.80/L Gas, ~+₱2.20/L Diesel)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              Motorists and drivers in Bohol are advised to top up before Tuesday 6:00 AM to save on weekly operational costs. Check live pump stations below.
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
      {/* 2. BOHOL FUELWATCH LIVE MONITOR HEADER & CONTROLS             */}
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
                  Bohol FuelWatch Live Monitor
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 font-extrabold text-[10px] border border-cyan-200 dark:border-cyan-800">
                  fuelwatchph.com
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-800">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time crowdsourced gas station pump prices across the Philippines and Bohol
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleRefresh}
              title="Reload live stream"
              className="p-2 rounded-xl glass-btn text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <a
              href="https://fuelwatchph.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Launch fuelwatchph.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bohol Quick Search Hints */}
        <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/20 dark:border-white/10 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>Search Bohol Locations on the Live Map:</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Type any Bohol municipality into the search bar inside FuelWatch PH to view live verified pump rates:
          </p>
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {boholKeywords.map(muni => (
              <span
                key={muni}
                className="px-2.5 py-1 rounded-lg glass-panel-subtle border border-white/20 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs"
              >
                {muni}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. LIVE FUELWATCH PH EMBEDDED WEB PORTAL                      */}
      {/* ------------------------------------------------------------- */}
      <div className="glass-panel rounded-3xl shadow-sm overflow-hidden">
        {/* Stream Top Toolbar */}
        <div className="px-4 py-3 glass-panel-subtle border-b border-white/20 dark:border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              FuelWatch PH Live Interactive Feed
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-xs">
            <span className="hidden sm:inline text-[11px]">
              Target: fuelwatchph.com
            </span>
            <a
              href="https://fuelwatchph.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Open in Full Screen Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative w-full h-[680px] sm:h-[750px] bg-slate-950/40">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center glass-modal z-10 space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Loading live pump prices from FuelWatch PH...
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src="https://fuelwatchph.com"
            title="FuelWatch PH Live Bohol Monitor"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0"
            allow="geolocation"
            loading="lazy"
          />
        </div>

        {/* Stream Footer Information */}
        <div className="p-3.5 glass-panel-subtle border-t border-white/20 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Community-verified pricing feed for drivers across Bohol & Philippines.</span>
          </div>
          <div className="text-[11px]">
            If the embedded frame is restricted by your browser, <a href="https://fuelwatchph.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 font-bold underline">click here to open directly</a>.
          </div>
        </div>
      </div>
    </div>
  );
};
