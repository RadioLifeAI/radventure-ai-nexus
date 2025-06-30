
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { createNotification } from '@/utils/notifications';

interface CreateReportData {
  caseId: string;
  caseName?: string;
  reportType: 'content_error' | 'technical_issue' | 'inappropriate_content' | 'suggestion' | 'other';
  title: string;
  description: string;
}

export function useUserReports() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReport = async (data: CreateReportData) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para enviar um report');
      return { success: false };
    }

    setIsSubmitting(true);
    
    try {
      // Criar o report
      const { data: report, error: reportError } = await supabase
        .from('user_reports')
        .insert([{
          user_id: user.id,
          case_id: data.caseId,
          report_type: data.reportType,
          title: data.title,
          description: data.description,
          status: 'pending',
          metadata: {
            case_name: data.caseName,
            user_email: user.email,
            submitted_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (reportError) throw reportError;

      // Notificação para o usuário
      await createNotification({
        userId: user.id,
        type: 'reminder',
        title: '📝 Report Enviado',
        message: `Seu report "${data.title}" foi enviado com sucesso! Nossa equipe irá analisar em breve.`,
        priority: 'medium',
        actionUrl: '/app/casos',
        actionLabel: 'Voltar aos Casos',
        metadata: {
          report_id: report.id,
          case_id: data.caseId,
          report_type: data.reportType
        }
      });

      // Notificação para admins - buscar todos os admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('type', 'ADMIN');

      if (admins && admins.length > 0) {
        // Criar notificação para cada admin
        const adminNotifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'new_event',
          title: '🚨 Novo Report Recebido',
          message: `Report: "${data.title}" - Tipo: ${getReportTypeLabel(data.reportType)}`,
          priority: 'high',
          action_url: '/admin/usuarios',
          action_label: 'Ver Reports',
          metadata: {
            report_id: report.id,
            case_id: data.caseId,
            reporter_id: user.id,
            report_type: data.reportType
          }
        }));

        await supabase
          .from('notifications')
          .insert(adminNotifications);
      }

      toast.success('Report enviado com sucesso! 📝', {
        description: 'Nossa equipe irá analisar seu feedback em breve.'
      });

      return { success: true, report };
    } catch (error) {
      console.error('Erro ao criar report:', error);
      toast.error('Erro ao enviar report', {
        description: 'Tente novamente em alguns instantes.'
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createReport,
    isSubmitting
  };
}

function getReportTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    content_error: 'Erro de Conteúdo',
    technical_issue: 'Problema Técnico',
    inappropriate_content: 'Conteúdo Inadequado',
    suggestion: 'Sugestão',
    other: 'Outro'
  };
  return labels[type] || type;
}
