
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { createNotification } from "@/utils/notifications";

export interface Notification {
  id: string;
  type: 'event_starting' | 'achievement_unlocked' | 'ranking_update' | 'new_event' | 'reminder' | 'report_update' | 'educational_alert' | 'abuse_warning' | 'study_recommendation';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}

// Cache persistente para notificações excluídas com TTL
const EXCLUDED_NOTIFICATIONS_KEY = 'excluded_notifications';
const CACHE_TTL_HOURS = 24; // Cache por 24 horas

class NotificationCache {
  private static getExcludedNotifications(): Set<string> {
    try {
      const stored = localStorage.getItem(EXCLUDED_NOTIFICATIONS_KEY);
      if (!stored) return new Set();
      
      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      // Limpar entradas expiradas
      const filtered = parsed.filter((item: any) => 
        now - item.timestamp < CACHE_TTL_HOURS * 60 * 60 * 1000
      );
      
      if (filtered.length !== parsed.length) {
        localStorage.setItem(EXCLUDED_NOTIFICATIONS_KEY, JSON.stringify(filtered));
      }
      
      return new Set(filtered.map((item: any) => item.id));
    } catch {
      return new Set();
    }
  }

  static addExcluded(notificationId: string): void {
    try {
      const existing = this.getExcludedNotifications();
      existing.add(notificationId);
      
      const toStore = Array.from(existing).map(id => ({
        id,
        timestamp: Date.now()
      }));
      
      localStorage.setItem(EXCLUDED_NOTIFICATIONS_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Erro ao salvar notificação excluída:', error);
    }
  }

  static isExcluded(notificationId: string): boolean {
    return this.getExcludedNotifications().has(notificationId);
  }

  static clearExpired(): void {
    this.getExcludedNotifications(); // Limpa automaticamente
  }
}

let lastFetchTime = 0;
const FETCH_DEBOUNCE = 2000; // 2 segundos de debounce

export function useRealNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Limpar cache expirado na inicialização
    NotificationCache.clearExpired();
    
    fetchNotifications();
    
    // Real-time subscription com debounce e cache
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const now = Date.now();
          if (now - lastFetchTime > FETCH_DEBOUNCE) {
            lastFetchTime = now;
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedNotifications: Notification[] = (data || [])
        .filter(notif => !NotificationCache.isExcluded(notif.id)) // Filtrar excluídas persistentemente
        .map(notif => ({
          id: notif.id,
          type: notif.type as Notification['type'],
          title: notif.title,
          message: notif.message,
          timestamp: new Date(notif.created_at),
          isRead: notif.is_read,
          priority: notif.priority as Notification['priority'],
          actionUrl: notif.action_url,
          actionLabel: notif.action_label,
          metadata: notif.metadata
        }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const removeNotification = async (notificationId: string) => {
    try {
      // 1. Adicionar ao cache persistente PRIMEIRO
      NotificationCache.addExcluded(notificationId);
      
      // 2. Remover da UI imediatamente
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      // 3. Tentar remover do banco com retry
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', user?.id);

          if (!error) {
            console.log('Notificação removida do banco com sucesso');
            break;
          }
          
          throw error;
        } catch (dbError) {
          attempts++;
          console.error(`Tentativa ${attempts} de remoção falhou:`, dbError);
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      }
      
      if (attempts === maxAttempts) {
        console.warn('Falha ao remover notificação do banco após várias tentativas. Mantendo exclusão apenas local.');
      }

    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    unreadCount: notifications.filter(n => !n.isRead).length
  };
}
