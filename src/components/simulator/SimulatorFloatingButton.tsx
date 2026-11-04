import React from 'react';
import { Smartphone } from 'lucide-react';

interface Props {
  isSimulating: boolean;
  onSelectPlatform: (platform: 'ios' | 'android') => void;
}

export const SimulatorFloatingButton: React.FC<Props> = ({ isSimulating, onSelectPlatform }) => {
  if (isSimulating) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:flex items-center p-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl ring-1 ring-white/10">
      {/* 1. iPhone Simulator Button */}
      <button
        onClick={() => onSelectPlatform('ios')}
        title="Simulate on Apple iPhone (iPhone 16 Pro, 15, 14, SE with iOS 18)"
        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-950/40 transition-all active:scale-95 cursor-pointer"
      >
        <span className="text-sm font-bold leading-none select-none"></span>
        <span>iPhone Sim</span>
      </button>

      {/* 2. Android Simulator Button */}
      <button
        onClick={() => onSelectPlatform('android')}
        title="Simulate on Android (Samsung Galaxy S24, Google Pixel 8, Redmi)"
        className="flex items-center space-x-1.5 px-3 py-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer ml-1"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span>Android</span>
      </button>
    </div>
  );
};
