
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'event_starting' | 'achievement_unlocked' | 'ranking_update' | 'new_event' | 'reminder';
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
