
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, Eye, EyeOff, TrendingUp, 
  Users, MessageSquare, AlertCircle 
} from "lucide-react";

interface NotificationStatsProps {
  stats: {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

export function NotificationStats({ stats }: NotificationStatsProps) {
  const readPercentage = stats.total > 0 ? ((stats.total - stats.unread) / stats.total * 100).toFixed(1) : '0';
  
  const topTypes = Object.entries(stats.byType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const priorityStats = Object.entries(stats.byPriority)
    .sort(([,a], [,b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold text-red-600">{stats.unread.toLocaleString()}</p>
              </div>
              <EyeOff className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Leitura</p>
                <p className="text-2xl font-bold text-green-600">{readPercentage}%</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tipos Ativos</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byType).length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tipos de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tipos Mais Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTypes.length > 0 ? (
                topTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(stats.byType))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum dado disponível
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityStats.length > 0 ? (
                priorityStats.map(([priority, count]) => {
                  const priorityColors = {
                    urgent: 'bg-red-500',
                    high: 'bg-orange-500',
                    medium: 'bg-blue-500',
                    low: 'bg-gray-500'
                  };
                  
                  const badgeColors = {
                    urgent: 'destructive',
                    high: 'default',
                    medium: 'secondary',
                    low: 'outline'
                  };

                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-500'}`}></div>
                        <span className="text-sm font-medium capitalize">{priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-500'}`}
                            style={{ 
                              width: `${(count / Math.max(...Object.values(stats.byPriority))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <Badge variant={badgeColors[priority as keyof typeof badgeColors] as any}>
                          {count}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum dado disponível
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
