import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TripManager } from './components/trips/TripManager';
import { TripPlanner } from './components/trips/TripPlanner';
import { VehicleManager } from './components/vehicles/VehicleManager';
import { FuelManager } from './components/fuel/FuelManager';
import { FinanceManager } from './components/finance/FinanceManager';
import { ReportsView } from './components/reports/ReportsView';
import { SupabaseConfigModal } from './components/settings/SupabaseConfigModal';

import { UserLandingPage } from './components/auth/UserLandingPage';
import { AdminNavbar } from './components/admin/AdminNavbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WhatsNewBanner } from './components/advisory/WhatsNewBanner';
import { WhatsNewModal } from './components/advisory/WhatsNewModal';
import { PriceComparisonView } from './components/fuel/PriceComparisonView';
import { Footer } from './components/layout/Footer';
import { DataPrivacyTermsModal } from './components/auth/DataPrivacyTermsModal';
import { EditProfileModal } from './components/auth/EditProfileModal';
import { TutorialModal } from './components/common/TutorialModal';

export const AmbientGlassBackground: React.FC = () => (
  <div className="glass-ambient-container pointer-events-none select-none print:hidden" aria-hidden="true">
    <div className="glass-orb-1" />
    <div className="glass-orb-2" />
    <div className="glass-orb-3" />
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated, logout, acceptTermsAndPrivacy } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddTripOpen, setIsAddTripOpen] = useState<boolean>(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState<boolean>(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Show simple tutorial once for first-time users after terms are accepted
  useEffect(() => {
    if (!isAuthenticated || !currentUser || currentUser.role === 'admin' || !currentUser.terms_accepted_at) {
      return;
    }
    const key = `byahe_tutorial_seen_${currentUser.id}`;
    if (!localStorage.getItem(key)) {
      setIsTutorialOpen(true);
    }
  }, [isAuthenticated, currentUser]);

  const handleCloseTutorial = () => {
    if (currentUser) {
      localStorage.setItem(`byahe_tutorial_seen_${currentUser.id}`, '1');
    }
    setIsTutorialOpen(false);
  };

  // 1. Unauthenticated: Clean public landing page
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 relative">
        <AmbientGlassBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <UserLandingPage />
        </div>
      </div>
    );
  }

  // 2. Authenticated as Admin: Full Admin Console View
  if (currentUser.role === 'admin' && activeTab === 'dashboard') {
    return (
      <div className="admin-app-root min-h-screen flex flex-col bg-slate-50/80 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-white transition-colors relative">
        <AmbientGlassBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <AdminNavbar
            onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onNavigate={(tab) => {
              if (tab === 'user_dashboard') setActiveTab('trips');
              else setActiveTab(tab);
            }}
          />

          <main className="app-main flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-16">
            <AdminDashboard onNavigate={setActiveTab} />
          </main>

          <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80 print:hidden">
            <span>Byahe ni Bai Administrator Console • Provincial Transport Benchmark Calibration</span>
          </footer>
        </div>

        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />

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
  }

  // 3. Authenticated as Motorist / Driver (or Admin previewing user views)
  const safeTab = (currentUser.role !== 'admin' && activeTab === 'admin') ? 'dashboard' : activeTab;

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors relative">
      <AmbientGlassBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          activeTab={safeTab}
          onNavigate={(tab) => {
            setActiveTab(tab);
          }}
          onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
          onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
        />

        {/* What's New & Upcoming Tuesday Advisories Banner */}
        <WhatsNewBanner onOpenWhatsNew={() => setIsWhatsNewOpen(true)} />

        {/* Main Container */}
        <main className="app-main flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 pt-3 sm:pt-5 pb-24 md:pb-8 print:p-0 print:pb-0">
          {safeTab === 'dashboard' && (
            <DashboardView
              onOpenAddTrip={() => setIsAddTripOpen(true)}
              onNavigate={setActiveTab}
              onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
              onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
            />
          )}

          {safeTab === 'trips' && (
            <TripManager 
              onOpenAddTrip={() => setIsAddTripOpen(true)} 
              onBack={() => setActiveTab('dashboard')} 
            />
          )}

          {safeTab === 'vehicles' && (
            <VehicleManager onBack={() => setActiveTab('dashboard')} />
          )}

          {safeTab === 'fuel' && (
            <FuelManager
              initialTab="compare"
              onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {safeTab === 'compare' && (
            <PriceComparisonView
              onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {safeTab === 'finances' && (
            <FinanceManager onBack={() => setActiveTab('dashboard')} />
          )}

          {safeTab === 'reports' && (
            <ReportsView onBack={() => setActiveTab('dashboard')} />
          )}

          {safeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminDashboard onNavigate={setActiveTab} />
          )}

          {/* Footer - Scrolls smoothly with content */}
          <Footer onNavigate={setActiveTab} onOpenTutorial={() => setIsTutorialOpen(true)} />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeTab={safeTab}
          onNavigate={(tab) => {
            if (tab !== 'admin') setActiveTab(tab);
          }}
          onOpenAddTrip={() => setIsAddTripOpen(true)}
        />

        {/* Modals */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />

        <WhatsNewModal
          isOpen={isWhatsNewOpen}
          onClose={() => setIsWhatsNewOpen(false)}
          onNavigateTab={setActiveTab}
        />

        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={handleCloseTutorial}
          onNavigateTab={setActiveTab}
          onOpenAddTrip={() => setIsAddTripOpen(true)}
        />

        <TripPlanner
          isOpen={isAddTripOpen}
          onClose={() => setIsAddTripOpen(false)}
        />

        <SupabaseConfigModal
          isOpen={isSupabaseConfigOpen}
          onClose={() => setIsSupabaseConfigOpen(false)}
        />

        {/* Mandatory Compliance Gate: Data Privacy Act & Terms */}
        {!currentUser.terms_accepted_at && (
          <DataPrivacyTermsModal
            isOpen={true}
            user={currentUser}
            onAccept={acceptTermsAndPrivacy}
            onDecline={logout}
          />
        )}
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
