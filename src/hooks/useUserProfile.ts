
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

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Se o perfil não existir, criar um básico
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando perfil básico...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
              full_name: user.user_metadata?.full_name || '',
              type: 'USER',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;
          return newProfile as UserProfile;
        }
        throw error;
      }
      
      return data as UserProfile;
    },
    enabled: !!user?.id && isAuthenticated,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedProfile) => {
      // Atualizar cache local
      queryClient.setQueryData(['user-profile', user?.id], updatedProfile);
      
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
