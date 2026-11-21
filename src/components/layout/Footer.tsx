import React, { useState } from 'react';
import {
  Info,
  ShieldCheck,
  FileText,
  Mail,
  MapPin,
  X,
  Heart,
  ExternalLink,
  Download,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';
import { APP_VERSION, APP_REVISION_LABEL, APP_BUILD_NAME, APP_BUILD_DATE } from '../../lib/version';

interface FooterProps {
  onNavigate?: (tab: string) => void;
  onOpenTutorial?: () => void;
}

type ModalType = 'about' | 'terms' | 'privacy' | 'contact' | 'municipalities' | 'donate' | null;

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTutorial }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'gcash' | 'bpi' | 'maribank'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <footer className="glass-panel border-t border-b-0 border-x-0 rounded-none py-10 px-4 mt-12 pb-24 lg:pb-10 transition-colors print:hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Centered Logo & Brand Name */}
        <div
          onClick={() => onNavigate && onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center space-y-2 mb-4 group ${
            onNavigate ? 'cursor-pointer' : ''
          }`}
        >
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform bg-slate-900 border border-slate-200 dark:border-slate-700">
            <img
              src="/logo.png?v=3"
              alt="Byahe ni Bai Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              Byahe ni Bai
            </span>
            <span className="text-xs uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Bohol
            </span>
          </div>
          {/* Prominent Version & System Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Version {APP_VERSION} ({APP_BUILD_NAME})</span>
          </div>
        </div>

        {/* Informational Links (Matching FuelWatch PH format + Donate) */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              How to Use
            </button>
          )}
          <button
            onClick={() => setActiveModal('about')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            About Us
          </button>
          <button
            onClick={() => setActiveModal('terms')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Terms
          </button>
          <button
            onClick={() => setActiveModal('privacy')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveModal('contact')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveModal('municipalities')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center space-x-1"
          >
            <span>48 Municipalities</span>
          </button>
          <button
            onClick={() => setActiveModal('donate')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-500/10 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 shadow-xs hover:scale-105 active:scale-95"
          >
            <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            <span>Donate</span>
          </button>
        </div>

        {/* What It Is About (Cadence matching FuelWatch PH reference) */}
        <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Byahe ni Bai is a community-powered transport, trip, and fuel monitoring platform built for motorists, Habal-Habal riders, and Tricycle TODA drivers across all 48 municipalities of Bohol. Prices may change anytime. Help us keep it accurate by recording your fuel receipts.
        </p>

        {/* Support / Donate Banner Callout (Harmonized with Logo Palette) */}
        <div className="mt-4 mb-2 p-3 sm:p-4 rounded-2xl glass-panel-subtle border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl w-full shadow-xs">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2.5 rounded-xl text-white shrink-0 shadow-sm shadow-emerald-500/20 bg-sign hover:bg-sign-dark">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Support Byahe ni Bai (Donate)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help keep our Bohol transport servers & live fuel monitor running free for all drivers.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('donate')}
            className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5 bg-sign hover:bg-sign-dark"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Donate via QR</span>
          </button>
        </div>

        {/* Copyright Footnote */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center">
          <span>© 2026 Byahe ni Bai • System Release {APP_REVISION_LABEL} ({APP_BUILD_DATE})</span>
          <span className="hidden sm:inline">•</span>
          <span>Daghang Salamat sa tanang mga drayber sa Bohol!</span>
        </div>
      </div>

      {/* Modal Dialogs for Footer Links */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full ${activeModal === 'donate' ? 'max-w-2xl' : 'max-w-lg'} glass-modal rounded-3xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  activeModal === 'donate'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                }`}>
                  {activeModal === 'about' && <Info className="w-4 h-4" />}
                  {activeModal === 'terms' && <FileText className="w-4 h-4" />}
                  {activeModal === 'privacy' && <ShieldCheck className="w-4 h-4" />}
                  {activeModal === 'contact' && <Mail className="w-4 h-4" />}
                  {activeModal === 'municipalities' && <MapPin className="w-4 h-4" />}
                  {activeModal === 'donate' && <Heart className="w-4 h-4 fill-rose-500" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {activeModal === 'about' && 'About Byahe ni Bai'}
                    {activeModal === 'terms' && 'Terms of Service'}
                    {activeModal === 'privacy' && 'Privacy Policy'}
                    {activeModal === 'contact' && 'Contact & Community Support'}
                    {activeModal === 'municipalities' && 'All 48 Bohol Municipalities'}
                    {activeModal === 'donate' && 'Support Byahe ni Bai (Donate)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeModal === 'donate' ? 'Scan via GCash, BPI, or MariBank (InstaPay QR Ph)' : 'Byahe ni Bai Transport Intelligence'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              {activeModal === 'about' && (
                <>
                  <p>
                    <strong className="text-slate-900 dark:text-white font-bold">Byahe ni Bai</strong> ("My Friend's Journey") is a Boholano-first transport operating system created to empower motorcycle commuters, habal-habal operators, and tricycle TODA drivers across the province of Bohol.
                  </p>
                  <p>
                    From Tagbilaran City to Tubigon, Panglao to Ubay, drivers can record their actual mileage, log passenger fares, track daily fuel consumption, and monitor real-time Bohol fuel prices with weekly integration from <strong>FuelPrice PH (fuelprice.ph)</strong>.
                  </p>
                  <div className="p-3 bg-blue-500/10 dark:bg-blue-950/40 rounded-2xl border border-blue-500/30 text-blue-900 dark:text-blue-300">
                    <p className="font-semibold">Our Mission:</p>
                    <p className="mt-1">
                      To promote economic transparency, fuel savings, and fair commuter rates for every driver and rider in Bohol.
                    </p>
                  </div>
                </>
              )}

              {activeModal === 'terms' && (
                <div className="space-y-2.5">
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    By using Byahe ni Bai, you agree to participate responsibly in our transport and fuel tracking community:
                  </p>
                  <div className="p-3 rounded-2xl glass-panel-subtle space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 font-black text-xs">01</span>
                      <strong className="text-slate-900 dark:text-white">Accurate Data</strong>
                    </div>
                    <p>Record authentic mileage, passenger fares, and fuel receipts so your daily expense and trip reports stay reliable.</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-panel-subtle space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 font-black text-xs">02</span>
                      <strong className="text-slate-900 dark:text-white">Fuel Price Estimates Disclaimer</strong>
                    </div>
                    <p>Weekly fuel prices synced from <strong>FuelPrice PH (fuelprice.ph)</strong> and community benchmarks are reference estimates. Actual station pump rates in Bohol may vary based on local barge delivery timing.</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-panel-subtle space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-black text-xs">03</span>
                      <strong className="text-slate-900 dark:text-white">Safe Driving</strong>
                    </div>
                    <p>Do not operate the app while in motion. Always pull over safely before recording trips or logging fuel purchases.</p>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-2.5">
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Your privacy and data sovereignty are fundamental to Byahe ni Bai:
                  </p>
                  <div className="p-3 rounded-2xl glass-panel-subtle space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-xs">01</span>
                      <strong className="text-slate-900 dark:text-white">Local-First Storage</strong>
                    </div>
                    <p>Your vehicle garage, trip histories, fuel receipts, and daily fare finances are saved locally on your device or in your secure driver session.</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-panel-subtle space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-xs">02</span>
                      <strong className="text-slate-900 dark:text-white">No Commercial Selling</strong>
                    </div>
                    <p>We never sell personal driver information, travel routes, or contact numbers to third-party advertisers.</p>
                  </div>
                  <div className="p-3 rounded-2xl glass-panel-subtle space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-xs">03</span>
                      <strong className="text-slate-900 dark:text-white">Full Data Control</strong>
                    </div>
                    <p>You can edit, export, or delete your vehicle logs and trip records at any time under Republic Act 10173.</p>
                  </div>
                </div>
              )}

              {activeModal === 'contact' && (
                <>
                  <p>
                    Have feedback, questions, or want to suggest a local Bohol TODA association feature?
                  </p>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span><strong>Email:</strong> support@byahenibai.ph</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span><strong>Coverage:</strong> Province of Bohol, Central Visayas, Philippines</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    You can also coordinate with your local municipality TODA president or transport office for official routing and fare guidelines.
                  </p>
                </>
              )}

              {activeModal === 'municipalities' && (
                <>
                  <p className="mb-2">
                    Byahe ni Bai covers all 47 municipalities and 1 component city across the island province of Bohol:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto p-2 glass-panel-subtle rounded-2xl border border-white/20 dark:border-white/10 text-xs">
                    {BOHOL_MUNICIPALITIES.map(m => (
                      <span
                        key={m}
                        className="px-2 py-1 glass-panel-subtle rounded-lg text-slate-800 dark:text-slate-200 font-medium truncate border border-white/20 dark:border-white/5"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {activeModal === 'donate' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-slate-700 dark:text-slate-200 bg-sign hover:bg-sign-dark">
                    <p className="text-xs leading-relaxed">
                      Daghang salamat sa pagsuporta sa <strong>Byahe ni Bai</strong>! Your contribution directly funds Bohol transport server uptime, database hosting, and keeping the platform free and accessible for all drivers and commuters across Bohol.
                    </p>
                  </div>

                  {/* Channel Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 glass-panel-subtle rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('all')}
                      className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedChannel === 'all'
                          ? 'glass-btn bg-white/80 dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All Channels (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('gcash')}
                      className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedChannel === 'gcash'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      GCash
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('bpi')}
                      className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedChannel === 'bpi'
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                    >
                      BPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('maribank')}
                      className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedChannel === 'maribank'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400'
                      }`}
                    >
                      MariBank
                    </button>
                  </div>

                  {/* QR Cards Grid */}
                  <div className={`grid gap-3.5 ${
                    selectedChannel === 'all'
                      ? 'grid-cols-1 sm:grid-cols-3'
                      : 'grid-cols-1 max-w-sm mx-auto'
                  }`}>
                    {/* GCash Card */}
                    {(selectedChannel === 'all' || selectedChannel === 'gcash') && (
                      <div className="glass-panel-subtle rounded-2xl border border-blue-500/30 dark:border-blue-500/20 p-3.5 flex flex-col items-center text-center shadow-xs hover:border-blue-400 transition-colors">
                        <div className="w-full flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold uppercase bg-blue-600 text-white">
                            GCash
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            QR Ph / InstaPay
                          </span>
                        </div>

                        <div className="w-full aspect-square max-w-[200px] bg-white rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center overflow-hidden mb-2.5">
                          <img
                            src="/donate/gcash.png"
                            alt="GCash QR Code"
                            className="w-full h-full object-contain hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="w-full text-left space-y-1 mb-3 glass-panel-subtle p-2.5 rounded-xl border border-white/20 dark:border-white/10">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            LA**E IS**C B.
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Account: +63 910 886 ••••
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                            Accepts any PH banking app
                          </div>
                        </div>

                        <a
                          href="/donate/gcash.png"
                          download="byahe-ni-bai-gcash-qr.png"
                          className="w-full mt-auto py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save GCash QR</span>
                        </a>
                      </div>
                    )}

                    {/* BPI Card */}
                    {(selectedChannel === 'all' || selectedChannel === 'bpi') && (
                      <div className="glass-panel-subtle rounded-2xl border border-rose-500/30 dark:border-rose-500/20 p-3.5 flex flex-col items-center text-center shadow-xs hover:border-rose-400 transition-colors">
                        <div className="w-full flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold uppercase bg-rose-700 text-white">
                            BPI
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            QR Ph / InstaPay
                          </span>
                        </div>

                        <div className="w-full aspect-square max-w-[200px] bg-white rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center overflow-hidden mb-2.5">
                          <img
                            src="/donate/bpi.png"
                            alt="BPI QR Code"
                            className="w-full h-full object-contain hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="w-full text-left space-y-1 mb-3 glass-panel-subtle p-2.5 rounded-xl border border-white/20 dark:border-white/10">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Isaac (Lance Isaac S. Bacol)
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            BPI Savings ending in ...556
                          </div>
                          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                            Accepts any PH banking app
                          </div>
                        </div>

                        <a
                          href="/donate/bpi.png"
                          download="byahe-ni-bai-bpi-qr.png"
                          className="w-full mt-auto py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save BPI QR</span>
                        </a>
                      </div>
                    )}

                    {/* MariBank Card */}
                    {(selectedChannel === 'all' || selectedChannel === 'maribank') && (
                      <div className="glass-panel-subtle rounded-2xl border border-orange-500/30 dark:border-orange-500/20 p-3.5 flex flex-col items-center text-center shadow-xs hover:border-orange-400 transition-colors">
                        <div className="w-full flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold uppercase bg-orange-600 text-white">
                            MariBank
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            QR Ph / InstaPay
                          </span>
                        </div>

                        <div className="w-full aspect-square max-w-[200px] bg-white rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center overflow-hidden mb-2.5">
                          <img
                            src="/donate/maribank.png"
                            alt="MariBank QR Code"
                            className="w-full h-full object-contain hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="w-full text-left space-y-1 mb-3 glass-panel-subtle p-2.5 rounded-xl border border-white/20 dark:border-white/10">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            LANCE ISAAC BACOL
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>MariBank (****8172)</span>
                            <button
                              type="button"
                              onClick={() => handleCopy('LB837796', 'maribank')}
                              className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1 cursor-pointer"
                              title="Copy Referral / Code"
                            >
                              {copiedKey === 'maribank' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500 font-bold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Ref: LB837796</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                            Accepts any PH banking app
                          </div>
                        </div>

                        <a
                          href="/donate/maribank.png"
                          download="byahe-ni-bai-maribank-qr.png"
                          className="w-full mt-auto py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save MariBank QR</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Universal QR Ph Notice */}
                  <div className="p-3 glass-panel-subtle rounded-2xl border border-white/20 dark:border-white/10 flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <QrCode className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white">Interoperable QR Ph:</strong> You can scan any of these QR codes using your favorite Philippine banking or e-wallet app, including <strong>Maya, BDO Pay, UnionBank, SeaBank, LandBank, RCBC Pulz, GoTyme</strong>, or any InstaPay-enabled mobile app.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
