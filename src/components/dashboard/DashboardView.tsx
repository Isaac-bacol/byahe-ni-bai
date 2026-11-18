import React, { useMemo, useState } from 'react';
import { Calculator, ChevronDown, Fuel, Plus, Repeat, Route, X } from 'lucide-react';
import { Flaticon } from '../common/Flaticon';
import { FuelCareTipsCard } from '../common/FuelCareTipsCard';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useFuelPriceFeed } from '../../lib/fuelPriceSync';
import type { Trip } from '../../types';

interface Props {
  onOpenAddTrip: () => void;
  onNavigate: (tab: string) => void;
}

type Period = 'today' | 'week' | 'month' | 'all';

const PERIODS: { id: Period; label: string; phrase: string }[] = [
  { id: 'today', label: 'Karon', phrase: 'today' },
  { id: 'week', label: 'Semana', phrase: 'in the last 7 days' },
  { id: 'month', label: 'Bulan', phrase: 'this month' },
  { id: 'all', label: 'Tanan', phrase: 'all time' },
];

const STATUS = {
  on_duty: { label: 'On duty', dot: 'bg-sign' },
  standby: { label: 'Standby', dot: 'bg-amber-500' },
  off_duty: { label: 'Off duty', dot: 'bg-[#a3abb4]' },
} as const;

const peso = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n || 0);

const panel = 'bg-white dark:bg-[#1b2027] border border-[#e3e6ea] dark:border-[#2a3038]';
const sum = (trips: Trip[], key: keyof Trip) => trips.reduce((a, t) => a + (Number(t[key]) || 0), 0);

export const DashboardView: React.FC<Props> = ({ onOpenAddTrip, onNavigate }) => {
  const { currentUser, userType } = useAuth();
  const { financialSummary, userTrips, fuelPrices, defaultVehicle, addTrip } = useData();
  const { feed } = useFuelPriceFeed();

  const [period, setPeriod] = useState<Period>('today');
  const [status, setStatus] = useState<keyof typeof STATUS>('on_duty');
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const periodTrips = useMemo(() => {
    const now = new Date();
    if (period === 'today') return userTrips.filter(t => new Date(t.date).toDateString() === now.toDateString());
    if (period === 'week') return userTrips.filter(t => now.getTime() - new Date(t.date).getTime() <= 7 * 864e5);
    if (period === 'month')
      return userTrips.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    return userTrips;
  }, [userTrips, period]);

  if (!currentUser) return null;

  const isDriver = userType === 'habal_habal' || userType === 'tricycle';
  const phrase = PERIODS.find(p => p.id === period)!.phrase;

  const km = Math.round(sum(periodTrips, 'distance_km') * 10) / 10;
  const fuel = sum(periodTrips, 'fuel_cost');
  const fares = sum(periodTrips, 'fare');
  const boundary = sum(periodTrips, 'boundary_cost');
  const other = sum(periodTrips, 'other_expenses');
  const net = fares - fuel - other - (userType === 'tricycle' ? boundary : 0);

  const used = Math.min(100, Math.round((financialSummary.allowanceUsed / (financialSummary.allowanceBudget || 1)) * 100));
  const barColor = used > 85 ? 'bg-pin' : used > 60 ? 'bg-amber-500' : 'bg-sign';

  const gas = fuelPrices.find(p => p.fuel_type === 'Gasoline')?.price_per_liter || feed.gasoline.price;
  const diesel = fuelPrices.find(p => p.fuel_type === 'Diesel')?.price_per_liter || feed.diesel.price;

  const recent = [...userTrips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const roleLabel = { motorist: 'Motorist', habal_habal: 'Habal-habal', tricycle: 'Tricycle', admin: 'Admin' }[userType ?? 'motorist'];

  const repeatTrip = (trip: Trip) => {
    addTrip({
      origin: trip.origin,
      destination: trip.destination,
      origin_lat: trip.origin_lat,
      origin_lng: trip.origin_lng,
      destination_lat: trip.destination_lat,
      destination_lng: trip.destination_lng,
      distance_km: trip.distance_km,
      duration: trip.duration,
      vehicle_id: trip.vehicle_id || defaultVehicle?.id,
      vehicle_name: trip.vehicle_name,
      purpose: trip.purpose,
      fuel_cost: trip.fuel_cost,
      fare: trip.fare,
      boundary_cost: trip.boundary_cost,
      other_expenses: trip.other_expenses,
      net_amount: trip.net_amount,
      date: new Date().toISOString(),
    });
    setToast(`Logged again: ${trip.origin} to ${trip.destination}`);
    setTimeout(() => setToast(null), 4000);
  };

  const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex items-baseline justify-between py-1.5">
      <dt className="text-[15px] text-muted">{label}</dt>
      <dd className="text-[15px] font-semibold tabular-nums">{value}</dd>
    </div>
  );

  return (
    <div className="space-y-4 pb-20 lg:pb-6 text-ink dark:text-[#e6e9ec]">
      {toast && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl bg-ink dark:bg-white text-white dark:text-ink px-4 py-3 text-sm font-medium">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Greeting */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">Kumusta, {currentUser.name.split(' ')[0]}</h1>
          <p className="flex flex-wrap gap-x-3 text-sm text-muted mt-0.5">
            <span>{currentUser.municipality}</span>
            <span>{roleLabel}</span>
            {defaultVehicle && (
              <span>
                {defaultVehicle.brand} {defaultVehicle.model}
              </span>
            )}
          </p>
        </div>
        {isDriver && (
          <button
            onClick={() => setStatus(s => (s === 'on_duty' ? 'standby' : s === 'standby' ? 'off_duty' : 'on_duty'))}
            title="Tap to change your shift status"
            className={`${panel} shrink-0 h-9 px-3 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer`}
          >
            <span className={`size-2 rounded-full ${STATUS[status].dot}`} />
            {STATUS[status].label}
          </button>
        )}
      </header>

      {/* Period */}
      <div role="tablist" aria-label="Period" className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#e7e9ec] dark:bg-[#20262e]">
        {PERIODS.map(p => (
          <button
            key={p.id}
            role="tab"
            aria-selected={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={`h-9 rounded-lg text-sm cursor-pointer ${
              period === p.id ? 'bg-white dark:bg-[#2f363f] font-semibold shadow-[0_1px_2px_rgba(16,24,40,.12)]' : 'text-muted hover:text-ink dark:hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {/* Main number */}
        <section className={`${panel} rounded-2xl p-5 md:col-span-3`}>
          {isDriver ? (
            <>
              <p className="text-sm text-muted">Take-home {phrase}</p>
              <p className={`font-sign text-[42px] leading-none font-extrabold mt-2 ${net < 0 ? 'text-pin' : 'text-sign dark:text-[#3fbf8a]'}`}>{peso(net)}</p>
              <dl className="mt-4 divide-y divide-[#eceef1] dark:divide-[#262c34]">
                <Row label="Fares collected" value={peso(fares)} />
                <Row label="Fuel" value={`−${peso(fuel)}`} />
                {userType === 'tricycle' && <Row label="Boundary" value={`−${peso(boundary)}`} />}
                <Row label="Other costs" value={`−${peso(other)}`} />
              </dl>
            </>
          ) : userType === 'motorist' ? (
            <>
              <p className="text-sm text-muted">Allowance left this month</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-sign text-[42px] leading-none font-extrabold">{peso(financialSummary.allowanceRemaining)}</span>
                <span className="text-sm text-muted">of {peso(financialSummary.allowanceBudget)}</span>
              </p>
              <div className="mt-4 h-2 rounded-full bg-[#eceef1] dark:bg-[#2a3038] overflow-hidden" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={100} aria-label="Allowance used">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${used}%` }} />
              </div>
              <p className={`text-sm mt-2 ${used > 85 ? 'text-pin font-medium' : 'text-muted'}`}>
                {used > 85 ? `${used}% used. You're close to your limit.` : `${used}% used`}
              </p>
              <dl className="mt-3 divide-y divide-[#eceef1] dark:divide-[#262c34]">
                <Row label={`Spent on fuel ${phrase}`} value={peso(fuel)} />
              </dl>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Fuel spent {phrase}</p>
              <p className="font-sign text-[42px] leading-none font-extrabold mt-2">{peso(fuel)}</p>
            </>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="flex gap-4 text-sm text-muted">
              <span>
                <span className="font-semibold text-ink dark:text-white">{km}</span> km
              </span>
              <span>
                <span className="font-semibold text-ink dark:text-white">{periodTrips.length}</span> {periodTrips.length === 1 ? 'trip' : 'trips'}
              </span>
            </p>
            <button onClick={() => onNavigate('finances')} className="text-sm font-semibold text-route hover:underline cursor-pointer">
              {userType === 'motorist' ? 'Edit budget' : 'Finances'}
            </button>
          </div>
        </section>

        {/* Actions + fuel prices */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <button
              onClick={onOpenAddTrip}
              className="w-full h-12 rounded-xl bg-sign hover:bg-sign-dark text-white font-bold flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sign"
            >
              <Plus className="size-5" strokeWidth={2.5} /> Plan a trip
            </button>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'Fuel prices', tab: 'compare', icon: <Fuel className="size-5" /> },
                { label: 'Calculator', tab: 'finances', icon: <Calculator className="size-5" /> },
                { label: 'Garage', tab: 'vehicles', icon: <Flaticon name="motorcycle" className="size-5" /> },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.tab)}
                  className={`${panel} h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-[13px] font-medium text-ink dark:text-[#e6e9ec] hover:border-[#b9c0c8] dark:hover:border-[#47505b] cursor-pointer`}
                >
                  <span className="text-muted">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <section className={`${panel} rounded-2xl p-5`}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-semibold">Pump prices this week</h2>
              <button onClick={() => onNavigate('compare')} className="text-sm font-semibold text-route hover:underline cursor-pointer shrink-0">
                Compare
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm text-muted">Gasoline</p>
                <p className="font-sign text-2xl font-extrabold">₱{gas.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Diesel</p>
                <p className="font-sign text-2xl font-extrabold">₱{diesel.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Per liter, Bohol estimate from fuelprice.ph. Prices at the pump may differ.</p>
          </section>
        </div>
      </div>

      {/* Recent trips */}
      <section>
        <div className="flex items-baseline justify-between px-1 mb-2">
          <h2 className="font-semibold">Recent trips</h2>
          {userTrips.length > 0 && (
            <button onClick={() => onNavigate('trips')} className="text-sm font-semibold text-route hover:underline cursor-pointer">
              See all
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className={`${panel} rounded-2xl px-6 py-8 text-center`}>
            <Route className="size-8 mx-auto text-muted" strokeWidth={1.5} />
            <p className="font-medium mt-3">No trips yet</p>
            <p className="text-sm text-muted mt-1">Your last three trips will show here.</p>
            <button onClick={onOpenAddTrip} className="mt-4 h-10 px-4 rounded-xl bg-sign hover:bg-sign-dark text-white text-sm font-bold cursor-pointer">
              Plan your first trip
            </button>
          </div>
        ) : (
          <ul className={`${panel} rounded-2xl divide-y divide-[#eceef1] dark:divide-[#262c34] overflow-hidden`}>
            {recent.map(t => {
              const open = openId === t.id;
              const money = isDriver ? Number(t.fare) || 0 : Number(t.fuel_cost) || 0;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setOpenId(open ? null : t.id)}
                    aria-expanded={open}
                    className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-[#f6f7f8] dark:hover:bg-[#20262e] cursor-pointer"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-semibold leading-snug truncate">
                        {t.origin} <span className="text-muted font-normal">to</span> {t.destination}
                      </span>
                      <span className="flex flex-wrap gap-x-3 text-[13px] text-muted mt-0.5">
                        <span>{new Date(t.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                        <span>{Number(t.distance_km).toFixed(1)} km</span>
                        {t.duration && <span>{t.duration}</span>}
                      </span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block font-sign text-lg font-extrabold leading-tight">{peso(money)}</span>
                      <span className="block text-[13px] text-muted">{isDriver ? 'fare' : 'fuel'}</span>
                    </span>
                    <ChevronDown className={`size-4 text-muted mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-muted">
                        {[t.vehicle_name !== 'Vehicle' && t.vehicle_name, t.purpose, t.notes].filter(Boolean).join('. ') || 'No details'}
                      </p>
                      <button
                        onClick={() => repeatTrip(t)}
                        className="h-9 px-3 rounded-lg border border-[#d3d8de] dark:border-[#343b45] text-sm font-semibold flex items-center gap-1.5 hover:border-ink dark:hover:border-white cursor-pointer"
                      >
                        <Repeat className="size-4" /> Log again today
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <FuelCareTipsCard vehicle={defaultVehicle} onOpenGarage={() => onNavigate('vehicles')} />
    </div>
  );
};
