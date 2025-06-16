
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

// Função para mapear dados do usuário para o formato esperado pelo trigger
const mapUserDataForSignup = (userData: any) => {
  console.log('Mapping user data for signup:', userData);
  
  return {
    full_name: userData.full_name || '',
    academic_stage: userData.academic_stage || 'Student',
    medical_specialty: userData.medical_specialty || ''
  };
};

// Função para log de eventos de cadastro
const logSignupEvent = async (userId: string | null, eventType: string, eventData?: any, errorMessage?: string) => {
  try {
    await supabase.rpc('log_signup_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_event_data: eventData || null,
      p_error_message: errorMessage || null
    });
  } catch (error) {
    console.warn('Failed to log signup event:', error);
  }
};

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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Log do evento de autenticação
          await logSignupEvent(session.user.id, 'auth_state_changed', { event });
          
          // Defer profile fetching to avoid blocking
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    let userId = null;
    
    try {
      console.log('Starting signup process for:', email);
      console.log('Raw user data provided:', userData);
      
      // Mapear dados do usuário
      const mappedUserData = mapUserDataForSignup(userData);
      console.log('Mapped user data:', mappedUserData);
      
      // Log do início do cadastro
      await logSignupEvent(null, 'signup_started', { email, userData: mappedUserData });
      
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: mappedUserData
        }
      });
      
      if (data?.user) {
        userId = data.user.id;
      }
      
      if (error) {
        console.error('Signup error:', error);
        
        // Log do erro de cadastro
        await logSignupEvent(userId, 'signup_error', { 
          email, 
          error: error.message,
          userData: mappedUserData 
        }, error.message);
        
        return { error };
      }
      
      console.log('Signup successful:', data);
      
      // Log do sucesso do cadastro
      await logSignupEvent(userId, 'signup_success', { 
        email, 
        userId,
        userData: mappedUserData 
      });
      
      return { error: null };
      
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      
      // Log do erro inesperado
      await logSignupEvent(userId, 'signup_unexpected_error', { 
        email, 
        error: error.message 
      }, error.message);
      
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
        
        // Log do erro de login
        await logSignupEvent(null, 'signin_error', { 
          email, 
          error: error.message 
        }, error.message);
        
        return { error };
      }
      
      console.log('Signin successful:', data);
      
      // Log do sucesso do login
      await logSignupEvent(data.user?.id || null, 'signin_success', { 
        email, 
        userId: data.user?.id 
      });
      
      return { error: null };
      
    } catch (error: any) {
      console.error('Unexpected signin error:', error);
      
      // Log do erro inesperado
      await logSignupEvent(null, 'signin_unexpected_error', { 
        email, 
        error: error.message 
      }, error.message);
      
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signout process');
      
      const userId = user?.id;
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Log do logout
      await logSignupEvent(userId, 'signout_success', { userId });
      
      console.log('Signout successful');
    } catch (error: any) {
      console.error('Signout error:', error);
      
      // Log do erro de logout
      await logSignupEvent(user?.id || null, 'signout_error', { 
        error: error.message 
      }, error.message);
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
        
        // Log do erro de atualização
        await logSignupEvent(user.id, 'profile_update_error', { 
          updates, 
          error: error.message 
        }, error.message);
        
        return { error };
      }

      await refreshProfile();
      
      // Log do sucesso da atualização
      await logSignupEvent(user.id, 'profile_update_success', { updates });
      
      console.log('Profile updated successfully');
      return { error: null };
      
    } catch (error: any) {
      console.error('Unexpected profile update error:', error);
      
      // Log do erro inesperado
      await logSignupEvent(user.id, 'profile_update_unexpected_error', { 
        updates, 
        error: error.message 
      }, error.message);
      
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
