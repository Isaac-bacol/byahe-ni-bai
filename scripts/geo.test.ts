// Run: node scripts/geo.test.ts
import assert from 'node:assert/strict';
import { haversineM, bearingDeg, cumulativeM, snapToLine, formatDistance, formatDuration } from '../src/lib/geo.ts';

// Tagbilaran port -> Dao terminal is about 2.4 km in a straight line.
const d = haversineM({ lat: 9.6582, lng: 123.8475 }, { lat: 9.6644, lng: 123.8687 });
assert.ok(d > 2300 && d < 2500, `haversine ${d}`);

assert.ok(Math.abs(bearingDeg({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }) - 0) < 0.01);
assert.ok(Math.abs(bearingDeg({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) - 90) < 0.01);

// An L-shaped line: east 0.01 deg, then north 0.01 deg, near Bohol's latitude.
const line: [number, number][] = [[123.85, 9.65], [123.86, 9.65], [123.86, 9.66]];
const cum = cumulativeM(line);
assert.ok(Math.abs(cum[2] - (cum[1] * 2)) < 30, `legs roughly equal ${cum}`);

// Point just north of the middle of the first leg: about 55 m off, halfway along leg 1.
const s = snapToLine({ lat: 9.6505, lng: 123.855 }, line, cum);
assert.ok(s.offM > 50 && s.offM < 60, `off ${s.offM}`);
assert.ok(Math.abs(s.alongM - cum[1] / 2) < 5, `along ${s.alongM}`);

// Past the end snaps to the end.
const e = snapToLine({ lat: 9.67, lng: 123.86 }, line, cum);
assert.ok(Math.abs(e.alongM - cum[2]) < 1);

assert.equal(formatDistance(347), '350 m');
assert.equal(formatDistance(7240), '7.2 km');
assert.equal(formatDistance(23400), '23 km');
assert.equal(formatDuration(24 * 60), '24 min');
assert.equal(formatDuration(65 * 60), '1 h 5 min');

console.log('geo ok');
