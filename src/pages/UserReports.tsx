
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserReports } from "@/hooks/useUserReports";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { AlertTriangle, Clock, CheckCircle, X, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UserReports() {
  const { reports, loading, refreshReports } = useUserReports();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'dismissed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Análise';
      case 'resolved': return 'Resolvido';
      case 'dismissed': return 'Arquivado';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'error': return 'Erro no caso';
      case 'content': return 'Problema de conteúdo';
      case 'technical': return 'Problema técnico';
      case 'other': return 'Outro';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <BackToDashboard />
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando seus reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackToDashboard />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Reports</h1>
              <p className="text-gray-600">Acompanhe o status dos problemas reportados</p>
            </div>
          </div>
          
          <Button onClick={refreshReports} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum report enviado</h3>
              <p className="text-gray-600">
                Quando você reportar algum problema nos casos médicos, eles aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{getStatusLabel(report.status)}</span>
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(report.report_type)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      {report.metadata?.case_title && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Caso:</strong> {report.metadata.case_title}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Descrição:</h4>
                      <p className="text-gray-700">{report.description}</p>
                    </div>
                    
                    {report.admin_response && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Resposta da equipe:</h4>
                        <p className="text-blue-800">{report.admin_response}</p>
                        {report.resolved_at && (
                          <p className="text-xs text-blue-600 mt-2">
                            Resolvido em {format(new Date(report.resolved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
