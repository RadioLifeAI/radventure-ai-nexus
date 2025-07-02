
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useProfileRewards } from './useProfileRewards';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  type: 'USER' | 'ADMIN';
  radcoin_balance: number;
  total_points: number;
  current_streak: number;
  avatar_url?: string;
  bio?: string;
  country_code?: string;
  city?: string;
  state?: string;
  medical_specialty?: string;
  academic_specialty?: string;
  academic_stage?: 'Student' | 'Intern' | 'Resident' | 'Specialist';
  college?: string;
  birthdate?: string;
  preferences?: any;
  active_title?: string;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkAndAwardProfileRewards } = useProfileRewards();
  
  // Controles para evitar execução múltipla das recompensas
  const hasCheckedRewardsRef = useRef(false);
  const processingRewardsRef = useRef(false);
  const sessionKeyRef = useRef(`profile_rewards_${Date.now()}_${Math.random()}`);

  // Função de busca memoizada com correções de compatibilidade
  const fetchProfile = useCallback(async () => {
    console.log('👤 Buscando perfil para usuário:', user?.id?.slice(0, 8) + '...');
    
    if (!user?.id) {
      console.log('❌ No user ID available');
      throw new Error('No user ID');
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('⚠️ Profile fetch error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        
        if (error.code === 'PGRST116') {
          console.log('🔧 Perfil não encontrado, aguardando criação automática...');
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (retryError && retryError.code === 'PGRST116') {
            console.log('🛠️ Criando perfil manualmente...');
            
            const newProfileData = {
              id: user.id,
              email: user.email || '',
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              type: 'USER' as const,
              radcoin_balance: 0,
              total_points: 0,
              current_streak: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select()
              .single();

            if (createError) {
              console.error('❌ Error creating profile:', createError);
              throw createError;
            }

            console.log('✅ Perfil criado manualmente:', newProfile.email);
            return newProfile as UserProfile;
          } else if (retryData) {
            console.log('✅ Perfil encontrado na segunda tentativa:', retryData.email);
            return retryData as UserProfile;
          } else {
            throw retryError;
          }
        }
        throw error;
      }
      
      console.log('✅ Perfil carregado:', data.email);
      
      // CORREÇÃO DE COMPATIBILIDADE: Verificar se o perfil tem campos obrigatórios
      const profileData = data as UserProfile;
      
      // Se não tem active_title definido mas deveria ter, definir um padrão
      if (!profileData.active_title && profileData.total_points >= 100) {
        console.log('🔧 Adicionando título padrão para perfil antigo');
        
        try {
          await supabase
            .from('profiles')
            .update({ 
              active_title: 'Estudante de Radiologia',
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          profileData.active_title = 'Estudante de Radiologia';
        } catch (updateError) {
          console.warn('⚠️ Não foi possível atualizar título:', updateError);
        }
      }
      
      return profileData;
    } catch (fetchError) {
      console.error('❌ Erro geral ao buscar perfil:', fetchError);
      throw fetchError;
    }
  }, [user?.id, user?.email, user?.user_metadata]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user?.id && isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      return failureCount < 2 && error?.code !== 'PGRST116';
    },
  });

  // Processo de recompensas otimizado com melhor tratamento de erros
  const processRewards = useCallback(async (profile: UserProfile) => {
    if (hasCheckedRewardsRef.current || processingRewardsRef.current) {
      return;
    }

    const sessionKey = sessionKeyRef.current;
    const sessionCheck = sessionStorage.getItem(`profile_rewards_${user?.id}`);
    
    if (sessionCheck) {
      hasCheckedRewardsRef.current = true;
      return;
    }

    try {
      processingRewardsRef.current = true;
      hasCheckedRewardsRef.current = true;
      sessionStorage.setItem(`profile_rewards_${user?.id}`, sessionKey);
      
      console.log('🎯 Iniciando verificação ÚNICA de recompensas...');
      await checkAndAwardProfileRewards(profile);
      console.log('✅ Verificação de recompensas concluída');
      
    } catch (error) {
      console.error('❌ Erro ao verificar recompensas:', error);
      hasCheckedRewardsRef.current = false;
      processingRewardsRef.current = false;
      sessionStorage.removeItem(`profile_rewards_${user?.id}`);
    } finally {
      processingRewardsRef.current = false;
    }
  }, [user?.id, checkAndAwardProfileRewards]);

  // Execução das recompensas
  useEffect(() => {
    if (profile && user) {
      processRewards(profile);
    }
  }, [profile?.id, user?.id, processRewards]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) {
        throw new Error('No user ID');
      }
      
      console.log('📝 Atualizando perfil:', Object.keys(updates));
      
      // CORREÇÃO DE COMPATIBILIDADE: Filtrar campos que podem não existir
      const safeUpdates = { ...updates };
      
      // Garantir que active_title seja tratado corretamente
      if ('active_title' in safeUpdates && !safeUpdates.active_title) {
        delete safeUpdates.active_title;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...safeUpdates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }
      
      console.log('✅ Perfil atualizado:', data.email);
      return data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['user-profile', user?.id], updatedProfile);
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
      
      console.log('✅ Cache atualizado sem invalidação');
    },
    onError: (error: any) => {
      console.error('❌ Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    }
  });

  const refreshProfile = useCallback(() => {
    console.log('🔄 Atualizando perfil manualmente...');
    queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
  }, [queryClient, user?.id]);

  return useMemo(() => ({
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    refreshProfile
  }), [profile, isLoading, error, updateProfileMutation.mutate, updateProfileMutation.isPending, refreshProfile]);
}
