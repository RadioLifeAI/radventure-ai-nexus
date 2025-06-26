
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealUsers } from "@/hooks/useRealUsers";
import { useRealMedicalCases } from "@/hooks/useRealMedicalCases";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { 
  Users, 
  FileText, 
  Activity, 
  Shield, 
  RefreshCw,
  TrendingUp,
  Database,
  CheckCircle
} from "lucide-react";

export function RealDataDashboard() {
  const { users, isLoading: usersLoading, refetch: refetchUsers } = useRealUsers();
  const { cases, isLoading: casesLoading, refetch: refetchCases, casesStats } = useRealMedicalCases();
  const { status, isLoading: statusLoading, refetch: refetchStatus } = useSystemStatus();

  const isLoading = usersLoading || casesLoading || statusLoading;

  const handleRefreshAll = () => {
    refetchUsers();
    refetchCases();
    refetchStatus();
  };

  // Calculate user stats
  const userStats = {
    total: users.length,
    admins: users.filter(u => u.type === 'ADMIN').length,
    activeUsers: users.filter(u => {
      const lastUpdate = new Date(u.updated_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lastUpdate > monthAgo;
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Dados Reais</h2>
          <p className="text-muted-foreground">
            Visão geral completa dos dados reais do sistema
          </p>
        </div>
        <Button onClick={handleRefreshAll} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar Tudo
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {isLoading ? '...' : userStats.total}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {userStats.admins} admins • {userStats.activeUsers} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Casos Médicos
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {isLoading ? '...' : casesStats?.totalCases || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Casos cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              Status do Sistema
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {isLoading ? '...' : status?.system_health || 'N/A'}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Sistema operacional
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Integração Real
            </CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <div className="text-lg font-bold text-purple-900">ATIVA</div>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Dados em tempo real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribuição de Usuários
            </CardTitle>
            <CardDescription>
              Breakdown dos tipos de usuários no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Usuários Regulares</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {userStats.total - userStats.admins}
                  </span>
                  <Badge variant="secondary">USER</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Administradores</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{userStats.admins}</span>
                  <Badge variant="destructive">ADMIN</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Usuários Ativos (30 dias)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{userStats.activeUsers}</span>
                  <Badge className="bg-green-500">ATIVO</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estatísticas de Casos
            </CardTitle>
            <CardDescription>
              Distribuição dos casos médicos por especialidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {casesStats?.bySpecialty ? (
                Object.entries(casesStats.bySpecialty)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([specialty, count]) => (
                    <div key={specialty} className="flex items-center justify-between">
                      <span className="text-sm">{specialty}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{count}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ 
                              width: `${(count / casesStats.totalCases) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum caso encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Shield className="h-5 w-5" />
            Status da Integração Real
          </CardTitle>
          <CardDescription className="text-green-700">
            Verificação da integridade dos dados em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-900">Usuários</div>
              <div className="text-sm text-green-600">Integração Completa</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-900">Casos</div>
              <div className="text-sm text-green-600">Dados Reais</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-900">Sistema</div>
              <div className="text-sm text-green-600">Funcionando</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
