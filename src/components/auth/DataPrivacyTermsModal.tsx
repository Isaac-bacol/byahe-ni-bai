import React, { useState } from 'react';
import type { UserProfile } from '../../types';

interface Props {
  isOpen: boolean;
  user: UserProfile;
  onAccept: () => void;
  onDecline: () => void;
}

const Section: React.FC<{
  title: string;
  sub: string;
  consent: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}> = ({ title, sub, consent, checked, onChange, children }) => (
  <section className="py-7 border-t border-[#eceef1] dark:border-[#262c34] first:border-t-0 first:pt-2">
    <h3 className="text-lg font-bold text-ink dark:text-white">{title}</h3>
    <p className="text-sm text-muted">{sub}</p>
    <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#3b4450] dark:text-[#c4cad1]">{children}</div>
    <label
      className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
        checked ? 'border-sign bg-sign/[.06] dark:bg-sign/15' : 'border-[#dfe3e7] dark:border-[#343b45] hover:border-[#b9c0c8]'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-sign cursor-pointer" />
      <span className="text-[15px] leading-6 font-medium text-ink dark:text-[#e6e9ec]">{consent}</span>
    </label>
  </section>
);

const List: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1.5 marker:text-[#a3abb4]">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);

export const DataPrivacyTermsModal: React.FC<Props> = ({ isOpen, user, onAccept, onDecline }) => {
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeSafety, setAgreeSafety] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);

  if (!isOpen) return null;

  const agreed = [agreePrivacy, agreeTerms, agreeSafety].filter(Boolean).length;
  const allAgreed = agreed === 3;
  const firstName = user.name.split(' ')[0];

  const setAll = (v: boolean) => {
    setAgreePrivacy(v);
    setAgreeTerms(v);
    setAgreeSafety(v);
  };

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-6 bg-black/40" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <div className="flex flex-col w-full h-full sm:h-auto sm:max-h-[88vh] sm:max-w-xl sm:rounded-2xl bg-white dark:bg-[#1b2027] shadow-2xl font-sans">
        <header className="px-6 pt-[max(28px,env(safe-area-inset-top))] pb-5 shrink-0">
          <h2 id="terms-title" className="text-[26px] leading-tight font-bold tracking-tight text-ink dark:text-white">
            Pribasiya ug kasabotan
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-muted">
            Maayong pag-abot, {firstName}. Basaha ang tulo ka butang sa ubos ug uyoni aron makapadayon. Mga usa ka minuto ra ni.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <Section
            title="Imong datos"
            sub="Data Privacy Act of 2012 (RA 10173)"
            checked={agreePrivacy}
            onChange={setAgreePrivacy}
            consent="Miuyon ko sa pagkolekta ug paggamit sa akong biyahe ug fuel data subay sa RA 10173."
          >
            <div>
              <p className="font-semibold text-ink dark:text-white">Unsa among gikolekta</p>
              <List
                items={[
                  'Pangalan, contact number, email, ug lungsod',
                  'Detalye sa sakyanan: brand, modelo, fuel type, plate o TODA number',
                  'Mga biyahe: gikan, adto, kilometro, ug plete',
                  'Resibo sa gasolina: estasyon, presyo kada litro, kadaghan, ug petsa',
                ]}
              />
            </div>
            <div>
              <p className="font-semibold text-ink dark:text-white">Para asa kini</p>
              <List
                items={[
                  'Pagkwenta sa imong kita, gastos sa gasolina, ug boundary',
                  'Pagtandi sa presyo sa gasolina sa Bohol gamit ang fuelprice.ph',
                  'Pag-monitor sa imong fuel allowance',
                ]}
              />
            </div>
            <div>
              <p className="font-semibold text-ink dark:text-white">Imong mga katungod</p>
              <List
                items={[
                  'Mahibalo ka kanunay unsaon paggamit sa imong datos.',
                  'Pwede nimo usbon ang sayop nga biyahe o resibo.',
                  'Pwede nimo papason ang imong sakyanan, biyahe, o account bisan kanus-a.',
                  'Dili gyud namo ibaligya ang imong impormasyon sa mga advertiser.',
                ]}
              />
            </div>
          </Section>

          <Section
            title="Mga lagda sa paggamit"
            sub="Terms of Service"
            checked={agreeTerms}
            onChange={setAgreeTerms}
            consent="Nabasa ug gidawat nako ang Terms of Service ug ang lagda sa patas nga plete."
          >
            <p>
              <span className="font-semibold text-ink dark:text-white">Tinuod nga rekord.</span> Ibutang ang tinuod nga kilometro, plete, ug presyo sa gasolina aron husto ang imong mga report.
            </p>
            <p>
              <span className="font-semibold text-ink dark:text-white">Patas nga plete.</span> Para sa habal-habal ug tricycle, sunda ang taripa sa imong LGU ug TODA. Ayaw pahimusli ang mga pasahero o turista.
            </p>
            <p>
              <span className="font-semibold text-ink dark:text-white">Presyo sa gasolina.</span> Ang presyo gikan sa fuelprice.ph kay sinemana nga banabana. Ang presyo sa pump sa estasyon ang masunod.
            </p>
            <p>
              <span className="font-semibold text-ink dark:text-white">Ayaw gamita samtang nagmaneho.</span> Ihunong una ang sakyanan sa luwas nga daplin sa dalan sa dili pa mag-log og biyahe o resibo.
            </p>
          </Section>

          <Section
            title="Panumpa sa luwas nga pagbiyahe"
            sub="Bohol Road Safety Pledge"
            checked={agreeSafety}
            onChange={setAgreeSafety}
            consent="Misaad ko nga magsul-ob og helmet ug dili mag-text samtang nagmaneho."
          >
            <List
              items={[
                'Kanunay magsul-ob og ICC/DTI-approved nga helmet, ikaw ug imong pasahero (RA 10054).',
                'Dili mag-overload lapas sa kapasidad nga gitakda sa LGU ug LTO.',
                'Maayong pamatasan ug matinud-anon nga plete para sa mga lokal ug turista.',
              ]}
            />
          </Section>
        </div>

        <footer className="shrink-0 border-t border-[#eceef1] dark:border-[#262c34] px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
          {confirmDecline ? (
            <div>
              <p className="text-[15px] text-ink dark:text-white">Kung dili ka mouyon, ma-sign out ka. Sigurado ka?</p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDecline(false)}
                  className="flex-1 h-12 rounded-xl border border-[#d3d8de] dark:border-[#343b45] font-semibold text-ink dark:text-white cursor-pointer"
                >
                  Balik
                </button>
                <button type="button" onClick={onDecline} className="flex-1 h-12 rounded-xl bg-pin text-white font-semibold cursor-pointer">
                  Oo, sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted">{agreed} sa 3 nauyonan</span>
                <button type="button" onClick={() => setAll(!allAgreed)} className="font-semibold text-sign dark:text-[#3fbf8a] hover:underline cursor-pointer">
                  {allAgreed ? 'Kuhaa tanan' : 'Uyon sa tanan'}
                </button>
              </div>
              <button
                type="button"
                onClick={onAccept}
                disabled={!allAgreed}
                className="w-full h-12 rounded-xl bg-sign hover:bg-sign-dark text-white text-base font-bold disabled:bg-[#e3e6ea] disabled:text-[#8a929b] dark:disabled:bg-[#2a3038] dark:disabled:text-[#6f7882] disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sign"
              >
                Uyon ug padayon
              </button>
              <button
                type="button"
                onClick={() => setConfirmDecline(true)}
                className="mt-2 w-full h-10 text-sm text-muted hover:text-ink dark:hover:text-white cursor-pointer"
              >
                Dili ko mouyon
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
