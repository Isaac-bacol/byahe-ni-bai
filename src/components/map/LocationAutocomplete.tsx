import React, { useState, useRef, useEffect, useTransition } from 'react';
import { MapPin, Navigation, Building2, Anchor, Palmtree, Search, Loader2 } from 'lucide-react';
import { BOHOL_LANDMARKS, BOHOL_MUNICIPALITIES, BOHOL_MUNICIPALITY_COORDINATES } from '../../lib/boholData';

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  required?: boolean;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXlzYWFrIiwiYSI6ImNtdnl5ajZ4NDAwaGoyeXB0ZjZhbWp2azMifQ.j0IsZDEvguXfH1diiTIkvg';

export const LocationAutocomplete: React.FC<Props> = ({
  label,
  value,
  placeholder = 'Search municipality, barangay, port, terminal, hotel...',
  onChange,
  required = false,
}) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [mapboxResults, setMapboxResults] = useState<MapboxFeature[]>([]);
  const [isSearchingMapbox, setIsSearchingMapbox] = useState(false);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mapbox Live Geocoding for Bohol places
  useEffect(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setMapboxResults([]);
      setIsSearchingMapbox(false);
      return;
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      setIsSearchingMapbox(true);
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmed
        )}.json?country=PH&bbox=123.65,9.40,124.65,10.30&types=address,poi,place,neighborhood,locality&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          startTransition(() => {
            setMapboxResults(data.features || []);
          });
        }
      } catch (err) {
        console.warn('Mapbox location search warning:', err);
      } finally {
        setIsSearchingMapbox(false);
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const filteredLandmarks =
    query.trim() === ''
      ? BOHOL_LANDMARKS.slice(0, 5)
      : BOHOL_LANDMARKS.filter(
          l =>
            l.name.toLowerCase().includes(query.toLowerCase()) ||
            l.municipality.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

  const filteredMunicipalities =
    query.trim() === ''
      ? ['Tagbilaran City', 'Panglao', 'Dauis', 'Tubigon', 'Carmen', 'Jagna']
      : BOHOL_MUNICIPALITIES.filter(m =>
          m.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);

  const handleSelect = (name: string, coords?: { lat: number; lng: number }) => {
    setQuery(name);
    onChange(name, coords);
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'port':
        return <Anchor className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'terminal':
        return <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'tourist':
        return <Palmtree className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          required={required}
          onChange={e => {
            const val = e.target.value;
            setQuery(val);
            onChange(val);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow shadow-xs font-medium"
        />
        <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5 pointer-events-none" />

        {isSearchingMapbox && (
          <Loader2 className="w-4 h-4 text-sky-600 animate-spin absolute right-3 top-3.5 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-80 overflow-y-auto">
          {/* Live Mapbox Geocoding Search Results */}
          {mapboxResults.length > 0 && (
            <div>
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-sky-50/80 dark:bg-sky-950/60 text-[10px] font-extrabold tracking-wider uppercase text-sky-800 dark:text-sky-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3 h-3" /> Mapbox Bohol Real Places
                </span>
                <span className="text-[9px] text-sky-600 font-normal">Exact GPS coords</span>
              </div>
              {mapboxResults.map(item => {
                const shortName = item.text || item.place_name.split(',')[0];
                const subtitle = item.place_name.split(',').slice(1, 3).join(', ').trim();
                const coords = { lat: item.center[1], lng: item.center[0] };

                return (
                  <button
                    type="button"
                    key={`mb-${item.id}`}
                    onClick={() => handleSelect(shortName, coords)}
                    className="w-full text-left px-3 py-2.5 hover:bg-sky-50/80 dark:hover:bg-sky-950/50 flex items-start space-x-2.5 transition-colors group cursor-pointer border-b border-slate-100/60 dark:border-slate-800/60"
                  >
                    <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 mt-0.5 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-300">
                        {shortName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {subtitle || 'Bohol, Philippines'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Bohol Landmarks */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] font-extrabold tracking-wider uppercase text-slate-600 dark:text-slate-300">
            Key Bohol Hubs, Ports & Terminals
          </div>
          {filteredLandmarks.map((item, idx) => (
            <button
              type="button"
              key={`lm-${idx}`}
              onClick={() => handleSelect(item.name, { lat: item.lat, lng: item.lng })}
              className="w-full text-left px-3 py-2 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 flex items-center space-x-2.5 transition-colors group cursor-pointer border-b border-slate-100/50 dark:border-slate-800/50"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {item.municipality} • {item.description}
                </p>
              </div>
            </button>
          ))}

          {/* Municipalities with verified coordinates */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] font-extrabold tracking-wider uppercase text-slate-600 dark:text-slate-300">
            Bohol Municipalities (48 Towns)
          </div>
          <div className="divide-y divide-slate-100/60 dark:divide-slate-800/60">
            {filteredMunicipalities.map((muni, idx) => {
              const coords = BOHOL_MUNICIPALITY_COORDINATES[muni];
              return (
                <button
                  type="button"
                  key={`muni-${idx}`}
                  onClick={() => handleSelect(muni, coords)}
                  className="w-full text-left px-3 py-2 hover:bg-sky-50 dark:hover:bg-sky-950/50 flex items-center justify-between transition-colors cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{muni}</span>
                    <span className="text-[11px] text-slate-400">Bohol</span>
                  </div>
                  {coords && (
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      [{coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}]
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
