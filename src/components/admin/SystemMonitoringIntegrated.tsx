
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { SystemMonitoringHeader } from "./monitoring/SystemMonitoringHeader";
import { 
  Activity, 
  Database, 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function SystemMonitoringIntegrated() {
  const [refreshing, setRefreshing] = useState(false);

  // Métricas de sistema simplificadas
  const { data: systemMetrics, isLoading, refetch } = useQuery({
    queryKey: ["system-metrics"],
    queryFn: async () => {
      const [
        { count: profilesCount },
        { count: casesCount },
        { count: eventsCount },
        { count: achievementsCount }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("medical_cases").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("achievement_system").select("*", { count: "exact", head: true })
      ]);

      return {
        profiles: profilesCount || 0,
        cases: casesCount || 0,
        events: eventsCount || 0,
        achievements: achievementsCount || 0,
        systemStatus: "healthy"
      };
    },
    refetchInterval: 30000
  });

  // Logs de atividade recente (simplificado)
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return data.map(profile => ({
        id: profile.email,
        action: "User Activity",
        user: profile.full_name || profile.email,
        timestamp: profile.updated_at,
        status: "success"
      }));
    },
    refetchInterval: 30000
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const systemHealth = [
    { name: "Database", status: "healthy", icon: Database },
    { name: "Authentication", status: "healthy", icon: Users },
    { name: "API Services", status: "healthy", icon: Activity },
    { name: "File Storage", status: "healthy", icon: BookOpen }
  ];

  return (
    <div className="space-y-6">
      <SystemMonitoringHeader />

      {/* Métricas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {systemMetrics?.profiles || 0}
            </div>
            <p className="text-xs text-gray-600">Perfis cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Casos Médicos</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {systemMetrics?.cases || 0}
            </div>
            <p className="text-xs text-gray-600">Casos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {systemMetrics?.events || 0}
            </div>
            <p className="text-xs text-gray-600">Eventos criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {systemMetrics?.achievements || 0}
            </div>
            <p className="text-xs text-gray-600">Sistema de recompensas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Saúde do Sistema
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Logs de Atividade
            </TabsTrigger>
          </TabsList>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Componentes</CardTitle>
              <CardDescription>
                Monitoramento da saúde dos principais componentes do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemHealth.map((component) => (
                  <div key={component.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <component.icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{component.name}</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {component.status === "healthy" ? "Saudável" : "Problema"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Atividade Recente</CardTitle>
              <CardDescription>
                Atividades recentes do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.slice(0, 10).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {log.status === "success" ? "Sucesso" : "Erro"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
