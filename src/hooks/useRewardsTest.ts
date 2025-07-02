import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useRewardsTest() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const testRewards = async () => {
      console.log('🧪 Testando sistemas de recompensas...');
      
      // Teste 1: Bônus diário
      try {
        const { data: loginBonusData, error: loginError } = await supabase.rpc('award_daily_login_bonus', {
          p_user_id: user.id
        });
        
        console.log('💰 Teste bônus diário:', { data: loginBonusData, error: loginError });
      } catch (err) {
        console.error('❌ Erro no teste de bônus diário:', err);
      }

      // Teste 2: Sincronizar benefícios
      try {
        const { error: syncError } = await supabase.rpc('sync_subscription_benefits', {
          p_user_id: user.id
        });
        
        console.log('🔄 Teste sincronização benefícios:', { error: syncError });
      } catch (err) {
        console.error('❌ Erro no teste de sincronização:', err);
      }

      // Teste 3: Recarregar ajudas
      try {
        const { error: refillError } = await supabase.rpc('refill_daily_help_aids');
        console.log('🛠️ Teste recarregar ajudas:', { error: refillError });
      } catch (err) {
        console.error('❌ Erro no teste de recarga de ajudas:', err);
      }
    };

    // Executar teste após 3 segundos
    const timer = setTimeout(testRewards, 3000);
    return () => clearTimeout(timer);
  }, [user?.id]);

  return null;
}