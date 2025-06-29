
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  X,
  Clock,
  Trophy,
  Zap,
  Star,
  Gift,
  CheckCircle,
  History,
  Coins,
  BookOpen,
  Calendar,
  AlertTriangle,
  Megaphone
} from "lucide-react";
import { useRealNotifications } from "@/hooks/useRealNotifications";
import { useNavigate } from "react-router-dom";

export function EventsNotificationSystem() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    unreadCount 
  } = useRealNotifications();

  // Mostrar apenas as 5 mais recentes no dropdown
  const recentNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'event_starting': <Zap className="h-4 w-4 text-red-500" />,
      'achievement_unlocked': <Trophy className="h-4 w-4 text-yellow-500" />,
      'ranking_update': <Star className="h-4 w-4 text-blue-500" />,
      'new_event': <Calendar className="h-4 w-4 text-purple-500" />,
      'reminder': <Clock className="h-4 w-4 text-gray-500" />,
      'radcoin_reward': <Coins className="h-4 w-4 text-green-500" />,
      'streak_milestone': <Zap className="h-4 w-4 text-orange-500" />,
      'case_completed': <BookOpen className="h-4 w-4 text-blue-500" />,
      'learning_tip': <Gift className="h-4 w-4 text-pink-500" />,
      'system_maintenance': <AlertTriangle className="h-4 w-4 text-red-500" />,
      'feature_announcement': <Megaphone className="h-4 w-4 text-indigo-500" />,
      'default': <Bell className="h-4 w-4 text-gray-500" />
    };
    
    return iconMap[type as keyof typeof iconMap] || iconMap.default;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-white';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleViewAll = () => {
    navigate('/app/notificacoes');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Botão de notificações com estilo gamificado */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notificações */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden z-50 shadow-xl">
          <CardContent className="p-0">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Carregando...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      getPriorityColor(notification.priority)
                    } ${!notification.isRead ? 'bg-opacity-70' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium line-clamp-1 ${
                            !notification.isRead ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {notification.timestamp.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <div className="flex items-center gap-1">
                            {notification.actionLabel && (
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                {notification.actionLabel}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-xs px-1 py-1 h-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer com ações */}
            <div className="p-4 border-t bg-gray-50 space-y-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="w-full text-sm justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAll}
                className="w-full text-sm justify-center"
              >
                <History className="h-4 w-4 mr-2" />
                Ver todas ({notifications.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
