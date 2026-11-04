import type { BoholLocation, FuelPriceRecord, FuelStation } from '../types';

export const BOHOL_MUNICIPALITIES: string[] = [
  'Tagbilaran City',
  'Alburquerque',
  'Alicia',
  'Anda',
  'Antequera',
  'Baclayon',
  'Balilihan',
  'Batuan',
  'Bien Unido',
  'Bilar',
  'Buenavista',
  'Calape',
  'Candijay',
  'Carmen',
  'Catigbian',
  'Clarin',
  'Corella',
  'Cortes',
  'Dagohoy',
  'Danao',
  'Dauis',
  'Dimiao',
  'Duero',
  'Garcia Hernandez',
  'Getafe',
  'Guindulman',
  'Inabanga',
  'Jagna',
  'Lila',
  'Loay',
  'Loboc',
  'Loon',
  'Mabini',
  'Maribojoc',
  'Panglao',
  'Pilar',
  'Pres. Carlos P. Garcia',
  'Sagbayan',
  'San Isidro',
  'San Miguel',
  'Sevilla',
  'Sierra Bullones',
  'Sikatuna',
  'Talibon',
  'Trinidad',
  'Tubigon',
  'Ubay',
  'Valencia'
];

export const BOHOL_LANDMARKS: BoholLocation[] = [
  // Terminals & Ports
  { name: 'Tagbilaran City Sea Port', municipality: 'Tagbilaran City', type: 'port', lat: 9.6582, lng: 123.8475, description: 'Fastcraft & ferry terminal to Cebu & Dumaguete' },
  { name: 'Dao Integrated Bus Terminal (Dao)', municipality: 'Tagbilaran City', type: 'terminal', lat: 9.6644, lng: 123.8687, description: 'Main bus & V-Hire transit hub of Bohol' },
  { name: 'Tubigon Commercial Port', municipality: 'Tubigon', type: 'port', lat: 9.9547, lng: 123.9575, description: 'Fast gateway between Bohol and Cebu City' },
  { name: 'Jagna Port', municipality: 'Jagna', type: 'port', lat: 9.6508, lng: 124.3688, description: 'Ferry terminal connecting Bohol to Camiguin & Mindanao' },
  { name: 'Bohol-Panglao International Airport (BIA)', municipality: 'Panglao', type: 'terminal', lat: 9.5695, lng: 123.7745, description: 'Eco-airport serving domestic and international flights' },
  { name: 'Getafe Ferry Port', municipality: 'Getafe', type: 'port', lat: 10.1539, lng: 124.1542, description: 'Northern gateway connecting to Cordova/Cebu' },
  { name: 'Ubay Municipal Port', municipality: 'Ubay', type: 'port', lat: 10.0592, lng: 124.4754, description: 'Northeastern port to Leyte' },

  // Commercial Malls & Town Centers
  { name: 'Island City Mall (ICM)', municipality: 'Tagbilaran City', type: 'mall', lat: 9.6631, lng: 123.8672, description: 'Major shopping mall & supermarket in Dao' },
  { name: 'BQ Mall (Bohol Quality)', municipality: 'Tagbilaran City', type: 'mall', lat: 9.6465, lng: 123.8540, description: 'Downtown shopping & business center' },
  { name: 'Alturas Mall Tagbilaran', municipality: 'Tagbilaran City', type: 'mall', lat: 9.6438, lng: 123.8532, description: 'Poblacion 2 commercial center' },

  // Famous Tourist Spots & Recreation
  { name: 'Chocolate Hills Complex', municipality: 'Carmen', type: 'tourist', lat: 9.8315, lng: 124.1685, description: 'Iconic world-famous Bohol geological hills' },
  { name: 'Loboc River Cruise & Floating Restaurant', municipality: 'Loboc', type: 'tourist', lat: 9.6385, lng: 124.0322, description: 'Scenic river cruise and dining' },
  { name: 'Alona Beach', municipality: 'Panglao', type: 'tourist', lat: 9.5492, lng: 123.7725, description: 'White sand tourist & nightlife destination' },
  { name: 'Hinagdanan Cave', municipality: 'Dauis', type: 'tourist', lat: 9.6231, lng: 123.8016, description: 'Natural karst cave with underground pool' },
  { name: 'Bohol Tarsier Sanctuary', municipality: 'Corella', type: 'tourist', lat: 9.6922, lng: 123.9542, description: 'Sanctuary for Philippine Tarsiers' },
  { name: 'Bilar Man-Made Forest', municipality: 'Bilar', type: 'tourist', lat: 9.6894, lng: 124.1167, description: 'Dense mahogany canopy along the highway' },
  { name: 'Baclayon Church & Museum', municipality: 'Baclayon', type: 'tourist', lat: 9.6224, lng: 123.9133, description: 'One of the oldest stone churches in the Philippines' },
  { name: 'Danao Adventure Park', municipality: 'Danao', type: 'tourist', lat: 9.9472, lng: 124.2015, description: 'Extreme sports, plunge & eco-tourism park' },
  { name: 'Anda White Sand Beach', municipality: 'Anda', type: 'tourist', lat: 9.7428, lng: 124.5772, description: 'Pristine eastern beach destination' }
];

export const INITIAL_FUEL_STATIONS: FuelStation[] = [
  { id: 'fs-1', name: 'Petron Tagbilaran North', municipality: 'Tagbilaran City', brand: 'Petron', latitude: 9.6610, longitude: 123.8610, is_active: true },
  { id: 'fs-2', name: 'Shell CPG Avenue', municipality: 'Tagbilaran City', brand: 'Shell', latitude: 9.6480, longitude: 123.8560, is_active: true },
  { id: 'fs-3', name: 'Caltex Dao Terminal', municipality: 'Tagbilaran City', brand: 'Caltex', latitude: 9.6650, longitude: 123.8690, is_active: true },
  { id: 'fs-4', name: 'Phoenix Petroleum Panglao', municipality: 'Panglao', brand: 'Phoenix', latitude: 9.5610, longitude: 123.7780, is_active: true },
  { id: 'fs-5', name: 'Seaoil Dauis Highway', municipality: 'Dauis', brand: 'Seaoil', latitude: 9.6300, longitude: 123.8200, is_active: true },
  { id: 'fs-6', name: 'Petron Tubigon Wharf Road', municipality: 'Tubigon', brand: 'Petron', latitude: 9.9510, longitude: 123.9600, is_active: true },
  { id: 'fs-7', name: 'Caltex Carmen Centro', municipality: 'Carmen', brand: 'Caltex', latitude: 9.8250, longitude: 124.1950, is_active: true },
  { id: 'fs-8', name: 'Shell Jagna Portside', municipality: 'Jagna', brand: 'Shell', latitude: 9.6520, longitude: 124.3700, is_active: true },
  { id: 'fs-9', name: 'Cleanfuel Ubay Poblacion', municipality: 'Ubay', brand: 'Cleanfuel', latitude: 10.0570, longitude: 124.4720, is_active: true },
  { id: 'fs-10', name: 'Phoenix Talibon Bypass', municipality: 'Talibon', brand: 'Phoenix', latitude: 10.1480, longitude: 124.3310, is_active: true },
  { id: 'fs-11', name: 'Petron Loon National Road', municipality: 'Loon', brand: 'Petron', latitude: 9.7990, longitude: 123.7920, is_active: true },
  { id: 'fs-12', name: 'Shell Panglao Airport Road', municipality: 'Panglao', brand: 'Shell', latitude: 9.5750, longitude: 123.7810, is_active: true },
  { id: 'fs-13', name: 'Seaoil Tubigon Junction', municipality: 'Tubigon', brand: 'Seaoil', latitude: 9.9480, longitude: 123.9550, is_active: true },
  { id: 'fs-14', name: 'Petron Tagbilaran Port Area', municipality: 'Tagbilaran City', brand: 'Petron', latitude: 9.6550, longitude: 123.8500, is_active: true }
];

export const INITIAL_FUEL_PRICES: FuelPriceRecord[] = [
  {
    id: 'bm-gasoline',
    station_name: 'FuelWatch PH (Bohol Live Feed)',
    municipality: 'Province of Bohol',
    fuel_type: 'Gasoline',
    price_per_liter: 63.85,
    date_recorded: '2026-09-20T08:00:00Z',
    recorded_by: 'FuelWatch PH Live Feed'
  },
  {
    id: 'bm-diesel',
    station_name: 'FuelWatch PH (Bohol Live Feed)',
    municipality: 'Province of Bohol',
    fuel_type: 'Diesel',
    price_per_liter: 58.90,
    date_recorded: '2026-09-20T08:00:00Z',
    recorded_by: 'FuelWatch PH Live Feed'
  },
  {
    id: 'bm-premium',
    station_name: 'FuelWatch PH (Bohol Live Feed)',
    municipality: 'Province of Bohol',
    fuel_type: 'Premium 95',
    price_per_liter: 66.50,
    date_recorded: '2026-09-20T08:00:00Z',
    recorded_by: 'FuelWatch PH Live Feed'
  },
  {
    id: 'bm-regular',
    station_name: 'FuelWatch PH (Bohol Live Feed)',
    municipality: 'Province of Bohol',
    fuel_type: 'Regular',
    price_per_liter: 62.40,
    date_recorded: '2026-09-20T08:00:00Z',
    recorded_by: 'FuelWatch PH Live Feed'
  }
];

export const BOHOL_ADVISORIES = [
  {
    id: 'adv-1',
    type: 'alert' as const,
    badgeText: 'ALERT',
    date: 'Sep 22, 2026 (Upcoming Tuesday)',
    title: 'Gasoline up ~₱1.80/L, diesel up ~₱2.20/L next Tuesday in Bohol',
    summary: 'Gasoline up ~₱1.80/L, diesel up ~₱2.20/L next Tuesday in Bohol',
    content: `Pump prices across Bohol (Tagbilaran City, Tubigon, Jagna, Ubay, Panglao, Carmen, and all 48 municipalities) are projected to increase at 6:00 AM this coming Tuesday, following global Mean of Platts Singapore (MOPS) trading and DOE weekly advisories.\n\nProjected Bohol pump price adjustments:\n• Gasoline (Unleaded): +₱1.60 to +₱1.85 / Liter\n• Diesel: +₱2.10 to +₱2.30 / Liter\n• Premium 95: +₱1.75 to +₱1.95 / Liter\n• Kerosene: +₱1.90 to +₱2.10 / Liter\n\nShell, Petron, Caltex, Seaoil, Phoenix, and Cleanfuel stations in Bohol will implement these adjustments early Tuesday.\n\nDriver Advisory:\nHabal-Habal drivers, Tricycle TODA operators, and daily commuters are strongly advised to fill up their tanks before Monday midnight or 6:00 AM Tuesday to save on operational expenses and maximize daily boundary take-home pay.`,
    actionLabel: 'Compare Current Bohol Prices',
    actionTab: 'compare'
  },
  {
    id: 'adv-2',
    type: 'update' as const,
    badgeText: 'UPDATE',
    date: 'Sep 18, 2026',
    title: 'Bohol Fuel Price Comparison & Weekly History',
    summary: 'Bohol Fuel Price Comparison & Weekly History now live!',
    content: `See weekly average diesel, gasoline, and premium pump rates for every major brand across Bohol's 48 municipalities. Tap "Price Compare" in the menu to inspect live price differentials across Petron, Shell, Caltex, Phoenix, Seaoil, and Cleanfuel. Find who offers the cheapest gasoline or diesel in your district and track price trends updated weekly.`,
    actionLabel: 'Open Price Comparison',
    actionTab: 'compare'
  },
  {
    id: 'adv-3',
    type: 'update' as const,
    badgeText: 'UPDATE',
    date: 'Sep 12, 2026',
    title: 'Fuel Cost Calculator — estimate your fill-up cost instantly!',
    summary: 'Fuel Cost Calculator — estimate your fill-up cost instantly!',
    content: `Tap "Calculate Cost" on the Price Comparison tab to estimate your fill-up cost instantly! Pick your fuel type, enter your vehicle's liters or choose a quick preset (Motorcycle 4L, Habal-Habal 7L, Tricycle 12L, Car 35L), and get an instant total. It highlights the cheapest station option so you know exactly how many pesos you save on each fill-up.`,
    actionLabel: 'Calculate Fill-up Cost',
    actionTab: 'compare'
  },
  {
    id: 'adv-4',
    type: 'update' as const,
    badgeText: 'UPDATE',
    date: 'Sep 05, 2026',
    title: 'Flag a Station When Fuel Runs Out!',
    summary: 'Flag a Station When Fuel Runs Out in your Municipality!',
    content: `Community alerts for Bohol drivers: report when local pumps run dry during bad weather or delayed fuel barge shipments arriving from Cebu to Tubigon and Tagbilaran ports. Flagged stations notify fellow motorists in real-time so nobody gets stranded with an empty tank.`,
    actionLabel: 'View Station Directory',
    actionTab: 'fuel'
  }
];


export function calculateBoholDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;

  const roadDistance = straightLineDistance * 1.25;
  return Math.round(roadDistance * 10) / 10;
}

export function estimateTravelTime(distanceKm: number, vehicleType: 'motorcycle' | 'tricycle' | '4wheel' = 'motorcycle'): string {
  let avgSpeed = 42;
  if (vehicleType === 'tricycle') avgSpeed = 30;
  if (vehicleType === '4wheel') avgSpeed = 45;

  const hours = distanceKm / avgSpeed;
  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 60) {
    return `${Math.max(5, totalMinutes)} min`;
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export const BOHOL_MUNICIPALITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Tagbilaran City': { lat: 9.6465, lng: 123.8540 },
  'Alburquerque': { lat: 9.6106, lng: 123.9575 },
  'Alicia': { lat: 9.8978, lng: 124.4422 },
  'Anda': { lat: 9.7428, lng: 124.5772 },
  'Antequera': { lat: 9.7806, lng: 123.9000 },
  'Baclayon': { lat: 9.6224, lng: 123.9133 },
  'Balilihan': { lat: 9.7547, lng: 123.9722 },
  'Batuan': { lat: 9.7917, lng: 124.1486 },
  'Bien Unido': { lat: 10.1333, lng: 124.3833 },
  'Bilar': { lat: 9.7153, lng: 124.1167 },
  'Buenavista': { lat: 10.0833, lng: 124.1167 },
  'Calape': { lat: 9.8906, lng: 123.8731 },
  'Candijay': { lat: 9.8167, lng: 124.5500 },
  'Carmen': { lat: 9.8247, lng: 124.1956 },
  'Catigbian': { lat: 9.8500, lng: 124.0333 },
  'Clarin': { lat: 9.9667, lng: 124.0167 },
  'Corella': { lat: 9.6908, lng: 123.9214 },
  'Cortes': { lat: 9.7167, lng: 123.8833 },
  'Dagohoy': { lat: 9.9333, lng: 124.2500 },
  'Danao': { lat: 9.9500, lng: 124.2000 },
  'Dauis': { lat: 9.6281, lng: 123.8647 },
  'Dimiao': { lat: 9.6053, lng: 124.1564 },
  'Duero': { lat: 9.6833, lng: 124.4167 },
  'Garcia Hernandez': { lat: 9.6167, lng: 124.2833 },
  'Getafe': { lat: 10.1500, lng: 124.1500 },
  'Guindulman': { lat: 9.7500, lng: 124.4833 },
  'Inabanga': { lat: 10.0333, lng: 124.0667 },
  'Jagna': { lat: 9.6508, lng: 124.3688 },
  'Lila': { lat: 9.5939, lng: 124.1000 },
  'Loay': { lat: 9.6000, lng: 124.0167 },
  'Loboc': { lat: 9.6385, lng: 124.0322 },
  'Loon': { lat: 9.7986, lng: 123.7931 },
  'Mabini': { lat: 9.8667, lng: 124.5167 },
  'Maribojoc': { lat: 9.7431, lng: 123.8406 },
  'Panglao': { lat: 9.5786, lng: 123.7500 },
  'Pilar': { lat: 9.8167, lng: 124.3167 },
  'Pres. Carlos P. Garcia': { lat: 10.1167, lng: 124.5667 },
  'Sagbayan': { lat: 9.9167, lng: 124.1000 },
  'San Isidro': { lat: 9.8833, lng: 123.9500 },
  'San Miguel': { lat: 9.9833, lng: 124.3333 },
  'Sevilla': { lat: 9.7000, lng: 124.0333 },
  'Sierra Bullones': { lat: 9.7833, lng: 124.3000 },
  'Sikatuna': { lat: 9.6833, lng: 123.9667 },
  'Talibon': { lat: 10.1480, lng: 124.3310 },
  'Trinidad': { lat: 10.0833, lng: 124.3333 },
  'Tubigon': { lat: 9.9547, lng: 123.9575 },
  'Ubay': { lat: 10.0592, lng: 124.4754 },
  'Valencia': { lat: 9.6108, lng: 124.2100 },
};

export function isWithinBohol(lat: number, lng: number): boolean {
  return lat >= 9.40 && lat <= 10.30 && lng >= 123.65 && lng <= 124.65;
}

export function findBoholCoordinates(query: string): { lat: number; lng: number } | null {
  const cleanQuery = query.toLowerCase().trim();

  // 1. Direct landmark match
  const landmark = BOHOL_LANDMARKS.find(
    l => l.name.toLowerCase().includes(cleanQuery) || cleanQuery.includes(l.name.toLowerCase())
  );
  if (landmark) return { lat: landmark.lat, lng: landmark.lng };

  // 2. Direct fuel station match
  const station = INITIAL_FUEL_STATIONS.find(
    s => s.name.toLowerCase().includes(cleanQuery) || cleanQuery.includes(s.name.toLowerCase())
  );
  if (station) return { lat: station.latitude, lng: station.longitude };

  // 3. Match any of the 48 Bohol municipalities
  for (const [muni, coords] of Object.entries(BOHOL_MUNICIPALITY_COORDINATES)) {
    const cleanMuni = muni.toLowerCase();
    if (cleanQuery.includes(cleanMuni) || cleanMuni.includes(cleanQuery)) {
      return coords;
    }
  }

  return null;
}
