
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/admin';

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('AuthContext: Auth state changed:', event, !!session?.user);
      
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          if (mounted) {
            const profileData = await fetchProfile(session.user.id);
            if (mounted) setProfile(profileData);
          }
        }, 0);
      } else {
        setProfile(null);
      }

      if (mounted && hasInitialized) {
        setLoading(false);
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Starting initialization');
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }

        if (!mounted) return;

        console.log('AuthContext: Initial session loaded:', !!initialSession);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          setTimeout(async () => {
            if (mounted) {
              const profileData = await fetchProfile(initialSession.user.id);
              if (mounted) setProfile(profileData);
            }
          }, 0);
        }
        
        hasInitialized = true;
        if (mounted) setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          hasInitialized = true;
          setLoading(false);
        }
      }
    };

    // Initialize auth
    const cleanup = initializeAuth();

    return () => {
      mounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process for:', email);
      
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      console.log('Signup successful:', data);
      return { error: null };
      
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signin process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Signin error:', error);
        return { error };
      }
      
      console.log('Signin successful:', data);
      return { error: null };
      
    } catch (error: any) {
      console.error('Unexpected signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signout process');
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Force redirect to auth page
      window.location.href = '/auth';
      
      console.log('Signout successful');
    } catch (error: any) {
      console.error('Signout error:', error);
      // Even if signout fails, clear local state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      window.location.href = '/auth';
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return { error: 'User not authenticated' };

    try {
      console.log('Updating profile for user:', user.id, 'with data:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        return { error };
      }

      await refreshProfile();
      console.log('Profile updated successfully');
      return { error: null };
      
    } catch (error: any) {
      console.error('Unexpected profile update error:', error);
      return { error };
    }
  };

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
