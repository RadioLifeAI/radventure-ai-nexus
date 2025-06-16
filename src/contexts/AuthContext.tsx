
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/admin';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { useAuthActions } from '@/hooks/useAuthActions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading: authLoading } = useAuthState();
  const { profile, profileLoading, updateProfile, refreshProfile } = useAuthProfile(user);
  const { signUp, signIn, signOut } = useAuthActions();

  const loading = authLoading || profileLoading;

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
