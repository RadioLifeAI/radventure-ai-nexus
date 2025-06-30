
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserReportsAdmin } from "@/hooks/useUserReportsAdmin";
import { toast } from "sonner";
import { 
  Flag, 
  User, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface UserReport {
  id: string;
  user_id: string;
  case_id: string;
  report_type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  admin_response?: string;
  user_email?: string;
  user_name?: string;
  case_title?: string;
  metadata?: any;
}

interface ReportDetailsModalProps {
  report: UserReport | null;
  isOpen: boolean;
  onClose: () => void;
}

const reportTypeLabels: Record<string, string> = {
  'content_error': 'Erro de Conteúdo',
  'technical_issue': 'Problema Técnico',
  'inappropriate_content': 'Conteúdo Inadequado',
  'suggestion': 'Sugestão',
  'other': 'Outro'
};

const statusLabels: Record<string, { label: string; color: string }> = {
  'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  'in_progress': { label: 'Em Progresso', color: 'bg-blue-100 text-blue-800' },
  'resolved': { label: 'Resolvido', color: 'bg-green-100 text-green-800' },
  'dismissed': { label: 'Arquivado', color: 'bg-gray-100 text-gray-800' }
};

export function ReportDetailsModal({ report, isOpen, onClose }: ReportDetailsModalProps) {
  const [adminResponse, setAdminResponse] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateReportStatus } = useUserReportsAdmin();

  if (!report) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateReportStatus(
        report.id, 
        newStatus, 
        adminResponse.trim() || undefined
      );
      
      toast.success(`Report ${statusLabels[newStatus]?.label.toLowerCase()} com sucesso!`);
      setAdminResponse("");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar report:", error);
      toast.error("Erro ao atualizar report");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Detalhes do Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status e Tipo */}
          <div className="flex items-center gap-2">
            <Badge className={statusLabels[report.status]?.color}>
              {statusLabels[report.status]?.label || report.status}
            </Badge>
            <Badge variant="outline">
              {reportTypeLabels[report.report_type] || report.report_type}
            </Badge>
          </div>

          {/* Informações do Report */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="font-medium">{report.user_name || 'N/A'}</span>
              <span>({report.user_email})</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{report.case_title || `Case ID: ${report.case_id}`}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Enviado em {formatDate(report.created_at)}</span>
            </div>
          </div>

          <Separator />

          {/* Título e Descrição */}
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Título</h4>
              <p className="text-gray-700">{report.title}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Descrição</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
            </div>
          </div>

          {/* Resposta Admin Existente */}
          {report.admin_response && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Resposta do Admin</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {report.admin_response}
                </p>
              </div>
            </>
          )}

          {/* Nova Resposta Admin */}
          {report.status !== 'resolved' && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Resposta do Admin</h4>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Digite uma resposta para o usuário (opcional)..."
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Fechar
            </Button>

            {report.status === 'pending' && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={isUpdating}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Marcar em Progresso
              </Button>
            )}

            {report.status !== 'resolved' && (
              <Button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {isUpdating ? 'Atualizando...' : 'Marcar como Resolvido'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
