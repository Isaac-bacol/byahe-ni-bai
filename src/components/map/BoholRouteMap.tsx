import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Feature, LineString } from 'geojson';
import { useAuth } from '../../context/AuthContext';
import type { FuelStation } from '../../types';

interface Props {
  originLat?: number;
  originLng?: number;
  originName?: string;
  destLat?: number;
  destLng?: number;
  destName?: string;
  distanceKm?: number;
  duration?: string;
  fuelStations?: FuelStation[];
  showStations?: boolean;
  heightClass?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

// User-provided Mapbox Public Access Token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXlzYWFrIiwiYSI6ImNtdnl5ajZ4NDAwaGoyeXB0ZjZhbWp2azMifQ.j0IsZDEvguXfH1diiTIkvg';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Default Bohol Island coordinates [longitude, latitude]
const BOHOL_CENTER: [number, number] = [124.14, 9.835];

export const BoholRouteMap: React.FC<Props> = ({
  originLat,
  originLng,
  originName = 'Start Point',
  destLat,
  destLng,
  destName = 'Destination',
  distanceKm,
  duration,
  fuelStations = [],
  showStations = true,
  heightClass = 'h-72 md:h-96',
  onMapClick,
}) => {
  const { isDarkMode } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Markers references for cleanup
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const stationMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const mapStyle = isDarkMode
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/streets-v12';

  // Track map readiness & active style
  const isMapLoadedRef = useRef<boolean>(false);
  const currentStyleRef = useRef<string>(mapStyle);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  // Helper to create HTML marker element
  const createMarkerElement = (
    color: string,
    label: string,
    isPulse: boolean = false
  ): HTMLElement => {
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

  // Helper for fuel station marker
  const createFuelStationElement = (): HTMLElement => {
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
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.25)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
    return el;
  };

  // Clear existing markers
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

  // Render or update route line, markers, and stations
  const updateMapLayers = useCallback(async () => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;

    clearMarkers();

    const hasOrigin = originLat !== undefined && originLng !== undefined;
    const hasDest = destLat !== undefined && destLng !== undefined;

    // Origin Marker
    if (hasOrigin) {
      const el = createMarkerElement('#059669', 'A', true);
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
          <div style="font-weight: 800; color: #059669; font-size: 11px; text-transform: uppercase;">Origin / Start</div>
          <div style="font-weight: 700; margin-top: 2px;">${originName}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">[${originLat.toFixed(4)}, ${originLng.toFixed(4)}]</div>
        </div>
      `);
      originMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([originLng, originLat])
        .setPopup(popup)
        .addTo(map);
    }

    // Destination Marker
    if (hasDest) {
      const el = createMarkerElement('#e11d48', 'B', true);
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
          <div style="font-weight: 800; color: #e11d48; font-size: 11px; text-transform: uppercase;">Destination</div>
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
        const el = createFuelStationElement();
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
    const SOURCE_ID = 'route-source';
    const LAYER_ID = 'route-layer';
    const CASING_ID = 'route-casing-layer';

    if (hasOrigin && hasDest) {
      let routeCoords: [number, number][] = [];

      // Fetch road navigation path from Mapbox Directions API
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            routeCoords = data.routes[0].geometry.coordinates;
          }
        }
      } catch (err) {
        console.warn('Mapbox Directions API fallback to straight line:', err);
      }

      // Fallback straight line if network/API unavailable
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

        // Casing layer for contrast
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

        // Main colored route line
        map.addLayer({
          id: LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0284c7', // Bohol Cyan
            'line-width': 5,
            'line-opacity': 0.95,
          },
        });
      }

      // Smooth camera fit bounds to the road route
      const bounds = new mapboxgl.LngLatBounds();
      routeCoords.forEach(c => bounds.extend(c));
      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
        duration: 900,
      });
    } else {
      // Remove route layer if only 0 or 1 point
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

  // Initialize Mapbox map on mount
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

    // Add navigation controls (zoom, compass)
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left');

    // Click to pin on map
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

  // Update theme style ONLY when dark/light mode actually changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (currentStyleRef.current === mapStyle) return;

    currentStyleRef.current = mapStyle;
    map.setStyle(mapStyle);

    // Re-render route line and layers when the new style finishes loading
    const onStyleData = () => {
      isMapLoadedRef.current = true;
      updateMapLayers();
    };

    map.once('style.load', onStyleData);

    return () => {
      map.off('style.load', onStyleData);
    };
  }, [mapStyle]);

  // Update layers whenever props change
  useEffect(() => {
    if (isMapLoadedRef.current) {
      updateMapLayers();
    }
  }, [updateMapLayers]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* Floating Bohol Route Overlay Badge */}
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

      {/* Station legend indicator & Mapbox brand credit */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
        <span className="flex items-center gap-1 font-bold text-sky-700 dark:text-sky-300">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          Mapbox GL
        </span>
        <span>•</span>
        <span>Bohol Highway Route</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="text-amber-500 font-bold">⛽</span> Fuel Stations
        </span>
      </div>
    </div>
  );
};
