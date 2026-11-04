-- =========================================================
-- Byahe ni Bai - Supabase PostgreSQL Database Schema
-- Bohol Vehicle Trip, Fuel, Allowance & Income Management System
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table if not exists public.users (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    email text unique not null,
    password text,
    user_type text not null check (user_type in ('motorist', 'habal_habal', 'tricycle', 'admin')),
    role text not null default 'user' check (role in ('user', 'admin')),
    avatar_url text,
    phone_number text,
    municipality text default 'Tagbilaran City',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VEHICLES TABLE
create table if not exists public.vehicles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    vehicle_type text not null check (vehicle_type in ('motorcycle', 'tricycle', '4wheel')),
    brand text not null,
    model text not null,
    year integer not null,
    fuel_type text not null default 'Gasoline' check (fuel_type in ('Gasoline', 'Diesel', 'Premium 95', 'Regular', 'Electric')),
    plate_number text,
    toda_body_number text,
    is_default boolean default false,
    odometer_km numeric default 0,
    fuel_efficiency_km_per_l numeric default 40.0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. FUEL_STATIONS TABLE (Bohol Locations)
create table if not exists public.fuel_stations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    municipality text not null,
    latitude numeric(10, 7) not null,
    longitude numeric(10, 7) not null,
    brand text default 'Independent',
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. FUEL_PRICE_HISTORY TABLE (Bohol Reference Prices)
create table if not exists public.fuel_price_history (
    id uuid primary key default uuid_generate_v4(),
    station_id uuid references public.fuel_stations(id) on delete set null,
    municipality text not null default 'Tagbilaran City',
    fuel_type text not null check (fuel_type in ('Gasoline', 'Diesel', 'Premium 95', 'Regular')),
    price_per_liter numeric(8, 2) not null check (price_per_liter > 0),
    date_recorded timestamp with time zone default timezone('utc'::text, now()) not null,
    recorded_by uuid references public.users(id) on delete set null
);

-- 5. FUEL_PURCHASES TABLE
create table if not exists public.fuel_purchases (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    station_id uuid references public.fuel_stations(id) on delete set null,
    station_name text,
    municipality text default 'Tagbilaran City',
    fuel_type text not null check (fuel_type in ('Gasoline', 'Diesel', 'Premium 95', 'Regular')),
    price_per_liter numeric(8, 2) not null check (price_per_liter > 0),
    liters numeric(8, 3) not null check (liters > 0),
    total_cost numeric(10, 2) not null check (total_cost >= 0),
    odometer_km numeric,
    notes text,
    date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ALLOWANCES TABLE (For Personal Motorists)
create table if not exists public.allowances (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    amount numeric(10, 2) not null check (amount >= 0),
    period text not null default 'monthly' check (period in ('daily', 'weekly', 'monthly')),
    start_date date not null,
    end_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TRIPS TABLE
create table if not exists public.trips (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    vehicle_id uuid references public.vehicles(id) on delete set null,
    date timestamp with time zone default timezone('utc'::text, now()) not null,
    origin text not null,
    destination text not null,
    origin_lat numeric(10, 7),
    origin_lng numeric(10, 7),
    destination_lat numeric(10, 7),
    destination_lng numeric(10, 7),
    distance_km numeric(8, 2) not null default 0 check (distance_km >= 0),
    duration text,
    purpose text not null default 'Commute',
    passenger_count integer default 0 check (passenger_count >= 0),
    fare numeric(10, 2) default 0 check (fare >= 0),
    fuel_cost numeric(10, 2) default 0 check (fuel_cost >= 0),
    boundary_cost numeric(10, 2) default 0 check (boundary_cost >= 0),
    other_expenses numeric(10, 2) default 0 check (other_expenses >= 0),
    net_amount numeric(10, 2) default 0,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEXES for fast querying
create index if not exists idx_vehicles_user_id on public.vehicles(user_id);
create index if not exists idx_trips_user_id_date on public.trips(user_id, date desc);
create index if not exists idx_fuel_purchases_user_id on public.fuel_purchases(user_id, date desc);
create index if not exists idx_fuel_prices_date on public.fuel_price_history(date_recorded desc);
create index if not exists idx_fuel_stations_muni on public.fuel_stations(municipality);

-- ROW LEVEL SECURITY (RLS)
-- Enabled with fully open CRUD policies for seamless web client synchronization
alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.allowances enable row level security;
alter table public.fuel_purchases enable row level security;
alter table public.fuel_stations enable row level security;
alter table public.fuel_price_history enable row level security;

-- Drop any previous restrictive or conflicting policies to ensure clean execution
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Allow public users access" on public.users;
drop policy if exists "Users manage own vehicles" on public.vehicles;
drop policy if exists "Allow public vehicles access" on public.vehicles;
drop policy if exists "Users manage own trips" on public.trips;
drop policy if exists "Allow public trips access" on public.trips;
drop policy if exists "Users manage own allowances" on public.allowances;
drop policy if exists "Allow public allowances access" on public.allowances;
drop policy if exists "Users manage own fuel purchases" on public.fuel_purchases;
drop policy if exists "Allow public fuel purchases access" on public.fuel_purchases;
drop policy if exists "Anyone can read fuel stations" on public.fuel_stations;
drop policy if exists "Anyone can insert fuel stations" on public.fuel_stations;
drop policy if exists "Allow public fuel stations access" on public.fuel_stations;
drop policy if exists "Anyone can read fuel price history" on public.fuel_price_history;
drop policy if exists "Anyone can insert fuel price history" on public.fuel_price_history;
drop policy if exists "Allow public fuel price history access" on public.fuel_price_history;

-- Permissive policies allowing all web client operations with the anon/publishable key:
create policy "Allow public users access" on public.users for all using (true) with check (true);
create policy "Allow public vehicles access" on public.vehicles for all using (true) with check (true);
create policy "Allow public trips access" on public.trips for all using (true) with check (true);
create policy "Allow public allowances access" on public.allowances for all using (true) with check (true);
create policy "Allow public fuel purchases access" on public.fuel_purchases for all using (true) with check (true);
create policy "Allow public fuel stations access" on public.fuel_stations for all using (true) with check (true);
create policy "Allow public fuel price history access" on public.fuel_price_history for all using (true) with check (true);

-- Enable Realtime publication so changes broadcast to the web app live
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'users') then
    alter publication supabase_realtime add table public.users;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'vehicles') then
    alter publication supabase_realtime add table public.vehicles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'trips') then
    alter publication supabase_realtime add table public.trips;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'fuel_purchases') then
    alter publication supabase_realtime add table public.fuel_purchases;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'fuel_stations') then
    alter publication supabase_realtime add table public.fuel_stations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'fuel_price_history') then
    alter publication supabase_realtime add table public.fuel_price_history;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'allowances') then
    alter publication supabase_realtime add table public.allowances;
  end if;
exception
  when undefined_object then null;
end $$;

-- =========================================================
-- SEED DATA: Default Admin, Bohol Fuel Stations & Prices
-- =========================================================
insert into public.users (id, name, email, password, user_type, role, phone_number, municipality)
values
  ('a0000000-0000-0000-0000-000000000001', 'Administrator', 'admin@gmail.com', 'admin123', 'admin', 'admin', '0918-999-0000', 'Tagbilaran City')
on conflict (email) do nothing;

insert into public.fuel_stations (name, municipality, latitude, longitude, brand, is_active) values
('Petron Tagbilaran North', 'Tagbilaran City', 9.6610, 123.8610, 'Petron', true),
('Shell CPG Avenue', 'Tagbilaran City', 9.6480, 123.8560, 'Shell', true),
('Caltex Dao Terminal', 'Tagbilaran City', 9.6650, 123.8690, 'Caltex', true),
('Phoenix Petroleum Panglao', 'Panglao', 9.5610, 123.7780, 'Phoenix', true),
('Seaoil Dauis Highway', 'Dauis', 9.6300, 123.8200, 'Seaoil', true),
('Petron Tubigon Wharf Road', 'Tubigon', 9.9510, 123.9600, 'Petron', true),
('Caltex Carmen Centro', 'Carmen', 9.8250, 124.1950, 'Caltex', true),
('Shell Jagna Portside', 'Jagna', 9.6520, 124.3700, 'Shell', true),
('Cleanfuel Ubay Poblacion', 'Ubay', 10.0570, 124.4720, 'Cleanfuel', true),
('Phoenix Talibon Bypass', 'Talibon', 10.1480, 124.3310, 'Phoenix', true),
('Petron Loon National Road', 'Loon', 9.7990, 123.7920, 'Petron', true),
('Shell Panglao Airport Road', 'Panglao', 9.5750, 123.7810, 'Shell', true),
('Seaoil Tubigon Junction', 'Tubigon', 9.9480, 123.9550, 'Seaoil', true),
('Petron Tagbilaran Port Area', 'Tagbilaran City', 9.6550, 123.8500, 'Petron', true)
on conflict do nothing;

insert into public.fuel_price_history (municipality, fuel_type, price_per_liter) values
('Province of Bohol', 'Gasoline', 63.85),
('Province of Bohol', 'Diesel', 58.90),
('Province of Bohol', 'Premium 95', 66.50),
('Province of Bohol', 'Regular', 62.40)
on conflict do nothing;
