
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, RefreshCw, Eye, ExternalLink,
  Bell, Trophy, Coins, Zap, Calendar,
  BookOpen, Gift, AlertTriangle, Megaphone
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface NotificationsListProps {
  notifications: any[];
  loading: boolean;
  onDelete: (id: string) => Promise<any>;
  onRefresh: () => void;
}

export function NotificationsList({ notifications, loading, onDelete, onRefresh }: NotificationsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'achievement_unlocked': Trophy,
      'streak_milestone': Zap,
      'radcoin_reward': Coins,
      'event_starting': Calendar,
      'case_completed': BookOpen,
      'learning_tip': Gift,
      'system_maintenance': AlertTriangle,
      'feature_announcement': Megaphone,
      'default': Bell
    };
    
    const IconComponent = iconMap[type as keyof typeof iconMap] || iconMap.default;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colorMap[priority as keyof typeof colorMap] || colorMap.medium;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta notificação?')) return;

    setDeletingId(id);
    try {
      const result = await onDelete(id);
      if (result.success) {
        toast.success('Notificação removida');
      } else {
        toast.error('Erro ao remover notificação');
      }
    } catch (error) {
      toast.error('Erro ao remover notificação');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando notificações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notificações Recentes</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                        
                        <Badge
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                        
                        <span className="capitalize">
                          {notification.type.replace('_', ' ')}
                        </span>
                        
                        {notification.profiles && (
                          <span>
                            Para: {notification.profiles.full_name || notification.profiles.username}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {notification.action_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={notification.action_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deletingId === notification.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {deletingId === notification.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
