import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  RotateCw,
  X,
  Wifi,
  Battery,
  ChevronLeft,
  Circle,
  Square,
  Sparkles,
  ExternalLink,
  Layers,
  Check,
  RefreshCw
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';

export type AndroidModel = 'galaxy' | 'pixel' | 'redmi';

interface DeviceSpec {
  id: AndroidModel;
  name: string;
  osName: string;
  width: number;
  height: number;
  notchType: 'punch-hole' | 'pill';
  cornerRadius: string;
}

const DEVICE_SPECS: Record<AndroidModel, DeviceSpec> = {
  galaxy: {
    id: 'galaxy',
    name: 'Samsung Galaxy S24',
    osName: 'One UI 6.1 (Android 14)',
    width: 393,
    height: 852,
    notchType: 'punch-hole',
    cornerRadius: 'rounded-[44px]',
  },
  pixel: {
    id: 'pixel',
    name: 'Google Pixel 8',
    osName: 'Stock Android 14',
    width: 412,
    height: 892,
    notchType: 'punch-hole',
    cornerRadius: 'rounded-[48px]',
  },
  redmi: {
    id: 'redmi',
    name: 'Xiaomi Redmi Note 13',
    osName: 'HyperOS (Android 14)',
    width: 390,
    height: 844,
    notchType: 'punch-hole',
    cornerRadius: 'rounded-[40px]',
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onHomeClick?: () => void;
  onBackClick?: () => void;
  onSwitchToIPhone?: () => void;
}

export const AndroidSimulator: React.FC<Props> = ({
  isOpen,
  onClose,
  children,
  onHomeClick,
  onBackClick,
  onSwitchToIPhone,
}) => {
  const [model, setModel] = useState<AndroidModel>('galaxy');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0.9);
  const [navMode, setNavMode] = useState<'buttons' | 'gesture'>('buttons');
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isRecentsOpen, setIsRecentsOpen] = useState<boolean>(false);
  const [batteryLevel] = useState<number>(88);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Esc to close simulator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return <>{children}</>;

  const spec = DEVICE_SPECS[model];
  const screenWidth = isLandscape ? spec.height : spec.width;
  const screenHeight = isLandscape ? spec.width : spec.height;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-start py-4 px-2 sm:px-4">
      {/* Top Floating Simulation Control Bar */}
      <header className="w-full max-w-5xl mb-3 py-2.5 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white text-xs z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 font-black text-slate-100">
              <span>Android Simulation</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {spec.name} • {spec.osName}
            </p>
          </div>
        </div>

        {/* Simulator Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Device Model Selector */}
          <div className="flex items-center space-x-1 p-1 bg-slate-800 rounded-xl border border-slate-700/60 text-[11px] font-bold">
            {(['galaxy', 'pixel', 'redmi'] as AndroidModel[]).map(m => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  model === m
                    ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'galaxy' ? 'Samsung S24' : m === 'pixel' ? 'Pixel 8' : 'Redmi 13'}
              </button>
            ))}
          </div>

          {/* Scale Selector */}
          <div className="flex items-center space-x-1 p-1 bg-slate-800 rounded-xl border border-slate-700/60 text-[11px] font-bold">
            {[0.75, 0.85, 0.95, 1.0].map(s => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-1.5 py-1 rounded-lg transition-all cursor-pointer ${
                  scale === s
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {Math.round(s * 100)}%
              </button>
            ))}
          </div>

          {/* Orientation Toggle */}
          <button
            onClick={() => setIsLandscape(!isLandscape)}
            title="Rotate Device Orientation"
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center space-x-1 text-[11px] font-bold ${
              isLandscape
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isLandscape ? 'Landscape' : 'Portrait'}</span>
          </button>

          {/* Navigation Bar Mode Toggle */}
          <button
            onClick={() => setNavMode(navMode === 'buttons' ? 'gesture' : 'buttons')}
            title="Toggle Android Navigation Mode (3-Button vs Gesture Pill)"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-[11px] font-bold cursor-pointer hidden md:flex items-center space-x-1"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{navMode === 'buttons' ? '3-Button Nav' : 'Gesture Nav'}</span>
          </button>

          {/* Quick Switch to iPhone */}
          {onSwitchToIPhone && (
            <button
              onClick={onSwitchToIPhone}
              title="Switch to Apple iPhone Simulator (iOS 18)"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold cursor-pointer flex items-center space-x-1.5 transition-colors"
            >
              <span className="text-sky-400 font-bold text-xs leading-none"></span>
              <span>iPhone Sim</span>
            </button>
          )}

          {/* Close Simulator / Fullscreen Web */}
          <button
            onClick={onClose}
            title="Exit Android Simulator (Esc)"
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold transition-all cursor-pointer flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Exit Sim</span>
          </button>
        </div>
      </header>

      {/* Hardware Device Chassis Container with Transform Scale */}
      <div
        className="flex items-center justify-center transition-transform duration-200 my-auto origin-top"
        style={{
          transform: `scale(${scale})`,
          marginBottom: scale < 0.9 ? '-10%' : '1rem',
        }}
      >
        {/* Physical Smartphone Outer Shell (Matte Titanium / Bezel) */}
        <div
          className={`relative bg-[#0c1017] p-3 shadow-2xl ring-1 ring-white/10 ${spec.cornerRadius} transition-all duration-300`}
          style={{
            boxShadow:
              '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 10px #181f2a, 0 0 0 12px #263143, 0 20px 40px rgba(0, 163, 224, 0.1)',
          }}
        >
          {/* Simulated Physical Side Buttons (Volume Rocker & Power Button) */}
          <div className="absolute -left-3.5 top-24 w-1 h-12 bg-slate-700 rounded-l-md" />
          <div className="absolute -left-3.5 top-40 w-1 h-12 bg-slate-700 rounded-l-md" />
          <div className="absolute -right-3.5 top-32 w-1 h-16 bg-slate-700 rounded-r-md" />

          {/* Smartphone Screen Glass */}
          <div
            className={`relative bg-slate-900 overflow-hidden flex flex-col ${spec.cornerRadius}`}
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
            }}
          >
            {/* Top Android Status Bar (Transparent overlay on content) */}
            <div className="relative z-30 h-8 px-5 bg-black/60 backdrop-blur-xs text-white flex items-center justify-between text-[11px] font-bold select-none shrink-0 border-b border-white/5">
              {/* Left: Live Clock */}
              <div className="flex items-center space-x-1">
                <span>{currentTime}</span>
                <span className="text-[9px] text-emerald-400 font-semibold ml-1">Globe 5G</span>
              </div>

              {/* Center: Camera Punch-Hole Cutout */}
              <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-center pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>

              {/* Right: Telephony & Battery */}
              <div className="flex items-center space-x-2">
                <Wifi className="w-3 h-3 text-white" />
                <span className="text-[10px] font-mono">{batteryLevel}%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Inner Viewport (Renders the full Byahe ni Bai Application) */}
            <div className="android-viewport flex-1 w-full overflow-hidden relative flex flex-col">
              {children}

              {/* Recents / App Switcher Overlay Modal inside Android */}
              {isRecentsOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex flex-col justify-center items-center">
                  <div className="w-full max-w-xs bg-slate-900 rounded-3xl p-5 border border-slate-800 text-center shadow-2xl">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-2 flex items-center justify-center mb-3">
                      <img src="/logo.png" alt="Byahe ni Bai" className="w-full h-full object-contain" />
                    </div>
                    <h4 className="text-sm font-extrabold text-white">Byahe ni Bai</h4>
                    <p className="text-xs text-slate-400 mt-1">Bohol Transport & Fuel System Active</p>
                    <div className="mt-4 flex flex-col space-x-0 space-y-2">
                      <button
                        onClick={() => setIsRecentsOpen(false)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold text-xs cursor-pointer"
                      >
                        Resume App
                      </button>
                      <button
                        onClick={() => {
                          setIsRecentsOpen(false);
                          if (onHomeClick) onHomeClick();
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Android System Navigation Bar */}
            <div className="relative z-30 h-10 px-8 bg-black/80 backdrop-blur-xs text-white flex items-center justify-around select-none shrink-0 border-t border-white/10">
              {navMode === 'buttons' ? (
                <>
                  {/* Android Back Button ◀ */}
                  <button
                    onClick={() => {
                      if (onBackClick) onBackClick();
                      else if (onHomeClick) onHomeClick();
                    }}
                    title="Android Back"
                    className="p-2 text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Android Home Button ● */}
                  <button
                    onClick={() => {
                      if (onHomeClick) onHomeClick();
                    }}
                    title="Android Home"
                    className="p-2 text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer"
                  >
                    <Circle className="w-4 h-4 fill-slate-400 hover:fill-white" />
                  </button>

                  {/* Android Recents / Overview Button ■ */}
                  <button
                    onClick={() => setIsRecentsOpen(!isRecentsOpen)}
                    title="Android Recents"
                    className="p-2 text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </>
              ) : (
                /* Android Gesture Navigation Pill */
                <button
                  onClick={() => {
                    if (onHomeClick) onHomeClick();
                  }}
                  title="Swipe up for Home"
                  className="w-28 h-1 bg-white/70 hover:bg-white rounded-full transition-all cursor-pointer active:scale-95"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
