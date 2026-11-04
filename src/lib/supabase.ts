import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'byahe_supabase_url';
const STORAGE_KEY_ANON = 'byahe_supabase_anon_key';

// User-provided Supabase Project URL & Publishable Key
export const DEFAULT_SUPABASE_URL = 'https://ljgrturgeudvpltsoqis.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_MvhYeJCHCkMhhGS8oCqcxA_Jt1eGrJ1';

// Normalize Supabase URL (strip /rest/v1 or trailing slashes)
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_ANON) || '';

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey =
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';

  const rawUrl = localUrl || envUrl || DEFAULT_SUPABASE_URL;

  return {
    url: normalizeSupabaseUrl(rawUrl),
    anonKey: localKey || envKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey);
    }
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = normalizeSupabaseUrl(url);
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    supabaseInstance = null; // reset instance so next call picks up new credentials
    return true;
  } catch (e) {
    console.error('Error saving Supabase credentials:', e);
    return false;
  }
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  supabaseInstance = null;
}

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
};

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
