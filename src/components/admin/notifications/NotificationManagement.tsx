
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, Users, TrendingUp, Settings, 
  Send, Trash2, Filter, BarChart3 
} from "lucide-react";
import { useNotificationAdmin } from "@/hooks/useNotificationAdmin";
import { NotificationForm } from "./NotificationForm";
import { NotificationsList } from "./NotificationsList";
import { NotificationStats } from "./NotificationStats";
import { NotificationFilters } from "./NotificationFilters";

export function NotificationManagement() {
  const {
    notifications,
    loading,
    stats,
    fetchAllNotifications,
    createSingleNotification,
    createBulkNotification,
    createFilteredNotification,
    deleteNotification,
    cleanupOldNotifications
  } = useNotificationAdmin();

  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    fetchAllNotifications(newFilters);
  };

  const handleCleanup = async () => {
    if (confirm('Remover notificações antigas (>90 dias)?')) {
      await cleanupOldNotifications();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Notificações</h1>
            <p className="text-gray-600">
              Sistema completo de notificações da plataforma
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {stats.total} Total
          </Badge>
          <Badge variant="destructive">
            {stats.unread} Não Lidas
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanup}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpeza
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Criar
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <NotificationStats stats={stats} />
        </TabsContent>

        <TabsContent value="create">
          <NotificationForm
            onCreateSingle={createSingleNotification}
            onCreateBulk={createBulkNotification}
            onCreateFiltered={createFilteredNotification}
          />
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            <NotificationFilters 
              onFiltersChange={handleFiltersChange}
              currentFilters={filters}
            />
            <NotificationsList
              notifications={notifications}
              loading={loading}
              onDelete={deleteNotification}
              onRefresh={fetchAllNotifications}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Por Tipo</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm">{type}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Por Prioridade</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{priority}</span>
                        <Badge 
                          variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
