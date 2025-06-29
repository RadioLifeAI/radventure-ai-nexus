import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { createNotification, createNotificationForAllUsers, NotificationType } from "@/utils/notifications";

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
}

export function useNotificationAdmin() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>
  });

  // Buscar todas as notificações (admin)
  const fetchAllNotifications = async (filters?: {
    type?: string;
    priority?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allNotifications, error } = await supabase
        .from('notifications')
        .select('type, priority, is_read');

      if (error) throw error;

      const total = allNotifications?.length || 0;
      const unread = allNotifications?.filter(n => !n.is_read).length || 0;
      
      const byType = allNotifications?.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const byPriority = allNotifications?.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setStats({ total, unread, byType, byPriority });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Criar notificação para usuário específico
  const createSingleNotification = async (
    userId: string,
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
    }
  ) => {
    try {
      const result = await createNotification({
        userId,
        ...notification
      });
      
      if (result.success) {
        await fetchAllNotifications();
        await fetchStats();
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return { success: false, error };
    }
  };

  // Criar notificação em massa
  const createBulkNotification = async (
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
    }
  ) => {
    try {
      const result = await createNotificationForAllUsers(notification);
      
      if (result.success) {
        await fetchAllNotifications();
        await fetchStats();
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao criar notificações em massa:', error);
      return { success: false, error };
    }
  };

  // Criar notificação com filtros
  const createFilteredNotification = async (
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
    },
    userFilter: {
      academic_stage?: string;
      medical_specialty?: string;
      min_points?: number;
    }
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_filtered_notification', {
        p_type: notification.type,
        p_title: notification.title,
        p_message: notification.message,
        p_priority: notification.priority || 'medium',
        p_action_url: notification.actionUrl,
        p_action_label: notification.actionLabel,
        p_metadata: notification.metadata || {},
        p_user_filter: userFilter
      });

      if (error) throw error;

      await fetchAllNotifications();
      await fetchStats();
      
      return { success: true, count: data };
    } catch (error) {
      console.error('Erro ao criar notificações filtradas:', error);
      return { success: false, error };
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchStats();
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return { success: false, error };
    }
  };

  const cleanupOldNotifications = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_old_notifications');
      
      if (error) throw error;

      await fetchAllNotifications();
      await fetchStats();
      
      return { success: true };
    } catch (error) {
      console.error('Erro na limpeza:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  return {
    notifications,
    loading,
    stats,
    fetchAllNotifications,
    fetchStats,
    createSingleNotification,
    createBulkNotification,
    createFilteredNotification,
    deleteNotification,
    cleanupOldNotifications
  };
}
