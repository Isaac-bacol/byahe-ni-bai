import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Feature, LineString, Polygon } from 'geojson';
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  ArrowUpLeft,
  ArrowUpRight,
  CornerUpLeft,
  CornerUpRight,
  Crosshair,
  Flag,
  Landmark,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RotateCw,
  Undo2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MAPBOX_TOKEN } from '../../lib/mapbox';
import { BOHOL_LANDMARKS } from '../../lib/boholData';
import { bearingDeg, cumulativeM, formatDistance, formatDuration, haversineM, snapToLine, type LatLng } from '../../lib/geo';

const BOHOL_CENTER: [number, number] = [124.14, 9.835];
const BOHOL_BBOX = '123.65,9.40,124.65,10.30';

interface Place extends LatLng {
  name: string;
  sub?: string;
}
interface Fix extends LatLng {
  accuracy: number;
  heading: number | null;
  speed: number | null;
}
interface Step {
  instruction: string;
  type: string;
  modifier?: string;
}
interface RouteInfo {
  line: [number, number][];
  cum: number[];
  lengthM: number;
  durationS: number;
  steps: Step[];
  stepStarts: number[];
  summary: string;
}
interface Draft {
  distanceKm: number;
  durationS: number;
  startedAt: number;
}
type Phase = 'plan' | 'drive' | 'finish';
type Field = 'origin' | 'dest';

// ---------- Mapbox helpers ----------

async function reverseGeocode(p: LatLng): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${p.lng},${p.lat}.json?types=poi,address,neighborhood,locality,place&limit=1&access_token=${MAPBOX_TOKEN}`
    );
    const f = (await res.json()).features?.[0];
    return f ? String(f.place_name).split(',').slice(0, 2).join(',').trim() : 'Dropped pin';
  } catch {
    return 'Dropped pin';
  }
}

async function searchPlaces(q: string, near: LatLng | null, signal: AbortSignal): Promise<Place[]> {
  const needle = q.toLowerCase();
  const local: Place[] = BOHOL_LANDMARKS.filter(
    l => l.name.toLowerCase().includes(needle) || l.municipality.toLowerCase().includes(needle)
  )
    .slice(0, 3)
    .map(l => ({ name: l.name, sub: l.municipality, lat: l.lat, lng: l.lng }));

  const prox = near ? `&proximity=${near.lng},${near.lat}` : '';
  let remote: Place[] = [];
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=PH&bbox=${BOHOL_BBOX}&types=poi,address,place,locality,neighborhood&limit=5${prox}&access_token=${MAPBOX_TOKEN}`,
      { signal }
    );
    remote = ((await res.json()).features ?? []).map((f: any) => ({
      name: f.text,
      sub: String(f.place_name).split(',').slice(1, 3).join(',').trim(),
      lng: f.center[0],
      lat: f.center[1],
    }));
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
  }
  const seen = new Set(local.map(p => p.name.toLowerCase()));
  return [...local, ...remote.filter(p => !seen.has(p.name.toLowerCase()))];
}

async function fetchRoute(from: LatLng, to: LatLng): Promise<RouteInfo> {
  const res = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&overview=full&steps=true&language=en&access_token=${MAPBOX_TOKEN}`
  );
  const json = await res.json();
  const r = json.routes?.[0];
  if (!res.ok || !r) throw new Error(json.message || 'No road route found');

  const line = r.geometry.coordinates as [number, number][];
  const cum = cumulativeM(line);
  const lengthM = cum[cum.length - 1] || r.distance;
  const raw = r.legs[0].steps as any[];
  const steps: Step[] = raw.map(s => ({ instruction: s.maneuver.instruction, type: s.maneuver.type, modifier: s.maneuver.modifier }));
  // Step distances come from Mapbox; rescale so they line up with our own measure of the geometry.
  const scale = lengthM / (r.distance || lengthM);
  let acc = 0;
  const stepStarts = raw.map(s => {
    const start = acc * scale;
    acc += s.distance;
    return start;
  });
  return { line, cum, lengthM, durationS: r.duration, steps, stepStarts, summary: r.legs[0].summary };
}

function circle(c: LatLng, m: number): Feature<Polygon> {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * 2 * Math.PI;
    pts.push([c.lng + (m * Math.cos(a)) / (111320 * Math.cos((c.lat * Math.PI) / 180)), c.lat + (m * Math.sin(a)) / 110540]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [pts] } };
}

const lineFeature = (coords: [number, number][]): Feature<LineString> => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: coords },
});

const PIN_SVG = `<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39S28 25.4 28 15.5C28 7.5 22.2 1 15 1S2 7.5 2 15.5C2 25.4 15 39 15 39z" fill="#d63a2b" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15" r="5" fill="#fff"/></svg>`;

const TurnIcon: React.FC<{ step?: Step; className?: string }> = ({ step, className }) => {
  if (!step) return <ArrowUp className={className} />;
  if (step.type === 'arrive') return <Flag className={className} />;
  if (step.type === 'roundabout' || step.type === 'rotary') return <RotateCw className={className} />;
  switch (step.modifier) {
    case 'uturn':
      return <Undo2 className={className} />;
    case 'right':
    case 'sharp right':
      return <CornerUpRight className={className} />;
    case 'slight right':
      return <ArrowUpRight className={className} />;
    case 'left':
    case 'sharp left':
      return <CornerUpLeft className={className} />;
    case 'slight left':
      return <ArrowUpLeft className={className} />;
    default:
      return <ArrowUp className={className} />;
  }
};

const peso = (n: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n || 0);
const round1 = (n: number) => Math.round(n * 10) / 10;

const panel = 'bg-white dark:bg-[#1b2027] text-ink dark:text-[#e6e9ec]';
const lift = 'shadow-[0_1px_2px_rgba(16,24,40,.12),0_10px_30px_-12px_rgba(16,24,40,.4)]';
const roundBtn = `${panel} ${lift} size-11 rounded-full grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route cursor-pointer`;

// ---------- Component ----------

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TripPlanner: React.FC<Props> = ({ isOpen, onClose }) => (isOpen ? <Planner onClose={onClose} /> : null);

const Planner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isDarkMode } = useAuth();

  const [phase, setPhase] = useState<Phase>('plan');
  const [fix, setFix] = useState<Fix | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [origin, setOrigin] = useState<Place | 'me'>('me');
  const [dest, setDest] = useState<Place | null>(null);
  const [meName, setMeName] = useState('Your location');
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [pickTarget, setPickTarget] = useState<Field>('dest');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);

  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeState, setRouteState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const [follow, setFollow] = useState(true);
  const [alongM, setAlongM] = useState(0);
  const [traveledM, setTraveledM] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [muted, setMuted] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const meMarker = useRef<mapboxgl.Marker | null>(null);
  const originMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);

  const fixRef = useRef<Fix | null>(null);
  const routeFromRef = useRef<LatLng | null>(null);
  const startedAt = useRef(0);
  const traveled = useRef(0);
  const lastPoint = useRef<Fix | null>(null);
  const heading = useRef<number | null>(null);
  const offCount = useRef(0);
  const lastReroute = useRef(0);
  const announced = useRef<{ far: number; near: number }>({ far: -1, near: -1 });
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const pickRef = useRef(pickTarget);
  pickRef.current = pickTarget;

  const speak = (text: string) => {
    if (mutedRef.current || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/(\d) m\b/g, '$1 meters').replace(/(\d) km\b/g, '$1 kilometers'));
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  // Lock page scroll and stop speech while the screen is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // ---- Live GPS from the device ----
  useEffect(() => {
    if (!window.isSecureContext) {
      setGpsError('Live location only works over a secure (https) connection.');
      return;
    }
    if (!('geolocation' in navigator)) {
      setGpsError('This browser cannot share your location.');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      pos => {
        const f: Fix = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        };
        fixRef.current = f;
        setFix(f);
        setGpsError(null);
      },
      err => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location is blocked. Allow location for this site in your browser settings, then reopen this screen.');
        } else if (!fixRef.current) {
          setGpsError('No GPS signal yet. Check that location is on, or move to an open area.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Keep the screen awake while driving (browsers stop GPS when the phone sleeps).
  useEffect(() => {
    if (phase !== 'drive' || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const grab = () => {
      if (document.visibilityState === 'visible') navigator.wakeLock.request('screen').then(l => (lock = l)).catch(() => {});
    };
    grab();
    document.addEventListener('visibilitychange', grab);
    return () => {
      document.removeEventListener('visibilitychange', grab);
      lock?.release().catch(() => {});
    };
  }, [phase]);

  // ---- Map setup ----
  useEffect(() => {
    if (!mapEl.current) return;
    // shortcut: style is picked once when the screen opens; toggling theme mid-trip keeps the old map style.
    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      center: BOHOL_CENTER,
      zoom: 9.5,
      accessToken: MAPBOX_TOKEN,
      attributionControl: false,
      logoPosition: 'top-left',
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('accuracy', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'accuracy', type: 'fill', source: 'accuracy', paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.12 } });
      map.addSource('route', { type: 'geojson', data: lineFeature([]) });
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#1946b8', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 17, 14] },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#2563eb', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 17, 10] },
      });
      setMapReady(true);
    });

    map.on('click', e => {
      if (phaseRef.current !== 'plan') return;
      const p = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      dropPin(pickRef.current, p);
    });
    map.on('dragstart', () => {
      if (phaseRef.current === 'drive') setFollow(false);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the Mapbox logo and attribution visible just under the top card/banner, clear of the bottom sheet.
  useEffect(() => {
    const c = mapRef.current?.getContainer();
    if (!c) return;
    const top = phase === 'drive' ? '176px' : '128px';
    c.querySelectorAll<HTMLElement>('.mapboxgl-ctrl-top-left, .mapboxgl-ctrl-top-right').forEach(el => (el.style.top = top));
  }, [phase, mapReady]);

  const dropPin = (field: Field, p: LatLng) => {
    const place: Place = { ...p, name: 'Dropped pin' };
    if (field === 'origin') setOrigin(place);
    else setDest(place);
    setActiveField(null);
    setPickTarget('dest');
    reverseGeocode(p).then(name => {
      const update = (cur: Place | 'me' | null) => (cur && cur !== 'me' && cur.lat === p.lat && cur.lng === p.lng ? { ...cur, name } : cur);
      if (field === 'origin') setOrigin(cur => update(cur) as Place | 'me');
      else setDest(cur => update(cur) as Place | null);
    });
  };

  // ---- Blue dot + accuracy ring ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !fix) return;
    if (!meMarker.current) {
      const el = document.createElement('div');
      el.className = 'relative size-[22px]';
      el.innerHTML =
        '<div data-cone class="absolute left-1/2 bottom-1/2 -translate-x-1/2 w-0 h-0 border-x-[10px] border-x-transparent border-b-[26px] border-b-route/35 hidden"></div>' +
        '<div class="absolute inset-0 rounded-full bg-route border-[3px] border-white shadow-[0_0_0_1px_rgba(0,0,0,.18),0_2px_6px_rgba(0,0,0,.35)]"></div>';
      meMarker.current = new mapboxgl.Marker({ element: el, rotationAlignment: 'map', pitchAlignment: 'viewport' }).setLngLat([fix.lng, fix.lat]).addTo(map);
      if (phaseRef.current === 'plan' && !dest) map.jumpTo({ center: [fix.lng, fix.lat], zoom: 15 });
    }
    meMarker.current.setLngLat([fix.lng, fix.lat]);
    (map.getSource('accuracy') as mapboxgl.GeoJSONSource | undefined)?.setData(circle(fix, fix.accuracy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fix, mapReady]);

  // ---- Origin / destination pins ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const draggable = phase === 'plan';

    if (dest) {
      if (!destMarker.current) {
        const el = document.createElement('div');
        el.innerHTML = PIN_SVG;
        el.className = 'cursor-grab';
        destMarker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom', draggable }).setLngLat([dest.lng, dest.lat]).addTo(map);
        destMarker.current.on('dragend', () => {
          const ll = destMarker.current!.getLngLat();
          dropPin('dest', { lat: ll.lat, lng: ll.lng });
        });
      }
      destMarker.current.setLngLat([dest.lng, dest.lat]).setDraggable(draggable);
    } else {
      destMarker.current?.remove();
      destMarker.current = null;
    }

    if (origin !== 'me') {
      if (!originMarker.current) {
        const el = document.createElement('div');
        el.className = 'size-4 rounded-full bg-white border-[4px] border-ink shadow-[0_1px_4px_rgba(0,0,0,.35)] cursor-grab';
        originMarker.current = new mapboxgl.Marker({ element: el, draggable }).setLngLat([origin.lng, origin.lat]).addTo(map);
        originMarker.current.on('dragend', () => {
          const ll = originMarker.current!.getLngLat();
          dropPin('origin', { lat: ll.lat, lng: ll.lng });
        });
      }
      originMarker.current.setLngLat([origin.lng, origin.lat]).setDraggable(draggable);
    } else {
      originMarker.current?.remove();
      originMarker.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, dest, phase]);

  // ---- Route while planning ----
  const hasFix = fix !== null;
  useEffect(() => {
    if (phase !== 'plan') return;
    if (!dest) {
      setRoute(null);
      setRouteState('idle');
      return;
    }
    const from: LatLng | null = origin === 'me' ? fixRef.current : origin;
    if (!from) return;
    let live = true;
    setRouteState('loading');
    routeFromRef.current = { lat: from.lat, lng: from.lng };
    fetchRoute(from, dest)
      .then(r => {
        if (!live) return;
        setRoute(r);
        setRouteState('ok');
      })
      .catch(() => {
        if (!live) return;
        setRoute(null);
        setRouteState('error');
      });
    if (origin === 'me') reverseGeocode(from).then(n => live && setMeName(n));
    return () => {
      live = false;
    };
  }, [origin, dest, hasFix, phase]);

  // Draw the route; frame it while planning.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    (map.getSource('route') as mapboxgl.GeoJSONSource).setData(lineFeature(route?.line ?? []));
    if (route && phaseRef.current === 'plan') {
      const b = new mapboxgl.LngLatBounds();
      route.line.forEach(c => b.extend(c));
      // Leave room for the panels: stacked top/bottom in portrait, a left column on short landscape screens.
      const sideways = window.matchMedia("(max-height: 500px) and (orientation: landscape)").matches;
      const padding = sideways ? { top: 56, bottom: 24, left: 400, right: 72 } : { top: 190, bottom: 250, left: 48, right: 48 };
      map.fitBounds(b, { padding, duration: 700, maxZoom: 16 });
    }
  }, [route, mapReady]);

  // ---- Search ----
  useEffect(() => {
    if (!activeField || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const ctrl = new AbortController();
    setSearching(true);
    const t = setTimeout(() => {
      searchPlaces(query.trim(), fixRef.current, ctrl.signal)
        .then(r => {
          setResults(r);
          setSearching(false);
        })
        .catch(() => {});
    }, 280);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, activeField]);

  const choose = (p: Place) => {
    if (activeField === 'origin') setOrigin(p);
    else setDest(p);
    setActiveField(null);
    setQuery('');
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const swap = () => {
    if (!dest) return;
    const me = fixRef.current;
    const newDest = origin === 'me' ? (me ? { lat: me.lat, lng: me.lng, name: meName } : null) : origin;
    setOrigin(dest);
    setDest(newDest);
  };

  // ---- Navigation ----
  const next = useMemo(() => {
    if (!route) return { idx: -1, distM: 0 };
    for (let i = 1; i < route.stepStarts.length; i++) {
      if (route.stepStarts[i] > alongM + 3) return { idx: i, distM: route.stepStarts[i] - alongM };
    }
    return { idx: route.steps.length - 1, distM: Math.max(0, route.lengthM - alongM) };
  }, [route, alongM]);

  const remainingM = route ? Math.max(0, route.lengthM - alongM) : 0;
  const remainingS = route && route.lengthM ? (remainingM / route.lengthM) * route.durationS : 0;

  const startDrive = () => {
    if (!route) return;
    startedAt.current = Date.now();
    traveled.current = 0;
    lastPoint.current = null;
    heading.current = null;
    offCount.current = 0;
    announced.current = { far: -1, near: -1 };
    setTraveledM(0);
    setAlongM(0);
    setArrived(false);
    setFollow(true);
    setActiveField(null);
    setPhase('drive');
    speak(route.steps[0]?.instruction ?? 'Starting route');
  };

  // Every GPS fix while driving: add up distance, snap to route, reroute, detect arrival, move camera.
  useEffect(() => {
    if (phase !== 'drive' || !fix || !route) return;

    // shortcut: ignores fixes worse than ±50 m and moves under ~half the accuracy, so parked jitter doesn't count as distance.
    if (fix.accuracy <= 50) {
      const last = lastPoint.current;
      if (!last) lastPoint.current = fix;
      else {
        const m = haversineM(last, fix);
        if (m >= Math.min(25, Math.max(5, fix.accuracy / 2))) {
          traveled.current += m;
          heading.current = bearingDeg(last, fix);
          lastPoint.current = fix;
          setTraveledM(traveled.current);
        }
      }
    }
    const hdg = fix.heading !== null && !Number.isNaN(fix.heading) && (fix.speed ?? 0) > 1 ? fix.heading : heading.current;

    const snap = snapToLine(fix, route.line, route.cum);
    setAlongM(snap.alongM);

    if (dest && snap.offM > Math.max(40, fix.accuracy)) {
      offCount.current += 1;
      if (offCount.current >= 3 && Date.now() - lastReroute.current > 15000) {
        lastReroute.current = Date.now();
        offCount.current = 0;
        fetchRoute(fix, dest)
          .then(r => {
            announced.current = { far: -1, near: -1 };
            setRoute(r);
            speak('Route updated.');
          })
          .catch(() => {});
      }
    } else offCount.current = 0;

    if (dest && !arrived && haversineM(fix, dest) < 40) {
      setArrived(true);
      speak('You have arrived.');
    }

    const marker = meMarker.current;
    if (marker && hdg !== null) {
      marker.setRotation(hdg);
      marker.getElement().querySelector('[data-cone]')?.classList.remove('hidden');
    }
    if (follow) {
      mapRef.current?.easeTo({ center: [fix.lng, fix.lat], bearing: hdg ?? mapRef.current.getBearing(), pitch: 50, zoom: 17, duration: 900 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fix, phase]);

  // Spoken turn prompts: once ahead of time, once at the turn.
  useEffect(() => {
    if (phase !== 'drive' || !route || next.idx < 1 || arrived) return;
    const instr = route.steps[next.idx].instruction;
    if (announced.current.far !== next.idx && next.distM > 150 && next.distM < 800) {
      announced.current.far = next.idx;
      speak(`In ${formatDistance(next.distM)}, ${instr}`);
    }
    if (announced.current.near !== next.idx && next.distM <= 60) {
      announced.current.near = next.idx;
      speak(instr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next.idx, next.distM, phase, arrived]);

  const recenter = () => {
    const map = mapRef.current;
    if (!map || !fix) return;
    if (phase === 'drive') setFollow(true);
    else map.flyTo({ center: [fix.lng, fix.lat], zoom: 16, duration: 600 });
  };

  const endDrive = () => {
    window.speechSynthesis?.cancel();
    setDraft({ distanceKm: round1(traveled.current / 1000), durationS: (Date.now() - startedAt.current) / 1000, startedAt: startedAt.current });
    setPhase('finish');
  };

  const logWithoutDriving = () => {
    if (!route) return;
    setDraft({ distanceKm: round1(route.lengthM / 1000), durationS: route.durationS, startedAt: Date.now() });
    setPhase('finish');
  };

  const originLabel = origin === 'me' ? meName : origin.name;
  const originPoint: LatLng | null = origin === 'me' ? routeFromRef.current : origin;

  const inputValue = (field: Field) =>
    activeField === field ? query : field === 'origin' ? (origin === 'me' ? 'Your location' : origin.name) : dest?.name ?? '';

  const accuracyTone = !fix ? '' : fix.accuracy <= 20 ? 'bg-sign' : fix.accuracy <= 50 ? 'bg-amber-500' : 'bg-pin';
  const speedKmh = fix?.speed != null && fix.speed >= 0 ? Math.round(fix.speed * 3.6) : null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#e8eaed] dark:bg-[#111418] font-sans text-ink dark:text-[#e6e9ec]" role="dialog" aria-label="Trip">
      {/* mapbox-gl.css forces position:relative on the map element, so size it from a wrapper */}
      <div className="absolute inset-0 z-0">
        <div ref={mapEl} className="h-full w-full" />
      </div>

      {/* ---------------- PLAN ---------------- */}
      {phase === 'plan' && (
        <>
          <div className="absolute top-0 inset-x-0 p-3 pt-[max(12px,env(safe-area-inset-top))] pointer-events-none">
            <div className="mx-auto max-w-lg short:mx-0 short:max-w-[360px] pointer-events-auto">
              <div className={`${panel} ${lift} rounded-xl flex items-stretch`}>
                <button onClick={onClose} aria-label="Close" className="px-3 grid place-items-center text-muted hover:text-ink dark:hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route rounded-l-xl">
                  <ArrowLeft className="size-5" />
                </button>

                <div className="flex-1 py-1.5 relative">
                  {/* dotted connector between the two dots */}
                  <span className="absolute left-[7px] top-[26px] bottom-[26px] border-l-2 border-dotted border-[#b8bec6]" aria-hidden="true" />
                  {(['origin', 'dest'] as Field[]).map(field => (
                    <label key={field} className="flex items-center gap-3 h-11">
                      {field === 'origin' ? (
                        origin === 'me' ? (
                          <span className="size-4 rounded-full bg-route border-[3px] border-white shadow-[0_0_0_1px_rgba(0,0,0,.2)] shrink-0" />
                        ) : (
                          <span className="size-4 rounded-full bg-white border-[4px] border-ink shrink-0" />
                        )
                      ) : (
                        <MapPin className="size-4 text-pin shrink-0" fill="currentColor" stroke="white" strokeWidth={1.5} />
                      )}
                      <input
                        value={inputValue(field)}
                        onFocus={e => {
                          setActiveField(field);
                          const cur = field === 'origin' ? (origin === 'me' ? '' : origin.name) : dest?.name ?? '';
                          setQuery(cur === 'Dropped pin' ? '' : cur);
                          requestAnimationFrame(() => e.target.select());
                        }}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Escape') {
                            setActiveField(null);
                            e.currentTarget.blur();
                          }
                          if (e.key === 'Enter' && results[0]) choose(results[0]);
                        }}
                        placeholder={field === 'origin' ? 'Starting point' : 'Where to?'}
                        aria-label={field === 'origin' ? 'Starting point' : 'Destination'}
                        className={`flex-1 min-w-0 h-10 bg-transparent text-[15px] placeholder:text-muted focus:outline-none ${
                          field === 'origin' && origin === 'me' && activeField !== 'origin' ? 'text-route font-semibold' : ''
                        } ${field === 'origin' ? 'border-b border-[#e3e6ea] dark:border-[#2c333c]' : ''}`}
                      />
                      {field === 'dest' && dest && activeField !== 'dest' && (
                        <button onClick={() => setDest(null)} aria-label="Clear destination" className="p-1.5 text-muted hover:text-ink dark:hover:text-white cursor-pointer">
                          <X className="size-4" />
                        </button>
                      )}
                    </label>
                  ))}
                </div>

                <button onClick={swap} disabled={!dest} aria-label="Swap start and destination" className="px-3 grid place-items-center text-muted hover:text-ink dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default">
                  <ArrowUpDown className="size-5" />
                </button>
              </div>

              {activeField && (
                <ul className={`${panel} ${lift} mt-2 rounded-xl py-1 max-h-[55vh] overflow-auto`}>
                  {activeField === 'origin' && (
                    <li>
                      <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setOrigin('me');
                          setActiveField(null);
                          (document.activeElement as HTMLElement | null)?.blur();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f1f3f5] dark:hover:bg-[#232931] cursor-pointer"
                      >
                        <LocateFixed className="size-5 text-route" />
                        <span className="text-[15px] font-semibold text-route">Your location</span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        setPickTarget(activeField);
                        setActiveField(null);
                        (document.activeElement as HTMLElement | null)?.blur();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f1f3f5] dark:hover:bg-[#232931] cursor-pointer"
                    >
                      <Crosshair className="size-5 text-muted" />
                      <span className="text-[15px]">Choose on map</span>
                    </button>
                  </li>
                  {searching && results.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted flex items-center gap-2">
                      <LoaderCircle className="size-4 animate-spin" /> Searching
                    </li>
                  )}
                  {!searching && query.trim().length >= 2 && results.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted">No matches in Bohol. Try another name, or choose on the map.</li>
                  )}
                  {results.map((p, i) => (
                    <li key={`${p.name}-${i}`} className="border-t border-[#eef0f2] dark:border-[#262c34]">
                      <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => choose(p)}
                        className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-[#f1f3f5] dark:hover:bg-[#232931] cursor-pointer"
                      >
                        {i < 3 && BOHOL_LANDMARKS.some(l => l.name === p.name) ? (
                          <Landmark className="size-5 text-muted mt-0.5 shrink-0" />
                        ) : (
                          <MapPin className="size-5 text-muted mt-0.5 shrink-0" />
                        )}
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium truncate">{p.name}</span>
                          {p.sub && <span className="block text-[13px] text-muted truncate">{p.sub}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {gpsError && !activeField && (
                <p className="mt-2 rounded-lg bg-[#fff4e5] dark:bg-[#3a2a12] text-[#7a4b00] dark:text-[#f6c77a] text-[13px] px-3 py-2 border border-[#f3d29b] dark:border-[#5a4320]">
                  {gpsError}
                </p>
              )}
            </div>
          </div>

          {!activeField && (
            <div className="absolute bottom-0 inset-x-0 pointer-events-none">
              <div className="mx-auto max-w-lg px-3 pb-3 flex justify-end items-center gap-2 pointer-events-auto short:absolute short:right-0 short:bottom-0">
                {fix && (
                  <span className={`${panel} ${lift} rounded-full h-8 px-3 text-xs font-medium flex items-center gap-1.5`} title="How precise your GPS position is right now">
                    <span className={`size-2 rounded-full ${accuracyTone}`} />
                    GPS ±{Math.round(fix.accuracy)} m
                  </span>
                )}
                <button onClick={recenter} disabled={!fix} aria-label="Show my location" className={`${roundBtn} disabled:opacity-40`}>
                  <LocateFixed className="size-5 text-route" />
                </button>
              </div>

              <div className={`${panel} ${lift} pointer-events-auto mx-auto max-w-lg rounded-t-2xl short:mx-0 short:ml-3 short:mb-3 short:max-w-[360px] short:rounded-2xl short:max-h-[calc(100dvh-148px)] short:overflow-y-auto px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]`}>
                {!dest && (
                  <div className="py-1">
                    <p className="text-[17px] font-semibold">
                      {pickTarget === 'origin' ? 'Tap the map to set your starting point' : 'Where are you going?'}
                    </p>
                    <p className="text-sm text-muted mt-1">Search above, or tap anywhere on the map to drop a pin. You can drag pins to adjust them.</p>
                  </div>
                )}
                {dest && pickTarget === 'origin' && <p className="text-[15px] font-semibold py-1">Tap the map to set your starting point</p>}

                {dest && pickTarget !== 'origin' && routeState === 'loading' && (
                  <p className="flex items-center gap-2 text-[15px] text-muted py-3">
                    <LoaderCircle className="size-5 animate-spin" /> Finding a route
                  </p>
                )}
                {dest && pickTarget !== 'origin' && routeState === 'idle' && origin === 'me' && !fix && (
                  <p className="text-[15px] text-muted py-3">Waiting for your GPS position to plan the route.</p>
                )}
                {dest && pickTarget !== 'origin' && routeState === 'error' && (
                  <p className="text-[15px] py-3">
                    No road route to that spot. <span className="text-muted">Try moving the pin onto or next to a road.</span>
                  </p>
                )}
                {dest && pickTarget !== 'origin' && routeState === 'ok' && route && (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="font-sign text-[34px] leading-none font-extrabold tracking-tight">{formatDuration(route.durationS)}</span>
                      <span className="font-sign text-xl font-bold text-muted">{formatDistance(route.lengthM)}</span>
                    </div>
                    <p className="text-sm text-muted mt-1.5 truncate">
                      {route.summary ? `Via ${route.summary}` : `To ${dest.name}`}, with current traffic
                    </p>
                    <button
                      onClick={startDrive}
                      disabled={!fix}
                      className="mt-4 w-full h-12 rounded-xl bg-sign hover:bg-sign-dark active:translate-y-px text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sign"
                    >
                      <ArrowUp className="size-5" strokeWidth={2.5} /> Start
                    </button>
                    {!fix && <p className="text-xs text-muted mt-2 text-center">Start needs your live GPS position.</p>}
                    <button onClick={logWithoutDriving} className="mt-2 w-full h-10 text-[14px] font-semibold text-route hover:underline cursor-pointer">
                      Log this trip without navigating
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------------- DRIVE ---------------- */}
      {phase === 'drive' && route && (
        <>
          <div className="absolute top-0 inset-x-0 p-3 pt-[max(12px,env(safe-area-inset-top))]">
            <div className="mx-auto max-w-lg short:mx-0 short:max-w-[360px]">
              {/* Guide-sign banner: green plate, white inset border, like a DPWH road sign */}
              <div className="rounded-[10px] bg-sign p-[3px] shadow-[0_8px_24px_-8px_rgba(0,60,40,.55)]" aria-live="polite">
                <div className="rounded-[8px] border-2 border-white/90 px-4 py-3 flex items-center gap-4 text-white">
                  {arrived ? <Flag className="size-11 shrink-0" strokeWidth={2.25} /> : <TurnIcon step={route.steps[next.idx]} className="size-11 shrink-0" />}
                  <div className="min-w-0">
                    {arrived ? (
                      <>
                        <p className="font-sign text-[28px] leading-none font-extrabold">You've arrived</p>
                        <p className="text-[16px] font-semibold mt-1 truncate">{dest?.name}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-sign text-[34px] leading-none font-extrabold">{formatDistance(next.distM)}</p>
                        <p className="text-[17px] font-semibold leading-snug mt-1 line-clamp-2">{route.steps[next.idx]?.instruction}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={() => setMuted(m => !m)} aria-label={muted ? 'Turn voice on' : 'Mute voice'} aria-pressed={muted} className={roundBtn}>
                  {muted ? <VolumeX className="size-5 text-muted" /> : <Volume2 className="size-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0">
            <div className="mx-auto max-w-lg px-3 pb-3 flex justify-between items-end short:absolute short:right-0 short:bottom-0 short:gap-2 short:flex-row-reverse">
              <div className={`${panel} ${lift} size-[68px] rounded-full grid place-items-center border-[3px] border-[#d9dde2] dark:border-[#333a43]`} aria-label="Current speed">
                <div className="text-center leading-none">
                  <span className="font-sign text-[26px] font-extrabold block">{speedKmh ?? '–'}</span>
                  <span className="text-[11px] text-muted">km/h</span>
                </div>
              </div>
              {!follow && (
                <button onClick={recenter} className={`${panel} ${lift} h-11 px-4 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer`}>
                  <LocateFixed className="size-4 text-route" /> Re-center
                </button>
              )}
            </div>

            <div className={`${panel} ${lift} mx-auto max-w-lg rounded-t-2xl short:mx-0 short:ml-3 short:mb-3 short:max-w-[360px] short:rounded-2xl px-5 pt-4 pb-[max(18px,env(safe-area-inset-bottom))] flex items-center gap-4`}>
              {arrived ? (
                <div className="flex-1 min-w-0">
                  <p className="font-sign text-[26px] leading-none font-extrabold">{formatDistance(traveledM)} driven</p>
                  <p className="text-[13px] text-muted mt-1">Tap Finish to save this trip.</p>
                </div>
              ) : (
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-sign text-[30px] leading-none font-extrabold text-sign dark:text-[#3fbf8a]">{formatDuration(remainingS)}</span>
                  <span className="font-sign text-lg font-bold text-muted">{formatDistance(remainingM)}</span>
                  <span className="font-sign text-lg font-bold text-muted">
                    {new Date(Date.now() + remainingS * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[13px] text-muted mt-1">Driven so far: {formatDistance(traveledM)}</p>
              </div>
              )}
              <button
                onClick={endDrive}
                className={`h-12 px-5 rounded-xl text-white font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  arrived ? 'bg-sign hover:bg-sign-dark focus-visible:ring-sign' : 'bg-pin hover:brightness-95 focus-visible:ring-pin'
                }`}
              >
                {arrived ? 'Finish' : 'End'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ---------------- FINISH ---------------- */}
      {phase === 'finish' && draft && (
        <FinishSheet
          draft={draft}
          originName={originLabel}
          destName={dest?.name ?? ''}
          originPoint={originPoint}
          destPoint={dest}
          onDiscard={onClose}
          onSaved={onClose}
        />
      )}
    </div>
  );
};

// ---------- Save form ----------

const PURPOSES: Record<string, string[]> = {
  motorist: ['Work', 'Errand', 'School', 'Personal'],
  habal_habal: ['Passenger', 'Delivery', 'Personal'],
  tricycle: ['Passenger', 'Delivery', 'Personal'],
  admin: ['Work', 'Inspection', 'Personal'],
};

const field = 'w-full h-11 rounded-lg border border-[#d3d8de] dark:border-[#343b45] bg-white dark:bg-[#151a20] px-3 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-route';

const FinishSheet: React.FC<{
  draft: Draft;
  originName: string;
  destName: string;
  originPoint: LatLng | null;
  destPoint: LatLng | null;
  onDiscard: () => void;
  onSaved: () => void;
}> = ({ draft, originName, destName, originPoint, destPoint, onDiscard, onSaved }) => {
  const { userType } = useAuth();
  const { userVehicles, defaultVehicle, fuelPrices, addTrip } = useData();
  const type = userType ?? 'motorist';
  const isDriver = type === 'habal_habal' || type === 'tricycle';

  const [from, setFrom] = useState(originName);
  const [to, setTo] = useState(destName);
  const [km, setKm] = useState(String(draft.distanceKm));
  const [when, setWhen] = useState(() => {
    const d = new Date(draft.startedAt);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [vehicleId, setVehicleId] = useState(defaultVehicle?.id ?? userVehicles[0]?.id ?? '');
  const [purpose, setPurpose] = useState(PURPOSES[type][0]);
  const [fare, setFare] = useState('');
  const [passengers, setPassengers] = useState(isDriver ? '1' : '0');
  const [boundary, setBoundary] = useState('');
  const [other, setOther] = useState('');
  const [notes, setNotes] = useState('');

  const vehicle = userVehicles.find(v => v.id === vehicleId) ?? defaultVehicle;
  const fuelType = vehicle?.fuel_type ?? 'Gasoline';
  const pricePerL =
    fuelPrices.find(p => p.fuel_type === fuelType)?.price_per_liter ?? (fuelType === 'Diesel' ? 58.9 : fuelType === 'Premium 95' ? 66.5 : 63.85);
  const kmPerL = vehicle?.fuel_efficiency_km_per_l || (type === 'tricycle' ? 28 : 40);
  const liters = (Number(km) || 0) / kmPerL;
  const autoFuel = Math.round(liters * pricePerL * 100) / 100;
  const [fuelOverride, setFuelOverride] = useState<string | null>(null);
  const fuel = fuelOverride !== null ? Number(fuelOverride) || 0 : autoFuel;

  const net = (Number(fare) || 0) - (fuel + (Number(boundary) || 0) + (Number(other) || 0));
  const canSave = from.trim() && to.trim() && Number(km) >= 0;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    addTrip({
      date: new Date(when).toISOString(),
      origin: from.trim(),
      destination: to.trim(),
      origin_lat: originPoint?.lat,
      origin_lng: originPoint?.lng,
      destination_lat: destPoint?.lat,
      destination_lng: destPoint?.lng,
      distance_km: round1(Number(km) || 0),
      duration: formatDuration(draft.durationS),
      vehicle_id: vehicle?.id,
      vehicle_name: vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined,
      purpose,
      passenger_count: Number(passengers) || 0,
      fare: Number(fare) || 0,
      fuel_cost: fuel,
      boundary_cost: Number(boundary) || 0,
      other_expenses: Number(other) || 0,
      net_amount: net,
      notes: notes.trim(),
    });
    onSaved();
  };

  return (
    <div className="absolute inset-0 bg-black/30 flex items-end sm:items-center justify-center">
      <form onSubmit={save} className={`${panel} w-full max-w-lg max-h-[92vh] overflow-auto rounded-t-2xl sm:rounded-2xl shadow-2xl`}>
        <div className="px-5 pt-5 pb-4 border-b border-[#e6e9ec] dark:border-[#2a3038]">
          <h2 className="text-xl font-bold">Save trip</h2>
          <p className="text-sm text-muted mt-0.5">
            {formatDuration(draft.durationS)} on the road. Check the details, then save.
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <label className="block">
              <span className="text-[13px] font-medium text-muted">From</span>
              <input className={`${field} mt-1`} value={from} onChange={e => setFrom(e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium text-muted">To</span>
              <input className={`${field} mt-1`} value={to} onChange={e => setTo(e.target.value)} required />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] font-medium text-muted">Distance (km)</span>
              <input className={`${field} mt-1 font-sign font-bold`} type="number" inputMode="decimal" min="0" step="0.1" value={km} onChange={e => setKm(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium text-muted">Started</span>
              <input className={`${field} mt-1`} type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
            </label>
          </div>

          {userVehicles.length > 0 && (
            <label className="block">
              <span className="text-[13px] font-medium text-muted">Vehicle</span>
              <select className={`${field} mt-1`} value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
                {userVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model}
                    {v.plate_number ? ` (${v.plate_number})` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          <fieldset>
            <legend className="text-[13px] font-medium text-muted">Purpose</legend>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {PURPOSES[type].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  aria-pressed={purpose === p}
                  className={`h-9 px-3.5 rounded-full text-sm font-medium border cursor-pointer ${
                    purpose === p
                      ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white'
                      : 'border-[#d3d8de] dark:border-[#3a414b] hover:border-ink dark:hover:border-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-[13px] font-medium text-muted">Fuel cost (₱)</span>
            <input
              className={`${field} mt-1`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={fuelOverride ?? autoFuel.toFixed(2)}
              onChange={e => setFuelOverride(e.target.value)}
            />
            <span className="block text-xs text-muted mt-1">
              {fuelOverride === null
                ? `Estimated: ${liters.toFixed(2)} L of ${fuelType} at ${peso(pricePerL)}/L (${kmPerL} km/L)`
                : 'Edited by you'}
            </span>
          </label>

          {isDriver && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[13px] font-medium text-muted">Fare collected (₱)</span>
                <input className={`${field} mt-1`} type="number" inputMode="decimal" min="0" value={fare} onChange={e => setFare(e.target.value)} placeholder="0" />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-muted">Passengers</span>
                <input className={`${field} mt-1`} type="number" inputMode="numeric" min="0" value={passengers} onChange={e => setPassengers(e.target.value)} />
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {type === 'tricycle' && (
              <label className="block">
                <span className="text-[13px] font-medium text-muted">Boundary (₱)</span>
                <input className={`${field} mt-1`} type="number" inputMode="decimal" min="0" value={boundary} onChange={e => setBoundary(e.target.value)} placeholder="0" />
              </label>
            )}
            <label className={`block ${type === 'tricycle' ? '' : 'col-span-2'}`}>
              <span className="text-[13px] font-medium text-muted">Other costs (₱)</span>
              <input className={`${field} mt-1`} type="number" inputMode="decimal" min="0" value={other} onChange={e => setOther(e.target.value)} placeholder="Parking, toll, food" />
            </label>
          </div>

          <label className="block">
            <span className="text-[13px] font-medium text-muted">Notes</span>
            <textarea className={`${field} mt-1 h-auto py-2`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </label>

          {isDriver && (
            <div className="flex items-baseline justify-between rounded-lg bg-[#f3f5f4] dark:bg-[#151a20] px-4 py-3">
              <span className="text-sm font-medium">Take-home for this trip</span>
              <span className={`font-sign text-2xl font-extrabold ${net < 0 ? 'text-pin' : 'text-sign dark:text-[#3fbf8a]'}`}>{peso(net)}</span>
            </div>
          )}
        </div>

        <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-1 flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Discard this trip? It will not be saved.')) onDiscard();
            }}
            className="h-12 px-5 rounded-xl font-semibold text-muted hover:text-ink dark:hover:text-white border border-[#d3d8de] dark:border-[#343b45] cursor-pointer"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="flex-1 h-12 rounded-xl bg-sign hover:bg-sign-dark text-white font-bold disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sign"
          >
            Save trip
          </button>
        </div>
      </form>
    </div>
  );
};
