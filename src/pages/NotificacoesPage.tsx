
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell, CheckCircle, Trash2, Filter, Search,
  Trophy, Zap, Coins, Calendar, BookOpen,
  Gift, AlertTriangle, Megaphone, Clock,
  Star, Eye, EyeOff
} from "lucide-react";
import { useRealNotifications } from "@/hooks/useRealNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";

export default function NotificacoesPage() {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    unreadCount
  } = useRealNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || notification.type === filterType;
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "read" && notification.isRead) ||
                         (filterStatus === "unread" && !notification.isRead);
                         
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'event_starting': <Zap className="h-5 w-5 text-red-500" />,
      'achievement_unlocked': <Trophy className="h-5 w-5 text-yellow-500" />,
      'ranking_update': <Star className="h-5 w-5 text-blue-500" />,
      'new_event': <Calendar className="h-5 w-5 text-purple-500" />,
      'reminder': <Clock className="h-5 w-5 text-gray-500" />,
      'radcoin_reward': <Coins className="h-5 w-5 text-green-500" />,
      'streak_milestone': <Zap className="h-5 w-5 text-orange-500" />,
      'case_completed': <BookOpen className="h-5 w-5 text-blue-500" />,
      'learning_tip': <Gift className="h-5 w-5 text-pink-500" />,
      'system_maintenance': <AlertTriangle className="h-5 w-5 text-red-500" />,
      'feature_announcement': <Megaphone className="h-5 w-5 text-indigo-500" />,
      'default': <Bell className="h-5 w-5 text-gray-500" />
    };
    
    return iconMap[type as keyof typeof iconMap] || iconMap.default;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'urgent': 'border-l-red-600 bg-red-50',
      'high': 'border-l-orange-500 bg-orange-50',
      'medium': 'border-l-blue-500 bg-blue-50',
      'low': 'border-l-gray-500 bg-gray-50'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'urgent': 'destructive',
      'high': 'default',
      'medium': 'secondary',
      'low': 'outline'
    };
    return variants[priority as keyof typeof variants] || 'secondary';
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <BackToDashboard />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notificações</h1>
              <p className="text-gray-600">
                Acompanhe todas as suas notificações
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {notifications.length} Total
            </Badge>
            <Badge variant="destructive">
              {unreadCount} Não Lidas
            </Badge>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="achievement_unlocked">Conquistas</SelectItem>
                  <SelectItem value="event_starting">Eventos</SelectItem>
                  <SelectItem value="radcoin_reward">RadCoins</SelectItem>
                  <SelectItem value="streak_milestone">Streaks</SelectItem>
                  <SelectItem value="system_maintenance">Sistema</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredNotifications.length} notificação(ões) encontrada(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="ml-3">Carregando notificações...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
                <p>Tente ajustar os filtros ou aguarde novas notificações</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-4 rounded-r-lg border hover:shadow-md transition-all cursor-pointer ${
                      getPriorityColor(notification.priority)
                    } ${!notification.isRead ? 'shadow-sm' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {formatDistanceToNow(notification.timestamp, {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                              
                              <Badge 
                                variant={getPriorityBadge(notification.priority) as any}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                              
                              <span className="capitalize">
                                {notification.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {notification.isRead ? (
                              <Eye className="h-4 w-4 text-gray-400" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-blue-500" />
                            )}
                            
                            {notification.actionLabel && (
                              <Badge variant="outline" className="text-xs">
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
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
