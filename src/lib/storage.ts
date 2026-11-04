import type { Allowance, FuelPurchase, Trip, UserProfile, Vehicle } from '../types';
import { INITIAL_FUEL_PRICES, INITIAL_FUEL_STATIONS } from './boholData';

const STORAGE_KEYS = {
  USERS: 'byahe_users',
  ACTIVE_USER_ID: 'byahe_active_user_id',
  VEHICLES: 'byahe_vehicles',
  TRIPS: 'byahe_trips',
  ALLOWANCES: 'byahe_allowances',
  FUEL_PURCHASES: 'byahe_fuel_purchases',
  FUEL_STATIONS: 'byahe_fuel_stations',
  FUEL_PRICES: 'byahe_fuel_prices',
};

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user-motorist-1',
    name: 'Lance Bacol',
    email: 'lance.motorist@bohol.ph',
    user_type: 'motorist',
    role: 'user',
    phone_number: '0917-123-4567',
    municipality: 'Tagbilaran City',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00Z',
    terms_accepted_at: '2026-09-01T08:00:00Z',
    privacy_accepted_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'user-habal-1',
    name: 'Kuya Jun (Habal-Habal)',
    email: 'jun.habal@bohol.ph',
    user_type: 'habal_habal',
    role: 'user',
    phone_number: '0928-555-8899',
    municipality: 'Panglao',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-09-02T08:00:00Z',
    terms_accepted_at: '2026-09-02T08:00:00Z',
    privacy_accepted_at: '2026-09-02T08:00:00Z',
  },
  {
    id: 'user-tricycle-1',
    name: 'Mang Dodong (Tagbilaran TODA)',
    email: 'dodong.toda@bohol.ph',
    user_type: 'tricycle',
    role: 'user',
    phone_number: '0939-777-1234',
    municipality: 'Tagbilaran City',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-09-03T08:00:00Z',
    terms_accepted_at: '2026-09-03T08:00:00Z',
    privacy_accepted_at: '2026-09-03T08:00:00Z',
  },
  {
    id: 'user-admin-1',
    name: 'Admin Maria Santos',
    email: 'admin@gmail.com',
    user_type: 'admin',
    role: 'admin',
    phone_number: '0918-999-0000',
    municipality: 'System Administrator',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-09-01T08:00:00Z',
    terms_accepted_at: '2026-09-01T08:00:00Z',
    privacy_accepted_at: '2026-09-01T08:00:00Z',
  },
];

export const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    user_id: 'user-motorist-1',
    vehicle_type: 'motorcycle',
    brand: 'Honda',
    model: 'Click 125',
    year: 2024,
    fuel_type: 'Gasoline',
    plate_number: '772-BOH',
    is_default: true,
    odometer_km: 4250,
    fuel_efficiency_km_per_l: 45.0,
  },
  {
    id: 'veh-2',
    user_id: 'user-habal-1',
    vehicle_type: 'motorcycle',
    brand: 'Yamaha',
    model: 'Sniper 155',
    year: 2023,
    fuel_type: 'Gasoline',
    plate_number: '891-BHL',
    is_default: true,
    odometer_km: 18400,
    fuel_efficiency_km_per_l: 40.0,
  },
  {
    id: 'veh-3',
    user_id: 'user-tricycle-1',
    vehicle_type: 'tricycle',
    brand: 'Honda',
    model: 'TMX 125 + Bohol Standard Sidecar',
    year: 2022,
    fuel_type: 'Gasoline',
    toda_body_number: 'TODA-TAG-042',
    plate_number: '334-BOH',
    is_default: true,
    odometer_km: 32100,
    fuel_efficiency_km_per_l: 28.0,
  },
  {
    id: 'veh-4',
    user_id: 'user-motorist-1',
    vehicle_type: '4wheel',
    brand: 'Toyota',
    model: 'Vios 1.3 XLE',
    year: 2023,
    fuel_type: 'Gasoline',
    plate_number: 'GAA-4819',
    is_default: false,
    odometer_km: 12800,
    fuel_efficiency_km_per_l: 14.5,
  },
];

export const SEED_ALLOWANCES: Allowance[] = [
  {
    id: 'allow-1',
    user_id: 'user-motorist-1',
    amount: 3000,
    period: 'monthly',
    start_date: '2026-09-01',
    end_date: '2026-09-30',
  },
];

export const SEED_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    user_id: 'user-motorist-1',
    vehicle_id: 'veh-1',
    vehicle_name: 'Honda Click 125',
    date: '2026-09-18T07:30:00Z',
    origin: 'Dauis Town Proper',
    destination: 'Island City Mall (ICM), Tagbilaran',
    distance_km: 8.5,
    duration: '18 min',
    purpose: 'Work / Commute',
    fuel_cost: 45,
    notes: 'Morning work commute via Causeway Bridge',
  },
  {
    id: 'trip-2',
    user_id: 'user-motorist-1',
    vehicle_id: 'veh-1',
    vehicle_name: 'Honda Click 125',
    date: '2026-09-17T17:00:00Z',
    origin: 'Island City Mall (ICM)',
    destination: 'Dauis Town Proper',
    distance_km: 8.5,
    duration: '20 min',
    purpose: 'Home / Commute',
    fuel_cost: 45,
    notes: 'Return trip home after work',
  },
  {
    id: 'trip-3',
    user_id: 'user-motorist-1',
    vehicle_id: 'veh-1',
    vehicle_name: 'Honda Click 125',
    date: '2026-09-15T09:00:00Z',
    origin: 'Tagbilaran City Sea Port',
    destination: 'Alona Beach, Panglao',
    distance_km: 21.0,
    duration: '35 min',
    purpose: 'Personal Errand',
    fuel_cost: 110,
    notes: 'Weekend visit to Panglao resort',
  },
  {
    id: 'trip-4',
    user_id: 'user-motorist-1',
    vehicle_id: 'veh-1',
    vehicle_name: 'Honda Click 125',
    date: '2026-09-12T08:15:00Z',
    origin: 'Dao Integrated Bus Terminal (Dao)',
    destination: 'Chocolate Hills Complex, Carmen',
    distance_km: 55.2,
    duration: '1 hr 15 min',
    purpose: 'Leisure / Sightseeing',
    fuel_cost: 250,
    notes: 'Interior Bohol highway drive',
  },
  {
    id: 'trip-hh-1',
    user_id: 'user-habal-1',
    vehicle_id: 'veh-2',
    vehicle_name: 'Yamaha Sniper 155',
    date: '2026-09-19T06:45:00Z',
    origin: 'Bohol-Panglao International Airport (BIA)',
    destination: 'Alona Beach Resort Zone',
    distance_km: 4.8,
    duration: '10 min',
    purpose: 'Passenger Drop-off',
    passenger_count: 1,
    fare: 150,
    fuel_cost: 30,
    other_expenses: 0,
    net_amount: 120,
    notes: 'Tourist passenger from morning Manila flight',
  },
  {
    id: 'trip-hh-2',
    user_id: 'user-habal-1',
    vehicle_id: 'veh-2',
    vehicle_name: 'Yamaha Sniper 155',
    date: '2026-09-19T08:30:00Z',
    origin: 'Alona Beach',
    destination: 'Tagbilaran City Sea Port',
    distance_km: 21.5,
    duration: '38 min',
    purpose: 'Passenger Drop-off (Pakyaw)',
    passenger_count: 2,
    fare: 450,
    fuel_cost: 100,
    other_expenses: 20,
    net_amount: 330,
    notes: 'Express passenger drop to Cebu OceanJet fastcraft',
  },
  {
    id: 'trip-tri-1',
    user_id: 'user-tricycle-1',
    vehicle_id: 'veh-3',
    vehicle_name: 'Honda TMX 125',
    date: '2026-09-19T06:00:00Z',
    origin: 'Dao Terminal',
    destination: 'Tagbilaran Public Market',
    distance_km: 3.2,
    duration: '10 min',
    purpose: 'Market Shuttle Round',
    passenger_count: 4,
    fare: 280,
    fuel_cost: 50,
    boundary_cost: 100,
    other_expenses: 20,
    net_amount: 110,
    notes: 'Early morning vendor trip',
  },
  {
    id: 'trip-tri-2',
    user_id: 'user-tricycle-1',
    vehicle_id: 'veh-3',
    vehicle_name: 'Honda TMX 125',
    date: '2026-09-19T07:30:00Z',
    origin: 'Island City Mall',
    destination: 'Bohol Island State University (BISU Main)',
    distance_km: 2.8,
    duration: '9 min',
    purpose: 'Student Commute',
    passenger_count: 5,
    fare: 320,
    fuel_cost: 60,
    boundary_cost: 100,
    other_expenses: 10,
    net_amount: 150,
  }
];

export const SEED_FUEL_PURCHASES: FuelPurchase[] = [
  {
    id: 'fp-log-1',
    user_id: 'user-motorist-1',
    station_id: 'fs-1',
    station_name: 'Petron Tagbilaran North',
    municipality: 'Tagbilaran City',
    fuel_type: 'Gasoline',
    price_per_liter: 63.85,
    liters: 6.26,
    total_cost: 400.0,
    odometer_km: 4180,
    date: '2026-09-12T08:00:00Z',
    notes: 'Full tank refill before Carmen trip',
  },
  {
    id: 'fp-log-2',
    user_id: 'user-motorist-1',
    station_id: 'fs-2',
    station_name: 'Shell CPG Avenue',
    municipality: 'Tagbilaran City',
    fuel_type: 'Gasoline',
    price_per_liter: 63.85,
    liters: 7.05,
    total_cost: 450.0,
    odometer_km: 4250,
    date: '2026-09-17T17:30:00Z',
    notes: 'Mid-month top up',
  },
  {
    id: 'fp-log-3',
    user_id: 'user-habal-1',
    station_id: 'fs-4',
    station_name: 'Phoenix Petroleum Panglao',
    municipality: 'Panglao',
    fuel_type: 'Gasoline',
    price_per_liter: 64.75,
    liters: 3.09,
    total_cost: 200.0,
    odometer_km: 18400,
    date: '2026-09-19T06:15:00Z',
    notes: 'Morning fuel refill for daily runs',
  },
  {
    id: 'fp-log-4',
    user_id: 'user-tricycle-1',
    station_id: 'fs-3',
    station_name: 'Caltex Dao Terminal',
    municipality: 'Tagbilaran City',
    fuel_type: 'Gasoline',
    price_per_liter: 63.85,
    liters: 4.70,
    total_cost: 300.0,
    odometer_km: 32100,
    date: '2026-09-19T05:45:00Z',
    notes: 'Daily TODA shift fuel',
  },
];

export function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(item);
    if (key === 'byahe_users' && Array.isArray(parsed)) {
      return parsed.map((u: any) => {
        if (u.role === 'admin') {
          return {
            ...u,
            email: u.email?.replace('boholtransport.gov.ph', 'byahenibai.ph') || u.email,
            municipality:
              u.municipality?.includes('LGU') || u.municipality === 'Tagbilaran City'
                ? 'System Administrator'
                : (u.municipality || 'System Administrator'),
          };
        }
        return u;
      }) as unknown as T;
    }
    if (key === 'byahe_fuel_prices' && Array.isArray(parsed)) {
      const hasOldStations = parsed.some((p: any) =>
        p.station_name?.includes('Petron Tagbilaran') ||
        p.station_name?.includes('Shell CPG') ||
        p.station_name?.includes('Caltex') ||
        p.station_name?.includes('Tubigon Wharf')
      );
      if (hasOldStations || parsed.length > 6) {
        localStorage.setItem(key, JSON.stringify(INITIAL_FUEL_PRICES));
        return INITIAL_FUEL_PRICES as unknown as T;
      }
    }
    return parsed;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return defaultData;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

export function getInitialStorageData() {
  return {
    users: loadFromStorage(STORAGE_KEYS.USERS, SEED_USERS),
    activeUserId: loadFromStorage(STORAGE_KEYS.ACTIVE_USER_ID, 'user-motorist-1'),
    vehicles: loadFromStorage(STORAGE_KEYS.VEHICLES, SEED_VEHICLES),
    trips: loadFromStorage(STORAGE_KEYS.TRIPS, SEED_TRIPS),
    allowances: loadFromStorage(STORAGE_KEYS.ALLOWANCES, SEED_ALLOWANCES),
    fuelPurchases: loadFromStorage(STORAGE_KEYS.FUEL_PURCHASES, SEED_FUEL_PURCHASES),
    fuelStations: loadFromStorage(STORAGE_KEYS.FUEL_STATIONS, INITIAL_FUEL_STATIONS),
    fuelPrices: loadFromStorage(STORAGE_KEYS.FUEL_PRICES, INITIAL_FUEL_PRICES),
  };
}

export function resetAllStorageToDefaults() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, JSON.stringify('user-motorist-1'));
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(SEED_VEHICLES));
  localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(SEED_TRIPS));
  localStorage.setItem(STORAGE_KEYS.ALLOWANCES, JSON.stringify(SEED_ALLOWANCES));
  localStorage.setItem(STORAGE_KEYS.FUEL_PURCHASES, JSON.stringify(SEED_FUEL_PURCHASES));
  localStorage.setItem(STORAGE_KEYS.FUEL_STATIONS, JSON.stringify(INITIAL_FUEL_STATIONS));
  localStorage.setItem(STORAGE_KEYS.FUEL_PRICES, JSON.stringify(INITIAL_FUEL_PRICES));
}
