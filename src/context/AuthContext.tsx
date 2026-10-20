import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginWithCredentials: (emailOrUser: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  loginAsPreset: (role: UserRole) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  canManageCargo: boolean;
  canManagePassengers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'ars_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default logged in as Super Admin so user can immediately test everything
    return {
      id: 'usr-admin-01',
      name: 'Pideksa Arsy (Super Admin)',
      email: 'pideksaarsy1206@gmail.com',
      role: 'super_admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const updatedUser: AuthUser = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin ARS',
          email: fbUser.email || 'admin@arslogistic.com',
          role: 'super_admin',
          avatar: fbUser.photoURL || undefined,
          isFirebaseAuthenticated: true,
        };
        setUser(updatedUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithCredentials = async (emailOrUser: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    // Simulate slight authentic network delay
    await new Promise((res) => setTimeout(res, 400));
    setLoading(false);

    const cleanInput = emailOrUser.trim().toLowerCase();

    // Check credentials matching requested admin accounts
    if (
      (cleanInput === 'admin' || cleanInput === 'admin@arslogistic.com' || cleanInput === 'pideksaarsy1206@gmail.com') &&
      (pass === 'admin123' || pass === 'admin' || pass === 'password')
    ) {
      const u: AuthUser = {
        id: 'usr-admin',
        name: 'Administrator Utama (ARS)',
        email: cleanInput.includes('@') ? cleanInput : 'admin@arslogistic.com',
        role: 'super_admin',
      };
      setUser(u);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
      return { success: true };
    }

    if (
      (cleanInput === 'cargo' || cleanInput === 'cargo.ops@arslogistic.com') &&
      (pass === 'cargo123' || pass === 'admin' || pass === 'cargo')
    ) {
      const u: AuthUser = {
        id: 'usr-cargo-ops',
        name: 'Hendro Wijaya (Operator Muatan)',
        email: 'cargo.ops@arslogistic.com',
        role: 'cargo_officer',
      };
      setUser(u);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
      return { success: true };
    }

    if (
      (cleanInput === 'tiket' || cleanInput === 'tiket.loket@arslogistic.com') &&
      (pass === 'tiket123' || pass === 'admin' || pass === 'tiket')
    ) {
      const u: AuthUser = {
        id: 'usr-ticket-agent',
        name: 'Sarah Amanda (Petugas Loket)',
        email: 'tiket.loket@arslogistic.com',
        role: 'ticket_agent',
      };
      setUser(u);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
      return { success: true };
    }

    // Default lenient admin credential acceptance if non-empty
    if (cleanInput.length > 2 && pass.length >= 4) {
      const u: AuthUser = {
        id: 'usr-custom-' + Date.now(),
        name: emailOrUser.split('@')[0].toUpperCase(),
        email: emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@arslogistic.com`,
        role: 'super_admin',
      };
      setUser(u);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
      return { success: true };
    }

    return {
      success: false,
      message: 'Username / Email atau Password salah. Gunakan password minimal 4 karakter atau klik Akun Demo Cepat.',
    };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const u: AuthUser = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        role: 'super_admin',
        avatar: fbUser.photoURL || undefined,
        isFirebaseAuthenticated: true,
      };
      setUser(u);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
      return { success: true };
    } catch (err) {
      console.error('Google Sign In error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Gagal login dengan akun Google.',
      };
    } finally {
      setLoading(false);
    }
  };

  const loginAsPreset = (role: UserRole) => {
    let u: AuthUser;
    if (role === 'super_admin') {
      u = {
        id: 'usr-admin-demo',
        name: 'Pideksa Arsy (Super Admin)',
        email: 'pideksaarsy1206@gmail.com',
        role: 'super_admin',
      };
    } else if (role === 'cargo_officer') {
      u = {
        id: 'usr-cargo-demo',
        name: 'Hendro Wijaya (Petugas Muatan)',
        email: 'cargo.ops@arslogistic.com',
        role: 'cargo_officer',
      };
    } else {
      u = {
        id: 'usr-tiket-demo',
        name: 'Sarah Amanda (Petugas Tiket)',
        email: 'tiket.loket@arslogistic.com',
        role: 'ticket_agent',
      };
    }
    setUser(u);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(u));
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const isAdmin = user?.role === 'super_admin';
  const canManageCargo = isAdmin || user?.role === 'cargo_officer';
  const canManagePassengers = isAdmin || user?.role === 'ticket_agent';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithCredentials,
        loginWithGoogle,
        loginAsPreset,
        logout,
        isAdmin,
        canManageCargo,
        canManagePassengers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
