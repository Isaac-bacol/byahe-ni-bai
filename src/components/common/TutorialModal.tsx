import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bike,
  Route,
  Fuel,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenAddTrip: () => void;
}

interface TutorialStep {
  id: string;
  stepLabel: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  points: string[];
  actionLabel?: string;
  actionTab?: string;
  actionType?: 'navigate' | 'add_trip';
}

export const TutorialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAddTrip,
}) => {
  const { userType } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      setCurrentStep(0);
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDriver = userType === 'habal_habal' || userType === 'tricycle';

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      stepLabel: 'Overview',
      title: 'Welcome to Byahe ni Bai',
      subtitle: 'Your daily Bohol trip, fuel, and budget companion.',
      icon: <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      accentClass: 'bg-emerald-500/15 border-emerald-500/30',
      points: [
        'Track every ride, fuel expense, and daily balance in one place.',
        'Check weekly Bohol pump prices from FuelWatch before you gas up.',
        isDriver
          ? 'Monitor passenger fares, fuel spending, and net take-home earnings.'
          : 'Monitor your weekly fuel allowance, trip distances, and vehicle efficiency.',
        'Follow the 4 quick steps next to get started in under a minute.',
      ],
    },
    {
      id: 'garage',
      stepLabel: 'Step 1 of 4',
      title: 'Add Your Vehicle in Garage',
      subtitle: 'Accurate vehicle info gives accurate fuel estimates.',
      icon: <Bike className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      accentClass: 'bg-blue-500/15 border-blue-500/30',
      points: [
        'Open the Garage tab and tap "Add Vehicle" to pick your motorcycle or tricycle.',
        'Set your default vehicle so new trips automatically use its km/L efficiency and fuel type.',
        'You can switch or edit your vehicle anytime as your mileage changes.',
      ],
      actionLabel: 'Open Garage',
      actionTab: 'vehicles',
      actionType: 'navigate',
    },
    {
      id: 'trips',
      stepLabel: 'Step 2 of 4',
      title: 'Log Your Trips',
      subtitle: 'Record routes, distance, fuel cost, and fares.',
      icon: <Route className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      accentClass: 'bg-blue-500/15 border-blue-500/30',
      points: [
        'Tap "+ Log Trip" on the Dashboard (or the center "+" button on mobile).',
        'Pick your origin and destination in Bohol to auto-calculate route distance and estimated fuel.',
        isDriver
          ? 'Enter passenger fare and boundary/expenses to automatically see your net income.'
          : 'Save the trip to deduct fuel cost from your allowance budget automatically.',
      ],
      actionLabel: 'Log a Trip Now',
      actionType: 'add_trip',
    },
    {
      id: 'fuel',
      stepLabel: 'Step 3 of 4',
      title: 'Compare Fuel & Log Receipts',
      subtitle: 'Find cheaper stations and time your refuel.',
      icon: <Fuel className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      accentClass: 'bg-amber-500/15 border-amber-500/30',
      points: [
        'Visit Fuel & FuelWatch to view weekly Bohol pump prices by brand and station.',
        'Snap or upload your Petron/gas receipt using the OCR Scanner to auto-fill liters and total cost.',
        'Use the Fuel Cost Calculator to estimate how much a route will cost before riding.',
        'Tap the Bell icon anytime for Tuesday 6:00 AM price hike or rollback advisories.',
      ],
      actionLabel: 'Open Fuel & FuelWatch',
      actionTab: 'fuel',
      actionType: 'navigate',
    },
    {
      id: 'finances-reports',
      stepLabel: 'Step 4 of 4',
      title: 'Track Budget, Reports & Care Tips',
      subtitle: 'Review your numbers and keep your ride in top shape.',
      icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      accentClass: 'bg-emerald-500/15 border-emerald-500/30',
      points: [
        isDriver
          ? 'Check Finances to review daily/weekly fares, fuel costs, boundary, and net earnings.'
          : 'Set or adjust your fuel allowance budget inside Finances.',
        'Open Reports to print a clean summary or export a branded Excel (.xlsx) report.',
        'Scroll the Dashboard for Gasoline Saving, Vehicle Optimization, and Check-up checklists.',
      ],
      actionLabel: 'View Finances',
      actionTab: 'finances',
      actionType: 'navigate',
    },
  ];

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleAction = () => {
    onClose();
    if (step.actionType === 'add_trip') {
      onOpenAddTrip();
    } else if (step.actionType === 'navigate' && step.actionTab) {
      onNavigateTab(step.actionTab);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-modal w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle pill */}
        <div className="pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/30 dark:bg-white/20 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="px-6 py-3.5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
              How to Use
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {step.stepLabel}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/15 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Step Icon & Title */}
          <div className="flex items-start space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${step.accentClass}`}>
              {step.icon}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                {step.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Checklist Points */}
          <div className="glass-panel-subtle rounded-2xl p-4 space-y-3">
            {step.points.map((point, idx) => (
              <div key={idx} className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Jump Action */}
          {step.actionLabel && (
            <button
              onClick={handleAction}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/5 dark:bg-white/5 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/15 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/40 text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Try it: {step.actionLabel}</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          )}

          {/* Step Dots */}
          <div className="flex items-center justify-center space-x-2 pt-1">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                aria-label={`Go to ${s.stepLabel}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-3 shrink-0 bg-white/30 dark:bg-slate-900/30">
          {isFirst ? (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              className="px-3.5 py-2 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {isLast ? (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Got It, Let's Ride</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
