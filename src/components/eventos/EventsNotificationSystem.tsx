
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  X,
  Clock,
  Trophy,
  Zap,
  Users,
  Star,
  Gift,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface Notification {
  id: string;
  type: 'event_starting' | 'achievement_unlocked' | 'ranking_update' | 'new_event' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

export function EventsNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Simular notificações em tempo real
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "event_starting",
        title: "Evento iniciando em 5 minutos!",
        message: "O evento 'Desafio Neurologia Avançada' está prestes a começar. Prepare-se!",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        isRead: false,
        priority: "high",
        actionUrl: "/evento/123",
        actionLabel: "Participar Agora"
      },
      {
        id: "2",
        type: "achievement_unlocked",
        title: "Nova conquista desbloqueada! 🏆",
        message: "Você conquistou o badge 'Speed Demon' por completar um evento em menos de 5 minutos!",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: false,
        priority: "medium",
        actionUrl: "/profile/achievements",
        actionLabel: "Ver Conquistas"
      },
      {
        id: "3",
        type: "ranking_update",
        title: "Você subiu no ranking! 📈",
        message: "Parabéns! Você agora está na 5ª posição do ranking geral de Neurologia.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: true,
        priority: "medium",
        actionUrl: "/rankings",
        actionLabel: "Ver Ranking"
      },
      {
        id: "4",
        type: "new_event",
        title: "Novo evento disponível! ✨",
        message: "Um novo evento de Cardiologia foi criado: 'Arritmias na Prática Clínica'",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        isRead: true,
        priority: "low",
        actionUrl: "/eventos",
        actionLabel: "Ver Evento"
      }
    ];

    setNotifications(mockNotifications);

    // Simular novas notificações
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "reminder",
        title: "Lembrete de estudo 📚",
        message: "Que tal resolver alguns casos antes do evento de hoje à noite?",
        timestamp: new Date(),
        isRead: false,
        priority: "low"
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    }, 30000); // Nova notificação a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_starting': return <Zap className="h-4 w-4 text-red-500" />;
      case 'achievement_unlocked': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'ranking_update': return <Star className="h-4 w-4 text-blue-500" />;
      case 'new_event': return <Gift className="h-4 w-4 text-purple-500" />;
      case 'reminder': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-white';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel de notificações */}
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
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      getPriorityColor(notification.priority)
                    } ${!notification.isRead ? 'bg-opacity-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
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
                            {notification.actionUrl && (
                              <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                                {notification.actionLabel}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-xs px-2 py-1"
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

            {notifications.length > 0 && (
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
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
