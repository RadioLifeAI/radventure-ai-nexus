
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | 'event_starting' | 'achievement_unlocked' | 'ranking_update' | 'new_event' | 'reminder'
  | 'case_completed' | 'streak_milestone' | 'radcoin_purchase' | 'radcoin_reward' 
  | 'journey_completed' | 'performance_milestone' | 'social_mention' | 'friend_activity'
  | 'learning_tip' | 'weekly_summary' | 'system_maintenance' | 'feature_announcement'
  | 'subscription_expiring' | 'subscription_renewed' | 'level_up' | 'badge_earned'
  | 'challenge_invitation' | 'study_reminder' | 'leaderboard_position' | 'daily_bonus';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface CreateNotificationProps {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  priority = 'medium',
  actionUrl,
  actionLabel,
  metadata = {}
}: CreateNotificationProps) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        priority,
        action_url: actionUrl,
        action_label: actionLabel,
        metadata
      }]);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return { success: false, error };
  }
}

// Função para criar notificação para todos os usuários
export async function createNotificationForAllUsers({
  type,
  title,
  message,
  priority = 'medium',
  actionUrl,
  actionLabel,
  metadata = {}
}: Omit<CreateNotificationProps, 'userId'>) {
  try {
    // Buscar todos os usuários ativos
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('type', 'USER');

    if (usersError) throw usersError;

    if (!users || users.length === 0) return { success: true };

    // Criar notificação para cada usuário
    const notifications = users.map(user => ({
      user_id: user.id,
      type,
      title,
      message,
      priority,
      action_url: actionUrl,
      action_label: actionLabel,
      metadata
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao criar notificações em massa:', error);
    return { success: false, error };
  }
}

// Templates de notificação para facilitar o uso
export const NotificationTemplates = {
  // Sistema e Manutenção  
  systemMaintenance: (duration: string) => ({
    type: 'system_maintenance' as NotificationType,
    title: '🔧 Manutenção Programada',
    message: `O sistema ficará indisponível por ${duration} para melhorias. Pedimos desculpas pelo inconveniente.`,
    priority: 'high' as NotificationPriority
  }),

  // Novos recursos
  featureAnnouncement: (featureName: string) => ({
    type: 'feature_announcement' as NotificationType,
    title: '🎉 Nova Funcionalidade!',
    message: `Novidade na plataforma: ${featureName}. Explore agora!`,
    priority: 'medium' as NotificationPriority
  }),

  // Lembretes de estudo
  dailyStudyReminder: () => ({
    type: 'study_reminder' as NotificationType,
    title: '📚 Hora de Estudar!',
    message: 'Não esqueça de praticar hoje. Resolva alguns casos para manter seu progresso!',
    priority: 'low' as NotificationPriority,
    actionUrl: '/app/casos',
    actionLabel: 'Estudar Agora'
  }),

  // Resumo semanal
  weeklyProgress: (casesCount: number, streakDays: number) => ({
    type: 'weekly_summary' as NotificationType,
    title: '📊 Resumo da Semana',
    message: `Esta semana você resolveu ${casesCount} casos e manteve ${streakDays} dias de streak!`,
    priority: 'low' as NotificationPriority,
    actionUrl: '/app/estatisticas',
    actionLabel: 'Ver Estatísticas'
  }),

  // Posição no ranking
  leaderboardUpdate: (position: number, category: string) => ({
    type: 'leaderboard_position' as NotificationType,
    title: '🏆 Posição no Ranking',
    message: `Você está em #${position} no ranking de ${category}!`,
    priority: 'medium' as NotificationPriority,
    actionUrl: '/app/rankings',
    actionLabel: 'Ver Ranking'
  }),

  // Bônus diário
  dailyBonus: (amount: number) => ({
    type: 'daily_bonus' as NotificationType,
    title: '🎁 Bônus Diário',
    message: `Você recebeu ${amount} RadCoins pelo login diário!`,
    priority: 'low' as NotificationPriority,
    actionUrl: '/app/estatisticas',
    actionLabel: 'Ver Saldo'
  })
};
