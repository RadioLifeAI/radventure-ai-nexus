import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Interface para o retorno da função award_daily_login_bonus
interface DailyLoginBonusResult {
  awarded: boolean;
  radcoins?: number;
  streak?: number;
  message: string;
}

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

        // Gamificação: Bonus de login diário (FASE 3)
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: bonusResult } = await supabase.rpc('award_daily_login_bonus', {
              p_user_id: session.user.id
            });
            
            const typedResult = bonusResult as DailyLoginBonusResult;
            
            if (typedResult?.awarded) {
              // Toast não-intrusivo para bonus
              setTimeout(() => {
                toast({
                  title: '🎉 Bonus de Login!',
                  description: typedResult.message,
                  duration: 3000,
                });
              }, 1000);
            }
          } catch (error) {
            console.log('Erro no bonus de login:', error);
          }
        }
      }
    );

    // THEN check for existing session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`; // FASE 1: Correção do redirecionamento
      
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard` // FASE 1: Correção do redirecionamento
        }
      });

      if (error) throw error;

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
