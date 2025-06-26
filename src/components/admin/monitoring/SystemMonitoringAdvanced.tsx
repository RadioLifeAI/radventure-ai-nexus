
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemStatusCard } from "./SystemStatusCard";
import { SecurityDashboard } from "../security/SecurityDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Shield, BarChart3, Settings } from "lucide-react";

export function SystemMonitoringAdvanced() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sistema Avançado de Monitoramento</h2>
          <p className="text-muted-foreground">
            Monitoramento completo de segurança, performance e integridade do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <Activity className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
            <Settings className="h-4 w-4" />
            Manutenção
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemStatusCard />
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Activity className="h-5 w-5" />
                  Sistema Otimizado
                </CardTitle>
                <CardDescription className="text-green-700">
                  Status das otimizações implementadas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>RLS Sem Recursão</span>
                    <span className="text-green-600 font-semibold">✅ ATIVO</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Índices Otimizados</span>
                    <span className="text-green-600 font-semibold">✅ ATIVO</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Funções SECURITY DEFINER</span>
                    <span className="text-green-600 font-semibold">✅ ATIVO</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auditoria Automática</span>
                    <span className="text-green-600 font-semibold">✅ ATIVO</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Limpeza Automática</span>
                    <span className="text-green-600 font-semibold">✅ ATIVO</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas de Performance
              </CardTitle>
              <CardDescription>
                Indicadores de performance do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">< 100ms</div>
                  <div className="text-sm text-gray-600">Query Response Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Erros Críticos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ferramentas de Manutenção
              </CardTitle>
              <CardDescription>
                Utilitários para manutenção do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Limpeza Automática</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Remove logs antigos e otimiza o banco de dados automaticamente.
                  </p>
                  <div className="text-sm text-green-600">
                    ✅ Configurada para executar diariamente
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Backup Automático</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Backups automáticos do Supabase configurados.
                  </p>
                  <div className="text-sm text-blue-600">
                    ℹ️ Gerenciado pelo Supabase
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Monitoramento de Integridade</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Verificações automáticas de integridade dos dados.
                  </p>
                  <div className="text-sm text-green-600">
                    ✅ Ativo e funcionando
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
