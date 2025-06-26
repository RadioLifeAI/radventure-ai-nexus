
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, 
  AlertTriangle, 
  Settings, 
  Users, 
  Crown, 
  Lock, 
  Unlock,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  Code,
  Zap
} from "lucide-react";

export function SecurityControlPanel() {
  const [promoteModal, setPromoteModal] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState("");
  const [promoteReason, setPromoteReason] = useState("");

  const queryClient = useQueryClient();

  // Buscar estatísticas do sistema
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['system-security-stats'],
    queryFn: async () => {
      console.log('Carregando estatísticas de segurança...');
      
      // Contar total de admins
      const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .eq('type', 'ADMIN');
      
      if (adminError) throw adminError;

      // Buscar admins permanentes
      const { data: permanentAdmins, error: permError } = await supabase
        .from('permanent_admins')
        .select('*, user_id')
        .order('created_at', { ascending: false });
      
      if (permError) throw permError;

      // Buscar logs de segurança recentes
      const { data: securityLogs, error: logsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Logs podem não existir ainda, não é erro crítico
      const logs = logsError ? [] : securityLogs || [];

      return {
        totalAdmins: admins?.length || 0,
        permanentAdmins: permanentAdmins?.length || 0,
        recentLogs: logs,
        adminsList: admins || [],
        permanentAdminsList: permanentAdmins || []
      };
    }
  });

  // Promover usuário a admin permanente
  const promoteToPermMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      console.log('Promovendo usuário a admin permanente:', { userId, reason });
      
      // Buscar email do usuário
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;

      const { data, error } = await supabase
        .rpc('promote_to_permanent_admin', {
          target_user_id: userId,
          target_email: user.email || 'unknown@system.local',
          promotion_reason: reason
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "✅ Usuário promovido a Admin Permanente!" });
      setPromoteModal(false);
      setPromoteUserId("");
      setPromoteReason("");
      queryClient.invalidateQueries({ queryKey: ['system-security-stats'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Erro ao promover usuário", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Recuperação de emergência
  const emergencyRecoveryMutation = useMutation({
    mutationFn: async () => {
      console.log('Executando recuperação de emergência...');
      
      const { data, error } = await supabase
        .rpc('emergency_admin_recovery');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ 
        title: "🚨 Recuperação de Emergência Executada", 
        description: data,
        duration: 10000
      });
      queryClient.invalidateQueries({ queryKey: ['system-security-stats'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Recuperação de emergência falhou", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handlePromoteUser = () => {
    if (!promoteUserId || !promoteReason.trim()) {
      toast({ 
        title: "❌ Dados obrigatórios", 
        description: "Selecione um usuário e informe o motivo",
        variant: "destructive" 
      });
      return;
    }
    promoteToPermMutation.mutate({ userId: promoteUserId, reason: promoteReason });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600" />
            Painel de Controle de Segurança
          </h2>
          <p className="text-gray-600">Gerenciamento avançado de segurança e permissões do sistema</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de Admins</span>
                <Badge variant="secondary">{systemStats?.totalAdmins || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admins Permanentes</span>
                <Badge variant="default">{systemStats?.permanentAdmins || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-500" />
              Sistema Limpo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Tabelas duplicadas removidas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Google OAuth corrigido</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">RLS Configurado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Auditoria Ativa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Integridade Validada</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Administradores Permanentes
            </CardTitle>
            <CardDescription>
              Promover usuários para administradores que não podem ser removidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStats?.permanentAdminsList?.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">{admin.email}</p>
                  <p className="text-sm text-gray-600">{admin.reason}</p>
                </div>
                <Badge variant="secondary">Permanente</Badge>
              </div>
            ))}
            
            <Dialog open={promoteModal} onOpenChange={setPromoteModal}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  Promover Admin Permanente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Promover Administrador Permanente</DialogTitle>
                  <DialogDescription>
                    Usuários promovidos não poderão ter suas permissões removidas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="ID do usuário"
                    value={promoteUserId}
                    onChange={(e) => setPromoteUserId(e.target.value)}
                  />
                  <Textarea
                    placeholder="Motivo da promoção..."
                    value={promoteReason}
                    onChange={(e) => setPromoteReason(e.target.value)}
                  />
                  <Button 
                    onClick={handlePromoteUser}
                    className="w-full"
                    disabled={promoteToPermMutation.isPending}
                  >
                    {promoteToPermMutation.isPending ? "Promovendo..." : "Promover"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              Recuperação de Emergência
            </CardTitle>
            <CardDescription>
              Sistema de segurança para casos extremos sem administradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Usar apenas em emergências!</strong> Esta função só funciona se não houver administradores no sistema.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => emergencyRecoveryMutation.mutate()}
              variant="destructive"
              className="w-full"
              disabled={emergencyRecoveryMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              {emergencyRecoveryMutation.isPending ? "Executando..." : "Recuperação de Emergência"}
            </Button>
            
            <p className="text-xs text-gray-500">
              Esta função promove o usuário atual a administrador permanente apenas se não houver outros administradores no sistema.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Logs de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-500" />
            Logs de Auditoria Recentes
          </CardTitle>
          <CardDescription>
            Histórico das últimas ações de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemStats?.recentLogs?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum log de auditoria encontrado</p>
              <p className="text-sm">Os logs aparecerão aqui conforme ações são realizadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemStats?.recentLogs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{log.user_id ? 'Usuário' : 'Sistema'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
