import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Feature, LineString } from 'geojson';

export interface FuelStationItem {
  id: string;
  name: string;
  municipality: string;
  brand: string;
  latitude: number;
  longitude: number;
}

export interface ByahiMapProps {
  originLat?: number;
  originLng?: number;
  originName?: string;
  destLat?: number;
  destLng?: number;
  destName?: string;
  distanceKm?: number;
  duration?: string;
  fuelStations?: FuelStationItem[];
  showStations?: boolean;
  heightClass?: string;
  isDarkMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

// User's verified Mapbox Public Token
export const MAPBOX_PUBLIC_TOKEN =
  'pk.eyJ1IjoiYXlzYWFrIiwiYSI6ImNtdnl5ajZ4NDAwaGoyeXB0ZjZhbWp2azMifQ.j0IsZDEvguXfH1diiTIkvg';

mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;

// Bohol Island center coordinates [lng, lat]
const BOHOL_CENTER: [number, number] = [124.14, 9.835];

export const ByahiMap: React.FC<ByahiMapProps> = ({
  originLat,
  originLng,
  originName = 'Start (Origin)',
  destLat,
  destLng,
  destName = 'Destination',
  distanceKm,
  duration,
  fuelStations = [],
  showStations = true,
  heightClass = 'h-72 md:h-96',
  isDarkMode = false,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const stationMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const isMapLoadedRef = useRef<boolean>(false);
  const mapStyle = isDarkMode
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/streets-v12';

  const currentStyleRef = useRef<string>(mapStyle);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  // Create custom HTML map pins
  const createPinElement = (color: string, label: string, isPulse = false): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative flex items-center justify-center cursor-pointer';
    wrapper.style.width = '36px';
    wrapper.style.height = '36px';

    if (isPulse) {
      const pulseRing = document.createElement('div');
      pulseRing.className = 'absolute inset-0 rounded-full animate-ping opacity-35';
      pulseRing.style.backgroundColor = color;
      wrapper.appendChild(pulseRing);
    }

    const pin = document.createElement('div');
    pin.style.cssText = `
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      border: 2px solid #ffffff;
      transition: transform 0.15s ease;
    `;

    const text = document.createElement('span');
    text.style.cssText = `
      transform: rotate(45deg);
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      font-family: system-ui, sans-serif;
    `;
    text.textContent = label;

    pin.appendChild(text);
    wrapper.appendChild(pin);

    wrapper.addEventListener('mouseenter', () => {
      pin.style.transform = 'rotate(-45deg) scale(1.15)';
    });
    wrapper.addEventListener('mouseleave', () => {
      pin.style.transform = 'rotate(-45deg) scale(1)';
    });

    return wrapper;
  };

  const createFuelIconElement = (): HTMLElement => {
    const el = document.createElement('div');
    el.style.cssText = `
      background: linear-gradient(135deg, #f59e0b, #d97706);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      border: 2px solid #ffffff;
      font-size: 10px;
      font-weight: 900;
      color: #ffffff;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      transition: transform 0.15s ease;
    `;
    el.textContent = '⛽';
    return el;
  };

  const clearMarkers = () => {
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
    stationMarkersRef.current.forEach(m => m.remove());
    stationMarkersRef.current = [];
  };

  const updateMapLayers = useCallback(async () => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;

    clearMarkers();

    const hasOrigin = originLat !== undefined && originLng !== undefined;
    const hasDest = destLat !== undefined && destLng !== undefined;

    // Origin Pin
    if (hasOrigin) {
      const el = createPinElement('#059669', 'A', true);
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
          <div style="font-weight: 800; color: #059669; font-size: 11px; text-transform: uppercase;">Origin / Start (A)</div>
          <div style="font-weight: 700; margin-top: 2px;">${originName}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">[${originLat.toFixed(4)}, ${originLng.toFixed(4)}]</div>
        </div>
      `);
      originMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([originLng, originLat])
        .setPopup(popup)
        .addTo(map);
    }

    // Destination Pin
    if (hasDest) {
      const el = createPinElement('#e11d48', 'B', true);
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
          <div style="font-weight: 800; color: #e11d48; font-size: 11px; text-transform: uppercase;">Destination (B)</div>
          <div style="font-weight: 700; margin-top: 2px;">${destName}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">[${destLat.toFixed(4)}, ${destLng.toFixed(4)}]</div>
        </div>
      `);
      destMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([destLng, destLat])
        .setPopup(popup)
        .addTo(map);
    }

    // Fuel Stations
    if (showStations && fuelStations.length > 0) {
      fuelStations.forEach(st => {
        const el = createFuelIconElement();
        const popup = new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
            <div style="font-weight: 800; color: #d97706; font-size: 10px; text-transform: uppercase;">⛽ ${st.brand} Station</div>
            <div style="font-weight: 700; margin-top: 2px;">${st.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 1px;">${st.municipality}</div>
          </div>
        `);
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([st.longitude, st.latitude])
          .setPopup(popup)
          .addTo(map);
        stationMarkersRef.current.push(marker);
      });
    }

    // Road Route Line
    const SOURCE_ID = 'byahi-route-source';
    const LAYER_ID = 'byahi-route-line';
    const CASING_ID = 'byahi-route-casing';

    if (hasOrigin && hasDest) {
      let routeCoords: [number, number][] = [];

      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&overview=full&access_token=${MAPBOX_PUBLIC_TOKEN}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            routeCoords = data.routes[0].geometry.coordinates;
          }
        }
      } catch (err) {
        console.warn('ByahiMap Directions API fallback:', err);
      }

      if (routeCoords.length === 0) {
        routeCoords = [
          [originLng, originLat],
          [(originLng + destLng) / 2, (originLat + destLat) / 2],
          [destLng, destLat],
        ];
      }

      const geojson: Feature<LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoords,
        },
      };

      if (map.getSource(SOURCE_ID)) {
        (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: CASING_ID,
          type: 'line',
          source: SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0f172a',
            'line-width': 7,
            'line-opacity': 0.35,
          },
        });

        map.addLayer({
          id: LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0284c7',
            'line-width': 5,
            'line-opacity': 0.95,
          },
        });
      }

      const bounds = new mapboxgl.LngLatBounds();
      routeCoords.forEach(c => bounds.extend(c));
      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
        duration: 900,
      });
    } else {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getLayer(CASING_ID)) map.removeLayer(CASING_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

      if (hasOrigin) {
        map.flyTo({ center: [originLng, originLat], zoom: 13, duration: 800 });
      } else if (hasDest) {
        map.flyTo({ center: [destLng, destLat], zoom: 13, duration: 800 });
      } else {
        map.flyTo({ center: BOHOL_CENTER, zoom: 9.8, duration: 600 });
      }
    }
  }, [originLat, originLng, originName, destLat, destLng, destName, showStations, fuelStations]);

  // Mount Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] =
      originLng && originLat ? [originLng, originLat] : BOHOL_CENTER;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: initialCenter,
      zoom: originLng && originLat ? 12 : 9.8,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left');

    map.on('click', e => {
      onMapClickRef.current?.(e.lngLat.lat, e.lngLat.lng);
    });

    map.on('load', () => {
      isMapLoadedRef.current = true;
      updateMapLayers();
    });

    mapRef.current = map;

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
      isMapLoadedRef.current = false;
    };
  }, []);

  // Theme style updates (safe guard against applyProjectionUpdate errors)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (currentStyleRef.current === mapStyle) return;

    currentStyleRef.current = mapStyle;
    map.setStyle(mapStyle);

    const onStyleData = () => {
      isMapLoadedRef.current = true;
      updateMapLayers();
    };

    map.once('style.load', onStyleData);
    return () => {
      map.off('style.load', onStyleData);
    };
  }, [mapStyle]);

  // Update layers on prop changes
  useEffect(() => {
    if (isMapLoadedRef.current) {
      updateMapLayers();
    }
  }, [updateMapLayers]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {distanceKm !== undefined && distanceKm > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center space-x-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Distance</span>
            <span className="font-extrabold text-sky-700 dark:text-sky-300 text-sm">{distanceKm} km</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
          {duration && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Est. Time</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{duration}</span>
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
        <span className="flex items-center gap-1 font-bold text-sky-700 dark:text-sky-300">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          ByahiMap (Mapbox GL)
        </span>
        <span>•</span>
        <span>Bohol Highway Route</span>
      </div>
    </div>
  );
};

export default ByahiMap;
