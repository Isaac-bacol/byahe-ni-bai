import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppRoute = 'user' | 'admin';

interface RouteContextType {
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  isAdminRoute: boolean;
  isUserRoute: boolean;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

const getRouteFromUrl = (): AppRoute => {
  if (typeof window === 'undefined') return 'user';
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (pathname.includes('/admin') || hash.includes('admin')) {
    return 'admin';
  }
  return 'user';
};

export const RouteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromUrl);

  const navigate = useCallback((route: AppRoute) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      const targetUrl = route === 'admin' ? '/admin' : '/';
      // Use pushState to update clean URL without full page reload
      window.history.pushState({ route }, '', targetUrl);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  return (
    <RouteContext.Provider
      value={{
        currentRoute,
        navigate,
        isAdminRoute: currentRoute === 'admin',
        isUserRoute: currentRoute === 'user',
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
};
