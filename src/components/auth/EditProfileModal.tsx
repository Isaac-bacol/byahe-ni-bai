import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Bike,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  Phone,
  Mail,
  MapPin,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BOHOL_MUNICIPALITIES } from '../../lib/boholData';
import type { UserType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [municipality, setMunicipality] = useState('Tagbilaran City');
  const [userType, setUserType] = useState<UserType>('motorist');

  // Password change state
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state whenever modal opens or currentUser updates
  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone_number || '');
      setMunicipality(currentUser.municipality || 'Tagbilaran City');
      setUserType(currentUser.user_type || 'motorist');
      setChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMsg('Email address cannot be empty.');
      return;
    }

    // Password validation if the user opted to update password
    if (changePassword) {
      if (!newPassword) {
        setErrorMsg('Please enter a new password or uncheck "Change Password".');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify both password fields.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updates: Parameters<typeof updateProfile>[0] = {
        name: trimmedName,
        email: trimmedEmail,
        phone_number: trimmedPhone || '09xx-xxx-xxxx',
        municipality,
        user_type: userType,
      };

      if (changePassword && newPassword) {
        updates.password = newPassword;
      }

      updateProfile(updates);

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Edit Driver Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your credentials, municipality, and driver classification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Edit Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Juan dela Cruz"
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="glass-input w-full pl-3.5 pr-8 py-2.5 rounded-xl text-sm font-medium focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Municipality & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bohol Municipality <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={municipality}
                onChange={e => setMunicipality(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer focus:outline-hidden"
              >
                {BOHOL_MUNICIPALITIES.map(muni => (
                  <option
                    key={muni}
                    value={muni}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {muni}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact / Mobile #
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0917-xxx-xxxx"
                  className="glass-input w-full pl-3.5 pr-8 py-2.5 rounded-xl text-sm font-medium focus:outline-hidden"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Transport Classification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Transport Classification <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUserType('motorist')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  userType === 'motorist'
                    ? 'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'glass-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Bike className="w-4 h-4" />
                  <span className="text-xs font-bold">Motorist</span>
                </div>
                <p className="text-xs opacity-75">Personal Commute</p>
              </button>

              <button
                type="button"
                onClick={() => setUserType('habal_habal')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  userType === 'habal_habal'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'glass-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Bike className="w-4 h-4" />
                  <span className="text-xs font-bold">Habal-Habal</span>
                </div>
                <p className="text-xs opacity-75">Commercial Rider</p>
              </button>

              <button
                type="button"
                onClick={() => setUserType('tricycle')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  userType === 'tricycle'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'glass-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Bike className="w-4 h-4" />
                  <span className="text-xs font-bold">Tricycle</span>
                </div>
                <p className="text-xs opacity-75">TODA Operator</p>
              </button>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="pt-2 border-t border-slate-200/50 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={e => setChangePassword(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Change Password</span>
                </span>
              </label>
              {changePassword && (
                <span className="text-xs text-slate-400">Min. 6 characters</span>
              )}
            </div>

            {changePassword && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="glass-input w-full pl-3.5 pr-9 py-2 rounded-xl text-sm font-medium focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      minLength={6}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="glass-input w-full pl-3.5 pr-9 py-2 rounded-xl text-sm font-medium focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/50 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 bg-sign hover:bg-sign-dark"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
