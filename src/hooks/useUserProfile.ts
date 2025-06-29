
import { useState, useEffect, useRef } from 'react';
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
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkAndAwardProfileRewards } = useProfileRewards();
  
  // Controles super rigorosos para evitar execução múltipla
  const hasCheckedRewardsRef = useRef(false);
  const processingRewardsRef = useRef(false);
  const sessionKeyRef = useRef(`profile_rewards_${Date.now()}_${Math.random()}`);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      console.log('👤 Buscando perfil para usuário:', user?.id?.slice(0, 8) + '...');
      
      if (!user?.id) {
        console.log('❌ No user ID available');
        throw new Error('No user ID');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('⚠️ Profile fetch error:', error);
        
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
      return data as UserProfile;
    },
    enabled: !!user?.id && isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Aumentado para 5 minutos
    retry: (failureCount, error: any) => {
      return failureCount < 2 && error?.code !== 'PGRST116';
    },
  });

  // Controle SUPER RIGOROSO para verificar recompensas apenas UMA vez
  useEffect(() => {
    const executeRewards = async () => {
      // Múltiplas verificações de segurança
      if (!profile || !user) {
        console.log('❌ Sem perfil ou usuário para recompensas');
        return;
      }

      if (hasCheckedRewardsRef.current) {
        console.log('🔒 Recompensas já verificadas - bloqueando execução');
        return;
      }

      if (processingRewardsRef.current) {
        console.log('⏳ Já processando recompensas - bloqueando execução');
        return;
      }

      // Verificar session storage para evitar execução dupla
      const sessionKey = sessionKeyRef.current;
      const sessionCheck = sessionStorage.getItem(`profile_rewards_${user.id}`);
      
      if (sessionCheck) {
        console.log('🔒 Session storage indica recompensas já processadas');
        hasCheckedRewardsRef.current = true;
        return;
      }

      try {
        // Marcar como processando IMEDIATAMENTE
        processingRewardsRef.current = true;
        hasCheckedRewardsRef.current = true;
        
        // Salvar no session storage
        sessionStorage.setItem(`profile_rewards_${user.id}`, sessionKey);
        
        console.log('🎯 Iniciando verificação ÚNICA de recompensas...');
        
        // Executar verificação de recompensas
        await checkAndAwardProfileRewards(profile);
        
        console.log('✅ Verificação de recompensas concluída');
        
      } catch (error) {
        console.error('❌ Erro ao verificar recompensas:', error);
        // Em caso de erro, resetar controles para permitir nova tentativa
        hasCheckedRewardsRef.current = false;
        processingRewardsRef.current = false;
        sessionStorage.removeItem(`profile_rewards_${user.id}`);
      } finally {
        processingRewardsRef.current = false;
      }
    };

    executeRewards();
  }, [profile?.id, user?.id]); // Dependências mínimas e estáveis

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) {
        console.error('❌ No user ID for profile update');
        throw new Error('No user ID');
      }
      
      console.log('📝 Atualizando perfil:', Object.keys(updates));
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
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
      // Usar apenas setQueryData para atualizar o cache - SEM invalidateQueries
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

  const refreshProfile = () => {
    console.log('🔄 Atualizando perfil manualmente...');
    queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    refreshProfile
  };
}
