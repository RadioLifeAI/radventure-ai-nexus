
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Flag, FileText, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface UserReport {
  id: string;
  case_id: string;
  report_type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  admin_response?: string;
  case_title?: string;
  metadata?: any;
}

interface UserReportsModalProps {
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

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'pending': { 
    label: 'Pendente', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-4 w-4" />
  },
  'in_progress': { 
    label: 'Em Análise', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  'resolved': { 
    label: 'Resolvido', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="h-4 w-4" />
  },
  'dismissed': { 
    label: 'Arquivado', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <FileText className="h-4 w-4" />
  }
};

export function UserReportsModal({ report, isOpen, onClose }: UserReportsModalProps) {
  if (!report) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const statusInfo = statusLabels[report.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-blue-600" />
            Meu Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status e Tipo */}
          <div className="flex items-center gap-3">
            <Badge className={`flex items-center gap-1 ${statusInfo?.color}`}>
              {statusInfo?.icon}
              {statusInfo?.label || report.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {reportTypeLabels[report.report_type] || report.report_type}
            </Badge>
          </div>

          {/* Informações do Report */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span><strong>Caso:</strong> {report.case_title || `ID: ${report.case_id}`}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span><strong>Enviado em:</strong> {formatDate(report.created_at)}</span>
            </div>
          </div>

          <Separator />

          {/* Título e Descrição */}
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Título</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{report.title}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Descrição</h4>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {report.description}
              </p>
            </div>
          </div>

          {/* Resposta do Admin */}
          {report.admin_response && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Resposta da Equipe
                </h4>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {report.admin_response}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Mensagem de Status */}
          {report.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Status:</strong> Seu report está na fila para análise. Nossa equipe irá analisá-lo em breve.
              </p>
            </div>
          )}

          {report.status === 'in_progress' && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Status:</strong> Seu report está sendo analisado por nossa equipe.
              </p>
            </div>
          )}

          {report.status === 'resolved' && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Status:</strong> Seu report foi resolvido! Verifique a resposta da equipe acima.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
