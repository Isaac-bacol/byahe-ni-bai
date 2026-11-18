import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Plus, Route, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { Trip } from '../../types';
import { MAPBOX_TOKEN } from '../../lib/mapbox';

// Static Images API: one plain image per opened trip instead of a live WebGL map.
const routeImage = (t: Trip, dark: boolean) =>
  `https://api.mapbox.com/styles/v1/mapbox/${dark ? 'dark-v11' : 'streets-v12'}/static/` +
  `pin-s+2563eb(${t.origin_lng},${t.origin_lat}),pin-s+d63a2b(${t.destination_lng},${t.destination_lat})` +
  `/auto/640x280@2x?padding=56&access_token=${MAPBOX_TOKEN}`;

interface Props {
  onOpenAddTrip: () => void;
  onBack?: () => void;
}

const peso = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n || 0);

function dayLabel(d: Date): string {
  const today = new Date();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}

const panel = 'bg-white dark:bg-[#1b2027] text-ink dark:text-[#e6e9ec] border border-[#e3e6ea] dark:border-[#2a3038]';

export const TripManager: React.FC<Props> = ({ onOpenAddTrip, onBack }) => {
  const { userType, isDarkMode } = useAuth();
  const { userTrips, deleteTrip } = useData();
  const isDriver = userType === 'habal_habal' || userType === 'tricycle';

  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const week = useMemo(() => {
    const since = Date.now() - 7 * 864e5;
    const recent = userTrips.filter(t => new Date(t.date).getTime() >= since);
    return {
      count: recent.length,
      km: recent.reduce((a, t) => a + (Number(t.distance_km) || 0), 0),
      fuel: recent.reduce((a, t) => a + (Number(t.fuel_cost) || 0), 0),
      net: recent.reduce((a, t) => a + (Number(t.net_amount) || 0), 0),
    };
  }, [userTrips]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = userTrips
      .filter(t => !q || [t.origin, t.destination, t.vehicle_name, t.notes, t.purpose].some(s => s?.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const out: { label: string; trips: Trip[] }[] = [];
    for (const t of list) {
      const label = dayLabel(new Date(t.date));
      if (out[out.length - 1]?.label === label) out[out.length - 1].trips.push(t);
      else out.push({ label, trips: [t] });
    }
    return out;
  }, [userTrips, search]);

  return (
    <div className="space-y-4 pb-24 lg:pb-6 text-ink dark:text-[#e6e9ec]">
      <header className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer">
            <ArrowLeft className="size-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight flex-1">Trips</h1>
        <button
          onClick={onOpenAddTrip}
          className="h-10 px-4 rounded-xl bg-sign hover:bg-sign-dark text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sign"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Plan a trip
        </button>
      </header>

      {userTrips.length === 0 ? (
        <div className={`${panel} rounded-2xl px-6 py-12 text-center`}>
          <Route className="size-10 mx-auto text-muted" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold mt-4">No trips yet</h2>
          <p className="text-sm text-muted mt-1 max-w-xs mx-auto">
            Pick where you're going, follow the route, and the trip lands here with its distance and fuel cost.
          </p>
          <button
            onClick={onOpenAddTrip}
            className="mt-6 h-11 px-5 rounded-xl bg-sign hover:bg-sign-dark text-white font-bold cursor-pointer"
          >
            Plan your first trip
          </button>
        </div>
      ) : (
        <>
          <section className={`${panel} rounded-2xl px-5 py-4`} aria-label="Last 7 days">
            <p className="text-sm text-muted">Last 7 days</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-1">
              <p>
                <span className="font-sign text-[28px] font-extrabold leading-none">{week.km.toFixed(1)}</span>
                <span className="text-sm text-muted ml-1">km</span>
              </p>
              <p>
                <span className="font-sign text-[28px] font-extrabold leading-none">{week.count}</span>
                <span className="text-sm text-muted ml-1">{week.count === 1 ? 'trip' : 'trips'}</span>
              </p>
              <p>
                <span className="font-sign text-[28px] font-extrabold leading-none">{peso(isDriver ? week.net : week.fuel)}</span>
                <span className="text-sm text-muted ml-1">{isDriver ? 'take-home' : 'on fuel'}</span>
              </p>
            </div>
          </section>

          <label className="relative block">
            <Search className="size-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search places, vehicle or notes"
              aria-label="Search trips"
              className={`${panel} w-full h-11 pl-10 pr-3 rounded-xl text-[15px] placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-route`}
            />
          </label>

          {groups.length === 0 && <p className="text-sm text-muted px-1">No trips match "{search}".</p>}

          {groups.map(g => (
            <section key={g.label}>
              <h2 className="text-sm font-semibold text-muted px-1 mb-2">{g.label}</h2>
              <ul className={`${panel} rounded-2xl divide-y divide-[#eceef1] dark:divide-[#262c34] overflow-hidden`}>
                {g.trips.map(t => {
                  const open = openId === t.id;
                  const money = isDriver ? Number(t.net_amount) || 0 : Number(t.fuel_cost) || 0;
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => setOpenId(open ? null : t.id)}
                        aria-expanded={open}
                        className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-[#f6f7f8] dark:hover:bg-[#20262e] cursor-pointer"
                      >
                        <span className="text-[13px] text-muted w-16 shrink-0 pt-0.5 tabular-nums">
                          {new Date(t.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[15px] font-semibold leading-snug">
                            {t.origin} <span className="text-muted font-normal">to</span> {t.destination}
                          </span>
                          <span className="flex flex-wrap gap-x-3 text-[13px] text-muted mt-0.5">
                            {t.duration && <span>{t.duration}</span>}
                            {/* addTrip() stores the placeholder 'Vehicle' when the user has none */}
                            {t.vehicle_name && t.vehicle_name !== 'Vehicle' && <span>{t.vehicle_name}</span>}
                            {t.purpose && <span>{t.purpose}</span>}
                          </span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className="block font-sign text-lg font-extrabold leading-tight">{Number(t.distance_km).toFixed(1)} km</span>
                          <span className={`block text-[13px] ${isDriver && money < 0 ? 'text-pin' : 'text-muted'}`}>
                            {isDriver ? peso(money) : `${peso(money)} fuel`}
                          </span>
                        </span>
                        <ChevronDown className={`size-4 text-muted mt-1 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>

                      {open && (
                        <div className="px-4 pb-4 space-y-3">
                          {t.origin_lat != null && t.destination_lat != null && (
                            <img
                              src={routeImage(t, isDarkMode)}
                              alt={`Map from ${t.origin} to ${t.destination}`}
                              loading="lazy"
                              className="w-full aspect-[640/280] rounded-xl bg-[#eef0f2] dark:bg-[#151a20] object-cover"
                            />
                          )}
                          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <dt className="text-muted text-[13px]">Fuel</dt>
                              <dd className="font-medium">{peso(Number(t.fuel_cost) || 0)}</dd>
                            </div>
                            {isDriver && (
                              <>
                                <div>
                                  <dt className="text-muted text-[13px]">Fare</dt>
                                  <dd className="font-medium">{peso(Number(t.fare) || 0)}</dd>
                                </div>
                                <div>
                                  <dt className="text-muted text-[13px]">Passengers</dt>
                                  <dd className="font-medium">{t.passenger_count ?? 0}</dd>
                                </div>
                              </>
                            )}
                            {userType === 'tricycle' && (
                              <div>
                                <dt className="text-muted text-[13px]">Boundary</dt>
                                <dd className="font-medium">{peso(Number(t.boundary_cost) || 0)}</dd>
                              </div>
                            )}
                            {Number(t.other_expenses) > 0 && (
                              <div>
                                <dt className="text-muted text-[13px]">Other costs</dt>
                                <dd className="font-medium">{peso(Number(t.other_expenses))}</dd>
                              </div>
                            )}
                          </dl>
                          {t.notes && <p className="text-sm text-muted">{t.notes}</p>}
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this trip? This cannot be undone.')) deleteTrip(t.id);
                            }}
                            className="text-sm font-semibold text-pin hover:underline flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="size-4" /> Delete trip
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
};
