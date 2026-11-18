import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useFuelPriceFeed } from '../../lib/fuelPriceSync';

interface Props {
  onOpenWhatsNew: () => void;
}

export const WhatsNewBanner: React.FC<Props> = ({ onOpenWhatsNew }) => {
  const { advisories: items } = useFuelPriceFeed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentItem = items[currentIndex] || items[0];

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={onOpenWhatsNew}
      className="advisory-banner hidden md:block shrink-0 w-full bg-sky-50/90 dark:bg-slate-950/95 border-b border-sky-200/80 dark:border-sky-950/60 text-slate-900 dark:text-white py-2 px-3.5 sm:px-6 cursor-pointer select-none transition-colors hover:bg-sky-100/90 dark:hover:bg-slate-900 group print:hidden"
      title="Click to view full advisory and What's New"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left Side: Badge + Headline */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 overflow-hidden">
          {currentItem.type === 'alert' ? (
            <span className="shrink-0 px-2 py-0.5 rounded-sm bg-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs shadow-red-500/40 animate-pulse">
              {currentItem.badgeText}
            </span>
          ) : (
            <span className="shrink-0 px-2 py-0.5 rounded-sm bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs shadow-emerald-500/40">
              {currentItem.badgeText}
            </span>
          )}

          <div className="flex items-center space-x-2 truncate">
            <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white truncate">
              {currentItem.summary}
            </span>
          </div>
        </div>

        {/* Right Side: Step indicators + Arrows + Chevron */}
        <div className="flex items-center space-x-2 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 text-xs">
          {/* Subtle dots indicator */}
          <div className="hidden sm:flex items-center space-x-1 mr-1">
            {items.map((item, idx) => (
              <span
                key={item.id}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-sky-500 dark:bg-sky-400 w-3' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-0.5">
            <button
              onClick={handlePrev}
              title="Previous alert"
              className="p-1 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 rounded transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              title="Next alert"
              className="p-1 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 rounded transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-white transition-all" />
        </div>
      </div>
    </div>
  );
};
