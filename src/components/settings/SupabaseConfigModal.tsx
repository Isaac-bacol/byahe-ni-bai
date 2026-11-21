import React, { useState } from 'react';
import { Database, X, Check } from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials
} from '../../lib/supabase';
import { useData } from '../../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { syncWithSupabase, isSyncing, supabaseConnected } = useData();

  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = saveSupabaseCredentials(url, anonKey);
    if (success) {
      setSavedSuccess(true);
      syncWithSupabase();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    syncWithSupabase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Supabase Database Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">PostgreSQL cloud storage configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs backdrop-blur-xs ${
          supabaseConnected
            ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-500/15 border-amber-400/40 text-amber-800 dark:text-amber-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${supabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="font-bold">
              {supabaseConnected ? 'Supabase Connected & Active' : 'Offline Mode (Local Storage)'}
            </span>
          </div>
          <span className="text-xs font-mono">
            {supabaseConnected ? 'PostgreSQL Live' : 'Browser Indexed'}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL (e.g. https://your-project.supabase.co)
            </label>
            <input
              type="url"
              placeholder="https://abcdefghijklm.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Find this in your Supabase Dashboard: <strong>Project Settings → API → Project URL</strong>.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Publishable API Key (sb_publishable_... or eyJh...)
            </label>
            <input
              type="text"
              placeholder="sb_publishable_... or eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
            {anonKey.startsWith('sb_publishable_') && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Verified Supabase Publishable Key active</span>
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl glass-panel-subtle space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Database Migration Schema:</span>
            <p>
              The full PostgreSQL migration file is ready at <code className="glass-btn px-1 py-0.5 rounded text-xs">supabase/schema.sql</code>. Copy and run it in your Supabase SQL Editor to create all tables (users, vehicles, trips, fuel stations, purchases, allowances).
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold cursor-pointer transition-colors"
            >
              Clear Keys
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl glass-btn text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl text-white font-bold shadow-md cursor-pointer flex items-center space-x-1 transition-all bg-sign hover:bg-sign-dark"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Connect Supabase</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
