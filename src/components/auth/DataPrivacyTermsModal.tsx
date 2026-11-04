import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  Sparkles,
  LogOut,
  MapPin
} from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
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

  const allAgreed = agreePrivacy && agreeTerms && agreeSafety;

  const handleSelectAll = () => {
    if (allAgreed) {
      setAgreePrivacy(false);
      setAgreeTerms(false);
      setAgreeSafety(false);
    } else {
      setAgreePrivacy(true);
      setAgreeTerms(true);
      setAgreeSafety(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Header Banner */}
        <div className="relative bg-linear-to-r from-cyan-600/90 via-emerald-600/90 to-teal-700/90 text-white p-5 sm:p-6 shrink-0 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md p-2 flex items-center justify-center border border-white/20 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                    Republic Act 10173 & Terms
                  </span>
                  <span className="text-[10px] text-emerald-100 font-semibold hidden sm:inline">
                    Bohol Transport Compliance
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  Pribasiya ug Kasabotan
                </h2>
                <p className="text-xs text-emerald-50 mt-0.5">
                  Maayong pag-abot, <span className="font-bold underline decoration-white/50">{user.name}</span>! Palihug basaha ug dawata ang kasabotan aron makapadayon.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Notice Badge */}
          <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-emerald-100">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>Registered LGU: <strong>{user.municipality}</strong></span>
            </div>
            <div className="capitalize font-semibold bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
              Role: {user.user_type.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-2 glass-panel-subtle border-b border-slate-200/50 dark:border-slate-800/60 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Data Privacy (RA 10173)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'safety'
                ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Road Safety Pledge</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
          
          {/* TAB 1: DATA PRIVACY ACT OF 2012 (RA 10173) */}
          {activeTab === 'privacy' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300">
                <div className="flex items-start space-x-2.5">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-sm">Philippine Data Privacy Act of 2012 (RA 10173)</h3>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                      Gipanalipdan ang inyong personal nga impormasyon subay sa balaod sa Pilipinas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>1. Unsa nga mga Impormasyon ang Ginakolekta (Data Collected)</span>
                </h4>
                <p>
                  Aron magamit ang mga feature sa Byahe ni Bai, ang mosunod nga datos ang gikinahanglan:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li><strong>Personal Identifier:</strong> Pangalan, contact number, email address, ug lungsod (Municipality).</li>
                  <li><strong>Sakyanan (Vehicle Profile):</strong> Brand, modelo, fuel type, plaka (plate number), o TODA body number.</li>
                  <li><strong>Talaan sa Biyahe (Trips):</strong> Gikanan (origin), adtoan (destination), kilometro (distance), ug plete (passenger fares).</li>
                  <li><strong>Resibo sa Gasolina (Fuel Purchases):</strong> Estasyon, presyo kada litro, kantidad sa tubil, ug petsa.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>2. Katuyoan sa Pagproseso (Purpose of Data Processing)</span>
                </h4>
                <p>
                  Ang inyong mga datos gigamit lamang alang sa:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Pagkalkula sa inadlaw nga kita, gastos sa gasolina, ug boundary.</li>
                  <li>Pagtandi sa pinakabarato nga presyo sa gasolina sa Bohol pinaagi sa <strong>FuelWatch PH</strong>.</li>
                  <li>Personal nga pag-monitor sa inyong inadlaw o binuwan nga allowance.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>3. Inyong mga Katungod Subay sa RA 10173 (Your Data Rights)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block">Katungod nga Makahibalo (Right to be Informed)</strong>
                    Kahibalo kamo kanunay giunsa paggamit ang inyong travel ug fuel data.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block">Katungod sa Pagtul-id (Right to Rectify)</strong>
                    Pwede ninyo usbon o i-edit ang bisan unsang sayop nga biyahe o resibo.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block">Katungod sa Pagpapas (Right to Erasure)</strong>
                    Pwede ninyo papason ang inyong sakyanan, biyahe, o account bisan kanus-a.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white block">Walay Komersyal nga Pagbaligya</strong>
                    Dili gayod ibaligya ang inyong impormasyon ngadto sa mga 3rd-party advertisers.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS AND CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 bg-cyan-50/80 dark:bg-cyan-950/40 rounded-2xl border border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-300">
                <div className="flex items-start space-x-2.5">
                  <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-sm">Kasabotan sa Paggamit (Terms of Service)</h3>
                    <p className="text-[11px] text-cyan-800 dark:text-cyan-400 mt-0.5">
                      Mga lagda ug responsibilidad sa matag drayber ug motorista sa Bohol.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  1. Tinuod nga Rekord (Authentic Reporting)
                </h4>
                <p>
                  Miuyon kamo nga magbutang ug tinuod nga gilay-on sa biyahe (km), plete, ug aktwal nga presyo sa tubil aron magpabiling husto ug kasaligan ang inyong mga taho (reports).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  2. Pagsunod sa Taripa sa Plete (Fair Fare Adherence)
                </h4>
                <p>
                  Alang sa mga <strong>Habal-Habal</strong> ug <strong>Tricycle TODA</strong> drivers, miuyon kamo sa pagpatuman sa makiangayon nga plete subay sa ordinansa sa inyong tagsa-tagsa ka LGU ug TODA associations sa Bohol. Dili magpahimulos sa mga pasahero o turista.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  3. FuelWatch PH Estimates Disclaimer
                </h4>
                <p>
                  Ang mga presyo sa gasolina ug diesel nga gipakita sa FuelWatch monitor maoy mga banabana (estimates) basi sa live community reports. Ang aktwal nga presyo sa dispenser sa estasyon maoy masunod tungod sa scheduling sa barge deliveries gikan sa Cebu o Iloilo.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  4. Dili Paggamit sa Telepono Samtang Nagpadagan (No Device Use While Driving)
                </h4>
                <p className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-semibold">
                  ⚠️ Hugot nga gidili ang pag-operate o pag-type sa app samtang nagpadagan sa motorsiklo, tricycle, o sakyanan. Ihunong daan ang sakyanan sa luwas nga daplin sa dalan una mag-log ug biyahe o resibo.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BOHOL ROAD SAFETY PLEDGE */}
          {activeTab === 'safety' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300">
                <div className="flex items-start space-x-2.5">
                  <HeartHandshake className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-extrabold text-sm">Panumpa sa Luwas nga Pagbiyahe sa Bohol</h3>
                    <p className="text-[11px] text-rose-800 dark:text-rose-400 mt-0.5">
                      Responsableng drayber, luwas nga pasahero, ug matinahuron nga Bol-anon.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  1. Pagsul-ob sa Standard Protective Helmet (RA 10054)
                </h4>
                <p>
                  Alang sa tanang motorista ug habal-habal riders, kanunay magsul-ob ug ICC/DTI approved helmet, lakip ang inyong pasahero.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  2. Pagsunod sa Kapasidad sa Pasahero (Passenger Safety)
                </h4>
                <p>
                  Dili mag-overload sa tricycle o motorsiklo lapas sa legal nga kapasidad nga gitakda sa LGU ug LTO alang sa kaluwasan sa tanan.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  3. Pagkamatinahuron sa Pasahero ug Turista (Boholano Hospitality)
                </h4>
                <p>
                  Ipadayon ang garbo sa Bohol isip UNESCO Global Geopark pinaagi sa maayong pamatasan, matinud-anon nga plete, ug tabang sa mga lokal nga pasahero ug mga turista.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Checkbox Affirmations */}
        <div className="p-4 sm:p-5 glass-panel-subtle border-t border-slate-200/50 dark:border-slate-800/60 space-y-3 shrink-0">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gikinahanglan nga Pag-uyon (Mandatory Consents)
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {allAgreed ? 'I-uncheck Tanan' : 'Uyon Ko sa Tanan (Check All)'}
            </button>
          </div>

          <div className="space-y-2">
            {/* Checkbox 1: Data Privacy Act */}
            <label className="flex items-start space-x-3 p-2.5 rounded-xl glass-panel-subtle cursor-pointer hover:border-emerald-400/50 transition-colors">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={e => setAgreePrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                Miuyon ko sa pagkolekta ug pagproseso sa akong biyahe ug fuel data subay sa <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>.
              </span>
            </label>

            {/* Checkbox 2: Terms of Service */}
            <label className="flex items-start space-x-3 p-2.5 rounded-xl glass-panel-subtle cursor-pointer hover:border-emerald-400/50 transition-colors">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                Akong nabasa ug gidawat ang <strong>Byahe ni Bai Terms & Conditions of Service</strong> ug mga lagda sa patas nga taripa sa plete.
              </span>
            </label>

            {/* Checkbox 3: Road Safety Pledge */}
            <label className="flex items-start space-x-3 p-2.5 rounded-xl glass-panel-subtle cursor-pointer hover:border-emerald-400/50 transition-colors">
              <input
                type="checkbox"
                checked={agreeSafety}
                onChange={e => setAgreeSafety(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                Misaad ko sa <strong>Bohol Road Safety & Driver Courtesy Pledge</strong> (pagsul-ob ug helmet, walay pag-text samtang nagmaneho).
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {!isConfirmingDecline ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDecline(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Dili Mo-uyon (Decline & Exit)</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onDecline}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Sigurado Ko (Exit)
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDecline(false)}
                  className="px-3 py-2 rounded-xl glass-btn text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Balik
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onAccept}
              disabled={!allAgreed}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer ${
                allAgreed
                  ? 'bg-linear-to-r from-cyan-600 via-emerald-600 to-teal-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white shadow-emerald-900/30'
                  : 'glass-panel-subtle text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${allAgreed ? 'text-white' : 'text-slate-400'}`} />
              <span>Dawata ug Padayon (Accept & Proceed)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
