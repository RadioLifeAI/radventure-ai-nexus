import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

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

// Flag de desenvolvimento - quando true, novos perfis são criados como ADMIN
const IS_DEVELOPMENT = true;

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      console.log('Fetching profile for user:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID available');
        throw new Error('No user ID');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile fetch error:', error);
        
        // Se o perfil não existir, criar um básico
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating basic profile...');
          
          const newProfileData = {
            id: user.id,
            email: user.email || '',
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            // Durante desenvolvimento, todos os novos perfis são ADMIN
            type: IS_DEVELOPMENT ? 'ADMIN' as const : 'USER' as const,
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
            console.error('Error creating profile:', createError);
            throw createError;
          }

          console.log(`Profile created successfully as ${IS_DEVELOPMENT ? 'ADMIN' : 'USER'}:`, newProfile);
          
          // Durante desenvolvimento, também adicionar role administrativa
          if (IS_DEVELOPMENT) {
            try {
              await supabase
                .from('admin_user_roles')
                .insert({
                  user_id: user.id,
                  admin_role: 'TechAdmin',
                  assigned_by: user.id,
                  is_active: true
                });
              console.log('✅ Role TechAdmin adicionada automaticamente');
            } catch (roleError) {
              console.warn('⚠️ Aviso: Não foi possível adicionar role administrativa:', roleError);
            }
          }
          
          return newProfile as UserProfile;
        }
        throw error;
      }
      
      console.log('Profile fetched successfully:', data);
      return data as UserProfile;
    },
    enabled: !!user?.id && isAuthenticated,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Tentar novamente apenas se não for erro de criação
      return failureCount < 2 && error?.code !== 'PGRST116';
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) {
        console.error('No user ID for profile update');
        throw new Error('No user ID');
      }
      
      console.log('Updating profile with data:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      console.log('Profile updated successfully:', data);
      return data;
    },
    onSuccess: (updatedProfile) => {
      // Atualizar cache local
      queryClient.setQueryData(['user-profile', user?.id], updatedProfile);
      
      // Refresh avatar upload hook if avatar was updated
      if (updatedProfile.avatar_url) {
        queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      }
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    }
  });

  // Função para refrescar dados do perfil
  const refreshProfile = () => {
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
