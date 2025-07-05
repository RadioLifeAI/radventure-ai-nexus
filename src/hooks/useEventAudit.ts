import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AuditLogEntry {
  action: string;
  eventId: string;
  eventName?: string;
  adminId?: string;
  adminName?: string;
  metadata?: any;
  timestamp: Date;
}

export function useEventAudit() {
  const { user } = useAuth();

  // Função para registrar ação de auditoria
  const logEventAction = async (
    action: string, 
    eventId: string, 
    eventName?: string, 
    metadata?: any
  ) => {
    try {
      const auditEntry: AuditLogEntry = {
        action,
        eventId,
        eventName,
        adminId: user?.id,
        adminName: user?.user_metadata?.full_name || user?.email,
        metadata,
        timestamp: new Date()
      };

      // Log no console para desenvolvimento
      console.log(`📋 AUDITORIA EVENTOS:`, {
        acao: action,
        evento: eventName || eventId,
        admin: auditEntry.adminName,
        horario: auditEntry.timestamp.toLocaleString('pt-BR'),
        detalhes: metadata
      });

      // Aqui poderia ser inserido em uma tabela de auditoria se necessário
      // Por enquanto, apenas logging em console para depuração
      
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  };

  return { logEventAction };
}