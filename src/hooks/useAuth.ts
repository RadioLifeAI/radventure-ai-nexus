
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
    console.log('🔧 Inicializando hook useAuth...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, {
          hasSession: !!session,
          userEmail: session?.user?.email,
          userId: session?.user?.id?.slice(0, 8) + '...'
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Gamificação: Bonus de login diário otimizado (FASE 3)
        if (event === 'SIGNED_IN' && session?.user && event !== 'TOKEN_REFRESHED') {
          console.log('✅ Usuário logado, verificando bonus de login...');
          
          // Aguardar um pouco menos para melhor performance
          setTimeout(async () => {
            try {
              const { data: bonusResult } = await supabase.rpc('award_daily_login_bonus', {
                p_user_id: session.user.id
              });
              
              const typedResult = bonusResult as unknown as DailyLoginBonusResult;
              
              if (typedResult?.awarded) {
                console.log('🎉 Bonus de login concedido:', typedResult);
                setTimeout(() => {
                  toast({
                    title: '🎉 Bonus de Login!',
                    description: typedResult.message,
                    duration: 2000, // Reduzir duração
                  });
                }, 500); // Reduzir delay
              }
            } catch (error) {
              console.log('⚠️ Erro no bonus de login:', error);
            }
          }, 1000); // Reduzir delay de 2000 para 1000
        }
      }
    );

    // THEN check for existing session com timeout otimizado
    const getSession = async () => {
      console.log('🔍 Verificando sessão existente...');
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log('✅ Sessão existente encontrada:', session.user.email);
        } else {
          console.log('ℹ️ Nenhuma sessão ativa encontrada');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro inesperado ao buscar sessão:', error);
        setLoading(false);
      }
    };

    getSession();

    return () => {
      console.log('🧹 Limpando subscription do auth listener');
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    console.log('📝 Iniciando cadastro para:', email);
    
    try {
      // CORREÇÃO: Usar URL absoluta para redirecionamento
      const redirectUrl = `${window.location.origin}/dashboard`;
      console.log('📍 Redirect URL configurada:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || ''
          }
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        throw error;
      }

      console.log('✅ Cadastro realizado:', { userId: data.user?.id, needsConfirmation: !data.session });

      if (data.session) {
        toast({
          title: 'Bem-vindo!',
          description: 'Conta criada e login realizado com sucesso.',
          duration: 2000,
        });
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar a conta.',
          duration: 3000,
        });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
        duration: 3000,
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('🔑 Iniciando login para:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        throw error;
      }

      console.log('✅ Login realizado com sucesso:', data.user?.email);

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
        duration: 2000,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      let errorMessage = 'Erro desconhecido';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Confirme seu email antes de fazer login';
      } else {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    console.log('🌐 Iniciando login com Google...');
    
    try {
      // CORREÇÃO: Usar URL absoluta e garantir redirecionamento correto
      const redirectUrl = `${window.location.origin}/dashboard`;
      console.log('📍 Google redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Otimizar para seleção mais rápida
          }
        }
      });

      if (error) {
        console.error('❌ Erro no login com Google:', error);
        throw error;
      }

      console.log('🚀 Redirecionamento para Google iniciado');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      
      let errorMessage = 'Erro desconhecido';
      if (error.message.includes('popup')) {
        errorMessage = 'Popup bloqueado. Permita popups para este site.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro no login com Google',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    console.log('🚪 Iniciando logout...');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }

      console.log('✅ Logout realizado com sucesso');
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      toast({
        title: 'Erro no logout',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
        duration: 3000,
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
