import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Scale,
  LogOut,
  MapPin
} from 'lucide-react';
import type { UserProfile } from '../../types';

interface Props {
  isOpen: boolean;
  user: UserProfile;
  onAccept: () => void;
  onDecline: () => void;
}

export const DataPrivacyTermsModal: React.FC<Props> = ({
  isOpen,
  user,
  onAccept,
  onDecline,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'safety'>('privacy');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeSafety, setAgreeSafety] = useState(false);
  const [isConfirmingDecline, setIsConfirmingDecline] = useState(false);

  if (!isOpen) return null;

  const agreedCount = [agreePrivacy, agreeTerms, agreeSafety].filter(Boolean).length;
  const allAgreed = agreedCount === 3;

  const handleSelectAll = () => {
    const next = !allAgreed;
    setAgreePrivacy(next);
    setAgreeTerms(next);
    setAgreeSafety(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">

        {/* Compact Top Header Banner */}
        <div className="relative bg-linear-to-r from-cyan-600/95 via-emerald-600/95 to-teal-700/95 text-white px-4 py-3 sm:px-6 sm:py-3.5 shrink-0 border-b border-white/15">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white truncate">
                    Pribasiya ug Kasabotan
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    RA 10173 & Terms
                  </span>
                </div>
                <p className="text-[11px] text-emerald-50/95 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>Maayong pag-abot, <strong>{user.name}</strong></span>
                  <span className="opacity-60">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-200" />
                    {user.municipality}
                  </span>
                  <span className="opacity-60">•</span>
                  <span className="capitalize font-semibold">{user.user_type.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slim Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-2 glass-panel-subtle border-b border-slate-200/50 dark:border-slate-800/60 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              1. Privacy<span className="hidden sm:inline"> (RA 10173)</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              2. Terms<span className="hidden sm:inline"> of Service</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'safety'
                ? 'glass-btn bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              3. Safety<span className="hidden sm:inline"> Pledge</span>
            </span>
          </button>
        </div>

        {/* Generous Scrollable Reading Body + Inline Consent Checklist */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">

          {/* TAB 1: DATA PRIVACY ACT OF 2012 (RA 10173) */}
          {activeTab === 'privacy' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-start space-x-2.5">
                <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm">Philippine Data Privacy Act of 2012 (RA 10173)</h3>
                  <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                    Gipanalipdan ang inyong personal nga impormasyon subay sa balaod sa Pilipinas.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">01</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Impormasyon nga Ginakolekta (Data Collected)
                  </h4>
                </div>
                <p>Aron magamit ang mga feature sa Byahe ni Bai, ang mosunod nga datos ang gikinahanglan:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li><strong>Personal Identifier:</strong> Pangalan, contact number, email address, ug lungsod (Municipality).</li>
                  <li><strong>Vehicle Profile:</strong> Brand, modelo, fuel type, plate number, o TODA body number.</li>
                  <li><strong>Trips & Routes:</strong> Gikanan (origin), adtoan (destination), kilometro, ug plete (passenger fares).</li>
                  <li><strong>Fuel Receipts:</strong> Estasyon, presyo kada litro, kantidad sa tubil, ug petsa.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">02</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Katuyoan sa Pagproseso (Purpose of Data Processing)
                  </h4>
                </div>
                <p>Ang inyong mga datos gigamit lamang alang sa:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li>Pagkalkula sa inadlaw nga kita, gastos sa gasolina, ug boundary.</li>
                  <li>Pagtandi sa presyo sa gasolina sa Bohol pinaagi sa <strong>FuelPrice PH (fuelprice.ph)</strong>.</li>
                  <li>Personal nga pag-monitor sa inyong inadlaw o binuwan nga fuel allowance.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">03</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Inyong mga Katungod Subay sa RA 10173 (Your Data Rights)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">Right to be Informed</strong>
                    Kahibalo kamo kanunay giunsa paggamit ang inyong travel ug fuel data.
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">Right to Rectify</strong>
                    Pwede ninyo usbon o i-edit ang bisan unsang sayop nga biyahe o resibo.
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">Right to Erasure</strong>
                    Pwede ninyo papason ang inyong sakyanan, biyahe, o account bisan kanus-a.
                  </div>
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">No Commercial Selling</strong>
                    Dili gayod ibaligya ang inyong impormasyon ngadto sa mga 3rd-party advertisers.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS AND CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-cyan-900 dark:text-cyan-200 flex items-start space-x-2.5">
                <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm">Terms & Conditions of Service (Kasabotan sa Paggamit)</h3>
                  <p className="text-[11px] text-cyan-800/90 dark:text-cyan-300/90 mt-0.5">
                    Mga lagda, limitasyon, ug responsibilidad sa matag drayber ug motorista sa Bohol.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-black text-[10px]">01</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Authentic Reporting (Tinuod nga Rekord)
                  </h4>
                </div>
                <p>
                  Miuyon kamo nga magbutang ug tinuod nga gilay-on sa biyahe (km), plete, ug aktwal nga presyo sa tubil aron magpabiling husto ug kasaligan ang inyong mga taho ug financial summaries.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-black text-[10px]">02</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Fair Fare Adherence (Pagsunod sa Taripa sa Plete)
                  </h4>
                </div>
                <p>
                  Alang sa mga <strong>Habal-Habal</strong> ug <strong>Tricycle TODA</strong> drivers, miuyon kamo sa pagpatuman sa makiangayon nga plete subay sa ordinansa sa inyong tagsa-tagsa ka LGU ug TODA associations sa Bohol. Dili magpahimulos sa mga pasahero o turista.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-black text-[10px]">03</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    FuelPrice PH Estimates Disclaimer
                  </h4>
                </div>
                <p>
                  Ang mga presyo sa gasolina ug diesel nga gipakita gikan sa <strong>FuelPrice PH (fuelprice.ph)</strong> maoy mga sinemana nga banabana (weekly reference estimates). Ang aktwal nga presyo sa dispenser sa estasyon sa Bohol maoy masunod tungod sa barge delivery schedules gikan sa Cebu o Iloilo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/35 border border-amber-500/35 text-amber-900 dark:text-amber-200 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <h4 className="font-extrabold text-amber-950 dark:text-amber-200">
                    04. No Device Use While Driving (Walay Pag-text Samtang Nagpadagan)
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs font-medium leading-relaxed">
                  Hugot nga gidili ang pag-operate o pag-type sa app samtang nagpadagan sa motorsiklo, tricycle, o sakyanan. Ihunong daan ang sakyanan sa luwas nga daplin sa dalan una mag-log ug biyahe o resibo.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BOHOL ROAD SAFETY PLEDGE */}
          {activeTab === 'safety' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex items-start space-x-2.5">
                <HeartHandshake className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm">Panumpa sa Luwas nga Pagbiyahe sa Bohol</h3>
                  <p className="text-[11px] text-rose-800/90 dark:text-rose-300/90 mt-0.5">
                    Responsableng drayber, luwas nga pasahero, ug matinahuron nga Bol-anon.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 font-black text-[10px]">01</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Standard Protective Helmet (RA 10054)
                  </h4>
                </div>
                <p>
                  Alang sa tanang motorista ug habal-habal riders, kanunay magsul-ob ug ICC/DTI approved helmet, lakip ang inyong pasahero.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 font-black text-[10px]">02</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Passenger Safety & Capacity Limit
                  </h4>
                </div>
                <p>
                  Dili mag-overload sa tricycle o motorsiklo lapas sa legal nga kapasidad nga gitakda sa LGU ug LTO alang sa kaluwasan sa tanan.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel-subtle space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 font-black text-[10px]">03</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Boholano Hospitality & Courtesy
                  </h4>
                </div>
                <p>
                  Ipadayon ang garbo sa Bohol isip UNESCO Global Geopark pinaagi sa maayong pamatasan, matinud-anon nga plete, ug tabang sa mga lokal nga pasahero ug mga turista.
                </p>
              </div>
            </div>
          )}

          {/* Individual Consent Checklist inside the scrollable document */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mandatory Consents ({agreedCount}/3 Agreed)
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {allAgreed ? 'Uncheck All' : 'Check All'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl glass-panel-subtle cursor-pointer hover:border-emerald-400/50 transition-colors">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={e => setAgreePrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Miuyon ko sa pagkolekta ug pagproseso sa akong biyahe ug fuel data subay sa <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl glass-panel-subtle cursor-pointer hover:border-emerald-400/50 transition-colors">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Akong nabasa ug gidawat ang <strong>Byahe ni Bai Terms & Conditions of Service</strong> ug mga lagda sa patas nga taripa sa plete.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl glass-panel-subtle cursor-pointer hover:border-emerald-400/50 transition-colors">
                <input
                  type="checkbox"
                  checked={agreeSafety}
                  onChange={e => setAgreeSafety(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Misaad ko sa <strong>Bohol Road Safety & Driver Courtesy Pledge</strong> (pagsul-ob ug helmet, walay pag-text samtang nagmaneho).
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Slim Sticky Action Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 glass-panel-subtle border-t border-slate-200/60 dark:border-slate-800/70 shrink-0 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center flex-wrap gap-2">
            {!isConfirmingDecline ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDecline(true)}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Decline & Exit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={onDecline}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Confirm Exit
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDecline(false)}
                  className="px-2.5 py-1.5 rounded-xl glass-btn text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass-btn cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={handleSelectAll}
                className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
              />
              <span>Agree to All ({agreedCount}/3)</span>
            </label>
          </div>

          <button
            type="button"
            onClick={onAccept}
            disabled={!allAgreed}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2 ${
              allAgreed
                ? 'bg-linear-to-r from-cyan-600 via-emerald-600 to-teal-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white shadow-emerald-900/30 cursor-pointer'
                : 'glass-panel-subtle text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${allAgreed ? 'text-white' : 'text-slate-400'}`} />
            <span>Dawata ug Padayon (Accept & Proceed)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
