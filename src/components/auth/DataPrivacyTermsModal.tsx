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
            Privacy and terms
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-muted">
            Welcome, {firstName}. Please read the three sections below and agree to each one to continue. It takes about a minute.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <Section
            title="Your data"
            sub="Data Privacy Act of 2012 (RA 10173)"
            checked={agreePrivacy}
            onChange={setAgreePrivacy}
            consent="I agree to the collection and use of my trip and fuel data under RA 10173."
          >
            <div>
              <p className="font-semibold text-ink dark:text-white">What we collect</p>
              <List
                items={[
                  'Your name, contact number, email, and municipality',
                  'Vehicle details: brand, model, fuel type, plate or TODA number',
                  'Trips: start, destination, distance, and fares',
                  'Fuel receipts: station, price per liter, amount, and date',
                ]}
              />
            </div>
            <div>
              <p className="font-semibold text-ink dark:text-white">What we use it for</p>
              <List
                items={[
                  'Calculating your earnings, fuel costs, and boundary',
                  'Comparing fuel prices in Bohol using fuelprice.ph',
                  'Tracking your fuel allowance',
                ]}
              />
            </div>
            <div>
              <p className="font-semibold text-ink dark:text-white">Your rights</p>
              <List
                items={[
                  'You will always know how your data is used.',
                  'You can correct any wrong trip or receipt.',
                  'You can delete your vehicles, trips, or account at any time.',
                  'We will never sell your information to advertisers.',
                ]}
              />
            </div>
          </Section>

          <Section
            title="Terms of use"
            sub="Terms of Service"
            checked={agreeTerms}
            onChange={setAgreeTerms}
            consent="I have read and accept the Terms of Service and the fair fare rules."
          >
            <p>
              <span className="font-semibold text-ink dark:text-white">Honest records.</span> Enter the real distance, fares, and fuel prices so your reports stay accurate.
            </p>
            <p>
              <span className="font-semibold text-ink dark:text-white">Fair fares.</span> Habal-habal and tricycle drivers follow the fare rates set by their LGU and TODA. Do not overcharge passengers or tourists.
            </p>
            <p>
              <span className="font-semibold text-ink dark:text-white">Fuel prices.</span> Prices from fuelprice.ph are weekly estimates. The price at the station pump is what you actually pay.
            </p>
            <p>
              <span className="font-semibold text-ink dark:text-white">Don't use the app while driving.</span> Pull over somewhere safe before logging a trip or receipt.
            </p>
          </Section>

          <Section
            title="Road safety pledge"
            sub="Bohol Road Safety Pledge"
            checked={agreeSafety}
            onChange={setAgreeSafety}
            consent="I promise to wear a helmet and not to text while driving."
          >
            <List
              items={[
                'Always wear an ICC/DTI-approved helmet, and make sure your passenger does too (RA 10054).',
                'Do not carry more passengers than the limit set by your LGU and the LTO.',
                'Be courteous and charge honest fares to locals and tourists alike.',
              ]}
            />
          </Section>
        </div>

        <footer className="shrink-0 border-t border-[#eceef1] dark:border-[#262c34] px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
          {confirmDecline ? (
            <div>
              <p className="text-[15px] text-ink dark:text-white">If you don't agree, you'll be signed out. Are you sure?</p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDecline(false)}
                  className="flex-1 h-12 rounded-xl border border-[#d3d8de] dark:border-[#343b45] font-semibold text-ink dark:text-white cursor-pointer"
                >
                  Go back
                </button>
                <button type="button" onClick={onDecline} className="flex-1 h-12 rounded-xl bg-pin text-white font-semibold cursor-pointer">
                  Yes, sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted">{agreed} of 3 agreed</span>
                <button type="button" onClick={() => setAll(!allAgreed)} className="font-semibold text-sign dark:text-[#3fbf8a] hover:underline cursor-pointer">
                  {allAgreed ? 'Uncheck all' : 'Agree to all'}
                </button>
              </div>
              <button
                type="button"
                onClick={onAccept}
                disabled={!allAgreed}
                className="w-full h-12 rounded-xl bg-sign hover:bg-sign-dark text-white text-base font-bold disabled:bg-[#e3e6ea] disabled:text-[#8a929b] dark:disabled:bg-[#2a3038] dark:disabled:text-[#6f7882] disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sign"
              >
                Agree and continue
              </button>
              <button
                type="button"
                onClick={() => setConfirmDecline(true)}
                className="mt-2 w-full h-10 text-sm text-muted hover:text-ink dark:hover:text-white cursor-pointer"
              >
                I don't agree
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
