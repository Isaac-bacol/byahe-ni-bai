import React, { useEffect } from 'react';
import { X, ArrowRight, ExternalLink, RotateCcw } from 'lucide-react';
import { useFuelPriceFeed } from '../../lib/fuelPriceSync';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const WhatsNewModal: React.FC<Props> = ({ isOpen, onClose, onNavigateTab }) => {
  const { advisories, isSyncing, refreshFeed } = useFuelPriceFeed();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="glass-modal w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile top handle pill */}
        <div className="pt-3 pb-1">
          <div className="w-10 h-1 bg-white/30 dark:bg-white/20 rounded-full mx-auto" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              What's New
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-400/30 backdrop-blur-xs">
              Bohol Transport v2.5.0
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => refreshFeed()}
              disabled={isSyncing}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/15 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync weekly update from fuelprice.ph"
            >
              <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/15 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Advisory List */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {advisories.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                item.type === 'alert'
                  ? 'bg-rose-500/15 dark:bg-rose-950/30 border-rose-400/40 ring-1 ring-rose-500/20 backdrop-blur-xs'
                  : 'glass-panel-subtle'
              }`}
            >
              {/* Top metadata row */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {item.type === 'alert' ? (
                  <span className="px-2 py-0.5 rounded-sm bg-rose-500/20 text-rose-700 dark:text-rose-300 font-black text-xs border border-rose-500/30">
                    {item.badgeText}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-xs border border-emerald-500/30">
                    {item.badgeText}
                  </span>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {item.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug mb-2">
                {item.title}
              </h3>

              {/* Body text with formatted paragraphs */}
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 whitespace-pre-line font-normal">
                {item.content}
              </div>

              {/* Optional Call to Action & Source Link */}
              {(item.actionLabel || item.sourceUrl) && (
                <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                  {item.sourceUrl ? (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>{item.sourceLabel || 'fuelprice.ph'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span />
                  )}

                  {item.actionLabel && onNavigateTab && (
                    <button
                      onClick={() => {
                        if (item.actionTab) onNavigateTab(item.actionTab);
                        onClose();
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs shadow-emerald-900/20 transition-all active:scale-95 cursor-pointer bg-sign hover:bg-sign-dark"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 glass-panel-subtle border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="text-xs truncate">
            Live weekly reference via{' '}
            <a
              href="https://www.fuelprice.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              fuelprice.ph
            </a>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl glass-btn text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer text-xs shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
