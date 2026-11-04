import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile,
  UserRole,
  UserType,
  UserRegistrationPayload,
  AdminRegistrationPayload,
  Vehicle,
} from '../types';
import { loadFromStorage, saveToStorage, SEED_USERS } from '../lib/storage';
import { getSupabaseClient, generateUUID } from '../lib/supabase';

export const ADMIN_SECURITY_PASSKEY = 'BOHOL-ADMIN-2025';

interface AuthContextType {
  currentUser: UserProfile | null;
  userType: UserType | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  allUsers: UserProfile[];
  login: (userId: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  setUserType: (type: UserType) => void;
  registerUser: (payload: UserRegistrationPayload) => UserProfile;
  registerAdmin: (payload: AdminRegistrationPayload) => { success: boolean; error?: string; user?: UserProfile };
  updateProfile: (updated: Partial<UserProfile>) => void;
  acceptTermsAndPrivacy: () => void;
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const loaded = loadFromStorage('byahe_users', SEED_USERS);
    // Ensure admin@gmail.com exists in users list
    const hasAdminGmail = loaded.some(u => u.email.toLowerCase() === 'admin@gmail.com');
    if (!hasAdminGmail) {
      const existingAdmin = loaded.find(u => u.role === 'admin');
      if (existingAdmin) {
        return loaded.map(u => u.id === existingAdmin.id ? { ...u, email: 'admin@gmail.com' } : u);
      } else {
        const defaultAdmin: UserProfile = {
          id: 'user-admin-1',
          name: 'Administrator',
          email: 'admin@gmail.com',
          user_type: 'admin',
          role: 'admin',
          phone_number: '0918-999-0000',
          municipality: 'System Administrator',
          created_at: new Date().toISOString(),
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
        };
        return [...loaded, defaultAdmin];
      }
    }
    return loaded;
  });

  // Active authenticated user ID (null = unauthenticated landing page)
  const [activeUserId, setActiveUserId] = useState<string | null>(() =>
    loadFromStorage<string | null>('byahe_auth_user_id', null)
  );

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('byahe_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const currentUser = activeUserId ? users.find(u => u.id === activeUserId) || null : null;

  useEffect(() => {
    saveToStorage('byahe_users', users);
  }, [users]);

  // Synchronize users with Supabase database & subscribe to Realtime changes
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    client
      .from('users')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setUsers(prev => {
            const merged = [...prev];
            data.forEach((remoteUser: any) => {
              const idx = merged.findIndex(
                u =>
                  u.id === remoteUser.id ||
                  (u.email &&
                    remoteUser.email &&
                    u.email.toLowerCase() === remoteUser.email.toLowerCase())
              );
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...remoteUser };
              } else {
                merged.push(remoteUser);
              }
            });
            return merged;
          });
        }
      });

    const channel = client
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        payload => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const nu = payload.new as UserProfile;
            setUsers(prev => (prev.some(u => u.id === nu.id) ? prev : [...prev, nu]));
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const uu = payload.new as UserProfile;
            setUsers(prev => prev.map(u => (u.id === uu.id ? { ...u, ...uu } : u)));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const du = payload.old as { id: string };
            setUsers(prev => prev.filter(u => u.id !== du.id));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (activeUserId) {
      saveToStorage('byahe_auth_user_id', activeUserId);
    } else {
      localStorage.removeItem('byahe_auth_user_id');
    }
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem('byahe_theme', theme);
    const isDark = theme === 'dark';

    // Synchronize HTML & Body classes, data-theme attribute and CSS color-scheme
    document.documentElement.classList.toggle('dark', isDark);
    if (document.body) {
      document.body.classList.toggle('dark', isDark);
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;

    // Synchronize native mobile browser theme-color bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#070d18' : '#f8fafc');
    }
  }, [theme]);

  // Synchronize OS-level color scheme changes if user hasn't explicitly set preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('byahe_theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Cross-tab theme synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'byahe_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setActiveUserId(userId);
    }
  };

  const logout = () => {
    setActiveUserId(null);
    localStorage.removeItem('byahe_auth_user_id');
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setActiveUserId(userId);
    }
  };

  const setUserType = (type: UserType) => {
    if (!currentUser) return;
    const newRole: UserRole = type === 'admin' ? 'admin' : 'user';
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, user_type: type, role: newRole };
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  const registerUser = (payload: UserRegistrationPayload): UserProfile => {
    const userId = generateUUID();
    const newUser: UserProfile = {
      id: userId,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password?.trim(),
      user_type: payload.user_type,
      role: 'user',
      municipality: payload.municipality || 'Tagbilaran City',
      phone_number: payload.phone_number || '09xx-xxx-xxxx',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.name)}`,
      created_at: new Date().toISOString(),
    };

    const client = getSupabaseClient();
    if (client) {
      client
        .from('users')
        .insert([
          {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            user_type: newUser.user_type,
            role: newUser.role,
            avatar_url: newUser.avatar_url,
            phone_number: newUser.phone_number,
            municipality: newUser.municipality,
          },
        ])
        .then(({ error }) => {
          if (error) console.warn('Supabase user insert notice:', error.message);
        });
    }

    // Auto-create initial vehicle in garage storage if provided
    if (payload.vehicle && payload.vehicle.brand) {
      const existingVehicles = loadFromStorage<Vehicle[]>('byahe_vehicles', []);
      const newVehicle: Vehicle = {
        id: generateUUID(),
        user_id: newUser.id,
        vehicle_type: payload.vehicle.vehicle_type || 'motorcycle',
        brand: payload.vehicle.brand,
        model: payload.vehicle.model,
        version: payload.vehicle.version,
        year: new Date().getFullYear(),
        fuel_type: payload.vehicle.fuel_type || 'Gasoline',
        plate_number: payload.vehicle.plate_number?.trim() || '',
        toda_body_number: payload.user_type === 'tricycle' ? (payload.vehicle.plate_number?.trim() || '') : undefined,
        is_default: true,
        odometer_km: 1200,
        fuel_efficiency_km_per_l:
          payload.vehicle.fuel_efficiency_km_per_l || (payload.user_type === 'tricycle' ? 25.0 : 45.0),
        created_at: new Date().toISOString(),
      };
      saveToStorage('byahe_vehicles', [...existingVehicles, newVehicle]);

      if (client) {
        client
          .from('vehicles')
          .insert([
            {
              id: newVehicle.id,
              user_id: newUser.id,
              vehicle_type: newVehicle.vehicle_type,
              brand: newVehicle.brand,
              model: newVehicle.model,
              year: newVehicle.year,
              fuel_type: newVehicle.fuel_type,
              plate_number: newVehicle.plate_number,
              toda_body_number: newVehicle.toda_body_number,
              is_default: newVehicle.is_default,
              odometer_km: newVehicle.odometer_km,
              fuel_efficiency_km_per_l: newVehicle.fuel_efficiency_km_per_l,
            },
          ])
          .then(({ error }) => {
            if (error) console.warn('Supabase vehicle insert notice:', error.message);
          });
      }
    }

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    setActiveUserId(newUser.id);
    return newUser;
  };

  const registerAdmin = (
    payload: AdminRegistrationPayload
  ): { success: boolean; error?: string; user?: UserProfile } => {
    const cleanedPasskey = payload.passkey.trim();
    if (
      cleanedPasskey !== ADMIN_SECURITY_PASSKEY &&
      cleanedPasskey !== 'admin123' &&
      cleanedPasskey !== 'ADMIN-BOHOL'
    ) {
      return {
        success: false,
        error: `Invalid Admin Security Passkey. (Use official key: ${ADMIN_SECURITY_PASSKEY})`,
      };
    }

    const newAdmin: UserProfile = {
      id: `admin-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      user_type: 'admin',
      role: 'admin',
      municipality: payload.municipality || 'Tagbilaran City',
      phone_number: payload.phone_number || '0918-999-0000',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.name)}`,
      created_at: new Date().toISOString(),
    };

    const nextUsers = [...users, newAdmin];
    setUsers(nextUsers);
    setActiveUserId(newAdmin.id);
    return { success: true, user: newAdmin };
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, ...updated } : u))
    );

    const client = getSupabaseClient();
    if (client) {
      client
        .from('users')
        .update(updated)
        .eq('id', currentUser.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase user profile update error:', error.message);
        });
    }
  };

  const acceptTermsAndPrivacy = () => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    updateProfile({
      terms_accepted_at: now,
      privacy_accepted_at: now,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userType: currentUser ? currentUser.user_type : null,
        role: currentUser ? currentUser.role : null,
        isAuthenticated: Boolean(currentUser),
        isAdmin: currentUser?.role === 'admin',
        allUsers: users,
        login,
        logout,
        switchUser,
        setUserType,
        registerUser,
        registerAdmin,
        updateProfile,
        acceptTermsAndPrivacy,
        theme,
        isDarkMode: theme === 'dark',
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
