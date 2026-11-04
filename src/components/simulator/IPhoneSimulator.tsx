import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  X,
  Wifi,
  Battery,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronLeft,
  Smartphone,
  Navigation,
  Fuel
} from 'lucide-react';

export type IPhoneModel = 'iphone16pro' | 'iphone16promax' | 'iphone15' | 'iphone14' | 'iphonese';

interface DeviceSpec {
  id: IPhoneModel;
  name: string;
  osName: string;
  width: number;
  height: number;
  notchType: 'dynamic-island' | 'notch' | 'classic';
  cornerRadius: string;
  hasHomeButton?: boolean;
}

const IPHONE_SPECS: Record<IPhoneModel, DeviceSpec> = {
  iphone16pro: {
    id: 'iphone16pro',
    name: 'iPhone 16 Pro',
    osName: 'iOS 18.2',
    width: 393,
    height: 852,
    notchType: 'dynamic-island',
    cornerRadius: 'rounded-[52px]',
  },
  iphone16promax: {
    id: 'iphone16promax',
    name: 'iPhone 16 Pro Max',
    osName: 'iOS 18.2',
    width: 440,
    height: 956,
    notchType: 'dynamic-island',
    cornerRadius: 'rounded-[56px]',
  },
  iphone15: {
    id: 'iphone15',
    name: 'iPhone 15',
    osName: 'iOS 18.2',
    width: 393,
    height: 852,
    notchType: 'dynamic-island',
    cornerRadius: 'rounded-[48px]',
  },
  iphone14: {
    id: 'iphone14',
    name: 'iPhone 14',
    osName: 'iOS 17.6',
    width: 390,
    height: 844,
    notchType: 'notch',
    cornerRadius: 'rounded-[44px]',
  },
  iphonese: {
    id: 'iphonese',
    name: 'iPhone SE (3rd Gen)',
    osName: 'iOS 17.6',
    width: 375,
    height: 667,
    notchType: 'classic',
    cornerRadius: 'rounded-[28px]',
    hasHomeButton: true,
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onHomeClick?: () => void;
  onBackClick?: () => void;
  onSwitchToAndroid?: () => void;
}

export const IPhoneSimulator: React.FC<Props> = ({
  isOpen,
  onClose,
  children,
  onHomeClick,
  onBackClick,
  onSwitchToAndroid,
}) => {
  const [model, setModel] = useState<IPhoneModel>('iphone16pro');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0.9);
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const [batteryLevel] = useState<number>(94);
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState<boolean>(false);

  // Live clock formatted for iOS (e.g. 9:41 without leading zero)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // 12-hour format like iOS
      if (hours === 0) hours = 12;
      else if (hours > 12) hours = hours - 12;
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

  const spec = IPHONE_SPECS[model];
  const screenWidth = isLandscape ? spec.height : spec.width;
  const screenHeight = isLandscape ? spec.width : spec.height;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-start py-4 px-2 sm:px-4">
      {/* Top Floating Simulation Control Bar */}
      <header className="w-full max-w-5xl mb-3 py-2.5 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white text-xs z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <span className="text-base leading-none font-sans font-bold select-none"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 font-black text-slate-100">
              <span>iPhone iOS Simulation</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1.5 py-0.2 rounded-md">
                iOS 18
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
            {(['iphone16pro', 'iphone16promax', 'iphone15', 'iphone14', 'iphonese'] as IPhoneModel[]).map(m => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  model === m
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'iphone16pro'
                  ? '16 Pro'
                  : m === 'iphone16promax'
                  ? '16 Pro Max'
                  : m === 'iphone15'
                  ? '15'
                  : m === 'iphone14'
                  ? '14 (Notch)'
                  : 'SE (Button)'}
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
                    ? 'bg-sky-600 text-white shadow-xs'
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
                ? 'bg-sky-600/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isLandscape ? 'Landscape' : 'Portrait'}</span>
          </button>

          {/* Quick Switch to Android */}
          {onSwitchToAndroid && (
            <button
              onClick={onSwitchToAndroid}
              title="Switch to Android Simulator (Samsung / Pixel / Redmi)"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold cursor-pointer flex items-center space-x-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android Sim</span>
            </button>
          )}

          {/* Close Simulator */}
          <button
            onClick={onClose}
            title="Exit iPhone Simulator (Esc)"
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
        {/* Physical iPhone Outer Shell (Titanium edge + glass bezel) */}
        <div
          className={`relative bg-[#12161f] p-3 shadow-2xl ring-1 ring-white/10 ${spec.cornerRadius} transition-all duration-300`}
          style={{
            boxShadow:
              '0 25px 70px -15px rgba(0, 0, 0, 0.95), 0 0 0 10px #1e2430, 0 0 0 12px #333d4e, 0 20px 45px rgba(56, 189, 248, 0.15)',
          }}
        >
          {/* Simulated Physical iOS Side Hardware Buttons */}
          {/* Action Button (Top Left) */}
          <div className="absolute -left-3.5 top-20 w-1 h-7 bg-slate-600 rounded-l-md" title="Action Button" />
          {/* Volume Up */}
          <div className="absolute -left-3.5 top-32 w-1 h-12 bg-slate-700 rounded-l-md" title="Volume Up" />
          {/* Volume Down */}
          <div className="absolute -left-3.5 top-48 w-1 h-12 bg-slate-700 rounded-l-md" title="Volume Down" />
          {/* Side Power / Siri Button (Right) */}
          <div className="absolute -right-3.5 top-32 w-1 h-16 bg-slate-700 rounded-r-md" title="Side Button" />
          {/* Camera Control (iPhone 16 Pro series) */}
          {model.startsWith('iphone16') && (
            <div className="absolute -right-3.5 top-56 w-1 h-10 bg-slate-600 rounded-r-md" title="Camera Control" />
          )}

          {/* iPhone Glass Screen */}
          <div
            className={`relative bg-slate-900 overflow-hidden flex flex-col ${spec.cornerRadius}`}
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
            }}
          >
            {/* Top iOS Status Bar */}
            <div className="relative z-30 h-11 px-6 bg-black/60 backdrop-blur-xs text-white flex items-center justify-between text-[13px] font-bold select-none shrink-0 border-b border-white/5">
              {/* Left: iOS Time */}
              <div className="flex items-center space-x-1 pl-1">
                <span className="font-black tracking-tight">{currentTime}</span>
                <Navigation className="w-2.5 h-2.5 fill-white rotate-45 ml-0.5" />
              </div>

              {/* Center: Dynamic Island or Classic Notch */}
              {spec.notchType === 'dynamic-island' && (
                <div
                  onClick={() => setIsDynamicIslandExpanded(!isDynamicIslandExpanded)}
                  title="Click to interact with Dynamic Island"
                  className={`bg-black rounded-full transition-all duration-300 cursor-pointer flex items-center justify-between px-2.5 shadow-md shadow-black/80 ring-1 ring-white/10 ${
                    isDynamicIslandExpanded
                      ? 'w-[260px] h-[58px] py-1.5 px-3.5'
                      : 'w-[115px] h-[30px]'
                  }`}
                >
                  {!isDynamicIslandExpanded ? (
                    <>
                      {/* Left: Tiny Island Logo indicator */}
                      <div className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 flex items-center justify-center text-[7px] font-black text-black">
                          ✓
                        </span>
                      </div>
                      {/* Right: Camera Lens & TrueDepth sensor */}
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#080d1a] ring-1 ring-slate-800 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-blue-900" />
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#0d131f]" />
                      </div>
                    </>
                  ) : (
                    /* Expanded Live Activity: Byahe ni Bai Live Fuel Monitor */
                    <div className="flex items-center justify-between w-full text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center">
                          <Fuel className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-slate-200">FuelWatch Bohol</div>
                          <div className="text-[9px] text-emerald-400 font-semibold">Gas: ₱61.90/L Live</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    </div>
                  )}
                </div>
              )}

              {spec.notchType === 'notch' && (
                <div className="w-[150px] h-[26px] bg-black rounded-b-2xl mx-auto flex items-center justify-center space-x-2 px-3">
                  <div className="w-10 h-1 bg-slate-800 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
                </div>
              )}

              {spec.notchType === 'classic' && (
                <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto" />
              )}

              {/* Right: Signal, 5G, Battery */}
              <div className="flex items-center space-x-1.5 pr-1 text-slate-200">
                {/* 4-Bar Cellular Signal */}
                <div className="flex items-end space-x-0.5 h-3" title="Cellular Signal">
                  <div className="w-0.5 h-1.5 bg-white rounded-xs" />
                  <div className="w-0.5 h-2 bg-white rounded-xs" />
                  <div className="w-0.5 h-2.5 bg-white rounded-xs" />
                  <div className="w-0.5 h-3 bg-white rounded-xs" />
                </div>
                <span className="text-[10px] font-bold tracking-tighter">5G</span>
                <Wifi className="w-3.5 h-3.5 text-white" />
                {/* iOS Pill Battery */}
                <div className="relative flex items-center">
                  <div className="w-5 h-2.5 border border-white/80 rounded-[4px] p-0.5 flex items-center">
                    <div
                      className="h-full bg-white rounded-[2px]"
                      style={{ width: `${batteryLevel}%` }}
                    />
                  </div>
                  <div className="w-0.5 h-1 bg-white/80 rounded-r-xs -ml-px" />
                </div>
              </div>
            </div>

            {/* Inner Viewport (Renders the full Byahe ni Bai Application) */}
            <div className="ios-viewport android-viewport flex-1 w-full overflow-hidden relative flex flex-col">
              {children}
            </div>

            {/* Bottom iOS Navigation Area */}
            {spec.hasHomeButton ? (
              /* Classic iPhone SE Touch ID Circular Button */
              <div className="relative z-30 h-14 bg-black flex items-center justify-center shrink-0 border-t border-white/5">
                <button
                  onClick={() => {
                    if (onHomeClick) onHomeClick();
                  }}
                  title="Touch ID Home Button"
                  className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-full border border-slate-800" />
                </button>
              </div>
            ) : (
              /* Modern iPhone Gesture Home Indicator Bar */
              <div className="relative z-30 h-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-center shrink-0 safe-area-bottom">
                <button
                  onClick={() => {
                    if (onHomeClick) onHomeClick();
                  }}
                  title="Swipe up for Home (Tap to return to Dashboard)"
                  className="w-32 h-1 bg-slate-400 dark:bg-white/60 hover:bg-slate-700 dark:hover:bg-white rounded-full transition-all cursor-pointer active:scale-90"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
