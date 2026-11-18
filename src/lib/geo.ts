// Small geo helpers for live navigation. Points are {lat, lng}; lines are Mapbox [lng, lat] pairs.

export interface LatLng {
  lat: number;
  lng: number;
}

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineM(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a: LatLng, b: LatLng): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Cumulative distance in metres at each vertex of the line. */
export function cumulativeM(line: [number, number][]): number[] {
  const out = [0];
  for (let i = 1; i < line.length; i++) {
    out.push(out[i - 1] + haversineM({ lng: line[i - 1][0], lat: line[i - 1][1] }, { lng: line[i][0], lat: line[i][1] }));
  }
  return out;
}

/**
 * Snap a point onto the line. Returns how far it is off the line and how far along the line
 * the snapped point sits. Uses a flat projection per segment, which is accurate at road scale.
 */
export function snapToLine(p: LatLng, line: [number, number][], cum: number[]): { offM: number; alongM: number } {
  if (line.length < 2) return { offM: line.length ? haversineM(p, { lng: line[0][0], lat: line[0][1] }) : 0, alongM: 0 };
  const kx = Math.cos(rad(p.lat)) * rad(1) * R;
  const ky = rad(1) * R;
  let best = { offM: Infinity, alongM: 0 };
  for (let i = 0; i < line.length - 1; i++) {
    const ax = (line[i][0] - p.lng) * kx, ay = (line[i][1] - p.lat) * ky;
    const bx = (line[i + 1][0] - p.lng) * kx, by = (line[i + 1][1] - p.lat) * ky;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
    const off = Math.hypot(ax + t * dx, ay + t * dy);
    if (off < best.offM) best = { offM: off, alongM: cum[i] + t * (cum[i + 1] - cum[i]) };
  }
  return best;
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.max(0, Math.round(m / 10) * 10)} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}

export function formatDuration(sec: number): string {
  const min = Math.max(1, Math.round(sec / 60));
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}
