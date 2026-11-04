export type UserType = 'motorist' | 'habal_habal' | 'tricycle' | 'admin';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  user_type: UserType;
  role: UserRole;
  avatar_url?: string;
  phone_number?: string;
  municipality: string;
  created_at?: string;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
}

export type VehicleType = 'motorcycle' | 'tricycle' | '4wheel';
export type FuelType = 'Gasoline' | 'Diesel' | 'Premium 95' | 'Regular' | 'Electric';

export interface Vehicle {
  id: string;
  user_id: string;
  vehicle_type: VehicleType;
  brand: string;
  model: string;
  version?: string;
  year: number;
  fuel_type: FuelType;
  plate_number?: string;
  toda_body_number?: string;
  is_default: boolean;
  odometer_km: number;
  fuel_efficiency_km_per_l: number;
  created_at?: string;
}

export interface FuelStation {
  id: string;
  name: string;
  municipality: string;
  latitude: number;
  longitude: number;
  brand: string;
  is_active: boolean;
}

export interface FuelPriceRecord {
  id: string;
  station_id?: string;
  station_name?: string;
  municipality: string;
  fuel_type: FuelType;
  price_per_liter: number;
  date_recorded: string;
  recorded_by?: string;
}

export interface FuelPurchase {
  id: string;
  user_id: string;
  station_id?: string;
  station_name: string;
  municipality: string;
  fuel_type: FuelType;
  price_per_liter: number;
  liters: number;
  total_cost: number;
  odometer_km?: number;
  notes?: string;
  date: string;
  created_at?: string;
}

export interface Allowance {
  id: string;
  user_id: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  created_at?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  vehicle_id?: string;
  vehicle_name?: string;
  date: string;
  origin: string;
  destination: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  distance_km: number;
  duration?: string; // e.g., "32 min"
  purpose: string;
  passenger_count?: number;
  fare?: number;
  fuel_cost?: number;
  boundary_cost?: number;
  other_expenses?: number;
  net_amount?: number;
  notes?: string;
  created_at?: string;
}

export interface BoholLocation {
  name: string;
  municipality: string;
  type: 'terminal' | 'port' | 'tourist' | 'mall' | 'municipality' | 'fuel_station';
  lat: number;
  lng: number;
  description?: string;
}

export interface FinancialSummary {
  // Motorist
  allowanceBudget: number;
  allowanceUsed: number;
  allowanceRemaining: number;

  // Habal-Habal
  totalFares: number;
  fuelExpenses: number;
  otherExpenses: number;
  netEarnings: number;

  // Tricycle
  tricycleFares: number;
  tricycleFuel: number;
  boundaryExpenses: number;
  tricycleOtherExpenses: number;
  tricycleNetEarnings: number;

  // Shared
  totalDistanceKm: number;
  totalTripsCount: number;
}

export interface UserRegistrationPayload {
  name: string;
  email: string;
  password?: string;
  phone_number?: string;
  user_type: Exclude<UserType, 'admin'>;
  municipality: string;
  vehicle?: {
    brand: string;
    model: string;
    version?: string;
    fuel_efficiency_km_per_l?: number;
    fuel_type: FuelType;
    plate_number?: string;
    vehicle_type: VehicleType;
  };
}

export interface AdminRegistrationPayload {
  name: string;
  email: string;
  phone_number?: string;
  agency?: string;
  municipality: string;
  passkey: string;
}

export interface AdvisoryItem {
  id: string;
  type: 'alert' | 'update';
  badgeText: string;
  date: string;
  title: string;
  summary: string;
  content: string;
  actionLabel?: string;
  actionTab?: string;
}

export interface StationReport {
  station_id: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  reported_at: string;
  reported_by?: string;
  notes?: string;
}

