
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'event_starting' | 'achievement_unlocked' | 'ranking_update' | 'new_event' | 'reminder' | 'radcoin_reward' | 'streak_milestone' | 'daily_login_bonus' | 'case_milestone' | 'report_update' | 'ai_chat_usage';
export type NotificationPriority = 'low' | 'medium' | 'high';

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

// Função específica para notificações de report
export async function createReportNotification({
  userId,
  reportId,
  title,
  message,
  priority = 'medium'
}: {
  userId: string;
  reportId: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
}) {
  return createNotification({
    userId,
    type: 'report_update',
    title,
    message,
    priority,
    metadata: { report_id: reportId }
  });
}

// Função para notificações do RadBot AI
export async function createRadBotNotification({
  userId,
  title,
  message,
  priority = 'low',
  sessionId
}: {
  userId: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
  sessionId?: string;
}) {
  return createNotification({
    userId,
    type: 'ai_chat_usage',
    title,
    message,
    priority,
    metadata: { session_id: sessionId, source: 'radbot_ai' }
  });
}

// Função para marcar notificação como lida
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error };
  }
}

// Função para obter estatísticas de notificações
export async function getNotificationStats() {
  try {
    const { data: totalSent, error: sentError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' });

    const { data: totalRead, error: readError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('is_read', true);

    if (sentError || readError) throw sentError || readError;

    const sentCount = totalSent?.length || 0;
    const readCount = totalRead?.length || 0;
    const openRate = sentCount > 0 ? Math.round((readCount / sentCount) * 100) : 0;

    return {
      success: true,
      stats: {
        totalSent: sentCount,
        totalRead: readCount,
        openRate
      }
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return { success: false, error };
  }
}
