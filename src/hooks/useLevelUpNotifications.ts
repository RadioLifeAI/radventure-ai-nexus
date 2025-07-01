
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useLevelUpNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Listener para mudanças na tabela profiles (level up)
    const channel = supabase
      .channel('level-up-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          const newData = payload.new;
          const oldData = payload.old;
          
          // Verificar se houve level up
          if (newData.user_level > oldData.user_level) {
            // Buscar dados do novo nível
            const { data: levelData } = await supabase
              .from('user_levels')
              .select('*')
              .eq('level', newData.user_level)
              .single();

            if (levelData) {
              // Salvar dados do level up no localStorage para mostrar modal
              const levelUpData = {
                new_level: newData.user_level,
                title_unlocked: levelData.title_unlocked,
                radcoin_reward: levelData.radcoin_reward
              };
              
              localStorage.setItem(`levelup_${user.id}`, JSON.stringify(levelUpData));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return null;
}
