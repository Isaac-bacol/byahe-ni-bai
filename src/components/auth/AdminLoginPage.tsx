import React, { useState } from 'react';
import {
  Shield,
  Sun,
  Moon,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Database,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, ADMIN_SECURITY_PASSKEY } from '../../context/AuthContext';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';

export const AdminLoginPage: React.FC = () => {
  const { allUsers, login, registerAdmin, isDarkMode, toggleTheme } = useAuth();

  // Sub-mode: 'signin' vs 'signup'
  const [adminMode, setAdminMode] = useState<'signin' | 'signup'>('signin');

  // Admin Sign-In State
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [adminSignInEmail, setAdminSignInEmail] = useState('');

  // Admin Sign-Up State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAgency, setAdminAgency] = useState('Platform Operations & Support');
  const [adminMuni, setAdminMuni] = useState('Tagbilaran City');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Filtered lists of existing admins
  const adminUsers = allUsers.filter(u => u.role === 'admin');

  // Handle Admin Sign-In
  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAdminId) {
      login(selectedAdminId);
    } else if (adminSignInEmail.trim()) {
      const match = adminUsers.find(
        u => u.email.toLowerCase() === adminSignInEmail.trim().toLowerCase()
      );
      if (match) {
        login(match.id);
      } else {
        alert('No official administrator found with that email.');
      }
    } else if (adminUsers.length > 0) {
      login(adminUsers[0].id);
    }
  };

  // Handle Admin Registration
  const handleAdminSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminName.trim()) {
      setAdminError('Please enter your full name.');
      return;
    }

    const res = registerAdmin({
      name: adminName,
      email: adminEmail.trim() || `${adminName.toLowerCase().replace(/\s+/g, '')}@byahenibai.ph`,
      agency: adminAgency,
      municipality: adminMuni,
      passkey: adminPasskey,
    });

    if (!res.success) {
      setAdminError(res.error || 'Invalid Admin Passkey.');
    }
  };

  return (
    <div className="admin-login-root min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-header border-b border-cyan-500/20 dark:border-cyan-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-cyan-900/30 bg-slate-950 shrink-0 border border-cyan-500/30">
              <img src="/logo.png?v=2" alt="Byahe ni Bai Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Byahe ni Bai
                </span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/15 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 backdrop-blur-xs">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium hidden sm:block">
                Provincial Benchmark Calibration & System Administration
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-xl glass-btn text-slate-800 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white cursor-pointer active:scale-90 hover:scale-105 transition-all"
            >
              <ThemeToggleIcon isDarkMode={isDarkMode} className="w-4 h-4" />
            </button>

            {/* Link back to User Side */}
            <a
              href="/"
              className="px-3 py-2 rounded-xl glass-btn text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Administrative Security Gateway Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Back link banner */}
          <div className="mb-4 flex items-center justify-between">
            <a
              href="/"
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Bohol Motorist App</span>
            </a>
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Secure Gateway
            </span>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30">
            {/* Header / Crest */}
            <div className="p-6 sm:p-7 bg-gradient-to-r from-cyan-900/40 via-sky-900/30 to-slate-900/40 border-b border-cyan-500/20">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold text-xl border border-cyan-500/40 shadow-inner">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Administrator Console</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40">
                      Bohol Hub
                    </span>
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Manage Bohol transport data, fuel prices, driver accounts, and system calibrations
                  </p>
                </div>
              </div>

              {/* Submode Switcher: Admin Sign In vs Register Admin */}
              <div className="mt-5 inline-flex p-1 rounded-xl glass-panel-subtle border border-cyan-500/20 w-full grid grid-cols-2">
                <button
                  onClick={() => {
                    setAdminMode('signin');
                    setAdminError(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                    adminMode === 'signin'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Admin Sign In
                </button>
                <button
                  onClick={() => {
                    setAdminMode('signup');
                    setAdminError(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                    adminMode === 'signup'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Register Admin
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              {adminError && (
                <div className="mb-5 p-3.5 rounded-xl glass-panel-subtle border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* ADMIN SIGN IN FORM */}
              {adminMode === 'signin' ? (
                <form onSubmit={handleAdminSignIn} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Select Authorized Administrator:
                    </label>
                    <div className="space-y-2">
                      {adminUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedAdminId(u.id);
                            setAdminSignInEmail(u.email);
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                            selectedAdminId === u.id || (adminUsers.length === 1 && !selectedAdminId)
                              ? 'glass-panel border-cyan-500 bg-cyan-500/15 ring-2 ring-cyan-500/30'
                              : 'glass-panel-interactive border-white/20 dark:border-white/10'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold shrink-0">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {u.email} • {u.municipality === 'Tagbilaran City' ? 'System Administrator' : (u.municipality || 'System Administrator')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="grow border-t border-white/20 dark:border-white/10" />
                    <span className="shrink-0 mx-4 text-xs text-slate-400 font-medium">Or enter administrator email</span>
                    <div className="grow border-t border-white/20 dark:border-white/10" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      value={adminSignInEmail}
                      onChange={e => {
                        setAdminSignInEmail(e.target.value);
                        setSelectedAdminId('');
                      }}
                      placeholder="e.g. admin@byahenibai.ph"
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel-subtle border border-cyan-500/30 text-xs text-cyan-900 dark:text-cyan-200 flex items-center space-x-2.5">
                    <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>
                      Access allows full management of provincial fuel benchmarks, TODA fare metrics, motorist accounts, and database sync.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Enter Administrator Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* ADMIN REGISTRATION FORM */
                <form onSubmit={handleAdminSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Administrator Full Name <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={e => setAdminName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Administrator Email
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={e => setAdminEmail(e.target.value)}
                        placeholder="admin@byahenibai.ph"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Base Municipality <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <select
                        required
                        value={adminMuni}
                        onChange={e => setAdminMuni(e.target.value)}
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                      >
                        {BOHOL_MUNICIPALITIES.map(m => (
                          <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Agency / Role Title
                      </label>
                      <input
                        type="text"
                        value={adminAgency}
                        onChange={e => setAdminAgency(e.target.value)}
                        placeholder="e.g. System Administrator, Webmaster"
                        className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Security Passkey */}
                  <div className="p-3.5 rounded-2xl glass-panel-subtle border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Master Security Passkey <span className="text-red-500 font-bold ml-0.5">*</span></span>
                      </label>
                      <span className="text-[10px] font-mono font-bold bg-cyan-200 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded">
                        Key: {ADMIN_SECURITY_PASSKEY}
                      </span>
                    </div>
                    <input
                      type="password"
                      required
                      value={adminPasskey}
                      onChange={e => setAdminPasskey(e.target.value)}
                      placeholder={`Enter master passkey (${ADMIN_SECURITY_PASSKEY})`}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-[11px] text-cyan-600/80 dark:text-cyan-400/80 mt-1">
                      This security passkey ensures only authorized administrators can create admin credentials.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl glass-panel-subtle border border-cyan-500/30 flex items-start space-x-2.5 text-[11px] text-cyan-900 dark:text-cyan-300">
                    <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      As an authorized administrator, you will review and accept the <strong>Data Privacy Act (RA 10173)</strong> & <strong>Terms of Service</strong> compliance upon creation.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Verify Passkey & Create Admin Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Admin footer */}
      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <span>Byahe ni Bai Administrator Console • Bohol Transport & Fuel Intelligence</span>
      </footer>
    </div>
  );
};
