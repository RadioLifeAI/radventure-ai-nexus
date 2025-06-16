
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { History, User, Calendar, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLogEntry {
  id: string;
  target_user_id: string;
  admin_role: string;
  action: string;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
  target_user?: {
    full_name: string | null;
    email: string | null;
  };
  changed_by_user?: {
    full_name: string | null;
    email: string | null;
  };
}

export function AdminRoleAuditLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Buscar logs de auditoria
      const { data: logs, error: logsError } = await supabase
        .from("admin_role_changes_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Buscar informações dos usuários mencionados nos logs
      const userIds = new Set<string>();
      logs?.forEach(log => {
        userIds.add(log.target_user_id);
        if (log.changed_by) userIds.add(log.changed_by);
      });

      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", Array.from(userIds));

      if (usersError) throw usersError;

      // Combinar dados
      const enrichedLogs = logs?.map(log => ({
        ...log,
        target_user: users?.find(u => u.id === log.target_user_id),
        changed_by_user: log.changed_by ? users?.find(u => u.id === log.changed_by) : null
      })) || [];

      setAuditLogs(enrichedLogs);
    } catch (error: any) {
      console.error("Erro ao carregar logs de auditoria:", error);
      toast.error(`Erro ao carregar histórico: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "GRANTED":
        return "default";
      case "REVOKED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "GRANTED":
        return "Concedido";
      case "REVOKED":
        return "Revogado";
      default:
        return action;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-500" />
          Log de Auditoria - Mudanças de Roles
        </CardTitle>
        <CardDescription>
          Histórico de todas as mudanças de roles administrativos no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma mudança de role registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <Card key={log.id} className="border-l-4 border-l-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {log.target_user?.full_name || log.target_user?.email || "Usuário não encontrado"}
                        </span>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionText(log.action)}
                        </Badge>
                        <Badge variant="outline">{log.admin_role}</Badge>
                      </div>
                      
                      {log.changed_by_user && (
                        <div className="text-sm text-gray-600">
                          Por: {log.changed_by_user.full_name || log.changed_by_user.email}
                        </div>
                      )}
                      
                      {log.reason && (
                        <div className="text-sm text-gray-600">
                          Motivo: {log.reason}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(log.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
