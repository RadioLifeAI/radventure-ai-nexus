
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('AuthState: Auth state changed:', event, !!session?.user);
      
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      
      if (mounted) {
        setLoading(false);
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('AuthState: Starting initialization');
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }

        if (!mounted) return;

        console.log('AuthState: Initial session loaded:', !!initialSession);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (mounted) setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
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

  return {
    user,
    session,
    loading
  };
}
