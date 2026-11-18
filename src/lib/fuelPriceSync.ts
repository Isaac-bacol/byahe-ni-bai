import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createFallbackFuelPriceFeed,
  type FuelPriceFeedData,
} from './fuelPriceParser';
import { BOHOL_ADVISORIES } from './boholData';

export interface BoholAdvisoryItem {
  id: string;
  type: 'alert' | 'update';
  badgeText: string;
  date: string;
  title: string;
  summary: string;
  content: string;
  actionLabel?: string;
  actionTab?: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

const FEED_CACHE_KEY = 'byahe_fuelprice_feed_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache, refreshes automatically each week/hour

function formatSignedPeso(amount: number): string {
  if (Math.abs(amount) < 0.005) return '₱0.00';
  const sign = amount > 0 ? '+' : '−';
  return `${sign}₱${Math.abs(amount).toFixed(2)}`;
}

export function buildWeeklyAdvisories(feed: FuelPriceFeedData): BoholAdvisoryItem[] {
  const isRollback = feed.gasoline.change < 0 || feed.diesel.change < 0;
  const isHike = feed.gasoline.change > 0 && feed.diesel.change > 0;

  const gasDelta = formatSignedPeso(feed.gasoline.change);
  const dieselDelta = formatSignedPeso(feed.diesel.change);
  const keroseneDelta = formatSignedPeso(feed.kerosene.change);

  const headlineSummary = isRollback
    ? `Fuel Update (${feed.effectiveDateDisplay}): Gasoline ${gasDelta}/L (₱${feed.gasoline.price.toFixed(2)}), Diesel ${dieselDelta}/L (₱${feed.diesel.price.toFixed(2)})`
    : isHike
      ? `Fuel Hike (${feed.effectiveDateDisplay}): Gasoline ${gasDelta}/L (₱${feed.gasoline.price.toFixed(2)}), Diesel ${dieselDelta}/L (₱${feed.diesel.price.toFixed(2)})`
      : `Weekly Fuel Update (${feed.effectiveDateDisplay}): Gasoline ₱${feed.gasoline.price.toFixed(2)}/L, Diesel ₱${feed.diesel.price.toFixed(2)}/L`;

  const driverTip = feed.nextWeek.direction === 'up'
    ? 'Prices are projected to increase next Tuesday at 6:00 AM. Habal-Habal drivers and Tricycle TODA operators are advised to fill up before Monday midnight.'
    : feed.nextWeek.direction === 'down'
      ? 'Prices are projected to roll back next Tuesday. Consider topping up only what you need before the Tuesday 6:00 AM adjustment.'
      : 'Weekly adjustments take effect every Tuesday at 6:00 AM across Shell, Petron, Caltex, Seaoil, Phoenix, and Cleanfuel stations in Bohol. Check fuelprice.ph every Thursday–Monday for early next-week estimates.';

  const liveWeeklyCard: BoholAdvisoryItem = {
    id: `adv-live-${feed.effectiveDateIso}`,
    type: 'alert',
    badgeText: feed.isLiveSynced ? 'LIVE WEEKLY UPDATE' : 'WEEKLY UPDATE',
    date: `${feed.effectiveDateDisplay} (Effective Tuesday 6:00 AM)`,
    title: headlineSummary,
    summary: `${headlineSummary} • ${feed.nextWeek.badge}: ${feed.nextWeek.headline}`,
    content: [
      `Latest Philippine pump price update referenced from fuelprice.ph (effective ${feed.effectiveDateDisplay}):`,
      '',
      'Current Weekly Average Pump Prices & Adjustments:',
      `• Gasoline (RON 91): ₱${feed.gasoline.price.toFixed(2)} / Liter (${feed.gasoline.changeText})`,
      `• Diesel: ₱${feed.diesel.price.toFixed(2)} / Liter (${feed.diesel.changeText})`,
      `• Premium 95: ₱${feed.premium95.price.toFixed(2)} / Liter`,
      `• Kerosene: ₱${feed.kerosene.price.toFixed(2)} / Liter (${keroseneDelta}/L)`,
      '',
      `${feed.nextWeek.badge}:`,
      `${feed.nextWeek.headline} — ${feed.nextWeek.details}`,
      '',
      'Driver Advisory (Bohol 48 Municipalities):',
      driverTip,
    ].join('\n'),
    actionLabel: 'Compare Bohol Station Prices',
    actionTab: 'compare',
    sourceUrl: 'https://www.fuelprice.ph',
    sourceLabel: 'Source: www.fuelprice.ph',
  };

  // Keep feature highlight updates after the live weekly fuel advisory
  const featureCards = BOHOL_ADVISORIES.filter(item => item.id !== 'adv-1');
  return [liveWeeklyCard, ...featureCards];
}

export function loadCachedFuelPriceFeed(): FuelPriceFeedData {
  const fallback = createFallbackFuelPriceFeed();
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(FEED_CACHE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as FuelPriceFeedData;
    if (!parsed || !parsed.gasoline || !parsed.diesel) return fallback;

    // If cached feed's week is older than fallback's Tuesday, refresh date metadata
    if (parsed.effectiveDateIso < fallback.effectiveDateIso && !parsed.isLiveSynced) {
      return fallback;
    }
    return {
      ...fallback,
      ...parsed,
      brands: parsed.brands && parsed.brands.length > 0 ? parsed.brands : fallback.brands,
    };
  } catch {
    return fallback;
  }
}

export function saveCachedFuelPriceFeed(feed: FuelPriceFeedData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(feed));
  } catch {
    // Ignore storage quota issues
  }
}

function isCacheStale(feed: FuelPriceFeedData): boolean {
  if (!feed.isLiveSynced || !feed.brands || feed.brands.length === 0) return true;
  const fetchedMs = Date.parse(feed.fetchedAt);
  if (Number.isNaN(fetchedMs)) return true;
  return Date.now() - fetchedMs > CACHE_TTL_MS;
}

// Shared subscriber list so multiple mounted components (Banner + Modal + Dashboard) stay in sync
type FeedListener = (feed: FuelPriceFeedData) => void;
const listeners = new Set<FeedListener>();
let inFlightSync: Promise<FuelPriceFeedData> | null = null;

function notifyListeners(feed: FuelPriceFeedData) {
  listeners.forEach(fn => fn(feed));
}

export async function syncFuelPriceFeed(force = false): Promise<FuelPriceFeedData> {
  const cached = loadCachedFuelPriceFeed();
  if (!force && !isCacheStale(cached)) {
    return cached;
  }

  if (inFlightSync) {
    return inFlightSync;
  }

  inFlightSync = (async () => {
    try {
      const response = await fetch('/api/fuelprice', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as FuelPriceFeedData;
      if (data && data.gasoline && data.diesel) {
        saveCachedFuelPriceFeed(data);
        notifyListeners(data);
        return data;
      }
      return cached;
    } catch (err) {
      console.warn('[fuelPriceSync] Using cached/baseline fuelprice.ph feed:', err);
      return cached;
    } finally {
      inFlightSync = null;
    }
  })();

  return inFlightSync;
}

export function useFuelPriceFeed() {
  const [feed, setFeed] = useState<FuelPriceFeedData>(() => loadCachedFuelPriceFeed());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate: FeedListener = (updated) => setFeed(updated);
    listeners.add(handleUpdate);

    if (isCacheStale(feed)) {
      setIsSyncing(true);
      syncFuelPriceFeed(false).finally(() => setIsSyncing(false));
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const refreshFeed = useCallback(async () => {
    setIsSyncing(true);
    try {
      const updated = await syncFuelPriceFeed(true);
      setFeed(updated);
      return updated;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const advisories = useMemo(() => buildWeeklyAdvisories(feed), [feed]);

  return {
    feed,
    advisories,
    isSyncing,
    refreshFeed,
  };
}
