import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AdminNavbar } from './components/admin/AdminNavbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { SupabaseConfigModal } from './components/settings/SupabaseConfigModal';
import { DataPrivacyTermsModal } from './components/auth/DataPrivacyTermsModal';

export const AmbientGlassBackground: React.FC = () => (
  <div className="glass-ambient-container pointer-events-none select-none" aria-hidden="true">
    <div className="glass-orb-1" />
    <div className="glass-orb-2" />
    <div className="glass-orb-3" />
  </div>
);

const AdminAppContent: React.FC = () => {
  const { currentUser, isAuthenticated, isAdmin, logout, acceptTermsAndPrivacy } = useAuth();
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  // If not logged in as Admin, show Admin Login Page
  if (!isAuthenticated || !currentUser || !isAdmin) {
    return (
      <div className="admin-app-root min-h-screen flex flex-col bg-slate-50/80 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-white transition-colors relative">
        <AmbientGlassBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <AdminLoginPage />
        </div>
      </div>
    );
  }

  // Authenticated as Admin: Full Admin Console View
  return (
    <div className="admin-app-root min-h-screen flex flex-col bg-slate-50/80 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-white transition-colors relative">
      <AmbientGlassBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AdminNavbar onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)} />

        <main className="app-main flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-16">
          <AdminDashboard />
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
          <span>Byahe ni Bai Administrator Console • Confidential Internal Site</span>
        </footer>
      </div>

      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
      />

      {!currentUser.terms_accepted_at && (
        <DataPrivacyTermsModal
          isOpen={true}
          user={currentUser}
          onAccept={acceptTermsAndPrivacy}
          onDecline={logout}
        />
      )}
    </div>
  );
};

export function AdminApp() {
  return (
    <AuthProvider>
      <DataProvider>
        <AdminAppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default AdminApp;
