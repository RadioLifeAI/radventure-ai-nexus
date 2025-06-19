
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface UsuarioApp {
  id: string;
  email: string;
  nome_completo: string;
  username: string;
  tipo: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar_url?: string;
  radcoin_balance: number;
  total_points: number;
  roles: string[];
}

export function useUsuariosApp() {
  const [usuario, setUsuario] = useState<UsuarioApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Recuperar token do localStorage
    const savedToken = localStorage.getItem('radventure_token');
    if (savedToken) {
      setToken(savedToken);
      verificarToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verificarToken = async (tokenToVerify: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-usuarios', {
        body: null,
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      }, {
        method: 'POST'
      });

      if (error || !data?.success) {
        // Token inválido, limpar
        localStorage.removeItem('radventure_token');
        setToken(null);
        setUsuario(null);
      } else {
        setUsuario(data.usuario);
        setToken(tokenToVerify);
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('radventure_token');
      setToken(null);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-usuarios', {
        body: { email, password }
      }, {
        method: 'POST'
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Erro ao fazer login');
      }

      // Salvar token
      localStorage.setItem('radventure_token', data.token);
      setToken(data.token);
      setUsuario(data.usuario);

      toast({
        title: 'Login realizado!',
        description: `Bem-vindo, ${data.usuario.nome_completo}!`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro no login',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, nome_completo: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-usuarios', {
        body: { email, password, nome_completo }
      }, {
        method: 'POST'
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Erro ao criar conta');
      }

      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso. Faça login para continuar.',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Erro interno',
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await supabase.functions.invoke('auth-usuarios', {
          body: null,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }, {
          method: 'POST'
        });
      }
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      // Limpar dados locais sempre
      localStorage.removeItem('radventure_token');
      setToken(null);
      setUsuario(null);
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    }
  };

  const isAuthenticated = !!usuario && !!token;
  const isAdmin = usuario?.tipo === 'ADMIN' || usuario?.tipo === 'SUPER_ADMIN';
  const isSuperAdmin = usuario?.tipo === 'SUPER_ADMIN';

  return {
    usuario,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    token
  };
}
