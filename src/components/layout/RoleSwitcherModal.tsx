import React, { useState } from 'react';
import { X, Check, UserPlus, Shield, Bike, Car, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserType } from '../../types';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const RoleSwitcherModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const { allUsers, currentUser, switchUser, registerUser, setUserType } = useAuth();

  const [mode, setMode] = useState<'switch' | 'register'>('switch');

  // Registration state matching prompt Section 13
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regType, setRegType] = useState<UserType>('motorist');
  const [regMuni, setRegMuni] = useState('Tagbilaran City');

  if (!isOpen || !currentUser) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;

    registerUser({
      name: regName,
      email: regEmail,
      user_type: regType === 'admin' ? 'motorist' : regType,
      municipality: regMuni,
    });
    setMode('switch');
    onNavigate?.('dashboard');
    onClose();
  };

  const getIconForType = (type: UserType) => {
    switch (type) {
      case 'motorist':
        return <Bike className="w-5 h-5 text-sky-500" />;
      case 'habal_habal':
        return <Bike className="w-5 h-5 text-emerald-500" />;
      case 'tricycle':
        return <Bike className="w-5 h-5 text-amber-500" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-cyan-500" />;
    }
  };

  const regularUsers = allUsers.filter(u => u.role !== 'admin');
  const adminUsers = allUsers.filter(u => u.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/60">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-sky-500" />
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {mode === 'switch' ? 'Select User Type / Persona' : 'Create New Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'switch'
                  ? 'Switch between Bohol Motorist, Habal-Habal, Tricycle, or Admin'
                  : 'Register a new transport profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 p-1 glass-panel-subtle rounded-xl text-xs font-bold">
          <button
            onClick={() => setMode('switch')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'switch'
                ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Switch Persona
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'glass-btn bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* SWITCH PERSONA MODE */}
        {mode === 'switch' ? (
          <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {/* USER SIDE SECTION */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  User Side (Motorists & Drivers)
                </span>
                <span className="text-[10px] text-slate-400">Personal & Commercial</span>
              </div>
              <div className="space-y-2">
                {regularUsers.map(u => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        onNavigate?.('dashboard');
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/15 ring-2 ring-sky-500/30'
                          : 'glass-panel-subtle hover:border-sky-400/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getIconForType(u.user_type)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{u.name}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                            {u.user_type.replace('_', ' ')} • {u.municipality}
                          </p>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ADMIN CONSOLE SECTION */}
            {adminUsers.length > 0 && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                    Administrator Portal
                  </span>
                  <span className="text-[10px] text-slate-400">System Admin</span>
                </div>
                <div className="space-y-2">
                  {adminUsers.map(u => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          onNavigate?.('dashboard');
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/15 ring-2 ring-cyan-500/30'
                            : 'glass-panel-subtle hover:border-cyan-400/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-cyan-500 shrink-0" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{u.name}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-cyan-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                                  Active Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-cyan-600 dark:text-cyan-400">
                              System Administrator • {u.municipality}
                            </p>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* REGISTRATION FORM (Prompt Section 13) */
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NAME</label>
              <input
                type="text"
                required
                placeholder="Juan Dela Cruz"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">EMAIL</label>
              <input
                type="email"
                required
                placeholder="juan@bohol.ph"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">MUNICIPALITY</label>
              <select
                value={regMuni}
                onChange={e => setRegMuni(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              >
                {BOHOL_MUNICIPALITIES.map(m => (
                  <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{m}</option>
                ))}
              </select>
            </div>

            {/* Prompt exact options: I am a: Personal Motorist | Habal-Habal Driver | Tricycle Driver */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">I am a:</label>
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2.5 p-2 rounded-xl glass-panel-subtle hover:border-sky-400/40 cursor-pointer">
                  <input
                    type="radio"
                    name="userTypeChoice"
                    checked={regType === 'motorist'}
                    onChange={() => setRegType('motorist')}
                    className="text-sky-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Personal Motorist</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2 rounded-xl glass-panel-subtle hover:border-emerald-400/40 cursor-pointer">
                  <input
                    type="radio"
                    name="userTypeChoice"
                    checked={regType === 'habal_habal'}
                    onChange={() => setRegType('habal_habal')}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Habal-Habal Driver</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2 rounded-xl glass-panel-subtle hover:border-amber-400/40 cursor-pointer">
                  <input
                    type="radio"
                    name="userTypeChoice"
                    checked={regType === 'tricycle'}
                    onChange={() => setRegType('tricycle')}
                    className="text-amber-600"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Tricycle Driver</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 active:scale-95 text-white font-bold shadow-md shadow-emerald-900/20 cursor-pointer transition-all"
              >
                CREATE ACCOUNT
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
