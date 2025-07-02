
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
  Brain,
  AlertTriangle
} from "lucide-react";
import { useRealNotifications } from "@/hooks/useRealNotifications";
import { useEducationalProtections } from "@/hooks/useEducationalProtections";
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

  // Inicializar proteções educacionais
  useEducationalProtections();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_starting': return <Zap className="h-4 w-4 text-red-500" />;
      case 'achievement_unlocked': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'ranking_update': return <Star className="h-4 w-4 text-blue-500" />;
      case 'new_event': return <Gift className="h-4 w-4 text-purple-500" />;
      case 'reminder': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'report_update': return <Bell className="h-4 w-4 text-blue-500" />;
      case 'educational_alert': return <Brain className="h-4 w-4 text-green-500" />;
      case 'abuse_warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'study_recommendation': return <Star className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string, type: string) => {
    // Cores especiais para notificações educacionais
    if (type === 'educational_alert') return 'border-l-green-500 bg-green-50';
    if (type === 'abuse_warning') return 'border-l-orange-500 bg-orange-50';
    if (type === 'study_recommendation') return 'border-l-purple-500 bg-purple-50';
    
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-white';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Para notificações de report, abrir modal
    if (notification.type === 'report_update' && notification.metadata?.report_id) {
      if ((window as any).openReportModal) {
        (window as any).openReportModal(notification.metadata.report_id);
      }
      setIsOpen(false);
      return;
    }
    
    // Para outras notificações, navegar normalmente
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
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
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notificações - Sistema aprimorado sem reaparecer notificações excluídas */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-xl">
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
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      getPriorityColor(notification.priority, notification.type)
                    } ${!notification.isRead ? 'bg-opacity-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {notification.timestamp.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <div className="flex items-center gap-2">
                            {notification.actionLabel && notification.type !== 'report_update' && (
                              <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                                {notification.actionLabel}
                              </Button>
                            )}
                            {notification.type === 'report_update' && (
                              <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                                Ver Report
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-xs px-2 py-1 hover:text-red-500"
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

            {notifications.length > 0 && unreadCount > 0 && (
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="w-full text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
