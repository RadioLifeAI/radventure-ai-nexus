
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Log específico para callback do Google OAuth
        if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'google') {
          console.log('Google OAuth callback successful:', session.user.email);
        }
        
        // Log para debug de erros
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    // THEN check for existing session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'No session');
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Error in getSession:', error);
        setLoading(false);
      }
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      // Usar a URL atual como base para o redirect
      const redirectUrl = `${window.location.origin}/app`;
      
      console.log('SignUp attempt with redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Conta criada!',
        description: 'Verifique seu email para confirmar a conta.',
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: 'Erro ao criar conta',
        description: error.message,
        variant: 'destructive'
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive'
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Usar a URL atual como base para o redirect
      const redirectUrl = `${window.location.origin}/app`;
      
      console.log('Google SignIn attempt with redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) throw error;

      console.log('Google OAuth initiated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: 'Erro no login com Google',
        description: error.message,
        variant: 'destructive'
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Erro no logout',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };
}
