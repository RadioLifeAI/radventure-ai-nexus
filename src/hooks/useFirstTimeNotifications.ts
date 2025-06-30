
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFirstTimeNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Verificar se é a primeira conquista
    checkFirstAchievement();
    
    // Verificar se é o primeiro evento
    checkFirstEvent();
    
    // Verificar se é a primeira compra
    checkFirstPurchase();
  }, [user]);

  const checkFirstAchievement = async () => {
    if (!user) return;

    try {
      // Verificar se já enviou notificação de primeira conquista
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'first_achievement')
        .single();

      if (existingNotification) return;

      // Verificar se tem alguma conquista
      const { data: achievements } = await supabase
        .from('user_achievements_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .limit(1);

      if (achievements && achievements.length > 0) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            type: 'first_achievement',
            title: '🏆 Primeira Conquista!',
            message: 'Parabéns! Você desbloqueou sua primeira conquista. Continue assim!',
            priority: 'high',
            action_url: '/app/conquistas',
            action_label: 'Ver Conquistas',
            metadata: { first_time: true }
          }]);
      }
    } catch (error) {
      console.error('Erro ao verificar primeira conquista:', error);
    }
  };

  const checkFirstEvent = async () => {
    if (!user) return;

    try {
      // Verificar se já enviou notificação de primeiro evento
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'first_event')
        .single();

      if (existingNotification) return;

      // Verificar se participou de algum evento
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (registrations && registrations.length > 0) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            type: 'first_event',
            title: '🚀 Primeiro Evento!',
            message: 'Bem-vindo ao mundo dos eventos! Boa sorte na sua primeira participação!',
            priority: 'high',
            action_url: '/app/eventos',
            action_label: 'Ver Eventos',
            metadata: { first_time: true }
          }]);
      }
    } catch (error) {
      console.error('Erro ao verificar primeiro evento:', error);
    }
  };

  const checkFirstPurchase = async () => {
    if (!user) return;

    try {
      // Verificar se já enviou notificação de primeira compra
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'first_purchase')
        .single();

      if (existingNotification) return;

      // Verificar se fez alguma transação de compra
      const { data: purchases } = await supabase
        .from('radcoin_transactions_log')
        .select('id')
        .eq('user_id', user.id)
        .in('tx_type', ['subscription_purchase', 'help_aid_purchase'])
        .limit(1);

      if (purchases && purchases.length > 0) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            type: 'first_purchase',
            title: '💳 Primeira Compra!',
            message: 'Obrigado pela sua primeira compra! Aproveite seus novos benefícios!',
            priority: 'high',
            action_url: '/app/estatisticas',
            action_label: 'Ver Benefícios',
            metadata: { first_time: true }
          }]);
      }
    } catch (error) {
      console.error('Erro ao verificar primeira compra:', error);
    }
  };
}
