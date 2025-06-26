
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Users, FileText, Calendar, Trash2 } from "lucide-react";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { toast } from "sonner";

export function SystemStatusCard() {
  const { status, isLoading, refetch, runCleanup } = useSystemStatus();

  const handleRefresh = () => {
    refetch();
    toast.success("Status do sistema atualizado");
  };

  const handleCleanup = async () => {
    const result = await runCleanup();
    if (result.success) {
      toast.success("Limpeza do sistema executada com sucesso");
    } else {
      toast.error(`Erro na limpeza: ${result.error}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'OPTIMAL': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-white/50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              className="bg-white/50 text-orange-600 hover:text-orange-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-blue-700">
          Monitoramento em tempo real do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {status ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Saúde do Sistema:</span>
              <Badge className={getHealthColor(status.system_health)}>
                {status.system_health}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-600">Total de Usuários</div>
                  <div className="font-bold text-lg">{status.total_users}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-600">Administradores</div>
                  <div className="font-bold text-lg">{status.total_admins}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm text-gray-600">Casos Médicos</div>
                  <div className="font-bold text-lg">{status.total_cases}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600">Eventos Ativos</div>
                  <div className="font-bold text-lg">{status.active_events}</div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última Limpeza:</span>
                <span className="font-medium">{status.last_cleanup}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Última Atualização:</span>
                <span className="font-medium">
                  {new Date(status.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Erro ao carregar status do sistema
          </div>
        )}
      </CardContent>
    </Card>
  );
}
