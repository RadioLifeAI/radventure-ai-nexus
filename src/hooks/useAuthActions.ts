
import { supabase } from '@/integrations/supabase/client';

export function useAuthActions() {
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
      
      // Sign out from Supabase first
      await supabase.auth.signOut();
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Force redirect to auth page
      window.location.href = '/auth';
      
      console.log('Signout successful');
    } catch (error: any) {
      console.error('Signout error:', error);
      // Even if signout fails, clear local state and redirect
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      window.location.href = '/auth';
    }
  };

  return {
    signUp,
    signIn,
    signOut
  };
}
