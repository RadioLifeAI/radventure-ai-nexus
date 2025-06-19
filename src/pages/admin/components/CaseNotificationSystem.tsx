
import React, { createContext, useContext, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Zap,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'ai-suggestion';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'ai-suggestion':
        return <Zap className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCardClass = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return "border-green-200 bg-green-50";
      case 'warning':
        return "border-yellow-200 bg-yellow-50";
      case 'error':
        return "border-red-200 bg-red-50";
      case 'ai-suggestion':
        return "border-purple-200 bg-purple-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card key={notification.id} className={`${getCardClass(notification.type)} animate-slide-in-right`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                {notification.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={notification.action.onClick}
                    className="text-xs"
                  >
                    {notification.action.label}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Hooks para notificações específicas
export function useAINotifications() {
  const { addNotification } = useNotifications();

  const suggestImprovement = useCallback((suggestion: string, onApply: () => void) => {
    addNotification({
      type: 'ai-suggestion',
      title: 'IA sugere melhoria',
      message: suggestion,
      action: {
        label: 'Aplicar sugestão',
        onClick: onApply
      },
      autoClose: false
    });
  }, [addNotification]);

  const reportProgress = useCallback((progress: string) => {
    addNotification({
      type: 'info',
      title: 'Progresso da IA',
      message: progress,
      duration: 3000
    });
  }, [addNotification]);

  return { suggestImprovement, reportProgress };
}
