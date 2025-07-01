
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserLevelData {
  level: number;
  xp_required: number;
  next_level_xp: number;
  title: string;
  progress_percentage: number;
}

export interface UserTitleData {
  id: string;
  title: string;
  unlocked_at: string;
  is_active: boolean;
}

export function useUserLevel() {
  const { user } = useAuth();

  const { data: levelData, isLoading: levelLoading } = useQuery({
    queryKey: ['user-level', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Buscar dados do perfil para obter pontos
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_points, user_level, active_title')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Calcular nível baseado nos pontos atuais
      const { data: levelCalc, error: levelError } = await supabase
        .rpc('calculate_user_level', { p_total_points: profile.total_points });

      if (levelError) throw levelError;

      return {
        ...levelCalc[0],
        current_level: profile.user_level,
        active_title: profile.active_title,
        total_points: profile.total_points
      };
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const { data: userTitles, isLoading: titlesLoading } = useQuery({
    queryKey: ['user-titles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_titles')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data as UserTitleData[];
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
  });

  const setActiveTitle = async (title: string) => {
    if (!user?.id) return false;

    try {
      // Desativar título atual
      await supabase
        .from('user_titles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Ativar novo título
      await supabase
        .from('user_titles')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .eq('title', title);

      // Atualizar perfil
      await supabase
        .from('profiles')
        .update({ active_title: title })
        .eq('id', user.id);

      return true;
    } catch (error) {
      console.error('Erro ao alterar título:', error);
      return false;
    }
  };

  return {
    levelData,
    userTitles,
    loading: levelLoading || titlesLoading,
    setActiveTitle
  };
}
