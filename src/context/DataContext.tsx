import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Allowance,
  FinancialSummary,
  FuelPriceRecord,
  FuelPurchase,
  FuelStation,
  Trip,
  Vehicle
} from '../types';
import { useAuth } from './AuthContext';
import {
  getInitialStorageData,
  loadFromStorage,
  resetAllStorageToDefaults,
  saveToStorage,
  SEED_ALLOWANCES,
  SEED_FUEL_PURCHASES,
  isDemoTrip,
  SEED_VEHICLES
} from '../lib/storage';
import { INITIAL_FUEL_PRICES, INITIAL_FUEL_STATIONS } from '../lib/boholData';
import { syncFuelPriceFeed } from '../lib/fuelPriceSync';
import { getSupabaseClient, isSupabaseConfigured, generateUUID } from '../lib/supabase';

interface DataContextType {
  vehicles: Vehicle[];
  userVehicles: Vehicle[];
  defaultVehicle: Vehicle | undefined;
  trips: Trip[];
  userTrips: Trip[];
  fuelPurchases: FuelPurchase[];
  userFuelPurchases: FuelPurchase[];
  allowances: Allowance[];
  userAllowance: Allowance | undefined;
  fuelStations: FuelStation[];
  fuelPrices: FuelPriceRecord[];
  financialSummary: FinancialSummary;
  isSyncing: boolean;
  supabaseConnected: boolean;

  addTrip: (tripData: Partial<Trip>) => Trip;
  deleteTrip: (id: string) => void;
  addVehicle: (vehicleData: Partial<Vehicle>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setDefaultVehicle: (id: string) => void;
  addFuelPurchase: (purchaseData: Partial<FuelPurchase>) => FuelPurchase;
  updateFuelPurchase: (id: string, updates: Partial<FuelPurchase>) => void;
  deleteFuelPurchase: (id: string) => void;
  updateAllowance: (amount: number, period?: 'daily' | 'weekly' | 'monthly') => void;

  addFuelStation: (station: Omit<FuelStation, 'id'>) => FuelStation;
  updateFuelStation: (id: string, updated: Partial<FuelStation>) => void;
  deleteFuelStation: (id: string) => void;
  addOrUpdateFuelPrice: (record: Omit<FuelPriceRecord, 'id' | 'date_recorded'>) => void;

  resetDataToDemo: () => void;
  syncWithSupabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const initial = useMemo(() => getInitialStorageData(), []);

  const [vehicles, setVehicles] = useState<Vehicle[]>(initial.vehicles);
  const [trips, setTrips] = useState<Trip[]>(initial.trips);
  const [allowances, setAllowances] = useState<Allowance[]>(initial.allowances);
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>(initial.fuelPurchases);
  const [fuelStations, setFuelStations] = useState<FuelStation[]>(initial.fuelStations);
  const [fuelPrices, setFuelPrices] = useState<FuelPriceRecord[]>(initial.fuelPrices);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured());

  useEffect(() => { saveToStorage('byahe_vehicles', vehicles); }, [vehicles]);
  useEffect(() => { saveToStorage('byahe_trips', trips); }, [trips]);
  useEffect(() => { saveToStorage('byahe_allowances', allowances); }, [allowances]);
  useEffect(() => { saveToStorage('byahe_fuel_purchases', fuelPurchases); }, [fuelPurchases]);
  useEffect(() => { saveToStorage('byahe_fuel_stations', fuelStations); }, [fuelStations]);
  useEffect(() => { saveToStorage('byahe_fuel_prices', fuelPrices); }, [fuelPrices]);

  // Keep provincial benchmark prices synced weekly with https://www.fuelprice.ph
  useEffect(() => {
    let active = true;
    syncFuelPriceFeed().then((feed) => {
      if (!active || !feed.isLiveSynced) return;
      const feedIso = `${feed.effectiveDateIso}T06:00:00Z`;
      setFuelPrices((prev) =>
        prev.map((record) => {
          const isAutoFeed =
            record.id.startsWith('bm-') ||
            record.recorded_by === 'fuelprice.ph Weekly Feed' ||
            record.recorded_by === 'FuelWatch PH Live Feed';
          if (!isAutoFeed) return record;

          let nextPrice = record.price_per_liter;
          if (record.fuel_type === 'Gasoline') nextPrice = feed.gasoline.price;
          else if (record.fuel_type === 'Diesel') nextPrice = feed.diesel.price;
          else if (record.fuel_type === 'Premium 95') nextPrice = feed.premium95.price;
          else if (record.fuel_type === 'Regular') nextPrice = Math.max(40, Math.round((feed.gasoline.price - 1.5) * 100) / 100);

          return {
            ...record,
            station_name: 'FuelPrice PH (www.fuelprice.ph)',
            price_per_liter: nextPrice,
            date_recorded: feedIso,
            recorded_by: 'fuelprice.ph Weekly Feed',
          };
        })
      );
    });
    return () => { active = false; };
  }, []);

  const syncWithSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setSupabaseConnected(false);
      return;
    }

    try {
      setIsSyncing(true);
      setSupabaseConnected(true);

      const { data: stationsData, error: stErr } = await client.from('fuel_stations').select('*');
      if (!stErr && stationsData && stationsData.length > 0) {
        setFuelStations(stationsData);
      }

      const { data: priceData, error: prErr } = await client.from('fuel_price_history').select('*');
      if (!prErr && priceData && priceData.length > 0) {
        setFuelPrices(priceData);
      }

      const { data: tripData, error: trErr } = await client.from('trips').select('*');
      if (!trErr && tripData && tripData.length > 0) {
        setTrips(tripData.filter((t: Trip) => !isDemoTrip(t)));
      }

      const { data: vehData, error: vehErr } = await client.from('vehicles').select('*');
      if (!vehErr && vehData && vehData.length > 0) {
        setVehicles(vehData);
      }

      const { data: purData, error: purErr } = await client.from('fuel_purchases').select('*');
      if (!purErr && purData && purData.length > 0) {
        setFuelPurchases(purData);
      }
    } catch (err) {
      console.warn('Supabase sync skipped/failed, using local storage mode:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial load and Realtime live database subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    syncWithSupabase();

    const client = getSupabaseClient();
    if (!client) return;

    // Real-time listener for database updates across tables
    const channel = client
      .channel('public:db-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => syncWithSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => syncWithSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_stations' }, () => syncWithSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_price_history' }, () => syncWithSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_purchases' }, () => syncWithSupabase())
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setVehicles(loadFromStorage('byahe_vehicles', initial.vehicles));
    }
  }, [currentUser]);

  const userVehicles = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return vehicles;
    return vehicles.filter(v => v.user_id === currentUser.id);
  }, [vehicles, currentUser]);

  const defaultVehicle = useMemo(() => {
    return userVehicles.find(v => v.is_default) || userVehicles[0];
  }, [userVehicles]);

  const userTrips = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return trips;
    return trips.filter(t => t.user_id === currentUser.id);
  }, [trips, currentUser]);

  const userFuelPurchases = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return fuelPurchases;
    return fuelPurchases.filter(f => f.user_id === currentUser.id);
  }, [fuelPurchases, currentUser]);

  const userAllowance = useMemo((): Allowance => {
    if (!currentUser) {
      return {
        id: 'allow-guest',
        user_id: 'guest',
        amount: 3000,
        period: 'monthly' as const,
        start_date: '2026-09-01',
        end_date: '2026-09-30',
      };
    }
    const found = allowances.find(a => a.user_id === currentUser.id);
    if (found) return found;

    return {
      id: `allow-${currentUser.id}`,
      user_id: currentUser.id,
      amount: 3000,
      period: 'monthly' as const,
      start_date: '2026-09-01',
      end_date: '2026-09-30',
    };
  }, [allowances, currentUser]);

  const financialSummary = useMemo<FinancialSummary>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tripsToday = userTrips.filter(t => t.date.startsWith(todayStr));

    const allowanceBudget = userAllowance.amount;
    const totalFuelPurchaseCost = userFuelPurchases.reduce((acc, f) => acc + (Number(f.total_cost) || 0), 0);
    const totalTripFuelCost = userTrips.reduce((acc, t) => acc + (Number(t.fuel_cost) || 0), 0);
    const allowanceUsed = Math.max(totalFuelPurchaseCost, totalTripFuelCost);
    const allowanceRemaining = Math.max(0, allowanceBudget - allowanceUsed);

    const todayFares = tripsToday.reduce((acc, t) => acc + (Number(t.fare) || 0), 0);
    const todayTripFuel = tripsToday.reduce((acc, t) => acc + (Number(t.fuel_cost) || 0), 0);
    const todayOtherExp = tripsToday.reduce((acc, t) => acc + (Number(t.other_expenses) || 0), 0);
    const habalNetEarnings = todayFares - (todayTripFuel + todayOtherExp);

    const triFares = tripsToday.reduce((acc, t) => acc + (Number(t.fare) || 0), 0);
    const triFuel = tripsToday.reduce((acc, t) => acc + (Number(t.fuel_cost) || 0), 0);
    const triBoundary = tripsToday.reduce((acc, t) => acc + (Number(t.boundary_cost) || 0), 0);
    const triOther = tripsToday.reduce((acc, t) => acc + (Number(t.other_expenses) || 0), 0);
    const triNetEarnings = triFares - (triFuel + triBoundary + triOther);

    const totalDistanceKm = userTrips.reduce((acc, t) => acc + (Number(t.distance_km) || 0), 0);
    const totalTripsCount = userTrips.length;

    return {
      allowanceBudget,
      allowanceUsed,
      allowanceRemaining,
      totalFares: todayFares,
      fuelExpenses: todayTripFuel,
      otherExpenses: todayOtherExp,
      netEarnings: habalNetEarnings,
      tricycleFares: triFares,
      tricycleFuel: triFuel,
      boundaryExpenses: triBoundary,
      tricycleOtherExpenses: triOther,
      tricycleNetEarnings: triNetEarnings,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      totalTripsCount,
    };
  }, [userTrips, userFuelPurchases, userAllowance]);

  const addTrip = (tripData: Partial<Trip>): Trip => {
    const newTrip: Trip = {
      id: tripData.id || generateUUID(),
      user_id: currentUser?.id || 'guest',
      vehicle_id: tripData.vehicle_id || defaultVehicle?.id || 'veh-default',
      vehicle_name: tripData.vehicle_name || (defaultVehicle ? `${defaultVehicle.brand} ${defaultVehicle.model}` : 'Vehicle'),
      date: tripData.date || new Date().toISOString(),
      origin: tripData.origin || 'Tagbilaran City',
      destination: tripData.destination || 'Panglao',
      origin_lat: tripData.origin_lat,
      origin_lng: tripData.origin_lng,
      destination_lat: tripData.destination_lat,
      destination_lng: tripData.destination_lng,
      distance_km: Number(tripData.distance_km) || 0,
      duration: tripData.duration || '20 min',
      purpose: tripData.purpose || 'Commute',
      passenger_count: Number(tripData.passenger_count) || 0,
      fare: Number(tripData.fare) || 0,
      fuel_cost: Number(tripData.fuel_cost) || 0,
      boundary_cost: Number(tripData.boundary_cost) || 0,
      other_expenses: Number(tripData.other_expenses) || 0,
      net_amount: Number(tripData.net_amount) || 0,
      notes: tripData.notes || '',
      created_at: new Date().toISOString(),
    };

    setTrips(prev => [newTrip, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      client.from('trips').insert([newTrip]).then(({ error }) => {
        if (error) console.error('Supabase trip insert error:', error);
      });
    }

    return newTrip;
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('trips').delete().eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
  };

  const addVehicle = (vehicleData: Partial<Vehicle>): Vehicle => {
    const newVeh: Vehicle = {
      id: vehicleData.id || generateUUID(),
      user_id: currentUser?.id || 'guest',
      vehicle_type: vehicleData.vehicle_type || 'motorcycle',
      brand: vehicleData.brand || 'Honda',
      model: vehicleData.model || 'Click 125',
      version: vehicleData.version || '',
      year: Number(vehicleData.year) || 2024,
      fuel_type: vehicleData.fuel_type || 'Gasoline',
      plate_number: vehicleData.plate_number || '',
      toda_body_number: vehicleData.toda_body_number || '',
      is_default: userVehicles.length === 0 || Boolean(vehicleData.is_default),
      odometer_km: Number(vehicleData.odometer_km) || 0,
      fuel_efficiency_km_per_l: Number(vehicleData.fuel_efficiency_km_per_l) || 40.0,
      created_at: new Date().toISOString(),
    };

    setVehicles(prev => [...prev, newVeh]);
    const client = getSupabaseClient();
    if (client) {
      client.from('vehicles').insert([newVeh]).then(({ error }) => {
        if (error) console.error(error);
      });
    }
    return newVeh;
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('vehicles').delete().eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updates } : v))
    );
    const client = getSupabaseClient();
    if (client) {
      client
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Supabase vehicle update notice:', error.message);
        });
    }
  };

  const setDefaultVehicle = (id: string) => {
    if (!currentUser) return;
    setVehicles(prev =>
      prev.map(v => {
        if (v.user_id === currentUser.id) {
          return { ...v, is_default: v.id === id };
        }
        return v;
      })
    );
  };

  const addFuelPurchase = (purchaseData: Partial<FuelPurchase>): FuelPurchase => {
    const price = Number(purchaseData.price_per_liter) || 63.85;
    const liters = Number(purchaseData.liters) || 1;
    const total = Math.round(price * liters * 100) / 100;

    const newPurchase: FuelPurchase = {
      id: purchaseData.id || generateUUID(),
      user_id: currentUser?.id || 'guest',
      station_id: purchaseData.station_id,
      station_name: purchaseData.station_name || 'Petron Station',
      municipality: purchaseData.municipality || 'Tagbilaran City',
      fuel_type: purchaseData.fuel_type || 'Gasoline',
      price_per_liter: price,
      liters: liters,
      total_cost: total,
      odometer_km: purchaseData.odometer_km,
      notes: purchaseData.notes,
      date: purchaseData.date || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setFuelPurchases(prev => [newPurchase, ...prev]);
    const client = getSupabaseClient();
    if (client) {
      client.from('fuel_purchases').insert([newPurchase]).then(({ error }) => {
        if (error) console.error(error);
      });
    }
    return newPurchase;
  };

  const updateFuelPurchase = (id: string, updates: Partial<FuelPurchase>) => {
    setFuelPurchases(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const price = updates.price_per_liter !== undefined ? Number(updates.price_per_liter) : p.price_per_liter;
        const liters = updates.liters !== undefined ? Number(updates.liters) : p.liters;
        const total = updates.total_cost !== undefined ? Number(updates.total_cost) : Math.round(price * liters * 100) / 100;
        return {
          ...p,
          ...updates,
          price_per_liter: price,
          liters,
          total_cost: total,
        };
      })
    );
    const client = getSupabaseClient();
    if (client) {
      client.from('fuel_purchases').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
  };

  const deleteFuelPurchase = (id: string) => {
    setFuelPurchases(prev => prev.filter(f => f.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('fuel_purchases').delete().eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
  };

  const updateAllowance = (amount: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
    if (!currentUser) return;
    const existingIndex = allowances.findIndex(a => a.user_id === currentUser.id);
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-30`;

    if (existingIndex >= 0) {
      setAllowances(prev =>
        prev.map(a =>
          a.user_id === currentUser.id
            ? { ...a, amount, period, start_date: startDate, end_date: endDate }
            : a
        )
      );
    } else {
      const newAllow: Allowance = {
        id: `allow-${Date.now()}`,
        user_id: currentUser.id,
        amount,
        period,
        start_date: startDate,
        end_date: endDate,
      };
      setAllowances(prev => [...prev, newAllow]);
    }
  };

  const addFuelStation = (station: Omit<FuelStation, 'id'>): FuelStation => {
    const newStation: FuelStation = {
      ...station,
      id: `fs-${Date.now()}`,
    };
    setFuelStations(prev => [...prev, newStation]);
    const client = getSupabaseClient();
    if (client) {
      client.from('fuel_stations').insert([newStation]).then(({ error }) => {
        if (error) console.error(error);
      });
    }
    return newStation;
  };

  const updateFuelStation = (id: string, updated: Partial<FuelStation>) => {
    setFuelStations(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
    const client = getSupabaseClient();
    if (client) {
      client.from('fuel_stations').update(updated).eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
  };

  const deleteFuelStation = (id: string) => {
    setFuelStations(prev => prev.filter(s => s.id !== id));
    const client = getSupabaseClient();
    if (client) {
      client.from('fuel_stations').delete().eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
  };

  const addOrUpdateFuelPrice = (record: Omit<FuelPriceRecord, 'id' | 'date_recorded'>) => {
    const newRec: FuelPriceRecord = {
      ...record,
      id: `fp-${Date.now()}`,
      date_recorded: new Date().toISOString(),
      recorded_by: currentUser?.id || 'admin',
    };
    setFuelPrices(prev => {
      const idx = prev.findIndex(p => p.fuel_type === record.fuel_type);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          ...record,
          date_recorded: new Date().toISOString(),
          recorded_by: currentUser?.id || 'admin',
        };
        return updated;
      }
      return [newRec, ...prev];
    });
    const client = getSupabaseClient();
    if (client) {
      client.from('fuel_price_history').insert([newRec]).then(({ error }) => {
        if (error) console.error(error);
      });
    }
  };

  const resetDataToDemo = () => {
    resetAllStorageToDefaults();
    setVehicles(SEED_VEHICLES);
    setTrips([]);
    setAllowances(SEED_ALLOWANCES);
    setFuelPurchases(SEED_FUEL_PURCHASES);
    setFuelStations(INITIAL_FUEL_STATIONS);
    setFuelPrices(INITIAL_FUEL_PRICES);
  };

  return (
    <DataContext.Provider
      value={{
        vehicles,
        userVehicles,
        defaultVehicle,
        trips,
        userTrips,
        fuelPurchases,
        userFuelPurchases,
        allowances,
        userAllowance,
        fuelStations,
        fuelPrices,
        financialSummary,
        isSyncing,
        supabaseConnected,
        addTrip,
        deleteTrip,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        setDefaultVehicle,
        addFuelPurchase,
        updateFuelPurchase,
        deleteFuelPurchase,
        updateAllowance,
        addFuelStation,
        updateFuelStation,
        deleteFuelStation,
        addOrUpdateFuelPrice,
        resetDataToDemo,
        syncWithSupabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
